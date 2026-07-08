const TelegramBot = require('node-telegram-bot-api');
const { query } = require('./db');

// Активные экземпляры ботов: { botId: TelegramBot }
const instances = {};

// Список доступных событий (для UI)
const EVENT_LIST = [
  { key:'new_ticket', label:'Новый тикет' },
  { key:'status_change', label:'Смена статуса тикета' },
  { key:'assigned', label:'Назначен агент' },
  { key:'comment', label:'Новый комментарий/ответ' },
  { key:'sla_breach', label:'Нарушение SLA' },
  { key:'escalation', label:'Эскалация' },
  { key:'ticket_resolved', label:'Тикет решён' },
  { key:'record_added', label:'Добавлена запись (Управление/склад/контакты)' },
  { key:'record_updated', label:'Изменена запись' },
  { key:'record_deleted', label:'Удалена запись' },
  { key:'login', label:'Вход в систему' },
  { key:'expiry', label:'Истечение сроков (лицензии/гарантии)' },
  { key:'daily_summary', label:'Ежедневная сводка (утром)' },
];

async function initBots() {
  // загрузить всех активных ботов
  for (const id of Object.keys(instances)) { try { instances[id].stopPolling?.(); } catch(e){} delete instances[id]; }
  const bots = await query('SELECT * FROM tg_bots WHERE is_active=true');
  for (const b of bots.rows) {
    try {
      instances[b.id] = new TelegramBot(b.token, { polling: false });
      console.log(`✅ TG-бот «${b.name}» подключён`);
    } catch(e) { console.error(`❌ Бот «${b.name}»:`, e.message); }
  }
}

async function reloadBot(botId) {
  if (instances[botId]) { try { instances[botId].stopPolling?.(); } catch(e){} delete instances[botId]; }
  const b = (await query('SELECT * FROM tg_bots WHERE id=$1 AND is_active=true', [botId])).rows[0];
  if (b) {
    try { instances[b.id] = new TelegramBot(b.token, { polling:false }); }
    catch(e) { console.error('Bot reload error:', e.message); }
  }
}

async function sendToBot(b, text) {
  if (!b.chat_id) return;
  let inst = instances[b.id];
  if (!inst) { try { inst = new TelegramBot(b.token, { polling:false }); instances[b.id]=inst; } catch(e){ return; } }
  try { await inst.sendMessage(b.chat_id, text, { parse_mode:'HTML', disable_web_page_preview:true }); }
  catch(e) { console.error(`TG «${b.name}» send error:`, e.message); }
}

// Разослать событие всем ботам, подписанным на него
async function emitEvent(eventKey, text) {
  try {
    const bots = await query('SELECT * FROM tg_bots WHERE is_active=true');
    for (const b of bots.rows) {
      const ev = typeof b.events==='string' ? JSON.parse(b.events) : (b.events||{});
      if (ev[eventKey]) await sendToBot(b, text);
    }
  } catch(e) { console.error('emitEvent error:', e.message); }
}

// ── Проверка сроков (вызывается по расписанию раз в день) ──
async function checkExpiries() {
  const bots = await query('SELECT * FROM tg_bots WHERE is_active=true');
  const subBots = bots.rows.filter(b => { const ev=typeof b.events==='string'?JSON.parse(b.events):(b.events||{}); return ev.expiry; });
  if (!subBots.length) return;

  const now = new Date();
  for (const b of subBots) {
    const days = (typeof b.expiry_days==='string'?JSON.parse(b.expiry_days):(b.expiry_days||[30,7,1]));
    const maxDays = Math.max(...days, 1);
    const lines = [];

    // mgmt records с полем is_expiry
    const sections = await query('SELECT * FROM mgmt_sections');
    for (const s of sections.rows) {
      const expF = await query('SELECT field_key,name FROM mgmt_fields WHERE section_id=$1 AND is_expiry=true', [s.id]);
      if (!expF.rows.length) continue;
      const recs = await query('SELECT title,data FROM mgmt_records WHERE section_id=$1', [s.id]);
      for (const r of recs.rows) {
        const data = typeof r.data==='string'?JSON.parse(r.data):(r.data||{});
        for (const f of expF.rows) {
          const v = data[f.field_key]; if (!v) continue;
          const d = new Date(v); if (isNaN(d)) continue;
          const diff = Math.ceil((d - now)/86400000);
          if (diff >= 0 && diff <= maxDays && days.includes(diff)) {
            lines.push(`📋 <b>${s.name}</b>: «${r.title}» — истекает через <b>${diff} дн.</b> (${d.toLocaleDateString('ru-RU')})`);
          } else if (diff < 0 && diff >= -1) {
            lines.push(`🚨 <b>${s.name}</b>: «${r.title}» — срок ИСТЁК (${d.toLocaleDateString('ru-RU')})`);
          }
        }
      }
    }
    // гарантия техники
    const inv = await query(`SELECT name,warranty_until FROM inventory_items WHERE warranty_until IS NOT NULL`);
    for (const it of inv.rows) {
      const d = new Date(it.warranty_until); if (isNaN(d)) continue;
      const diff = Math.ceil((d - now)/86400000);
      if (diff >= 0 && diff <= maxDays && days.includes(diff)) {
        lines.push(`📦 Гарантия: «${it.name}» — истекает через <b>${diff} дн.</b>`);
      }
    }

    if (lines.length) {
      await sendToBot(b, `⏰ <b>Напоминание о сроках</b>\n\n${lines.join('\n')}`);
    }
  }
}

// ── Ежедневная сводка ──
async function sendDailySummary() {
  const open = (await query(`SELECT COUNT(*) c FROM tickets WHERE status='open' AND (is_deleted IS NULL OR is_deleted=false)`)).rows[0].c;
  const unresolved = (await query(`SELECT COUNT(*) c FROM tickets WHERE status NOT IN ('resolved','closed') AND (is_deleted IS NULL OR is_deleted=false)`)).rows[0].c;
  const breached = (await query(`SELECT COUNT(*) c FROM tickets WHERE sla_breached=true AND status NOT IN ('resolved','closed') AND (is_deleted IS NULL OR is_deleted=false)`)).rows[0].c;
  const text = `📊 <b>Сводка на ${new Date().toLocaleDateString('ru-RU')}</b>\n\n📬 Открытых тикетов: <b>${open}</b>\n🔄 Нерешённых: <b>${unresolved}</b>\n🚨 Нарушений SLA: <b>${breached}</b>`;
  await emitEvent('daily_summary', text);
}

// ── Запланированные сообщения (7 режимов) ──
async function checkSchedules() {
  const now = new Date();
  const today = now.toISOString().slice(0,10);
  const hhmm = now.toTimeString().slice(0,5);
  const dow = now.getDay();
  const dom = now.getDate();

  const sch = await query(`SELECT s.*, b.token, b.chat_id, b.name as bot_name FROM tg_schedules s JOIN tg_bots b ON b.id=s.bot_id WHERE s.is_active=true AND b.is_active=true`);
  for (const s of sch.rows) {
    if (s.last_run === today) continue;
    if (s.run_time && s.run_time > hhmm) continue;
    const n = Math.max(parseInt(s.interval_n)||1, 1);
    const start = s.start_date ? new Date(s.start_date) : null;
    if (start && start.toISOString().slice(0,10) > today) continue; // ещё не начался
    let due = false;

    switch (s.freq) {
      case 'once':
        due = (s.run_date && new Date(s.run_date).toISOString().slice(0,10) === today);
        break;
      case 'daily':
        due = true;
        break;
      case 'every_n_days': {
        // отсчёт от start_date каждые N дней
        const base = start || now;
        const diffDays = Math.floor((stripTime(now) - stripTime(base)) / 86400000);
        due = diffDays >= 0 && diffDays % n === 0;
        break;
      }
      case 'weekly':
        due = (parseInt(s.day_of_week) === dow);
        break;
      case 'every_n_weeks': {
        if (parseInt(s.day_of_week) !== dow) { due = false; break; }
        const base = start || now;
        const diffWeeks = Math.floor((stripTime(now) - stripTime(base)) / (86400000*7));
        due = diffWeeks >= 0 && diffWeeks % n === 0;
        break;
      }
      case 'monthly':
        due = (parseInt(s.day_of_month) === dom);
        break;
      case 'every_n_months': {
        if (parseInt(s.day_of_month) !== dom) { due = false; break; }
        const base = start || now;
        const months = (now.getFullYear()-base.getFullYear())*12 + (now.getMonth()-base.getMonth());
        due = months >= 0 && months % n === 0;
        break;
      }
    }
    if (!due) continue;
    await sendToBot({ id:s.bot_id, name:s.bot_name, token:s.token, chat_id:s.chat_id }, s.message);
    await query('UPDATE tg_schedules SET last_run=$1 WHERE id=$2', [today, s.id]);
    console.log(`📨 Сообщение «${s.title||''}» отправлено ботом «${s.bot_name}» (режим: ${s.freq})`);
  }
}
function stripTime(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); }

module.exports = { initBots, reloadBot, emitEvent, checkExpiries, sendDailySummary, checkSchedules, EVENT_LIST };
