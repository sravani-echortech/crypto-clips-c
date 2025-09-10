import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

/**
 * Direct OAuth implementation that bypasses Supabase client
 * to avoid 500 errors
 */
export class DirectOAuth {
  /**
   * Directly open Google OAuth URL without using Supabase client
   */
  static async signInWithGoogle() {
    try {
      console.log('🚀 Direct OAuth: Starting Google sign-in...');
      
      // Construct OAuth URL manually
      const baseUrl = 'https://jmwggzasoikndnpwkrca.supabase.co';
      const timestamp = Date.now();
      
      // Simple OAuth URL without any complex parameters
      const oauthUrl = `${baseUrl}/auth/v1/authorize?provider=google`;
      
      console.log('📱 Opening direct OAuth URL:', oauthUrl);
      
      // Open browser
      const result = await WebBrowser.openBrowserAsync(oauthUrl);
      console.log('🔍 Browser result:', result);
      
      if (result.type !== 'opened') {
        console.log('⚠️ Browser was cancelled or dismissed');
        return { success: false, cancelled: true };
      }
      
      // Wait for auth to complete
      console.log('⏳ Waiting for authentication to complete...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Poll for session
      console.log('🔍 Checking for session...');
      for (let i = 0; i < 30; i++) {
        try {
          // Check with the regular supabase client
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (session) {
            console.log('✅ Session found!');
            console.log('👤 User:', session.user.email);
            
            // Verify session is valid
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              console.log('✅ Session verified');
              return { success: true, session, user };
            }
          }
        } catch (e) {
          console.log(`Attempt ${i + 1} error:`, e);
        }
        
        if (i % 5 === 0 && i > 0) {
          console.log(`⏳ Still checking... (${i * 2}s)`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      console.log('⚠️ No session detected after timeout');
      
      // Offer quick demo as fallback
      Alert.alert(
        'Sign-In Taking Too Long',
        'Google sign-in is taking longer than expected. Would you like to use a Quick Demo Account instead?',
        [
          {
            text: 'Quick Demo',
            onPress: async () => {
              const { default: QuickAuth } = await import('@/services/quickAuth');
              const result = await QuickAuth.createInstantAccount();
              return result;
            },
          },
          { text: 'Keep Waiting', style: 'cancel' },
        ]
      );
      
      return { success: false };
      
    } catch (error) {
      console.error('❌ Direct OAuth error:', error);
      throw error;
    }
  }
}

export default DirectOAuth;