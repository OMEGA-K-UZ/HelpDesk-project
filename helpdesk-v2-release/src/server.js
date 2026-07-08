require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');

const routes = require('./routes');
const { initBot } = require('./telegram');
const { pollInbox } = require('./email');
const { checkEscalations } = require('./automation');
const { query } = require('./db');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'helpdesk-secret-32chars-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000, httpOnly: true }
}));

app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_DIR || './data/uploads')));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/api', routes);

// Telegram webhook
app.post('/tgbot:token', (req, res) => {
  const { getBot } = require('./telegram');
  const bot = getBot();
  if (bot) bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ── CRON ─────────────────────────────────────────────────────
// Poll email every minute
cron.schedule('* * * * *', async () => {
  try { await pollInbox(); } catch(e) { console.error('IMAP cron:', e.message); }
});

// SLA breach check every 5 min
cron.schedule('*/5 * * * *', async () => {
  try {
    await query(`UPDATE tickets SET sla_breached=true WHERE sla_due_at<NOW() AND sla_breached=false AND status NOT IN ('resolved','closed')`);
    // Notify on breach
    const breached = await query(`SELECT * FROM tickets WHERE sla_breached=true AND status NOT IN ('resolved','closed') AND NOT (metadata?'sla_notified') LIMIT 10`);
    const { sendNotification } = require('./telegram');
    for (const t of breached.rows) {
      await sendNotification('sla_breach', t).catch(()=>{});
      await query(`UPDATE tickets SET metadata=metadata||'{"sla_notified":true}' WHERE id=$1`,[t.id]);
    }
  } catch(e) { console.error('SLA cron:', e.message); }
});

// Escalation check every 15 min
cron.schedule('*/15 * * * *', async () => {
  try { await checkEscalations(); } catch(e) { console.error('Escalation cron:', e.message); }
});

// Auto-close resolved after N days (daily at 3am)
cron.schedule('0 3 * * *', async () => {
  try {
    const days = await require('./db').getSetting('auto_close_days') || '5';
    await query(`UPDATE tickets SET status='closed',closed_at=NOW(),updated_at=NOW() WHERE status='resolved' AND resolved_at<NOW()-INTERVAL'${parseInt(days)} days'`);
  } catch(e) { console.error('Auto-close cron:', e.message); }
});

// Telegram bots: scheduled messages — каждую минуту
cron.schedule('* * * * *', async () => {
  try { await require('./bots').checkSchedules(); } catch(e) { console.error('Bot schedules cron:', e.message); }
});

// Telegram bots: проверка сроков + ежедневная сводка (каждый день в 9:00)
cron.schedule('0 9 * * *', async () => {
  try { await require('./bots').checkExpiries(); } catch(e) { console.error('Bot expiry cron:', e.message); }
  try { await require('./bots').sendDailySummary(); } catch(e) { console.error('Bot summary cron:', e.message); }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(`\n🚀 eMaktab HelpDesk v2 → http://localhost:${PORT}`);
  console.log(`🔑 admin@helpdesk.local / admin123\n`);
  await initBot().catch(e => console.error('Bot init:', e.message));
  await require('./bots').initBots().catch(e => console.error('Bots init:', e.message));
});
