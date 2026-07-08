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
    console.log('🔄 Создаю конструктор дашбордов...');
    await c.query(`
      CREATE TABLE IF NOT EXISTS dashboards (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        is_shared BOOLEAN DEFAULT false,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await c.query(`
      CREATE TABLE IF NOT EXISTS dashboard_widgets (
        id SERIAL PRIMARY KEY,
        dashboard_id INTEGER REFERENCES dashboards(id) ON DELETE CASCADE NOT NULL,
        widget_type VARCHAR(30) NOT NULL,
        title VARCHAR(200),
        source VARCHAR(50),
        metric VARCHAR(80),
        color VARCHAR(20) DEFAULT '#4f8ef7',
        width INTEGER DEFAULT 1,
        config JSONB DEFAULT '{}',
        sort_order INTEGER DEFAULT 0
      );
    `);
    await c.query(`CREATE INDEX IF NOT EXISTS idx_dw_dash ON dashboard_widgets(dashboard_id)`);
    console.log('✅ Готово! Таблицы dashboards, dashboard_widgets');
  } catch(e){ console.error('❌',e.message); process.exit(1); }
  finally { c.release(); await pool.end(); }
}
run();
