-- =====================================================================
-- VILLAGECONNECT AI — 002_profile_and_auth.sql
-- Production Profile Management & Auth Integration Schema
-- =====================================================================

-- 1. Ensure columns exist on public.profiles
ALTER TABLE public.profiles ALTER COLUMN phone_number DROP NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Case-insensitive unique index on username
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_unique 
ON public.profiles (LOWER(username)) 
WHERE username IS NOT NULL AND username != '';

-- 3. Populate emails & initial usernames for existing demo profiles
UPDATE public.profiles 
SET 
  email = COALESCE(email, REPLACE(phone_number, '+', '') || '@villageconnect.ai'),
  username = COALESCE(username, 
    CASE 
      WHEN id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' THEN 'ramesh_farmer'
      WHEN id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' THEN 'srinivas_tractor'
      WHEN id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' THEN 'ravi_electrician'
      WHEN id = 'dddddddd-dddd-dddd-dddd-dddddddddddd' THEN 'lakshmi_organic'
      WHEN id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' THEN 'mallesh_mechanic'
      WHEN id = 'ffffffff-ffff-ffff-ffff-ffffffffffff' THEN 'panchayat_admin'
      ELSE 'user_' || SUBSTRING(id::text, 1, 8)
    END
  ),
  bio = COALESCE(bio, 
    CASE 
      WHEN id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' THEN 'Paddy and cotton farmer in Ramapuram. Active community member.'
      WHEN id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' THEN 'Tractor operator offering rotavator, ploughing, and harvest transportation.'
      WHEN id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' THEN 'Licensed electrician specializing in borewell starter boxes and pumps.'
      WHEN id = 'dddddddd-dddd-dddd-dddd-dddddddddddd' THEN 'Certified organic farmer growing desi vegetables and natural dairy.'
      WHEN id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' THEN 'Two-wheeler and auto mechanic with 11 years experience.'
      WHEN id = 'ffffffff-ffff-ffff-ffff-ffffffffffff' THEN 'Official coordinator for Gram Panchayat notices and welfare schemes.'
      ELSE 'Village resident connected via VillageConnect AI.'
    END
  ),
  address = COALESCE(address, 'Main Road, Ramapuram Village, Chevella Mandal, Rangareddy District, Telangana')
WHERE id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'ffffffff-ffff-ffff-ffff-ffffffffffff'
);

-- 4. Enable Row Level Security and configure granular policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert profile" ON public.profiles;
CREATE POLICY "Users can insert profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- 5. Auto-sync newly registered auth users into public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_village_id UUID;
BEGIN
  -- Determine default village
  BEGIN
    IF new.raw_user_meta_data->>'home_village_id' IS NOT NULL THEN
      v_village_id := (new.raw_user_meta_data->>'home_village_id')::uuid;
    ELSE
      v_village_id := '11111111-1111-1111-1111-111111111111'::uuid;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_village_id := '11111111-1111-1111-1111-111111111111'::uuid;
  END;

  INSERT INTO public.profiles (
    id, 
    phone_number, 
    full_name, 
    username,
    email,
    language, 
    role, 
    reputation_score, 
    is_verified, 
    home_village_id,
    bio,
    address
  )
  VALUES (
    new.id,
    NULLIF(COALESCE(new.raw_user_meta_data->>'phone_number', new.phone, ''), ''),
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    NULLIF(COALESCE(new.raw_user_meta_data->>'username', ''), ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'language', 'en'),
    COALESCE(new.raw_user_meta_data->>'role', 'villager'),
    10,
    false,
    v_village_id,
    COALESCE(new.raw_user_meta_data->>'bio', 'Resident of VillageConnect AI network.'),
    COALESCE(new.raw_user_meta_data->>'address', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
