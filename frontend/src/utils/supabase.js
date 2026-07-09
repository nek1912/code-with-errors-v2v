import { createClient } from '@supabase/supabase-js';

// Using fallback values for hackathon demo if env vars are missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gajzwhcganofechgnlpm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YwC9nO20pLraRGVUfsKR3Q_-aRnqvFQ'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
