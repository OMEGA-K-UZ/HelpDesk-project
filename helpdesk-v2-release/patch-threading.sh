#!/bin/bash
set -e
cd "$(dirname "$0")"
if [ ! -f src/email.js ]; then
  echo "❌ Запускай из корня проекта (где src/email.js). Сейчас: $(pwd)"; exit 1
fi
echo "→ Проект: $(pwd)"

echo "→ 1/4 email.js: genMessageId без угловых скобок..."
python3 - << 'PY'
f='src/email.js'
s=open(f,encoding='utf-8').read()
old="  return `<hd-${Date.now()}-${Math.random().toString(36).slice(2,10)}@${domain}>`;"
new="  return `hd-${Date.now()}-${Math.random().toString(36).slice(2,10)}@${domain}`;"
if old in s:
    s=s.replace(old,new); open(f,'w',encoding='utf-8').write(s); print("  ✅ genMessageId исправлен (скобки убраны)")
elif "return `hd-${Date.now()}" in s:
    print("  ⏭️  уже без скобок")
else:
    print("  ❌ genMessageId не найден в ожидаемом виде")
PY

echo "→ 2/4 email.js: helper stripBrackets + нормализация входящих..."
python3 - << 'PY'
f='src/email.js'
s=open(f,encoding='utf-8').read()
if "function stripMid" not in s:
    # добавим helper перед genMessageId
    anchor="// Build our own Message-ID so we can store and thread on it"
    helper="""// Normalize message-id: always store/compare WITHOUT angle brackets
function stripMid(v){
  if (v==null) return v;
  if (Array.isArray(v)) return v.map(stripMid).filter(Boolean);
  return String(v).trim().replace(/^<|>$/g,'').trim() || null;
}

"""
    s=s.replace(anchor, helper+anchor, 1)
    print("  ✅ helper stripMid добавлен")
else:
    print("  ⏭️  helper уже есть")

# нормализуем парсинг входящих
old="""  const messageId = parsed.messageId;
  const inReplyTo = parsed.inReplyTo;
  const refs = parsed.references;"""
new="""  const messageId = stripMid(parsed.messageId);
  const inReplyTo = stripMid(parsed.inReplyTo);
  const refs = stripMid(parsed.references);"""
if old in s:
    s=s.replace(old,new); print("  ✅ входящие message-id нормализованы")
elif "stripMid(parsed.messageId)" in s:
    print("  ⏭️  входящие уже нормализованы")
else:
    print("  ⚠️  блок парсинга не найден — проверь вручную")
open(f,'w',encoding='utf-8').write(s)
PY

echo "→ 3/4 email.js: нормализация в refIds при поиске тикета..."
python3 - << 'PY'
f='src/email.js'
s=open(f,encoding='utf-8').read()
old="""    const refIds = [];
    if (inReplyTo) refIds.push(inReplyTo);
    if (refs) Array.isArray(refs) ? refIds.push(...refs) : refIds.push(refs);"""
new="""    let refIds = [];
    if (inReplyTo) refIds.push(inReplyTo);
    if (refs) Array.isArray(refs) ? refIds.push(...refs) : refIds.push(refs);
    refIds = refIds.map(stripMid).filter(Boolean);"""
if old in s:
    s=s.replace(old,new); open(f,'w',encoding='utf-8').write(s); print("  ✅ refIds нормализованы")
elif "refIds.map(stripMid)" in s:
    print("  ⏭️  уже нормализовано")
else:
    print("  ⚠️  блок refIds не найден — проверь вручную")
PY

echo "→ 4/4 SQL: чистим уже сохранённые id от скобок..."
cat > /tmp/fix-mids.sql << 'SQL'
UPDATE tickets SET email_message_id = trim(both '<>' from email_message_id)
  WHERE email_message_id LIKE '<%' OR email_message_id LIKE '%>';
UPDATE ticket_comments SET email_message_id = trim(both '<>' from email_message_id)
  WHERE email_message_id LIKE '<%' OR email_message_id LIKE '%>';
SQL
echo "  (SQL-файл готов: /tmp/fix-mids.sql — применим ниже)"

echo ""
echo "→ Проверка синтаксиса..."
node -c src/email.js && echo "  ✅ email.js OK"
echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ Код пропатчен. Осталось 2 команды:"
echo ""
echo "  # 1. почистить старые id в БД (склеит существующие треды):"
echo "  sudo -u postgres psql -d helpdesk -f /tmp/fix-mids.sql"
echo ""
echo "  # 2. перезапустить:"
echo "  pm2 restart helpdesk"
echo "═══════════════════════════════════════════════════"
