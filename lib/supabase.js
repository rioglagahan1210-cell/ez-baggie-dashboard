import { createClient } from '@supabase/supabase-js';

// Hapus 'as string' agar valid sebagai file .js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Pastikan export-nya ada
export const supabase = createClient(supabaseUrl, supabaseAnonKey);