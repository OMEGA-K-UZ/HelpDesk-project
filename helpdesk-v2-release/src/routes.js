const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const { query, getSetting, setSetting, getAllSettings, getSettings } = require('./db');
const { requireAuth, requireRole, generateTicketNumber, logHistory, calcSLADue, createNotification, notifyAllAgents } = require('./helpers');
const { sendTicketCreatedReply, sendTicketReply, sendTicketResolved, sendTestEmail, forwardTicket, pollInbox } = require('./email');
const { sendNotification, sendTestMessage, reinitBot } = require('./telegram');
const { runAutomation, checkEscalations } = require('./automation');

const router = express.Router();

const uploadDir = path.resolve(process.env.UPLOAD_DIR || './data/uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-z0-9._-]/gi,'_')}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ── AUTH ────────────────────────────────────────────────────
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const r = await query('SELECT * FROM users WHERE email=$1 AND is_active=true', [email?.toLowerCase()]);
  if (!r.rows[0]) return res.status(401).json({ error: 'Неверный email или пароль' });
  const ok = await bcrypt.compare(password, r.rows[0].password_hash);
  if (!ok) return res.status(401).json({ error: 'Неверный email или пароль' });
  await query('UPDATE users SET last_login=NOW() WHERE id=$1', [r.rows[0].id]);
  req.session.user = { id: r.rows[0].id, name: r.rows[0].name, email: r.rows[0].email, role: r.rows[0].role };
  try { require('./bots').emitEvent('login', `🔐 <b>Вход в систему</b>\n${r.rows[0].name} (${r.rows[0].email})\n${new Date().toLocaleString('ru-RU')}`); } catch(e){}
  res.json({ success: true, user: req.session.user });
});
router.post('/auth/logout', (req, res) => { req.session.destroy(); res.json({ success: true }); });
router.get('/auth/me', requireAuth, (req, res) => res.json(req.session.user));

// ── DASHBOARD ────────────────────────────────────────────────
router.get('/dashboard', requireAuth, async (req, res) => {
  const { from, to } = req.query;
  const dateFrom = from ? new Date(from) : new Date(new Date().setDate(1));
  const dateTo = to ? new Date(to + 'T23:59:59') : new Date();

  const [stats, byStatus, byPriority, recent, slaBreached, agentStats, dailyChart, invStats] = await Promise.all([
    query(`SELECT
      COUNT(*) as total,
      COUNT(*) FILTER(WHERE status='open') as open,
      COUNT(*) FILTER(WHERE status='in_progress') as in_progress,
      COUNT(*) FILTER(WHERE status='waiting') as waiting,
      COUNT(*) FILTER(WHERE status='resolved') as resolved,
      COUNT(*) FILTER(WHERE status='closed') as closed,
      COUNT(*) FILTER(WHERE status='planned') as planned,
      COUNT(*) FILTER(WHERE sla_breached=true AND status NOT IN ('resolved','closed')) as sla_breached,
      COUNT(*) FILTER(WHERE created_at>=$1 AND created_at<=$2) as period_total,
      COUNT(*) FILTER(WHERE created_at>=$1 AND created_at<=$2 AND status IN ('resolved','closed')) as period_resolved,
      ROUND(AVG(EXTRACT(EPOCH FROM (first_response_at-created_at))/3600) FILTER(WHERE first_response_at IS NOT NULL AND created_at>=$1 AND created_at<=$2),1) as avg_response,
      ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at-created_at))/3600) FILTER(WHERE resolved_at IS NOT NULL AND created_at>=$1 AND created_at<=$2),1) as avg_resolve
    FROM tickets`, [dateFrom, dateTo]),
    query(`SELECT status, COUNT(*) as count FROM tickets GROUP BY status`),
    query(`SELECT priority, COUNT(*) as count FROM tickets WHERE status NOT IN ('resolved','closed') GROUP BY priority`),
    query(`SELECT t.*,u.name as agent_name FROM tickets t LEFT JOIN users u ON u.id=t.assigned_to ORDER BY t.created_at DESC LIMIT 8`),
    query(`SELECT id,number,subject,requester_name,sla_due_at,priority FROM tickets WHERE sla_breached=true AND status NOT IN ('resolved','closed') ORDER BY sla_due_at ASC LIMIT 5`),
    query(`SELECT u.id,u.name,
      COUNT(t.id) as total,
      COUNT(t.id) FILTER(WHERE t.status IN ('resolved','closed')) as resolved,
      ROUND(AVG(EXTRACT(EPOCH FROM (t.resolved_at-t.created_at))/3600) FILTER(WHERE t.resolved_at IS NOT NULL),1) as avg_hours,
      COUNT(t.id) FILTER(WHERE t.sla_breached=false AND t.status IN ('resolved','closed')) as sla_ok
    FROM users u LEFT JOIN tickets t ON t.assigned_to=u.id AND t.created_at>=$1 AND t.created_at<=$2
    WHERE u.role IN ('admin','agent') AND u.is_active=true
    GROUP BY u.id,u.name ORDER BY resolved DESC LIMIT 8`, [dateFrom, dateTo]),
    query(`SELECT DATE(created_at) as day, COUNT(*) as count, COUNT(*) FILTER(WHERE status IN ('resolved','closed')) as resolved
      FROM tickets WHERE created_at>=$1 AND created_at<=$2 GROUP BY DATE(created_at) ORDER BY day`, [dateFrom, dateTo]),
    query(`SELECT ic.name, ic.icon, ic.color,
      COUNT(ii.id) as total,
      COUNT(ii.id) FILTER(WHERE ii.status='available') as available,
      COUNT(ii.id) FILTER(WHERE ii.status='assigned') as assigned,
      COUNT(ii.id) FILTER(WHERE ii.status='maintenance') as maintenance,
      COUNT(ii.id) FILTER(WHERE ii.status='retired') as retired
    FROM inventory_categories ic LEFT JOIN inventory_items ii ON ii.category_id=ic.id
    GROUP BY ic.id,ic.name,ic.icon,ic.color ORDER BY total DESC`)
  ]);

  res.json({
    stats: stats.rows[0],
    byStatus: byStatus.rows,
    byPriority: byPriority.rows,
    recent: recent.rows,
    slaBreached: slaBreached.rows,
    agentStats: agentStats.rows,
    dailyChart: dailyChart.rows,
    invStats: invStats.rows,
    period: { from: dateFrom, to: dateTo }
  });
});

// ── TICKETS ──────────────────────────────────────────────────
router.get('/tickets', requireAuth, async (req, res) => {
  const { page=1, limit=25, status, priority, assigned, search, category, department, sort='created_at', order='desc', from, to } = req.query;
  const offset = (parseInt(page)-1)*parseInt(limit);
  const conds = []; const params = [];
  const add = v => { params.push(v); return `$${params.length}`; };

  if (status === 'deleted') {
    conds.push(`t.is_deleted=true`);
  } else {
    conds.push(`t.is_deleted=false`);
    if (status && status!=='all') conds.push(`t.status=${add(status)}`);
  }
  if (priority) conds.push(`t.priority=${add(priority)}`);
  if (assigned==='me') conds.push(`t.assigned_to=${add(req.session.user.id)}`);
  else if (assigned && assigned!=='all') conds.push(`t.assigned_to=${add(parseInt(assigned))}`);
  if (category) conds.push(`t.category_id=${add(parseInt(category))}`);
  if (department) conds.push(`t.department_id=${add(parseInt(department))}`);
  if (from) conds.push(`t.created_at>=${add(new Date(from))}`);
  if (to) conds.push(`t.created_at<=${add(new Date(to+'T23:59:59'))}`);
  if (search) { const s = add(`%${search}%`); conds.push(`(t.subject ILIKE ${s} OR t.requester_email ILIKE ${s} OR t.number ILIKE ${s} OR t.requester_name ILIKE ${s})`); }

  const where = conds.join(' AND ');
  const sorts = { created_at:'t.created_at',updated_at:'t.updated_at',priority:'t.priority',sla_due_at:'t.sla_due_at',number:'t.number' };
  const sortCol = sorts[sort]||'t.created_at';
  const sortDir = order==='asc'?'ASC':'DESC';

  const countParams = [...params];
  params.push(parseInt(limit), offset);

  const [tickets, total] = await Promise.all([
    query(`SELECT t.*,u.name as agent_name,c.name as category_name,d.name as dept_name,
      (SELECT COUNT(*) FROM ticket_comments WHERE ticket_id=t.id AND is_internal=false) as reply_count
      FROM tickets t LEFT JOIN users u ON u.id=t.assigned_to LEFT JOIN categories c ON c.id=t.category_id LEFT JOIN departments d ON d.id=t.department_id
      WHERE ${where} ORDER BY ${sortCol} ${sortDir} LIMIT $${params.length-1} OFFSET $${params.length}`, params),
    query(`SELECT COUNT(*) FROM tickets t WHERE ${where}`, countParams)
  ]);
  res.json({ tickets: tickets.rows, total: parseInt(total.rows[0].count), page: parseInt(page), pages: Math.ceil(total.rows[0].count/parseInt(limit)) });
});

router.get('/tickets/:id', requireAuth, async (req, res) => {
  const [ticket, comments, history, agents, categories, departments] = await Promise.all([
    query(`SELECT t.*,u.name as agent_name,u.email as agent_email,c.name as category_name,d.name as dept_name
      FROM tickets t LEFT JOIN users u ON u.id=t.assigned_to LEFT JOIN categories c ON c.id=t.category_id LEFT JOIN departments d ON d.id=t.department_id
      WHERE t.id=$1`, [req.params.id]),
    query(`SELECT tc.*,u.name as user_name FROM ticket_comments tc LEFT JOIN users u ON u.id=tc.author_id WHERE tc.ticket_id=$1 ORDER BY tc.created_at ASC`, [req.params.id]),
    query(`SELECT th.*,u.name as user_name FROM ticket_history th LEFT JOIN users u ON u.id=th.user_id WHERE th.ticket_id=$1 ORDER BY th.created_at DESC LIMIT 50`, [req.params.id]),
    query(`SELECT id,name FROM users WHERE is_active=true AND role IN ('admin','agent') ORDER BY name`),
    query('SELECT * FROM categories ORDER BY name'),
    query('SELECT * FROM departments ORDER BY name')
  ]);
  if (!ticket.rows[0]) return res.status(404).json({ error: 'Not found' });
  // Clear new-reply mark when the assigned agent (or admin) opens it
  if (ticket.rows[0].has_new_reply) {
    await query('UPDATE tickets SET has_new_reply=false WHERE id=$1', [req.params.id]);
    ticket.rows[0].has_new_reply = false;
  }
  res.json({ ticket: ticket.rows[0], comments: comments.rows, history: history.rows, agents: agents.rows, categories: categories.rows, departments: departments.rows });
});

router.post('/tickets', requireAuth, upload.array('attachments',5), async (req, res) => {
  const { subject, description, priority='medium', source='web', requester_name, requester_email, requester_phone, category_id, department_id, assigned_to, planned_at } = req.body;
  if (!subject) return res.status(400).json({ error: 'Subject required' });
  const number = await generateTicketNumber();
  const slaDue = await calcSLADue(priority);
  const attachments = (req.files||[]).map(f=>({ name:f.originalname, path:f.filename, size:f.size }));
  const r = await query(
    `INSERT INTO tickets(number,subject,description,priority,source,requester_name,requester_email,requester_phone,category_id,department_id,assigned_to,sla_due_at,planned_at,metadata)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
    [number,subject,description,priority,source,requester_name,requester_email,requester_phone,
     category_id||null,department_id||null,assigned_to||null,slaDue,planned_at||null,
     JSON.stringify(attachments.length?{attachments}:{})]
  );
  const ticket = r.rows[0];
  await logHistory(ticket.id, req.session.user.id, 'created', null, `Агент: ${req.session.user.name}`);
  await runAutomation('ticket_created', ticket).catch(()=>{});
  if (requester_email) await sendTicketCreatedReply(ticket).catch(()=>{});
  await sendNotification('new_ticket', ticket).catch(()=>{});
  await notifyAllAgents('new_ticket', `Новый тикет #${number}`, subject, `/tickets/${ticket.id}`, req.session.user.id);
  res.json({ success: true, ticket });
});

router.patch('/tickets/:id', requireAuth, async (req, res) => {
  const { status, priority, assigned_to, category_id, department_id, tags, subject, description, planned_at, resolution } = req.body;
  const old = await query('SELECT * FROM tickets WHERE id=$1', [req.params.id]);
  if (!old.rows[0]) return res.status(404).json({ error: 'Not found' });
  const t = old.rows[0];
  const updates = []; const params = [];
  const add = (col,val) => { params.push(val); updates.push(`${col}=$${params.length}`); };

  if (subject!==undefined) add('subject',subject);
  if (description!==undefined) add('description',description);
  if (planned_at!==undefined) add('planned_at',planned_at||null);
  if (tags!==undefined) add('tags',tags);
  if (priority!==undefined && priority!==t.priority) {
    add('priority',priority);
    const slaDue = await calcSLADue(priority);
    add('sla_due_at',slaDue);
    await logHistory(t.id,req.session.user.id,'priority_changed',t.priority,priority);
  }
  if (category_id!==undefined) add('category_id',category_id||null);
  if (department_id!==undefined) add('department_id',department_id||null);
  if (assigned_to!==undefined) {
    add('assigned_to',assigned_to||null);
    await logHistory(t.id,req.session.user.id,'assigned',t.assigned_to,assigned_to);
    if (assigned_to) {
      const agent = await query('SELECT * FROM users WHERE id=$1',[assigned_to]);
      if (agent.rows[0]) {
        await sendNotification('assigned',{...t,agent_name:agent.rows[0].name,agent_telegram_id:agent.rows[0].telegram_id});
      }
    }
  }
  if (status!==undefined && status!==t.status) {
    add('status',status);
    await logHistory(t.id,req.session.user.id,'status_changed',t.status,status);
    await sendNotification('status_change',{...t,old_status:t.status,new_status:status});
    if (status==='resolved') {
      add('resolved_at',new Date());
      await sendTicketResolved(t,resolution).catch(()=>{});
    }
    if (status==='closed') add('closed_at',new Date());
  }
  if (!updates.length) return res.json({ success: true });
  updates.push('updated_at=NOW()');
  params.push(req.params.id);
  await query(`UPDATE tickets SET ${updates.join(',')} WHERE id=$${params.length}`, params);
  const updated = await query('SELECT * FROM tickets WHERE id=$1',[req.params.id]);
  res.json({ success: true, ticket: updated.rows[0] });
});

router.delete('/tickets/:id', requireAuth, async (req,res) => {
  if (req.session.user.role === 'viewer') return res.status(403).json({ error: 'Forbidden' });
  await query(`UPDATE tickets SET is_deleted=true, deleted_at=NOW(), updated_at=NOW() WHERE id=$1`,[req.params.id]);
  await logHistory(req.params.id, req.session.user.id, 'deleted', null, 'В корзину');
  res.json({ success: true });
});

router.post('/tickets/:id/restore', requireAuth, async (req,res) => {
  if (req.session.user.role === 'viewer') return res.status(403).json({ error: 'Forbidden' });
  await query(`UPDATE tickets SET is_deleted=false, deleted_at=NULL, updated_at=NOW() WHERE id=$1`,[req.params.id]);
  await logHistory(req.params.id, req.session.user.id, 'restored', null, 'Восстановлен');
  res.json({ success: true });
});

router.delete('/tickets/:id/permanent', requireRole('admin'), async (req,res) => {
  await query('DELETE FROM tickets WHERE id=$1',[req.params.id]);
  res.json({ success: true });
});

router.post('/tickets/bulk', requireAuth, async (req,res) => {
  if (req.session.user.role === 'viewer') return res.status(403).json({ error: 'Forbidden' });
  const { ids, action, value } = req.body;
  if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'No tickets selected' });
  const intIds = ids.map(i => parseInt(i)).filter(Boolean);
  if (!intIds.length) return res.status(400).json({ error: 'Invalid ids' });

  if (action === 'delete') {
    await query(`UPDATE tickets SET is_deleted=true, deleted_at=NOW(), updated_at=NOW() WHERE id=ANY($1)`,[intIds]);
  } else if (action === 'restore') {
    await query(`UPDATE tickets SET is_deleted=false, deleted_at=NULL, updated_at=NOW() WHERE id=ANY($1)`,[intIds]);
  } else if (action === 'permanent_delete') {
    if (req.session.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    await query(`DELETE FROM tickets WHERE id=ANY($1)`,[intIds]);
  } else if (action === 'status') {
    const valid = ['open','in_progress','waiting','resolved','closed','planned'];
    if (!valid.includes(value)) return res.status(400).json({ error: 'Invalid status' });
    const extra = value==='resolved' ? ', resolved_at=NOW()' : value==='closed' ? ', closed_at=NOW()' : '';
    await query(`UPDATE tickets SET status=$1${extra}, updated_at=NOW() WHERE id=ANY($2)`,[value, intIds]);
  } else if (action === 'priority') {
    const valid = ['low','medium','high','critical'];
    if (!valid.includes(value)) return res.status(400).json({ error: 'Invalid priority' });
    await query(`UPDATE tickets SET priority=$1, updated_at=NOW() WHERE id=ANY($2)`,[value, intIds]);
  } else if (action === 'assign') {
    await query(`UPDATE tickets SET assigned_to=$1, updated_at=NOW() WHERE id=ANY($2)`,[value||null, intIds]);
  } else {
    return res.status(400).json({ error: 'Unknown action' });
  }
  res.json({ success: true, count: intIds.length });
});

router.post('/tickets/:id/comments', requireAuth, upload.array('attachments',5), async (req,res) => {
  const { body, is_internal, cc } = req.body;
  if (!body?.trim()) return res.status(400).json({ error: 'Body required' });
  const ticket = await query('SELECT * FROM tickets WHERE id=$1',[req.params.id]);
  if (!ticket.rows[0]) return res.status(404).json({ error: 'Not found' });
  const t = ticket.rows[0];
  const internal = is_internal==='true'||is_internal===true;
  const attachments = (req.files||[]).map(f=>({name:f.originalname,path:f.filename,size:f.size}));
  const r = await query(
    `INSERT INTO ticket_comments(ticket_id,author_id,author_name,author_email,body,is_internal,attachments) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [t.id,req.session.user.id,req.session.user.name,req.session.user.email,body,internal,JSON.stringify(attachments)]
  );
  if (!t.first_response_at&&!internal) await query('UPDATE tickets SET first_response_at=NOW(),updated_at=NOW() WHERE id=$1',[t.id]);
  else await query('UPDATE tickets SET updated_at=NOW() WHERE id=$1',[t.id]);
  if (t.status==='open'&&!internal) {
    await query(`UPDATE tickets SET status='in_progress' WHERE id=$1`,[t.id]);
    await logHistory(t.id,req.session.user.id,'status_changed','open','in_progress');
  }
  let emailSent = null;
  if (!internal&&t.requester_email) {
    const lastInbound = await query(
      `SELECT email_message_id FROM ticket_comments WHERE ticket_id=$1 AND is_email=true AND email_message_id IS NOT NULL AND (author_email=$2 OR is_internal=false) ORDER BY created_at DESC LIMIT 1`,
      [t.id, t.requester_email]
    );
    const allIds = await query(
      `SELECT email_message_id FROM ticket_comments WHERE ticket_id=$1 AND email_message_id IS NOT NULL ORDER BY created_at ASC`,
      [t.id]
    );
    const refsChain = allIds.rows.map(x=>x.email_message_id).filter(Boolean);
    if (t.email_message_id) refsChain.unshift(t.email_message_id);
    const inReplyTo = lastInbound.rows[0]?.email_message_id || t.email_message_id || null;
    const threading = inReplyTo ? { inReplyTo, references: refsChain.join(' ') } : null;
    const ccList = cc ? (Array.isArray(cc)?cc:String(cc).split(',').map(x=>x.trim()).filter(Boolean)) : [];
    console.log(`✉️  Отправка ответа агента по тикету ${t.number} → ${t.requester_email}${ccList.length?` +CC: ${ccList.join(', ')}`:''}${inReplyTo?` (тред: ${inReplyTo})`:' (без треда)'}`);
    const sentId = await sendTicketReply(t, body, req.session.user.name, threading, ccList).catch(e=>{ console.error('❌ Ошибка отправки ответа агента:', e.message); return null; });
    if (sentId) {
      emailSent = true;
      await query(`UPDATE ticket_comments SET email_message_id=$1, is_email=true WHERE id=$2`, [sentId, r.rows[0].id]);
      console.log(`✅ Ответ агента отправлен (msg-id: ${sentId})`);
    } else {
      emailSent = false;
      console.error(`❌ Письмо агента НЕ отправлено по тикету ${t.number}`);
    }
  }
  await logHistory(t.id,req.session.user.id,internal?'internal_note':'comment_added',null,null);
  res.json({ success:true, comment:r.rows[0], email_sent: emailSent });
});

// ── ANALYTICS ────────────────────────────────────────────────
router.get('/analytics', requireAuth, async (req,res) => {
  const { from, to } = req.query;
  const df = from ? new Date(from) : new Date(new Date().setDate(1));
  const dt = to ? new Date(to+'T23:59:59') : new Date();

  const [summary, byAgent, byCategory, bySource, dailyLoad, hourlyLoad, topRequesters] = await Promise.all([
    query(`SELECT
      COUNT(*) as total,
      COUNT(*) FILTER(WHERE status IN ('resolved','closed')) as resolved,
      COUNT(*) FILTER(WHERE sla_breached=true) as sla_breached,
      COUNT(*) FILTER(WHERE priority='critical') as critical,
      ROUND(AVG(EXTRACT(EPOCH FROM (first_response_at-created_at))/3600) FILTER(WHERE first_response_at IS NOT NULL),2) as avg_first_response,
      ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at-created_at))/3600) FILTER(WHERE resolved_at IS NOT NULL),2) as avg_resolution
    FROM tickets WHERE created_at>=$1 AND created_at<=$2`,[df,dt]),
    query(`SELECT u.name,u.id,
      COUNT(t.id) as total,
      COUNT(t.id) FILTER(WHERE t.status IN ('resolved','closed')) as resolved,
      COUNT(t.id) FILTER(WHERE t.sla_breached=false AND t.status IN ('resolved','closed')) as sla_ok,
      ROUND(AVG(EXTRACT(EPOCH FROM (t.resolved_at-t.created_at))/3600) FILTER(WHERE t.resolved_at IS NOT NULL),1) as avg_hours
    FROM users u LEFT JOIN tickets t ON t.assigned_to=u.id AND t.created_at>=$1 AND t.created_at<=$2
    WHERE u.role IN ('admin','agent') AND u.is_active=true GROUP BY u.id,u.name ORDER BY resolved DESC`,[df,dt]),
    query(`SELECT c.name,c.color,c.icon,COUNT(t.id) as count FROM categories c LEFT JOIN tickets t ON t.category_id=c.id AND t.created_at>=$1 AND t.created_at<=$2 GROUP BY c.id,c.name,c.color,c.icon ORDER BY count DESC`,[df,dt]),
    query(`SELECT source,COUNT(*) as count FROM tickets WHERE created_at>=$1 AND created_at<=$2 GROUP BY source ORDER BY count DESC`,[df,dt]),
    query(`SELECT DATE(created_at) as day,COUNT(*) as created,COUNT(*) FILTER(WHERE status IN ('resolved','closed')) as resolved FROM tickets WHERE created_at>=$1 AND created_at<=$2 GROUP BY DATE(created_at) ORDER BY day`,[df,dt]),
    query(`SELECT EXTRACT(HOUR FROM created_at) as hour,COUNT(*) as count FROM tickets WHERE created_at>=$1 AND created_at<=$2 GROUP BY EXTRACT(HOUR FROM created_at) ORDER BY hour`,[df,dt]),
    query(`SELECT requester_email,requester_name,COUNT(*) as count FROM tickets WHERE created_at>=$1 AND created_at<=$2 AND requester_email IS NOT NULL GROUP BY requester_email,requester_name ORDER BY count DESC LIMIT 10`,[df,dt])
  ]);
  res.json({ summary:summary.rows[0], byAgent:byAgent.rows, byCategory:byCategory.rows, bySource:bySource.rows, dailyLoad:dailyLoad.rows, hourlyLoad:hourlyLoad.rows, topRequesters:topRequesters.rows, period:{from:df,to:dt} });
});

// ── EXPORT ───────────────────────────────────────────────────
router.get('/analytics/export', requireAuth, async (req,res) => {
  const { from, to, format='csv', status, priority } = req.query;
  const conds=['1=1']; const params=[];
  if (from) { params.push(new Date(from)); conds.push(`t.created_at>=$${params.length}`); }
  if (to) { params.push(new Date(to+'T23:59:59')); conds.push(`t.created_at<=$${params.length}`); }
  if (status&&status!=='all') { params.push(status); conds.push(`t.status=$${params.length}`); }
  if (priority) { params.push(priority); conds.push(`t.priority=$${params.length}`); }

  const r = await query(`SELECT t.number,t.subject,t.status,t.priority,t.source,t.requester_name,t.requester_email,t.requester_phone,u.name as agent,c.name as category,d.name as department,t.created_at,t.resolved_at,t.sla_breached,t.first_response_at,ROUND(EXTRACT(EPOCH FROM (t.resolved_at-t.created_at))/3600,1) as resolve_hours FROM tickets t LEFT JOIN users u ON u.id=t.assigned_to LEFT JOIN categories c ON c.id=t.category_id LEFT JOIN departments d ON d.id=t.department_id WHERE ${conds.join(' AND ')} ORDER BY t.created_at DESC`,params);

  const rows = r.rows.map(r=>({
    '№ Тикета':r.number,'Тема':r.subject,'Статус':r.status,'Приоритет':r.priority,
    'Источник':r.source,'Заявитель':r.requester_name||'','Email':r.requester_email||'',
    'Телефон':r.requester_phone||'','Агент':r.agent||'','Категория':r.category||'',
    'Отдел':r.department||'','Создан':r.created_at?new Date(r.created_at).toLocaleString('ru-RU'):'',
    'Решён':r.resolved_at?new Date(r.resolved_at).toLocaleString('ru-RU'):'',
    'Время решения (ч)':r.resolve_hours||'','Нарушен SLA':r.sla_breached?'Да':'Нет'
  }));

  if (format==='xlsx') {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb,ws,'Тикеты');
    const buf = XLSX.write(wb,{type:'buffer',bookType:'xlsx'});
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition','attachment; filename="tickets.xlsx"');
    return res.send(buf);
  }

  const csv = [Object.keys(rows[0]||{}).join(','),...rows.map(r=>Object.values(r).map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
  res.setHeader('Content-Type','text/csv; charset=utf-8');
  res.setHeader('Content-Disposition','attachment; filename="tickets.csv"');
  res.send('\ufeff'+csv);
});

// ── KNOWLEDGE BASE ───────────────────────────────────────────
router.get('/kb/categories', async (req,res) => {
  const r = await query(`SELECT kc.*,COUNT(ka.id) as article_count FROM kb_categories kc LEFT JOIN kb_articles ka ON ka.category_id=kc.id AND ka.is_published=true GROUP BY kc.id ORDER BY kc.sort_order,kc.name`);
  res.json(r.rows);
});
router.get('/kb/articles', requireAuth, async (req,res) => {
  const {category,search,published} = req.query;
  const conds=['1=1']; const params=[];
  if (category) { params.push(parseInt(category)); conds.push(`ka.category_id=$${params.length}`); }
  if (published==='true') conds.push('ka.is_published=true');
  if (search) { params.push(`%${search}%`); conds.push(`(ka.title ILIKE $${params.length} OR ka.body ILIKE $${params.length})`); }
  const r = await query(`SELECT ka.*,kc.name as category_name,u.name as author_name FROM kb_articles ka LEFT JOIN kb_categories kc ON kc.id=ka.category_id LEFT JOIN users u ON u.id=ka.author_id WHERE ${conds.join(' AND ')} ORDER BY ka.updated_at DESC`,params);
  res.json(r.rows);
});
router.get('/kb/articles/:id', requireAuth, async (req,res) => {
  const r = await query(`SELECT ka.*,kc.name as category_name,u.name as author_name FROM kb_articles ka LEFT JOIN kb_categories kc ON kc.id=ka.category_id LEFT JOIN users u ON u.id=ka.author_id WHERE ka.id=$1`,[req.params.id]);
  if (!r.rows[0]) return res.status(404).json({ error:'Not found' });
  await query('UPDATE kb_articles SET views=views+1 WHERE id=$1',[req.params.id]);
  res.json(r.rows[0]);
});
router.post('/kb/articles', requireRole('admin','agent'), async (req,res) => {
  const {title,body,category_id,is_published,is_public,tags} = req.body;
  const slug = title.toLowerCase().replace(/[^a-zа-яё0-9]+/gi,'-').substring(0,100)+'-'+Date.now();
  const r = await query(`INSERT INTO kb_articles(title,slug,body,category_id,author_id,is_published,is_public,tags) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,[title,slug,body,category_id||null,req.session.user.id,is_published||false,is_public!==false,tags||[]]);
  res.json({ success:true, article:r.rows[0] });
});
router.patch('/kb/articles/:id', requireRole('admin','agent'), async (req,res) => {
  const {title,body,category_id,is_published,is_public,tags} = req.body;
  await query(`UPDATE kb_articles SET title=$1,body=$2,category_id=$3,is_published=$4,is_public=$5,tags=$6,updated_at=NOW() WHERE id=$7`,[title,body,category_id||null,is_published,is_public,tags||[],req.params.id]);
  res.json({ success:true });
});
router.delete('/kb/articles/:id', requireRole('admin'), async (req,res) => {
  await query('DELETE FROM kb_articles WHERE id=$1',[req.params.id]);
  res.json({ success:true });
});

// ── INVENTORY ─────────────────────────────────────────────────
router.get('/inventory', requireAuth, async (req,res) => {
  const {status,category,search,page=1,limit=30} = req.query;
  const conds=['1=1']; const params=[];
  if (status&&status!=='all') { params.push(status); conds.push(`i.status=$${params.length}`); }
  if (category) { params.push(parseInt(category)); conds.push(`i.category_id=$${params.length}`); }
  if (search) { const s=`%${search}%`; params.push(s); conds.push(`(i.name ILIKE $${params.length} OR i.serial_number ILIKE $${params.length} OR i.asset_tag ILIKE $${params.length} OR i.inventory_number ILIKE $${params.length} OR i.assigned_to_name ILIKE $${params.length})`); }
  const where=conds.join(' AND ');
  const countParams=[...params];
  params.push(parseInt(limit),(parseInt(page)-1)*parseInt(limit));
  const [items,total,categories,stats] = await Promise.all([
    query(`SELECT i.*,ic.name as category_name,ic.icon as cat_icon,ic.color as cat_color FROM inventory_items i LEFT JOIN inventory_categories ic ON ic.id=i.category_id WHERE ${where} ORDER BY i.updated_at DESC LIMIT $${params.length-1} OFFSET $${params.length}`,params),
    query(`SELECT COUNT(*) FROM inventory_items i WHERE ${where}`,countParams),
    query('SELECT * FROM inventory_categories ORDER BY name'),
    query(`SELECT status,COUNT(*) as count FROM inventory_items GROUP BY status`)
  ]);
  res.json({ items:items.rows, total:parseInt(total.rows[0].count), categories:categories.rows, stats:stats.rows });
});
router.post('/inventory', requireAuth, async (req,res) => {
  const {name,serial_number,asset_tag,inventory_number,category_id,status='available',location,manufacturer,model,purchase_date,purchase_price,warranty_until,vendor,notes,assigned_to_name,assigned_to_email} = req.body;
  if (!name) return res.status(400).json({ error:'Name required' });
  const r = await query(`INSERT INTO inventory_items(name,serial_number,asset_tag,inventory_number,category_id,status,location,manufacturer,model,purchase_date,purchase_price,warranty_until,vendor,notes,assigned_to_name,assigned_to_email) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
    [name,serial_number||null,asset_tag||null,inventory_number||null,category_id||null,status,location||null,manufacturer||null,model||null,purchase_date||null,purchase_price||null,warranty_until||null,vendor||null,notes||null,assigned_to_name||null,assigned_to_email||null]);
  await query(`INSERT INTO inventory_history(item_id,action,performed_by,details) VALUES($1,'created',$2,$3)`,[r.rows[0].id,req.session.user.id,JSON.stringify({name})]);
  res.json({ success:true, item:r.rows[0] });
});
router.patch('/inventory/:id', requireAuth, async (req,res) => {
  const {name,serial_number,asset_tag,inventory_number,category_id,status,location,manufacturer,model,purchase_date,purchase_price,warranty_until,vendor,notes,assigned_to_name,assigned_to_email} = req.body;
  const old = await query('SELECT * FROM inventory_items WHERE id=$1',[req.params.id]);
  if (!old.rows[0]) return res.status(404).json({ error:'Not found' });
  const assignedAt = status==='assigned'&&old.rows[0].status!=='assigned' ? new Date() : (status==='available'?null:old.rows[0].assigned_at);
  await query(`UPDATE inventory_items SET name=$1,serial_number=$2,asset_tag=$3,inventory_number=$4,category_id=$5,status=$6,location=$7,manufacturer=$8,model=$9,purchase_date=$10,purchase_price=$11,warranty_until=$12,vendor=$13,notes=$14,assigned_to_name=$15,assigned_to_email=$16,assigned_at=$17,updated_at=NOW() WHERE id=$18`,
    [name,serial_number||null,asset_tag||null,inventory_number||null,category_id||null,status,location||null,manufacturer||null,model||null,purchase_date||null,purchase_price||null,warranty_until||null,vendor||null,notes||null,assigned_to_name||null,assigned_to_email||null,assignedAt,req.params.id]);
  if (status!==old.rows[0].status) await query(`INSERT INTO inventory_history(item_id,action,performed_by,details) VALUES($1,$2,$3,$4)`,[req.params.id,`status:${old.rows[0].status}→${status}`,req.session.user.id,JSON.stringify({assigned_to:assigned_to_name})]);
  res.json({ success:true });
});
router.delete('/inventory/:id', requireRole('admin'), async (req,res) => {
  await query('DELETE FROM inventory_items WHERE id=$1',[req.params.id]);
  res.json({ success:true });
});
router.get('/inventory/:id/history', requireAuth, async (req,res) => {
  const r = await query(`SELECT ih.*,u.name as agent_name FROM inventory_history ih LEFT JOIN users u ON u.id=ih.performed_by WHERE ih.item_id=$1 ORDER BY ih.created_at DESC`,[req.params.id]);
  res.json(r.rows);
});

// ── USERS ─────────────────────────────────────────────────────
router.get('/users', requireRole('admin'), async (req,res) => {
  const r = await query('SELECT id,name,email,role,department,telegram_id,is_active,last_login,created_at FROM users ORDER BY name');
  res.json(r.rows);
});
router.post('/users', requireRole('admin'), async (req,res) => {
  const {name,email,password,role='agent',department,telegram_id} = req.body;
  if (!email||!password) return res.status(400).json({ error:'Email and password required' });
  const hash = await bcrypt.hash(password,10);
  try {
    const r = await query(`INSERT INTO users(name,email,password_hash,role,department,telegram_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,name,email,role`,[name,email,hash,role,department||null,telegram_id||null]);
    res.json({ success:true, user:r.rows[0] });
  } catch(e) {
    if (e.code==='23505') return res.status(400).json({ error:'Email уже существует' });
    throw e;
  }
});
router.patch('/users/:id', requireRole('admin'), async (req,res) => {
  const {name,email,password,role,department,telegram_id,is_active} = req.body;
  const updates=[]; const params=[];
  const add=(col,val)=>{ params.push(val); updates.push(`${col}=$${params.length}`); };
  if (name) add('name',name); if (email) add('email',email); if (role) add('role',role);
  if (department!==undefined) add('department',department); if (telegram_id!==undefined) add('telegram_id',telegram_id||null);
  if (is_active!==undefined) add('is_active',is_active);
  if (password) { const h=await bcrypt.hash(password,10); add('password_hash',h); }
  if (!updates.length) return res.json({ success:true });
  params.push(req.params.id);
  await query(`UPDATE users SET ${updates.join(',')} WHERE id=$${params.length}`,params);
  res.json({ success:true });
});
router.delete('/users/:id', requireRole('admin'), async (req,res) => {
  if (parseInt(req.params.id)===req.session.user.id) return res.status(400).json({ error:'Cannot delete yourself' });
  await query('UPDATE users SET is_active=false WHERE id=$1',[req.params.id]);
  res.json({ success:true });
});

// ── SETTINGS ──────────────────────────────────────────────────
router.get('/settings', requireRole('admin'), async (req,res) => {
  const [settings,templates,departments,categories,sla,auto_rules,esc_rules,users] = await Promise.all([
    getAllSettings(),
    query('SELECT * FROM email_templates ORDER BY name'),
    query('SELECT * FROM departments ORDER BY name'),
    query('SELECT * FROM categories ORDER BY name'),
    query('SELECT * FROM sla_policies ORDER BY priority'),
    query('SELECT * FROM automation_rules ORDER BY sort_order'),
    query('SELECT er.*,u.name as notify_user_name FROM escalation_rules er LEFT JOIN users u ON u.id=er.notify_user_id'),
    query('SELECT id,name,email FROM users WHERE is_active=true AND role IN (\'admin\',\'agent\') ORDER BY name')
  ]);
  res.json({ settings, templates:templates.rows, departments:departments.rows, categories:categories.rows, sla:sla.rows, auto_rules:auto_rules.rows, esc_rules:esc_rules.rows, users:users.rows });
});

router.patch('/settings', requireRole('admin'), async (req,res) => {
  for (const [key,value] of Object.entries(req.body)) {
    await setSetting(key, value);
  }
  // Reinit telegram if token changed
  if (req.body.tg_bot_token!==undefined || req.body.tg_enabled!==undefined) {
    await reinitBot().catch(()=>{});
  }
  res.json({ success:true });
});

router.post('/settings/test-email', requireRole('admin'), async (req,res) => {
  const r = await sendTestEmail(req.body.to||req.session.user.email);
  res.json(r);
});

// Upload company logo
router.post('/settings/logo', requireRole('admin'), upload.single('logo'), async (req,res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
  const logoUrl = '/uploads/' + req.file.filename;
  await setSetting('company_logo', logoUrl);
  res.json({ success: true, logo: logoUrl });
});

// Remove company logo
router.delete('/settings/logo', requireRole('admin'), async (req,res) => {
  await setSetting('company_logo', '');
  res.json({ success: true });
});

// Public branding (no auth) — for login screen + header
router.get('/branding', async (req,res) => {
  const s = await getSettings(['company_name','company_logo']);
  res.json({ company_name: s.company_name || 'HelpDesk', company_logo: s.company_logo || '' });
});

router.post('/settings/test-telegram', requireRole('admin'), async (req,res) => {
  const chatId = req.body.chat_id;
  if (!chatId) return res.status(400).json({ error:'chat_id required' });
  const r = await sendTestMessage(chatId);
  res.json(r);
});

router.post('/settings/test-imap', requireRole('admin'), async (req,res) => {
  try {
    await pollInbox();
    res.json({ success:true, message:'IMAP проверен, новых писем нет или они обработаны' });
  } catch(e) { res.json({ success:false, error:e.message }); }
});

router.patch('/settings/templates/:id', requireRole('admin'), async (req,res) => {
  const {subject,body,enabled} = req.body;
  if (enabled !== undefined && subject === undefined && body === undefined) {
    await query('UPDATE email_templates SET enabled=$1,updated_at=NOW() WHERE id=$2',[enabled,req.params.id]);
  } else {
    await query('UPDATE email_templates SET subject=$1,body=$2,enabled=COALESCE($3,enabled),updated_at=NOW() WHERE id=$4',[subject,body,enabled,req.params.id]);
  }
  res.json({ success:true });
});

// Departments CRUD
router.post('/settings/departments', requireRole('admin'), async (req,res) => {
  const {name,email,description} = req.body;
  const r = await query('INSERT INTO departments(name,email,description) VALUES($1,$2,$3) RETURNING *',[name,email||null,description||null]);
  res.json({ success:true, department:r.rows[0] });
});
router.patch('/settings/departments/:id', requireRole('admin'), async (req,res) => {
  const {name,email,description} = req.body;
  await query('UPDATE departments SET name=$1,email=$2,description=$3 WHERE id=$4',[name,email||null,description||null,req.params.id]);
  res.json({ success:true });
});
router.delete('/settings/departments/:id', requireRole('admin'), async (req,res) => {
  await query('DELETE FROM departments WHERE id=$1',[req.params.id]);
  res.json({ success:true });
});

// Categories CRUD
router.post('/settings/categories', requireRole('admin'), async (req,res) => {
  const {name,color,icon,department_id} = req.body;
  const r = await query('INSERT INTO categories(name,color,icon,department_id) VALUES($1,$2,$3,$4) RETURNING *',[name,color||'#4f8ef7',icon||'📁',department_id||null]);
  res.json({ success:true, category:r.rows[0] });
});
router.delete('/settings/categories/:id', requireRole('admin'), async (req,res) => {
  await query('DELETE FROM categories WHERE id=$1',[req.params.id]);
  res.json({ success:true });
});

// Inventory categories CRUD
router.get('/settings/inv-categories', requireAuth, async (req,res) => {
  const r = await query('SELECT * FROM inventory_categories ORDER BY name');
  res.json(r.rows);
});
router.post('/settings/inv-categories', requireRole('admin'), async (req,res) => {
  const {name,icon,color,description} = req.body;
  const r = await query('INSERT INTO inventory_categories(name,icon,color,description) VALUES($1,$2,$3,$4) RETURNING *',[name,icon||'📦',color||'#4f8ef7',description||null]);
  res.json({ success:true, category:r.rows[0] });
});
router.patch('/settings/inv-categories/:id', requireRole('admin'), async (req,res) => {
  const {name,icon,color,description} = req.body;
  await query('UPDATE inventory_categories SET name=$1,icon=$2,color=$3,description=$4 WHERE id=$5',[name,icon,color,description||null,req.params.id]);
  res.json({ success:true });
});
router.delete('/settings/inv-categories/:id', requireRole('admin'), async (req,res) => {
  await query('DELETE FROM inventory_categories WHERE id=$1',[req.params.id]);
  res.json({ success:true });
});

// SLA
router.patch('/settings/sla/:id', requireRole('admin'), async (req,res) => {
  const {name,first_response_hours,resolution_hours} = req.body;
  await query('UPDATE sla_policies SET name=$1,first_response_hours=$2,resolution_hours=$3 WHERE id=$4',[name,first_response_hours,resolution_hours,req.params.id]);
  res.json({ success:true });
});

// Automation rules CRUD
router.post('/settings/automation', requireRole('admin'), async (req,res) => {
  const {name,trigger_event,condition_field,condition_operator,condition_value,action_type,action_value} = req.body;
  const r = await query(`INSERT INTO automation_rules(name,trigger_event,condition_field,condition_operator,condition_value,action_type,action_value) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,[name,trigger_event,condition_field||null,condition_operator||null,condition_value||null,action_type,action_value||null]);
  res.json({ success:true, rule:r.rows[0] });
});
router.patch('/settings/automation/:id', requireRole('admin'), async (req,res) => {
  const {name,is_active,trigger_event,condition_field,condition_operator,condition_value,action_type,action_value} = req.body;
  await query(`UPDATE automation_rules SET name=$1,is_active=$2,trigger_event=$3,condition_field=$4,condition_operator=$5,condition_value=$6,action_type=$7,action_value=$8 WHERE id=$9`,[name,is_active,trigger_event,condition_field||null,condition_operator||null,condition_value||null,action_type,action_value||null,req.params.id]);
  res.json({ success:true });
});
router.delete('/settings/automation/:id', requireRole('admin'), async (req,res) => {
  await query('DELETE FROM automation_rules WHERE id=$1',[req.params.id]);
  res.json({ success:true });
});

// Escalation rules
router.post('/settings/escalation', requireRole('admin'), async (req,res) => {
  const {name,priority,hours_unassigned,hours_unresolved,notify_user_id,notify_telegram,notify_email} = req.body;
  const r = await query(`INSERT INTO escalation_rules(name,priority,hours_unassigned,hours_unresolved,notify_user_id,notify_telegram,notify_email) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,[name,priority||'all',hours_unassigned||4,hours_unresolved||24,notify_user_id||null,notify_telegram!==false,notify_email!==false]);
  res.json({ success:true, rule:r.rows[0] });
});
router.patch('/settings/escalation/:id', requireRole('admin'), async (req,res) => {
  const {name,is_active,priority,hours_unassigned,hours_unresolved,notify_user_id,notify_telegram,notify_email} = req.body;
  await query(`UPDATE escalation_rules SET name=$1,is_active=$2,priority=$3,hours_unassigned=$4,hours_unresolved=$5,notify_user_id=$6,notify_telegram=$7,notify_email=$8 WHERE id=$9`,[name,is_active,priority,hours_unassigned,hours_unresolved,notify_user_id||null,notify_telegram,notify_email,req.params.id]);
  res.json({ success:true });
});
router.delete('/settings/escalation/:id', requireRole('admin'), async (req,res) => {
  await query('DELETE FROM escalation_rules WHERE id=$1',[req.params.id]);
  res.json({ success:true });
});

// ── CONTACTS (адресная книга) ─────────────────────────────────
router.get('/contacts', requireAuth, async (req,res) => {
  const { search } = req.query;
  let sql = 'SELECT * FROM contacts'; const params = [];
  if (search) { params.push(`%${search}%`); sql += ` WHERE name ILIKE $1 OR email ILIKE $1 OR company ILIKE $1`; }
  sql += ' ORDER BY name';
  const r = await query(sql, params);
  res.json(r.rows);
});
router.post('/contacts', requireAuth, async (req,res) => {
  if (req.session.user.role==='viewer') return res.status(403).json({ error:'Forbidden' });
  const { name, email, phone, company, position, notes } = req.body;
  if (!name || !email) return res.status(400).json({ error:'Имя и email обязательны' });
  const r = await query(`INSERT INTO contacts(name,email,phone,company,position,notes) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
    [name,email,phone||null,company||null,position||null,notes||null]);
  res.json({ success:true, contact:r.rows[0] });
});
router.patch('/contacts/:id', requireAuth, async (req,res) => {
  if (req.session.user.role==='viewer') return res.status(403).json({ error:'Forbidden' });
  const { name, email, phone, company, position, notes } = req.body;
  await query(`UPDATE contacts SET name=$1,email=$2,phone=$3,company=$4,position=$5,notes=$6 WHERE id=$7`,
    [name,email,phone||null,company||null,position||null,notes||null,req.params.id]);
  res.json({ success:true });
});
router.delete('/contacts/:id', requireAuth, async (req,res) => {
  if (req.session.user.role==='viewer') return res.status(403).json({ error:'Forbidden' });
  await query('DELETE FROM contacts WHERE id=$1',[req.params.id]);
  res.json({ success:true });
});

// ── FORWARD ticket ────────────────────────────────────────────
router.post('/tickets/:id/forward', requireAuth, async (req,res) => {
  if (req.session.user.role==='viewer') return res.status(403).json({ error:'Forbidden' });
  const { to, note } = req.body;
  if (!to) return res.status(400).json({ error:'Укажите получателя' });
  const t = await query('SELECT * FROM tickets WHERE id=$1',[req.params.id]);
  if (!t.rows[0]) return res.status(404).json({ error:'Not found' });
  const ticket = t.rows[0];
  const comments = await query(`SELECT author_name,body,created_at,is_internal FROM ticket_comments WHERE ticket_id=$1 AND is_internal=false ORDER BY created_at ASC`,[ticket.id]);
  const { forwardTicket } = require('./email');
  const r = await forwardTicket(ticket, comments.rows, to, note, req.session.user.name);
  if (r?.success) {
    await logHistory(ticket.id, req.session.user.id, 'forwarded', null, `Переслано: ${to}`);
    res.json({ success:true });
  } else {
    res.json({ success:false, error: r?.reason || 'Ошибка отправки' });
  }
});

// ── MANAGEMENT (конструктор справочников) ─────────────────────
// Sections (подразделы)
router.get('/mgmt/sections', requireAuth, async (req,res) => {
  const r = await query(`SELECT s.*, (SELECT COUNT(*) FROM mgmt_records WHERE section_id=s.id) as record_count FROM mgmt_sections s ORDER BY s.sort_order, s.name`);
  res.json(r.rows);
});
router.post('/mgmt/sections', requireRole('admin'), async (req,res) => {
  const { name, icon, color } = req.body;
  if (!name) return res.status(400).json({ error:'Название обязательно' });
  const mx = await query('SELECT COALESCE(MAX(sort_order),0)+1 as n FROM mgmt_sections');
  const r = await query(`INSERT INTO mgmt_sections(name,icon,color,sort_order) VALUES($1,$2,$3,$4) RETURNING *`,
    [name, icon||'📋', color||'#4f8ef7', mx.rows[0].n]);
  res.json({ success:true, section:r.rows[0] });
});
router.patch('/mgmt/sections/:id', requireRole('admin'), async (req,res) => {
  const { name, icon, color } = req.body;
  await query(`UPDATE mgmt_sections SET name=$1,icon=$2,color=$3 WHERE id=$4`,[name,icon,color,req.params.id]);
  res.json({ success:true });
});
router.delete('/mgmt/sections/:id', requireRole('admin'), async (req,res) => {
  await query('DELETE FROM mgmt_sections WHERE id=$1',[req.params.id]);
  res.json({ success:true });
});

// Fields (поля подраздела)
router.get('/mgmt/sections/:id/fields', requireAuth, async (req,res) => {
  const r = await query('SELECT * FROM mgmt_fields WHERE section_id=$1 ORDER BY sort_order, id',[req.params.id]);
  res.json(r.rows);
});
router.post('/mgmt/sections/:id/fields', requireRole('admin'), async (req,res) => {
  const { name, field_type, required, options, is_expiry } = req.body;
  if (!name) return res.status(400).json({ error:'Название поля обязательно' });
  const key = 'f_' + Date.now().toString(36);
  const mx = await query('SELECT COALESCE(MAX(sort_order),0)+1 as n FROM mgmt_fields WHERE section_id=$1',[req.params.id]);
  const r = await query(`INSERT INTO mgmt_fields(section_id,name,field_key,field_type,required,options,sort_order,is_expiry) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [req.params.id, name, key, field_type||'text', required||false, options||null, mx.rows[0].n, (field_type==='date' && is_expiry)||false]);
  res.json({ success:true, field:r.rows[0] });
});
router.delete('/mgmt/fields/:id', requireRole('admin'), async (req,res) => {
  await query('DELETE FROM mgmt_fields WHERE id=$1',[req.params.id]);
  res.json({ success:true });
});

// Records (записи)
router.get('/mgmt/sections/:id/records', requireAuth, async (req,res) => {
  const { search } = req.query;
  let sql = `SELECT * FROM mgmt_records WHERE section_id=$1`; const params=[req.params.id];
  if (search) { params.push(`%${search}%`); sql += ` AND (title ILIKE $2 OR data::text ILIKE $2)`; }
  sql += ' ORDER BY updated_at DESC';
  const r = await query(sql, params);
  res.json(r.rows);
});
router.get('/mgmt/records/:id', requireAuth, async (req,res) => {
  const r = await query('SELECT * FROM mgmt_records WHERE id=$1',[req.params.id]);
  if (!r.rows[0]) return res.status(404).json({ error:'Not found' });
  res.json(r.rows[0]);
});
router.post('/mgmt/sections/:id/records', requireAuth, upload.array('files',10), async (req,res) => {
  if (req.session.user.role==='viewer') return res.status(403).json({ error:'Forbidden' });
  let data = {};
  try { data = req.body.data ? JSON.parse(req.body.data) : {}; } catch(e) {}
  const title = req.body.title || data.name || data.title || 'Без названия';
  const files = (req.files||[]).map(f=>({ name:f.originalname, path:f.filename, size:f.size }));
  const r = await query(`INSERT INTO mgmt_records(section_id,title,data,files,created_by) VALUES($1,$2,$3,$4,$5) RETURNING *`,
    [req.params.id, title, JSON.stringify(data), JSON.stringify(files), req.session.user.id]);
  try { const sec=(await query('SELECT name FROM mgmt_sections WHERE id=$1',[req.params.id])).rows[0]; require('./bots').emitEvent('record_added', `➕ <b>${sec?.name||'Управление'}</b>: добавлена запись «${title}»\n👤 ${req.session.user.name}`); } catch(e){}
  res.json({ success:true, record:r.rows[0] });
});
router.patch('/mgmt/records/:id', requireAuth, upload.array('files',10), async (req,res) => {
  if (req.session.user.role==='viewer') return res.status(403).json({ error:'Forbidden' });
  const old = await query('SELECT * FROM mgmt_records WHERE id=$1',[req.params.id]);
  if (!old.rows[0]) return res.status(404).json({ error:'Not found' });
  let data = {};
  try { data = req.body.data ? JSON.parse(req.body.data) : old.rows[0].data; } catch(e) { data = old.rows[0].data; }
  const title = req.body.title || data.name || data.title || old.rows[0].title;
  let files = old.rows[0].files || [];
  if (typeof files === 'string') { try { files = JSON.parse(files); } catch(e){ files=[]; } }
  const newFiles = (req.files||[]).map(f=>({ name:f.originalname, path:f.filename, size:f.size }));
  files = files.concat(newFiles);
  await query(`UPDATE mgmt_records SET title=$1,data=$2,files=$3,updated_at=NOW() WHERE id=$4`,
    [title, JSON.stringify(data), JSON.stringify(files), req.params.id]);
  try { const sec=(await query('SELECT s.name FROM mgmt_sections s JOIN mgmt_records r ON r.section_id=s.id WHERE r.id=$1',[req.params.id])).rows[0]; require('./bots').emitEvent('record_updated', `✏️ <b>${sec?.name||'Управление'}</b>: изменена запись «${title}»\n👤 ${req.session.user.name}`); } catch(e){}
  res.json({ success:true });
});
router.delete('/mgmt/records/:id', requireAuth, async (req,res) => {
  if (req.session.user.role==='viewer') return res.status(403).json({ error:'Forbidden' });
  const rec = (await query('SELECT r.title, s.name FROM mgmt_records r JOIN mgmt_sections s ON s.id=r.section_id WHERE r.id=$1',[req.params.id])).rows[0];
  await query('DELETE FROM mgmt_records WHERE id=$1',[req.params.id]);
  try { require('./bots').emitEvent('record_deleted', `🗑 <b>${rec?.name||'Управление'}</b>: удалена запись «${rec?.title||''}»\n👤 ${req.session.user.name}`); } catch(e){}
  res.json({ success:true });
});

// Auto-dashboard stats for every section
router.get('/mgmt/stats', requireAuth, async (req,res) => {
  const sections = await query('SELECT * FROM mgmt_sections ORDER BY sort_order, name');
  const out = [];
  const now = new Date();
  const in30 = new Date(); in30.setDate(now.getDate()+30);
  for (const s of sections.rows) {
    const total = await query('SELECT COUNT(*) FROM mgmt_records WHERE section_id=$1',[s.id]);
    // find expiry fields
    const expFields = await query(`SELECT field_key FROM mgmt_fields WHERE section_id=$1 AND is_expiry=true`,[s.id]);
    let expiringSoon = 0, expired = 0;
    if (expFields.rows.length) {
      const recs = await query('SELECT data FROM mgmt_records WHERE section_id=$1',[s.id]);
      for (const r of recs.rows) {
        const data = typeof r.data==='string'?JSON.parse(r.data):(r.data||{});
        for (const f of expFields.rows) {
          const v = data[f.field_key];
          if (!v) continue;
          const d = new Date(v);
          if (isNaN(d)) continue;
          if (d < now) expired++;
          else if (d <= in30) expiringSoon++;
        }
      }
    }
    out.push({ id:s.id, name:s.name, icon:s.icon, color:s.color, total:parseInt(total.rows[0].count), expiring_soon:expiringSoon, expired, has_expiry: expFields.rows.length>0 });
  }
  res.json(out);
});

// ── CUSTOM DASHBOARDS (конструктор) ───────────────────────────
const { computeWidget } = require('./dashboard');

// list dashboards visible to user (own + shared)
router.get('/dashboards', requireAuth, async (req,res) => {
  const r = await query(`SELECT * FROM dashboards WHERE owner_id=$1 OR is_shared=true ORDER BY sort_order, id`, [req.session.user.id]);
  res.json(r.rows);
});
router.post('/dashboards', requireAuth, async (req,res) => {
  if (req.session.user.role==='viewer') return res.status(403).json({ error:'Forbidden' });
  const { name, is_shared } = req.body;
  if (!name) return res.status(400).json({ error:'Название обязательно' });
  const shared = (is_shared && req.session.user.role==='admin') || false;
  const r = await query(`INSERT INTO dashboards(name,owner_id,is_shared) VALUES($1,$2,$3) RETURNING *`, [name, req.session.user.id, shared]);
  res.json({ success:true, dashboard:r.rows[0] });
});
router.patch('/dashboards/:id', requireAuth, async (req,res) => {
  const { name, is_shared } = req.body;
  const d = (await query('SELECT * FROM dashboards WHERE id=$1',[req.params.id])).rows[0];
  if (!d) return res.status(404).json({ error:'Not found' });
  if (d.owner_id!==req.session.user.id && req.session.user.role!=='admin') return res.status(403).json({ error:'Forbidden' });
  await query(`UPDATE dashboards SET name=COALESCE($1,name), is_shared=$2 WHERE id=$3`, [name||null, (is_shared&&req.session.user.role==='admin')||false, req.params.id]);
  res.json({ success:true });
});
router.delete('/dashboards/:id', requireAuth, async (req,res) => {
  const d = (await query('SELECT * FROM dashboards WHERE id=$1',[req.params.id])).rows[0];
  if (!d) return res.status(404).json({ error:'Not found' });
  if (d.owner_id!==req.session.user.id && req.session.user.role!=='admin') return res.status(403).json({ error:'Forbidden' });
  await query('DELETE FROM dashboards WHERE id=$1',[req.params.id]);
  res.json({ success:true });
});

// widgets of a dashboard, WITH computed data
router.get('/dashboards/:id/widgets', requireAuth, async (req,res) => {
  const widgets = await query(`SELECT * FROM dashboard_widgets WHERE dashboard_id=$1 ORDER BY sort_order, id`,[req.params.id]);
  const out = [];
  for (const w of widgets.rows) {
    const data = await computeWidget(w);
    out.push({ ...w, data });
  }
  res.json(out);
});
router.post('/dashboards/:id/widgets', requireAuth, async (req,res) => {
  if (req.session.user.role==='viewer') return res.status(403).json({ error:'Forbidden' });
  const { widget_type, title, source, metric, color, width, config } = req.body;
  const mx = await query('SELECT COALESCE(MAX(sort_order),0)+1 n FROM dashboard_widgets WHERE dashboard_id=$1',[req.params.id]);
  const r = await query(`INSERT INTO dashboard_widgets(dashboard_id,widget_type,title,source,metric,color,width,config,sort_order) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [req.params.id, widget_type, title||'', source||'', metric||'', color||'#4f8ef7', width||1, JSON.stringify(config||{}), mx.rows[0].n]);
  res.json({ success:true, widget:r.rows[0] });
});
router.patch('/widgets/:id', requireAuth, async (req,res) => {
  if (req.session.user.role==='viewer') return res.status(403).json({ error:'Forbidden' });
  const { title, color, width, sort_order, config } = req.body;
  const cur = (await query('SELECT * FROM dashboard_widgets WHERE id=$1',[req.params.id])).rows[0];
  if (!cur) return res.status(404).json({ error:'Not found' });
  await query(`UPDATE dashboard_widgets SET title=COALESCE($1,title), color=COALESCE($2,color), width=COALESCE($3,width), sort_order=COALESCE($4,sort_order), config=COALESCE($5,config) WHERE id=$6`,
    [title??null, color??null, width??null, sort_order??null, config?JSON.stringify(config):null, req.params.id]);
  res.json({ success:true });
});
router.post('/widgets/reorder', requireAuth, async (req,res) => {
  if (req.session.user.role==='viewer') return res.status(403).json({ error:'Forbidden' });
  const { order } = req.body; // array of widget ids in new order
  if (Array.isArray(order)) {
    for (let i=0;i<order.length;i++) await query('UPDATE dashboard_widgets SET sort_order=$1 WHERE id=$2',[i, parseInt(order[i])]);
  }
  res.json({ success:true });
});
router.delete('/widgets/:id', requireAuth, async (req,res) => {
  if (req.session.user.role==='viewer') return res.status(403).json({ error:'Forbidden' });
  await query('DELETE FROM dashboard_widgets WHERE id=$1',[req.params.id]);
  res.json({ success:true });
});

// available sources for widget builder (incl. dynamic mgmt sections)
router.get('/dashboards-sources', requireAuth, async (req,res) => {
  const sections = await query('SELECT id,name,icon FROM mgmt_sections ORDER BY sort_order,name');
  res.json({ mgmt_sections: sections.rows });
});

// ── TELEGRAM BOTS (конструктор) ───────────────────────────────
const bots = require('./bots');

router.get('/bots/events', requireAuth, async (req,res) => res.json(bots.EVENT_LIST));
router.get('/bots', requireRole('admin'), async (req,res) => {
  const r = await query(`SELECT b.*, (SELECT COUNT(*) FROM tg_schedules WHERE bot_id=b.id) as schedule_count FROM tg_bots b ORDER BY b.id`);
  res.json(r.rows);
});
router.post('/bots', requireRole('admin'), async (req,res) => {
  const { name, token, chat_id, events, expiry_days } = req.body;
  if (!name || !token) return res.status(400).json({ error:'Название и токен обязательны' });
  const r = await query(`INSERT INTO tg_bots(name,token,chat_id,events,expiry_days) VALUES($1,$2,$3,$4,$5) RETURNING *`,
    [name, token, chat_id||null, JSON.stringify(events||{}), JSON.stringify(expiry_days||[30,7,1])]);
  await bots.reloadBot(r.rows[0].id);
  res.json({ success:true, bot:r.rows[0] });
});
router.patch('/bots/:id', requireRole('admin'), async (req,res) => {
  const { name, token, chat_id, is_active, events, expiry_days } = req.body;
  const cur = (await query('SELECT * FROM tg_bots WHERE id=$1',[req.params.id])).rows[0];
  if (!cur) return res.status(404).json({ error:'Not found' });
  await query(`UPDATE tg_bots SET name=COALESCE($1,name), token=COALESCE($2,token), chat_id=$3, is_active=COALESCE($4,is_active), events=COALESCE($5,events), expiry_days=COALESCE($6,expiry_days) WHERE id=$7`,
    [name??null, token??null, chat_id??null, is_active??null, events?JSON.stringify(events):null, expiry_days?JSON.stringify(expiry_days):null, req.params.id]);
  await bots.reloadBot(req.params.id);
  res.json({ success:true });
});
router.delete('/bots/:id', requireRole('admin'), async (req,res) => {
  await query('DELETE FROM tg_bots WHERE id=$1',[req.params.id]);
  res.json({ success:true });
});
router.post('/bots/:id/test', requireRole('admin'), async (req,res) => {
  const b = (await query('SELECT * FROM tg_bots WHERE id=$1',[req.params.id])).rows[0];
  if (!b) return res.status(404).json({ error:'Not found' });
  try {
    const TelegramBot = require('node-telegram-bot-api');
    const inst = new TelegramBot(b.token, { polling:false });
    await inst.sendMessage(b.chat_id, '✅ Тест: бот «'+b.name+'» подключён и работает.');
    res.json({ success:true });
  } catch(e) { res.json({ success:false, error:e.message }); }
});

// Schedules
router.get('/bots/:id/schedules', requireRole('admin'), async (req,res) => {
  const r = await query('SELECT * FROM tg_schedules WHERE bot_id=$1 ORDER BY id',[req.params.id]);
  res.json(r.rows);
});
router.post('/bots/:id/schedules', requireRole('admin'), async (req,res) => {
  const { title, message, freq, day_of_week, day_of_month, run_date, run_time, interval_n, start_date } = req.body;
  if (!message) return res.status(400).json({ error:'Текст сообщения обязателен' });
  const r = await query(`INSERT INTO tg_schedules(bot_id,title,message,freq,day_of_week,day_of_month,run_date,run_time,interval_n,start_date) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [req.params.id, title||null, message, freq||'weekly', day_of_week??null, day_of_month??null, run_date||null, run_time||'17:00', interval_n||1, start_date||null]);
  res.json({ success:true, schedule:r.rows[0] });
});
router.patch('/schedules/:id', requireRole('admin'), async (req,res) => {
  const { is_active } = req.body;
  await query('UPDATE tg_schedules SET is_active=COALESCE($1,is_active) WHERE id=$2',[is_active??null, req.params.id]);
  res.json({ success:true });
});
router.delete('/schedules/:id', requireRole('admin'), async (req,res) => {
  await query('DELETE FROM tg_schedules WHERE id=$1',[req.params.id]);
  res.json({ success:true });
});

// ── NOTIFICATIONS ─────────────────────────────────────────────
router.get('/notifications', requireAuth, async (req,res) => {
  const r = await query('SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 30',[req.session.user.id]);
  const unread = await query('SELECT COUNT(*) FROM notifications WHERE user_id=$1 AND is_read=false',[req.session.user.id]);
  res.json({ notifications:r.rows, unread:parseInt(unread.rows[0].count) });
});
router.post('/notifications/read-all', requireAuth, async (req,res) => {
  await query('UPDATE notifications SET is_read=true WHERE user_id=$1',[req.session.user.id]);
  res.json({ success:true });
});

// ── PROFILE ───────────────────────────────────────────────────
router.patch('/profile', requireAuth, async (req,res) => {
  const {name,telegram_id,current_password,new_password} = req.body;
  if (current_password&&new_password) {
    const u = await query('SELECT * FROM users WHERE id=$1',[req.session.user.id]);
    const ok = await bcrypt.compare(current_password,u.rows[0].password_hash);
    if (!ok) return res.status(400).json({ error:'Неверный текущий пароль' });
    await query('UPDATE users SET password_hash=$1 WHERE id=$2',[await bcrypt.hash(new_password,10),req.session.user.id]);
  }
  if (name||telegram_id!==undefined) {
    await query('UPDATE users SET name=COALESCE($1,name),telegram_id=$2 WHERE id=$3',[name||null,telegram_id||null,req.session.user.id]);
    if (name) req.session.user.name=name;
  }
  res.json({ success:true });
});

module.exports = router;
