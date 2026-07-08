require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'helpdesk',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('🔄 Добавляю поддержку корзины...');
    // Add deleted flag for soft-delete (trash)
    await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false`);
    await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_tickets_deleted ON tickets(is_deleted)`);
    console.log('✅ Готово! Добавлены: is_deleted, deleted_at');
  } catch(e) {
    console.error('❌ Ошибка:', e.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}
run();
