import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jmwggzasoikndnpwkrca.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptd2dnemFzb2lrbmRucHdrcmNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzODE5MTAsImV4cCI6MjA2MTk1NzkxMH0.KTZ-cweeF1dtGuXTEAhJEmMto3AIbLBZrDvSew3Y7Uw';

/**
 * Minimal Supabase client for OAuth to avoid 500 errors
 * No custom storage, no PKCE, just basic OAuth
 */
export const supabaseOAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export default supabaseOAuth;