const { query } = require('./db');

// Универсальный расчёт метрики виджета по источнику
async function computeWidget(w) {
  const { widget_type, source, metric, config } = w;
  const cfg = (typeof config==='string'?JSON.parse(config||'{}'):(config||{}));
  try {
    if (source === 'tickets') return await ticketsMetric(widget_type, metric, cfg);
    if (source === 'inventory') return await inventoryMetric(widget_type, metric, cfg);
    if (source && source.startsWith('mgmt:')) return await mgmtMetric(widget_type, parseInt(source.split(':')[1]), metric, cfg);
  } catch(e) { console.error('Widget compute error:', e.message); }
  return { value: 0, items: [] };
}

const NOT_DELETED = `(is_deleted IS NULL OR is_deleted=false)`;

async function ticketsMetric(type, metric, cfg) {
  if (type === 'counter') {
    if (metric === 'total') return { value: (await query(`SELECT COUNT(*) c FROM tickets WHERE ${NOT_DELETED}`)).rows[0].c };
    if (metric === 'open') return { value: (await query(`SELECT COUNT(*) c FROM tickets WHERE status='open' AND ${NOT_DELETED}`)).rows[0].c };
    if (metric === 'unresolved') return { value: (await query(`SELECT COUNT(*) c FROM tickets WHERE status NOT IN ('resolved','closed') AND ${NOT_DELETED}`)).rows[0].c };
    if (metric === 'sla_breached') return { value: (await query(`SELECT COUNT(*) c FROM tickets WHERE sla_breached=true AND ${NOT_DELETED}`)).rows[0].c };
    if (metric === 'resolved_today') return { value: (await query(`SELECT COUNT(*) c FROM tickets WHERE status IN ('resolved','closed') AND resolved_at::date=CURRENT_DATE`)).rows[0].c };
    return { value: (await query(`SELECT COUNT(*) c FROM tickets WHERE ${NOT_DELETED}`)).rows[0].c };
  }
  if (type === 'donut' || type === 'bar') {
    if (metric === 'by_status') {
      const r = await query(`SELECT status k, COUNT(*) v FROM tickets WHERE ${NOT_DELETED} GROUP BY status ORDER BY v DESC`);
      return { items: r.rows.map(x=>({label:statusName(x.k), value:parseInt(x.v), key:x.k})) };
    }
    if (metric === 'by_priority') {
      const r = await query(`SELECT priority k, COUNT(*) v FROM tickets WHERE ${NOT_DELETED} GROUP BY priority`);
      return { items: r.rows.map(x=>({label:prioName(x.k), value:parseInt(x.v), key:x.k})) };
    }
    if (metric === 'by_agent') {
      const r = await query(`SELECT u.name k, COUNT(*) v FROM tickets t JOIN users u ON u.id=t.assigned_to WHERE ${NOT_DELETED.replace(/is_deleted/g,'t.is_deleted')} GROUP BY u.name ORDER BY v DESC LIMIT 10`);
      return { items: r.rows.map(x=>({label:x.k, value:parseInt(x.v)})) };
    }
    if (metric === 'by_source') {
      const r = await query(`SELECT source k, COUNT(*) v FROM tickets WHERE ${NOT_DELETED} GROUP BY source ORDER BY v DESC`);
      return { items: r.rows.map(x=>({label:srcName(x.k), value:parseInt(x.v), key:x.k})) };
    }
  }
  if (type === 'line') {
    const days = cfg.days || 14;
    const r = await query(`SELECT created_at::date d, COUNT(*) v FROM tickets WHERE ${NOT_DELETED} AND created_at >= CURRENT_DATE - INTERVAL '${parseInt(days)} days' GROUP BY d ORDER BY d`);
    return { items: r.rows.map(x=>({label:x.d, value:parseInt(x.v)})) };
  }
  if (type === 'table') {
    if (metric === 'recent') {
      const r = await query(`SELECT id,number,subject,status,created_at FROM tickets WHERE ${NOT_DELETED} ORDER BY created_at DESC LIMIT 8`);
      return { rows: r.rows };
    }
    if (metric === 'top_requesters') {
      const r = await query(`SELECT requester_name,requester_email,COUNT(*) c FROM tickets WHERE ${NOT_DELETED} GROUP BY requester_name,requester_email ORDER BY c DESC LIMIT 8`);
      return { rows: r.rows };
    }
  }
  if (type === 'progress') {
    if (metric === 'resolve_rate') {
      const tot = parseInt((await query(`SELECT COUNT(*) c FROM tickets WHERE ${NOT_DELETED}`)).rows[0].c)||1;
      const res = parseInt((await query(`SELECT COUNT(*) c FROM tickets WHERE status IN ('resolved','closed') AND ${NOT_DELETED}`)).rows[0].c);
      return { value: Math.round(res/tot*100), label:`${res} из ${tot}` };
    }
    if (metric === 'sla_rate') {
      const tot = parseInt((await query(`SELECT COUNT(*) c FROM tickets WHERE status IN ('resolved','closed') AND ${NOT_DELETED}`)).rows[0].c)||1;
      const ok = parseInt((await query(`SELECT COUNT(*) c FROM tickets WHERE status IN ('resolved','closed') AND (sla_breached IS NULL OR sla_breached=false) AND ${NOT_DELETED}`)).rows[0].c);
      return { value: Math.round(ok/tot*100), label:`${ok} из ${tot}` };
    }
  }
  return { value: 0 };
}

async function inventoryMetric(type, metric, cfg) {
  if (type === 'counter') {
    if (metric === 'total') return { value: (await query(`SELECT COUNT(*) c FROM inventory_items`)).rows[0].c };
    if (metric === 'available') return { value: (await query(`SELECT COUNT(*) c FROM inventory_items WHERE status='available'`)).rows[0].c };
    if (metric === 'assigned') return { value: (await query(`SELECT COUNT(*) c FROM inventory_items WHERE status='assigned'`)).rows[0].c };
    if (metric === 'maintenance') return { value: (await query(`SELECT COUNT(*) c FROM inventory_items WHERE status='maintenance'`)).rows[0].c };
    if (metric === 'warranty_soon') return { value: (await query(`SELECT COUNT(*) c FROM inventory_items WHERE warranty_until IS NOT NULL AND warranty_until BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'`)).rows[0].c };
    return { value: (await query(`SELECT COUNT(*) c FROM inventory_items`)).rows[0].c };
  }
  if (type === 'donut' || type === 'bar') {
    if (metric === 'by_status') {
      const r = await query(`SELECT status k, COUNT(*) v FROM inventory_items GROUP BY status ORDER BY v DESC`);
      return { items: r.rows.map(x=>({label:invStatusName(x.k), value:parseInt(x.v), key:x.k})) };
    }
    if (metric === 'by_category') {
      const r = await query(`SELECT COALESCE(c.name,'Без категории') k, COUNT(*) v FROM inventory_items i LEFT JOIN inventory_categories c ON c.id=i.category_id GROUP BY c.name ORDER BY v DESC LIMIT 12`);
      return { items: r.rows.map(x=>({label:x.k, value:parseInt(x.v)})) };
    }
  }
  if (type === 'table' && metric === 'warranty_soon') {
    const r = await query(`SELECT name,warranty_until FROM inventory_items WHERE warranty_until IS NOT NULL AND warranty_until >= CURRENT_DATE ORDER BY warranty_until LIMIT 8`);
    return { rows: r.rows };
  }
  return { value: 0 };
}

async function mgmtMetric(type, sectionId, metric, cfg) {
  const sec = (await query(`SELECT * FROM mgmt_sections WHERE id=$1`,[sectionId])).rows[0];
  if (!sec) return { value: 0 };
  if (type === 'counter') {
    if (metric === 'expiring') {
      return { value: await countExpiring(sectionId, 30) };
    }
    if (metric === 'expired') {
      return { value: await countExpiring(sectionId, 30, true) };
    }
    return { value: (await query(`SELECT COUNT(*) c FROM mgmt_records WHERE section_id=$1`,[sectionId])).rows[0].c };
  }
  if (type === 'table' && metric === 'expiring') {
    const expF = (await query(`SELECT field_key FROM mgmt_fields WHERE section_id=$1 AND is_expiry=true LIMIT 1`,[sectionId])).rows[0];
    if (!expF) return { rows: [] };
    const recs = await query(`SELECT title,data FROM mgmt_records WHERE section_id=$1`,[sectionId]);
    const now=new Date(); const rows=[];
    for (const r of recs.rows) {
      const data = typeof r.data==='string'?JSON.parse(r.data):(r.data||{});
      const v = data[expF.field_key];
      if (v) { const d=new Date(v); if(!isNaN(d)&&d>=now) rows.push({ title:r.title, date:v, _d:d }); }
    }
    rows.sort((a,b)=>a._d-b._d);
    return { rows: rows.slice(0,8) };
  }
  return { value: (await query(`SELECT COUNT(*) c FROM mgmt_records WHERE section_id=$1`,[sectionId])).rows[0].c };
}

async function countExpiring(sectionId, days, expired=false) {
  const expFs = (await query(`SELECT field_key FROM mgmt_fields WHERE section_id=$1 AND is_expiry=true`,[sectionId])).rows;
  if (!expFs.length) return 0;
  const recs = await query(`SELECT data FROM mgmt_records WHERE section_id=$1`,[sectionId]);
  const now=new Date(); const limit=new Date(); limit.setDate(now.getDate()+days);
  let n=0;
  for (const r of recs.rows) {
    const data = typeof r.data==='string'?JSON.parse(r.data):(r.data||{});
    for (const f of expFs) {
      const v=data[f.field_key]; if(!v)continue;
      const d=new Date(v); if(isNaN(d))continue;
      if (expired) { if (d<now) n++; }
      else { if (d>=now && d<=limit) n++; }
    }
  }
  return n;
}

function statusName(s){return {open:'Открыт',in_progress:'В работе',waiting:'Ожидание',resolved:'Решён',closed:'Закрыт',planned:'Запланирован'}[s]||s;}
function prioName(p){return {low:'Низкий',medium:'Средний',high:'Высокий',critical:'Критический'}[p]||p;}
function srcName(s){return {web:'Веб',email:'Email',telegram:'Telegram',phone:'Телефон'}[s]||s;}
function invStatusName(s){return {available:'Свободно',assigned:'Выдано',maintenance:'Ремонт',retired:'Списано',lost:'Утеряно',reserved:'Резерв'}[s]||s;}

module.exports = { computeWidget };
