import React, { useEffect } from 'react';
import * as Linking from 'expo-linking';
import googleAuthService from '@/services/googleAuthService';

interface DeepLinkHandlerProps {
  children: React.ReactNode;
}

const DeepLinkHandler: React.FC<DeepLinkHandlerProps> = ({ children }) => {
  useEffect(() => {
    // Handle deep links when app is already running
    const handleDeepLink = (url: string) => {
      console.log('🔗 Deep link received:', url);
      
      // Check if this is an OAuth callback
      if (url.includes('auth/callback') || url.includes('code=')) {
        handleOAuthCallback(url);
      }
    };

    // Handle deep links when app is opened from a link
    const handleInitialURL = async () => {
      try {
        const initialURL = await Linking.getInitialURL();
        if (initialURL) {
          console.log('🔗 Initial URL:', initialURL);
          handleDeepLink(initialURL);
        }
      } catch (error) {
        console.error('Error getting initial URL:', error);
      }
    };

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
  }, []);

  const handleOAuthCallback = async (url: string) => {
    try {
      console.log('🔄 Processing OAuth callback...');
      
      const result = await googleAuthService.handleCallback(url);
      
      if (result) {
        console.log('✅ OAuth callback processed successfully');
      } else {
        console.log('⚠️ OAuth callback processing failed');
      }
    } catch (error) {
      console.error('❌ Error processing OAuth callback:', error);
    }
  };

  return <>{children}</>;
};

export default DeepLinkHandler;
