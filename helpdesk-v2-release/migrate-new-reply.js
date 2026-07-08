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
    console.log('🔄 Добавляю метку нового ответа...');
    await c.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS has_new_reply BOOLEAN DEFAULT false`);
    await c.query(`CREATE INDEX IF NOT EXISTS idx_tickets_newreply ON tickets(has_new_reply)`);
    console.log('✅ Готово! Добавлено: has_new_reply');
  } catch(e){ console.error('❌',e.message); process.exit(1); }
  finally { c.release(); await pool.end(); }
}
run();
