const { query } = require('./db');
const { logHistory } = require('./helpers');

async function runAutomation(event, ticket) {
  const rules = await query(
    `SELECT * FROM automation_rules WHERE is_active=true AND trigger_event=$1 ORDER BY sort_order ASC`,
    [event]
  );

  for (const rule of rules.rows) {
    if (!matchCondition(rule, ticket)) continue;
    await applyAction(rule, ticket);
    console.log(`⚡ Automation: "${rule.name}" applied to #${ticket.number}`);
  }
}

function matchCondition(rule, ticket) {
  if (!rule.condition_field || !rule.condition_operator) return true;
  const fieldValue = String(ticket[rule.condition_field] || '').toLowerCase();
  const condValue = String(rule.condition_value || '').toLowerCase();
  switch (rule.condition_operator) {
    case 'contains': return fieldValue.includes(condValue);
    case 'not_contains': return !fieldValue.includes(condValue);
    case 'equals': return fieldValue === condValue;
    case 'starts_with': return fieldValue.startsWith(condValue);
    case 'ends_with': return fieldValue.endsWith(condValue);
    default: return false;
  }
}

async function applyAction(rule, ticket) {
  const val = rule.action_value;
  switch (rule.action_type) {
    case 'assign_agent':
      await query(`UPDATE tickets SET assigned_to=$1,updated_at=NOW() WHERE id=$2`, [parseInt(val), ticket.id]);
      await logHistory(ticket.id, null, 'auto_assigned_agent', null, val);
      break;
    case 'assign_department':
      await query(`UPDATE tickets SET department_id=$1,updated_at=NOW() WHERE id=$2`, [parseInt(val), ticket.id]);
      break;
    case 'set_priority':
      await query(`UPDATE tickets SET priority=$1,updated_at=NOW() WHERE id=$2`, [val, ticket.id]);
      await logHistory(ticket.id, null, 'auto_set_priority', ticket.priority, val);
      break;
    case 'set_category':
      await query(`UPDATE tickets SET category_id=$1,updated_at=NOW() WHERE id=$2`, [parseInt(val), ticket.id]);
      break;
    case 'add_tag':
      await query(`UPDATE tickets SET tags=array_append(tags,$1),updated_at=NOW() WHERE id=$2 AND NOT ($1=ANY(tags))`, [val, ticket.id]);
      break;
    case 'send_telegram': {
      const { sendNotification } = require('./telegram');
      await sendNotification('new_ticket', { ...ticket, _automation_note: val });
      break;
    }
    case 'escalate': {
      const escalateTo = await query('SELECT * FROM users WHERE id=$1', [parseInt(val)]);
      if (escalateTo.rows[0]) {
        const { sendEscalationEmail } = require('./email');
        await sendEscalationEmail(ticket, 'Правило автоматизации', escalateTo.rows[0].email);
      }
      break;
    }
  }
}

// ── ESCALATION CHECKER (runs via cron) ────────────────────
async function checkEscalations() {
  const rules = await query('SELECT * FROM escalation_rules WHERE is_active=true');
  for (const rule of rules.rows) {
    await checkEscalationRule(rule);
  }
}

async function checkEscalationRule(rule) {
  const { sendNotification } = require('./telegram');
  const { sendEscalationEmail } = require('./email');
  const appUrl = process.env.APP_URL || 'http://localhost:4000';

  // Unassigned too long
  if (rule.hours_unassigned > 0) {
    const conds = [`status='open'`, `assigned_to IS NULL`,
      `created_at < NOW() - INTERVAL '${rule.hours_unassigned} hours'`,
      `NOT (metadata ? 'escalated_unassigned')`];
    if (rule.priority !== 'all') conds.push(`priority='${rule.priority}'`);
    const tickets = await query(`SELECT * FROM tickets WHERE ${conds.join(' AND ')} LIMIT 20`);
    for (const t of tickets.rows) {
      const reason = `Не назначен более ${rule.hours_unassigned} ч.`;
      if (rule.notify_telegram) await sendNotification('escalation', { ...t, reason });
      if (rule.notify_email && rule.notify_user_id) {
        const u = await query('SELECT email FROM users WHERE id=$1', [rule.notify_user_id]);
        if (u.rows[0]) await sendEscalationEmail(t, reason, u.rows[0].email);
      }
      await query(`UPDATE tickets SET metadata=metadata||'{"escalated_unassigned":true}' WHERE id=$1`, [t.id]);
      await logHistory(t.id, null, 'escalated', null, reason);
    }
  }

  // Unresolved too long
  if (rule.hours_unresolved > 0) {
    const conds = [`status NOT IN ('resolved','closed')`,
      `created_at < NOW() - INTERVAL '${rule.hours_unresolved} hours'`,
      `NOT (metadata ? 'escalated_unresolved')`];
    if (rule.priority !== 'all') conds.push(`priority='${rule.priority}'`);
    const tickets = await query(`SELECT * FROM tickets WHERE ${conds.join(' AND ')} LIMIT 20`);
    for (const t of tickets.rows) {
      const reason = `Не решён более ${rule.hours_unresolved} ч.`;
      if (rule.notify_telegram) await sendNotification('escalation', { ...t, reason });
      if (rule.notify_email && rule.notify_user_id) {
        const u = await query('SELECT email FROM users WHERE id=$1', [rule.notify_user_id]);
        if (u.rows[0]) await sendEscalationEmail(t, reason, u.rows[0].email);
      }
      await query(`UPDATE tickets SET metadata=metadata||'{"escalated_unresolved":true}' WHERE id=$1`, [t.id]);
      await logHistory(t.id, null, 'escalated', null, reason);
    }
  }
}

module.exports = { runAutomation, checkEscalations };
