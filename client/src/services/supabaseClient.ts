import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://irapflonmpvloyglqgqo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyYXBmbG9ubXB2bG95Z2xxZ3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNTIxODIsImV4cCI6MjEwNjkyODE4Mn0.oF5C9Ae-3tve756UQ8kQmu4TWM9IGAqAdMz7R6a4lpw';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials missing in client environment configuration.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});
