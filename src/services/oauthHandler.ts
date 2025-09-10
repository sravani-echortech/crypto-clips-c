import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

export class OAuthHandler {
  private static instance: OAuthHandler;

  private constructor() {}

  static getInstance(): OAuthHandler {
    if (!OAuthHandler.instance) {
      OAuthHandler.instance = new OAuthHandler();
    }
    return OAuthHandler.instance;
  }

  // Handle Google OAuth for React Native
  async signInWithGoogle(): Promise<{ user: any; session: any } | null> {
    try {
      console.log('🚀 Starting Google OAuth flow...');
      
      // Get OAuth URL from Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: this.getRedirectUrl(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('❌ OAuth URL generation failed:', error);
        throw error;
      }

      if (!data.url) {
        throw new Error('No OAuth URL received');
      }

      console.log('📱 Opening OAuth URL in browser...');
      
      // Open OAuth URL in browser
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        this.getRedirectUrl()
      );

      if (result.type === 'success' && result.url) {
        console.log('✅ OAuth completed, processing result...');
        
        // Extract auth code from URL
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');
        
        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }
        
        if (code) {
          // Exchange code for session
          const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (sessionError) {
            console.error('❌ Session exchange failed:', sessionError);
            throw sessionError;
          }
          
          console.log('✅ Session created successfully');
          return sessionData;
        }
      } else if (result.type === 'cancel') {
        console.log('⚠️ OAuth was cancelled by user');
        return null;
      } else {
        console.log('⚠️ OAuth result:', result.type);
        return null;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Google OAuth failed:', error);
      throw error;
    }
  }

  // Get the appropriate redirect URL based on platform
  private getRedirectUrl(): string {
    if (Platform.OS === 'web') {
      // For web platform, use window location if available
      // Use global window reference to avoid TypeScript errors
      const globalWindow = (global as any).window;
      if (typeof globalWindow !== 'undefined' && globalWindow?.location) {
        return `${globalWindow.location.origin}/auth/callback`;
      }
      // Fallback for web
      return 'http://localhost:19006/auth/callback';
    }
    
    // For React Native, use your app's custom scheme
    return 'cryptoclips://auth/callback';
  }

  // Handle deep link authentication
  async handleDeepLink(url: string): Promise<{ user: any; session: any } | null> {
    try {
      console.log('🔗 Processing deep link:', url);
      
      // Extract auth code from deep link
      const urlObj = new URL(url);
      const code = urlObj.searchParams.get('code');
      const error = urlObj.searchParams.get('error');
      
      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }
      
      if (code) {
        // Exchange code for session
        const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (sessionError) {
          console.error('❌ Session exchange failed:', sessionError);
          throw sessionError;
        }
        
        console.log('✅ Session created from deep link');
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Deep link handling failed:', error);
      throw error;
    }
  }

  // Check if OAuth is supported on this platform
  async isSupported(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return true; // Web always supports OAuth
    }
    
    try {
      // For mobile platforms, OAuth is generally supported
      // WebBrowser.maybeCompleteAuthSession is for cleanup, not availability check
      return true;
    } catch {
      // If any check fails, assume it's supported
      return true;
    }
  }
}

export default OAuthHandler;
