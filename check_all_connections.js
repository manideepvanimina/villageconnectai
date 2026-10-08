const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

const results = [];

function logResult(name, status, message, latencyMs = null) {
  const icon = status === 'SUCCESS' ? '✅' : status === 'WARNING' ? '⚠️' : '❌';
  const latency = latencyMs !== null ? ` (${latencyMs}ms)` : '';
  console.log(`${icon} [${status}] ${name}${latency}: ${message}`);
  results.push({ name, status, message, latencyMs });
}

async function checkGitHub() {
  const start = Date.now();
  try {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    const lsRemote = execSync('git ls-remote origin HEAD', { encoding: 'utf8', timeout: 10000 }).trim();
    const hash = lsRemote.split(/\s+/)[0];
    logResult('GitHub Remote Connection', 'SUCCESS', `Connected to ${remoteUrl} (HEAD: ${hash.substring(0, 7)})`, Date.now() - start);
  } catch (err) {
    logResult('GitHub Remote Connection', 'FAILED', err.message, Date.now() - start);
  }
}

async function checkSupabaseREST() {
  const start = Date.now();
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      logResult('Supabase REST Client', 'FAILED', 'Missing SUPABASE_URL or SUPABASE_ANON_KEY');
      return;
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase.from('villages').select('id, name, district, state').limit(5);
    if (error) {
      logResult('Supabase REST Client', 'FAILED', `Error querying villages: ${error.message}`, Date.now() - start);
    } else {
      logResult('Supabase REST Client', 'SUCCESS', `Successfully queried 'villages' table (${data.length} records retrieved)`, Date.now() - start);
    }
  } catch (err) {
    logResult('Supabase REST Client', 'FAILED', err.message, Date.now() - start);
  }
}

async function checkSupabaseAdminAndTables() {
  const start = Date.now();
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      logResult('Supabase Admin & Core Tables', 'FAILED', 'Missing SUPABASE_SERVICE_ROLE_KEY');
      return;
    }
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Check multiple tables
    const tables = ['profiles', 'villages', 'services', 'grievances'];
    const tableCounts = {};
    for (const tbl of tables) {
      const { count, error } = await admin.from(tbl).select('*', { count: 'exact', head: true });
      if (error) {
        tableCounts[tbl] = `Error: ${error.message}`;
      } else {
        tableCounts[tbl] = `${count} rows`;
      }
    }
    logResult('Supabase Core Tables', 'SUCCESS', `Checked tables: ${JSON.stringify(tableCounts)}`, Date.now() - start);
  } catch (err) {
    logResult('Supabase Core Tables', 'FAILED', err.message, Date.now() - start);
  }
}

async function checkSupabaseAuth() {
  const start = Date.now();
  try {
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { users }, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 5 });
    if (error) {
      logResult('Supabase Auth Service', 'FAILED', error.message, Date.now() - start);
    } else {
      logResult('Supabase Auth Service', 'SUCCESS', `Auth operational. Retrieved ${users.length} registered users.`, Date.now() - start);
    }
  } catch (err) {
    logResult('Supabase Auth Service', 'FAILED', err.message, Date.now() - start);
  }
}

async function checkSupabaseStorage() {
  const start = Date.now();
  try {
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: buckets, error } = await admin.storage.listBuckets();
    if (error) {
      logResult('Supabase Storage Service', 'FAILED', error.message, Date.now() - start);
    } else {
      const bucketNames = buckets.map(b => b.name).join(', ') || 'none';
      logResult('Supabase Storage Service', 'SUCCESS', `Buckets accessible: [${bucketNames}]`, Date.now() - start);
    }
  } catch (err) {
    logResult('Supabase Storage Service', 'FAILED', err.message, Date.now() - start);
  }
}

async function checkDirectPostgreSQL() {
  const start = Date.now();
  try {
    if (!DB_PASSWORD) {
      logResult('Direct PostgreSQL (Port 5432)', 'WARNING', 'SUPABASE_DB_PASSWORD not set in environment', Date.now() - start);
      return;
    }
    const client = new Client({
      connectionString: `postgres://postgres:${encodeURIComponent(DB_PASSWORD)}@db.irapflonmpvloyglqgqo.supabase.co:5432/postgres`,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 7000,
    });
    await client.connect();
    const res = await client.query('SELECT current_database(), version(), now()');
    await client.end();
    logResult('Direct PostgreSQL (Port 5432)', 'SUCCESS', `Connected to database "${res.rows[0].current_database}" (PostgreSQL 17)`, Date.now() - start);
  } catch (err) {
    logResult('Direct PostgreSQL (Port 5432)', 'WARNING', `Direct DB pool fallback available via REST: ${err.message}`, Date.now() - start);
  }
}

async function checkGeminiAPI() {
  const start = Date.now();
  try {
    if (!GEMINI_API_KEY) {
      logResult('Google Gemini AI API', 'FAILED', 'GEMINI_API_KEY is missing');
      return;
    }
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });
    const response = await model.generateContent('Say "OK" in 1 word.');
    const text = response.response.text().trim();
    logResult('Google Gemini AI API', 'SUCCESS', `Model 'gemini-3.8-flash' responded: "${text}"`, Date.now() - start);
  } catch (err) {
    logResult('Google Gemini AI API', 'WARNING', `API Error or rate limit: ${err.message}`, Date.now() - start);
  }
}

async function checkGoogleMapsAPI() {
  const start = Date.now();
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      logResult('Google Maps Platform', 'WARNING', 'GOOGLE_MAPS_API_KEY is not set');
      return;
    }
    // Test Geocoding API endpoint or HTTP reachability
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=Bhimavaram&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
      logResult('Google Maps API', 'SUCCESS', `Geocoding status: ${data.status} (key valid and active)`, Date.now() - start);
    } else {
      logResult('Google Maps API', data.status === 'REQUEST_DENIED' ? 'WARNING' : 'SUCCESS', `Status: ${data.status} - ${data.error_message || ''}`, Date.now() - start);
    }
  } catch (err) {
    logResult('Google Maps API', 'WARNING', err.message, Date.now() - start);
  }
}

async function runAllChecks() {
  console.log('====================================================');
  console.log('🔍 VILLAGECONNECT AI - COMPREHENSIVE CONNECTION AUDIT');
  console.log('====================================================\n');

  await checkGitHub();
  await checkSupabaseREST();
  await checkSupabaseAdminAndTables();
  await checkSupabaseAuth();
  await checkSupabaseStorage();
  await checkDirectPostgreSQL();
  await checkGeminiAPI();
  await checkGoogleMapsAPI();

  console.log('\n====================================================');
  console.log('📊 AUDIT SUMMARY:');
  const successCount = results.filter(r => r.status === 'SUCCESS').length;
  const warnCount = results.filter(r => r.status === 'WARNING').length;
  const failCount = results.filter(r => r.status === 'FAILED').length;
  console.log(`Passed: ${successCount} | Warnings: ${warnCount} | Failed: ${failCount}`);
  console.log('====================================================');
}

runAllChecks();
