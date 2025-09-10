import 'react-native-url-polyfill/auto';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabaseFixed } from '../lib/supabaseFixed';
import Constants from 'expo-constants';

// Complete auth session on native
WebBrowser.maybeCompleteAuthSession();

/**
 * IDEAL Supabase Authentication Implementation
 * This is the recommended way to handle Supabase OAuth in React Native
 */

export async function signInWithGoogleIdeal() {
  try {
    console.log('🔐 Starting ideal Google OAuth flow...');
    
    // 1. Get the OAuth URL from Supabase
    const { data, error } = await supabaseFixed.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Use your app's deep link scheme
        redirectTo: `${Constants.expoConfig?.scheme || 'cryptoclips'}://auth/callback`,
        // Let Supabase handle the redirect automatically
        skipBrowserRedirect: false, // This is key!
      },
    });

    if (error) {
      console.error('❌ OAuth URL generation failed:', error);
      throw error;
    }

    console.log('✅ OAuth URL generated:', data.url);

    // 2. Open the OAuth URL in browser
    // Supabase will handle the redirect back to your app automatically
    const result = await WebBrowser.openBrowserAsync(data.url!);

    console.log('🔍 Browser result:', result);

    // 3. Check for session after browser closes
    if (result.type === 'dismiss') {
      // User closed browser, check if they completed auth
      const { data: { session } } = await supabaseFixed.auth.getSession();
      
      if (session) {
        console.log('✅ User authenticated successfully!');
        return { success: true, session };
      } else {
        console.log('❌ No session found - user may have cancelled');
        return { success: false, cancelled: true };
      }
    }

    return { success: false };

  } catch (error) {
    console.error('❌ Ideal OAuth flow failed:', error);
    throw error;
  }
}

/**
 * Alternative: Using AuthSession (more control)
 */
export async function signInWithGoogleAuthSession() {
  try {
    console.log('🔐 Starting AuthSession Google OAuth flow...');
    
    // 1. Create redirect URI
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: Constants.expoConfig?.scheme || 'cryptoclips',
      path: 'auth/callback',
    });

    console.log('🔗 Redirect URI:', redirectUri);

    // 2. Get OAuth URL from Supabase
    const { data, error } = await supabaseFixed.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      console.error('❌ OAuth URL generation failed:', error);
      throw error;
    }

    // 3. Start auth session
    const result = await AuthSession.startAsync({
      authUrl: data.url!,
      returnUrl: redirectUri,
    });

    console.log('🔍 AuthSession result:', result);

    // 4. Handle the result
    if (result.type === 'success' && result.url) {
      // Parse the URL to extract auth parameters
      const { params } = AuthSession.parseReturnUrl(result.url);
      
      if (params.code) {
        // Exchange code for session
        const { data: sessionData, error: sessionError } = await supabaseFixed.auth.exchangeCodeForSession(params.code);
        
        if (sessionError) {
          console.error('❌ Session exchange failed:', sessionError);
          throw sessionError;
        }

        console.log('✅ Session created successfully!');
        return { success: true, session: sessionData.session };
      }
    }

    return { success: false, cancelled: result.type === 'cancel' };

  } catch (error) {
    console.error('❌ AuthSession OAuth flow failed:', error);
    throw error;
  }
}

/**
 * The SIMPLEST approach - let Supabase handle everything
 */
export async function signInWithGoogleSimple() {
  try {
    console.log('🔐 Starting simple Google OAuth flow...');
    
    // This is the simplest approach - let Supabase handle everything
    const { data, error } = await supabaseFixed.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Use your app's scheme
        redirectTo: `${Constants.expoConfig?.scheme || 'cryptoclips'}://auth/callback`,
      },
    });

    if (error) {
      console.error('❌ Simple OAuth failed:', error);
      throw error;
    }

    // Open browser - Supabase handles the rest
    await WebBrowser.openBrowserAsync(data.url!);

    // Check for session
    const { data: { session } } = await supabaseFixed.auth.getSession();
    
    if (session) {
      console.log('✅ Simple OAuth successful!');
      return { success: true, session };
    }

    return { success: false };

  } catch (error) {
    console.error('❌ Simple OAuth flow failed:', error);
    throw error;
  }
}
