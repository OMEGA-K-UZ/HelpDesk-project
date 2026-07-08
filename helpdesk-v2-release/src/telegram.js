const { query, getSetting, getSettings } = require('./db');
let bot = null;
let TelegramBot;

try { TelegramBot = require('node-telegram-bot-api'); } catch(e) { console.warn('TelegramBot not available'); }

async function initBot() {
  const settings = await getSettings(['tg_bot_token','tg_enabled','tg_admin_id']);
  if (settings.tg_enabled !== 'true' || !settings.tg_bot_token) {
    console.log('ℹ️  Telegram bot disabled');
    return null;
  }
  if (!TelegramBot) return null;
  try {
    const appUrl = process.env.APP_URL;
    if (appUrl && !appUrl.includes('localhost')) {
      bot = new TelegramBot(settings.tg_bot_token, { webHook: { port: false } });
      await bot.setWebHook(`${appUrl}/tgbot${settings.tg_bot_token}`);
    } else {
      bot = new TelegramBot(settings.tg_bot_token, { polling: true });
    }
    setupHandlers();
    console.log('✅ Telegram bot started');
    return bot;
  } catch(e) {
    console.error('Bot init error:', e.message);
    return null;
  }
}

// Reinit bot when token changes
async function reinitBot() {
  if (bot) { try { bot.stopPolling(); } catch(e) {} bot = null; }
  return initBot();
}

function setupHandlers() {
  if (!bot) return;
  bot.onText(/\/start/, async (msg) => {
    const user = await query('SELECT * FROM users WHERE telegram_id=$1', [String(msg.from.id)]);
    if (user.rows[0]) {
      bot.sendMessage(msg.chat.id, `Привет, ${user.rows[0].name}!\n\n/tickets — мои тикеты\n/stats — статистика\n/help — помощь`);
    } else {
      bot.sendMessage(msg.chat.id, `Привет! Ваш Telegram ID: ${msg.from.id}\nУкажите его в профиле HelpDesk для получения уведомлений.`);
    }
  });
  bot.onText(/\/tickets/, async (msg) => {
    const user = await query('SELECT * FROM users WHERE telegram_id=$1', [String(msg.from.id)]);
    if (!user.rows[0]) return bot.sendMessage(msg.chat.id, 'Аккаунт не привязан.');
    const t = await query(`SELECT number,subject,status,priority FROM tickets WHERE assigned_to=$1 AND status NOT IN ('resolved','closed') ORDER BY created_at DESC LIMIT 8`, [user.rows[0].id]);
    if (!t.rows.length) return bot.sendMessage(msg.chat.id, '📭 Активных тикетов нет.');
    const p = {low:'🟢',medium:'🟡',high:'🟠',critical:'🔴'};
    bot.sendMessage(msg.chat.id, `Ваши тикеты:\n\n` + t.rows.map(r=>`${p[r.priority]} #${r.number}: ${r.subject.substring(0,50)}\n   Статус: ${r.status}`).join('\n\n'));
  });
  bot.onText(/\/stats/, async (msg) => {
    const r = await query(`SELECT COUNT(*) FILTER(WHERE status='open') as open, COUNT(*) FILTER(WHERE status='in_progress') as ip, COUNT(*) FILTER(WHERE sla_breached=true AND status NOT IN ('resolved','closed')) as sla FROM tickets`);
    const s = r.rows[0];
    bot.sendMessage(msg.chat.id, `📊 HelpDesk статистика:\n\n📬 Открытых: ${s.open}\n🔄 В работе: ${s.ip}\n🚨 Нарушений SLA: ${s.sla}`);
  });
  bot.on('polling_error', e => console.error('TG polling error:', e.message));
}

async function sendNotification(type, data) {
  if (!bot) return;
  const settings = await getSettings([
    'tg_admin_id','tg_group_id',
    'tg_notify_new_ticket','tg_notify_status_change',
    'tg_notify_assigned','tg_notify_sla_breach',
    'tg_notify_comment','tg_notify_escalation','tg_enabled'
  ]);
  if (settings.tg_enabled !== 'true') return;

  const notifyMap = {
    new_ticket: 'tg_notify_new_ticket',
    status_change: 'tg_notify_status_change',
    assigned: 'tg_notify_assigned',
    sla_breach: 'tg_notify_sla_breach',
    comment: 'tg_notify_comment',
    escalation: 'tg_notify_escalation',
  };

  if (notifyMap[type] && settings[notifyMap[type]] !== 'true') return;

  const appUrl = process.env.APP_URL || 'http://localhost:4000';
  const prio = {low:'🟢 Низкий',medium:'🟡 Средний',high:'🟠 Высокий',critical:'🔴 Критический'};

  let text = '';
  let url = '';

  if (type === 'new_ticket') {
    const t = data;
    text = `🎫 Новый тикет #${t.number}\n📝 ${t.subject}\n👤 ${t.requester_name||t.requester_email||'—'}\n⚡ ${prio[t.priority]||t.priority}\n📥 ${t.source}`;
    url = `${appUrl}/tickets/${t.id}`;
  } else if (type === 'status_change') {
    text = `🔄 Тикет #${data.number}\nСтатус: ${data.old_status} → ${data.new_status}`;
    url = `${appUrl}/tickets/${data.id}`;
  } else if (type === 'sla_breach') {
    text = `🚨 Нарушение SLA!\nТикет #${data.number}: ${data.subject}\n⚡ ${prio[data.priority]||data.priority}`;
    url = `${appUrl}/tickets/${data.id}`;
  } else if (type === 'escalation') {
    text = `🚨 Эскалация!\nТикет #${data.number}: ${data.subject}\nПричина: ${data.reason}`;
    url = `${appUrl}/tickets/${data.id}`;
  } else if (type === 'assigned') {
    text = `📌 Назначен тикет #${data.number}\n${data.subject}\nАгент: ${data.agent_name}`;
    url = `${appUrl}/tickets/${data.id}`;
  }

  if (!text) return;
  const opts = url ? { reply_markup: { inline_keyboard: [[{ text: '🔗 Открыть', url }]] } } : {};

  const targets = [settings.tg_admin_id, settings.tg_group_id].filter(Boolean);
  for (const chatId of targets) {
    bot.sendMessage(chatId, text, opts).catch(e => console.error('TG send error:', e.message));
  }

  // Notify specific agent
  if (data.agent_telegram_id) {
    bot.sendMessage(data.agent_telegram_id, text, opts).catch(() => {});
  }
}

async function sendTestMessage(chatId) {
  if (!bot) return { success: false, error: 'Bot not initialized' };
  try {
    await bot.sendMessage(chatId, '✅ Тестовое сообщение от eMaktab HelpDesk\n\nНастройка Telegram уведомлений работает корректно.');
    return { success: true };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

function getBot() { return bot; }
module.exports = { initBot, reinitBot, sendNotification, sendTestMessage, getBot };
