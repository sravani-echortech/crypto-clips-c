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

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
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