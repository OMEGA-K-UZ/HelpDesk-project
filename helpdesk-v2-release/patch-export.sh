#!/bin/bash
set -e
cd "$(dirname "$0")"
# определяем корень проекта: там где есть src/routes.js
if [ ! -f src/routes.js ]; then
  echo "❌ Запускай скрипт из корня проекта (где папка src/). Сейчас: $(pwd)"; exit 1
fi
echo "→ Проект: $(pwd)"

echo "→ 1/3 routes.js: добавляю роут /tickets/export..."
python3 - << 'PY'
f='src/routes.js'
s=open(f,encoding='utf-8').read()
if "/tickets/export" in s:
    print("  ⏭️  роут уже есть, пропускаю")
else:
    anchor="router.get('/tickets', requireAuth, async (req, res) => {"
    newroute = r'''router.get('/tickets/export', requireAuth, async (req, res) => {
  const { status, priority, assigned, search, category, department, sort='created_at', order='desc', from, to, ids, format='csv' } = req.query;
  const conds = []; const params = [];
  const add = v => { params.push(v); return `$${params.length}`; };
  if (ids) {
    const idList = String(ids).split(',').map(x=>parseInt(x)).filter(Boolean);
    if (idList.length) conds.push(`t.id = ANY(${add(idList)})`);
    else conds.push('false');
  } else {
    if (status === 'deleted') { conds.push(`t.is_deleted=true`); }
    else {
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
    if (search) { const sv = add(`%${search}%`); conds.push(`(t.subject ILIKE ${sv} OR t.requester_email ILIKE ${sv} OR t.number ILIKE ${sv} OR t.requester_name ILIKE ${sv})`); }
  }
  const where = conds.join(' AND ');
  const sorts = { created_at:'t.created_at',updated_at:'t.updated_at',priority:'t.priority',sla_due_at:'t.sla_due_at',number:'t.number' };
  const sortCol = sorts[sort]||'t.created_at';
  const sortDir = order==='asc'?'ASC':'DESC';
  const rows = (await query(`SELECT t.number,t.subject,t.requester_name,t.requester_email,t.status,t.priority,t.source,
      u.name as agent_name,c.name as category_name,d.name as dept_name,t.created_at,t.updated_at,t.resolved_at
      FROM tickets t LEFT JOIN users u ON u.id=t.assigned_to LEFT JOIN categories c ON c.id=t.category_id LEFT JOIN departments d ON d.id=t.department_id
      WHERE ${where} ORDER BY ${sortCol} ${sortDir}`, params)).rows;

  const stMap={open:'Открыт',in_progress:'В работе',waiting:'Ожидание',resolved:'Решён',closed:'Закрыт',planned:'Запланирован'};
  const prMap={low:'Низкий',medium:'Средний',high:'Высокий',urgent:'Срочный'};
  const fmtDate=d=>d?new Date(d).toLocaleString('ru-RU'):'';
  const headers=['Номер','Тема','Заявитель','Email','Статус','Приоритет','Источник','Исполнитель','Категория','Отдел','Создан','Обновлён','Решён'];
  const dataRows=rows.map(r=>[
    r.number, r.subject||'', r.requester_name||'', r.requester_email||'',
    stMap[r.status]||r.status||'', prMap[r.priority]||r.priority||'', r.source||'',
    r.agent_name||'', r.category_name||'', r.dept_name||'',
    fmtDate(r.created_at), fmtDate(r.updated_at), fmtDate(r.resolved_at)
  ]);
  const stamp=new Date().toISOString().slice(0,10);

  if (format==='xlsx') {
    let xml='<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
    xml+='<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">';
    xml+='<Worksheet ss:Name="Тикеты"><Table>';
    const esc=v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const row=cells=>'<Row>'+cells.map(c=>`<Cell><Data ss:Type="String">${esc(c)}</Data></Cell>`).join('')+'</Row>';
    xml+=row(headers);
    for(const r of dataRows) xml+=row(r);
    xml+='</Table></Worksheet></Workbook>';
    res.setHeader('Content-Type','application/vnd.ms-excel; charset=utf-8');
    res.setHeader('Content-Disposition',`attachment; filename="tickets-${stamp}.xls"`);
    return res.send('\ufeff'+xml);
  }

  // CSV (по умолчанию), разделитель ; для корректного открытия в Excel
  const csvCell=v=>{ v=String(v==null?'':v); return /[";\n]/.test(v) ? '"'+v.replace(/"/g,'""')+'"' : v; };
  const lines=[headers.map(csvCell).join(';'), ...dataRows.map(r=>r.map(csvCell).join(';'))];
  res.setHeader('Content-Type','text/csv; charset=utf-8');
  res.setHeader('Content-Disposition',`attachment; filename="tickets-${stamp}.csv"`);
  return res.send('\ufeff'+lines.join('\r\n'));
});

'''
    s=s.replace(anchor, newroute+anchor, 1)
    open(f,'w',encoding='utf-8').write(s); print("  ✅ роут добавлен")
PY

echo "→ 2/3 index.html: кнопка Экспорт в панель фильтров..."
python3 - << 'PY'
f='public/index.html'
s=open(f,encoding='utf-8').read()
if 'onclick="openExportMenu' in s:
    print("  ⏭️  кнопка уже есть, пропускаю")
else:
    old='<input class="search-box" placeholder="🔍 Поиск..." oninput="searchT(this.value)" style="margin-left:auto">'
    new='<input class="search-box" placeholder="🔍 Поиск..." oninput="searchT(this.value)" style="margin-left:auto">\n      <button class="btn btn-sm" style="border:1px solid var(--border)" onclick="openExportMenu(event)">⬇ Экспорт</button>'
    if old in s:
        s=s.replace(old,new,1); open(f,'w',encoding='utf-8').write(s); print("  ✅ кнопка добавлена")
    else:
        print("  ❌ не найдено поле поиска — пропускаю")
PY

echo "→ 3/3 app.js: функции экспорта..."
python3 - << 'PY'
f='public/app.js'
s=open(f,encoding='utf-8').read()
if 'function openExportMenu' in s:
    print("  ⏭️  функции уже есть, пропускаю")
else:
    anchor='let sT;function searchT(q){'
    addfn='''function buildExportQP(){
  let qp=`status=${tFilter==='me'?'all':tFilter}&sort=${tSort}&order=${tOrder}`;
  if(tSearch)qp+=`&search=${encodeURIComponent(tSearch)}`;
  if(tFilter==='me')qp+='&assigned=me';
  if(selectedTickets.size>0)qp+=`&ids=${[...selectedTickets].join(',')}`;
  return qp;
}
function doExport(format){
  const qp=buildExportQP()+`&format=${format}`;
  const n=selectedTickets.size;
  window.open(`/api/tickets/export?${qp}`,'_blank');
  toast(n>0?`Экспорт ${n} выбранных...`:'Экспорт по текущему фильтру...');
  closeExportMenu();
}
function openExportMenu(e){
  e.stopPropagation();
  closeExportMenu();
  const n=selectedTickets.size;
  const m=document.createElement('div');
  m.id='export-menu';
  m.style.cssText='position:fixed;background:var(--bg2);border:1px solid var(--border);border-radius:8px;box-shadow:0 6px 24px rgba(0,0,0,.3);z-index:9999;min-width:210px;overflow:hidden';
  const r=e.target.getBoundingClientRect();
  m.style.top=(r.bottom+6)+'px'; m.style.left=Math.max(8,r.right-210)+'px';
  const label=n>0?`Выбранные (${n})`:'По текущему фильтру';
  m.innerHTML=`<div style="padding:8px 14px;font-size:11px;color:var(--text3);border-bottom:1px solid var(--border)">${label}</div>`+
    `<div class="export-opt" onclick="doExport('csv')" style="padding:10px 14px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:8px">📄 CSV (для Excel)</div>`+
    `<div class="export-opt" onclick="doExport('xlsx')" style="padding:10px 14px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:8px">📊 Excel (.xls)</div>`;
  document.body.appendChild(m);
  m.querySelectorAll('.export-opt').forEach(o=>{o.onmouseenter=()=>o.style.background='var(--bg3)';o.onmouseleave=()=>o.style.background='';});
  setTimeout(()=>document.addEventListener('click',closeExportMenu,{once:true}),0);
}
function closeExportMenu(){const m=document.getElementById('export-menu');if(m)m.remove();}
let sT;function searchT(q){'''
    s=s.replace(anchor,addfn,1)
    open(f,'w',encoding='utf-8').write(s); print("  ✅ функции добавлены")
PY

echo ""
echo "→ Проверка синтаксиса..."
node -c src/routes.js && echo "  ✅ routes.js OK"
node -c public/app.js && echo "  ✅ app.js OK"
echo ""
echo "✅ Готово! Перезапусти: pm2 restart helpdesk  (или npm start), затем Ctrl+Shift+R"
