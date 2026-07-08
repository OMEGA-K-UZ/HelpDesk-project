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
    console.log('🔄 Добавляю флаг "дата истечения" в поля...');
    await c.query(`ALTER TABLE mgmt_fields ADD COLUMN IF NOT EXISTS is_expiry BOOLEAN DEFAULT false`);
    // авто-пометить существующие поля с "истеч"/"окончан"/"expire" в названии
    await c.query(`UPDATE mgmt_fields SET is_expiry=true WHERE field_type='date' AND (LOWER(name) LIKE '%истеч%' OR LOWER(name) LIKE '%окончан%' OR LOWER(name) LIKE '%expire%' OR LOWER(name) LIKE '%до%')`);
    console.log('✅ Готово! Добавлено: is_expiry (поля с «истечением» помечены автоматически)');
  } catch(e){ console.error('❌',e.message); process.exit(1); }
  finally { c.release(); await pool.end(); }
}
run();
