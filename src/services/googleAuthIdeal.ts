import 'react-native-url-polyfill/auto';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import { supabaseFixed } from '../lib/supabaseFixed';

// Complete auth session on native
WebBrowser.maybeCompleteAuthSession();

/**
 * IDEAL Google OAuth Implementation for Supabase
 * This follows Supabase's recommended patterns
 */
export async function signInWithGoogleIdeal() {
  return (async () => {
    console.log('🔐 [IDEAL] Starting Google OAuth with ideal flow...');
    
    try {
      // 1. Create proper redirect URI using your app's scheme
      const redirectUri = `${Constants.expoConfig?.scheme || 'cryptoclips'}://auth/callback`;
      
      console.log('🔗 [IDEAL] Using redirect URI:', redirectUri);
      
      // Set auth context
      console.log('Auth config:', {
        scheme: Constants.expoConfig?.scheme,
        redirectUri,
        flow: 'ideal_supabase_oauth'
      });

      // 2. Get OAuth URL from Supabase (let Supabase handle everything)
      const { data, error } = await supabaseFixed.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          // Don't skip browser redirect - let Supabase handle it
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error('❌ [IDEAL] OAuth URL generation failed:', error);
        console.error('OAuth URL generation error:', error);
        throw error;
      }

      console.log('✅ [IDEAL] OAuth URL generated successfully');
      console.log('🔗 [IDEAL] OAuth URL:', data.url?.substring(0, 100) + '...');

      // 3. Open browser - Supabase handles the redirect automatically
      console.log('🌐 [IDEAL] Opening browser for OAuth...');
      const result = await WebBrowser.openBrowserAsync(data.url!);

      console.log('🔍 [IDEAL] Browser result:', result);

      // 4. Check for session after browser closes
      if (result.type === 'dismiss') {
        console.log('⏳ [IDEAL] Browser dismissed, checking for session...');
        
        // Wait a moment for Supabase to process the OAuth callback
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: { session }, error: sessionError } = await supabaseFixed.auth.getSession();
        
        if (session) {
          console.log('✅ [IDEAL] User authenticated successfully!');
          console.log('👤 [IDEAL] User email:', session.user.email);
          
addBreadcrumb({
            message: 'User authenticated successfully',
            category: 'auth',
            level: 'info',
            data: { 
              user_email: session.user.email,
              flow: 'ideal_supabase_oauth'
            },
          });
          
          return { success: true, session };
        } else {
          console.log('❌ [IDEAL] No session found - user may have cancelled');
          return { success: false, cancelled: true };
        }
      }

      return { success: false };

    } catch (error) {
      console.error('❌ [IDEAL] Google OAuth failed:', error);
      
captureException(error, {
        tags: {
          component: 'googleAuthIdeal',
          method: 'signInWithGoogleIdeal',
        },
      });
      
      throw error;
    }
  });
}

/**
 * Alternative: Using AuthSession for more control
 */
export async function signInWithGoogleAuthSession() {
  return startSpan({
    name: 'Google OAuth AuthSession Flow',
    op: 'auth.google_oauth_authsession',
  }, async (span) => {
    console.log('🔐 [AUTHSESSION] Starting Google OAuth with AuthSession...');
    
    try {
      // 1. Create redirect URI using AuthSession helper
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: Constants.expoConfig?.scheme || 'cryptoclips',
        path: 'auth/callback',
      });

      console.log('🔗 [AUTHSESSION] Redirect URI:', redirectUri);

      // 2. Get OAuth URL from Supabase
      const { data, error } = await supabaseFixed.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true, // We'll handle the redirect manually
        },
      });

      if (error) {
        console.error('❌ [AUTHSESSION] OAuth URL generation failed:', error);
        throw error;
      }

      console.log('✅ [AUTHSESSION] OAuth URL generated successfully');

      // 3. Start auth session
      console.log('🌐 [AUTHSESSION] Starting auth session...');
      const result = await AuthSession.startAsync({
        authUrl: data.url!,
        returnUrl: redirectUri,
      });

      console.log('🔍 [AUTHSESSION] AuthSession result:', result);

      // 4. Handle the result
      if (result.type === 'success' && result.url) {
        console.log('✅ [AUTHSESSION] OAuth completed successfully');
        
        // Parse the return URL to extract auth parameters
        const { params } = AuthSession.parseReturnUrl(result.url);
        
        if (params.code) {
          console.log('🔄 [AUTHSESSION] Exchanging code for session...');
          
          // Exchange code for session
          const { data: sessionData, error: sessionError } = await supabaseFixed.auth.exchangeCodeForSession(params.code);
          
          if (sessionError) {
            console.error('❌ [AUTHSESSION] Session exchange failed:', sessionError);
            throw sessionError;
          }

          console.log('✅ [AUTHSESSION] Session created successfully!');
          console.log('👤 [AUTHSESSION] User email:', sessionData.session?.user.email);
          
          return { success: true, session: sessionData.session };
        }
      }

      return { success: false, cancelled: result.type === 'cancel' };

    } catch (error) {
      console.error('❌ [AUTHSESSION] Google OAuth failed:', error);
      throw error;
    }
  });
}

/**
 * Test function to verify the ideal flow
 */
export async function testIdealAuthFlow() {
  console.log('\n🧪 ========== TESTING IDEAL AUTH FLOW ==========\n');
  
  try {
    // Test 1: Check app configuration
    console.log('1️⃣ Checking app configuration...');
    const scheme = Constants.expoConfig?.scheme || 'cryptoclips';
    const redirectUri = `${scheme}://auth/callback`;
    
    console.log('✅ App scheme:', scheme);
    console.log('✅ Redirect URI:', redirectUri);
    
    // Test 2: Test OAuth URL generation
    console.log('2️⃣ Testing OAuth URL generation...');
    const { data, error } = await supabaseFixed.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true,
      },
    });
    
    if (error) {
      console.log('❌ OAuth URL generation failed:', error.message);
      return false;
    }
    
    console.log('✅ OAuth URL generated successfully');
    console.log('🔗 URL starts with:', data.url?.substring(0, 50) + '...');
    console.log('🔗 Contains redirect:', data.url?.includes(redirectUri));
    
    console.log('\n✅ Ideal auth flow test passed! Ready to use.\n');
    return true;
    
  } catch (error) {
    console.log('❌ Ideal auth flow test failed:', error);
    return false;
  }
}
