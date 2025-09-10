import { supabaseFixed } from '@/lib/supabaseFixed';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { Alert, Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

/**
 * Mobile-specific OAuth handler that properly handles the callback
 */
export class MobileOAuth {
  /**
   * Handle OAuth for mobile with proper session exchange
   */
  static async signInWithGoogle() {
    try {
      console.log('📱 Mobile OAuth: Starting Google sign-in...');
      
      // Clear any stale auth data first
      const storageKeys = ['sb-jmwggzasoikndnpwkrca-auth-token', 'sb-jmwggzasoikndnpwkrca-auth-token-code-verifier'];
      for (const key of storageKeys) {
        try {
          await AsyncStorage.removeItem(key);
          console.log(`🧹 Cleared: ${key}`);
        } catch (e) {
          // Ignore
        }
      }
      
      // Always use the custom scheme for mobile OAuth
      // The deep link handler in AuthContext will process it
      const redirectTo = 'cryptoclips://auth/callback';
      
      console.log('🔗 Redirect URL:', redirectTo);
      
      const { data, error } = await supabaseFixed.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true, // Need this to get the URL for mobile
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        console.error('❌ OAuth URL generation error:', error);
        throw error;
      }
      
      if (!data?.url) {
        throw new Error('No OAuth URL received');
      }
      
      console.log('✅ OAuth URL generated');
      console.log('🌐 Opening browser...');
      
      // For Expo Go, we can't use custom schemes, so fall back to regular browser
      let result: any;
      
      try {
        // Try auth session first (works in standalone apps)
        result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo,
          {
            showInRecents: true,
            preferEphemeralSession: false,
          }
        );
        console.log('🔍 Auth session result:', result);
      } catch (authError) {
        console.log('⚠️ Auth session not supported, using regular browser...');
        
        // Fall back to regular browser for Expo Go
        result = await WebBrowser.openBrowserAsync(data.url);
        console.log('🔍 Browser result:', result);
        
        // For regular browser, we need to poll for session
        if (result.type === 'opened') {
          console.log('⏳ Browser opened, waiting for user to complete auth...');
          
          // Give user time to complete auth
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Start polling for session
          for (let i = 0; i < 30; i++) {
            const { data: { session } } = await supabaseFixed.auth.getSession();
            
            if (session) {
              console.log('✅ Session detected after browser auth!');
              console.log('👤 User:', session.user.email);
              return { success: true, session };
            }
            
            if (i % 5 === 0 && i > 0) {
              console.log(`⏳ Still checking for session... (${i * 2}s)`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
          console.log('⚠️ Session not detected after timeout');
          return { success: false, error: 'Session not established' };
        }
      }
      
      if (result.type === 'success' && result.url) {
        // Parse the URL for tokens
        console.log('✅ Auth successful, parsing callback URL...');
        const url = new URL(result.url);
        const hashParams = new URLSearchParams(url.hash.substring(1));
        const queryParams = new URLSearchParams(url.search);
        
        // Check for access token in hash or query
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
        
        if (accessToken) {
          console.log('🎉 Access token found! Setting session...');
          
          // Manually set the session
          const { data: sessionData, error: sessionError } = await supabaseFixed.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (sessionError) {
            console.error('❌ Session set error:', sessionError);
            throw sessionError;
          }
          
          console.log('✅ Session set successfully');
          return { success: true, session: sessionData.session };
        }
        
        // If no token in URL, check if session was set automatically
        console.log('⏳ No token in URL, checking for auto-set session...');
      }
      
      // Fallback: Poll for session (in case it was set server-side)
      console.log('⏳ Polling for session...');
      for (let i = 0; i < 15; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { data: { session } } = await supabaseFixed.auth.getSession();
        if (session) {
          console.log('✅ Session found via polling!');
          return { success: true, session };
        }
        
        if (i % 3 === 0) {
          console.log(`⏳ Still checking... (${i * 2}s)`);
        }
      }
      
      console.log('⚠️ No session found after timeout');
      
      // Last resort: Try to exchange code if present
      const url = result.type === 'success' ? new URL(result.url) : null;
      const code = url?.searchParams.get('code');
      
      if (code) {
        console.log('🔄 Found auth code, attempting exchange...');
        const { data: exchangeData, error: exchangeError } = await supabaseFixed.auth.exchangeCodeForSession(code);
        
        if (!exchangeError && exchangeData?.session) {
          console.log('✅ Code exchange successful!');
          return { success: true, session: exchangeData.session };
        }
        
        console.error('❌ Code exchange failed:', exchangeError);
      }
      
      return { success: false, error: 'No session established' };
      
    } catch (error: any) {
      console.error('❌ Mobile OAuth error:', error);
      
      // Offer fallback options
      Alert.alert(
        'Sign-In Failed',
        'Google sign-in encountered an issue. Would you like to try an alternative method?',
        [
          {
            text: 'Magic Link',
            onPress: () => {
              // Trigger magic link flow
              console.log('User chose magic link');
            },
          },
          {
            text: 'Quick Demo',
            onPress: async () => {
              const { default: QuickAuth } = await import('@/services/quickAuth');
              await QuickAuth.createInstantAccount();
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      
      throw error;
    }
  }
  
  /**
   * Handle deep link callbacks
   */
  static async handleCallback(url: string) {
    try {
      console.log('🔗 Handling callback URL:', url);
      
      const parsedUrl = new URL(url);
      const hashParams = new URLSearchParams(parsedUrl.hash.substring(1));
      const queryParams = new URLSearchParams(parsedUrl.search);
      
      // Check for error
      const error = queryParams.get('error') || hashParams.get('error');
      if (error) {
        console.error('❌ OAuth error in callback:', error);
        const errorDescription = queryParams.get('error_description') || hashParams.get('error_description');
        Alert.alert('Authentication Error', errorDescription || error);
        return false;
      }
      
      // Check for tokens
      const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
      
      if (accessToken) {
        console.log('🎉 Tokens found in callback, setting session...');
        
        const { data, error: sessionError } = await supabaseFixed.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        
        if (sessionError) {
          console.error('❌ Failed to set session:', sessionError);
          return false;
        }
        
        console.log('✅ Session established from callback');
        return true;
      }
      
      // Check for auth code
      const code = queryParams.get('code');
      if (code) {
        console.log('🔄 Auth code found, exchanging for session...');
        
        const { data, error: exchangeError } = await supabaseFixed.auth.exchangeCodeForSession(code);
        
        if (exchangeError) {
          console.error('❌ Code exchange failed:', exchangeError);
          return false;
        }
        
        console.log('✅ Session established via code exchange');
        return true;
      }
      
      console.log('⚠️ No tokens or code in callback URL');
      return false;
      
    } catch (error) {
      console.error('❌ Callback handling error:', error);
      return false;
    }
  }
}

// Import AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

export default MobileOAuth;