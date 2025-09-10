import { supabase } from '@/lib/supabase';
import supabaseFixed, { debugStorage, clearAuthStorage, testSupabaseConnection } from '@/lib/supabaseFixed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

/**
 * Debug service to diagnose the 500 error
 */
export class AuthDebugger {
  /**
   * Run complete diagnostics
   */
  static async runDiagnostics() {
    console.log('\n🔍 ========== AUTH DIAGNOSTICS ==========\n');
    
    const results = {
      storage: await this.testStorage(),
      connection: await this.testConnection(),
      oauthUrl: await this.testOAuthUrl(),
      headers: await this.testHeaders(),
      timestamp: new Date().toISOString(),
    };
    
    console.log('\n📊 Diagnostic Results:', JSON.stringify(results, null, 2));
    
    Alert.alert(
      'Diagnostics Complete',
      `Storage: ${results.storage ? '✅' : '❌'}\n` +
      `Connection: ${results.connection ? '✅' : '❌'}\n` +
      `OAuth URL: ${results.oauthUrl ? '✅' : '❌'}\n` +
      `Headers: ${results.headers ? '✅' : '❌'}`,
      [{ text: 'OK' }]
    );
    
    return results;
  }
  
  /**
   * Test AsyncStorage
   */
  static async testStorage() {
    console.log('📦 Testing AsyncStorage...');
    try {
      // Test write
      await AsyncStorage.setItem('test-key', 'test-value');
      
      // Test read
      const value = await AsyncStorage.getItem('test-key');
      
      // Test delete
      await AsyncStorage.removeItem('test-key');
      
      console.log('✅ AsyncStorage working');
      
      // Check for any existing auth data
      await debugStorage();
      
      return true;
    } catch (error) {
      console.error('❌ AsyncStorage error:', error);
      return false;
    }
  }
  
  /**
   * Test Supabase connection
   */
  static async testConnection() {
    console.log('🌐 Testing Supabase connection...');
    
    // Test both clients
    const results = {
      original: false,
      fixed: false,
    };
    
    try {
      // Test original client
      const { error: origError } = await supabase.auth.getSession();
      results.original = !origError;
      console.log('Original client:', results.original ? '✅' : '❌', origError?.message);
    } catch (e) {
      console.error('Original client error:', e);
    }
    
    try {
      // Test fixed client
      const connectionResult = await testSupabaseConnection();
      results.fixed = connectionResult.auth && connectionResult.database;
      console.log('Fixed client:', results.fixed ? '✅' : '❌');
      console.log('Connection details:', connectionResult);
    } catch (e) {
      console.error('Fixed client error:', e);
    }
    
    return results.original || results.fixed;
  }
  
  /**
   * Test OAuth URL generation
   */
  static async testOAuthUrl() {
    console.log('🔗 Testing OAuth URL generation...');
    
    try {
      // Try with fixed client
      const { data, error } = await supabaseFixed.auth.signInWithOAuth({
        provider: 'google',
        options: {
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        console.error('❌ OAuth URL error:', error);
        
        // Log detailed error info
        console.log('Error details:', {
          message: error.message,
          status: (error as any).status,
          code: (error as any).code,
          details: (error as any).details,
        });
        
        return false;
      }
      
      if (data?.url) {
        console.log('✅ OAuth URL generated:', data.url.substring(0, 100) + '...');
        return true;
      }
      
      console.log('⚠️ No OAuth URL received');
      return false;
      
    } catch (error: any) {
      console.error('❌ OAuth test failed:', error);
      
      // Check if it's a network error
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        console.log('📡 Network issue detected');
      }
      
      return false;
    }
  }
  
  /**
   * Test request headers and configuration
   */
  static async testHeaders() {
    console.log('📋 Testing request headers...');
    
    try {
      // Make a raw fetch to check headers
      const response = await fetch('https://jmwggzasoikndnpwkrca.supabase.co/auth/v1/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptd2dnemFzb2lrbmRucHdrcmNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzODE5MTAsImV4cCI6MjA2MTk1NzkxMH0.KTZ-cweeF1dtGuXTEAhJEmMto3AIbLBZrDvSew3Y7Uw',
        },
      });
      
      const data = await response.json();
      console.log('✅ Health check response:', data);
      
      return response.ok;
    } catch (error) {
      console.error('❌ Headers test error:', error);
      return false;
    }
  }
  
  /**
   * Try a different OAuth approach
   */
  static async testAlternativeOAuth() {
    console.log('🔄 Testing alternative OAuth approach...');
    
    try {
      // Clear any existing storage issues
      await clearAuthStorage();
      
      // Use fixed client with minimal options
      const { data, error } = await supabaseFixed.auth.signInWithOAuth({
        provider: 'google',
        options: {
          skipBrowserRedirect: true,
        },
      });
      
      if (error) {
        console.error('❌ Alternative OAuth error:', error);
        return null;
      }
      
      console.log('✅ Alternative OAuth URL:', data?.url);
      return data?.url;
      
    } catch (error) {
      console.error('❌ Alternative OAuth failed:', error);
      return null;
    }
  }
  
  /**
   * Manual OAuth URL construction
   */
  static getManualOAuthUrl() {
    const baseUrl = 'https://jmwggzasoikndnpwkrca.supabase.co';
    const timestamp = Date.now();
    
    // Construct URL manually without API call
    const manualUrl = `${baseUrl}/auth/v1/authorize?provider=google&timestamp=${timestamp}`;
    
    console.log('🔗 Manual OAuth URL:', manualUrl);
    return manualUrl;
  }
  
  /**
   * Clear all problematic data and reset
   */
  static async resetEverything() {
    console.log('🔄 Resetting everything...');
    
    try {
      // Clear all AsyncStorage
      await AsyncStorage.clear();
      console.log('✅ AsyncStorage cleared');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      await supabaseFixed.auth.signOut();
      console.log('✅ Signed out from all clients');
      
      Alert.alert(
        'Reset Complete',
        'All authentication data has been cleared. Try signing in again.',
        [{ text: 'OK' }]
      );
      
      return true;
    } catch (error) {
      console.error('❌ Reset error:', error);
      return false;
    }
  }
}

export default AuthDebugger;