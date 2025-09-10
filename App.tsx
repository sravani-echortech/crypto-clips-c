// import './global.css'; // Disabled for now
import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { View, ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppStateProvider } from '@/contexts/AppStateContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import { LoginScreen } from '@/components/LoginScreen';
import { ErrorBoundary, RootErrorBoundary } from '@/components';
import { useStore } from '@/store';
import { toastConfig } from '@/config/toast';
import DeepLinkHandler from '@/components/DeepLinkHandler';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://c9ad5477990a3ced1b76979cfdefbdd9@o4509611273748480.ingest.us.sentry.io/4509994480041984',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  // Log app content state changes
  React.useEffect(() => {
    console.log('🏠 [SENTRY] AppContent: State changed', { 
      loading, 
      hasUser: !!user, 
      showLogin,
      userEmail: user?.email 
    });
    
    Sentry.addBreadcrumb({
      message: 'AppContent state changed',
      category: 'app',
      level: 'info',
      data: {
        loading,
        hasUser: !!user,
        showLogin,
        userEmail: user?.email,
        timestamp: new Date().toISOString(),
      },
    });

    // Set user context in Sentry when user changes
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
      });
      console.log('👤 [SENTRY] AppContent: User context set', { userId: user.id, email: user.email });
    } else {
      Sentry.setUser(null);
      console.log('👤 [SENTRY] AppContent: User context cleared');
    }
  }, [user, loading, showLogin]);

  // Show loading state while checking auth
  if (loading) {
    console.log('⏳ [SENTRY] AppContent: Showing loading state');
    Sentry.addBreadcrumb({
      message: 'App showing loading state',
      category: 'app',
      level: 'info',
    });
    
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Show login screen if user chooses to sign in
  if (showLogin && !user) {
    console.log('🔐 [SENTRY] AppContent: Showing login screen');
    Sentry.addBreadcrumb({
      message: 'App showing login screen',
      category: 'app',
      level: 'info',
    });
    
    return <LoginScreen onSkip={() => {
      console.log('⏭️ [SENTRY] AppContent: User skipped login');
      Sentry.addBreadcrumb({
        message: 'User skipped login',
        category: 'app',
        level: 'info',
      });
      setShowLogin(false);
    }} />;
  }

  // Show main app (works for both authenticated and unauthenticated users)
  console.log('🏠 [SENTRY] AppContent: Showing main app', { 
    hasUser: !!user, 
    userEmail: user?.email 
  });
  
  Sentry.addBreadcrumb({
    message: 'App showing main interface',
    category: 'app',
    level: 'info',
    data: {
      hasUser: !!user,
      userEmail: user?.email,
    },
  });

  return (
    <ErrorBoundary>
      <AppStateProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <RootNavigator />
          <Toast config={toastConfig} />
        </NavigationContainer>
      </AppStateProvider>
    </ErrorBoundary>
  );
};

export default Sentry.wrap(function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    Sentry.startSpan({
      name: 'App Initialization',
      op: 'app.init',
    }, async (span) => {
      console.log('🚀 [SENTRY] App: Starting initialization');
      Sentry.addBreadcrumb({
        message: 'App initialization started',
        category: 'app',
        level: 'info',
      });

      async function prepare() {
        try {
          console.log('📱 [SENTRY] App: Preparing app resources');
          Sentry.addBreadcrumb({
            message: 'Preparing app resources',
            category: 'app',
            level: 'info',
          });

          // Load fonts (using system fonts for now)
          // Custom fonts can be added later to assets/fonts/ directory
          // await Font.loadAsync({
          //   'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
          //   'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
          //   'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
          //   'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
          // });

          // Initialize app state from storage
          console.log('💾 [SENTRY] App: Initializing app state from storage');
          Sentry.addBreadcrumb({
            message: 'Initializing app state from storage',
            category: 'app',
            level: 'info',
          });

          const { initializeApp } = useStore.getState();
          await initializeApp();
          console.log('✅ [SENTRY] App: App state initialized successfully');

          // Artificially delay for splash screen
          console.log('⏳ [SENTRY] App: Showing splash screen delay');
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.log('✅ [SENTRY] App: Splash screen delay completed');

        } catch (e) {
          console.error('❌ [SENTRY] App: Initialization error:', e);
          Sentry.captureException(e, {
            tags: {
              component: 'App',
              method: 'prepare',
            },
          });
        } finally {
          console.log('🏁 [SENTRY] App: Initialization completed, setting app ready');
          Sentry.addBreadcrumb({
            message: 'App initialization completed',
            category: 'app',
            level: 'info',
          });
          
          setAppIsReady(true);
          await SplashScreen.hideAsync();
          console.log('🎉 [SENTRY] App: App is ready and splash screen hidden');
        }
      }

      await prepare();
    });
  }, []);

  if (!appIsReady) {
    console.log('⏳ [SENTRY] App: App not ready, showing splash screen');
    return null;
  }

  console.log('✅ [SENTRY] App: App is ready, rendering main interface');

  return (
    <RootErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <DeepLinkHandler>
                <AppContent />
              </DeepLinkHandler>
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </RootErrorBoundary>
  );
});