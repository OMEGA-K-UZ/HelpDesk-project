require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'helpdesk',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS
});
async function run(){
  const c = await pool.connect();
  try {
    console.log('🔄 Создаю конструктор Telegram-ботов...');
    await c.query(`
      CREATE TABLE IF NOT EXISTS tg_bots (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        token TEXT NOT NULL,
        chat_id VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        events JSONB DEFAULT '{}',
        expiry_days JSONB DEFAULT '[30,7,1]',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await c.query(`
      CREATE TABLE IF NOT EXISTS tg_schedules (
        id SERIAL PRIMARY KEY,
        bot_id INTEGER REFERENCES tg_bots(id) ON DELETE CASCADE NOT NULL,
        title VARCHAR(200),
        message TEXT NOT NULL,
        freq VARCHAR(20) DEFAULT 'weekly',
        day_of_week INTEGER,
        day_of_month INTEGER,
        run_date DATE,
        run_time VARCHAR(5) DEFAULT '17:00',
        is_active BOOLEAN DEFAULT true,
        last_run DATE
      );
    `);
    await c.query(`CREATE INDEX IF NOT EXISTS idx_tg_sched_bot ON tg_schedules(bot_id)`);
    console.log('✅ Готово! Таблицы tg_bots, tg_schedules');
  } catch(e){ console.error('❌',e.message); process.exit(1); }
  finally { c.release(); await pool.end(); }
}
run();
