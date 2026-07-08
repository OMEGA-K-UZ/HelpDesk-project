# 🎫 eMaktab HelpDesk v2

Полнофункциональная система поддержки: тикеты, email-интеграция, база знаний, инвентаризация, аналитика, автоматизация, Telegram.

## Установка

### 1. PostgreSQL
```bash
sudo apt install postgresql -y
sudo -u postgres psql -c "CREATE DATABASE helpdesk;"
sudo -u postgres psql -c "CREATE USER helpdesk_user WITH PASSWORD 'pass123';"
sudo -u postgres psql -c "GRANT ALL ON DATABASE helpdesk TO helpdesk_user;"
sudo -u postgres psql -d helpdesk -c "GRANT ALL ON SCHEMA public TO helpdesk_user;"
```

### 2. Настройка
```bash
cp .env.example .env
nano .env   # DB_PASS, SESSION_SECRET, APP_URL
```

### 3. Запуск
```bash
npm install
npm run migrate
npm start
```

Открыть: http://localhost:4000
Логин: **admin@helpdesk.local** / **admin123**

## Важно
Все настройки Telegram, Email (IMAP/SMTP), автоматизации — **через веб-интерфейс**, раздел Настройки. В `.env` только база данных и сервер.

## Nginx + SSL
```nginx
server {
    server_name helpdesk.your-domain.com;
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        client_max_body_size 20M;
    }
}
```
```bash
sudo certbot --nginx -d helpdesk.your-domain.com
```

## PM2 (автозапуск)
```bash
npm install -g pm2
pm2 start src/server.js --name helpdesk
pm2 save && pm2 startup
```

## Функционал
- 🎫 Тикеты — статусы, приоритеты, назначение, комментарии, заметки
- 📧 Email — IMAP приём (письма→тикеты), SMTP ответы, автоответ, нерабочее время
- 📊 Дашборд — 3 вида (Тикеты/Склад/Аналитика), произвольный период
- 📦 Инвентаризация — категории, дашборд с пончиками, выдача, гарантия, история
- 📚 База знаний — Markdown статьи, категории
- 📈 Аналитика — рейтинг агентов, нагрузка, экспорт Excel/CSV
- 🤖 Автоматизация — правила маршрутизации, эскалация
- ✈️ Telegram — настройка токена/уведомлений через веб, тест-кнопка
- 👥 Агенты — роли admin/agent/viewer
- ⚙️ Настройки — всё через веб

## Настройка Telegram
1. @BotFather → /newbot → получить токен
2. Настройки → Telegram → вставить токен, ID администратора
3. Включить тумблер, нажать "Тест"
