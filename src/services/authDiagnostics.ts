import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

/**
 * Diagnostic service to test authentication methods
 */
export class AuthDiagnostics {
  /**
   * Test Supabase connection (delegates to supabaseFixed)
   */
  static async testConnection() {
    // Import and use the comprehensive test from supabaseFixed
    const { testSupabaseConnection } = await import('../lib/supabaseFixed');
    return await testSupabaseConnection();
  }

  /**
   * Test email authentication (Magic Link)
   */
  static async testEmailAuth(email: string) {
    try {
      console.log('📧 Testing email authentication...');
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: undefined, // Let Supabase handle it
        },
      });

      if (error) {
        console.error('❌ Email auth error:', error);
        Alert.alert('Email Auth Error', error.message);
        return false;
      }

      console.log('✅ Magic link sent to:', email);
      Alert.alert(
        'Check Your Email',
        `A magic link has been sent to ${email}. Click the link to sign in.`,
        [{ text: 'OK' }]
      );
      return true;
    } catch (error) {
      console.error('❌ Email auth failed:', error);
      return false;
    }
  }

  /**
   * Test anonymous sign-in (for development)
   */
  static async testAnonymousAuth() {
    try {
      console.log('👤 Testing anonymous authentication...');
      
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.error('❌ Anonymous auth error:', error);
        
        // If anonymous auth is not enabled, try email with random address
        const randomEmail = `test-${Date.now()}@example.com`;
        console.log('📧 Falling back to email auth with:', randomEmail);
        
        return await this.testEmailAuth(randomEmail);
      }

      console.log('✅ Signed in anonymously');
      return true;
    } catch (error) {
      console.error('❌ Anonymous auth failed:', error);
      return false;
    }
  }

  /**
   * Create test account with email/password
   */
  static async createTestAccount() {
    try {
      const testEmail = `test-${Date.now()}@cryptoclips.com`;
      const testPassword = 'TestPassword123!';
      
      console.log('🔑 Creating test account...');
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: undefined,
          data: {
            name: 'Test User',
          },
        },
      });

      if (error) {
        console.error('❌ Test account creation error:', error);
        return null;
      }

      console.log('✅ Test account created:', testEmail);
      console.log('📝 Password:', testPassword);
      
      Alert.alert(
        'Test Account Created',
        `Email: ${testEmail}\nPassword: ${testPassword}\n\nSave these credentials for testing!`,
        [{ text: 'OK' }]
      );

      return { email: testEmail, password: testPassword };
    } catch (error) {
      console.error('❌ Test account creation failed:', error);
      return null;
    }
  }

  /**
   * Check current session
   */
  static async checkSession() {
    try {
      console.log('🔍 Checking current session...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session check error:', error);
        return null;
      }

      if (session) {
        console.log('✅ Active session found:', session.user.email);
        console.log('📅 Expires at:', new Date(session.expires_at! * 1000).toLocaleString());
        return session;
      }

      console.log('⚠️ No active session');
      return null;
    } catch (error) {
      console.error('❌ Session check failed:', error);
      return null;
    }
  }

  /**
   * Clear all authentication data
   */
  static async clearAuth() {
    try {
      console.log('🧹 Clearing authentication...');
      
      await supabase.auth.signOut();
      
      console.log('✅ Authentication cleared');
      Alert.alert('Success', 'Authentication data cleared');
      return true;
    } catch (error) {
      console.error('❌ Clear auth failed:', error);
      return false;
    }
  }

  /**
   * Run all diagnostics
   */
  static async runFullDiagnostics() {
    console.log('🏥 Running full authentication diagnostics...\n');
    
    const results = {
      connection: await this.testConnection(),
      session: await this.checkSession(),
      timestamp: new Date().toISOString(),
    };

    console.log('\n📊 Diagnostic Results:', results);
    
    return results;
  }
}

export default AuthDiagnostics;