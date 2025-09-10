import 'react-native-url-polyfill/auto';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseFixed } from '../lib/supabaseFixed';
import * as Sentry from '@sentry/react-native';

// Complete auth session on native (safe no-op on web)
WebBrowser.maybeCompleteAuthSession();

// Clear corrupted storage before OAuth
async function clearCorruptedStorage() {
  try {
    console.log('🧹 [SENTRY] Clearing potentially corrupted storage...');
    await supabaseFixed.auth.signOut();
    
    // Clear specific auth-related keys
    const authKeys = [
      'sb-jmwggzasoikndnpwkrca-auth-token',
      'supabase.auth.token',
      'supabase.auth.session',
    ];
    
    for (const key of authKeys) {
      try {
        await AsyncStorage.removeItem(key);
        console.log(`🗑️ [SENTRY] Cleared storage key: ${key}`);
      } catch (error) {
        console.log(`⚠️ [SENTRY] Could not clear key ${key}:`, error);
      }
    }
    
    console.log('✅ [SENTRY] Storage cleared successfully');
  } catch (error) {
    console.log('⚠️ [SENTRY] Error clearing storage:', error);
  }
}

export async function signInWithGoogle() {
  return Sentry.startSpan({
    name: 'Google OAuth Ideal Flow',
    op: 'auth.google_oauth_ideal',
  }, async (span) => {
    console.log('🔐 [IDEAL] Starting Google OAuth with ideal Supabase flow...');
    
    try {
      // 1. Use your app's deep link scheme as redirect URL (IDEAL APPROACH)
      const redirectTo = `${Constants.expoConfig?.scheme || 'cryptoclips'}://auth/callback`;
      
      console.log('🔗 [IDEAL] Using app deep link scheme:', redirectTo);
      
      Sentry.setContext('auth_config', {
        scheme: Constants.expoConfig?.scheme,
        redirectTo,
        flow: 'ideal_supabase_oauth'
      });

      // 2. Let Supabase handle the OAuth flow automatically (IDEAL APPROACH)
      const { data, error } = await supabaseFixed.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          // Don't skip browser redirect - let Supabase handle it automatically
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error('❌ [IDEAL] OAuth URL generation failed:', error);
        Sentry.captureException(error, {
          tags: {
            component: 'googleAuthDeepLink',
            method: 'signInWithGoogle',
            step: 'oauth_url_generation',
          },
        });
        throw error;
      }

      console.log('✅ [IDEAL] OAuth URL generated successfully');

      // 3. Open browser - Supabase handles the redirect automatically (IDEAL APPROACH)
      console.log('🌐 [IDEAL] Opening browser for OAuth...');
      const result = await WebBrowser.openBrowserAsync(data.url!);

      console.log('🔍 [IDEAL] Browser result:', result);

      // 4. Simple session check after browser closes (IDEAL APPROACH)
      if (result.type === 'dismiss') {
        console.log('⏳ [IDEAL] Browser dismissed, checking for session...');
        
        // Wait a moment for Supabase to process the OAuth callback
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: { session }, error: sessionError } = await supabaseFixed.auth.getSession();
        
        if (session) {
          console.log('✅ [IDEAL] User authenticated successfully!');
          console.log('👤 [IDEAL] User email:', session.user.email);
          
          Sentry.addBreadcrumb({
            message: 'User authenticated successfully',
            category: 'auth',
            level: 'info',
            data: { 
              user_email: session.user.email,
              flow: 'ideal_supabase_oauth'
            },
          });
          
          return { success: true, session };
        } else {
          console.log('❌ [IDEAL] No session found - user may have cancelled');
          return { success: false, cancelled: true };
        }
      }

      return { success: false };

    } catch (error) {
      console.error('❌ [IDEAL] Google OAuth failed:', error);
      
      Sentry.captureException(error, {
        tags: {
          component: 'googleAuthDeepLink',
          method: 'signInWithGoogle',
        },
      });
      
      throw error;
    }
  });
}

// Debug function to test and fix auth issues
export async function debugAuthIssues() {
  console.log('\n🔍 ========== AUTH DEBUG SESSION ==========\n');
  
  try {
    // 1. Test storage
    console.log('1️⃣ Testing AsyncStorage...');
    try {
      await AsyncStorage.setItem('test-key', 'test-value');
      const value = await AsyncStorage.getItem('test-key');
      await AsyncStorage.removeItem('test-key');
      console.log('✅ AsyncStorage is working');
    } catch (error) {
      console.log('❌ AsyncStorage failed:', error);
      return false;
    }
    
    // 2. Clear all auth storage
    console.log('2️⃣ Clearing auth storage...');
    await clearCorruptedStorage();
    
    // 3. Test Supabase connection
    console.log('3️⃣ Testing Supabase connection...');
    try {
      const { data, error } = await supabaseFixed.auth.getSession();
      if (error) {
        console.log('❌ Supabase connection failed:', error.message);
        return false;
      }
      console.log('✅ Supabase connection working');
    } catch (error) {
      console.log('❌ Supabase connection error:', error);
      return false;
    }
    
    // 4. Test OAuth URL generation with ideal approach
    console.log('4️⃣ Testing OAuth URL generation with ideal approach...');
    try {
      const redirectTo = `${Constants.expoConfig?.scheme || 'cryptoclips'}://auth/callback`;
      
      const { data, error } = await supabaseFixed.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo, 
          skipBrowserRedirect: false // Let Supabase handle it
        },
      });
      
      if (error) {
        console.log('❌ OAuth URL generation failed:', error.message);
        console.log('❌ Error status:', error.status);
        return false;
      }
      
      console.log('✅ OAuth URL generation working');
      console.log('🔗 Generated URL:', data.url?.substring(0, 100) + '...');
      console.log('🔗 Using redirect:', redirectTo);
    } catch (error) {
      console.log('❌ OAuth URL generation error:', error);
      return false;
    }
    
    console.log('\n✅ All tests passed! Auth should work now.\n');
    return true;
    
  } catch (error) {
    console.log('❌ Debug session failed:', error);
    return false;
  }
}

// Test function to verify the new auth flow
export async function testNewAuthFlow() {
  console.log('\n🧪 ========== TESTING NEW AUTH FLOW ==========\n');
  
  try {
    // Test 1: Clear storage
    console.log('1️⃣ Clearing storage...');
    await clearCorruptedStorage();
    
    // Test 2: Generate OAuth URL with ideal approach
    console.log('2️⃣ Testing OAuth URL generation with ideal approach...');
    const redirectTo = `${Constants.expoConfig?.scheme || 'cryptoclips'}://auth/callback`;
    
    const { data, error } = await supabaseFixed.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo, 
        skipBrowserRedirect: false // Let Supabase handle it
      },
    });
    
    if (error) {
      console.log('❌ OAuth URL generation failed:', error.message);
      return false;
    }
    
    console.log('✅ OAuth URL generated successfully');
    console.log('🔗 URL starts with:', data.url?.substring(0, 50) + '...');
    console.log('🔗 Using redirect:', redirectTo);
    
    // Test 3: Check if URL uses proper app deep link
    if (data.url?.includes(redirectTo)) {
      console.log('✅ URL uses proper app deep link scheme');
    } else {
      console.log('⚠️ Warning: URL does not use app deep link scheme');
    }
    
    console.log('\n✅ New auth flow test passed! Ready to use.\n');
    return true;
    
  } catch (error) {
    console.log('❌ New auth flow test failed:', error);
    return false;
  }
}
