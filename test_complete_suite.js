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

const results = [];

function recordTest(testName, passed, details = '') {
  results.push({ testName, passed, details });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} | ${testName}${details ? ' - ' + details : ''}`);
}

async function runSuite() {
  console.log('\n======================================================');
  console.log('🚀 VILLAGECONNECT AI - COMPREHENSIVE E2E VERIFICATION');
  console.log('======================================================\n');

  try {
    // TEST 1: Health check
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthData = await healthRes.json();
    recordTest('API & Database Health Check', healthRes.ok && healthData.database.includes('connected'), `Database: ${healthData.database}`);

    // TEST 2: Demo users endpoint
    const demoRes = await fetch(`${API_BASE}/auth/demo-users`);
    const demoUsers = await demoRes.json();
    recordTest('Demo Users Endpoint', demoRes.ok && demoUsers.length >= 6, `Found ${demoUsers.length} pre-configured demo users`);

    // TEST 3: Login as existing user (Ramesh Kumar)
    const rameshCreds = {
      email: '919876543210@villageconnect.ai',
      password: 'Password123!'
    };
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword(rameshCreds);
    if (authError) throw new Error(`Sign-in failed: ${authError.message}`);
    const token = authData.session.access_token;
    const rameshId = authData.user.id;
    recordTest('Supabase Auth Login (Ramesh Kumar)', !!token, `User ID: ${rameshId}`);

    // TEST 4: Fetch authenticated profile (GET /api/profile/me)
    const meRes = await fetch(`${API_BASE}/profile/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const meData = await meRes.json();
    recordTest('Fetch Authenticated Profile (/api/profile/me)', meRes.ok && meData.id === rameshId, `Full Name: ${meData.full_name}, Phone: ${meData.phone}`);

    // TEST 5: Unauthorized request protection
    const unauthRes = await fetch(`${API_BASE}/profile/me`);
    recordTest('Unauthorized Access Blocked (No Token)', unauthRes.status === 401, `Status: ${unauthRes.status}`);

    const badTokenRes = await fetch(`${API_BASE}/profile/me`, {
      headers: { Authorization: 'Bearer invalid-token-12345' }
    });
    recordTest('Tampered Token Rejected', badTokenRes.status === 401, `Status: ${badTokenRes.status}`);

    // TEST 6: Validation check - Reject empty full_name
    const invalidUpdateRes = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ full_name: '   ' })
    });
    recordTest('Profile Validation (Empty Name Rejected)', invalidUpdateRes.status === 400, `Status: ${invalidUpdateRes.status}`);

    // TEST 7: Update profile (Bio, Address, Phone, Username)
    const originalBio = meData.bio || '';
    const updatedBio = `Senior sustainable agriculture leader with 16+ yrs exp. Updated at ${new Date().toISOString()}`;
    const updatedAddress = 'Bhimavaram West, Ward 4, Krishna District';
    const updatedPhone = '9876543210';
    const updatedUsername = 'ramesh_farmer';

    const updateRes = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        full_name: 'Ramesh Kumar',
        phone: updatedPhone,
        address: updatedAddress,
        village_name: 'Bhimavaram',
        bio: updatedBio,
        username: updatedUsername
      })
    });
    const updateData = await updateRes.json();
    recordTest('Save Profile Changes (PUT /api/profile)', updateRes.ok && updateData.profile.bio === updatedBio, 'Changes accepted by server');

    // TEST 8: Verify persistence across simulated page refresh (Query fresh from DB)
    const freshMeRes = await fetch(`${API_BASE}/profile/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const freshMeData = await freshMeRes.json();
    const persisted = freshMeData.bio === updatedBio && freshMeData.address === updatedAddress;
    recordTest('Persistence Across Page Reload / Fresh Fetch', persisted, `Persisted Bio: ${freshMeData.bio.slice(0, 45)}...`);

    // Direct check in Supabase database table
    const { data: dbProfile } = await supabaseAdmin.from('profiles').select('*').eq('id', rameshId).single();
    recordTest('Direct Supabase Database Verification', dbProfile.bio === updatedBio && dbProfile.address === updatedAddress, 'PostgreSQL confirmed as single source of truth');

    // TEST 9: Avatar upload to Supabase Storage bucket
    const samplePngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const avatarUploadRes = await fetch(`${API_BASE}/profile/avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        imageBase64: samplePngBase64,
        mimeType: 'image/png'
      })
    });
    const avatarData = await avatarUploadRes.json();
    const hasPublicAvatarUrl = avatarUploadRes.ok && avatarData.avatar_url && avatarData.avatar_url.includes('supabase.co');
    recordTest('Real Avatar Upload to Supabase Storage', hasPublicAvatarUrl, `Avatar URL: ${avatarData.avatar_url ? avatarData.avatar_url.slice(0, 60) + '...' : 'none'}`);

    // TEST 10: Avatar removal
    const avatarDeleteRes = await fetch(`${API_BASE}/profile/avatar`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const verifyAvatarDeletedRes = await fetch(`${API_BASE}/profile/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const verifyAvatarDeletedData = await verifyAvatarDeletedRes.json();
    recordTest('Avatar Removal & DB Sync', avatarDeleteRes.ok && verifyAvatarDeletedData.avatar_url === null, 'Avatar URL reset to null in DB');

    // TEST 11: Revert / Cancel simulation (restore initial bio)
    const restoreRes = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        full_name: 'Ramesh Kumar',
        phone: '9876543210',
        address: 'Bhimavaram, Ward 3',
        village_name: 'Bhimavaram',
        bio: 'Progressive organic paddy farmer with 15 years experience in natural farming and zero-budget cultivation.',
        username: 'ramesh_farmer'
      })
    });
    recordTest('Revert / Restore Profile Baseline', restoreRes.ok, 'Reverted to initial profile configuration');

    // TEST 12: New User Creation Flow + Trigger Auto-Provisioning
    const testNewEmail = `testresident_${Date.now()}@villageconnect.ai`;
    const testNewPassword = 'SecurePassword123!';
    const { data: newAdminUser, error: newAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: testNewEmail,
      password: testNewPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Lakshmi Devi',
        phone: '9876500001',
        role: 'villager',
        home_village_id: '11111111-1111-1111-1111-111111111111'
      }
    });

    if (newAuthError) {
      recordTest('New User Supabase Auth Registration', false, newAuthError.message);
    } else {
      const newUserId = newAdminUser.user.id;
      recordTest('New User Supabase Auth Registration', !!newUserId, `Created user: ${testNewEmail} (ID: ${newUserId})`);

      // Verify trigger created profile in PostgreSQL
      const { data: newProfileRow, error: newProfileError } = await supabaseAdmin.from('profiles').select('*').eq('id', newUserId).single();
      recordTest('PostgreSQL Trigger Profile Auto-Provisioning', !newProfileError && !!newProfileRow, `Auto-created row in public.profiles: ${newProfileRow ? newProfileRow.full_name : 'failed'}`);

      // Now login as new user and verify profile management
      const { data: newLoginData } = await supabaseClient.auth.signInWithPassword({
        email: testNewEmail,
        password: testNewPassword
      });
      const newToken = newLoginData?.session?.access_token;

      if (newToken) {
        // Update new user's profile
        const updateNewRes = await fetch(`${API_BASE}/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newToken}`
          },
          body: JSON.stringify({
            full_name: 'Lakshmi Devi (Artisan)',
            bio: 'Traditional handloom weaver creating sustainable khadi sarees.',
            username: `lakshmi_${Date.now()}`
          })
        });
        const updateNewData = await updateNewRes.json();
        recordTest('New User Profile Update & Ownership', updateNewRes.ok && updateNewData.profile?.bio?.includes('Traditional handloom'), 'New user updated own profile independently');

        // TEST 13: Cross-user authorization protection (New user cannot update Ramesh's profile)
        const unauthorizedHackerRes = await fetch(`${API_BASE}/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newToken}`
          },
          body: JSON.stringify({
            id: rameshId,
            full_name: 'Hacked Name'
          })
        });
        const { data: rameshVerifyDb } = await supabaseAdmin.from('profiles').select('full_name').eq('id', rameshId).single();
        recordTest('User Ownership Security (Cannot overwrite other user)', rameshVerifyDb.full_name === 'Ramesh Kumar', 'Target profile unmodified - user ID strictly scoped to JWT');
      } else {
        recordTest('New User Profile Update & Ownership', false, 'Session token missing on sign in');
      }

      // Clean up test user
      await supabaseAdmin.from('profiles').delete().eq('id', newUserId);
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
    }

    // TEST 14: Community Notice Verification (Prevent duplicate / self verification)
    const updatesRes = await fetch(`${API_BASE}/updates`);
    const updates = await updatesRes.json();
    if (updates && updates.length > 0) {
      const notice = updates[0];
      const verifyRes = await fetch(`${API_BASE}/updates/${notice.id}/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const verifyData = await verifyRes.json();
      const respText = (verifyData.message || verifyData.error || '').toLowerCase();
      const noticeRulesApplied = verifyRes.status === 200 || (verifyRes.status === 400 && (respText.includes('own') || respText.includes('already verified')));
      recordTest('Community Notice Verification Rules', noticeRulesApplied, `Status: ${verifyRes.status}, Message: ${verifyData.message || verifyData.error}`);
    }

    // TEST 15: Directory Services API
    const servicesRes = await fetch(`${API_BASE}/services?category=agriculture`);
    const services = await servicesRes.json();
    recordTest('Directory API with Category Filtering', servicesRes.ok && Array.isArray(services), `Found ${services.length} agriculture services`);

    // TEST 16: Marketplace Products API
    const productsRes = await fetch(`${API_BASE}/products`);
    const products = await productsRes.json();
    recordTest('Marketplace Products API', productsRes.ok && Array.isArray(products) && products.length > 0, `Found ${products.length} active marketplace listings`);

    // TEST 17: Smart Search / "I Need" Agent API
    const smartSearchRes = await fetch(`${API_BASE}/ai/smart-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'tractor repair or rental' })
    });
    const smartSearchData = await smartSearchRes.json();
    recordTest('Smart Search & Semantic Intent API', smartSearchRes.ok && (!!smartSearchData.summary || !!smartSearchData.intent), `Intent: ${smartSearchData.intent}, Steps: ${smartSearchData.toolCalls?.length || 0}`);

  } catch (err) {
    console.error('Fatal test runner error:', err);
    recordTest('E2E Test Runner Execution', false, err.message);
  }

  console.log('\n======================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`SUMMARY: ${passed}/${total} TESTS PASSED (${failed} FAILED)`);
  console.log('======================================================\n');
}

runSuite();
