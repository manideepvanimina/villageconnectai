const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || '';

async function applyMigration() {
  const sqlPath = path.join(__dirname, 'migrations', '002_profile_and_auth.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const connectionStrings = [
    `postgres://postgres:${encodeURIComponent(DB_PASSWORD)}@db.irapflonmpvloyglqgqo.supabase.co:5432/postgres`,
    `postgres://postgres.irapflonmpvloyglqgqo:${encodeURIComponent(DB_PASSWORD)}@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`
  ];

  let client = null;
  for (const connStr of connectionStrings) {
    try {
      console.log('Connecting to PostgreSQL...');
      client = new Client({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000
      });
      await client.connect();
      console.log('Connected successfully!');
      break;
    } catch (e) {
      console.warn('Connection failed:', e.message);
      if (client) {
        try { await client.end(); } catch (err) {}
        client = null;
      }
    }
  }

  if (!client) {
    throw new Error('Could not connect to database.');
  }

  try {
    console.log('Executing 002_profile_and_auth.sql...');
    await client.query(sql);
    console.log('Migration 002 executed successfully!');

    const res = await client.query('SELECT id, full_name, username, email, phone_number, bio FROM public.profiles;');
    console.log('Profiles table verification:', res.rows);
  } finally {
    await client.end();
  }
}

applyMigration().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
