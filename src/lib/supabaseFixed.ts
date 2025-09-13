import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://jmwggzasoikndnpwkrca.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptd2dnemFzb2lrbmRucHdrcmNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzODE5MTAsImV4cCI6MjA2MTk1NzkxMH0.KTZ-cweeF1dtGuXTEAhJEmMto3AIbLBZrDvSew3Y7Uw';

/**
 * Custom storage adapter for Supabase that properly wraps AsyncStorage
 */
const CustomSupabaseStorage = {
  getItem: async (key: string) => {
    try {
      const item = await AsyncStorage.getItem(key);
      console.log(`📦 Storage GET [${key}]:`, item ? 'Found' : 'Not found');
      return item;
    } catch (error) {
      console.error(`❌ Storage GET error [${key}]:`, error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      console.log(`📦 Storage SET [${key}]:`, value ? 'Saving data' : 'Empty value');
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`❌ Storage SET error [${key}]:`, error);
      // Don't throw - this could be causing the 500 error
    }
  },
  removeItem: async (key: string) => {
    try {
      console.log(`📦 Storage REMOVE [${key}]`);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`❌ Storage REMOVE error [${key}]:`, error);
      // Don't throw
    }
  },
};

// Create Supabase client with RN-ready configuration
export const supabaseFixed = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: CustomSupabaseStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Disable URL detection since we handle it manually
    flowType: 'pkce', // Use PKCE flow for better security
  },
  global: {
    headers: {
      'x-client-info': 'crypto-clips-mobile',
    },
  },
});

// Debug function to check storage
export const debugStorage = async () => {
  console.log('🔍 Checking AsyncStorage contents...');
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log('📦 Storage keys:', keys);
    
    for (const key of keys) {
      if (key.includes('supabase') || key.includes('auth')) {
        const value = await AsyncStorage.getItem(key);
        console.log(`  ${key}:`, value?.substring(0, 100) + '...');
      }
    }
  } catch (error) {
    console.error('❌ Storage debug error:', error);
  }
};

// Clear all auth-related storage
export const clearAuthStorage = async () => {
  console.log('🧹 Clearing auth storage...');
  try {
    const keys = await AsyncStorage.getAllKeys();
    const authKeys = keys.filter(key => 
      key.includes('supabase') || 
      key.includes('auth') || 
      key.includes('sb-')
    );
    
    for (const key of authKeys) {
      await AsyncStorage.removeItem(key);
      console.log(`  Removed: ${key}`);
    }
    
    console.log('✅ Auth storage cleared');
  } catch (error) {
    console.error('❌ Clear storage error:', error);
  }
};

// Comprehensive Supabase connection test
export const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase connection (comprehensive)...');
  
  const results = {
    auth: false,
    database: false,
    session: null as any
  };
  
  console.log(results);
  
  try {
    // Test 1: Auth connection
    console.log('📡 Testing auth connection...');
    const { data, error } = await supabaseFixed.auth.getSession();
    
    // Enhanced logging for data object
    console.log('📊 Raw data object:', JSON.stringify(data, null, 2));
    console.log('📊 Data type:', typeof data);
    console.log('📊 Data keys:', data ? Object.keys(data) : 'null/undefined');
    
    if (data?.session) {
      console.log('👤 Session found:', {
        user_id: data.session.user?.id,
        email: data.session.user?.email,
        expires_at: data.session.expires_at
      });
      results.session = data.session;
    } else {
      console.log('❌ No session found in data');
    }
    
    if (error) {
      console.error('❌ Auth connection error:', error);
    } else {
      console.log('✅ Auth connection OK');
      results.auth = true;
    }
    
    // Test 2: Database connection
    console.log('🗄️ Testing database connection...');
    try {
      const { data: dbData, error: dbError } = await supabaseFixed.from('_test_').select('*').limit(1);
      
      if (dbError?.code === '42P01') {
        console.log('✅ Database connection successful (table does not exist is expected)');
        results.database = true;
      } else if (dbError) {
        console.error('❌ Database connection error:', dbError);
      } else {
        console.log('✅ Database connection successful');
        results.database = true;
      }
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
    }
    
    console.log('📊 Final results:', results);
    return results;
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return results;
  }
};

// Helper function to get current user
export const getCurrentUser = async () => {
  try {
    const { data: { session } } = await supabaseFixed.auth.getSession();
    if (!session) {
      return null;
    }
    const { data: { user }, error } = await supabaseFixed.auth.getUser();
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

export default supabaseFixed;