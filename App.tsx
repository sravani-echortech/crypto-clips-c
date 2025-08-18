// import './global.css'; // Disabled for now
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
import { ErrorBoundary } from '@/components';
import { useStore } from '@/store';
import { toastConfig } from '@/config/toast';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  // Show loading state while checking auth
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0E27' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  // Show login screen if user chooses to sign in
  if (showLogin && !user) {
    return <LoginScreen onSkip={() => setShowLogin(false)} />;
  }

  // Show main app (works for both authenticated and unauthenticated users)
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
        // Load fonts (using system fonts for now)
        // Custom fonts can be added later to assets/fonts/ directory
        // await Font.loadAsync({
        //   'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
        //   'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
        //   'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
        //   'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
        // });

        // Initialize app state from storage
        const { initializeApp } = useStore.getState();
        await initializeApp();

        // Artificially delay for splash screen
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}