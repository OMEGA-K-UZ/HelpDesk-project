#!/bin/bash
# Установка HelpDesk v2 на НОВЫЙ сервер. Запускать из папки проекта.
set -e
echo "═══════════════════════════════════════"
echo "  HelpDesk v2 — установка"
echo "═══════════════════════════════════════"

# 1. Проверки
command -v node >/dev/null || { echo "❌ Node.js не установлен. Установите Node 18+ и повторите."; exit 1; }
command -v psql >/dev/null || { echo "❌ PostgreSQL (psql) не установлен."; exit 1; }
echo "✅ Node $(node -v), PostgreSQL найден"

# 2. .env
if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "⚠️  Создан .env из шаблона. ОТРЕДАКТИРУЙТЕ его (пароль БД, APP_URL, SESSION_SECRET):"
  echo "    nano .env"
  echo "Затем запустите ./install.sh снова."
  exit 0
fi
echo "✅ .env найден"

# 3. Зависимости
echo "→ Устанавливаю npm-зависимости..."
npm install --production

# 4. Папки
mkdir -p data/uploads
echo "✅ Папка data/uploads создана"

# 5. Миграции
echo "→ Применяю миграции БД..."
# базовая миграция (создание всех таблиц) — если есть migrate.js в src
if [ -f src/migrate.js ]; then node src/migrate.js; fi
# дополнительные миграции
for m in migrate-add-deleted.js migrate-new-reply.js migrate-contacts.js migrate-mgmt.js migrate-mgmt-expire.js migrate-dashboards.js migrate-bots.js migrate-sched-flex.js migrate-template-toggle.js; do
  if [ -f "$m" ]; then echo "  • $m"; node "$m" || echo "    (пропущено/уже применено)"; fi
done

echo ""
echo "═══════════════════════════════════════"
echo "✅ Установка завершена!"
echo "Запуск:"
echo "  pm2 start src/server.js --name helpdesk   (или: npm start)"
echo "Вход по умолчанию: admin@helpdesk.local / admin123"
echo "═══════════════════════════════════════"
