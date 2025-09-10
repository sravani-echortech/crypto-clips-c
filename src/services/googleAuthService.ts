import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

// Ensure web browser sessions complete properly
WebBrowser.maybeCompleteAuthSession();

export class GoogleAuthService {
  private static instance: GoogleAuthService;

  private constructor() {}

  static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  /**
   * Sign in with Google using Supabase OAuth
   * This works for both web and mobile platforms
   */
  async signInWithGoogle(): Promise<{ success: boolean; cancelled?: boolean }> {
    try {
      console.log('🚀 Starting Google OAuth with Supabase...');

      // Create redirect URL based on platform
      const redirectUrl = this.getRedirectUrl();
      console.log('📍 Generated URL:', redirectUrl);
      
      // Check if we're in Expo Go
      const isExpoGo = redirectUrl.startsWith('exp://');

      // Get OAuth URL from Supabase
      // For Expo Go on mobile, we need to handle this differently
      const oauthOptions: any = {
        provider: 'google',
        options: {
          skipBrowserRedirect: true, // Always skip auto-redirect for mobile
          queryParams: {
            access_type: 'offline',
            prompt: 'consent', // Always show consent screen
          },
        },
      };

      // Only set redirectTo for non-Expo Go environments
      if (!isExpoGo) {
        oauthOptions.options.redirectTo = redirectUrl;
      }
      // For Expo Go, let Supabase use its default redirect

      const { data, error } = await supabase.auth.signInWithOAuth(oauthOptions);

      if (error) {
        console.error('❌ OAuth initialization error:', error);
        throw error;
      }

      if (!data?.url) {
        console.error('❌ No OAuth URL in response:', data);
        throw new Error('No OAuth URL received from Supabase');
      }

      console.log('✅ OAuth URL received:', data.url);

      // Handle based on platform
      if (Platform.OS === 'web') {
        // For web, Supabase will handle the redirect automatically
        try {
          const globalWindow = (global as any).window;
          if (globalWindow?.location) {
            globalWindow.location.href = data.url;
          }
        } catch (e) {
          // Window not available, ignore
        }
        return { success: true };
      } else {
        // Check if we're in Expo Go
        const isExpoGo = redirectUrl.startsWith('exp://') || redirectUrl.includes('supabase.co');
        
        if (isExpoGo) {
          console.log('📱 Running in Expo Go - using web browser flow');
          // For Expo Go, open URL in browser
          await WebBrowser.openBrowserAsync(data.url);
          
          // Poll for session - Expo Go requires manual intervention
          console.log('⏳ Waiting for authentication to complete...');
          console.log('👆 Please complete sign-in in the browser and return to the app');
          
          // Poll for session for up to 60 seconds
          let attempts = 0;
          const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds
          
          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (session) {
              console.log('✅ Session found after OAuth!');
              console.log('✅ User authenticated:', session.user.email);
              
              // Manually trigger auth state change
              await supabase.auth.refreshSession();
              
              return { success: true };
            }
            
            attempts++;
            if (attempts % 5 === 0) { // Log every 10 seconds
              console.log(`⏳ Still waiting for authentication... (${attempts * 2}s)`);
            }
          }
          
          console.log('⚠️ No session found after 60 seconds');
          return { success: false };
        } else {
          // For standalone apps with custom scheme
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            redirectUrl,
            {
              showInRecents: true,
              createTask: true,
            }
          );

          if (result.type === 'success' && result.url) {
            // Extract the auth params from the callback URL
            const params = this.extractParamsFromUrl(result.url);
            
            if (params.error) {
              throw new Error(params.error_description || params.error);
            }

            // Handle the callback
            await this.handleCallback(result.url);
            return { success: true };
          } else if (result.type === 'cancel') {
            console.log('⚠️ User cancelled Google sign-in');
            return { success: false, cancelled: true };
          }
        }
      }

      return { success: false };
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback
   * This processes the callback URL and exchanges the code for a session
   */
  async handleCallback(url: string) {
    try {
      console.log('🔄 Processing OAuth callback...');

      const params = this.extractParamsFromUrl(url);

      // Check for error in callback
      if (params.error) {
        throw new Error(`OAuth error: ${params.error_description || params.error}`);
      }

      // Exchange code for session if present
      if (params.code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
        
        if (error) {
          console.error('❌ Session exchange error:', error);
          throw error;
        }

        console.log('✅ Session established successfully');
        return data;
      }

      // Handle access_token if provided directly (implicit flow)
      if (params.access_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token || '',
        });

        if (error) {
          console.error('❌ Session set error:', error);
          throw error;
        }

        console.log('✅ Session set successfully');
        return data;
      }

      throw new Error('No authorization code or access token in callback');
    } catch (error) {
      console.error('❌ Callback handling error:', error);
      throw error;
    }
  }

  /**
   * Extract parameters from callback URL
   */
  private extractParamsFromUrl(url: string): Record<string, string> {
    const params: Record<string, string> = {};
    
    try {
      // Handle both query params and hash fragments
      const urlObj = new URL(url);
      
      // Extract from query string
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      // Extract from hash fragment (for implicit flow)
      if (urlObj.hash) {
        const hashParams = new URLSearchParams(urlObj.hash.substring(1));
        hashParams.forEach((value, key) => {
          params[key] = value;
        });
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
    }

    return params;
  }

  /**
   * Get the appropriate redirect URL based on platform
   */
  private getRedirectUrl(): string {
    if (Platform.OS === 'web') {
      // For web, use the current origin
      try {
        const globalWindow = (global as any).window;
        if (globalWindow?.location) {
          return `${globalWindow.location.origin}/auth/callback`;
        }
      } catch (e) {
        // Window not available
      }
      return 'http://localhost:19006/auth/callback';
    }

    // Check if running in Expo Go
    const url = Linking.createURL('auth/callback');
    console.log('📱 Generated redirect URL:', url);
    
    // If running in Expo Go, the URL will start with exp://
    if (url.startsWith('exp://')) {
      // For Expo Go, we can't use deep links, so we'll handle it differently
      // We'll let the browser handle the redirect and check session after
      return url; // Return the exp:// URL for logging, but we won't use it for redirect
    }

    // For standalone apps, use the custom scheme
    return url;
  }

  /**
   * Sign out the current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('✅ Signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  }

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Check if user is signed in
   */
  async isSignedIn(): Promise<boolean> {
    const session = await this.getSession();
    return !!session;
  }
}

export default GoogleAuthService.getInstance();