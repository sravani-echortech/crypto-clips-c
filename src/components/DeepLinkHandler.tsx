import React, { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { supabaseFixed } from '@/lib/supabaseFixed';
import * as QueryParams from 'expo-auth-session/build/QueryParams';

interface DeepLinkHandlerProps {
  children: React.ReactNode;
}

const DeepLinkHandler: React.FC<DeepLinkHandlerProps> = ({ children }) => {
  // OAuth callback handler
  const handleOAuthCallback = React.useCallback(async (url: string) => {
    try {
      console.log('🔄 Processing Supabase OAuth callback...');
      
      // Extract parameters from callback URL
      const { params } = QueryParams.getQueryParams(url);
      console.log('📋 Auth params:', Object.keys(params));

      if (params.code) {
        // PKCE: exchange code -> session
        console.log('🔄 Exchanging code for session...');
        const { data: sess, error: exErr } = await supabaseFixed.auth.exchangeCodeForSession(params.code);
        
        if (exErr) {
          console.error('❌ Code exchange failed:', exErr);
          throw exErr;
        }
        
        console.log('✅ Session created via PKCE:', !!sess?.session);
        return sess?.session;
      }

      if (params.access_token && params.refresh_token) {
        // Implicit: set tokens -> session
        console.log('🔄 Setting session with tokens...');
        const { data: sess, error: setErr } = await supabaseFixed.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        
        if (setErr) {
          console.error('❌ Token session failed:', setErr);
          throw setErr;
        }
        
        console.log('✅ Session created via tokens:', !!sess?.session);
        return sess?.session;
      }

      console.log('❌ No valid auth parameters found');
      return null;
      
    } catch (error) {
      console.error('❌ Error processing Supabase OAuth callback:', error);
      return null;
    }
  }, []);

  // Deep link handler
  const handleDeepLink = React.useCallback((url: string) => {
    console.log('🔗 Deep link received:', url);
    
    // Check if this is an OAuth callback
    if (url.includes('auth/callback') || url.includes('code=')) {
      handleOAuthCallback(url);
    }
  }, [handleOAuthCallback]);

  // Handle deep links when app is opened from a link
  const handleInitialURL = React.useCallback(async () => {
    try {
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        console.log('🔗 Initial URL:', initialURL);
        handleDeepLink(initialURL);
      }
    } catch (error) {
      console.error('Error getting initial URL:', error);
    }
  }, [handleDeepLink]);

  useEffect(() => {
    // Set up deep link listener
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Handle initial URL
    handleInitialURL();

    // Cleanup
    return () => {
      subscription?.remove();
    };
  }, [handleDeepLink, handleInitialURL]);

  return <>{children}</>;
};

export default DeepLinkHandler;
