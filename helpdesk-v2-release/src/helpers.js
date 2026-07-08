const bcrypt = require('bcryptjs');
const { query, getSetting } = require('./db');

function requireAuth(req, res, next) {
  if (req.session?.user) return next();
  if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'Unauthorized' });
  res.redirect('/login');
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session?.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.session.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

async function generateTicketNumber() {
  const prefix = await getSetting('ticket_prefix') || 'HD';
  const r = await query('SELECT COUNT(*) as cnt FROM tickets');
  const n = parseInt(r.rows[0].cnt) + 1;
  return `${prefix}-${String(n).padStart(5, '0')}`;
}

async function createNotification(userId, type, title, body, link) {
  if (!userId) return;
  await query(`INSERT INTO notifications(user_id,type,title,body,link) VALUES($1,$2,$3,$4,$5)`,
    [userId, type, title, body || '', link || '']);
}

async function notifyAllAgents(type, title, body, link, excludeId = null) {
  const r = await query(
    `SELECT id FROM users WHERE is_active=true AND role IN ('admin','agent')${excludeId ? ' AND id!=$1' : ''}`,
    excludeId ? [excludeId] : []
  );
  for (const u of r.rows) await createNotification(u.id, type, title, body, link);
}

async function logHistory(ticketId, userId, action, oldVal, newVal) {
  await query(`INSERT INTO ticket_history(ticket_id,user_id,action,old_value,new_value) VALUES($1,$2,$3,$4,$5)`,
    [ticketId, userId || null, action, oldVal || null, newVal || null]);
}

async function calcSLADue(priority) {
  const r = await query('SELECT resolution_hours FROM sla_policies WHERE priority=$1 LIMIT 1', [priority]);
  if (!r.rows[0]) return null;
  const due = new Date();
  due.setHours(due.getHours() + r.rows[0].resolution_hours);
  return due;
}

// Check if current time is within working hours
async function isWorkingHours() {
  const { query: q } = require('./db');
  const settings = await require('./db').getSettings(['working_hours_start','working_hours_end','working_days']);
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const workDays = (settings.working_days || '1,2,3,4,5').split(',').map(Number);
  if (!workDays.includes(dayOfWeek)) return false;
  const [startH, startM] = (settings.working_hours_start || '09:00').split(':').map(Number);
  const [endH, endM] = (settings.working_hours_end || '18:00').split(':').map(Number);
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= start && cur <= end;
}

module.exports = { requireAuth, requireRole, generateTicketNumber, createNotification, notifyAllAgents, logHistory, calcSLADue, isWorkingHours };
