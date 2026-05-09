import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Prevent errors if the user hasn't set the environment variables yet
export const supabase = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co' 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
