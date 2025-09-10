import { supabaseFixed } from '@/lib/supabaseFixed';
import { supabaseOAuth } from '@/lib/supabaseOAuth';
import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';

/**
 * OAuth handler specifically for Expo Go development
 * Uses a different approach since Expo Go doesn't support custom URL schemes
 */
export class ExpoGoOAuth {
  /**
   * Sign in with Google using Expo Go compatible method
   */
  static async signInWithGoogle() {
    try {
      console.log('📱 Expo Go OAuth: Starting Google sign-in...');
      
      // Use minimal OAuth client to avoid 500 error
      console.log('🔧 Using minimal OAuth client without storage adapter...');
      const { data, error } = await supabaseOAuth.auth.signInWithOAuth({
        provider: 'google',
        options: {
          skipBrowserRedirect: true,
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
      console.log('🌐 Opening browser with Supabase callback...');
      
      // Open the OAuth URL
      const result = await WebBrowser.openBrowserAsync(data.url);
      console.log('🔍 Browser result:', result);
      
      // After browser closes, the session should be set server-side
      // We need to poll for it
      console.log('⏳ Browser closed, checking for session...');
      
      // Give server time to process the OAuth callback
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Poll for session with more aggressive checking
      for (let i = 0; i < 30; i++) {
        try {
          // Force a session refresh to get latest from server
          const { data: { session }, error: sessionError } = await supabaseFixed.auth.getSession();
          
          if (session) {
            console.log('✅ Session detected!');
            console.log('👤 User:', session.user.email);
            
            // Double-check by refreshing
            const { data: refreshData, error: refreshError } = await supabaseFixed.auth.refreshSession();
            if (refreshData?.session) {
              console.log('✅ Session verified and active');
              return { success: true, session: refreshData.session };
            }
          }
          
          // Also check if there's a new session via auth state
          const { data: { user } } = await supabaseFixed.auth.getUser();
          if (user) {
            console.log('✅ User found via getUser!');
            return { success: true, user };
          }
        } catch (e) {
          console.log(`Attempt ${i + 1}: Session check error:`, e);
        }
        
        if (i % 5 === 0 && i > 0) {
          console.log(`⏳ Still checking... (${i * 2}s)`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      console.log('⚠️ Session not detected after timeout');
      
      // Last attempt: Check if cookies were set
      console.log('🍪 Checking for session cookies...');
      const { data: finalSession } = await supabaseFixed.auth.getSession();
      if (finalSession?.session) {
        console.log('✅ Found session on final check!');
        return { success: true, session: finalSession.session };
      }
      
      return { success: false, error: 'Session not established' };
      
    } catch (error: any) {
      console.error('❌ Expo Go OAuth error:', error);
      
      Alert.alert(
        'Sign-In Issue',
        'Google sign-in is having issues in Expo Go. Try using the Quick Demo Account instead.',
        [
          {
            text: 'Use Quick Demo',
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
}

export default ExpoGoOAuth;