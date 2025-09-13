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
    console.log('🔐 Starting Google OAuth with improved flow...');
    
    try {
      // Clear any corrupted storage first
      await clearCorruptedStorage();
      
      // 1. Use proper redirect URL format
      const redirectTo = `${Constants.expoConfig?.scheme || 'cryptoclips'}://auth/callback`;
      
      console.log('🔗 Using redirect URL:', redirectTo);
      console.log('📱 App scheme:', Constants.expoConfig?.scheme);
      console.log('🌐 Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
      console.log('🔑 Supabase Key present:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
      
      // 2. Generate OAuth URL with proper configuration
      const { data, error } = await supabaseFixed.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: false, // Let Supabase handle the redirect
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('❌ OAuth URL generation failed:', error);
        console.error('❌ Error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText
        });
        throw new Error(`OAuth setup failed: ${error.message}`);
      }

      if (!data.url) {
        console.error('❌ No OAuth URL in response data:', data);
        throw new Error('No OAuth URL generated');
      }

      console.log('✅ OAuth URL generated successfully');

      // 3. Use WebBrowser.openAuthSessionAsync for proper deep link handling
      console.log('🌐 Opening browser for OAuth with deep link support...');
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
        {
          showInRecents: false,
          preferEphemeralSession: true,
        }
      );

      console.log('🔍 Browser result:', result);

      // 4. Handle browser results - openAuthSessionAsync returns 'success' with URL or 'cancel'
      if (result.type === 'success' && result.url) {
        console.log('✅ OAuth callback received:', result.url);
        
        // Parse the URL to extract the auth code
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');
        
        if (error) {
          console.error('❌ OAuth error in callback:', error);
          return { success: false, error: `OAuth error: ${error}` };
        }
        
        if (code) {
          console.log('🔄 Exchanging code for session...');
          const { data: sessionData, error: exchangeError } = await supabaseFixed.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('❌ Code exchange failed:', exchangeError);
            return { success: false, error: `Code exchange failed: ${exchangeError.message}` };
          }
          
          if (sessionData?.session) {
            console.log('✅ User authenticated successfully!');
            console.log('👤 User email:', sessionData.session.user.email);
            console.log('🆔 User ID:', sessionData.session.user.id);
            
            return {
              success: true,
              user: sessionData.session.user,
              session: sessionData.session
            };
          } else {
            console.log('❌ No session in exchange response');
            return { success: false, error: 'No session received from code exchange' };
          }
        } else {
          console.log('❌ No code in callback URL');
          return { success: false, error: 'No authorization code received' };
        }
      } else if (result.type === 'cancel') {
        console.log('⏹️ User cancelled OAuth flow');
        return { success: false, error: 'User cancelled authentication' };
      } else {
        console.error('❌ Unexpected browser result:', result);
        return { success: false, error: 'Unexpected browser result' };
      }

    } catch (error) {
      console.error('❌ Google OAuth failed:', error);
      throw error;
    }
  });
}
