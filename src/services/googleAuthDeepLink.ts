import 'react-native-url-polyfill/auto';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseFixed } from '../lib/supabaseFixed';
import * as Sentry from '@sentry/react-native';

// Complete auth session on native (safe no-op on web)
WebBrowser.maybeCompleteAuthSession();

// Clear corrupted storage before OAuth
async function clearCorruptedStorage() {
  try {
    console.log('🧹 [SENTRY] Clearing potentially corrupted storage...');
    await supabaseFixed.auth.signOut();
    
    // Clear specific auth-related keys
    const authKeys = [
      'sb-jmwggzasoikndnpwkrca-auth-token',
      'supabase.auth.token',
      'supabase.auth.session',
    ];
    
    for (const key of authKeys) {
      try {
        await AsyncStorage.removeItem(key);
        console.log(`🗑️ [SENTRY] Cleared storage key: ${key}`);
      } catch (error) {
        console.log(`⚠️ [SENTRY] Could not clear key ${key}:`, error);
      }
    }
    
    console.log('✅ [SENTRY] Storage cleared successfully');
  } catch (error) {
    console.log('⚠️ [SENTRY] Error clearing storage:', error);
  }
}

export async function signInWithGoogle() {
  return Sentry.startSpan({
    name: 'Google OAuth Deep Link Flow',
    op: 'auth.google_oauth_deeplink',
  }, async (span) => {
    console.log('🔐 [SENTRY] Starting Google OAuth with deep link...');
    Sentry.addBreadcrumb({
      message: 'Google OAuth deep link flow started',
      category: 'auth',
      level: 'info',
    });
    
    // Clear potentially corrupted storage first
    await clearCorruptedStorage();
    
    try {
      // Manual proxy URL construction since makeRedirectUri isn't working
      const expoUsername = Constants.expoConfig?.owner || 'subscriptions-echor';
      const projectSlug = Constants.expoConfig?.slug || 'crypto-clips';
      
      console.log('🔍 [SENTRY] Expo config:', {
        owner: Constants.expoConfig?.owner,
        slug: Constants.expoConfig?.slug,
        appOwnership: Constants.appOwnership
      });
      
      Sentry.setContext('expo_config', {
        owner: Constants.expoConfig?.owner,
        slug: Constants.expoConfig?.slug,
        appOwnership: Constants.appOwnership,
      });
      
      console.log('🔍 [SENTRY] Expo config details:', { expo_owner: expoUsername, project_slug: projectSlug, app_ownership: Constants.appOwnership });
      
      // Construct the stable proxy URL manually
      const redirectTo = `https://auth.expo.dev/@${expoUsername}/${projectSlug}`;
      
      console.log('🔗 [SENTRY] Manual proxy URL:', redirectTo);
      console.log('📱 [SENTRY] App ownership:', Constants.appOwnership);
      
      Sentry.addBreadcrumb({
        message: 'Proxy URL constructed',
        category: 'auth',
        level: 'info',
        data: { redirectTo },
      });

      // 2) Ask Supabase for the provider URL without auto-redirect
      console.log('🔄 [SENTRY] Making OAuth request to Supabase...');
      Sentry.addBreadcrumb({
        message: 'Making OAuth request to Supabase',
        category: 'auth',
        level: 'info',
        data: { provider: 'google', redirectTo },
      });
      
      const { data, error } = await supabaseFixed.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo, 
          skipBrowserRedirect: true 
        },
      });
      
      if (error) {
        console.error('❌ [SENTRY] OAuth URL generation failed:', error);
        console.error('❌ [SENTRY] Error details:', {
          message: error.message,
          status: error.status,
        });
        
        Sentry.captureException(error, {
          tags: {
            component: 'googleAuthDeepLink',
            method: 'signInWithGoogle',
            step: 'oauth_url_generation',
            error_status: error.status?.toString(),
          },
          extra: {
            redirectTo,
            provider: 'google',
            error_message: error.message,
            error_status: error.status,
          },
        });
        
        // If it's a 500 error, suggest clearing storage
        if (error.status === 500) {
          console.log('🚨 [SENTRY] 500 error detected - likely corrupted storage');
          Sentry.addBreadcrumb({
            message: '500 error detected - suggesting storage reset',
            category: 'auth',
            level: 'error',
          });
        }
        
        throw error;
      }
      
      console.log('✅ [SENTRY] OAuth URL generated successfully');
      Sentry.addBreadcrumb({
        message: 'OAuth URL generated successfully',
        category: 'auth',
        level: 'info',
      });

      // 3) Open an auth *session* (not a plain browser tab)
      console.log('🌐 [SENTRY] Opening auth session...');
      Sentry.addBreadcrumb({
        message: 'Opening browser auth session',
        category: 'auth',
        level: 'info',
      });

      // IMPORTANT: pass the *same* redirectTo as the second arg
      const res = await WebBrowser.openAuthSessionAsync(data.url!, redirectTo);
      
      console.log('📱 [SENTRY] Auth session result:', res.type);
      Sentry.addBreadcrumb({
        message: `Auth session completed: ${res.type}`,
        category: 'auth',
        level: 'info',
        data: { result_type: res.type },
      });
      
      console.log('🔍 [SENTRY] Auth session result type:', res.type);
      
      if (res.type !== 'success' || !res.url) {
        console.log('❌ [SENTRY] Auth session cancelled or failed');
        Sentry.addBreadcrumb({
          message: 'Auth session cancelled or failed',
          category: 'auth',
          level: 'warning',
          data: { result_type: res.type },
        });
        
        console.log('🔍 [SENTRY] Auth session cancelled');
        return { success: false };
      }

      console.log('🔗 [SENTRY] Auth callback URL:', res.url);

      // 4) Complete the session
      const { params } = QueryParams.getQueryParams(res.url);
      console.log('📋 [SENTRY] Auth params:', Object.keys(params));
      
      Sentry.addBreadcrumb({
        message: 'Auth callback parameters parsed',
        category: 'auth',
        level: 'info',
        data: { param_keys: Object.keys(params) },
      });
      
      console.log('🔍 [SENTRY] Auth params details:', {
        param_count: Object.keys(params).length,
        has_code: !!params.code,
        has_access_token: !!params.access_token,
        has_refresh_token: !!params.refresh_token,
      });

      if (params.code) {
        // PKCE: exchange code -> session
        console.log('🔄 [SENTRY] Exchanging code for session...');
        Sentry.addBreadcrumb({
          message: 'Starting PKCE code exchange',
          category: 'auth',
          level: 'info',
        });
        
        const { data: sess, error: exErr } = await supabaseFixed.auth.exchangeCodeForSession(params.code);
        
        if (exErr) {
          console.error('❌ [SENTRY] Code exchange failed:', exErr);
          
          Sentry.captureException(exErr, {
            tags: {
              component: 'googleAuthDeepLink',
              method: 'signInWithGoogle',
              step: 'code_exchange',
            },
          });
          
          throw exErr;
        }
        
        console.log('✅ [SENTRY] Session created via PKCE:', !!sess?.session);
        Sentry.addBreadcrumb({
          message: 'PKCE code exchange successful',
          category: 'auth',
          level: 'info',
          data: { has_session: !!sess?.session },
        });
        
        console.log('✅ [SENTRY] PKCE code exchange successful:', { has_session: !!sess?.session });
        
        return { success: !!sess?.session, session: sess?.session };
      }

      if (params.access_token && params.refresh_token) {
        // Implicit: set tokens -> session
        console.log('🔄 [SENTRY] Setting session with tokens...');
        Sentry.addBreadcrumb({
          message: 'Starting implicit token session',
          category: 'auth',
          level: 'info',
        });
        
        const { data: sess, error: setErr } = await supabaseFixed.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        
        if (setErr) {
          console.error('❌ [SENTRY] Token session failed:', setErr);
          
          Sentry.captureException(setErr, {
            tags: {
              component: 'googleAuthDeepLink',
              method: 'signInWithGoogle',
              step: 'token_session',
            },
          });
          
          throw setErr;
        }
        
        console.log('✅ [SENTRY] Session created via tokens:', !!sess?.session);
        Sentry.addBreadcrumb({
          message: 'Implicit token session successful',
          category: 'auth',
          level: 'info',
          data: { has_session: !!sess?.session },
        });
        
        console.log('✅ [SENTRY] Implicit token session successful:', { has_session: !!sess?.session });
        
        return { success: !!sess?.session, session: sess?.session };
      }

      console.log('❌ [SENTRY] No valid auth parameters found');
      Sentry.addBreadcrumb({
        message: 'No valid auth parameters found in callback',
        category: 'auth',
        level: 'error',
        data: { param_keys: Object.keys(params) },
      });
      
      console.log('🔍 [SENTRY] No valid auth parameters found');
      return { success: false };
      
    } catch (error) {
      console.error('❌ [SENTRY] Google OAuth failed:', error);
      
      Sentry.captureException(error, {
        tags: {
          component: 'googleAuthDeepLink',
          method: 'signInWithGoogle',
        },
      });
      
      console.log('❌ [SENTRY] Google OAuth error details:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  });
}

// Debug function to test and fix auth issues
export async function debugAuthIssues() {
  console.log('\n🔍 ========== AUTH DEBUG SESSION ==========\n');
  
  try {
    // 1. Test storage
    console.log('1️⃣ Testing AsyncStorage...');
    try {
      await AsyncStorage.setItem('test-key', 'test-value');
      const value = await AsyncStorage.getItem('test-key');
      await AsyncStorage.removeItem('test-key');
      console.log('✅ AsyncStorage is working');
    } catch (error) {
      console.log('❌ AsyncStorage failed:', error);
      return false;
    }
    
    // 2. Clear all auth storage
    console.log('2️⃣ Clearing auth storage...');
    await clearCorruptedStorage();
    
    // 3. Test Supabase connection
    console.log('3️⃣ Testing Supabase connection...');
    try {
      const { data, error } = await supabaseFixed.auth.getSession();
      if (error) {
        console.log('❌ Supabase connection failed:', error.message);
        return false;
      }
      console.log('✅ Supabase connection working');
    } catch (error) {
      console.log('❌ Supabase connection error:', error);
      return false;
    }
    
    // 4. Test OAuth URL generation
    console.log('4️⃣ Testing OAuth URL generation...');
    try {
      const expoUsername = Constants.expoConfig?.owner || 'subscriptions-echor';
      const projectSlug = Constants.expoConfig?.slug || 'crypto-clips';
      const redirectTo = `https://auth.expo.dev/@${expoUsername}/${projectSlug}`;
      
      const { data, error } = await supabaseFixed.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo, 
          skipBrowserRedirect: true 
        },
      });
      
      if (error) {
        console.log('❌ OAuth URL generation failed:', error.message);
        console.log('❌ Error status:', error.status);
        return false;
      }
      
      console.log('✅ OAuth URL generation working');
      console.log('🔗 Generated URL:', data.url?.substring(0, 100) + '...');
    } catch (error) {
      console.log('❌ OAuth URL generation error:', error);
      return false;
    }
    
    console.log('\n✅ All tests passed! Auth should work now.\n');
    return true;
    
  } catch (error) {
    console.log('❌ Debug session failed:', error);
    return false;
  }
}
