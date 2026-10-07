const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const connectionString = `postgresql://postgres.irapflonmpvloyglqgqo:${encodeURIComponent(dbPassword)}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;

async function updateTrigger() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    const sql = `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      DECLARE
        v_village_id UUID;
        v_role TEXT;
        v_lang TEXT;
      BEGIN
        BEGIN
          IF new.raw_user_meta_data->>'home_village_id' IS NOT NULL THEN
            v_village_id := (new.raw_user_meta_data->>'home_village_id')::uuid;
          ELSE
            v_village_id := '11111111-1111-1111-1111-111111111111'::uuid;
          END IF;
        EXCEPTION WHEN OTHERS THEN
          v_village_id := '11111111-1111-1111-1111-111111111111'::uuid;
        END;

        IF new.raw_user_meta_data->>'role' IN ('villager', 'farmer', 'worker', 'business', 'moderator', 'admin') THEN
          v_role := new.raw_user_meta_data->>'role';
        ELSE
          v_role := 'villager';
        END IF;

        IF new.raw_user_meta_data->>'language' IN ('en', 'te', 'hi') THEN
          v_lang := new.raw_user_meta_data->>'language';
        ELSE
          v_lang := 'en';
        END IF;

        INSERT INTO public.profiles (
          id, phone_number, full_name, username, email, language, role, reputation_score, is_verified, home_village_id, bio, address
        ) VALUES (
          new.id,
          NULLIF(COALESCE(new.raw_user_meta_data->>'phone_number', new.phone, ''), ''),
          COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
          NULLIF(COALESCE(new.raw_user_meta_data->>'username', ''), ''),
          new.email,
          v_lang,
          v_role,
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
    `;

    await client.query(sql);
    console.log('✅ Trigger function public.handle_new_user() updated with safe fallbacks!');
  } catch (err) {
    console.error('Trigger update error:', err);
  } finally {
    await client.end();
  }
}

updateTrigger();
