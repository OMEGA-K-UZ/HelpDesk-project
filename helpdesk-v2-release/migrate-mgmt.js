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
    console.log('🔄 Создаю конструктор "Управление"...');
    // Подразделы (Лицензии, Договоры, Поставщики...)
    await c.query(`
      CREATE TABLE IF NOT EXISTS mgmt_sections (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        icon VARCHAR(10) DEFAULT '📋',
        color VARCHAR(20) DEFAULT '#4f8ef7',
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    // Поля каждого подраздела
    await c.query(`
      CREATE TABLE IF NOT EXISTS mgmt_fields (
        id SERIAL PRIMARY KEY,
        section_id INTEGER REFERENCES mgmt_sections(id) ON DELETE CASCADE NOT NULL,
        name VARCHAR(200) NOT NULL,
        field_key VARCHAR(100) NOT NULL,
        field_type VARCHAR(30) DEFAULT 'text' CHECK (field_type IN ('text','number','date','textarea','file','select')),
        options TEXT,
        required BOOLEAN DEFAULT false,
        sort_order INTEGER DEFAULT 0
      );
    `);
    // Записи (значения полей хранятся в JSONB)
    await c.query(`
      CREATE TABLE IF NOT EXISTS mgmt_records (
        id SERIAL PRIMARY KEY,
        section_id INTEGER REFERENCES mgmt_sections(id) ON DELETE CASCADE NOT NULL,
        title VARCHAR(300),
        data JSONB DEFAULT '{}',
        files JSONB DEFAULT '[]',
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await c.query(`CREATE INDEX IF NOT EXISTS idx_mgmt_fields_section ON mgmt_fields(section_id)`);
    await c.query(`CREATE INDEX IF NOT EXISTS idx_mgmt_records_section ON mgmt_records(section_id)`);

    // Демо-раздел "Лицензии" с полями, если секций ещё нет
    const ex = await c.query('SELECT COUNT(*) FROM mgmt_sections');
    if (parseInt(ex.rows[0].count) === 0) {
      const s = await c.query(`INSERT INTO mgmt_sections(name,icon,color,sort_order) VALUES('Лицензии','🔑','#4f8ef7',1) RETURNING id`);
      const sid = s.rows[0].id;
      const fields = [
        ['Наименование','name','text',true,1],
        ['Количество','qty','number',false,2],
        ['Дата закупки','purchase_date','date',false,3],
        ['Дата истечения','expire_date','date',false,4],
        ['Поставщик','vendor','text',false,5],
        ['Примечания','notes','textarea',false,6],
      ];
      for (const [name,key,type,req,ord] of fields) {
        await c.query(`INSERT INTO mgmt_fields(section_id,name,field_key,field_type,required,sort_order) VALUES($1,$2,$3,$4,$5,$6)`,[sid,name,key,type,req,ord]);
      }
      // ещё пара пустых разделов для примера
      await c.query(`INSERT INTO mgmt_sections(name,icon,color,sort_order) VALUES('Договоры','📑','#22c55e',2),('Поставщики','🏢','#f59e0b',3),('Документы','📁','#a855f7',4)`);
      console.log('  + демо-раздел «Лицензии» с полями создан');
    }
    console.log('✅ Готово! Таблицы mgmt_sections, mgmt_fields, mgmt_records');
  } catch(e){ console.error('❌',e.message); process.exit(1); }
  finally { c.release(); await pool.end(); }
}
run();
