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
    console.log('🔄 Добавляю переключатель вкл/выкл для шаблонов...');
    await c.query(`ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT true`);
    console.log('✅ Готово! Добавлено поле enabled (все шаблоны включены по умолчанию)');
  } catch(e){ console.error('❌',e.message); process.exit(1); }
  finally { c.release(); await pool.end(); }
}
run();
