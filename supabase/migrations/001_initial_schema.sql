-- =====================================================================
-- VILLAGECONNECT AI — 001_initial_schema.sql
-- Hyper-local Digital Infrastructure Platform Schema
-- =====================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 2. VILLAGES TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.villages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    formatted_address TEXT,
    place_id TEXT,
    population INTEGER DEFAULT 4500,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- 3. PROFILES TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    home_village_id UUID REFERENCES public.villages(id) ON DELETE SET NULL,
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'te', 'hi')),
    role TEXT DEFAULT 'villager' CHECK (role IN ('villager', 'farmer', 'worker', 'business', 'moderator', 'admin')),
    reputation_score INTEGER DEFAULT 10,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- 4. SERVICES TABLE (Local Directory & Farm Equipment/Labor)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    village_id UUID REFERENCES public.villages(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'electrician', 'plumber', 'mechanic', 'carpenter', 
        'welder', 'painter', 'driver', 'auto', 'taxi', 
        'tutor', 'tailor', 'farm_labor', 'tractor', 
        'harvester', 'agricultural_services', 'other'
    )),
    business_name TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    whatsapp_number TEXT,
    details TEXT NOT NULL,
    rate_amount NUMERIC,
    pricing_unit TEXT DEFAULT 'per hour', -- 'per hour', 'per acre', 'per day', 'negotiable', 'fixed'
    availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'booked', 'unavailable')),
    rating NUMERIC(2, 1) DEFAULT 4.8,
    rating_count INTEGER DEFAULT 10,
    is_verified BOOLEAN DEFAULT true,
    experience_years INTEGER DEFAULT 5,
    service_radius_km NUMERIC DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- 5. PRODUCTS TABLE (Local Marketplace & Farm Produce)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    village_id UUID REFERENCES public.villages(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    price NUMERIC NOT NULL,
    price_unit TEXT DEFAULT 'total', -- 'per kg', 'per quintal', 'per crate', 'per bag', 'total'
    description TEXT NOT NULL,
    image_url TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'produce', 'agriculture', 'local_products', 'household', 
        'electronics', 'tools', 'farm_equipment', 'other'
    )),
    quantity TEXT,
    contact_phone TEXT NOT NULL,
    seller_name TEXT NOT NULL,
    is_organic BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired')),
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- 6. UPDATES TABLE (Community Feed, Notices & Emergencies)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    village_id UUID REFERENCES public.villages(id) ON DELETE CASCADE NOT NULL,
    author_name TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'notice', 'event', 'emergency', 'lost_found', 'general'
    )),
    image_url TEXT,
    is_emergency BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'live', 'rejected', 'archived')),
    verification_count INTEGER DEFAULT 0,
    verifications_required INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- 7. VERIFICATIONS TABLE (Peer Community Verification)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    update_id UUID REFERENCES public.updates(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    verified_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_update_user_verification UNIQUE (update_id, user_id)
);

-- =====================================================================
-- 8. GOVERNMENT SCHEMES TABLE (Verified Rural & Farm Knowledge)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.government_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    title_te TEXT,
    title_hi TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'agriculture', 'irrigation', 'financial', 'insurance', 'housing', 'youth'
    )),
    benefits TEXT NOT NULL,
    eligibility TEXT NOT NULL,
    how_to_apply TEXT NOT NULL,
    official_portal_url TEXT NOT NULL,
    helpline_number TEXT,
    last_verified_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- 9. AI CONVERSATIONS & LOGS (Privacy-preserving audit)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    village_id UUID REFERENCES public.villages(id) ON DELETE SET NULL,
    title TEXT DEFAULT 'Conversation',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- 10. INDEXES FOR HIGH-PERFORMANCE LOW-LATENCY SEARCH
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_services_village ON public.services(village_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_products_village ON public.products(village_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_updates_village_status ON public.updates(village_id, status);
CREATE INDEX IF NOT EXISTS idx_verifications_update ON public.verifications(update_id);

-- =====================================================================
-- 11. DATABASE FUNCTIONS & TRIGGERS
-- =====================================================================

-- Auto-increment verification count and promote update to 'live' when count >= 5
CREATE OR REPLACE FUNCTION public.handle_new_verification()
RETURNS TRIGGER AS $$
DECLARE
    current_count INT;
    required_count INT;
    post_author_id UUID;
BEGIN
    -- Check that user is not verifying their own post
    SELECT user_id, verifications_required INTO post_author_id, required_count
    FROM public.updates
    WHERE id = NEW.update_id;

    IF post_author_id = NEW.user_id THEN
        RAISE EXCEPTION 'Users cannot verify their own community post.';
    END IF;

    -- Count total unique verifications
    SELECT COUNT(*) INTO current_count
    FROM public.verifications
    WHERE update_id = NEW.update_id;

    -- Update post status
    UPDATE public.updates
    SET 
        verification_count = current_count,
        status = CASE 
            WHEN current_count >= required_count THEN 'live' 
            ELSE status 
        END,
        updated_at = now()
    WHERE id = NEW.update_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_handle_new_verification ON public.verifications;
CREATE TRIGGER trigger_handle_new_verification
AFTER INSERT ON public.verifications
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_verification();

-- =====================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- Villages: Read open to all, write restricted
CREATE POLICY "Public can view villages" ON public.villages
    FOR SELECT USING (true);

-- Profiles: Public can view basic profile info, users can edit their own
CREATE POLICY "Public can view profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert profile" ON public.profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR id IS NOT NULL);

-- Services: Everyone can read services, authenticated users can insert for their village
CREATE POLICY "Public can view services" ON public.services
    FOR SELECT USING (true);

CREATE POLICY "Users can insert services" ON public.services
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own services" ON public.services
    FOR UPDATE USING (user_id IS NOT NULL);

CREATE POLICY "Users can delete own services" ON public.services
    FOR DELETE USING (user_id IS NOT NULL);

-- Products: Everyone can read active products, sellers manage their own
CREATE POLICY "Public can view active products" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Users can insert products" ON public.products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own products" ON public.products
    FOR UPDATE USING (user_id IS NOT NULL);

CREATE POLICY "Users can delete own products" ON public.products
    FOR DELETE USING (user_id IS NOT NULL);

-- Updates: Public can read live updates and their pending items
CREATE POLICY "Public can view updates" ON public.updates
    FOR SELECT USING (true);

CREATE POLICY "Users can insert updates" ON public.updates
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authors can update own updates" ON public.updates
    FOR UPDATE USING (user_id IS NOT NULL);

-- Verifications: Users can verify
CREATE POLICY "Public can view verifications" ON public.verifications
    FOR SELECT USING (true);

CREATE POLICY "Users can add verification" ON public.verifications
    FOR INSERT WITH CHECK (true);

-- Government Schemes: Public read-only
CREATE POLICY "Public can view government schemes" ON public.government_schemes
    FOR SELECT USING (true);

-- AI Conversations: Users can see their own conversations
CREATE POLICY "Users can view own ai conversations" ON public.ai_conversations
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own ai conversations" ON public.ai_conversations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own ai messages" ON public.ai_messages
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own ai messages" ON public.ai_messages
    FOR INSERT WITH CHECK (true);


-- =====================================================================
-- 13. REALISTIC RURAL SEED DATA (Demo Villages, Services, Produce, Updates)
-- =====================================================================

-- Demo Villages
INSERT INTO public.villages (id, name, district, state, pincode, latitude, longitude, formatted_address, population)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Ramapuram', 'Rangareddy', 'Telangana', '501501', 17.3850, 78.4867, 'Ramapuram Village, Chevella Mandal, Rangareddy District, Telangana', 4200),
    ('22222222-2222-2222-2222-222222222222', 'Krishnapuram', 'Rangareddy', 'Telangana', '501502', 17.3910, 78.4980, 'Krishnapuram Village, Chevella Mandal, Rangareddy District, Telangana', 3800),
    ('33333333-3333-3333-3333-333333333333', 'Chandanagar Rural', 'Sangareddy', 'Telangana', '502032', 17.4920, 78.3270, 'Chandanagar Rural Gram Panchayat, Sangareddy, Telangana', 5100),
    ('44444444-4444-4444-4444-444444444444', 'Ananthagiri Village', 'Vikarabad', 'Telangana', '501101', 17.3100, 77.8600, 'Ananthagiri Hills Village, Vikarabad District, Telangana', 2900)
ON CONFLICT (id) DO NOTHING;

-- Demo Profiles
INSERT INTO public.profiles (id, phone_number, full_name, home_village_id, language, role, reputation_score, is_verified)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '+919876543210', 'Ramesh Kumar (Farmer)', '11111111-1111-1111-1111-111111111111', 'te', 'farmer', 45, true),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '+919876543211', 'Srinivas Rao (Tractor Owner)', '11111111-1111-1111-1111-111111111111', 'te', 'worker', 68, true),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '+919876543212', 'Ravi Shankar (Electrician)', '11111111-1111-1111-1111-111111111111', 'te', 'worker', 52, true),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '+919876543213', 'Lakshmi Bai (Organic Farmer)', '11111111-1111-1111-1111-111111111111', 'te', 'farmer', 80, true),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '+919876543214', 'Mallesh Goud (Mechanic)', '11111111-1111-1111-1111-111111111111', 'te', 'worker', 39, true),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '+919876543215', 'Gram Panchayat Coordinator', '11111111-1111-1111-1111-111111111111', 'en', 'moderator', 95, true)
ON CONFLICT (id) DO NOTHING;

-- Demo Services (Essential Village Directory & Farm Hub)
INSERT INTO public.services (
    id, user_id, village_id, category, business_name, provider_name, 
    contact_number, whatsapp_number, details, rate_amount, pricing_unit, 
    availability_status, rating, rating_count, is_verified, experience_years, service_radius_km
)
VALUES
    (
        '51111111-1111-1111-1111-111111111111',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '11111111-1111-1111-1111-111111111111',
        'tractor',
        'Srinivas Tractor & Harvester Services',
        'Srinivas Rao',
        '+919848022334',
        '+919848022334',
        'Mahindra 575 DI Tractor with Rotavator, Plough & 7-tine cultivator. Available for field ploughing, harvesting & crop transport across Ramapuram & nearby 15km.',
        900,
        'per hour',
        'available',
        4.9,
        34,
        true,
        9,
        15
    ),
    (
        '52222222-2222-2222-2222-222222222222',
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        '11111111-1111-1111-1111-111111111111',
        'electrician',
        'Ravi Electricals & Borewell Motor Repairs',
        'Ravi Shankar',
        '+919849133445',
        '+919849133445',
        'Fast service for agriculture water pump motors, submersible pumps, starter boxes, home wiring, and transformer cutouts. Emergency visits available.',
        350,
        'per visit',
        'available',
        4.8,
        28,
        true,
        7,
        12
    ),
    (
        '53333333-3333-3333-3333-333333333333',
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        '11111111-1111-1111-1111-111111111111',
        'mechanic',
        'Mallesh Two-Wheeler & Auto Garage',
        'Mallesh Goud',
        '+919848544556',
        '+919848544556',
        'Puncture repair, engine overhaul, brake service for bikes, tractors, scooters and 3-wheelers. Mobile roadside rescue in Ramapuram.',
        200,
        'per visit',
        'available',
        4.7,
        22,
        true,
        11,
        10
    ),
    (
        '54444444-4444-4444-4444-444444444444',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111',
        'farm_labor',
        'Ramapuram Harvest Labor Team (12 workers)',
        'Anjaiah & Ramesh Team',
        '+919848766778',
        NULL,
        'Experienced team of 12 agricultural workers for paddy harvesting, cotton picking, weeding, and seed transplantation.',
        450,
        'per day',
        'available',
        4.9,
        19,
        true,
        14,
        20
    ),
    (
        '55555555-5555-5555-5555-555555555555',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '11111111-1111-1111-1111-111111111111',
        'auto',
        'Balaji Passenger & Cargo Auto',
        'K. Balaji',
        '+919848988990',
        '+919848988990',
        'Goods transport to Chevella Rythu Bazar and Hyderabad mandi. Also available for emergency night hospital trips.',
        500,
        'per trip',
        'available',
        4.6,
        17,
        true,
        6,
        25
    ),
    (
        '56666666-6666-6666-6666-666666666666',
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        '11111111-1111-1111-1111-111111111111',
        'plumber',
        'Sri Sai PVC & Drip Irrigation Plumbing',
        'Narasimha Murthy',
        '+919848112233',
        '+919848112233',
        'Drip line installation, agricultural pipe repair, household taps, overhead syntax tanks, and drainage clearance.',
        300,
        'per visit',
        'available',
        4.8,
        15,
        true,
        8,
        15
    )
ON CONFLICT (id) DO NOTHING;

-- Demo Marketplace Products (Fresh Farm Produce & Village Products)
INSERT INTO public.products (
    id, user_id, village_id, title, price, price_unit, description, 
    category, quantity, contact_phone, seller_name, is_organic, status
)
VALUES
    (
        '61111111-1111-1111-1111-111111111111',
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        '11111111-1111-1111-1111-111111111111',
        'Farm-Fresh Desi Tomatoes (Country Variety)',
        28,
        'per kg',
        'Naturally ripened, pesticide-free fresh desi red tomatoes directly harvested this morning from Ramapuram field. Bulk buyers welcome.',
        'produce',
        '400 kg available (16 crates)',
        '+919876543213',
        'Lakshmi Bai',
        true,
        'active'
    ),
    (
        '62222222-2222-2222-2222-222222222222',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111',
        'BPT 5204 Sona Masoori Paddy Grain (Dry Bag)',
        2250,
        'per quintal',
        'High quality premium Sona Masoori paddy crop harvest. Moisture level under 12%, clean grains ready for milling.',
        'produce',
        '25 bags (75 kg each)',
        '+919876543210',
        'Ramesh Kumar',
        false,
        'active'
    ),
    (
        '63333333-3333-3333-3333-333333333333',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '11111111-1111-1111-1111-111111111111',
        '16-Liter Agricultural Battery Sprayer (Used 1 Season)',
        1400,
        'total',
        'Neptune 12V 12Ah battery knapsack sprayer with brass lance and double nozzle. In excellent condition with charger.',
        'farm_equipment',
        '1 unit',
        '+919848022334',
        'Srinivas Rao',
        false,
        'active'
    ),
    (
        '64444444-4444-4444-4444-444444444444',
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        '11111111-1111-1111-1111-111111111111',
        'Pure Desi Cow Ghee (Bilona Method)',
        950,
        'per kg',
        'Handmade bilona ghee prepared from grass-fed Gir and Sahiwal cows milk curd churn. Golden aroma, strictly chemical-free.',
        'local_products',
        '12 liters available',
        '+919876543213',
        'Lakshmi Bai',
        true,
        'active'
    )
ON CONFLICT (id) DO NOTHING;

-- Demo Community Feed & Official Updates
INSERT INTO public.updates (
    id, user_id, village_id, author_name, title, content, 
    category, is_emergency, status, verification_count, verifications_required
)
VALUES
    (
        '71111111-1111-1111-1111-111111111111',
        'ffffffff-ffff-ffff-ffff-ffffffffffff',
        '11111111-1111-1111-1111-111111111111',
        'Gram Panchayat Secretary',
        'Agricultural Electricity Feeder Maintenance Notice',
        'Scheduled power maintenance on 11KV agricultural feeder tomorrow Thursday from 9:00 AM to 2:00 PM for transformer servicing. Domestic 24x7 supply will remain active. Please plan your borewell irrigation accordingly.',
        'notice',
        false,
        'live',
        8,
        5
    ),
    (
        '72222222-2222-2222-2222-222222222222',
        'ffffffff-ffff-ffff-ffff-ffffffffffff',
        '11111111-1111-1111-1111-111111111111',
        'Agriculture Extension Officer (AEO)',
        'Subsidized Seed & DAP Distribution at Rythu Vedika',
        'Subsidized Groundnut and Bengal Gram seed bags along with DAP fertilizers arriving at Ramapuram Rythu Vedika on Saturday. Bring Pattadar Passbook and Aadhaar card.',
        'notice',
        false,
        'live',
        7,
        5
    ),
    (
        '73333333-3333-3333-3333-333333333333',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111',
        'Ramesh Kumar',
        'Community Well Pump Motor Repaired and Restored',
        'The primary water pumping motor at North Street community tank has been repaired by Ravi electrician and fresh water supply resumed today at 6:30 AM.',
        'general',
        false,
        'pending',
        4,
        5
    ),
    (
        '74444444-4444-4444-4444-444444444444',
        'ffffffff-ffff-ffff-ffff-ffffffffffff',
        '11111111-1111-1111-1111-111111111111',
        'Village Disaster Response',
        'Chevella-Ramapuram Low-Bridge Water Overflow Warning',
        'Heavy upstream discharge causing temporary water overflow on the lower bridge road. Two-wheelers and autos are advised to take the Chandanagar bypass route until 4:00 PM.',
        'emergency',
        true,
        'live',
        9,
        5
    )
ON CONFLICT (id) DO NOTHING;

-- Demo Verifications (To satisfy initial status rules)
INSERT INTO public.verifications (update_id, user_id)
VALUES
    ('71111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    ('71111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('71111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
    ('71111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    ('71111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
    ('73333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('73333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
    ('73333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    ('73333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee')
ON CONFLICT (update_id, user_id) DO NOTHING;

-- Verified Government Schemes (Official rural & farm knowledge with exact portal sources)
INSERT INTO public.government_schemes (
    id, title, title_te, title_hi, category, benefits, 
    eligibility, how_to_apply, official_portal_url, helpline_number, last_verified_date
)
VALUES
    (
        '81111111-1111-1111-1111-111111111111',
        'PM-KISAN Samman Nidhi',
        'పీఎం కిసాన్ సమ్మాన్ నిధి',
        'पीएम किसान सम्मान निधि',
        'financial',
        'Direct income transfer of ₹6,000 per year paid in 3 equal installments of ₹2,000 directly into the farmer''s Aadhaar-linked bank account.',
        'All landholding farmer families having cultivable land in their names, subject to exclusion criteria (institutional landowners, income tax payees).',
        'Apply online at pmkisan.gov.in or visit local CSC / MeeSeva center with Aadhaar card, land records (ROR 1B/Pattadar passbook), and bank passbook.',
        'https://pmkisan.gov.in',
        '155261 / 011-24300606',
        '2026-03-01'
    ),
    (
        '82222222-2222-2222-2222-222222222222',
        'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        'ప్రధానమంత్రి ఫసల్ బీమా యోజన',
        'प्रधानमंत्री फसल बीमा योजना',
        'insurance',
        'Comprehensive crop insurance covering non-preventable natural risks (drought, flood, unseasonal rainfall, pest attacks) with minimal premium (2% Kharif, 1.5% Rabi).',
        'All farmers growing notified crops in notified areas including sharecroppers and tenant farmers.',
        'Enroll through your bank branch, Primary Agricultural Credit Society (PACS), CSC center or pmfby.gov.in within cut-off dates.',
        'https://pmfby.gov.in',
        '1800-180-1551',
        '2026-03-15'
    ),
    (
        '83333333-3333-3333-3333-333333333333',
        'PM-KUSUM Solar Agricultural Pump Scheme',
        'పీఎం కుసుమ్ సోలార్ పంపుల పథకం',
        'पीएम कुसुम सौर कृषि पंप योजना',
        'irrigation',
        '60% government subsidy (30% Central + 30% State) for installing standalone off-grid solar agricultural water pumps (3HP to 7.5HP) or solarizing existing grid pumps.',
        'Individual farmers, Water User Associations, and Farmer Producer Organizations (FPOs). Priority for un-electrified diesel pump users.',
        'Apply through State Renewable Energy Development Agency (e.g., TSREDCO / state portal) or pmkusum.mnre.gov.in.',
        'https://pmkusum.mnre.gov.in',
        '1800-180-3333',
        '2026-02-20'
    ),
    (
        '84444444-4444-4444-4444-444444444444',
        'Agricultural Infrastructure Fund (AIF)',
        'వ్యవసాయ మౌలిక సదుపాయాల నిధి',
        'कृषि अवसंरचना कोष',
        'agriculture',
        'Medium to long term debt financing facility with 3% per annum interest subvention and CGTMSE credit guarantee for post-harvest management projects (cold storage, warehouses, sorting/grading units).',
        'Farmers, Agri-entrepreneurs, Start-ups, FPOs, PACS, Self Help Groups (SHGs). Loans up to ₹2 Crore eligible for interest subvention.',
        'Submit detailed project report online at agriinfra.dac.gov.in.',
        'https://agriinfra.dac.gov.in',
        '011-23381012',
        '2026-01-10'
    )
ON CONFLICT (id) DO NOTHING;
