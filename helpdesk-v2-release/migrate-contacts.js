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
    console.log('🔄 Создаю таблицу контактов...');
    await c.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(200) NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(200),
        position VARCHAR(200),
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
      CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
    `);
    console.log('✅ Готово! Таблица contacts создана');
  } catch(e){ console.error('❌',e.message); process.exit(1); }
  finally { c.release(); await pool.end(); }
}
run();
