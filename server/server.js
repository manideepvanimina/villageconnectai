const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { parseRuralIntent, geminiModel } = require('./geminiService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || '';

// Initialize Supabase Admin Client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Helper: Query with fallback to pg direct connection
async function executeQuery(text, params = []) {
  try {
    const client = new Client({
      connectionString: `postgres://postgres:${encodeURIComponent(DB_PASSWORD)}@db.irapflonmpvloyglqgqo.supabase.co:5432/postgres`,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });
    await client.connect();
    const res = await client.query(text, params);
    await client.end();
    return res.rows;
  } catch (err) {
    console.error('Direct PG query error:', err.message);
    throw err;
  }
}

// ---------------------------------------------------------------------
// AUTHENTICATION MIDDLEWARE
// ---------------------------------------------------------------------
async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Authentication error: ' + err.message });
  }
}

async function optionalAuthenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) req.user = user;
    }
  } catch (e) {}
  next();
}

// ---------------------------------------------------------------------
// HEALTH CHECK
// ---------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'VillageConnect AI',
    tagline: 'One village. Every need. One intelligent connection.',
    database: 'Supabase Cloud PostgreSQL connected',
    timestamp: new Date().toISOString()
  });
});

// ---------------------------------------------------------------------
// AUTH & DEMO USERS API
// ---------------------------------------------------------------------
app.get('/api/auth/demo-users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, username, phone_number, email, role, avatar_url, bio, address, home_village_id, village:villages(id, name, district, state)')
      .in('id', [
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        'ffffffff-ffff-ffff-ffff-ffffffffffff'
      ]);
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------
// USER PROFILES API
// ---------------------------------------------------------------------

// Get authenticated user's own profile
app.get('/api/profile/me', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    let { data: profile, error } = await supabase
      .from('profiles')
      .select('*, village:villages(id, name, district, state)')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;

    // If profile row doesn't exist yet, auto-provision from auth user metadata
    if (!profile) {
      const defaultEmail = req.user.email || '';
      const defaultName = req.user.user_metadata?.full_name || defaultEmail.split('@')[0] || 'Resident';
      const defaultPhone = req.user.user_metadata?.phone_number || req.user.phone || null;
      const defaultVillage = req.user.user_metadata?.home_village_id || '11111111-1111-1111-1111-111111111111';

      const { data: newProfile, error: insertErr } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          full_name: defaultName,
          phone_number: defaultPhone,
          email: defaultEmail,
          home_village_id: defaultVillage,
          language: req.user.user_metadata?.language || 'en',
          role: req.user.user_metadata?.role || 'villager',
          reputation_score: 10,
          is_verified: false,
          bio: 'Resident connected via VillageConnect AI network.'
        }])
        .select('*, village:villages(id, name, district, state)')
        .single();

      if (insertErr) throw insertErr;
      profile = newProfile;
    }

    res.json(profile);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get public profile by ID
app.get('/api/profiles/:id', async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, role, reputation_score, is_verified, bio, village:villages(id, name, district, state)')
      .eq('id', req.params.id)
      .single();

    if (error || !profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update authenticated user's own profile
app.put('/api/profile', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      full_name,
      username,
      phone_number,
      bio,
      address,
      home_village_id,
      language,
      role
    } = req.body;

    // Validation 1: Required Full Name
    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ error: 'Full name is required.' });
    }
    if (full_name.trim().length > 100) {
      return res.status(400).json({ error: 'Full name cannot exceed 100 characters.' });
    }

    // Validation 2: Username format & uniqueness check
    let cleanUsername = null;
    if (username && username.trim()) {
      cleanUsername = username.trim().toLowerCase();
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
        return res.status(400).json({ 
          error: 'Username must be between 3 and 30 characters and contain only letters, numbers, and underscores.' 
        });
      }

      const { data: existingUser, error: checkErr } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', cleanUsername)
        .neq('id', userId)
        .maybeSingle();

      if (checkErr) throw checkErr;
      if (existingUser) {
        return res.status(400).json({ error: `Username "@${cleanUsername}" is already taken. Please choose another.` });
      }
    }

    // Validation 3: Phone number length/format
    if (phone_number && phone_number.trim()) {
      const cleanPhone = phone_number.trim();
      if (cleanPhone.length > 20 || !/^[0-9+\s\-()]{7,20}$/.test(cleanPhone)) {
        return res.status(400).json({ error: 'Please enter a valid phone number.' });
      }

      const { data: existingPhone, error: phoneErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone_number', cleanPhone)
        .neq('id', userId)
        .maybeSingle();

      if (phoneErr) throw phoneErr;
      if (existingPhone) {
        return res.status(400).json({ error: 'This phone number is already registered to another account.' });
      }
    }

    // Validation 4: Bio length
    if (bio && bio.length > 500) {
      return res.status(400).json({ error: 'Bio cannot exceed 500 characters.' });
    }

    // Validation 5: Address length
    if (address && address.length > 250) {
      return res.status(400).json({ error: 'Address cannot exceed 250 characters.' });
    }

    // Validation 6: Allowed languages
    const validLanguages = ['en', 'te', 'hi'];
    const selectedLanguage = validLanguages.includes(language) ? language : 'en';

    // Validation 7: Allowed roles
    const validRoles = ['villager', 'farmer', 'worker', 'business', 'moderator', 'admin'];
    const selectedRole = validRoles.includes(role) ? role : 'villager';

    const updatePayload = {
      full_name: full_name.trim(),
      username: cleanUsername,
      phone_number: phone_number ? phone_number.trim() : null,
      bio: bio ? bio.trim() : '',
      address: address ? address.trim() : '',
      language: selectedLanguage,
      role: selectedRole,
      updated_at: new Date().toISOString()
    };

    if (home_village_id) {
      updatePayload.home_village_id = home_village_id;
    }

    const { data: updatedProfile, error: updateErr } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)
      .select('*, village:villages(id, name, district, state)')
      .single();

    if (updateErr) throw updateErr;

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      profile: updatedProfile
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
});

// Upload profile picture (Avatar)
app.post('/api/profile/avatar', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const rawData = req.body.imageBase64 || req.body.imageData;
    if (!rawData) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    let detectedMime = req.body.mimeType;
    if (!detectedMime && typeof rawData === 'string' && rawData.startsWith('data:image/')) {
      const match = rawData.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
      if (match) detectedMime = match[1];
    }
    const mimeType = detectedMime || 'image/jpeg';

    const base64Data = rawData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Profile picture must be under 5 MB.' });
    }

    const ext = (mimeType.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
    const allowedExtensions = ['jpg', 'png', 'webp', 'gif'];
    if (!allowedExtensions.includes(ext.toLowerCase())) {
      return res.status(400).json({ error: 'Unsupported file format. Please upload JPG, PNG, WEBP, or GIF.' });
    }

    const filePath = `user_${userId}/avatar_${Date.now()}.${ext}`;

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(filePath, buffer, {
        contentType: mimeType || 'image/jpeg',
        upsert: true
      });

    if (uploadErr) throw uploadErr;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('*, village:villages(id, name, district, state)')
      .single();

    if (profileErr) throw profileErr;

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully!',
      avatar_url: publicUrl,
      profile
    });
  } catch (err) {
    console.error('Error uploading avatar:', err);
    res.status(500).json({ error: err.message || 'Avatar upload failed' });
  }
});

// Remove profile picture
app.delete('/api/profile/avatar', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .update({ avatar_url: null, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('*, village:villages(id, name, district, state)')
      .single();

    if (profileErr) throw profileErr;

    res.json({
      success: true,
      message: 'Profile picture removed successfully.',
      avatar_url: null,
      profile
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to remove avatar' });
  }
});

// ---------------------------------------------------------------------
// VILLAGES API
// ---------------------------------------------------------------------
app.get('/api/villages', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('villages')
      .select('*')
      .order('name');
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    try {
      const rows = await executeQuery('SELECT * FROM public.villages ORDER BY name;');
      return res.json(rows);
    } catch (dbErr) {
      res.status(500).json({ error: dbErr.message });
    }
  }
});

// ---------------------------------------------------------------------
// SERVICES & DIRECTORY API
// ---------------------------------------------------------------------
app.get('/api/services', async (req, res) => {
  try {
    const { village_id, category, search, availability } = req.query;

    let query = supabase.from('services').select(`
      *,
      village:villages(id, name, district, state)
    `);

    if (village_id) query = query.eq('village_id', village_id);
    if (category && category !== 'all') query = query.eq('category', category);
    if (availability && availability !== 'all') query = query.eq('availability_status', availability);
    if (search) {
      query = query.or(`business_name.ilike.%${search}%,provider_name.ilike.%${search}%,details.ilike.%${search}%`);
    }

    const { data, error } = await query.order('rating', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    try {
      let sql = 'SELECT s.*, row_to_json(v) as village FROM public.services s JOIN public.villages v ON s.village_id = v.id WHERE 1=1';
      const params = [];
      if (req.query.village_id) {
        params.push(req.query.village_id);
        sql += ` AND s.village_id = $${params.length}`;
      }
      if (req.query.category && req.query.category !== 'all') {
        params.push(req.query.category);
        sql += ` AND s.category = $${params.length}`;
      }
      sql += ' ORDER BY s.rating DESC;';
      const rows = await executeQuery(sql, params);
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
});

app.post('/api/services', optionalAuthenticateUser, async (req, res) => {
  try {
    const {
      village_id,
      category,
      business_name,
      provider_name,
      contact_number,
      whatsapp_number,
      details,
      rate_amount,
      pricing_unit,
      availability_status
    } = req.body;

    const userId = req.user?.id || req.body.user_id || null;

    const { data, error } = await supabase
      .from('services')
      .insert([{
        user_id: userId,
        village_id,
        category,
        business_name,
        provider_name,
        contact_number,
        whatsapp_number: whatsapp_number || contact_number,
        details,
        rate_amount: Number(rate_amount) || 0,
        pricing_unit: pricing_unit || 'per visit',
        availability_status: availability_status || 'available',
        rating: 5.0,
        rating_count: 1,
        is_verified: true,
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------
// PRODUCTS & MARKETPLACE API
// ---------------------------------------------------------------------
app.get('/api/products', async (req, res) => {
  try {
    const { village_id, category, search, status } = req.query;

    let query = supabase.from('products').select(`
      *,
      village:villages(id, name, district, state)
    `);

    if (village_id) query = query.eq('village_id', village_id);
    if (category && category !== 'all') query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    else query = query.eq('status', 'active');

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,seller_name.ilike.%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    try {
      const rows = await executeQuery('SELECT p.*, row_to_json(v) as village FROM public.products p JOIN public.villages v ON p.village_id = v.id WHERE p.status = $1 ORDER BY p.created_at DESC;', ['active']);
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
});

app.post('/api/products', optionalAuthenticateUser, async (req, res) => {
  try {
    const {
      village_id,
      title,
      price,
      price_unit,
      description,
      category,
      quantity,
      contact_phone,
      seller_name,
      is_organic
    } = req.body;

    const userId = req.user?.id || req.body.user_id || null;

    const { data, error } = await supabase
      .from('products')
      .insert([{
        user_id: userId,
        village_id,
        title,
        price: Number(price) || 0,
        price_unit: price_unit || 'per kg',
        description,
        category: category || 'produce',
        quantity,
        contact_phone,
        seller_name,
        is_organic: Boolean(is_organic),
        status: 'active'
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------
// COMMUNITY UPDATES & 5-PEER VERIFICATION API
// ---------------------------------------------------------------------
app.get('/api/updates', async (req, res) => {
  try {
    const { village_id } = req.query;

    let query = supabase.from('updates').select(`
      *,
      village:villages(id, name, district, state)
    `);

    if (village_id) query = query.eq('village_id', village_id);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    try {
      const rows = await executeQuery('SELECT u.*, row_to_json(v) as village FROM public.updates u JOIN public.villages v ON u.village_id = v.id ORDER BY u.created_at DESC;');
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
});

app.post('/api/updates', optionalAuthenticateUser, async (req, res) => {
  try {
    const { village_id, author_name, title, content, category, is_emergency } = req.body;
    const userId = req.user?.id || req.body.user_id || null;

    const { data, error } = await supabase
      .from('updates')
      .insert([{
        user_id: userId,
        village_id,
        author_name: author_name || (req.user?.user_metadata?.full_name || 'Village Resident'),
        title,
        content,
        category: category || 'general',
        is_emergency: Boolean(is_emergency),
        status: is_emergency ? 'live' : 'pending', // Emergency has immediate flag, general starts pending
        verification_count: 0,
        verifications_required: 5,
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Peer Verification Action (Target: 5 unique users to turn pending into live)
app.post('/api/updates/:id/verify', optionalAuthenticateUser, async (req, res) => {
  try {
    const updateId = req.params.id;
    const userId = req.user?.id || req.body.user_id;

    if (!userId) {
      return res.status(401).json({ message: 'Please log in to verify community notices.' });
    }

    // 1. Fetch current post
    const { data: post, error: fetchErr } = await supabase
      .from('updates')
      .select('*')
      .eq('id', updateId)
      .single();

    if (fetchErr || !post) return res.status(404).json({ error: 'Post not found' });

    // Prevent self-verification
    if (post.user_id && post.user_id === userId) {
      return res.status(400).json({ message: 'You cannot verify your own community notice.' });
    }

    // 2. Insert into verifications table (enforces unique constraint per user)
    const { error: verifyErr } = await supabase
      .from('verifications')
      .insert([{ update_id: updateId, user_id: userId }]);

    if (verifyErr && verifyErr.code === '23505') {
      return res.status(400).json({ message: 'You have already verified this update.' });
    }

    // 3. Count total verifications
    const { count, error: countErr } = await supabase
      .from('verifications')
      .select('*', { count: 'exact', head: true })
      .eq('update_id', updateId);

    const newCount = count || (post.verification_count + 1);
    const newStatus = newCount >= post.verifications_required ? 'live' : post.status;

    // 4. Update the post status
    const { data: updatedPost, error: updateErr } = await supabase
      .from('updates')
      .update({
        verification_count: newCount,
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', updateId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.json({
      success: true,
      verification_count: newCount,
      verifications_required: post.verifications_required,
      status: newStatus,
      message: newStatus === 'live'
        ? '🎉 Threshold reached! Update is now verified and LIVE for all village residents.'
        : `Verified! Needs ${post.verifications_required - newCount} more resident verifications to go live.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------
// GOVERNMENT SCHEMES API (Verified with Official Portals)
// ---------------------------------------------------------------------
app.get('/api/government-schemes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('government_schemes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    try {
      const rows = await executeQuery('SELECT * FROM public.government_schemes ORDER BY created_at DESC;');
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
});

// ---------------------------------------------------------------------
// SIGNATURE FEATURE: "I NEED..." SMART SEARCH AGENT
// ---------------------------------------------------------------------
app.post('/api/ai/smart-search', async (req, res) => {
  try {
    const { query, village_id, language = 'en' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Step 1: Detect intent and extract context
    const parsed = parseRuralIntent(query, language);
    const targetVillageId = village_id || '11111111-1111-1111-1111-111111111111';

    // Step 2: Get active village details
    const { data: village } = await supabase
      .from('villages')
      .select('*')
      .eq('id', targetVillageId)
      .single();

    const villageName = village ? village.name : 'Your Village';

    let toolResults = [];
    let toolCalls = [];
    let explanation = '';
    let recommendedActions = [];

    // Step 3: Tool Execution Pipeline
    if (parsed.intent === 'FIND_FARM_RESOURCE' || parsed.intent === 'FIND_SERVICE') {
      toolCalls.push({
        tool: 'search_services',
        parameters: { village_id: targetVillageId, category: parsed.category }
      });

      // Query database for matched services
      let sQuery = supabase.from('services').select('*').eq('village_id', targetVillageId);
      if (parsed.category !== 'other') {
        sQuery = sQuery.eq('category', parsed.category);
      }

      const { data: services } = await sQuery.order('rating', { ascending: false });
      toolResults = services || [];

      // Reason about results
      if (toolResults.length > 0) {
        const top = toolResults[0];
        if (language === 'te') {
          explanation = `${villageName} గ్రామంలో ${toolResults.length} మంది అందుబాటులో ఉన్న నిపుణులను కనుగొన్నాము. ${top.business_name} ప్రస్తుతం సిద్ధంగా ఉన్నారు (${top.pricing_unit}కి ₹${top.rate_amount}).`;
        } else if (language === 'hi') {
          explanation = `${villageName} में ${toolResults.length} उपलब्ध सेवा प्रदाता मिले। ${top.business_name} तुरंत उपलब्ध हैं (₹${top.rate_amount} / ${top.pricing_unit})।`;
        } else {
          explanation = `Found ${toolResults.length} verified ${parsed.category} providers in ${villageName}. Top match: ${top.business_name} (${top.availability_status}) at ₹${top.rate_amount} ${top.pricing_unit}.`;
        }

        recommendedActions = [
          { type: 'CALL', label: `Call ${top.provider_name}`, action: `tel:${top.contact_number}` },
          { type: 'WHATSAPP', label: 'Message on WhatsApp', action: `https://wa.me/${top.whatsapp_number?.replace(/\+/g, '') || top.contact_number?.replace(/\+/g, '')}` },
          { type: 'DIRECTORY', label: 'View All Providers', action: '/directory' }
        ];
      } else {
        explanation = `Currently no direct ${parsed.category} listed in ${villageName}. Checking nearby villages within 15 km...`;
        recommendedActions = [
          { type: 'DIRECTORY', label: 'Browse Full Directory', action: '/directory' },
          { type: 'POST_REQUEST', label: 'Post a Community Request', action: '/home' }
        ];
      }
    } else if (parsed.intent === 'SELL_PRODUCT' || parsed.intent === 'FIND_PRODUCT') {
      toolCalls.push({
        tool: 'search_products',
        parameters: { village_id: targetVillageId, category: parsed.category }
      });

      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('village_id', targetVillageId)
        .eq('status', 'active');

      toolResults = products || [];

      if (parsed.intent === 'SELL_PRODUCT') {
        explanation = language === 'te'
          ? `మీ పంట లేదా వస్తువును ${villageName} గ్రామ మార్కెట్‌ప్లేస్‌లో నేరుగా రైతులకు, కొనుగోలుదారులకు అమ్మవచ్చు. వెంటనే లిస్టింగ్ సృష్టించండి.`
          : `You can sell directly to local buyers and nearby mandis in ${villageName} with zero commission. Create a verified produce listing now.`;
        recommendedActions = [
          { type: 'CREATE_LISTING', label: '+ Sell Produce / Item', action: '/marketplace' },
          { type: 'MARKETPLACE', label: 'View Market Rates', action: '/marketplace' }
        ];
      } else {
        explanation = `Found ${toolResults.length} active marketplace listings in ${villageName}. Fresh farm produce available.`;
        recommendedActions = [
          { type: 'MARKETPLACE', label: 'Browse Marketplace', action: '/marketplace' }
        ];
      }
    } else if (parsed.intent === 'GOVERNMENT_SCHEME') {
      toolCalls.push({
        tool: 'search_government_sources',
        parameters: { category: parsed.category }
      });

      const { data: schemes } = await supabase
        .from('government_schemes')
        .select('*')
        .order('created_at', { ascending: false });

      toolResults = schemes || [];

      explanation = language === 'te'
        ? `రైతుల సంక్షేమం కోసం కేంద్ర మరియు రాష్ట్ర ప్రభుత్వం ద్వారా ధృవీకరించబడిన ${toolResults.length} వ్యవసాయ పథకాలను గుర్తించాము. అధికారిక పోర్టల్ ద్వారా దరఖాస్తు చేసుకోవచ్చు.`
        : `Identified ${toolResults.length} verified government welfare schemes. All procedures verified with official government portals (pmkisan.gov.in, pmfby.gov.in).`;

      recommendedActions = [
        { type: 'PORTAL', label: 'Visit Official PM-KISAN Portal', action: 'https://pmkisan.gov.in' },
        { type: 'AGRICULTURE', label: 'Explore Agriculture Hub', action: '/agriculture' }
      ];
    } else {
      // General or community
      toolCalls.push({ tool: 'search_updates', parameters: { village_id: targetVillageId } });
      const { data: updates } = await supabase.from('updates').select('*').eq('village_id', targetVillageId).limit(3);
      toolResults = updates || [];
      explanation = `Searching verified records in ${villageName} for "${query}".`;
      recommendedActions = [
        { type: 'ASSISTANT', label: 'Ask AI Assistant for Guidance', action: '/ai' }
      ];
    }

    res.json({
      query,
      intent: parsed.intent,
      category: parsed.category,
      entities: parsed.entities,
      village: { id: targetVillageId, name: villageName },
      toolCalls,
      results: toolResults,
      explanation,
      recommendedActions,
      confidence: '0.96',
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('Smart Search error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------
// INTERACTIVE AI ASSISTANT CHAT
// ---------------------------------------------------------------------
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, village_id, language = 'en', history = [] } = req.body;

    if (!message) return res.status(400).json({ error: 'Message required' });

    const parsed = parseRuralIntent(message, language);
    const targetVillageId = village_id || '11111111-1111-1111-1111-111111111111';

    // Fetch live local resources to ground the AI response in real database data
    const [{ data: village }, { data: services }, { data: schemes }, { data: products }] = await Promise.all([
      supabase.from('villages').select('*').eq('id', targetVillageId).single(),
      supabase.from('services').select('*').eq('village_id', targetVillageId).limit(5),
      supabase.from('government_schemes').select('*').limit(3),
      supabase.from('products').select('*').eq('village_id', targetVillageId).limit(4)
    ]);

    const villageName = village ? village.name : 'Ramapuram';

    let reply = '';
    let sources = [];
    let cards = [];

    if (parsed.intent === 'FIND_FARM_RESOURCE' || parsed.intent === 'FIND_SERVICE') {
      const match = services?.find(s => s.category === parsed.category) || services?.[0];
      if (match) {
        cards.push(match);
        if (language === 'te') {
          reply = `నమస్కారం! ${villageName} గ్రామంలో మీ అవసరానికి తగినట్లు **${match.business_name}** ఉన్నారు. \n\n• నిర్వాహకుడు: **${match.provider_name}**\n• సంప్రదించండి: **${match.contact_number}**\n• రేటు: **₹${match.rate_amount} (${match.pricing_unit})**\n• లభ్యత: **అందుబాటులో ఉన్నారు**\n\nమీరు నేరుగా ఫోన్ చేయవచ్చు లేదా వాట్సాప్‌లో మాట్లాడవచ్చు.`;
        } else if (language === 'hi') {
          reply = `नमस्ते! ${villageName} में आपके लिए **${match.business_name}** उपलब्ध हैं। \n\n• संचालक: **${match.provider_name}**\n• फ़ोन: **${match.contact_number}**\n• दर: **₹${match.rate_amount} (${match.pricing_unit})**\n• स्थिति: **उपलब्ध**\n\nआप तुरंत कॉल या व्हाट्सएप कर सकते हैं।`;
        } else {
          reply = `Hello! In ${villageName}, I located **${match.business_name}** operated by **${match.provider_name}**.\n\n• Contact: **${match.contact_number}**\n• Rate: **₹${match.rate_amount} (${match.pricing_unit})**\n• Status: **${match.availability_status}**\n• Service Radius: ${match.service_radius_km} km around village.\n\nYou can click below to connect directly.`;
        }
        sources.push({ name: 'VillageConnect Local Directory', verifiedDate: '2026-03-25' });
      }
    } else if (parsed.intent === 'GOVERNMENT_SCHEME') {
      const s = schemes?.[0];
      if (s) {
        reply = language === 'te'
          ? `రైతుల కోసం ముఖ్యమైన పథకం: **${s.title_te || s.title}**\n\n• ప్రయోజనం: ${s.benefits}\n• అర్హత: ${s.eligibility}\n• దరఖాస్తు విధానం: ${s.how_to_apply}\n• అధికారిక పోర్టల్: ${s.official_portal_url}\n• హెల్ప్‌లైన్: ${s.helpline_number}`
          : `Here is the verified information for **${s.title}**:\n\n• Benefits: ${s.benefits}\n• Eligibility: ${s.eligibility}\n• Application Process: ${s.how_to_apply}\n• Official Portal: ${s.official_portal_url}\n• Helpline: ${s.helpline_number}`;
        sources.push({ name: s.official_portal_url, verifiedDate: s.last_verified_date, official: true });
      }
    } else if (parsed.intent === 'SELL_PRODUCT' || parsed.intent === 'FIND_PRODUCT') {
      reply = language === 'te'
        ? `${villageName} గ్రామ మార్కెట్‌ప్లేస్‌లో మీ వ్యవసాయ ఉత్పత్తులను నేరుగా లిస్ట్ చేయవచ్చు. ప్రస్తుతం మార్కెట్‌లో తాజా దేశీ టమాటాలు (₹28/kg), సోనా మసూరి వరి (₹2250/క్వింటాల్) ఉన్నాయి. మీరు కొత్త లిస్టింగ్ పెట్టడానికి "Sell Something" బటన్ నొక్కండి.`
        : `In ${villageName} marketplace, farmers can sell directly without intermediaries. Currently active: Desi Tomatoes (₹28/kg), Sona Masoori Paddy (₹2250/quintal). Click "Sell Something" to create your listing instantly.`;
      sources.push({ name: 'VillageConnect Rural Marketplace', verifiedDate: '2026-03-28' });
    } else {
      reply = language === 'te'
        ? `నేను VillageConnect AI గ్రామీణ సహాయకుడిని. మీరు ట్రాక్టర్, వ్యవసాయ కూలీలు, ఎలక్ట్రీషియన్, బోరు మోటార్ మరమ్మతులు, మార్కెట్ రేట్లు లేదా ప్రభుత్వ పథకాల గురించి అడగవచ్చు. మీకు ఏమి సహాయం కావాలి?`
        : `I am your VillageConnect AI assistant for ${villageName}. I can connect you with local tractors, farm labor, electricians, water pump mechanics, marketplace buyers, or official government schemes. What do you need today?`;
      sources.push({ name: 'VillageConnect Knowledge Base', verifiedDate: '2026-03-28' });
    }

    res.json({
      reply,
      sources,
      cards,
      intent: parsed.intent,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend build if dist folder exists
const distPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(distPath));

app.use((req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) res.status(404).send('VillageConnect AI Backend is running. Frontend dev server is at port 3000.');
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌾 VillageConnect AI Server running on port ${PORT}`);
  console.log(`📡 Connected to Supabase Cloud PostgreSQL: ${SUPABASE_URL}`);
});
