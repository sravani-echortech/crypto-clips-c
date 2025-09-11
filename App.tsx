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

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  // Log app content state changes
  React.useEffect(() => {
    console.log('🏠 AppContent: State changed', { 
      loading, 
      hasUser: !!user, 
      showLogin,
      userEmail: user?.email 
    });
  }, [user, loading, showLogin]);

  // Show loading state while checking auth
  if (loading) {
    console.log('⏳ AppContent: Showing loading state');
    
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Show login screen if user chooses to sign in
  if (showLogin && !user) {
    console.log('🔐 AppContent: Showing login screen');
    
    return <LoginScreen onSkip={() => {
      console.log('⏭️ AppContent: User skipped login');
      setShowLogin(false);
    }} />;
  }

  // Show main app (works for both authenticated and unauthenticated users)
  console.log('🏠 AppContent: Showing main app', { 
    hasUser: !!user, 
    userEmail: user?.email 
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

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('📱 App: Preparing app resources');

        // Load fonts (using system fonts for now)
        // Custom fonts can be added later to assets/fonts/ directory
        // await Font.loadAsync({
        //   'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
        //   'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
        //   'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
        //   'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
        // });

        // Initialize app state from storage
        console.log('💾 App: Initializing app state from storage');

        const { initializeApp } = useStore.getState();
        await initializeApp();
        console.log('✅ App: App state initialized successfully');

        // Artificially delay for splash screen
        console.log('⏳ App: Showing splash screen delay');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ App: Splash screen delay completed');

      } catch (e) {
        console.error('❌ App: Initialization error:', e);
      } finally {
        console.log('🏁 App: Initialization completed, setting app ready');
        
        setAppIsReady(true);
        await SplashScreen.hideAsync();
        console.log('🎉 App: App is ready and splash screen hidden');
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    console.log('⏳ App: App not ready, showing splash screen');
    return null;
  }

  console.log('✅ App: App is ready, rendering main interface');

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
}