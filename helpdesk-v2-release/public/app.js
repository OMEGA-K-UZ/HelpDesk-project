const API='/api';
// ── ICON LIBRARY (однотонные SVG, наследуют currentColor) ──
const ICONS={
  dashboard:'<path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  ticket:'<path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7z"/><path d="M13 5v2M13 11v2M13 17v2"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><path d="M16 5a3.5 3.5 0 0 1 0 7M22 20c0-3-2-5-5-5.5"/>',
  book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z"/><path d="M4 19a2 2 0 0 0 2 2h13"/>',
  box:'<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  contacts:'<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="2.5"/><path d="M8 17c0-2 2-3 4-3s4 1 4 3"/><path d="M4 8h2M4 12h2M4 16h2"/>',
  folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>',
  chart:'<path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6"/><rect x="12" y="7" width="3" height="10"/><rect x="17" y="13" width="3" height="4"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9z"/><path d="M10.5 21a1.5 1.5 0 0 0 3 0"/>',
  palette:'<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1.2"/><circle cx="12" cy="8" r="1.2"/><circle cx="16" cy="10" r="1.2"/><circle cx="14" cy="14" r="1.2"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
  trash:'<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
  check:'<path d="M20 6L9 17l-5-5"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  inbox:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5 5h14l3 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6l3-7z"/>',
  refresh:'<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  hourglass:'<path d="M6 3h12M6 21h12M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  phone:'<path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"/>',
  send:'<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>',
  paperclip:'<path d="M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 6"/>',
  forward:'<path d="M15 17l5-5-5-5M4 18v-2a4 4 0 0 1 4-4h12"/>',
  copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  bold:'<path d="M7 4h7a4 4 0 0 1 0 8H7zM7 12h8a4 4 0 0 1 0 8H7z"/>',
  italic:'<path d="M19 4h-9M14 20H5M15 4L9 20"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  link:'<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M17 6l2 2M15 8l2 2"/>',
  doc:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  building:'<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
  back:'<path d="M19 12H5M12 19l-7-7 7-7"/>',
  fwd:'<path d="M5 12h14M12 5l7 7-7 7"/>',
  puzzle:'<path d="M4 7h3a2 2 0 1 0 4 0h3v3a2 2 0 1 1 0 4v3h-3a2 2 0 1 0-4 0H4v-3a2 2 0 1 1 0-4V7z"/>',
  warning:'<path d="M12 3l9 16H3l9-16z"/><path d="M12 10v4M12 17h.01"/>',
  caret:'<path d="M9 6l6 6-6 6"/>',
  briefcase:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  flag:'<path d="M4 21V4M4 4h13l-2 4 2 4H4"/>',
  pin:'<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'
};
function icon(name,size=18){const p=ICONS[name]||ICONS.grid;return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;}

// Глобальная замена эмодзи на однотонные SVG в DOM
const EMOJI_MAP={
 '🗑':'trash','✏️':'edit','✏':'edit','💾':'check','✅':'check','✓':'check','✕':'plus','❌':'warning',
 '🔍':'search','📦':'box','🗂':'folder','📁':'folder','📂':'folder','📋':'doc','🎫':'ticket','📧':'mail','✈️':'send','✈':'send',
 '📎':'paperclip','📤':'send','📥':'inbox','📬':'inbox','🔄':'refresh','🔒':'lock','📈':'chart','📊':'chart','🏷':'flag','🏁':'flag','🏆':'flag',
 '📞':'phone','🔔':'bell','↩':'refresh','📚':'book','👥':'users','👤':'user','⏰':'clock','🕐':'clock','📭':'inbox','⏳':'hourglass','📅':'calendar',
 '⚡':'clock','🌐':'globe','⚙️':'settings','⚙':'settings','📝':'edit','🔧':'settings','🗄':'box','📌':'pin','🛡':'lock','👁':'user','🖼':'doc','🔌':'settings',
 '⏱':'clock','📇':'contacts','⚠️':'warning','⚠':'warning','🧩':'puzzle','↔':'fwd','➕':'plus','📨':'forward','🏢':'building','🔑':'key','＋':'plus',
 '📑':'doc','📜':'doc','💻':'box','🖥':'box','🖨':'box','🔐':'lock','🌍':'globe','🌎':'globe','🗃':'box','💳':'doc','🧾':'doc','🏬':'building','☎':'phone','📲':'phone','🔗':'link','🛰':'globe','💿':'box','💽':'box','🗳':'box','🟢':'flag','🟡':'flag','🟠':'flag','🔴':'flag','→':'fwd','←':'back','▸':'caret'
};
function deEmojify(root){
 const re=/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\uFE0F\u{FF0B}]/gu;
 const walk=document.createTreeWalker(root||document.body,NodeFilter.SHOW_TEXT,null);
 const nodes=[];let n;while(n=walk.nextNode())nodes.push(n);
 nodes.forEach(node=>{
  if(!node.nodeValue)return;
  if(re.test(node.nodeValue)){
   re.lastIndex=0;
   const frag=document.createDocumentFragment();
   let last=0,m;
   while((m=re.exec(node.nodeValue))){
    const before=node.nodeValue.slice(last,m.index);
    if(before)frag.appendChild(document.createTextNode(before));
    const name=EMOJI_MAP[m[0]];
    if(name){const span=document.createElement('span');span.innerHTML=icon(name,15);frag.appendChild(span.firstChild);}
    last=m.index+m[0].length;
   }
   const rest=node.nodeValue.slice(last);
   if(rest)frag.appendChild(document.createTextNode(rest));
   node.parentNode.replaceChild(frag,node);
  }
 });
}

function applyIcons(root){
  (root||document).querySelectorAll('[data-ic]').forEach(el=>{
    const n=el.getAttribute('data-ic');
    if(el.dataset.icDone==='1')return;
    el.innerHTML=icon(n, el.classList.contains('ico')?18:17);
    el.dataset.icDone='1';
  });
  try{deEmojify(root||document.querySelector('.content'));}catch(e){}
}

let me=null, currentTicketId=null, replyInternal=false;
let tPage=1,tFilter='all',tSearch='',tSort='created_at',tOrder='desc';
let invPage=1,invFilter='all',invSearch='';
let kbPub=false,kbSearch='',kbCatFilter='';
let editUserId=null,editInvId=null,editKbId=null;
let dashTab='tickets',dashFrom=null,dashTo=null;
let aFrom=null,aTo=null;
let settingsData={};

async function api(method,path,body,fd){
  const o={method,credentials:'include',headers:fd?{}:{'Content-Type':'application/json'}};
  if(body)o.body=fd?body:JSON.stringify(body);
  const r=await fetch(API+path,o);
  if(r.headers.get('content-type')?.includes('application/json'))return r.json();
  return r;
}
function toast(m,t='ok'){const e=document.getElementById('toast');const i=document.createElement('div');i.className='toast-item';i.innerHTML=`<span>${t==='ok'?'✅':t==='err'?'❌':'ℹ️'}</span><span>${m}</span>`;e.appendChild(i);setTimeout(()=>i.remove(),4000);}
function openM(id){document.getElementById(id).classList.add('open');}
function closeM(id){document.getElementById(id).classList.remove('open');}
function sBadge(s){const m={open:'Открыт',in_progress:'В работе',waiting:'Ожидание',resolved:'Решён',closed:'Закрыт',planned:'Запланирован'};return `<span class="badge b-${s}"><span class="b-dot"></span>${m[s]||s}</span>`;}
function pBadge(p){const m={low:'Низкий',medium:'Средний',high:'Высокий',critical:'Критический'};return `<span class="badge b-${p}"><span class="b-dot"></span>${m[p]||p}</span>`;}
function fmtD(d){if(!d)return '—';return new Date(d).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'});}
function fmtDS(d){if(!d)return '—';return new Date(d).toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'2-digit'});}
function ini(n){return (n||'?').split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase();}
function slaCol(due,br){if(br)return 'var(--danger)';if(!due)return 'var(--text3)';const h=(new Date(due)-Date.now())/3.6e6;return h<1?'var(--danger)':h<4?'var(--warning)':'var(--success)';}

// ── AUTH ──
async function login(){
  const r=await api('POST','/auth/login',{email:document.getElementById('l-email').value,password:document.getElementById('l-pass').value});
  if(r.success){me=r.user;initApp();}
  else document.getElementById('login-alert').innerHTML=`<div class="alert alert-err">${r.error}</div>`;
}
async function logout(){await api('POST','/auth/logout');location.reload();}
async function checkAuth(){await applyBranding();const r=await api('GET','/auth/me');if(r.id){me=r;initApp();}}
let _branding=null;
async function applyBranding(){
  try{
    const b=await api('GET','/branding');
    _branding=b;
    const name=b.company_name||'HelpDesk';
    const logo=b.company_logo||'';
    // Login screen
    const lt=document.getElementById('login-title');if(lt)lt.textContent=name;
    const ll=document.getElementById('login-logo');if(ll)ll.innerHTML=logo?`<img src="${logo}" style="width:100%;height:100%;object-fit:contain;border-radius:14px">`:icon('ticket',30);
    // Sidebar
    const sl=document.getElementById('sb-logo');if(sl)sl.innerHTML=logo?`<img src="${logo}" style="width:100%;height:100%;object-fit:contain;border-radius:9px">`:icon('ticket',18);
    const sn=document.getElementById('sb-brand-name');if(sn)sn.textContent=name;
    // Browser tab title
    document.title=name;
  }catch(e){}
}
function initApp(){
  document.getElementById('login-page').style.display='none';
  document.getElementById('app').style.display='block';
  document.getElementById('sb-name').textContent=me.name;
  document.getElementById('sb-role').textContent={admin:'Администратор',agent:'Агент',viewer:'Просмотр'}[me.role];
  document.getElementById('sb-av').textContent=ini(me.name);
  document.getElementById('btn-new-ticket').style.display=me.role!=='viewer'?'flex':'none';
  document.querySelector('[data-st=me]').style.display=me.role!=='viewer'?'inline-block':'none';
  if(me.role!=='admin')document.querySelectorAll('.admin-only').forEach(e=>e.style.display='none');
  applyBranding();
  applyIcons();
  try{
    const obs=new MutationObserver(muts=>{
      for(const m of muts){for(const node of m.addedNodes){if(node.nodeType===1){clearTimeout(window._deTimer);window._deTimer=setTimeout(()=>{deEmojify(document.querySelector('.content'));applyIcons();},60);return;}}}
    });
    obs.observe(document.querySelector('.content'),{childList:true,subtree:true});
  }catch(e){}
  loadNotif();setInterval(loadNotif,30000);
  setTimeout(()=>{try{deEmojify(document.getElementById('app'));applyIcons();}catch(e){}},100);
  setInterval(()=>{ if(document.getElementById('view-tickets').classList.contains('active') && selectedTickets.size===0) loadTickets(); }, 30000);
  const m=new Date();dashFrom=new Date(m.getFullYear(),m.getMonth(),m.getDate());dashTo=new Date();
  setPeriod('today');
  nav('dashboard');
}

// ── NAV ──
const navT={dashboard:'Дашборд',customdash:'Мои дашборды',tickets:'Тикеты',td:'Тикет',kb:'База знаний',inventory:'Инвентаризация',contacts:'Пользователи',mgmt:'Управление',analytics:'Отчёты и аналитика',users:'Агенты',settings:'Настройки',profile:'Профиль'};
let navHistory=[], navPos=-1, navSilent=false;
function nav(v){
  if(!navSilent){
    // truncate forward history, push new
    navHistory=navHistory.slice(0,navPos+1);
    if(navHistory[navPos]!==v){navHistory.push(v);navPos++;}
    updateNavButtons();
  }
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.sb-item').forEach(x=>x.classList.remove('active'));
  document.getElementById('view-'+v)?.classList.add('active');
  document.querySelector(`.sb-item[data-nav="${v}"]`)?.classList.add('active');
  document.getElementById('tb-title').textContent=navT[v]||v;
  if(v==='dashboard')loadDash();
  else if(v==='tickets')loadTickets();
  else if(v==='kb'){loadKbCats();loadKbArt();}
  else if(v==='inventory')loadInv();
  else if(v==='contacts')loadContacts();
  else if(v==='mgmt')loadMgmt();
  else if(v==='customdash')loadCustomDash();
  else if(v==='analytics'){const m=new Date();aFrom=new Date(m.getFullYear(),m.getMonth(),1);aTo=new Date();loadAnalytics();}
  else if(v==='users')loadUsers();
  else if(v==='settings')loadSettings();
  else if(v==='profile'){document.getElementById('p-name').value=me.name;}
}
function updateNavButtons(){
  const b=document.getElementById('nav-back'),f=document.getElementById('nav-fwd');
  if(b)b.style.opacity=navPos>0?'1':'.4';
  if(f)f.style.opacity=navPos<navHistory.length-1?'1':'.4';
}
function navBack(){if(navPos>0){navPos--;navSilent=true;nav(navHistory[navPos]);navSilent=false;updateNavButtons();}}
function navForward(){if(navPos<navHistory.length-1){navPos++;navSilent=true;nav(navHistory[navPos]);navSilent=false;updateNavButtons();}}

// ── DASHBOARD ──
function setDashTab(t,btn){dashTab=t;document.querySelectorAll('.dash-tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
  const pq=document.querySelector('#view-dashboard .period-quick'),pf=document.getElementById('period-from'),pt=document.getElementById('period-to');
  const hide=(t==='mgmt'||t==='inventory');
  if(pq)pq.style.visibility=hide?'hidden':'visible';
  if(pf)pf.parentElement.style.visibility=hide?'hidden':'visible';
  loadDash();}
function setPeriod(p,btn){
  if(btn){document.querySelectorAll('#view-dashboard .period-quick .filter-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');}
  const now=new Date();let from;
  if(p==='today')from=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  else if(p==='week'){from=new Date(now);from.setDate(now.getDate()-7);}
  else if(p==='month')from=new Date(now.getFullYear(),now.getMonth(),1);
  else if(p==='quarter'){from=new Date(now);from.setMonth(now.getMonth()-3);}
  else if(p==='year')from=new Date(now.getFullYear(),0,1);
  dashFrom=from;dashTo=now;
  document.getElementById('period-from').value=from.toISOString().slice(0,10);
  document.getElementById('period-to').value=now.toISOString().slice(0,10);
  loadDash();
}
function customPeriod(){
  const f=document.getElementById('period-from').value,t=document.getElementById('period-to').value;
  if(f)dashFrom=new Date(f);if(t)dashTo=new Date(t);
  document.querySelectorAll('#view-dashboard .period-quick .filter-btn').forEach(b=>b.classList.remove('active'));
  loadDash();
}
async function loadDash(){
  const qp=`from=${dashFrom.toISOString().slice(0,10)}&to=${dashTo.toISOString().slice(0,10)}`;
  const c=document.getElementById('dash-content');
  if(dashTab==='mgmt'){
    c.innerHTML='<div class="empty"><div class="e-ico">⏳</div>Загрузка...</div>';
    const stats=await api('GET','/mgmt/stats')||[];
    c.innerHTML=renderDashMgmt(stats);
    return;
  }
  const d=await api('GET',`/dashboard?${qp}`);
  if(!d.stats)return;
  if(dashTab==='tickets')c.innerHTML=renderDashTickets(d);
  else if(dashTab==='inventory')c.innerHTML=renderDashInv(d);
  else c.innerHTML=renderDashAnalytics(d);
  // animate bars
  setTimeout(()=>document.querySelectorAll('.bar-fill,.col-fill').forEach(b=>{if(b.dataset.w)b.style.width=b.dataset.w;if(b.dataset.h)b.style.height=b.dataset.h;}),50);
  const s=d.stats;document.getElementById('sb-open').textContent=s.open;document.getElementById('sb-open').style.display=s.open>0?'inline':'none';
}
function renderDashMgmt(stats){
  if(!stats.length)return '<div class="empty"><div class="e-ico">🗂</div>Нет разделов в «Управлении». Создайте раздел и добавьте записи.</div>';
  const palette=['#4f8ef7','#22c55e','#f59e0b','#a855f7','#14b8a6','#ec4899','#ef4444','#38bdf8','#8b5cf6','#64748b'];
  const cards=stats.map((s,idx)=>{
    const col=s.color||palette[idx%palette.length];
    return `<div class="inv-card" onclick="openSection(${s.id})">
      <div class="inv-card-glow" style="background:${col}"></div>
      <div class="inv-card-ico" style="background:${col}22;color:${col}">${mgmtIcon(s.icon)}</div>
      <div class="inv-card-num">${s.total}</div>
      <div class="inv-card-name">${s.name}</div>
      ${s.has_expiry?`<div class="inv-card-stats">
        <div class="inv-card-stat" style="color:var(--warning)"><span class="n">${s.expiring_soon}</span>истекает (30 дн)</div>
        <div class="inv-card-stat" style="color:var(--danger)"><span class="n">${s.expired}</span>истекло</div>
      </div>`:'<div class="inv-card-stats"><div class="inv-card-stat" style="color:var(--text3)">записей всего</div></div>'}
    </div>`;
  }).join('');
  const totalRec=stats.reduce((a,b)=>a+b.total,0);
  const totalSoon=stats.reduce((a,b)=>a+b.expiring_soon,0);
  const totalExp=stats.reduce((a,b)=>a+b.expired,0);
  return `<div class="stats-grid">
    <div class="stat-card c-blue"><div class="stat-top"><div class="stat-lbl">Всего записей</div><div class="stat-ico">🗂</div></div><div class="stat-val">${totalRec}</div></div>
    <div class="stat-card c-orange"><div class="stat-top"><div class="stat-lbl">Истекает (30 дней)</div><div class="stat-ico">⏰</div></div><div class="stat-val">${totalSoon}</div></div>
    <div class="stat-card c-red"><div class="stat-top"><div class="stat-lbl">Уже истекло</div><div class="stat-ico">🚨</div></div><div class="stat-val">${totalExp}</div></div>
    <div class="stat-card c-purple"><div class="stat-top"><div class="stat-lbl">Разделов</div><div class="stat-ico">📂</div></div><div class="stat-val">${stats.length}</div></div>
  </div>
  <div class="card-head" style="margin-bottom:14px">🗂 Разделы «Управления»</div>
  <div class="inv-dash-grid">${cards}</div>`;
}
function renderDashTickets(d){
  const s=d.stats;
  const statuses=[
    {k:'open',l:'Открытые',i:'📬',c:'c-blue'},{k:'in_progress',l:'В работе',i:'🔄',c:'c-orange'},
    {k:'waiting',l:'Ожидание',i:'⏳',c:'c-purple'},{k:'resolved',l:'Решённые',i:'✅',c:'c-green'},
    {k:'closed',l:'Закрытые',i:'🔒',c:'c-teal'},{k:'planned',l:'Запланировано',i:'📅',c:'c-blue'}
  ];
  let cards=statuses.map(st=>`<div class="stat-card ${st.c}" onclick="nav('tickets');setTimeout(()=>document.querySelector('#view-tickets .filter-btn[data-st=${st.k}]')?.click(),100)">
    <div class="stat-top"><div class="stat-lbl">${st.l}</div><div class="stat-ico">${st.i}</div></div>
    <div class="stat-val">${s[st.k]||0}</div></div>`).join('');
  cards+=`<div class="stat-card c-red"><div class="stat-top"><div class="stat-lbl">Нарушений SLA</div><div class="stat-ico">🚨</div></div><div class="stat-val">${s.sla_breached||0}</div></div>`;
  
  // Priority donut
  const prioColors={low:'#22c55e',medium:'#f59e0b',high:'#ef4444',critical:'#dc2626'};
  const prioNames={low:'Низкий',medium:'Средний',high:'Высокий',critical:'Критический'};
  const prioTotal=(d.byPriority||[]).reduce((a,b)=>a+parseInt(b.count),0)||1;
  const donut=renderDonut(d.byPriority,prioColors,prioNames,prioTotal,'priority');
  
  // Daily chart
  const maxDay=Math.max(...(d.dailyChart||[]).map(x=>parseInt(x.count)),1);
  const cols=(d.dailyChart||[]).map(x=>`<div class="col-bar"><div class="col-fill" data-h="${Math.round(x.count/maxDay*120)}px" style="height:2px"></div><div class="col-lbl">${new Date(x.day).toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'})}</div></div>`).join('');

  return `<div class="stats-grid">${cards}</div>
  <div class="grid-2" style="margin-bottom:18px">
    <div class="card"><div class="card-head">⚡ Приоритеты активных</div><div class="donut-wrap">${donut}</div></div>
    <div class="card"><div class="card-head">📈 Динамика за период</div>${cols?`<div class="col-chart">${cols}</div>`:'<div class="empty"><div class="e-ico">📊</div>Нет данных за период</div>'}</div>
  </div>
  <div class="grid-2">
    <div class="card"><div class="card-head">🚨 Нарушения SLA</div>${(d.slaBreached||[]).length?d.slaBreached.map(t=>`<div class="info-row" style="cursor:pointer" onclick="openTicket(${t.id})"><div><div style="font-size:13px;font-weight:600">#${t.number}</div><div style="font-size:11px;color:var(--text3)">${t.subject.substring(0,42)}</div></div>${pBadge(t.priority)}</div>`).join(''):'<div style="color:var(--text3);font-size:13px;padding:8px 0">Нарушений нет ✅</div>'}</div>
    <div class="card"><div class="card-head">🕐 Последние тикеты</div>${(d.recent||[]).map(t=>`<div class="info-row" style="cursor:pointer" onclick="openTicket(${t.id})"><div><div style="font-size:13px;font-weight:600">#${t.number} ${t.subject.substring(0,32)}</div><div style="font-size:11px;color:var(--text3)">${fmtD(t.created_at)}</div></div>${sBadge(t.status)}</div>`).join('')||'<div style="color:var(--text3);font-size:13px">Нет тикетов</div>'}</div>
  </div>`;
}
function renderDashInv(d){
  const palette=['#4f8ef7','#6366f1','#14b8a6','#f59e0b','#22c55e','#8b5cf6','#ef4444','#ec4899','#94a3b8','#64748b'];
  const cards=(d.invStats||[]).map((c,idx)=>{
    const col=c.color||palette[idx%palette.length];
    return `<div class="inv-card" onclick="nav('inventory')">
      <div class="inv-card-glow" style="background:${col}"></div>
      <div class="inv-card-ico" style="background:${col}22;color:${col}">${c.icon||'📦'}</div>
      <div class="inv-card-num">${c.total||0}</div>
      <div class="inv-card-name">${c.name}</div>
      <div class="inv-card-stats">
        <div class="inv-card-stat" style="color:var(--success)"><span class="n">${c.available||0}</span>свободно</div>
        <div class="inv-card-stat" style="color:var(--warning)"><span class="n">${c.assigned||0}</span>выдано</div>
        <div class="inv-card-stat" style="color:var(--info)"><span class="n">${c.maintenance||0}</span>ремонт</div>
      </div>
    </div>`;
  }).join('');
  const totalItems=(d.invStats||[]).reduce((a,b)=>a+parseInt(b.total||0),0);
  const totalAvail=(d.invStats||[]).reduce((a,b)=>a+parseInt(b.available||0),0);
  const totalAssigned=(d.invStats||[]).reduce((a,b)=>a+parseInt(b.assigned||0),0);
  return `<div class="stats-grid">
    <div class="stat-card c-blue"><div class="stat-top"><div class="stat-lbl">Всего единиц</div><div class="stat-ico">📦</div></div><div class="stat-val">${totalItems}</div></div>
    <div class="stat-card c-green"><div class="stat-top"><div class="stat-lbl">Свободно</div><div class="stat-ico">✅</div></div><div class="stat-val">${totalAvail}</div></div>
    <div class="stat-card c-orange"><div class="stat-top"><div class="stat-lbl">Выдано</div><div class="stat-ico">👤</div></div><div class="stat-val">${totalAssigned}</div></div>
    <div class="stat-card c-purple"><div class="stat-top"><div class="stat-lbl">Категорий</div><div class="stat-ico">🏷</div></div><div class="stat-val">${(d.invStats||[]).length}</div></div>
  </div>
  <div class="card-head" style="margin-bottom:14px">📦 Оргтехника по категориям</div>
  <div class="inv-dash-grid">${cards||'<div class="empty"><div class="e-ico">📦</div>Нет техники</div>'}</div>`;
}
function renderDashAnalytics(d){
  const s=d.stats;
  const resolveRate=s.period_total>0?Math.round(s.period_resolved/s.period_total*100):0;
  const agentsBars=renderBars((d.agentStats||[]).filter(a=>parseInt(a.resolved)>0).map(a=>({label:a.name,value:parseInt(a.resolved),color:'var(--accent)'})));
  return `<div class="stats-grid">
    <div class="stat-card c-blue"><div class="stat-top"><div class="stat-lbl">Заявок за период</div><div class="stat-ico">🎫</div></div><div class="stat-val">${s.period_total||0}</div></div>
    <div class="stat-card c-green"><div class="stat-top"><div class="stat-lbl">Решено</div><div class="stat-ico">✅</div></div><div class="stat-val">${s.period_resolved||0}</div><div class="stat-sub">${resolveRate}% решаемость</div></div>
    <div class="stat-card c-orange"><div class="stat-top"><div class="stat-lbl">Ср. время ответа</div><div class="stat-ico">⚡</div></div><div class="stat-val">${s.avg_response||'—'}<span style="font-size:16px">ч</span></div></div>
    <div class="stat-card c-purple"><div class="stat-top"><div class="stat-lbl">Ср. время решения</div><div class="stat-ico">🏁</div></div><div class="stat-val">${s.avg_resolve||'—'}<span style="font-size:16px">ч</span></div></div>
  </div>
  <div class="card"><div class="card-head">🏆 Рейтинг агентов (решено за период)</div>${agentsBars||'<div style="color:var(--text3);font-size:13px">Нет данных</div>'}</div>`;
}
function renderDonut(data,colors,names,total,key){
  let offset=0;const r=54,circ=2*Math.PI*r;
  const segs=(data||[]).map(d=>{
    const pct=parseInt(d.count)/total;const len=pct*circ;
    const seg=`<circle cx="65" cy="65" r="${r}" fill="none" stroke="${colors[d[key]]||'#666'}" stroke-width="16" stroke-dasharray="${len} ${circ-len}" stroke-dashoffset="${-offset}"/>`;
    offset+=len;return seg;
  }).join('');
  const legend=(data||[]).map(d=>`<div class="legend-item"><span class="legend-dot" style="background:${colors[d[key]]||'#666'}"></span>${names[d[key]]||d[key]}<span class="legend-val">${d.count}</span></div>`).join('');
  return `<div class="donut"><svg width="130" height="130">${segs}</svg><div class="donut-center"><div class="num">${total}</div><div class="lbl">всего</div></div></div><div class="donut-legend">${legend||'<span style="color:var(--text3)">Нет данных</span>'}</div>`;
}
function renderBars(items){
  const max=Math.max(...items.map(i=>i.value),1);
  return `<div class="bars">${items.map(i=>`<div class="bar-row"><div class="bar-lbl">${i.label}</div><div class="bar-track"><div class="bar-fill" data-w="${Math.round(i.value/max*100)}%" style="width:0;background:${i.color||'var(--accent)'}"></div></div><div class="bar-val">${i.value}</div></div>`).join('')}</div>`;
}

// ── TICKETS ──
let selectedTickets=new Set();
let lastTicketList=[];
async function loadTickets(){
  let qp=`page=${tPage}&status=${tFilter==='me'?'all':tFilter}&sort=${tSort}&order=${tOrder}`;
  if(tSearch)qp+=`&search=${encodeURIComponent(tSearch)}`;
  if(tFilter==='me')qp+='&assigned=me';
  const d=await api('GET',`/tickets?${qp}`);
  lastTicketList=d.tickets||[];
  const tb=document.getElementById('t-tbody');
  const isTrash=tFilter==='deleted';
  if(!d.tickets?.length){tb.innerHTML=`<tr><td colspan="9"><div class="empty"><div class="e-ico">${isTrash?'🗑':'📭'}</div>${isTrash?'Корзина пуста':'Тикетов нет'}</div></td></tr>`;document.getElementById('t-pag').innerHTML='';renderBulkBar();return;}
  const si={email:'📧',telegram:'✈️',web:'🌐',phone:'📞'};
  tb.innerHTML=d.tickets.map(t=>`<tr class="${selectedTickets.has(t.id)?'row-sel':''}" data-tid="${t.id}">
    <td onclick="event.stopPropagation();toggleSel(${t.id},event)" style="width:36px;text-align:center"><input type="checkbox" class="t-chk" ${selectedTickets.has(t.id)?'checked':''} onclick="event.stopPropagation();toggleSel(${t.id},event)"></td>
    <td onclick="openTicket(${t.id})"><span class="mono" style="font-size:12px;color:var(--text2)">#${t.number}</span> <span style="font-size:11px">${si[t.source]||'🌐'}</span></td>
    <td onclick="openTicket(${t.id})"><div style="font-weight:600;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;align-items:center;gap:6px">${(t.has_new_reply && (me.role==='admin' || t.assigned_to===me.id))?'<span class="new-dot" title="Новый ответ"></span><span title="Новый ответ">🔔</span>':''}<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.subject}</span></div>${t.category_name?`<span style="font-size:11px;color:var(--text3)">${t.category_name}</span>`:''}</td>
    <td onclick="openTicket(${t.id})"><div style="font-size:13px">${t.requester_name||'—'}</div><div style="font-size:11px;color:var(--text3)">${t.requester_email||''}</div></td>
    <td onclick="openTicket(${t.id})">${pBadge(t.priority)}</td>
    <td onclick="openTicket(${t.id})">${sBadge(t.status)}</td>
    <td onclick="openTicket(${t.id})">${t.agent_name?`<div style="display:flex;align-items:center;gap:6px"><div class="avatar sm">${ini(t.agent_name)}</div><span style="font-size:12px">${t.agent_name}</span></div>`:'<span style="color:var(--text3)">—</span>'}</td>
    <td onclick="openTicket(${t.id})" style="font-size:12px;color:var(--text2);white-space:nowrap">${fmtD(t.created_at)}</td>
    <td style="white-space:nowrap">${isTrash?`<button class="btn btn-success btn-icon btn-sm" title="Восстановить" onclick="event.stopPropagation();restoreTicket(${t.id})">↩</button> <button class="btn btn-danger btn-icon btn-sm" title="Удалить навсегда" onclick="event.stopPropagation();permDeleteTicket(${t.id})">✕</button>`:`<button class="btn btn-danger btn-icon btn-sm" title="В корзину" onclick="event.stopPropagation();delTicket(${t.id})">🗑</button>`}</td>
  </tr>`).join('');
  const pg=document.getElementById('t-pag');
  if(d.pages<=1){pg.innerHTML=`<span>Всего: ${d.total}</span>`;}
  else{let btns='';for(let i=1;i<=Math.min(d.pages,7);i++)btns+=`<button class="page-btn${i===tPage?' active':''}" onclick="tPage=${i};loadTickets()">${i}</button>`;
  pg.innerHTML=`<span>Всего: ${d.total}</span><div class="page-btns"><button class="page-btn" onclick="if(tPage>1){tPage--;loadTickets()}" ${tPage===1?'disabled':''}>‹</button>${btns}<button class="page-btn" onclick="if(tPage<${d.pages}){tPage++;loadTickets()}" ${tPage===d.pages?'disabled':''}>›</button></div>`;}
  renderBulkBar();
}
function toggleSel(id,e){if(e)e.stopPropagation();if(selectedTickets.has(id))selectedTickets.delete(id);else selectedTickets.add(id);const row=document.querySelector(`tr[data-tid="${id}"]`);if(row){row.classList.toggle('row-sel',selectedTickets.has(id));const chk=row.querySelector('.t-chk');if(chk)chk.checked=selectedTickets.has(id);}renderBulkBar();}
function toggleSelAll(){const allIds=lastTicketList.map(t=>t.id);const allSel=allIds.every(id=>selectedTickets.has(id));if(allSel)allIds.forEach(id=>selectedTickets.delete(id));else allIds.forEach(id=>selectedTickets.add(id));loadTickets();}
function clearSel(){selectedTickets.clear();loadTickets();}
function renderBulkBar(){
  let bar=document.getElementById('bulk-bar');
  if(!bar){bar=document.createElement('div');bar.id='bulk-bar';bar.className='bulk-bar';document.getElementById('view-tickets').insertBefore(bar,document.querySelector('#view-tickets .table-wrap'));}
  const n=selectedTickets.size;
  if(n===0){bar.style.display='none';return;}
  bar.style.display='flex';
  const isTrash=tFilter==='deleted';
  bar.innerHTML=`<span style="font-weight:600">Выбрано: ${n}</span>
    ${isTrash?`
      <button class="btn btn-success btn-sm" onclick="bulkAction('restore')">↩ Восстановить</button>
      <button class="btn btn-danger btn-sm" onclick="bulkAction('permanent_delete')">✕ Удалить навсегда</button>
    `:`
      <select id="bulk-status" class="search-box" style="width:auto" onchange="if(this.value){bulkAction('status',this.value);this.value=''}">
        <option value="">Сменить статус…</option>
        <option value="open">📬 Открыт</option><option value="in_progress">🔄 В работе</option>
        <option value="waiting">⏳ Ожидание</option><option value="resolved">✅ Решён</option>
        <option value="closed">🔒 Закрыт</option><option value="planned">📅 Запланирован</option>
      </select>
      <select id="bulk-prio" class="search-box" style="width:auto" onchange="if(this.value){bulkAction('priority',this.value);this.value=''}">
        <option value="">Приоритет…</option>
        <option value="low">🟢 Низкий</option><option value="medium">🟡 Средний</option>
        <option value="high">🟠 Высокий</option><option value="critical">🔴 Критический</option>
      </select>
      <button class="btn btn-danger btn-sm" onclick="bulkAction('delete')">🗑 В корзину</button>
    `}
    <button class="btn btn-ghost btn-sm" onclick="clearSel()" style="margin-left:auto">✕ Снять выделение</button>`;
}
async function bulkAction(action,value){
  const ids=[...selectedTickets];
  if(!ids.length)return;
  if(action==='permanent_delete'&&!confirm(`Удалить НАВСЕГДА ${ids.length} тикетов? Это необратимо.`))return;
  if(action==='delete'&&!confirm(`Переместить ${ids.length} тикетов в корзину?`))return;
  const r=await api('POST','/tickets/bulk',{ids,action,value});
  if(r.success){toast(`Готово: ${r.count} тикетов`);selectedTickets.clear();loadTickets();}
  else toast(r.error||'Ошибка','err');
}
async function delTicket(id){if(!confirm('Переместить тикет в корзину?'))return;const r=await api('DELETE',`/tickets/${id}`);if(r.success){toast('В корзине');loadTickets();}}
async function restoreTicket(id){const r=await api('POST',`/tickets/${id}/restore`);if(r.success){toast('Восстановлен');loadTickets();}}
async function permDeleteTicket(id){if(!confirm('Удалить тикет НАВСЕГДА? Необратимо.'))return;const r=await api('DELETE',`/tickets/${id}/permanent`);if(r.success){toast('Удалён навсегда');loadTickets();}else toast(r.error||'Ошибка','err');}
function setTF(f,btn){tFilter=f;tPage=1;selectedTickets.clear();document.querySelectorAll('#view-tickets .filter-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');loadTickets();}
let sT;function searchT(q){clearTimeout(sT);sT=setTimeout(()=>{tSearch=q;tPage=1;loadTickets();},350);}
function sortT(c){if(tSort===c)tOrder=tOrder==='asc'?'desc':'asc';else{tSort=c;tOrder='desc';}loadTickets();}

async function openTicket(id){
  currentTicketId=id;
  ccEmails=[];
  const repCc=document.getElementById('rep-cc-list');if(repCc)repCc.innerHTML='';
  const d=await api('GET',`/tickets/${id}`);
  if(!d.ticket)return;const t=d.ticket;
  nav('td');document.getElementById('tb-title').textContent=`#${t.number}`;
  document.getElementById('td-title').textContent=`#${t.number}: ${t.subject}`;
  document.getElementById('td-sb').innerHTML=sBadge(t.status);
  document.getElementById('td-pb').innerHTML=pBadge(t.priority);
  document.getElementById('td-desc').textContent=t.description||'Описание не указано';
  document.getElementById('td-status').value=t.status;
  document.getElementById('td-priority').value=t.priority;
  document.getElementById('td-agent').innerHTML='<option value="">— Не назначен —</option>'+d.agents.map(a=>`<option value="${a.id}" ${t.assigned_to==a.id?'selected':''}>${a.name}</option>`).join('');
  document.getElementById('td-cat').innerHTML='<option value="">— Без категории —</option>'+d.categories.map(c=>`<option value="${c.id}" ${t.category_id==c.id?'selected':''}>${c.icon||''} ${c.name}</option>`).join('');
  document.getElementById('td-req').innerHTML=`<div class="info-row"><span class="info-lbl">Имя</span><span>${t.requester_name||'—'}</span></div><div class="info-row"><span class="info-lbl">Email</span><span style="color:var(--accent)">${t.requester_email||'—'}</span></div><div class="info-row"><span class="info-lbl">Телефон</span><span>${t.requester_phone||'—'}</span></div><div class="info-row"><span class="info-lbl">Источник</span><span>${t.source}</span></div>`;
  const sc=slaCol(t.sla_due_at,t.sla_breached);
  document.getElementById('td-sla').innerHTML=`<div class="info-row"><span class="info-lbl">Дедлайн</span><span style="color:${sc}">${fmtD(t.sla_due_at)}</span></div><div class="info-row"><span class="info-lbl">Статус</span><span style="color:${sc}">${t.sla_breached?'🚨 Нарушен':'✅ В норме'}</span></div><div class="info-row"><span class="info-lbl">Первый ответ</span><span>${fmtD(t.first_response_at)}</span></div>`;
  document.getElementById('td-comments').innerHTML=d.comments.map(c=>{
    let atts='';
    try{const a=typeof c.attachments==='string'?JSON.parse(c.attachments):(c.attachments||[]);if(a&&a.length)atts='<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px">'+a.map(f=>`<a href="/uploads/${f.path}" target="_blank" class="tag-chip" style="text-decoration:none">📎 ${f.name}</a>`).join('')+'</div>';}catch(e){}
    return `<div class="comment${c.is_internal?' internal':''}"><div class="comment-header"><div class="avatar sm">${ini(c.user_name||c.author_name)}</div><span style="font-size:13px;font-weight:600">${c.user_name||c.author_name||'Система'}</span>${c.is_internal?'<span class="badge" style="background:rgba(168,85,247,.12);color:#c084fc;font-size:10px">Заметка</span>':''}${c.is_email?'<span style="font-size:11px;color:var(--info)">📧</span>':''}<span class="comment-meta">${fmtD(c.created_at)}</span></div><div class="comment-body">${c.body}</div>${atts}</div>`;
  }).join('')||'<div style="color:var(--text3);font-size:13px;padding:8px">Комментариев нет</div>';
  document.getElementById('td-hist').innerHTML=d.history.map(h=>`<div class="history-item"><div class="h-dot"></div><div><div>${h.action}${h.new_value?` → <b>${h.new_value}</b>`:''}</div><div style="color:var(--text3)">${h.user_name||'Система'} · ${fmtD(h.created_at)}</div></div></div>`).join('');
}
async function updTF(f,v){await api('PATCH',`/tickets/${currentTicketId}`,{[f]:v||null});toast('Обновлено');}
async function quickStatus(s){await api('PATCH',`/tickets/${currentTicketId}`,{status:s});openTicket(currentTicketId);toast('Статус: '+s);}
function setRT(i,btn){replyInternal=i;document.querySelectorAll('#view-td .filter-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');}
function repIns(b,a){const t=document.getElementById('rep-body');const s=t.selectionStart,e=t.selectionEnd,sel=t.value.substring(s,e);t.value=t.value.substring(0,s)+b+sel+a+t.value.substring(e);t.focus();}
function showRepFiles(){
  const files=document.getElementById('rep-files').files;
  document.getElementById('rep-files-list').innerHTML=[...files].map(f=>`<span class="tag-chip">📎 ${f.name} <span style="color:var(--text3)">(${Math.round(f.size/1024)}КБ)</span></span>`).join('');
}
async function sendReply(){
  const body=document.getElementById('rep-body').value.trim();
  const files=document.getElementById('rep-files').files;
  if(!body&&!files.length)return;
  const fd=new FormData();
  fd.append('body',body||'(вложение)');
  fd.append('is_internal',replyInternal);
  if(ccEmails.length&&!replyInternal)ccEmails.forEach(e=>fd.append('cc',e));
  for(const f of files)fd.append('attachments',f);
  const r=await api('POST',`/tickets/${currentTicketId}/comments`,fd,true);
  if(r.success){
    document.getElementById('rep-body').value='';
    document.getElementById('rep-files').value='';
    document.getElementById('rep-files-list').innerHTML='';
    ccEmails=[];renderCcList();
    toast(r.email_sent===false&&!replyInternal?'Сохранено, но письмо не ушло (см. логи)':'Отправлено');
    openTicket(currentTicketId);
  }
  else toast(r.error||'Ошибка','err');
}
async function openNewTicket(){
  const[agents,cats]=await Promise.all([api('GET','/users').catch(()=>[]),api('GET','/kb/categories').catch(()=>[])]);
  document.getElementById('nt-agent').innerHTML='<option value="">— Не назначен —</option>'+(Array.isArray(agents)?agents.map(a=>`<option value="${a.id}">${a.name}</option>`).join(''):'');
  const tcats=await api('GET','/settings').then(d=>d.categories||[]).catch(()=>[]);
  document.getElementById('nt-cat').innerHTML='<option value="">— Без категории —</option>'+tcats.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
  openM('m-newticket');
}
async function createTicket(){
  const r=await api('POST','/tickets',{subject:document.getElementById('nt-subj').value,description:document.getElementById('nt-desc').value,requester_name:document.getElementById('nt-name').value,requester_email:document.getElementById('nt-email').value,priority:document.getElementById('nt-prio').value,source:document.getElementById('nt-src').value,assigned_to:document.getElementById('nt-agent').value,category_id:document.getElementById('nt-cat').value});
  if(r.success){closeM('m-newticket');toast(`Тикет #${r.ticket.number} создан`);['nt-subj','nt-desc','nt-name','nt-email'].forEach(x=>document.getElementById(x).value='');loadTickets();}
  else toast(r.error||'Ошибка','err');
}

// ── KB ──
async function loadKbCats(){
  const c=await api('GET','/kb/categories');
  document.getElementById('kb-cats').innerHTML='<div class="info-row" style="cursor:pointer" onclick="kbCatFilter=\'\';document.getElementById(\'kb-cat-filter\').value=\'\';loadKbArt()"><span>📚 Все</span></div>'+(c||[]).map(x=>`<div class="info-row" style="cursor:pointer" onclick="kbCatFilter='${x.id}';document.getElementById('kb-cat-filter').value='${x.id}';loadKbArt()"><span>${x.icon} ${x.name}</span><span style="font-size:11px;color:var(--text3)">${x.article_count}</span></div>`).join('');
  document.getElementById('kb-cat-filter').innerHTML='<option value="">Все категории</option>'+(c||[]).map(x=>`<option value="${x.id}">${x.icon} ${x.name}</option>`).join('');
}
async function loadKbArt(){
  kbCatFilter=document.getElementById('kb-cat-filter').value;
  let qp='';if(kbCatFilter)qp+=`&category=${kbCatFilter}`;if(kbPub)qp+='&published=true';if(kbSearch)qp+=`&search=${encodeURIComponent(kbSearch)}`;
  const a=await api('GET',`/kb/articles?x=1${qp}`);
  const tb=document.getElementById('kb-tbody');
  if(!a?.length){tb.innerHTML=`<tr><td colspan="6"><div class="empty"><div class="e-ico">📚</div>Статей нет</div></td></tr>`;return;}
  tb.innerHTML=a.map(x=>`<tr><td><div style="font-weight:600">${x.title}</div></td><td style="font-size:12px;color:var(--text2)">${x.category_name||'—'}</td><td style="font-size:12px;color:var(--text2)">${x.author_name||'—'}</td><td style="color:var(--text3)">${x.views}</td><td>${x.is_published?'<span style="color:var(--success)">✅ Опубл.</span>':'<span style="color:var(--text3)">📝 Черновик</span>'}</td><td><div style="display:flex;gap:6px"><button class="btn btn-ghost btn-icon btn-sm" onclick="openKbEditor(${x.id})">✏️</button><button class="btn btn-danger btn-icon btn-sm" onclick="delKb(${x.id})">🗑</button></div></td></tr>`).join('');
}
let sKb;function searchKb(q){clearTimeout(sKb);sKb=setTimeout(()=>{kbSearch=q;loadKbArt();},350);}
async function openKbEditor(id){
  editKbId=id||null;document.getElementById('m-kb-title').textContent=id?'Редактировать':'Новая статья';
  const c=await api('GET','/kb/categories');
  document.getElementById('kb-cat').innerHTML='<option value="">— Без категории —</option>'+(c||[]).map(x=>`<option value="${x.id}">${x.icon} ${x.name}</option>`).join('');
  if(id){const a=await api('GET',`/kb/articles/${id}`);document.getElementById('kb-title').value=a.title;document.getElementById('kb-body').value=a.body;document.getElementById('kb-cat').value=a.category_id||'';document.getElementById('kb-published').checked=a.is_published;}
  else{document.getElementById('kb-title').value='';document.getElementById('kb-body').value='';document.getElementById('kb-published').checked=false;}
  openM('m-kb');
}
async function saveKb(){
  const b={title:document.getElementById('kb-title').value,body:document.getElementById('kb-body').value,category_id:document.getElementById('kb-cat').value||null,is_published:document.getElementById('kb-published').checked};
  const r=editKbId?await api('PATCH',`/kb/articles/${editKbId}`,b):await api('POST','/kb/articles',b);
  if(r.success){closeM('m-kb');toast('Сохранено');loadKbArt();loadKbCats();}else toast(r.error||'Ошибка','err');
}
async function delKb(id){if(!confirm('Удалить статью?'))return;await api('DELETE',`/kb/articles/${id}`);toast('Удалено');loadKbArt();}
function mdIns(b,a){const t=document.getElementById('kb-body');const s=t.selectionStart,e=t.selectionEnd,sel=t.value.substring(s,e);t.value=t.value.substring(0,s)+b+sel+a+t.value.substring(e);t.focus();}

// ── INVENTORY ──
async function loadInv(){
  let qp=`page=${invPage}&status=${invFilter}`;if(invSearch)qp+=`&search=${encodeURIComponent(invSearch)}`;
  const d=await api('GET',`/inventory?${qp}`);
  window._invCats=d.categories;
  const tb=document.getElementById('inv-tbody');
  if(!d.items?.length){tb.innerHTML=`<tr><td colspan="8"><div class="empty"><div class="e-ico">📦</div>Нет объектов</div></td></tr>`;document.getElementById('inv-pag').innerHTML='';return;}
  const sC={available:'var(--success)',assigned:'var(--warning)',maintenance:'var(--info)',retired:'var(--text3)',lost:'var(--danger)',reserved:'var(--purple)'};
  const sL={available:'✅ Свободно',assigned:'👤 Выдано',maintenance:'🔧 Ремонт',retired:'🗄 Списано',lost:'❌ Утеряно',reserved:'📌 Резерв'};
  tb.innerHTML=d.items.map(i=>`<tr onclick="editInv(${i.id})"><td><div style="font-weight:600">${i.cat_icon||'📦'} ${i.name}</div>${i.manufacturer?`<div style="font-size:11px;color:var(--text3)">${i.manufacturer} ${i.model||''}</div>`:''}</td><td class="mono" style="font-size:11px;color:var(--text2)">${i.asset_tag||i.inventory_number||i.serial_number||'—'}</td><td style="font-size:12px;color:var(--text2)">${i.category_name||'—'}</td><td><span style="color:${sC[i.status]};font-weight:600;font-size:13px">${sL[i.status]||i.status}</span></td><td><div style="font-size:13px">${i.assigned_to_name||'—'}</div></td><td style="font-size:12px;color:var(--text2)">${i.location||'—'}</td><td style="font-size:12px;${i.warranty_until&&new Date(i.warranty_until)<new Date()?'color:var(--danger)':'color:var(--text2)'}">${fmtDS(i.warranty_until)}</td><td onclick="event.stopPropagation()"><div style="display:flex;gap:6px"><button class="btn btn-ghost btn-icon btn-sm" onclick="editInv(${i.id})">✏️</button><button class="btn btn-danger btn-icon btn-sm" onclick="delInv(${i.id})">🗑</button></div></td></tr>`).join('');
  const pages=Math.ceil(d.total/30);const pg=document.getElementById('inv-pag');
  pg.innerHTML=`<span>Всего: ${d.total}</span>`+(pages>1?`<div class="page-btns"><button class="page-btn" onclick="if(invPage>1){invPage--;loadInv()}" ${invPage===1?'disabled':''}>‹</button><button class="page-btn active">${invPage}</button><button class="page-btn" onclick="if(invPage<${pages}){invPage++;loadInv()}" ${invPage===pages?'disabled':''}>›</button></div>`:'');
}
function setInvF(f,btn){invFilter=f;invPage=1;document.querySelectorAll('#view-inventory .filter-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');loadInv();}
let sInv;function searchInv(q){clearTimeout(sInv);sInv=setTimeout(()=>{invSearch=q;invPage=1;loadInv();},350);}
async function openInv(id){
  editInvId=id||null;document.getElementById('m-inv-title').textContent=id?'Редактировать':'Новый объект';
  const cats=window._invCats||await api('GET','/inventory').then(d=>d.categories);
  document.getElementById('i-cat').innerHTML='<option value="">— Выберите —</option>'+cats.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
  if(!id)['i-name','i-serial','i-invnum','i-asset','i-loc','i-mfr','i-model','i-aname','i-aemail','i-price','i-notes','i-pdate','i-warr'].forEach(x=>document.getElementById(x).value='');
  document.getElementById('i-status').value='available';
  openM('m-inv');
}
async function editInv(id){
  await openInv(id);
  const d=await api('GET',`/inventory?search=${encodeURIComponent(id)}&limit=50`);
  let i=d.items?.find(x=>x.id===id);
  if(!i){const all=await api('GET','/inventory?limit=500');i=all.items?.find(x=>x.id===id);}
  if(!i)return;
  document.getElementById('i-name').value=i.name||'';document.getElementById('i-serial').value=i.serial_number||'';
  document.getElementById('i-invnum').value=i.inventory_number||'';document.getElementById('i-asset').value=i.asset_tag||'';
  document.getElementById('i-cat').value=i.category_id||'';document.getElementById('i-status').value=i.status;
  document.getElementById('i-mfr').value=i.manufacturer||'';document.getElementById('i-model').value=i.model||'';
  document.getElementById('i-loc').value=i.location||'';document.getElementById('i-aname').value=i.assigned_to_name||'';
  document.getElementById('i-aemail').value=i.assigned_to_email||'';document.getElementById('i-pdate').value=i.purchase_date?i.purchase_date.slice(0,10):'';
  document.getElementById('i-price').value=i.purchase_price||'';document.getElementById('i-warr').value=i.warranty_until?i.warranty_until.slice(0,10):'';
  document.getElementById('i-notes').value=i.notes||'';
}
async function saveInv(){
  const b={name:document.getElementById('i-name').value,serial_number:document.getElementById('i-serial').value,inventory_number:document.getElementById('i-invnum').value,asset_tag:document.getElementById('i-asset').value,category_id:document.getElementById('i-cat').value,status:document.getElementById('i-status').value,manufacturer:document.getElementById('i-mfr').value,model:document.getElementById('i-model').value,location:document.getElementById('i-loc').value,assigned_to_name:document.getElementById('i-aname').value,assigned_to_email:document.getElementById('i-aemail').value,purchase_date:document.getElementById('i-pdate').value||null,purchase_price:document.getElementById('i-price').value||null,warranty_until:document.getElementById('i-warr').value||null,notes:document.getElementById('i-notes').value};
  const r=editInvId?await api('PATCH',`/inventory/${editInvId}`,b):await api('POST','/inventory',b);
  if(r.success){closeM('m-inv');toast('Сохранено');loadInv();}else document.getElementById('i-alert').innerHTML=`<div class="alert alert-err">${r.error}</div>`;
}
async function delInv(id){if(!confirm('Удалить объект?'))return;await api('DELETE',`/inventory/${id}`);toast('Удалено');loadInv();}

// ── ANALYTICS ──
function setAPeriod(p,btn){
  document.querySelectorAll('#view-analytics .period-quick .filter-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
  const now=new Date();let from;
  if(p==='month')from=new Date(now.getFullYear(),now.getMonth(),1);
  else if(p==='quarter'){from=new Date(now);from.setMonth(now.getMonth()-3);}
  else from=new Date(now.getFullYear(),0,1);
  aFrom=from;aTo=now;
  document.getElementById('a-from').value=from.toISOString().slice(0,10);document.getElementById('a-to').value=now.toISOString().slice(0,10);
  loadAnalytics();
}
function customAPeriod(){const f=document.getElementById('a-from').value,t=document.getElementById('a-to').value;if(f)aFrom=new Date(f);if(t)aTo=new Date(t);loadAnalytics();}
async function loadAnalytics(){
  const qp=`from=${aFrom.toISOString().slice(0,10)}&to=${aTo.toISOString().slice(0,10)}`;
  const d=await api('GET',`/analytics?${qp}`);
  const s=d.summary;
  const srcNames={web:'🌐 Веб',email:'📧 Email',telegram:'✈️ Telegram',phone:'📞 Телефон'};
  const maxDay=Math.max(...(d.dailyLoad||[]).map(x=>parseInt(x.created)),1);
  const dailyCols=(d.dailyLoad||[]).map(x=>`<div class="col-bar"><div class="col-fill" data-h="${Math.round(x.created/maxDay*120)}px" style="height:2px" title="${x.created} создано"></div><div class="col-lbl">${new Date(x.day).toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'})}</div></div>`).join('');
  const agentRows=(d.byAgent||[]).filter(a=>parseInt(a.total)>0).map(a=>{
    const slaRate=a.resolved>0?Math.round(a.sla_ok/a.resolved*100):0;
    return `<tr><td><div style="display:flex;align-items:center;gap:8px"><div class="avatar sm">${ini(a.name)}</div>${a.name}</div></td><td>${a.total}</td><td style="color:var(--success)">${a.resolved}</td><td>${a.avg_hours||'—'} ч</td><td><span style="color:${slaRate>=80?'var(--success)':slaRate>=50?'var(--warning)':'var(--danger)'}">${slaRate}%</span></td></tr>`;
  }).join('');
  document.getElementById('analytics-content').innerHTML=`
  <div class="stats-grid">
    <div class="stat-card c-blue"><div class="stat-top"><div class="stat-lbl">Всего заявок</div><div class="stat-ico">🎫</div></div><div class="stat-val">${s.total||0}</div></div>
    <div class="stat-card c-green"><div class="stat-top"><div class="stat-lbl">Решено</div><div class="stat-ico">✅</div></div><div class="stat-val">${s.resolved||0}</div></div>
    <div class="stat-card c-orange"><div class="stat-top"><div class="stat-lbl">Ср. первый ответ</div><div class="stat-ico">⚡</div></div><div class="stat-val">${s.avg_first_response||'—'}<span style="font-size:15px">ч</span></div></div>
    <div class="stat-card c-purple"><div class="stat-top"><div class="stat-lbl">Ср. решение</div><div class="stat-ico">🏁</div></div><div class="stat-val">${s.avg_resolution||'—'}<span style="font-size:15px">ч</span></div></div>
    <div class="stat-card c-red"><div class="stat-top"><div class="stat-lbl">Нарушений SLA</div><div class="stat-ico">🚨</div></div><div class="stat-val">${s.sla_breached||0}</div></div>
  </div>
  <div class="card" style="margin-bottom:18px"><div class="card-head">📈 Нагрузка по дням</div>${dailyCols?`<div class="col-chart">${dailyCols}</div>`:'<div class="empty">Нет данных</div>'}</div>
  <div class="grid-2" style="margin-bottom:18px">
    <div class="card"><div class="card-head">🏷 По категориям</div>${renderBars((d.byCategory||[]).filter(c=>parseInt(c.count)>0).map(c=>({label:c.name,value:parseInt(c.count),color:c.color})))||'<div style="color:var(--text3)">Нет данных</div>'}</div>
    <div class="card"><div class="card-head">📥 По источникам</div>${renderBars((d.bySource||[]).map(s=>({label:srcNames[s.source]||s.source,value:parseInt(s.count),color:'var(--accent)'})))||'<div style="color:var(--text3)">Нет данных</div>'}</div>
  </div>
  <div class="card" style="margin-bottom:18px"><div class="card-head">🏆 Рейтинг агентов</div><div class="table-wrap" style="border:none"><table><thead><tr><th>Агент</th><th>Всего</th><th>Решено</th><th>Ср. время</th><th>SLA</th></tr></thead><tbody>${agentRows||'<tr><td colspan="5" style="color:var(--text3)">Нет данных</td></tr>'}</tbody></table></div></div>
  <div class="card"><div class="card-head">👥 Топ заявителей</div>${(d.topRequesters||[]).map(r=>`<div class="info-row"><span>${r.requester_name||r.requester_email}</span><span style="font-weight:700">${r.count}</span></div>`).join('')||'<div style="color:var(--text3)">Нет данных</div>'}</div>`;
  setTimeout(()=>document.querySelectorAll('#view-analytics .bar-fill,#view-analytics .col-fill').forEach(b=>{if(b.dataset.w)b.style.width=b.dataset.w;if(b.dataset.h)b.style.height=b.dataset.h;}),50);
}
function exportData(fmt){
  const qp=`from=${aFrom.toISOString().slice(0,10)}&to=${aTo.toISOString().slice(0,10)}&format=${fmt}`;
  window.open(`${API}/analytics/export?${qp}`,'_blank');
}

// ── USERS ──
async function loadUsers(){
  const u=await api('GET','/users');
  const roles={admin:'🛡 Админ',agent:'👤 Агент',viewer:'👁 Просмотр'};
  document.getElementById('users-tbody').innerHTML=(u||[]).map(x=>`<tr><td><div style="display:flex;align-items:center;gap:9px"><div class="avatar">${ini(x.name)}</div><div style="font-weight:600">${x.name}</div></div></td><td style="color:var(--text2)">${x.email}</td><td><span class="badge b-${x.role==='admin'?'critical':x.role==='agent'?'open':'closed'}">${roles[x.role]}</span></td><td style="color:var(--text2)">${x.department||'—'}</td><td style="font-size:12px;color:var(--text3)">${x.telegram_id||'—'}</td><td style="font-size:12px;color:var(--text3)">${fmtD(x.last_login)}</td><td>${x.is_active?'✅':'❌'}</td><td onclick="event.stopPropagation()"><div style="display:flex;gap:6px"><button class="btn btn-ghost btn-icon btn-sm" onclick='openUser(${JSON.stringify(x).replace(/'/g,"&#39;")})'>✏️</button><button class="btn btn-danger btn-icon btn-sm" onclick="delUser(${x.id})">🗑</button></div></td></tr>`).join('');
}
function openUser(u){
  editUserId=u?.id||null;document.getElementById('m-user-title').textContent=u?'Редактировать':'Новый агент';
  document.getElementById('u-name').value=u?.name||'';document.getElementById('u-email').value=u?.email||'';
  document.getElementById('u-role').value=u?.role||'agent';document.getElementById('u-dept').value=u?.department||'';
  document.getElementById('u-tg').value=u?.telegram_id||'';document.getElementById('u-pass').value='';document.getElementById('u-alert').innerHTML='';
  openM('m-user');
}
async function saveUser(){
  const b={name:document.getElementById('u-name').value,email:document.getElementById('u-email').value,password:document.getElementById('u-pass').value,role:document.getElementById('u-role').value,department:document.getElementById('u-dept').value,telegram_id:document.getElementById('u-tg').value};
  const r=editUserId?await api('PATCH',`/users/${editUserId}`,b):await api('POST','/users',b);
  if(r.success||r.user){closeM('m-user');toast('Сохранено');loadUsers();}else document.getElementById('u-alert').innerHTML=`<div class="alert alert-err">${r.error}</div>`;
}
async function delUser(id){if(!confirm('Деактивировать?'))return;await api('DELETE',`/users/${id}`);toast('Деактивирован');loadUsers();}

// ── SETTINGS ──
async function loadSettings(){
  settingsData=await api('GET','/settings');
  renderSettingsGeneral();renderSettingsTelegram();renderSettingsEmail();renderSettingsTemplates();
  renderSettingsAutomation();renderSettingsEscalation();renderSettingsSla();renderSettingsInvCats();
  renderSettingsDepts();renderSettingsCats();
}
function setStab(name,btn){document.querySelectorAll('#settings-tabs .filter-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');document.querySelectorAll('.stab').forEach(s=>s.classList.remove('active'));document.getElementById('stab-'+name).classList.add('active');}
const S=()=>settingsData.settings||{};
function renderSettingsGeneral(){
  const s=S();
  const logo=s.company_logo||'';
  document.getElementById('stab-general').innerHTML=`<div class="card" style="margin-bottom:16px"><div class="card-head">🖼 Логотип компании</div>
    <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
      <div id="logo-preview" style="width:80px;height:80px;border-radius:14px;background:var(--bg3);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;overflow:hidden">
        ${logo?`<img src="${logo}" style="width:100%;height:100%;object-fit:contain">`:'<span style="font-size:28px">🎫</span>'}
      </div>
      <div style="flex:1;min-width:200px">
        <p style="font-size:13px;color:var(--text2);margin-bottom:10px">PNG, JPG или SVG. Отображается на экране входа и в шапке.</p>
        <div style="display:flex;gap:10px">
          <label class="btn btn-primary btn-sm" style="cursor:pointer">📤 Загрузить<input type="file" id="logo-file" accept="image/*" style="display:none" onchange="uploadLogo()"></label>
          ${logo?`<button class="btn btn-ghost btn-sm" onclick="removeLogo()">🗑 Убрать</button>`:''}
        </div>
      </div>
    </div></div>
    <div class="card"><div class="card-head">Основные настройки</div>
    <div class="fgrid">
      <div class="fgroup"><label>Название компании</label><input id="sg-company" value="${s.company_name||''}"></div>
      <div class="fgroup"><label>Email поддержки</label><input id="sg-email" value="${s.company_email||''}"></div>
      <div class="fgroup"><label>Префикс тикетов</label><input id="sg-prefix" value="${s.ticket_prefix||'HD'}" maxlength="5"></div>
      <div class="fgroup"><label>Автозакрытие решённых (дней)</label><input type="number" id="sg-autoclose" value="${s.auto_close_days||5}"></div>
      <div class="fgroup"><label>Начало рабочего дня</label><input type="time" id="sg-wstart" value="${s.working_hours_start||'09:00'}"></div>
      <div class="fgroup"><label>Конец рабочего дня</label><input type="time" id="sg-wend" value="${s.working_hours_end||'18:00'}"></div>
    </div>
    <div style="margin-top:14px">
      <label style="display:block;margin-bottom:8px">Рабочие дни (вне их — автоответ «нерабочее время»)</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap" id="sg-days">
        ${[['1','Пн'],['2','Вт'],['3','Ср'],['4','Чт'],['5','Пт'],['6','Сб'],['0','Вс']].map(([v,l])=>{
          const days=(s.working_days||'1,2,3,4,5').split(',');
          const on=days.includes(v);
          return `<button type="button" class="filter-btn day-btn${on?' active':''}" data-day="${v}" onclick="this.classList.toggle('active')">${l}</button>`;
        }).join('')}
      </div>
    </div>
    <div style="margin-top:16px"><button class="btn btn-primary" onclick="saveGeneral()">💾 Сохранить</button></div></div>`;
}
async function uploadLogo(){
  const f=document.getElementById('logo-file').files[0];
  if(!f)return;
  const fd=new FormData();fd.append('logo',f);
  const r=await api('POST','/settings/logo',fd,true);
  if(r.success){toast('Логотип загружен');settingsData=await api('GET','/settings');renderSettingsGeneral();applyBranding();}
  else toast(r.error||'Ошибка','err');
}
async function removeLogo(){
  if(!confirm('Убрать логотип?'))return;
  await api('DELETE','/settings/logo');
  toast('Логотип убран');settingsData=await api('GET','/settings');renderSettingsGeneral();applyBranding();
}
async function saveGeneral(){
  const days=[...document.querySelectorAll('#sg-days .day-btn.active')].map(b=>b.dataset.day);
  await api('PATCH','/settings',{company_name:document.getElementById('sg-company').value,company_email:document.getElementById('sg-email').value,ticket_prefix:document.getElementById('sg-prefix').value,auto_close_days:document.getElementById('sg-autoclose').value,working_hours_start:document.getElementById('sg-wstart').value,working_hours_end:document.getElementById('sg-wend').value,working_days:days.join(',')});
  toast('Сохранено');settingsData=await api('GET','/settings');applyBranding();
}
let tgBots=[], tgEventList=[];
async function renderSettingsTelegram(){
  if(!tgEventList.length)tgEventList=await api('GET','/bots/events')||[];
  tgBots=await api('GET','/bots')||[];
  document.getElementById('stab-telegram').innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <p style="color:var(--text2);font-size:13px">Боты с настраиваемым функционалом: алерты по событиям, срокам и расписанию</p>
      <button class="btn btn-primary btn-sm" onclick="openBotEditor()">+ Добавить бота</button>
    </div>
    ${tgBots.length?tgBots.map(b=>renderBotCard(b)).join(''):'<div class="empty"><div class="e-ico">🤖</div>Ботов нет. Нажмите «+ Добавить бота».</div>'}
  `;
}
function renderBotCard(b){
  const ev=typeof b.events==='string'?JSON.parse(b.events):(b.events||{});
  const activeEvents=tgEventList.filter(e=>ev[e.key]).map(e=>e.label);
  return `<div class="card" style="margin-bottom:14px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <div style="font-weight:700;font-size:15px">${b.is_active?'🟢':'⚪'} ${b.name}</div>
      <span style="font-size:12px;color:var(--text3)">chat: ${b.chat_id||'—'} · ${b.schedule_count} расписаний</span>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="btn btn-ghost btn-sm" onclick="testBot(${b.id})">📤 Тест</button>
        <button class="btn btn-ghost btn-sm" onclick="openBotEditor(${b.id})">✏️ Настроить</button>
        <button class="btn btn-ghost btn-sm" onclick="openSchedules(${b.id})">⏰ Расписания</button>
        <button class="btn btn-danger btn-icon btn-sm" onclick="delBot(${b.id})">🗑</button>
      </div>
    </div>
    <div style="font-size:12px;color:var(--text2)">Алерты: ${activeEvents.length?activeEvents.join(', '):'не выбраны'}</div>
  </div>`;
}
function openBotEditor(id){
  const b=id?tgBots.find(x=>x.id===id):null;
  const ev=b?(typeof b.events==='string'?JSON.parse(b.events):(b.events||{})):{};
  const expDays=b?(typeof b.expiry_days==='string'?JSON.parse(b.expiry_days):(b.expiry_days||[30,7,1])):[30,7,1];
  const evToggles=tgEventList.map(e=>`<div class="info-row"><span>${e.label}</span><label class="toggle"><input type="checkbox" class="bot-ev" data-ek="${e.key}" ${ev[e.key]?'checked':''}><span class="toggle-slider"></span></label></div>`).join('');
  document.getElementById('m-bot-title').textContent=id?'Настройка бота':'Новый бот';
  document.getElementById('bot-editor-body').innerHTML=`
    <input type="hidden" id="bot-id" value="${id||''}">
    <div class="fgrid" style="margin-bottom:12px">
      <div class="fgroup full"><label>Название бота</label><input id="bot-name" value="${b?.name||''}" placeholder="Бот поддержки"></div>
      <div class="fgroup full"><label>Токен (от @BotFather)</label><input id="bot-token" value="${b?.token||''}" placeholder="1234567890:ABC..."></div>
      <div class="fgroup full"><label>ID чата/группы (куда слать)</label><input id="bot-chat" value="${b?.chat_id||''}" placeholder="-1001234567890 или 123456789"></div>
      <div class="fgroup full" style="flex-direction:row;align-items:center;gap:10px"><label class="toggle"><input type="checkbox" id="bot-active" ${b?b.is_active?'checked':'':'checked'}><span class="toggle-slider"></span></label><label>Бот активен</label></div>
    </div>
    <div class="card" style="background:var(--bg3);margin-bottom:12px"><div class="card-head">🔔 Что алертить (выберите функции)</div>${evToggles}</div>
    <div class="fgroup" style="margin-bottom:12px"><label>За сколько дней предупреждать об истечении (через запятую)</label><input id="bot-expdays" value="${expDays.join(',')}" placeholder="30,7,1"></div>
    <div id="bot-alert"></div>
  `;
  openM('m-bot');
}
async function saveBot(){
  const id=document.getElementById('bot-id').value;
  const events={};document.querySelectorAll('.bot-ev').forEach(c=>{if(c.checked)events[c.dataset.ek]=true;});
  const expiry_days=document.getElementById('bot-expdays').value.split(',').map(x=>parseInt(x.trim())).filter(n=>!isNaN(n));
  const b={name:document.getElementById('bot-name').value,token:document.getElementById('bot-token').value,chat_id:document.getElementById('bot-chat').value,is_active:document.getElementById('bot-active').checked,events,expiry_days};
  if(!b.name||!b.token){document.getElementById('bot-alert').innerHTML='<div class="alert alert-err">Название и токен обязательны</div>';return;}
  const r=id?await api('PATCH',`/bots/${id}`,b):await api('POST','/bots',b);
  if(r.success){closeM('m-bot');toast('Бот сохранён');renderSettingsTelegram();}
  else document.getElementById('bot-alert').innerHTML=`<div class="alert alert-err">${r.error||'Ошибка'}</div>`;
}
async function delBot(id){if(!confirm('Удалить бота?'))return;await api('DELETE',`/bots/${id}`);toast('Удалён');renderSettingsTelegram();}
async function testBot(id){const r=await api('POST',`/bots/${id}/test`);toast(r.success?'Тест отправлен ✅':'Ошибка: '+r.error,r.success?'ok':'err');}

// Schedules
let curBotId=null;
async function openSchedules(botId){
  curBotId=botId;
  const sch=await api('GET',`/bots/${botId}/schedules`)||[];
  renderSchedules(sch);
  openM('m-schedules');
}
function renderSchedules(sch){
  const dows=['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
  const whenText=(s)=>{
    const n=s.interval_n||1;
    switch(s.freq){
      case 'once':return `Разово ${s.run_date?fmtDS(s.run_date):''}`;
      case 'daily':return 'Ежедневно';
      case 'every_n_days':return `Каждые ${n} дн.`;
      case 'weekly':return `Еженедельно (${dows[s.day_of_week]})`;
      case 'every_n_weeks':return `Каждые ${n} нед. (${dows[s.day_of_week]})`;
      case 'monthly':return `Ежемесячно (${s.day_of_month} числа)`;
      case 'every_n_months':return `Каждые ${n} мес. (${s.day_of_month} числа)`;
      default:return s.freq;
    }
  };
  document.getElementById('schedules-list').innerHTML=sch.length?sch.map(s=>{
    let when=whenText(s)+` в ${s.run_time}`;
    if(s.start_date&&s.freq.startsWith('every'))when+=` (с ${fmtDS(s.start_date)})`;
    return `<div class="card" style="background:var(--bg3);margin-bottom:10px"><div style="display:flex;justify-content:space-between;align-items:start;gap:10px"><div style="flex:1"><div style="font-weight:600">${s.title||'Без названия'}</div><div style="font-size:12px;color:var(--text2);margin:4px 0">${when}</div><div style="font-size:13px;color:var(--text2);white-space:pre-wrap">${s.message}</div></div><div style="display:flex;gap:6px"><label class="toggle"><input type="checkbox" ${s.is_active?'checked':''} onchange="toggleSchedule(${s.id},this.checked)"><span class="toggle-slider"></span></label><button class="btn btn-danger btn-icon btn-sm" onclick="delSchedule(${s.id})">🗑</button></div></div></div>`;
  }).join(''):'<div style="color:var(--text3);font-size:13px;margin-bottom:12px">Расписаний нет</div>';
}
function onSchedFreqChange(){
  const f=document.getElementById('sc-freq').value;
  const show=(id,on)=>{const el=document.getElementById(id);if(el)el.style.display=on?'block':'none';};
  show('sc-n-wrap', f==='every_n_days'||f==='every_n_weeks'||f==='every_n_months');
  show('sc-dow-wrap', f==='weekly'||f==='every_n_weeks');
  show('sc-dom-wrap', f==='monthly'||f==='every_n_months');
  show('sc-date-wrap', f==='once');
  show('sc-start-wrap', f==='every_n_days'||f==='every_n_weeks'||f==='every_n_months');
  const lbl={every_n_days:'Каждые N дней',every_n_weeks:'Каждые N недель',every_n_months:'Каждые N месяцев'}[f];
  if(lbl)document.getElementById('sc-n-label').textContent=lbl;
}
async function addSchedule(){
  const message=document.getElementById('sc-message').value.trim();
  if(!message)return toast('Введите текст сообщения','err');
  const b={
    title:document.getElementById('sc-title').value,
    message,
    freq:document.getElementById('sc-freq').value,
    run_time:document.getElementById('sc-time').value,
    interval_n:parseInt(document.getElementById('sc-n').value)||1,
    day_of_week:parseInt(document.getElementById('sc-dow').value),
    day_of_month:parseInt(document.getElementById('sc-dom').value),
    run_date:document.getElementById('sc-date').value||null,
    start_date:document.getElementById('sc-start').value||null
  };
  const r=await api('POST',`/bots/${curBotId}/schedules`,b);
  if(r.success){toast('Расписание добавлено');document.getElementById('sc-title').value='';document.getElementById('sc-message').value='';const sch=await api('GET',`/bots/${curBotId}/schedules`)||[];renderSchedules(sch);renderSettingsTelegram();}
}
async function toggleSchedule(id,active){await api('PATCH',`/schedules/${id}`,{is_active:active});}
async function delSchedule(id){if(!confirm('Удалить расписание?'))return;await api('DELETE',`/schedules/${id}`);const sch=await api('GET',`/bots/${curBotId}/schedules`)||[];renderSchedules(sch);renderSettingsTelegram();}
function renderSettingsEmail(){
  const s=S();
  document.getElementById('stab-email').innerHTML=`<div class="card" style="margin-bottom:16px"><div class="card-head">📥 IMAP (входящая почта)</div>
    <div class="fgrid">
      <div class="fgroup"><label>Хост</label><input id="im-host" value="${s.imap_host||''}" placeholder="mail.emaktab.uz"></div>
      <div class="fgroup"><label>Порт</label><select id="im-port"><option value="993" ${s.imap_port==='993'?'selected':''}>993 (SSL)</option><option value="143" ${s.imap_port==='143'?'selected':''}>143 (TLS/без шифрования)</option></select></div>
      <div class="fgroup"><label>Шифрование</label><select id="im-enc"><option value="ssl" ${s.imap_encryption==='ssl'?'selected':''}>SSL</option><option value="tls" ${s.imap_encryption==='tls'?'selected':''}>TLS</option><option value="none" ${s.imap_encryption==='none'?'selected':''}>Нет</option></select></div>
      <div class="fgroup"><label>Папка</label><input id="im-folder" value="${s.imap_folder||'INBOX'}"></div>
      <div class="fgroup"><label>Логин</label><input id="im-user" value="${s.imap_user||''}"></div>
      <div class="fgroup"><label>Пароль</label><input type="password" id="im-pass" value="${s.imap_pass||''}"></div>
      <div class="fgroup full" style="flex-direction:row;align-items:center;gap:10px"><label class="toggle"><input type="checkbox" id="im-enabled" ${s.imap_enabled==='true'?'checked':''}><span class="toggle-slider"></span></label><label>Включить приём писем (создание тикетов)</label></div>
    </div>
    <div style="margin-top:14px;display:flex;gap:10px"><button class="btn btn-primary" onclick="saveImap()">💾 Сохранить</button><button class="btn btn-ghost" onclick="testImap()">🔌 Проверить</button></div>
  </div>
  <div class="card"><div class="card-head">📤 SMTP (исходящая почта)</div>
    <div class="fgrid">
      <div class="fgroup"><label>Хост</label><input id="sm-host" value="${s.smtp_host||''}" placeholder="mail.emaktab.uz"></div>
      <div class="fgroup"><label>Порт</label><select id="sm-port"><option value="587" ${s.smtp_port==='587'?'selected':''}>587 (TLS)</option><option value="465" ${s.smtp_port==='465'?'selected':''}>465 (SSL)</option><option value="25" ${s.smtp_port==='25'?'selected':''}>25 (без шифрования)</option></select></div>
      <div class="fgroup"><label>Шифрование</label><select id="sm-enc"><option value="tls" ${s.smtp_encryption==='tls'?'selected':''}>TLS</option><option value="ssl" ${s.smtp_encryption==='ssl'?'selected':''}>SSL</option><option value="none" ${s.smtp_encryption==='none'?'selected':''}>Нет</option></select></div>
      <div class="fgroup"><label>Имя отправителя</label><input id="sm-from" value="${s.smtp_from_name||''}"></div>
      <div class="fgroup"><label>Логин</label><input id="sm-user" value="${s.smtp_user||''}"></div>
      <div class="fgroup"><label>Пароль</label><input type="password" id="sm-pass" value="${s.smtp_pass||''}"></div>
      <div class="fgroup full" style="flex-direction:row;align-items:center;gap:10px"><label class="toggle"><input type="checkbox" id="sm-enabled" ${s.smtp_enabled==='true'?'checked':''}><span class="toggle-slider"></span></label><label>Включить отправку писем</label></div>
    </div>
    <div style="margin-top:14px;display:flex;gap:10px"><button class="btn btn-primary" onclick="saveSmtp()">💾 Сохранить</button><button class="btn btn-ghost" onclick="testSmtp()">📤 Тест письмо</button></div>
  </div>`;
}
async function saveImap(){
  await api('PATCH','/settings',{imap_host:document.getElementById('im-host').value,imap_port:document.getElementById('im-port').value,imap_encryption:document.getElementById('im-enc').value,imap_folder:document.getElementById('im-folder').value,imap_user:document.getElementById('im-user').value,imap_pass:document.getElementById('im-pass').value,imap_enabled:document.getElementById('im-enabled').checked});
  toast('IMAP сохранён');settingsData=await api('GET','/settings');
}
async function saveSmtp(){
  await api('PATCH','/settings',{smtp_host:document.getElementById('sm-host').value,smtp_port:document.getElementById('sm-port').value,smtp_encryption:document.getElementById('sm-enc').value,smtp_from_name:document.getElementById('sm-from').value,smtp_user:document.getElementById('sm-user').value,smtp_pass:document.getElementById('sm-pass').value,smtp_enabled:document.getElementById('sm-enabled').checked});
  toast('SMTP сохранён');settingsData=await api('GET','/settings');
}
async function testImap(){toast('Проверяю IMAP...','info');const r=await api('POST','/settings/test-imap',{});toast(r.success?r.message:'Ошибка: '+r.error,r.success?'ok':'err');}
async function testSmtp(){const r=await api('POST','/settings/test-email',{to:me.email});toast(r.success?`Письмо отправлено на ${me.email}`:'Ошибка: '+r.reason,r.success?'ok':'err');}
function renderSettingsTemplates(){
  document.getElementById('stab-templates').innerHTML=(settingsData.templates||[]).map(t=>`<div class="card" style="margin-bottom:14px"><div class="card-head" style="display:flex;align-items:center;justify-content:space-between"><span>${t.name}</span><label class="toggle" style="margin:0" title="Включить/отключить автоответ"><input type="checkbox" ${t.enabled!==false?'checked':''} onchange="toggleTpl(${t.id},this.checked)"><span class="toggle-slider"></span></label></div><div class="fgroup" style="margin-bottom:10px"><label>Тема</label><input id="tpl-s-${t.id}" value="${(t.subject||'').replace(/"/g,'&quot;')}"></div><div class="fgroup" style="margin-bottom:10px"><label>Текст</label><textarea id="tpl-b-${t.id}" style="min-height:160px;font-family:'JetBrains Mono',monospace;font-size:12px">${t.body||''}</textarea></div><button class="btn btn-primary btn-sm" onclick="saveTpl(${t.id})">💾 Сохранить</button></div>`).join('');
}
async function saveTpl(id){await api('PATCH',`/settings/templates/${id}`,{subject:document.getElementById('tpl-s-'+id).value,body:document.getElementById('tpl-b-'+id).value});toast('Шаблон сохранён');}
async function toggleTpl(id,enabled){await api('PATCH',`/settings/templates/${id}`,{enabled});const t=(settingsData.templates||[]).find(x=>x.id===id);if(t)t.enabled=enabled;toast(enabled?'Автоответ включён':'Автоответ отключён');}
function renderSettingsAutomation(){
  const fieldNames={subject:'Тема',requester_email:'Email заявителя',description:'Описание',priority:'Приоритет'};
  const opNames={contains:'содержит',not_contains:'не содержит',equals:'равно',starts_with:'начинается с',ends_with:'заканчивается на'};
  const actNames={assign_agent:'Назначить агента',assign_department:'Назначить отдел',set_priority:'Установить приоритет',set_category:'Установить категорию',add_tag:'Добавить тег',send_telegram:'Telegram уведомление',escalate:'Эскалировать'};
  document.getElementById('stab-automation').innerHTML=`<div style="display:flex;justify-content:space-between;margin-bottom:14px"><p style="color:var(--text2);font-size:13px">Правила выполняются при создании тикета по порядку</p><button class="btn btn-primary btn-sm" onclick="openAutoRule()">+ Правило</button></div>
    <div class="table-wrap"><table><thead><tr><th>Название</th><th>Условие</th><th>Действие</th><th>Активно</th><th></th></tr></thead><tbody>${(settingsData.auto_rules||[]).map(r=>`<tr><td style="font-weight:600">${r.name}</td><td style="font-size:12px;color:var(--text2)">${r.condition_field?`${fieldNames[r.condition_field]||r.condition_field} ${opNames[r.condition_operator]||r.condition_operator} "${r.condition_value}"`:'всегда'}</td><td style="font-size:12px">${actNames[r.action_type]||r.action_type}${r.action_value?`: ${r.action_value}`:''}</td><td><label class="toggle"><input type="checkbox" ${r.is_active?'checked':''} onchange="toggleAuto(${r.id},this.checked)"><span class="toggle-slider"></span></label></td><td><button class="btn btn-danger btn-icon btn-sm" onclick="delAuto(${r.id})">🗑</button></td></tr>`).join('')||'<tr><td colspan="5" style="color:var(--text3)">Нет правил</td></tr>'}</tbody></table></div>`;
}
function openAutoRule(){
  const name=prompt('Название правила:');if(!name)return;
  const field=prompt('Поле (subject/requester_email/description):','subject');
  const op=prompt('Оператор (contains/equals/starts_with):','contains');
  const val=prompt('Значение для проверки:');
  const action=prompt('Действие (set_priority/set_category/add_tag/assign_agent):','set_priority');
  const aval=prompt('Значение действия (напр. critical, ID категории, тег):');
  api('POST','/settings/automation',{name,trigger_event:'ticket_created',condition_field:field,condition_operator:op,condition_value:val,action_type:action,action_value:aval}).then(()=>{toast('Правило создано');loadSettings();});
}
async function toggleAuto(id,active){await api('PATCH',`/settings/automation/${id}`,{...settingsData.auto_rules.find(r=>r.id===id),is_active:active});toast('Обновлено');}
async function delAuto(id){if(!confirm('Удалить правило?'))return;await api('DELETE',`/settings/automation/${id}`);toast('Удалено');loadSettings();}
function renderSettingsEscalation(){
  const users=settingsData.users||[];
  document.getElementById('stab-escalation').innerHTML=`<div style="display:flex;justify-content:space-between;margin-bottom:14px"><p style="color:var(--text2);font-size:13px">Эскалация уведомляет ответственного если тикет не обработан вовремя</p><button class="btn btn-primary btn-sm" onclick="openEscRule()">+ Правило</button></div>
    ${(settingsData.esc_rules||[]).map(r=>`<div class="card" style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><div style="font-weight:700">${r.name}</div><div style="display:flex;gap:8px;align-items:center"><label class="toggle"><input type="checkbox" ${r.is_active?'checked':''} onchange="toggleEsc(${r.id},this.checked)"><span class="toggle-slider"></span></label><button class="btn btn-danger btn-icon btn-sm" onclick="delEsc(${r.id})">🗑</button></div></div>
    <div class="info-row"><span class="info-lbl">Приоритет</span><span>${r.priority==='all'?'Все':r.priority}</span></div>
    <div class="info-row"><span class="info-lbl">Не назначен более</span><span>${r.hours_unassigned} ч</span></div>
    <div class="info-row"><span class="info-lbl">Не решён более</span><span>${r.hours_unresolved} ч</span></div>
    <div class="info-row"><span class="info-lbl">Уведомить</span><span>${r.notify_user_name||'—'} ${r.notify_telegram?'✈️':''} ${r.notify_email?'📧':''}</span></div>
    </div>`).join('')||'<div class="empty">Нет правил эскалации</div>'}`;
}
function openEscRule(){
  const name=prompt('Название:');if(!name)return;
  const hu=prompt('Эскалировать если не назначен (часов):','4');
  const hr=prompt('Эскалировать если не решён (часов):','48');
  api('POST','/settings/escalation',{name,priority:'all',hours_unassigned:parseInt(hu),hours_unresolved:parseInt(hr),notify_telegram:true,notify_email:true}).then(()=>{toast('Создано');loadSettings();});
}
async function toggleEsc(id,active){const r=settingsData.esc_rules.find(x=>x.id===id);await api('PATCH',`/settings/escalation/${id}`,{...r,is_active:active});toast('Обновлено');}
async function delEsc(id){if(!confirm('Удалить?'))return;await api('DELETE',`/settings/escalation/${id}`);toast('Удалено');loadSettings();}
function renderSettingsSla(){
  document.getElementById('stab-sla').innerHTML=`<div class="card"><div class="card-head">⏱ Политики SLA</div>${(settingsData.sla||[]).map(s=>`<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">${pBadge(s.priority)}<input value="${s.name}" id="sla-n-${s.id}" style="width:140px"><div style="display:flex;align-items:center;gap:6px;font-size:13px"><span style="color:var(--text2)">Ответ:</span><input type="number" value="${s.first_response_hours}" id="sla-f-${s.id}" style="width:70px">ч</div><div style="display:flex;align-items:center;gap:6px;font-size:13px"><span style="color:var(--text2)">Решение:</span><input type="number" value="${s.resolution_hours}" id="sla-r-${s.id}" style="width:70px">ч</div><button class="btn btn-primary btn-sm" onclick="saveSla(${s.id})">💾</button></div>`).join('')}</div>`;
}
async function saveSla(id){await api('PATCH',`/settings/sla/${id}`,{name:document.getElementById('sla-n-'+id).value,first_response_hours:parseInt(document.getElementById('sla-f-'+id).value),resolution_hours:parseInt(document.getElementById('sla-r-'+id).value)});toast('SLA сохранён');}
async function renderSettingsInvCats(){
  const cats=await api('GET','/settings/inv-categories');
  document.getElementById('stab-invcats').innerHTML=`<div style="display:flex;justify-content:space-between;margin-bottom:14px"><p style="color:var(--text2);font-size:13px">Категории оргтехники для инвентаризации</p><button class="btn btn-primary btn-sm" onclick="openInvCat()">+ Категория</button></div>
    <div class="table-wrap"><table><thead><tr><th>Иконка</th><th>Название</th><th>Цвет</th><th></th></tr></thead><tbody>${cats.map(c=>`<tr><td style="font-size:20px">${c.icon}</td><td style="font-weight:600">${c.name}</td><td><span style="display:inline-block;width:16px;height:16px;border-radius:4px;background:${c.color};vertical-align:middle"></span> ${c.color}</td><td><button class="btn btn-danger btn-icon btn-sm" onclick="delInvCat(${c.id})">🗑</button></td></tr>`).join('')}</tbody></table></div>`;
}
function openInvCat(){const name=prompt('Название категории:');if(!name)return;const icon=prompt('Иконка (эмодзи):','📦')||'📦';const color=prompt('Цвет HEX:','#4f8ef7')||'#4f8ef7';api('POST','/settings/inv-categories',{name,icon,color}).then(()=>{toast('Добавлено');renderSettingsInvCats();});}
async function delInvCat(id){if(!confirm('Удалить категорию?'))return;await api('DELETE',`/settings/inv-categories/${id}`);toast('Удалено');renderSettingsInvCats();}
function renderSettingsDepts(){
  document.getElementById('stab-departments').innerHTML=`<div style="display:flex;justify-content:flex-end;margin-bottom:14px"><button class="btn btn-primary btn-sm" onclick="openDept()">+ Отдел</button></div><div class="table-wrap"><table><thead><tr><th>Название</th><th>Email</th><th>Описание</th><th></th></tr></thead><tbody>${(settingsData.departments||[]).map(d=>`<tr><td style="font-weight:600">${d.name}</td><td style="color:var(--text2)">${d.email||'—'}</td><td style="color:var(--text2)">${d.description||'—'}</td><td><button class="btn btn-danger btn-icon btn-sm" onclick="delDept(${d.id})">🗑</button></td></tr>`).join('')||'<tr><td colspan="4" style="color:var(--text3)">Нет отделов</td></tr>'}</tbody></table></div>`;
}
function openDept(){const name=prompt('Название отдела:');if(!name)return;const email=prompt('Email (необязательно):');api('POST','/settings/departments',{name,email}).then(()=>{toast('Добавлено');loadSettings();});}
async function delDept(id){if(!confirm('Удалить?'))return;await api('DELETE',`/settings/departments/${id}`);toast('Удалено');loadSettings();}
function renderSettingsCats(){
  document.getElementById('stab-categories').innerHTML=`<div style="display:flex;justify-content:flex-end;margin-bottom:14px"><button class="btn btn-primary btn-sm" onclick="openCat()">+ Категория</button></div><div class="table-wrap"><table><thead><tr><th>Иконка</th><th>Название</th><th>Цвет</th><th></th></tr></thead><tbody>${(settingsData.categories||[]).map(c=>`<tr><td style="font-size:18px">${c.icon||'📁'}</td><td style="font-weight:600">${c.name}</td><td><span style="display:inline-block;width:16px;height:16px;border-radius:4px;background:${c.color};vertical-align:middle"></span> ${c.color}</td><td><button class="btn btn-danger btn-icon btn-sm" onclick="delCat(${c.id})">🗑</button></td></tr>`).join('')||'<tr><td colspan="4" style="color:var(--text3)">Нет категорий</td></tr>'}</tbody></table></div>`;
}
function openCat(){const name=prompt('Название категории:');if(!name)return;const icon=prompt('Иконка:','📁')||'📁';const color=prompt('Цвет HEX:','#4f8ef7')||'#4f8ef7';api('POST','/settings/categories',{name,icon,color}).then(()=>{toast('Добавлено');loadSettings();});}
async function delCat(id){if(!confirm('Удалить?'))return;await api('DELETE',`/settings/categories/${id}`);toast('Удалено');loadSettings();}

// ── PROFILE ──
async function saveProfile(){const r=await api('PATCH','/profile',{name:document.getElementById('p-name').value,telegram_id:document.getElementById('p-tg').value});if(r.success){toast('Сохранено');me.name=document.getElementById('p-name').value;document.getElementById('sb-name').textContent=me.name;document.getElementById('sb-av').textContent=ini(me.name);}}
async function changePass(){const r=await api('PATCH','/profile',{current_password:document.getElementById('p-cur').value,new_password:document.getElementById('p-new').value});if(r.success){toast('Пароль изменён');document.getElementById('p-cur').value='';document.getElementById('p-new').value='';}else toast(r.error||'Ошибка','err');}

// ── NOTIFICATIONS ──
async function loadNotif(){
  const d=await api('GET','/notifications');
  const c=d.unread||0;const b=document.getElementById('notif-count');b.textContent=c;b.style.display=c>0?'inline':'none';
  document.getElementById('notif-list').innerHTML=(d.notifications||[]).map(n=>`<div class="notif-item${n.is_read?'':' unread'}" style="cursor:pointer" onclick="${n.link?`openTicketFromLink('${n.link}')`:''}"><div class="notif-title">${n.title}</div>${n.body?`<div class="notif-body">${n.body.substring(0,70)}</div>`:''}<div class="notif-time">${fmtD(n.created_at)}</div></div>`).join('')||'<div style="padding:24px;text-align:center;color:var(--text3)">Нет уведомлений</div>';
}
function toggleNotif(){document.getElementById('notif-panel').classList.toggle('open');}
async function readAllNotif(){await api('POST','/notifications/read-all');loadNotif();}
function openTicketFromLink(l){const m=l.match(/tickets\/(\d+)/);if(m)openTicket(parseInt(m[1]));document.getElementById('notif-panel').classList.remove('open');}
document.addEventListener('click',e=>{const p=document.getElementById('notif-panel');if(p&&!p.contains(e.target)&&!e.target.closest('[onclick*=toggleNotif]'))p.classList.remove('open');});

// ── CONTACTS (Пользователи) ──
let contactsCache=[];let editContactId=null;
async function loadContacts(){
  const c=await api('GET','/contacts');
  contactsCache=c||[];
  const tb=document.getElementById('contacts-tbody');
  if(!c?.length){tb.innerHTML=`<tr><td colspan="6"><div class="empty"><div class="e-ico">📇</div>Пользователей нет</div></td></tr>`;return;}
  tb.innerHTML=c.map(x=>`<tr><td><div style="display:flex;align-items:center;gap:9px"><div class="avatar sm">${ini(x.name)}</div><span style="font-weight:600">${x.name}</span></div></td><td style="color:var(--accent)">${x.email}</td><td style="color:var(--text2)">${x.phone||'—'}</td><td style="color:var(--text2)">${x.company||'—'}</td><td style="color:var(--text2)">${x.position||'—'}</td><td onclick="event.stopPropagation()"><div style="display:flex;gap:6px"><button class="btn btn-ghost btn-icon btn-sm" onclick='openContact(${JSON.stringify(x).replace(/'/g,"&#39;")})'>✏️</button><button class="btn btn-danger btn-icon btn-sm" onclick="delContact(${x.id})">🗑</button></div></td></tr>`).join('');
}
let sCt;function searchContacts(q){clearTimeout(sCt);sCt=setTimeout(async()=>{const c=await api('GET',`/contacts?search=${encodeURIComponent(q)}`);contactsCache=c||[];const tb=document.getElementById('contacts-tbody');tb.innerHTML=(c||[]).map(x=>`<tr><td><div style="display:flex;align-items:center;gap:9px"><div class="avatar sm">${ini(x.name)}</div><span style="font-weight:600">${x.name}</span></div></td><td style="color:var(--accent)">${x.email}</td><td style="color:var(--text2)">${x.phone||'—'}</td><td style="color:var(--text2)">${x.company||'—'}</td><td style="color:var(--text2)">${x.position||'—'}</td><td onclick="event.stopPropagation()"><div style="display:flex;gap:6px"><button class="btn btn-ghost btn-icon btn-sm" onclick='openContact(${JSON.stringify(x).replace(/'/g,"&#39;")})'>✏️</button><button class="btn btn-danger btn-icon btn-sm" onclick="delContact(${x.id})">🗑</button></div></td></tr>`).join('')||`<tr><td colspan="6"><div class="empty">Ничего не найдено</div></td></tr>`;},300);}
function openContact(c){
  editContactId=c?.id||null;
  document.getElementById('m-contact-title').textContent=c?'Редактировать пользователя':'Новый пользователь';
  document.getElementById('ct-name').value=c?.name||'';
  document.getElementById('ct-email').value=c?.email||'';
  document.getElementById('ct-phone').value=c?.phone||'';
  document.getElementById('ct-company').value=c?.company||'';
  document.getElementById('ct-position').value=c?.position||'';
  document.getElementById('ct-notes').value=c?.notes||'';
  document.getElementById('ct-alert').innerHTML='';
  openM('m-contact');
}
async function saveContact(){
  const b={name:document.getElementById('ct-name').value,email:document.getElementById('ct-email').value,phone:document.getElementById('ct-phone').value,company:document.getElementById('ct-company').value,position:document.getElementById('ct-position').value,notes:document.getElementById('ct-notes').value};
  if(!b.name||!b.email){document.getElementById('ct-alert').innerHTML='<div class="alert alert-err">Имя и email обязательны</div>';return;}
  const r=editContactId?await api('PATCH',`/contacts/${editContactId}`,b):await api('POST','/contacts',b);
  if(r.success){closeM('m-contact');toast('Сохранено');loadContacts();}
  else document.getElementById('ct-alert').innerHTML=`<div class="alert alert-err">${r.error||'Ошибка'}</div>`;
}
async function delContact(id){if(!confirm('Удалить пользователя?'))return;await api('DELETE',`/contacts/${id}`);toast('Удалено');loadContacts();}

// ── CC (копия) ──
let ccEmails=[];
async function openCc(){
  if(!contactsCache.length)contactsCache=await api('GET','/contacts')||[];
  const sel=document.getElementById('cc-select');
  sel.innerHTML='<option value="">— Выберите —</option>'+contactsCache.map(c=>`<option value="${c.email}">${c.name} (${c.email})</option>`).join('');
  renderCcList();openM('m-cc');
}
function addCcFromSelect(){const v=document.getElementById('cc-select').value;if(v&&!ccEmails.includes(v))ccEmails.push(v);document.getElementById('cc-select').value='';renderCcList();}
function addCcManual(){const v=document.getElementById('cc-manual').value.trim();if(v&&!ccEmails.includes(v)){ccEmails.push(v);document.getElementById('cc-manual').value='';}renderCcList();}
function removeCc(e){ccEmails=ccEmails.filter(x=>x!==e);renderCcList();}
function renderCcList(){
  const html=ccEmails.map(e=>`<span class="tag-chip">${e} <span style="cursor:pointer;font-weight:700" onclick="removeCc('${e}')">✕</span></span>`).join('');
  const m=document.getElementById('cc-list');if(m)m.innerHTML=html||'<span style="color:var(--text3);font-size:12px">Никто не добавлен</span>';
  const r=document.getElementById('rep-cc-list');if(r)r.innerHTML=ccEmails.length?('<span style="font-size:12px;color:var(--text2)">Копия: </span>'+ccEmails.map(e=>`<span class="tag-chip">${e} <span style="cursor:pointer;font-weight:700" onclick="removeCc('${e}')">✕</span></span>`).join('')):'';
}

// ── FORWARD ──
async function openForward(){
  if(!contactsCache.length)contactsCache=await api('GET','/contacts')||[];
  const sel=document.getElementById('fwd-select');
  sel.innerHTML='<option value="">— Выберите —</option>'+contactsCache.map(c=>`<option value="${c.email}">${c.name} (${c.email})</option>`).join('');
  document.getElementById('fwd-manual').value='';document.getElementById('fwd-note').value='';document.getElementById('fwd-alert').innerHTML='';
  openM('m-forward');
}
async function doForward(){
  const to=document.getElementById('fwd-manual').value.trim()||document.getElementById('fwd-select').value;
  if(!to){document.getElementById('fwd-alert').innerHTML='<div class="alert alert-err">Укажите получателя</div>';return;}
  const note=document.getElementById('fwd-note').value;
  const r=await api('POST',`/tickets/${currentTicketId}/forward`,{to,note});
  if(r.success){closeM('m-forward');toast('Тикет переслан на '+to);}
  else document.getElementById('fwd-alert').innerHTML=`<div class="alert alert-err">${r.error||'Ошибка'}</div>`;
}

// ── MANAGEMENT (конструктор) ──
let mgmtSections=[], curSection=null, curFields=[], editRecId=null, mgmtMenuOpen=false;

async function toggleMgmtMenu(){
  mgmtMenuOpen=!mgmtMenuOpen;
  const sub=document.getElementById('mgmt-submenu');
  const caret=document.getElementById('mgmt-caret');
  if(mgmtMenuOpen){
    mgmtSections=await api('GET','/mgmt/sections')||[];
    renderMgmtSubmenu();
    sub.style.display='block';
    if(caret)caret.style.transform='rotate(90deg)';
  } else {
    sub.style.display='none';
    if(caret)caret.style.transform='';
  }
}
function mgmtIcon(val){
  if(!val)return icon('folder',18);
  // если это имя иконки из набора — используем напрямую
  if(typeof ICONS!=='undefined'&&ICONS[val])return icon(val,18);
  // иначе пробуем сконвертить эмодзи
  const name=(typeof EMOJI_MAP!=='undefined'&&EMOJI_MAP[val])||'folder';
  return icon(name,18);
}
function renderMgmtSubmenu(){
  const sub=document.getElementById('mgmt-submenu');
  sub.innerHTML=mgmtSections.map(s=>`<div class="sb-item mgmt-sub${curSection&&curSection.id===s.id?' active':''}" data-sid="${s.id}" style="padding-left:32px" onclick="openSection(${s.id})"><span class="ico">${mgmtIcon(s.icon)}</span><span style="flex:1">${s.name}</span><span style="font-size:11px;color:var(--text3)">${s.record_count}</span></div>`).join('')
    + (me.role==='admin'?`<div class="sb-item" style="padding-left:32px;color:var(--accent)" onclick="addMgmtSection()"><span class="ico">${icon('plus',18)}</span><span>Добавить раздел</span></div>`:'');
}
async function loadMgmt(){
  // called when nav('mgmt') — ensure menu open
  if(!mgmtMenuOpen){await toggleMgmtMenu();}
  else { mgmtSections=await api('GET','/mgmt/sections')||[]; renderMgmtSubmenu(); }
}
async function openSection(id){
  nav('mgmt');
  mgmtSections=await api('GET','/mgmt/sections')||[];
  curSection=mgmtSections.find(s=>s.id===id);
  if(!curSection)return;
  if(!mgmtMenuOpen){mgmtMenuOpen=true;document.getElementById('mgmt-submenu').style.display='block';const caret=document.getElementById('mgmt-caret');if(caret)caret.style.transform='rotate(90deg)';}
  renderMgmtSubmenu();
  document.getElementById('tb-title').textContent='Управление — '+curSection.name;
  curFields=await api('GET',`/mgmt/sections/${id}/fields`)||[];
  const recs=await api('GET',`/mgmt/sections/${id}/records`)||[];
  renderRecords(recs);
}
function renderRecords(recs){
  const adminBtns=me.role==='admin'?`<button class="btn btn-ghost btn-sm" onclick="openFieldsModal()">⚙️ Поля</button> <button class="btn btn-ghost btn-icon btn-sm" onclick="editMgmtSection()" title="Переименовать">✏️</button> <button class="btn btn-danger btn-icon btn-sm" onclick="delMgmtSection()" title="Удалить раздел">🗑</button>`:'';
  // columns = first up to 4 fields
  const cols=curFields.slice(0,4);
  const rows=recs.map(r=>{
    const data=typeof r.data==='string'?JSON.parse(r.data):(r.data||{});
    const tds=cols.map(f=>{
      let v=data[f.field_key]||'';
      if(f.field_type==='date'&&v)v=new Date(v).toLocaleDateString('ru-RU');
      return `<td onclick="openRecord(${r.id})">${v||'—'}</td>`;
    }).join('');
    let files=r.files;if(typeof files==='string'){try{files=JSON.parse(files)}catch(e){files=[]}}
    return `<tr><td onclick="openRecord(${r.id})" style="font-weight:600">${r.title}</td>${tds}<td onclick="openRecord(${r.id})" style="color:var(--text3)">${(files&&files.length)?'📎'+files.length:''}</td><td onclick="event.stopPropagation()"><div style="display:flex;gap:6px"><button class="btn btn-ghost btn-icon btn-sm" onclick="openRecord(${r.id})">✏️</button><button class="btn btn-danger btn-icon btn-sm" onclick="delRecord(${r.id})">🗑</button></div></td></tr>`;
  }).join('');
  const headCols=cols.map(f=>`<th>${f.name}</th>`).join('');
  document.getElementById('mgmt-main').innerHTML=`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
      <h2 style="font-size:17px;font-weight:700;display:flex;align-items:center;gap:8px">${mgmtIcon(curSection.icon)} ${curSection.name}</h2>
      <span style="color:var(--text3);font-size:13px">${recs.length} записей</span>
      <div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap">
        ${adminBtns}
        <input class="search-box" placeholder="🔍 Поиск..." style="width:180px" oninput="searchRecords(this.value)">
        <button class="btn btn-primary btn-sm" onclick="openRecord()">+ Запись</button>
      </div>
    </div>
    ${curFields.length===0?'<div class="alert" style="background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);color:var(--warning)">⚠️ В разделе нет полей. Нажмите «⚙️ Поля» чтобы добавить.</div>':''}
    <div class="table-wrap"><table><thead><tr><th>Наименование</th>${headCols}<th></th><th></th></tr></thead><tbody>${rows||`<tr><td colspan="${cols.length+3}"><div class="empty"><div class="e-ico">📋</div>Записей нет</div></td></tr>`}</tbody></table></div>`;
}
let sRec;function searchRecords(q){clearTimeout(sRec);sRec=setTimeout(async()=>{const recs=await api('GET',`/mgmt/sections/${curSection.id}/records?search=${encodeURIComponent(q)}`)||[];renderRecords(recs);},300);}

async function addMgmtSection(){
  const name=prompt('Название раздела (напр. Лицензии):');if(!name)return;
  const ic=prompt('Иконка — впишите одно из: key, doc, folder, box, building, globe, phone, lock, link, chart, calendar, flag','folder')||'folder';
  const r=await api('POST','/mgmt/sections',{name,icon:ic});
  if(r.success){toast('Раздел создан');mgmtSections=await api('GET','/mgmt/sections')||[];renderMgmtSubmenu();openSection(r.section.id);}
}
async function editMgmtSection(){
  if(!curSection)return;
  const name=prompt('Название раздела:',curSection.name);if(!name)return;
  const ic=prompt('Иконка (key, doc, folder, box, building, globe, phone, lock...):',curSection.icon)||curSection.icon;
  await api('PATCH',`/mgmt/sections/${curSection.id}`,{name,icon:ic,color:curSection.color});
  curSection.name=name;curSection.icon=ic;toast('Сохранено');
  mgmtSections=await api('GET','/mgmt/sections')||[];renderMgmtSubmenu();openSection(curSection.id);
}
async function delMgmtSection(){
  if(!curSection||!confirm(`Удалить раздел «${curSection.name}» со всеми записями?`))return;
  await api('DELETE',`/mgmt/sections/${curSection.id}`);
  curSection=null;toast('Раздел удалён');
  mgmtSections=await api('GET','/mgmt/sections')||[];renderMgmtSubmenu();
  document.getElementById('mgmt-main').innerHTML='<div class="empty"><div class="e-ico">🗂</div>Выберите раздел в меню слева</div>';
}

// Fields modal
async function openFieldsModal(){
  curFields=await api('GET',`/mgmt/sections/${curSection.id}/fields`)||[];
  renderFieldsList();
  document.getElementById('mf-type').onchange=function(){
    document.getElementById('mf-options-wrap').style.display=this.value==='select'?'block':'none';
    document.getElementById('mf-expiry-wrap').style.display=this.value==='date'?'flex':'none';
  };
  openM('m-mgmt-fields');
}
function renderFieldsList(){
  const types={text:'Текст',number:'Число',date:'Дата',textarea:'Многострочный',file:'Файл',select:'Список'};
  document.getElementById('mgmt-fields-list').innerHTML=curFields.length?curFields.map(f=>`<div class="info-row"><span>${f.name} <span style="color:var(--text3);font-size:11px">(${types[f.field_type]})${f.required?' *':''}${f.is_expiry?' 📅истечение':''}</span></span><button class="btn btn-danger btn-icon btn-sm" onclick="delMgmtField(${f.id})">🗑</button></div>`).join(''):'<div style="color:var(--text3);font-size:13px">Полей пока нет</div>';
}
async function addMgmtField(){
  const name=document.getElementById('mf-name').value.trim();if(!name)return toast('Введите название поля','err');
  const r=await api('POST',`/mgmt/sections/${curSection.id}/fields`,{name,field_type:document.getElementById('mf-type').value,required:document.getElementById('mf-required').checked,options:document.getElementById('mf-options').value,is_expiry:document.getElementById('mf-expiry').checked});
  if(r.success){document.getElementById('mf-name').value='';document.getElementById('mf-options').value='';document.getElementById('mf-expiry').checked=false;curFields.push(r.field);renderFieldsList();toast('Поле добавлено');}
}
async function delMgmtField(id){
  if(!confirm('Удалить поле?'))return;
  await api('DELETE',`/mgmt/fields/${id}`);curFields=curFields.filter(f=>f.id!==id);renderFieldsList();toast('Удалено');
}

// Record modal
async function openRecord(id){
  editRecId=id||null;recFilesToUpload=null;
  if(!curFields.length)curFields=await api('GET',`/mgmt/sections/${curSection.id}/fields`)||[];
  document.getElementById('m-mgmt-rec-title').textContent=id?'Редактировать запись':'Новая запись';
  let data={},files=[];
  if(id){const rec=await api('GET',`/mgmt/records/${id}`);data=typeof rec.data==='string'?JSON.parse(rec.data):(rec.data||{});files=rec.files;if(typeof files==='string'){try{files=JSON.parse(files)}catch(e){files=[]}}}
  const box=document.getElementById('mgmt-rec-fields');
  box.innerHTML=curFields.map(f=>{
    const v=data[f.field_key]||'';
    if(f.field_type==='textarea')return `<div class="fgroup" style="margin-bottom:10px"><label>${f.name}${f.required?' <span class="req">*</span>':''}</label><textarea data-fk="${f.field_key}">${v}</textarea></div>`;
    if(f.field_type==='select'){const opts=(f.options||'').split(',').map(o=>o.trim()).filter(Boolean);return `<div class="fgroup" style="margin-bottom:10px"><label>${f.name}${f.required?' <span class="req">*</span>':''}</label><select data-fk="${f.field_key}"><option value="">—</option>${opts.map(o=>`<option ${v===o?'selected':''}>${o}</option>`).join('')}</select></div>`;}
    if(f.field_type==='file')return `<div class="fgroup" style="margin-bottom:10px"><label>${f.name} (файлы)</label><input type="file" data-fk="${f.field_key}" data-isfile="1" multiple></div>`;
    const t=f.field_type==='number'?'number':f.field_type==='date'?'date':'text';
    return `<div class="fgroup" style="margin-bottom:10px"><label>${f.name}${f.required?' <span class="req">*</span>':''}</label><input type="${t}" data-fk="${f.field_key}" value="${v}"></div>`;
  }).join('')||'<div style="color:var(--text3)">Сначала добавьте поля (⚙️ Поля)</div>';
  document.getElementById('mgmt-rec-files').innerHTML=(files&&files.length)?files.map(f=>`<a href="/uploads/${f.path}" target="_blank" class="tag-chip" style="text-decoration:none">📎 ${f.name}</a>`).join(''):'';
  document.getElementById('mgmt-rec-alert').innerHTML='';
  openM('m-mgmt-rec');
}
async function saveMgmtRecord(){
  const data={};const fd=new FormData();let hasFiles=false;
  for(const el of document.querySelectorAll('#mgmt-rec-fields [data-fk]')){
    if(el.dataset.isfile){for(const f of el.files){fd.append('files',f);hasFiles=true;}}
    else data[el.dataset.fk]=el.value;
  }
  // required check
  for(const f of curFields){if(f.required&&f.field_type!=='file'&&!data[f.field_key]){document.getElementById('mgmt-rec-alert').innerHTML=`<div class="alert alert-err">Заполните: ${f.name}</div>`;return;}}
  const title=data[curFields[0]?.field_key]||data.name||'Без названия';
  fd.append('data',JSON.stringify(data));fd.append('title',title);
  const r=editRecId?await api('PATCH',`/mgmt/records/${editRecId}`,fd,true):await api('POST',`/mgmt/sections/${curSection.id}/records`,fd,true);
  if(r.success){closeM('m-mgmt-rec');toast('Сохранено');openSection(curSection.id);}
  else document.getElementById('mgmt-rec-alert').innerHTML=`<div class="alert alert-err">${r.error||'Ошибка'}</div>`;
}
async function delRecord(id){
  if(!confirm('Удалить запись?'))return;
  await api('DELETE',`/mgmt/records/${id}`);toast('Удалено');openSection(curSection.id);
}

// ── CUSTOM DASHBOARDS (конструктор виджетов) ──
let dashboards=[], curDash=null, cdEditMode=false, cdSources={mgmt_sections:[]};
const METRICS={
  tickets:{
    counter:[['total','Всего тикетов'],['open','Открытые'],['unresolved','Нерешённые'],['sla_breached','Нарушений SLA'],['resolved_today','Решено сегодня']],
    donut:[['by_status','По статусам'],['by_priority','По приоритетам'],['by_source','По источникам']],
    bar:[['by_agent','По агентам'],['by_status','По статусам'],['by_priority','По приоритетам'],['by_source','По источникам']],
    line:[['created','Создано по дням']],
    table:[['recent','Последние тикеты'],['top_requesters','Топ заявителей']],
    progress:[['resolve_rate','% решаемости'],['sla_rate','% соблюдения SLA']]
  },
  inventory:{
    counter:[['total','Всего единиц'],['available','Свободно'],['assigned','Выдано'],['maintenance','В ремонте'],['warranty_soon','Гарантия истекает (30д)']],
    donut:[['by_status','По статусам'],['by_category','По категориям']],
    bar:[['by_category','По категориям'],['by_status','По статусам']],
    line:[],table:[['warranty_soon','Гарантия истекает']],progress:[]
  },
  mgmt:{
    counter:[['total','Всего записей'],['expiring','Истекает (30д)'],['expired','Истекло']],
    donut:[],bar:[],line:[],table:[['expiring','Истекает скоро']],progress:[]
  }
};
async function loadCustomDash(){
  dashboards=await api('GET','/dashboards')||[];
  cdSources=await api('GET','/dashboards-sources')||{mgmt_sections:[]};
  renderCdTabs();
  if(dashboards.length){if(!curDash||!dashboards.find(d=>d.id===curDash.id))curDash=dashboards[0];openDashboard(curDash.id);}
  else{curDash=null;document.getElementById('cd-content').innerHTML='<div class="empty"><div class="e-ico">🧩</div>Создайте свой первый дашборд кнопкой «+ Дашборд»</div>';document.getElementById('cd-actions').innerHTML='';}
}
function renderCdTabs(){
  document.getElementById('cd-tabs').innerHTML=dashboards.map(d=>`<button class="dash-tab${curDash&&curDash.id===d.id?' active':''}" onclick="openDashboard(${d.id})">${d.is_shared?'👥 ':''}${d.name}</button>`).join('')||'<span style="color:var(--text3);font-size:13px;padding:8px">Нет дашбордов</span>';
}
async function openDashboard(id){
  curDash=dashboards.find(d=>d.id===id);if(!curDash)return;
  renderCdTabs();
  const canEdit=curDash.owner_id===me.id||me.role==='admin';
  document.getElementById('cd-actions').innerHTML=canEdit?`
    <button class="btn ${cdEditMode?'btn-primary':'btn-ghost'} btn-sm" onclick="toggleCdEdit()">${cdEditMode?'✓ Готово':'✏️ Редактировать'}</button>
    ${cdEditMode?`<button class="btn btn-ghost btn-sm" onclick="openWidgetBuilder()">+ Виджет</button><button class="btn btn-ghost btn-sm" onclick="renameDashboard()">✏️ Имя</button><button class="btn btn-danger btn-sm" onclick="delDashboard()">🗑</button>`:''}
  `:'';
  const widgets=await api('GET',`/dashboards/${id}/widgets`)||[];
  renderWidgets(widgets);
}
function toggleCdEdit(){cdEditMode=!cdEditMode;openDashboard(curDash.id);}
function renderWidgets(widgets){
  const c=document.getElementById('cd-content');
  if(!widgets.length){c.innerHTML=`<div class="empty"><div class="e-ico">📊</div>${cdEditMode?'Нажмите «+ Виджет» чтобы добавить':'Дашборд пуст. Включите редактирование.'}</div>`;return;}
  c.innerHTML=`<div class="cd-grid">${widgets.map(w=>renderWidget(w)).join('')}</div>`;
  setTimeout(()=>document.querySelectorAll('#cd-content .bar-fill,#cd-content .col-fill').forEach(b=>{if(b.dataset.w)b.style.width=b.dataset.w;if(b.dataset.h)b.style.height=b.dataset.h;}),50);
  if(cdEditMode)enableWidgetDrag();
}
function renderWidget(w){
  const d=w.data||{};
  const col=w.color||'#4f8ef7';
  const editBar=cdEditMode?`<div class="w-edit"><span class="w-drag" title="Перетащить">⠿</span><input type="color" value="${col}" onchange="setWidgetColor(${w.id},this.value)" title="Цвет" style="width:24px;height:24px;padding:0;border:none;background:none"><button class="btn btn-ghost btn-icon btn-sm" onclick="cycleWidth(${w.id},${w.width})" title="Размер">↔</button><button class="btn btn-danger btn-icon btn-sm" onclick="delWidget(${w.id})">🗑</button></div>`:'';
  let inner='';
  const title=w.title||autoTitle(w);
  if(w.widget_type==='counter'){
    inner=`<div class="stat-lbl">${title}</div><div class="stat-val" style="color:${col}">${d.value??0}</div>`;
  } else if(w.widget_type==='progress'){
    const v=d.value||0;
    inner=`<div class="stat-lbl">${title}</div><div style="font-size:26px;font-weight:800;color:${col};margin:6px 0">${v}%</div><div class="bar-track"><div class="bar-fill" data-w="${v}%" style="width:0;background:${col}"></div></div><div style="font-size:11px;color:var(--text3);margin-top:5px">${d.label||''}</div>`;
  } else if(w.widget_type==='donut'){
    const items=d.items||[];const total=items.reduce((a,b)=>a+b.value,0)||1;
    const palette=[col,'#22c55e','#f59e0b','#a855f7','#ef4444','#14b8a6','#38bdf8','#ec4899'];
    let off=0;const r=46,circ=2*Math.PI*r;
    const segs=items.map((it,i)=>{const len=it.value/total*circ;const s=`<circle cx="56" cy="56" r="${r}" fill="none" stroke="${palette[i%palette.length]}" stroke-width="14" stroke-dasharray="${len} ${circ-len}" stroke-dashoffset="${-off}"/>`;off+=len;return s;}).join('');
    const legend=items.map((it,i)=>`<div class="legend-item"><span class="legend-dot" style="background:${palette[i%palette.length]}"></span>${it.label}<span class="legend-val">${it.value}</span></div>`).join('');
    inner=`<div class="card-head">${title}</div><div class="donut-wrap"><div class="donut" style="width:112px;height:112px"><svg width="112" height="112" style="transform:rotate(-90deg)">${segs}</svg><div class="donut-center"><div class="num">${total}</div></div></div><div class="donut-legend">${legend||'<span style="color:var(--text3)">Нет данных</span>'}</div></div>`;
  } else if(w.widget_type==='bar'){
    const items=d.items||[];const max=Math.max(...items.map(i=>i.value),1);
    inner=`<div class="card-head">${title}</div><div class="bars">${items.map(it=>`<div class="bar-row"><div class="bar-lbl">${it.label}</div><div class="bar-track"><div class="bar-fill" data-w="${Math.round(it.value/max*100)}%" style="width:0;background:${col}"></div></div><div class="bar-val">${it.value}</div></div>`).join('')||'<span style="color:var(--text3)">Нет данных</span>'}</div>`;
  } else if(w.widget_type==='line'){
    const items=d.items||[];const max=Math.max(...items.map(i=>i.value),1);
    inner=`<div class="card-head">${title}</div><div class="col-chart">${items.map(it=>`<div class="col-bar"><div class="col-fill" data-h="${Math.round(it.value/max*120)}px" style="height:2px;background:${col}"></div><div class="col-lbl">${new Date(it.label).toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'})}</div></div>`).join('')||'<span style="color:var(--text3)">Нет данных</span>'}</div>`;
  } else if(w.widget_type==='table'){
    const rows=d.rows||[];
    inner=`<div class="card-head">${title}</div>${rows.length?rows.map(r=>{
      if(r.number)return `<div class="info-row" style="cursor:pointer" onclick="openTicket(${r.id})"><span style="font-size:13px">#${r.number} ${(r.subject||'').substring(0,28)}</span>${r.status?sBadge(r.status):''}</div>`;
      if(r.requester_email!==undefined)return `<div class="info-row"><span>${r.requester_name||r.requester_email}</span><span style="font-weight:700">${r.c}</span></div>`;
      if(r.warranty_until!==undefined)return `<div class="info-row"><span>${r.name}</span><span style="color:var(--warning)">${fmtDS(r.warranty_until)}</span></div>`;
      if(r.date!==undefined)return `<div class="info-row"><span>${r.title}</span><span style="color:var(--warning)">${fmtDS(r.date)}</span></div>`;
      return '';
    }).join(''):'<span style="color:var(--text3)">Нет данных</span>'}`;
  }
  return `<div class="cd-widget w-${w.width||1}" data-wid="${w.id}" draggable="${cdEditMode}">${editBar}${inner}</div>`;
}
function autoTitle(w){
  const src=w.source==='tickets'?'Тикеты':w.source==='inventory'?'Склад':(cdSources.mgmt_sections.find(s=>'mgmt:'+s.id===w.source)?.name||'Раздел');
  const m=(METRICS[w.source==='tickets'?'tickets':w.source==='inventory'?'inventory':'mgmt'][w.widget_type]||[]).find(x=>x[0]===w.metric);
  return `${src}: ${m?m[1]:w.metric}`;
}
// builder
async function addDashboard(){
  const name=prompt('Название дашборда:');if(!name)return;
  let shared=false;
  if(me.role==='admin')shared=confirm('Сделать общим (виден всем агентам)? OK — общий, Отмена — только мой');
  const r=await api('POST','/dashboards',{name,is_shared:shared});
  if(r.success){toast('Дашборд создан');dashboards.push(r.dashboard);curDash=r.dashboard;cdEditMode=true;renderCdTabs();openDashboard(r.dashboard.id);}
}
async function renameDashboard(){const name=prompt('Новое название:',curDash.name);if(!name)return;await api('PATCH',`/dashboards/${curDash.id}`,{name,is_shared:curDash.is_shared});curDash.name=name;toast('Сохранено');loadCustomDash();}
async function delDashboard(){if(!confirm(`Удалить дашборд «${curDash.name}»?`))return;await api('DELETE',`/dashboards/${curDash.id}`);toast('Удалён');curDash=null;cdEditMode=false;loadCustomDash();}
function openWidgetBuilder(){
  const ss=document.getElementById('w-source');
  ss.innerHTML=`<option value="tickets">Тикеты</option><option value="inventory">Склад</option>`+cdSources.mgmt_sections.map(s=>`<option value="mgmt:${s.id}">${s.name}</option>`).join('');
  document.getElementById('w-type').value='counter';
  document.getElementById('w-title').value='';document.getElementById('w-width').value='1';document.getElementById('w-color').value='#4f8ef7';document.getElementById('w-alert').innerHTML='';
  onWidgetSourceChange();
  openM('m-widget');
}
function srcKey(){const s=document.getElementById('w-source').value;return s==='tickets'?'tickets':s==='inventory'?'inventory':'mgmt';}
function onWidgetTypeChange(){fillMetrics();}
function onWidgetSourceChange(){fillMetrics();}
function fillMetrics(){
  const type=document.getElementById('w-type').value;
  const list=METRICS[srcKey()][type]||[];
  const m=document.getElementById('w-metric');
  m.innerHTML=list.length?list.map(([v,l])=>`<option value="${v}">${l}</option>`).join(''):'<option value="">— нет метрик для этого типа —</option>';
}
async function saveWidget(){
  const type=document.getElementById('w-type').value;
  const metric=document.getElementById('w-metric').value;
  if(!metric){document.getElementById('w-alert').innerHTML='<div class="alert alert-err">Этот тип виджета недоступен для выбранного источника. Выберите другой тип или источник.</div>';return;}
  const b={widget_type:type,source:document.getElementById('w-source').value,metric,title:document.getElementById('w-title').value,width:parseInt(document.getElementById('w-width').value),color:document.getElementById('w-color').value};
  const r=await api('POST',`/dashboards/${curDash.id}/widgets`,b);
  if(r.success){closeM('m-widget');toast('Виджет добавлен');openDashboard(curDash.id);}
  else document.getElementById('w-alert').innerHTML=`<div class="alert alert-err">${r.error||'Ошибка'}</div>`;
}
async function setWidgetColor(id,color){await api('PATCH',`/widgets/${id}`,{color});const w=document.querySelector(`[data-wid="${id}"]`);openDashboard(curDash.id);}
async function cycleWidth(id,cur){const next=cur>=3?1:cur+1;await api('PATCH',`/widgets/${id}`,{width:next});openDashboard(curDash.id);}
async function delWidget(id){if(!confirm('Удалить виджет?'))return;await api('DELETE',`/widgets/${id}`);toast('Удалён');openDashboard(curDash.id);}
// drag & drop reorder
let dragWid=null;
function enableWidgetDrag(){
  document.querySelectorAll('#cd-content .cd-widget').forEach(el=>{
    el.ondragstart=e=>{dragWid=el.dataset.wid;el.style.opacity='.4';};
    el.ondragend=e=>{el.style.opacity='';};
    el.ondragover=e=>{e.preventDefault();el.style.outline='2px dashed var(--accent)';};
    el.ondragleave=e=>{el.style.outline='';};
    el.ondrop=async e=>{e.preventDefault();el.style.outline='';if(dragWid&&dragWid!==el.dataset.wid){
      const ids=[...document.querySelectorAll('#cd-content .cd-widget')].map(x=>x.dataset.wid);
      const from=ids.indexOf(dragWid),to=ids.indexOf(el.dataset.wid);
      ids.splice(to,0,ids.splice(from,1)[0]);
      await api('POST','/widgets/reorder',{order:ids});openDashboard(curDash.id);
    }};
  });
}

// ── THEMES ──
function setTheme(t){
  if(t)document.documentElement.setAttribute('data-theme',t);
  else document.documentElement.removeAttribute('data-theme');
  try{localStorage.setItem('hd_theme',t||'');}catch(e){}
  document.getElementById('theme-panel')?.classList.remove('open');
}
function toggleThemeMenu(){document.getElementById('theme-panel')?.classList.toggle('open');}
(function initTheme(){
  try{const t=localStorage.getItem('hd_theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}
})();
document.addEventListener('click',e=>{const p=document.getElementById('theme-panel');if(p&&!p.contains(e.target)&&!e.target.closest('[onclick*=toggleThemeMenu]'))p.classList.remove('open');});

checkAuth();
