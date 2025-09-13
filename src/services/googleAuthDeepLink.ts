import 'react-native-url-polyfill/auto';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseFixed } from '../lib/supabaseFixed';

// Complete auth session on native (safe no-op on web)
WebBrowser.maybeCompleteAuthSession();

// Clear corrupted storage before OAuth
async function clearCorruptedStorage() {
  try {
    console.log('🧹  Clearing potentially corrupted storage...');
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
        console.log(`🗑️  Cleared storage key: ${key}`);
      } catch (error) {
        console.log(`⚠️  Could not clear key ${key}:`, error);
      }
    }
    
    console.log('✅  Storage cleared successfully');
  } catch (error) {
    console.log('⚠️  Error clearing storage:', error);
  }
}

export async function signInWithGoogle() {
  return (async () => {
    console.log('🔐 [IDEAL] Starting Google OAuth with ideal Supabase flow...');
    
    try {
      // 1. Use your app's deep link scheme as redirect URL (IDEAL APPROACH)
      const redirectTo = `${Constants.expoConfig?.scheme || 'cryptoclips'}://auth/callback`;
      
      console.log('🔗 [IDEAL] Using app deep link scheme:', redirectTo);
      
      // Set auth context
      console.log('Auth config:', {
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
          
          return { success: true, session };
        } else {
          console.log('❌ [IDEAL] No session found - user may have cancelled');
          return { success: false, cancelled: true };
        }
      }

      return { success: false };

    } catch (error) {
      console.error('❌ [IDEAL] Google OAuth failed:', error);
      throw error;
    }
  });
}
