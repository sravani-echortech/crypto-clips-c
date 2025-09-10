import { supabase } from '@/lib/supabase';
import supabaseFixed from '@/lib/supabaseFixed';
import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

/**
 * Simplified Google Auth that works around the 500 error
 */
export class SimpleGoogleAuth {
  /**
   * Direct OAuth URL approach - bypasses some Supabase issues
   */
  static async signInWithGoogle() {
    try {
      console.log('🚀 Starting simplified Google OAuth...');
      console.log('🔧 Using fixed Supabase client with proper storage adapter');
      
      // First, try to generate OAuth URL with fixed client
      try {
        const { data, error } = await supabaseFixed.auth.signInWithOAuth({
          provider: 'google',
          options: {
            skipBrowserRedirect: true,
            redirectTo: 'https://jmwggzasoikndnpwkrca.supabase.co/auth/v1/callback',
          },
        });
        
        if (!error && data?.url) {
          console.log('✅ OAuth URL generated with fixed client');
          console.log('📱 Opening browser with URL:', data.url.substring(0, 100) + '...');
          
          const result = await WebBrowser.openBrowserAsync(data.url);
          console.log('🔍 Browser result:', result);
          
          // Poll for session after browser closes
          console.log('⏳ Browser closed, checking for session...');
          let attempts = 0;
          while (attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Force refresh to check for new session
            const { data: { session }, error: sessionError } = await supabaseFixed.auth.getSession();
            
            if (session) {
              console.log('✅ Session found!');
              console.log('👤 User:', session.user.email);
              return { success: true, session };
            }
            
            if (attempts % 5 === 0) {
              console.log(`⏳ Still checking... (${attempts * 2}s)`);
              // Try to refresh session in case it's pending
              await supabaseFixed.auth.refreshSession();
            }
            attempts++;
          }
        }
      } catch (apiError) {
        console.log('⚠️ API call failed, using manual URL:', apiError);
      }
      
      // Fallback to manual URL if API fails
      const baseUrl = 'https://jmwggzasoikndnpwkrca.supabase.co';
      const timestamp = Date.now();
      const googleAuthUrl = `${baseUrl}/auth/v1/authorize?provider=google&t=${timestamp}`;
      
      console.log('📱 Opening manual Google auth URL:', googleAuthUrl);
      
      // Open browser
      const result = await WebBrowser.openBrowserAsync(googleAuthUrl);
      
      // After browser closes, check for session
      console.log('⏳ Browser closed, checking for session...');
      
      // Poll for session (mobile requires this)
      let attempts = 0;
      const maxAttempts = 30;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          const { data: { session }, error } = await supabaseFixed.auth.getSession();
          
          if (session) {
            console.log('✅ Session found!');
            console.log('👤 User:', session.user.email);
            
            // Refresh to ensure session is active
            await supabaseFixed.auth.refreshSession();
            
            return { success: true, session };
          }
        } catch (e) {
          console.log('Session check attempt', attempts + 1, 'failed:', e);
        }
        
        attempts++;
        if (attempts % 5 === 0) {
          console.log(`⏳ Still checking... (${attempts * 2}s)`);
        }
      }
      
      console.log('⚠️ No session found after timeout');
      return { success: false };
      
    } catch (error: any) {
      console.error('❌ Simplified Google auth error:', error);
      throw error;
    }
  }

  /**
   * Alternative: Use Supabase's password auth with Google email
   */
  static async createGoogleEmailAccount(email: string) {
    try {
      if (!email.includes('@gmail.com') && !email.includes('@googlemail.com')) {
        Alert.alert('Error', 'Please use a Gmail address');
        return null;
      }

      // Generate a secure random password
      const password = `CryptoClips-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      console.log('📧 Creating account with Google email...');
      
      // Try to sign up
      const { data: signUpData, error: signUpError } = await supabaseFixed.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            provider: 'google-email',
            name: email.split('@')[0],
          },
        },
      });

      if (signUpError) {
        // If user exists, try to sign in
        if (signUpError.message.includes('already registered')) {
          Alert.alert(
            'Account Exists',
            'This email is already registered. Please use the magic link option to sign in.',
            [{ text: 'OK' }]
          );
          return null;
        }
        throw signUpError;
      }

      console.log('✅ Account created successfully');
      
      // Auto sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Sign in after signup failed:', signInError);
        // Still return credentials so user can sign in manually
      }

      Alert.alert(
        'Account Created!',
        `Your account has been created.\n\nEmail: ${email}\nPassword: ${password}\n\nSave this password!`,
        [{ text: 'OK' }]
      );

      return { email, password, session: signInData?.session };
      
    } catch (error) {
      console.error('❌ Google email account creation failed:', error);
      throw error;
    }
  }

  /**
   * Magic Link - Most reliable fallback
   */
  static async sendMagicLink(email: string) {
    try {
      console.log('🔮 Sending magic link to:', email);
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: undefined, // Let Supabase handle it
        },
      });

      if (error) {
        console.error('❌ Magic link error:', error);
        throw error;
      }

      console.log('✅ Magic link sent');
      Alert.alert(
        'Check Your Email',
        `We've sent a magic link to ${email}. Click the link in your email to sign in.`,
        [{ text: 'OK' }]
      );

      return true;
    } catch (error) {
      console.error('❌ Magic link failed:', error);
      throw error;
    }
  }

  /**
   * Test the Supabase connection (delegates to supabaseFixed)
   */
  static async testConnection() {
    // Import and use the comprehensive test from supabaseFixed
    const { testSupabaseConnection } = await import('../lib/supabaseFixed');
    return await testSupabaseConnection();
  }
}

export default SimpleGoogleAuth;