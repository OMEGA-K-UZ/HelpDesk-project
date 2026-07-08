require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'helpdesk',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});

pool.on('error', err => console.error('DB pool error:', err.message));

async function query(sql, params) {
  const client = await pool.connect();
  try { return await client.query(sql, params); }
  finally { client.release(); }
}

async function getSetting(key) {
  const r = await query('SELECT value FROM settings WHERE key=$1', [key]);
  return r.rows[0]?.value ?? null;
}

async function setSetting(key, value) {
  await query(`INSERT INTO settings(key,value,updated_at) VALUES($1,$2,NOW()) ON CONFLICT(key) DO UPDATE SET value=$2,updated_at=NOW()`, [key, String(value ?? '')]);
}

async function getSettings(keys) {
  const r = await query('SELECT key,value FROM settings WHERE key=ANY($1)', [keys]);
  return Object.fromEntries(r.rows.map(r => [r.key, r.value]));
}

async function getAllSettings() {
  const r = await query('SELECT key,value FROM settings ORDER BY key');
  return Object.fromEntries(r.rows.map(r => [r.key, r.value]));
}

module.exports = { pool, query, getSetting, setSetting, getSettings, getAllSettings };
