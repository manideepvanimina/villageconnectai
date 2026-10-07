// Supabase Migration Runner for VillageConnect AI
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function runMigration() {
  console.log('🚀 Starting VillageConnect AI database migration...');
  
  const sqlFilePath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
  if (!fs.existsSync(sqlFilePath)) {
    console.error('❌ Migration file not found:', sqlFilePath);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlFilePath, 'utf-8');

  // Supabase PostgreSQL Connection candidates
  const connectionStrings = [
    // Direct Postgres
    `postgres://postgres:${encodeURIComponent(DB_PASSWORD)}@db.irapflonmpvloyglqgqo.supabase.co:5432/postgres`,
    // Session pooler
    `postgres://postgres.irapflonmpvloyglqgqo:${encodeURIComponent(DB_PASSWORD)}@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`,
    // Transaction pooler
    `postgres://postgres.irapflonmpvloyglqgqo:${encodeURIComponent(DB_PASSWORD)}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`,
  ];

  let connected = false;
  let client = null;

  for (const connStr of connectionStrings) {
    try {
      console.log(`Connecting to: ${connStr.replace(encodeURIComponent(DB_PASSWORD), '****')}`);
      client = new Client({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      });
      await client.connect();
      console.log('✅ Connected successfully to Supabase PostgreSQL!');
      connected = true;
      break;
    } catch (err) {
      console.warn(`⚠️ Connection failed with ${connStr.split('@')[1]}: ${err.message}`);
      if (client) {
        try { await client.end(); } catch (e) {}
      }
    }
  }

  if (!connected) {
    console.log('Testing execution via Supabase REST API...');
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('REST API status:', response.status);
    } catch (apiErr) {
      console.error('REST API error:', apiErr.message);
    }
    throw new Error('Could not establish PostgreSQL connection to Supabase cloud.');
  }

  try {
    console.log('Executing 001_initial_schema.sql ...');
    await client.query(sql);
    console.log('🎉 Migration completed successfully!');
    
    // Quick validation
    const res = await client.query('SELECT count(*) FROM public.villages;');
    console.log(`✅ Verified: ${res.rows[0].count} villages in database.`);
    const sRes = await client.query('SELECT count(*) FROM public.services;');
    console.log(`✅ Verified: ${sRes.rows[0].count} services in database.`);
    const pRes = await client.query('SELECT count(*) FROM public.products;');
    console.log(`✅ Verified: ${pRes.rows[0].count} products in database.`);
    const uRes = await client.query('SELECT count(*) FROM public.updates;');
    console.log(`✅ Verified: ${uRes.rows[0].count} updates in database.`);
    const gRes = await client.query('SELECT count(*) FROM public.government_schemes;');
    console.log(`✅ Verified: ${gRes.rows[0].count} government schemes in database.`);

  } catch (queryErr) {
    console.error('❌ Error executing SQL migration:', queryErr.message);
    throw queryErr;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
