import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabNavigator from './MainTabNavigator';
import OnboardingScreen from '@/screens/OnboardingScreen';
import ArticleViewerScreen from '@/screens/ArticleViewerScreen';
import FilterSheet from '@/screens/FilterSheet';
import SettingsScreen from '@/screens/SettingsScreen';
import WalletHistoryScreen from '@/screens/WalletHistoryScreen';
import ManageFollowingScreen from '@/screens/ManageFollowingScreen';
import NotificationSettingsScreen from '@/screens/NotificationSettingsScreen';
import { useStore } from '@/store';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { isOnboardingCompleted } = useStore();

  // Log navigation state changes
  React.useEffect(() => {
    console.log('🧭 RootNavigator: Navigation state initialized');
  }, [isOnboardingCompleted]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      screenListeners={{
        state: (e) => {
          // Log navigation state changes
          console.log('🧭 Navigation state changed');
        },
        focus: (e) => {
          // Log screen focus events
          const screenName = e.target?.split('-')[0] || 'unknown';
          console.log(`🧭 Screen focused: ${screenName}`);
        },
      }}
    >
      {!isOnboardingCompleted ? (
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{ animation: 'fade' }}
        />
      ) : null}
      
      <Stack.Screen 
        name="Main" 
        component={MainTabNavigator}
        options={{ animation: 'fade' }}
      />
      
      <Stack.Screen
        name="ArticleViewer"
        component={ArticleViewerScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      
      <Stack.Screen
        name="FilterSheet"
        component={FilterSheet}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      
      
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          title: 'Settings',
        }}
      />
      
      <Stack.Screen
        name="WalletHistory"
        component={WalletHistoryScreen}
        options={{
          headerShown: true,
          title: 'Wallet History',
        }}
      />
      
      <Stack.Screen
        name="ManageFollowing"
        component={ManageFollowingScreen}
        options={{
          headerShown: true,
          title: 'Manage Following',
        }}
      />
      
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{
          headerShown: true,
          title: 'Notifications',
        }}
      />
    </Stack.Navigator>
  );
};