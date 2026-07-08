require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'helpdesk',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('🔄 Running migrations...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(200) UNIQUE NOT NULL,
        password_hash VARCHAR(200) NOT NULL,
        role VARCHAR(20) DEFAULT 'agent' CHECK (role IN ('admin','agent','viewer')),
        department VARCHAR(100),
        telegram_id VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(200),
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        color VARCHAR(20) DEFAULT '#4f8ef7',
        icon VARCHAR(50) DEFAULT '📁',
        department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS sla_policies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        priority VARCHAR(20) NOT NULL,
        first_response_hours INTEGER DEFAULT 4,
        resolution_hours INTEGER DEFAULT 24,
        escalate_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        number VARCHAR(20) UNIQUE NOT NULL,
        subject VARCHAR(500) NOT NULL,
        description TEXT,
        status VARCHAR(30) DEFAULT 'open' CHECK (status IN ('open','in_progress','waiting','resolved','closed','planned')),
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
        source VARCHAR(20) DEFAULT 'web' CHECK (source IN ('web','email','telegram','phone')),
        requester_name VARCHAR(200),
        requester_email VARCHAR(200),
        requester_phone VARCHAR(50),
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        sla_policy_id INTEGER REFERENCES sla_policies(id) ON DELETE SET NULL,
        sla_due_at TIMESTAMPTZ,
        sla_breached BOOLEAN DEFAULT false,
        first_response_at TIMESTAMPTZ,
        resolved_at TIMESTAMPTZ,
        closed_at TIMESTAMPTZ,
        planned_at TIMESTAMPTZ,
        tags TEXT[] DEFAULT '{}',
        email_message_id VARCHAR(500),
        email_thread_id VARCHAR(500),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS ticket_comments (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
        author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        author_name VARCHAR(200),
        author_email VARCHAR(200),
        body TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT false,
        is_email BOOLEAN DEFAULT false,
        email_message_id VARCHAR(500),
        attachments JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS ticket_history (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        old_value TEXT,
        new_value TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS kb_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(200) UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR(50) DEFAULT '📚',
        color VARCHAR(20) DEFAULT '#4f8ef7',
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS kb_articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        body TEXT NOT NULL,
        category_id INTEGER REFERENCES kb_categories(id) ON DELETE SET NULL,
        author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        is_published BOOLEAN DEFAULT false,
        is_public BOOLEAN DEFAULT true,
        views INTEGER DEFAULT 0,
        helpful_yes INTEGER DEFAULT 0,
        helpful_no INTEGER DEFAULT 0,
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS inventory_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(10) DEFAULT '📦',
        color VARCHAR(20) DEFAULT '#4f8ef7',
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS inventory_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(300) NOT NULL,
        serial_number VARCHAR(200),
        asset_tag VARCHAR(100) UNIQUE,
        inventory_number VARCHAR(100),
        category_id INTEGER REFERENCES inventory_categories(id) ON DELETE SET NULL,
        status VARCHAR(30) DEFAULT 'available' CHECK (status IN ('available','assigned','maintenance','retired','lost','reserved')),
        assigned_to_name VARCHAR(200),
        assigned_to_email VARCHAR(200),
        assigned_at TIMESTAMPTZ,
        location VARCHAR(200),
        manufacturer VARCHAR(200),
        model VARCHAR(200),
        purchase_date DATE,
        purchase_price DECIMAL(12,2),
        warranty_until DATE,
        vendor VARCHAR(200),
        notes TEXT,
        custom_fields JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS inventory_history (
        id SERIAL PRIMARY KEY,
        item_id INTEGER REFERENCES inventory_items(id) ON DELETE CASCADE,
        action VARCHAR(100) NOT NULL,
        performed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        details JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS automation_rules (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        trigger_event VARCHAR(50) NOT NULL CHECK (trigger_event IN ('ticket_created','ticket_updated','ticket_commented','ticket_overdue')),
        condition_field VARCHAR(50),
        condition_operator VARCHAR(20),
        condition_value TEXT,
        action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('assign_agent','assign_department','set_priority','set_category','send_email','send_telegram','add_tag','escalate')),
        action_value TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS escalation_rules (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        priority VARCHAR(20) DEFAULT 'all',
        hours_unassigned INTEGER DEFAULT 4,
        hours_unresolved INTEGER DEFAULT 24,
        notify_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        notify_telegram BOOLEAN DEFAULT true,
        notify_email BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(300) NOT NULL,
        body TEXT,
        link VARCHAR(500),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS email_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        subject VARCHAR(500) NOT NULL,
        body TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)',
      'CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_to)',
      'CREATE INDEX IF NOT EXISTS idx_tickets_email ON tickets(requester_email)',
      'CREATE INDEX IF NOT EXISTS idx_tickets_created ON tickets(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority)',
      'CREATE INDEX IF NOT EXISTS idx_comments_ticket ON ticket_comments(ticket_id)',
      'CREATE INDEX IF NOT EXISTS idx_history_ticket ON ticket_history(ticket_id)',
      'CREATE INDEX IF NOT EXISTS idx_kb_published ON kb_articles(is_published)',
      'CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory_items(status)',
      'CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read)',
    ];
    for (const idx of indexes) await client.query(idx);

    const defaults = [
      ['company_name','eMaktab HelpDesk'],['company_email','help@emaktab.uz'],
      ['ticket_prefix','HD'],['default_priority','medium'],
      ['working_hours_start','09:00'],['working_hours_end','18:00'],
      ['working_days','1,2,3,4,5'],['auto_close_days','5'],
      ['imap_host',''],['imap_port','993'],['imap_user',''],['imap_pass',''],
      ['imap_encryption','ssl'],['imap_folder','INBOX'],['imap_interval','1'],['imap_enabled','false'],
      ['smtp_host',''],['smtp_port','587'],['smtp_user',''],['smtp_pass',''],
      ['smtp_encryption','tls'],['smtp_from_name','eMaktab HelpDesk'],['smtp_enabled','false'],
      ['tg_bot_token',''],['tg_admin_id',''],['tg_group_id',''],
      ['tg_notify_new_ticket','true'],['tg_notify_status_change','true'],
      ['tg_notify_assigned','true'],['tg_notify_sla_breach','true'],
      ['tg_notify_comment','false'],['tg_notify_escalation','true'],['tg_enabled','false'],
      ['sla_enabled','true'],['notify_new_ticket_email','true'],
    ];
    for (const [key, value] of defaults) {
      await client.query(`INSERT INTO settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO NOTHING`,[key,value]);
    }

    const templates = [
      ['ticket_created','Ваша заявка #{number} принята',
       'Уважаемый(ая) {name},\n\nВаша заявка успешно зарегистрирована.\n\n📋 Номер: #{number}\n📝 Тема: {subject}\n⚡ Приоритет: {priority}\n📅 Дата: {date}\n\nОтветьте на это письмо для уточнения деталей.\n\nС уважением,\nСлужба поддержки eMaktab'],
      ['ticket_replied','Re: [{number}] {subject}',
       'Уважаемый(ая) {name},\n\n{reply_body}\n\n---\nЗаявка #{number} | Статус: {status}\n\nС уважением,\n{agent}'],
      ['ticket_resolved','Заявка #{number} решена ✅',
       'Уважаемый(ая) {name},\n\nВаша заявка #{number} решена.\n\n✅ Решение: {resolution}\n\nЕсли проблема не решена — ответьте на это письмо.\n\nС уважением,\nСлужба поддержки eMaktab'],
      ['ticket_assigned','[#{number}] Назначена вам',
       'Здравствуйте, {agent_name}!\n\nВам назначена заявка #{number}: {subject}\n👤 От: {requester}\n⚡ Приоритет: {priority}\n\nПерейти: {ticket_url}'],
      ['out_of_hours','Re: [{number}] {subject}',
       'Уважаемый(ая) {name},\n\nСпасибо за обращение! Заявка #{number} зарегистрирована.\n\n🕐 Офис закрыт. Рабочие часы: Пн–Пт 09:00–18:00\n\nОтветим в ближайший рабочий день.\n\nС уважением,\nСлужба поддержки eMaktab'],
      ['escalation_notify','🚨 Требует внимания: заявка #{number}',
       'Здравствуйте!\n\nЗаявка требует внимания:\n📋 #{number}: {subject}\n👤 {requester}\n⚡ {priority}\n🚨 Причина: {reason}\n\nПерейти: {ticket_url}'],
    ];
    for (const [slug, subject, body] of templates) {
      await client.query(`INSERT INTO email_templates(name,slug,subject,body) VALUES($1,$2,$3,$4) ON CONFLICT(slug) DO NOTHING`,[slug,slug,subject,body]);
    }

    await client.query(`INSERT INTO sla_policies(name,priority,first_response_hours,resolution_hours) VALUES ('Критический','critical',1,4),('Высокий','high',2,8),('Средний','medium',4,24),('Низкий','low',8,72) ON CONFLICT DO NOTHING`);

    await client.query(`INSERT INTO kb_categories(name,slug,icon,color) VALUES ('Часто задаваемые вопросы','faq','❓','#4f8ef7'),('Инструкции','guides','📖','#34d399'),('Политики','policies','📋','#fbbf24'),('Технические вопросы','technical','⚙️','#a78bfa') ON CONFLICT DO NOTHING`);

    await client.query(`INSERT INTO inventory_categories(name,icon,color) VALUES ('Компьютеры','🖥','#4f8ef7'),('Ноутбуки','💻','#6366f1'),('Мониторы','🖨','#14b8a6'),('Принтеры','🖨','#f59e0b'),('Телефоны','📱','#22c55e'),('Сетевое оборудование','🌐','#8b5cf6'),('ИБП / PDU','🔌','#ef4444'),('Расходники','📦','#94a3b8'),('Прочее','📋','#64748b') ON CONFLICT DO NOTHING`);

    await client.query(`INSERT INTO automation_rules(name,trigger_event,condition_field,condition_operator,condition_value,action_type,action_value,sort_order) VALUES ('Принтер → категория','ticket_created','subject','contains','принтер','set_category','1',1),('Срочно → критический','ticket_created','subject','contains','срочно','set_priority','critical',2) ON CONFLICT DO NOTHING`);

    await client.query(`INSERT INTO escalation_rules(name,priority,hours_unassigned,hours_unresolved,notify_telegram,notify_email) VALUES ('Стандартная эскалация','all',4,48,true,true) ON CONFLICT DO NOTHING`);

    const hash = await bcrypt.hash('admin123', 10);
    await client.query(`INSERT INTO users(name,email,password_hash,role) VALUES('Администратор','admin@helpdesk.local',$1,'admin') ON CONFLICT(email) DO NOTHING`,[hash]);

    await client.query('COMMIT');
    console.log('✅ Migration completed!');
    console.log('👤 Login: admin@helpdesk.local / admin123');
  } catch(e) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', e.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
