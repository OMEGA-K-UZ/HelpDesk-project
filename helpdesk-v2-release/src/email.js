const nodemailer = require('nodemailer');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const { query, getSettings } = require('./db');
const { generateTicketNumber, logHistory, calcSLADue, isWorkingHours } = require('./helpers');

let _transport = null;
let _transportKey = '';

async function getTransport() {
  const s = await getSettings(['smtp_host','smtp_port','smtp_user','smtp_pass','smtp_encryption','smtp_enabled']);
  if (s.smtp_enabled !== 'true' || !s.smtp_host) return null;
  const port = parseInt(s.smtp_port || '587');
  const enc = s.smtp_encryption || 'tls';
  const key = `${s.smtp_host}:${port}:${s.smtp_user}:${enc}`;
  if (_transport && _transportKey === key) return _transport;
  if (_transport) { try { _transport.close(); } catch(e) {} }
  _transport = nodemailer.createTransport({
    host: s.smtp_host, port,
    secure: enc === 'ssl' || port === 465,
    requireTLS: enc === 'tls',
    ignoreTLS: enc === 'none',
    auth: s.smtp_user ? { user: s.smtp_user, pass: s.smtp_pass } : undefined,
    tls: { rejectUnauthorized: false, servername: s.smtp_host },
    pool: true, maxConnections: 1, maxMessages: 50, rateDelta: 2000, rateLimit: 3
  });
  _transportKey = key;
  return _transport;
}

function isSystemAddress(email) {
  if (!email) return true;
  const e = email.toLowerCase();
  const patterns = ['no-reply','noreply','no_reply','mailer-daemon','mailerdaemon','postmaster','donotreply','do-not-reply','bounce','bounces','notifications@','notification@','automated','daemon@','root@'];
  return patterns.some(p => e.includes(p));
}

// Build our own Message-ID so we can store and thread on it
async function genMessageId() {
  const s = await getSettings(['smtp_user','company_email','smtp_host']);
  const domain = (s.smtp_user||s.company_email||'helpdesk@localhost').split('@')[1] || 'helpdesk.local';
  return `<hd-${Date.now()}-${Math.random().toString(36).slice(2,10)}@${domain}>`;
}

async function sendMail({ to, cc, subject, text, inReplyTo, references }) {
  try {
    const transport = await getTransport();
    if (!transport) return { success: false, reason: 'SMTP not configured' };
    const s = await getSettings(['smtp_from_name','smtp_user','company_email']);
    const from = `"${s.smtp_from_name||'HelpDesk'}" <${s.smtp_user||s.company_email}>`;
    const messageId = await genMessageId();
    const mail = { from, to, subject, text, messageId };
    if (cc && cc.length) mail.cc = Array.isArray(cc) ? cc.join(', ') : cc;
    if (inReplyTo) { mail.inReplyTo = inReplyTo; mail.references = references || inReplyTo; }
    await transport.sendMail(mail);
    return { success: true, messageId };
  } catch(e) {
    console.error('Email send error:', e.message);
    return { success: false, reason: e.message };
  }
}

async function sendTestEmail(to) {
  try {
    const transport = await getTransport();
    if (!transport) return { success: false, reason: 'SMTP не настроен' };
    const s = await getSettings(['smtp_from_name','smtp_user']);
    await transport.sendMail({
      from: `"${s.smtp_from_name||'HelpDesk'}" <${s.smtp_user}>`,
      to, subject: '✅ Тест SMTP — eMaktab HelpDesk',
      text: 'Тестовое письмо. Настройка SMTP работает корректно.'
    });
    return { success: true };
  } catch(e) { return { success: false, reason: e.message }; }
}

// slug-based templated email. Returns messageId of sent mail.
async function sendTemplatedEmail(slug, to, vars, threading) {
  if (isSystemAddress(to)) {
    console.log(`⏭️  Письмо не отправлено (служебный адрес): ${to}`);
    return null;
  }
  const r = await query('SELECT subject,body,enabled FROM email_templates WHERE slug=$1', [slug]);
  if (!r.rows[0]) return null;
  if (r.rows[0].enabled === false) {
    console.log(`⏭️  Автоответ «${slug}» отключён — письмо не отправлено`);
    return null;
  }
  let { subject, body } = r.rows[0];
  for (const [k,v] of Object.entries(vars)) {
    subject = subject.replaceAll(`{${k}}`, v||'');
    body = body.replaceAll(`{${k}}`, v||'');
  }
  const res = await sendMail({ to, subject, text: body, inReplyTo: threading?.inReplyTo, references: threading?.references });
  return res.success ? res.messageId : null;
}

// Subject always carries [HD-XXXXX] so replies can be matched by number
function ticketSubject(ticket, base) {
  const num = ticket.number;
  const clean = (base || ticket.subject || '').replace(/^(re|fwd?):\s*/i,'').replace(/\[HD-\d+\]\s*/g,'').trim();
  return `[${num}] ${clean}`;
}

async function sendTicketCreatedReply(ticket) {
  if (!ticket.requester_email || isSystemAddress(ticket.requester_email)) return null;
  const working = await isWorkingHours();
  const slug = working ? 'ticket_created' : 'out_of_hours';
  // Force subject to include [HD-XXXXX]
  const r = await query('SELECT subject,body,enabled FROM email_templates WHERE slug=$1', [slug]);
  if (!r.rows[0]) return null;
  if (r.rows[0].enabled === false) {
    console.log(`⏭️  Автоответ «${slug}» отключён — письмо не отправлено`);
    return null;
  }
  let { subject, body } = r.rows[0];
  const vars = { name: ticket.requester_name||ticket.requester_email, number: ticket.number, subject: ticket.subject, priority: ticket.priority, date: new Date().toLocaleString('ru-RU') };
  for (const [k,v] of Object.entries(vars)) { subject=subject.replaceAll(`{${k}}`,v||''); body=body.replaceAll(`{${k}}`,v||''); }
  // Ensure [HD-XXXXX] present in subject
  if (!subject.includes(`[${ticket.number}]`)) subject = `[${ticket.number}] ${subject}`;
  const res = await sendMail({ to: ticket.requester_email, subject, text: body });
  return res.success ? res.messageId : null;
}

async function sendTicketReply(ticket, replyBody, agentName, threading, cc) {
  if (!ticket.requester_email || isSystemAddress(ticket.requester_email)) return null;
  const r = await query('SELECT subject,body FROM email_templates WHERE slug=$1', ['ticket_replied']);
  if (!r.rows[0]) return null;
  let { subject, body } = r.rows[0];
  const vars = { name: ticket.requester_name||ticket.requester_email, number: ticket.number, subject: ticket.subject, status: ticket.status, reply_body: replyBody, agent: agentName||'Служба поддержки' };
  for (const [k,v] of Object.entries(vars)) { subject=subject.replaceAll(`{${k}}`,v||''); body=body.replaceAll(`{${k}}`,v||''); }
  if (!subject.includes(`[${ticket.number}]`)) subject = `[${ticket.number}] ${subject}`;
  const res = await sendMail({ to: ticket.requester_email, cc: cc||undefined, subject, text: body, inReplyTo: threading?.inReplyTo, references: threading?.references });
  return res.success ? res.messageId : null;
}

// Forward whole ticket thread to another address
// called as forwardTicket(ticket, comments, toEmail, note, agentName)
async function forwardTicket(ticket, comments, toEmail, note, agentName) {
  let body = '';
  if (note) body += note + '\n\n──────────\n\n';
  body += `Пересылка тикета #${ticket.number}: ${ticket.subject}\n`;
  body += `Заявитель: ${ticket.requester_name||'—'} <${ticket.requester_email||'—'}>\n`;
  body += `Статус: ${ticket.status} | Приоритет: ${ticket.priority}\n`;
  body += `Создан: ${new Date(ticket.created_at).toLocaleString('ru-RU')}\n`;
  if (agentName) body += `Переслал: ${agentName}\n`;
  body += `\nОписание:\n${ticket.description||'—'}\n\n──── Переписка ────\n\n`;
  for (const c of (comments||[])) {
    if (c.is_internal) continue;
    body += `[${new Date(c.created_at).toLocaleString('ru-RU')}] ${c.author_name||c.user_name||'—'}:\n${c.body}\n\n`;
  }
  const res = await sendMail({ to: toEmail, subject: `Fwd: [${ticket.number}] ${ticket.subject}`, text: body });
  return res;
}

async function sendTicketResolved(ticket, resolution) {
  if (!ticket.requester_email || isSystemAddress(ticket.requester_email)) return null;
  const r = await query('SELECT subject,body FROM email_templates WHERE slug=$1', ['ticket_resolved']);
  if (!r.rows[0]) return null;
  let { subject, body } = r.rows[0];
  const vars = { name: ticket.requester_name||ticket.requester_email, number: ticket.number, subject: ticket.subject, resolution: resolution||'Проблема решена' };
  for (const [k,v] of Object.entries(vars)) { subject=subject.replaceAll(`{${k}}`,v||''); body=body.replaceAll(`{${k}}`,v||''); }
  if (!subject.includes(`[${ticket.number}]`)) subject = `[${ticket.number}] ${subject}`;
  const res = await sendMail({ to: ticket.requester_email, subject, text: body });
  return res.success ? res.messageId : null;
}

async function sendEscalationEmail(ticket, reason, notifyEmail) {
  if (!notifyEmail) return;
  const appUrl = process.env.APP_URL || 'http://localhost:4000';
  return sendTemplatedEmail('escalation_notify', notifyEmail, {
    number: ticket.number, subject: ticket.subject,
    requester: ticket.requester_name || ticket.requester_email || '—',
    priority: ticket.priority, reason, date: new Date().toLocaleString('ru-RU'),
    ticket_url: `${appUrl}/tickets/${ticket.id}`
  });
}

// ── IMAP POLLING ───────────────────────────────────────────
let _polling = false;
let _pollingStartedAt = null;
let _currentImap = null;

async function pollInbox() {
  if (_polling) {
    // Защита от залипания: если предыдущий запуск завис дольше 90 сек — сбрасываем
    if (_pollingStartedAt && (Date.now() - _pollingStartedAt) > 90000) {
      console.warn('⚠️ IMAP: предыдущая проверка зависла >90с, принудительный сброс');
      _polling = false;
      if (_currentImap) { try { _currentImap.destroy(); } catch(e){} _currentImap = null; }
    } else {
      return; // нормальная защита от параллельного запуска
    }
  }
  const s = await getSettings(['imap_host','imap_port','imap_user','imap_pass','imap_encryption','imap_folder','imap_enabled']);
  if (s.imap_enabled !== 'true' || !s.imap_host) return;
  const port = parseInt(s.imap_port || '993');
  const useTls = s.imap_encryption === 'ssl' || port === 993;
  _polling = true;
  _pollingStartedAt = Date.now();
  return new Promise((resolve) => {
    const imap = new Imap({
      user: s.imap_user, password: s.imap_pass, host: s.imap_host, port,
      tls: useTls, tlsOptions: { rejectUnauthorized: false, servername: s.imap_host },
      autotls: useTls ? 'never' : 'required', connTimeout: 20000, authTimeout: 10000
    });
    _currentImap = imap;
    let done = false;
    // ЖЁСТКИЙ предохранитель: что бы ни случилось — через 45с всё закрываем
    const hardTimeout = setTimeout(() => {
      console.error('❌ IMAP: жёсткий таймаут 45с — соединение принудительно закрыто (сервер не отвечает корректно)');
      try { imap.destroy(); } catch(e){}
      finish();
    }, 45000);
    const finish = () => {
      if (!done) {
        done = true;
        clearTimeout(hardTimeout);
        _polling = false;
        _pollingStartedAt = null;
        _currentImap = null;
        resolve();
      }
    };
    imap.once('error', e => { console.error('❌ IMAP error:', e.message); finish(); });
    imap.once('end', () => finish());
    imap.once('close', () => finish());
    imap.once('ready', () => {
      console.log(`✅ IMAP connected: ${s.imap_user}@${s.imap_host}:${port}`);
      imap.openBox(s.imap_folder || 'INBOX', false, (err) => {
        if (err) { console.error('❌ IMAP openBox error:', err.message); try{imap.end();}catch(e){finish();} return; }
        imap.search(['UNSEEN'], async (err, results) => {
          if (err) { console.error('❌ IMAP search error:', err.message); try{imap.end();}catch(e){finish();} return; }
          if (!results || !results.length) { console.log('📭 IMAP: новых писем нет'); try{imap.end();}catch(e){finish();} return; }
          console.log(`📬 IMAP: найдено ${results.length} новых писем`);
          const fetch = imap.fetch(results, { bodies: '', markSeen: true });
          const emails = [];
          fetch.on('message', msg => {
            let buf = '';
            msg.on('body', stream => stream.on('data', c => buf += c.toString('utf8')));
            msg.once('end', () => emails.push(buf));
          });
          fetch.once('error', e => { console.error('❌ IMAP fetch error:', e.message); try{imap.end();}catch(e2){finish();} });
          fetch.once('end', async () => {
            for (const raw of emails) {
              try { await processEmail(raw); } catch(e) { console.error('❌ Process email error:', e.message); }
            }
            try{imap.end();}catch(e){finish();}
          });
        });
      });
    });
    try { imap.connect(); } catch(e) { console.error('❌ IMAP connect exception:', e.message); finish(); }
  });
}

// Extract [HD-XXXXX] ticket number from subject
function extractTicketNumber(subject) {
  if (!subject) return null;
  const m = subject.match(/\[(HD-\d+)\]/i) || subject.match(/\b(HD-\d+)\b/i);
  return m ? m[1].toUpperCase() : null;
}

async function processEmail(raw) {
  const parsed = await simpleParser(raw);
  const fromEmail = parsed.from?.value?.[0]?.address?.toLowerCase();
  const fromName = parsed.from?.value?.[0]?.name || fromEmail;
  if (!fromEmail) { console.log('⚠️ Письмо без отправителя, пропускаю'); return; }

  const subject = parsed.subject || '(без темы)';
  const body = parsed.text || '';
  const messageId = parsed.messageId;
  const inReplyTo = parsed.inReplyTo;
  const refs = parsed.references;

  const autoSubmitted = (parsed.headers?.get('auto-submitted') || '').toString().toLowerCase();
  const isBounce = isSystemAddress(fromEmail) && (
    autoSubmitted.includes('auto-') ||
    /delivery status|mail delivery|undelivered|failure notice|returned mail|оповещение системы безопасности/i.test(subject)
  );
  if (isBounce) { console.log(`⏭️  Пропущено служебное письмо от ${fromEmail} ("${subject}")`); return; }

  // ── 1. Match existing ticket by [HD-XXXXX] in subject (most reliable) ──
  let ticket = null;
  const num = extractTicketNumber(subject);
  if (num) {
    const r = await query('SELECT * FROM tickets WHERE number=$1 LIMIT 1', [num]);
    if (r.rows[0]) ticket = r.rows[0];
  }

  // ── 2. Fallback: match by In-Reply-To / References message-id ──
  if (!ticket && (inReplyTo || refs)) {
    const refIds = [];
    if (inReplyTo) refIds.push(inReplyTo);
    if (refs) Array.isArray(refs) ? refIds.push(...refs) : refIds.push(refs);
    const r = await query(
      `SELECT DISTINCT t.* FROM tickets t
       LEFT JOIN ticket_comments tc ON tc.ticket_id=t.id
       WHERE t.email_message_id = ANY($1) OR tc.email_message_id = ANY($1) LIMIT 1`,
      [refIds]
    );
    if (r.rows[0]) ticket = r.rows[0];
  }

  // ── Reply to existing ticket ──
  if (ticket) {
    await query(`INSERT INTO ticket_comments(ticket_id,author_name,author_email,body,is_email,email_message_id) VALUES($1,$2,$3,$4,true,$5)`,
      [ticket.id, fromName, fromEmail, body.substring(0,5000), messageId]);
    if (['resolved','closed'].includes(ticket.status)) {
      await query(`UPDATE tickets SET status='open',updated_at=NOW() WHERE id=$1`, [ticket.id]);
      await logHistory(ticket.id, null, 'status_changed', ticket.status, 'open');
    }
    await query(`UPDATE tickets SET has_new_reply=true, updated_at=NOW() WHERE id=$1`, [ticket.id]);
    await logHistory(ticket.id, null, 'reply_received', null, `Ответ от ${fromEmail}`);
    try {
      if (ticket.assigned_to) {
        const { createNotification } = require('./helpers');
        await createNotification(ticket.assigned_to, 'ticket_reply', `Новый ответ по #${ticket.number}`, body.substring(0,100), `/tickets/${ticket.id}`);
        const agent = await query('SELECT telegram_id FROM users WHERE id=$1', [ticket.assigned_to]);
        if (agent.rows[0]?.telegram_id) {
          const { sendNotification } = require('./telegram');
          await sendNotification('comment', { ...ticket, agent_telegram_id: agent.rows[0].telegram_id, subject: `Ответ по #${ticket.number}` });
        }
      }
    } catch(e) { console.error('Reply notify error:', e.message); }
    console.log(`📧 Ответ добавлен к тикету ${ticket.number} (без нового тикета, без автоответа)`);
    return;
  }

  // ── New ticket ──
  const number = await generateTicketNumber();
  const slaDue = await calcSLADue('medium');
  const r = await query(
    `INSERT INTO tickets(number,subject,description,status,priority,source,requester_name,requester_email,sla_due_at,email_message_id)
     VALUES($1,$2,$3,'open','medium','email',$4,$5,$6,$7) RETURNING *`,
    [number, subject.substring(0,500), body.substring(0,10000), fromName, fromEmail, slaDue, messageId]
  );
  const newTicket = r.rows[0];
  await logHistory(newTicket.id, null, 'created', null, `Email: ${fromEmail}`);

  const { runAutomation } = require('./automation');
  await runAutomation('ticket_created', newTicket).catch(() => {});

  // Auto-reply ONCE on creation; store our outgoing message-id for threading
  const sentId = await sendTicketCreatedReply(newTicket).catch(e => { console.error('Auto-reply error:', e.message); return null; });
  if (sentId) {
    await query(`INSERT INTO ticket_comments(ticket_id,author_name,body,is_email,is_internal,email_message_id) VALUES($1,'Система','(автоответ отправлен)',true,true,$2)`,
      [newTicket.id, sentId]);
  }

  const { sendNotification } = require('./telegram');
  await sendNotification('new_ticket', newTicket).catch(() => {});

  console.log(`🎫 Создан тикет ${number} от ${fromEmail} ("${subject}")`);
}

module.exports = { sendMail, sendTestEmail, sendTemplatedEmail, sendTicketCreatedReply, sendTicketReply, sendTicketResolved, sendEscalationEmail, forwardTicket, pollInbox };
