import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

/**
 * Quick authentication methods that bypass Google OAuth
 */
export class QuickAuth {
  /**
   * Create a demo account instantly
   */
  static async createInstantAccount() {
    try {
      // Generate unique email
      const randomId = Math.random().toString(36).substring(2, 8);
      const email = `user-${randomId}@cryptoclips.demo`;
      const password = `Demo-${randomId}-2024!`;
      
      console.log('🚀 Creating instant account...');
      
      // Create account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: `User ${randomId}`,
            is_demo: true,
          },
        },
      });

      if (error) {
        // If email exists, try to sign in
        if (error.message.includes('already registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (!signInError && signInData.session) {
            console.log('✅ Signed in to existing account');
            return { success: true, session: signInData.session };
          }
        }
        throw error;
      }

      // Auto sign in after creation
      const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (sessionError) {
        throw sessionError;
      }

      // Save credentials locally for reference
      await AsyncStorage.setItem('demo_credentials', JSON.stringify({ email, password }));
      
      console.log('✅ Instant account created and signed in!');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password);
      
      Alert.alert(
        'Account Created!',
        `You're now signed in!\n\nEmail: ${email}\nPassword: ${password}\n\nThese credentials are saved for you.`,
        [{ text: 'OK' }]
      );

      return { 
        success: true, 
        session: sessionData.session,
        credentials: { email, password }
      };
      
    } catch (error: any) {
      console.error('❌ Instant account creation failed:', error);
      Alert.alert('Error', error.message || 'Failed to create account');
      return { success: false, error };
    }
  }

  /**
   * Sign in with any email (creates account if needed)
   */
  static async signInWithAnyEmail(email: string) {
    try {
      console.log('📧 Processing email sign-in for:', email);
      
      // First try magic link
      const { error: magicError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (!magicError) {
        console.log('✅ Magic link sent to:', email);
        Alert.alert(
          'Check Your Email',
          `We've sent a sign-in link to ${email}. Click the link to sign in!`,
          [{ text: 'OK' }]
        );
        return { success: true, method: 'magic-link' };
      }

      // If magic link fails, create password account
      const password = `Crypto-${Date.now()}!`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
        },
      });

      if (error) {
        throw error;
      }

      // Sign in immediately
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!signInError) {
        Alert.alert(
          'Account Created',
          `Password: ${password}\n\nSave this password!`,
          [{ text: 'OK' }]
        );
        return { success: true, method: 'password', session: signInData.session };
      }

      throw signInError || new Error('Sign in failed');
      
    } catch (error: any) {
      console.error('❌ Email sign-in failed:', error);
      Alert.alert('Error', error.message || 'Failed to sign in');
      return { success: false, error };
    }
  }

  /**
   * Get saved demo credentials if they exist
   */
  static async getSavedCredentials() {
    try {
      const saved = await AsyncStorage.getItem('demo_credentials');
      if (saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Sign in with saved demo account
   */
  static async signInWithSavedAccount() {
    try {
      const credentials = await this.getSavedCredentials();
      
      if (!credentials) {
        console.log('No saved credentials found');
        return { success: false, error: 'No saved account' };
      }

      console.log('🔑 Signing in with saved account...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw error;
      }

      console.log('✅ Signed in with saved account');
      return { success: true, session: data.session };
      
    } catch (error: any) {
      console.error('❌ Saved account sign-in failed:', error);
      // Clear invalid credentials
      await AsyncStorage.removeItem('demo_credentials');
      return { success: false, error };
    }
  }

  /**
   * Complete bypass - Local-only mode
   */
  static async useLocalMode() {
    try {
      console.log('📱 Entering local-only mode...');
      
      // Create a mock user object
      const mockUser = {
        id: 'local-user-' + Date.now(),
        email: 'local@cryptoclips.app',
        created_at: new Date().toISOString(),
      };

      // Save to AsyncStorage
      await AsyncStorage.setItem('local_user', JSON.stringify(mockUser));
      
      console.log('✅ Local mode activated');
      Alert.alert(
        'Local Mode',
        'You can use the app without signing in. Your data will be saved locally on this device.',
        [{ text: 'OK' }]
      );

      return { success: true, localUser: mockUser };
      
    } catch (error: any) {
      console.error('❌ Local mode failed:', error);
      return { success: false, error };
    }
  }
}

export default QuickAuth;