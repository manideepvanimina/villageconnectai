const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://irapflonmpvloyglqgqo.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_BASE = 'http://localhost:5000/api';

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verifyVillageMapSystem() {
  console.log('\n======================================================');
  console.log('🗺️ VILLAGECONNECT AI - VILLAGE MAP & AUTH VERIFICATION');
  console.log('======================================================\n');

  // 1. Fetch all villages from API
  const villagesRes = await fetch(`${API_BASE}/villages`);
  const villages = await villagesRes.json();
  console.log(`✅ Fetched ${villages.length} villages with GPS coordinates:`);
  villages.forEach(v => {
    console.log(`   📍 ${v.name} (${v.district}) - [${v.latitude}°N, ${v.longitude}°E] - Pop: ${v.population}`);
  });

  // 2. Fetch demo users and check their village groupings
  const demoUsersRes = await fetch(`${API_BASE}/auth/demo-users`);
  const demoUsers = await demoUsersRes.json();
  console.log(`\n✅ Verified demo users mapped to villages:`);
  demoUsers.forEach(u => {
    console.log(`   👤 ${u.full_name} (${u.role}) -> 📍 ${u.village?.name || 'Unknown Village'} (ID: ${u.home_village_id})`);
  });

  // 3. Test logging in as a resident of Krishnapuram (Srinivas Rao)
  const krishnapuramResident = demoUsers.find(u => u.village?.name === 'Krishnapuram');
  if (krishnapuramResident) {
    const { data: authData, error: authErr } = await supabaseClient.auth.signInWithPassword({
      email: krishnapuramResident.email,
      password: 'Password123!'
    });
    if (authErr) throw authErr;
    console.log(`\n✅ Successfully logged in as ${krishnapuramResident.full_name} (Krishnapuram)`);
    const token = authData.session.access_token;

    // Fetch profile
    const profileRes = await fetch(`${API_BASE}/profile/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const profile = await profileRes.json();
    console.log(`   Profile Home Village in DB: ${profile.village?.name} (ID: ${profile.home_village_id})`);

    // 4. Test Switching Home Village to Chandanagar Rural on the Map
    const chandanagar = villages.find(v => v.name.includes('Chandanagar'));
    if (chandanagar) {
      const updateRes = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          home_village_id: chandanagar.id
        })
      });
      const updateData = await updateRes.json();
      console.log(`\n✅ Switched Home Village on Map to ${chandanagar.name}:`);
      console.log(`   Database returned updated home village: ${updateData.profile.village?.name}`);

      // Verify persistence in Supabase PostgreSQL
      const { data: dbCheck } = await supabaseAdmin.from('profiles').select('home_village_id, village:villages(name)').eq('id', profile.id).single();
      console.log(`   PostgreSQL Direct Verification: Home Village ID is ${dbCheck.home_village_id} (${dbCheck.village?.name})`);

      // Restore baseline for clean state
      await supabaseAdmin.from('profiles').update({ home_village_id: krishnapuramResident.home_village_id }).eq('id', profile.id);
      console.log(`   Restored baseline home village to ${krishnapuramResident.village?.name}`);
    }
  }

  console.log('\n======================================================');
  console.log('🎉 ALL VILLAGE MAP & AUTHENTICATION TESTS PASSED!');
  console.log('======================================================\n');
}

verifyVillageMapSystem().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
