import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://gfwwfeljgkphohajwtkk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdmd3dmZWxqZ2twaG9oYWp3dGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxOTg2MzAsImV4cCI6MjA0OTc3NDYzMH0.BDPqxoCCsUdAEh8EkH2HFHnul_VzHitzge1vPTItjYY";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase URL or Anon Key');
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      headers: {
        'Content-Type': 'application/json',
      },
    },
    db: {
      schema: 'public'
    },
  }
);

export const validateSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Session validation error:', error);
      return false;
    }
    return !!session;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
};