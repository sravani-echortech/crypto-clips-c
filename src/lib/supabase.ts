import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://jmwggzasoikndnpwkrca.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptd2dnemFzb2lrbmRucHdrcmNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzODE5MTAsImV4cCI6MjA2MTk1NzkxMH0.KTZ-cweeF1dtGuXTEAhJEmMto3AIbLBZrDvSew3Y7Uw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to get current user
export const getCurrentUser = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return null;
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      if (error.message === 'Auth session missing!') {
        return null;
      }
      throw error;
    }
    return user;
  } catch (error) {
    if (error instanceof Error && error.message === 'Auth session missing!') {
      return null;
    }
    console.error('Error getting current user:', error);
    return null;
  }
};
