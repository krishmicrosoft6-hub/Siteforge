import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://zwyefyxhgxqryvyzoojk.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eWVmeXhoZ3hxcnl2eXpvb2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyNTkxMzgsImV4cCI6MjEwNTgzNTEzOH0.BU1gsIcgJ3Qz-fSjwny2jouFDXS-OOFHdxE4D4kl6v4';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
