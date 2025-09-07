import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import { useStore } from '@/store';

import InshortsFeedScreenV2 from '@/screens/InshortsFeedScreenV2';
import SwipeFeedScreen from '@/screens/SwipeFeedScreen';
import SearchScreen from '@/screens/SearchScreen';
// import AlertsScreen from '@/screens/AlertsScreen';
import BookmarksScreen from '@/screens/BookmarksScreen';
import ProfileScreen from '@/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

interface TabBarIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
  size: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ name, focused, color, size }) => (
  <Ionicons name={name} size={size} color={color} />
);

interface StreakBadgeProps {
  count: number;
  color: string;
}

const StreakBadge: React.FC<StreakBadgeProps> = ({ count, color }) => {
  if (count === 0) return null;
  
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{count}</Text>
    </View>
  );
};

const MainTabNavigator: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { streak, tokens, bookmarks } = useStore(); // priceAlerts removed
  const insets = useSafeAreaInsets();
  
  // const unreadAlertsCount = priceAlerts.filter(alert => alert.isActive).length;
  const bookmarksCount = bookmarks.length;
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: Math.max(insets.bottom / 2, 5),
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 50 + insets.bottom : 60,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          
          switch (route.name) {
            case 'SwipeFeed':
              iconName = focused ? 'layers' : 'layers-outline';
              break;
            case 'Search':
              iconName = focused ? 'search' : 'search-outline';
              break;
            // case 'Alerts':
            //   iconName = focused ? 'notifications' : 'notifications-outline';
            //   break;
            case 'Bookmarks':
              iconName = focused ? 'bookmark' : 'bookmark-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }
          
          return (
            <View style={{ position: 'relative' }}>
              <TabBarIcon name={iconName} focused={focused} color={color} size={size} />
              {/* {route.name === 'Alerts' && unreadAlertsCount > 0 && (
                <StreakBadge count={unreadAlertsCount} color={colors.danger} />
              )} */}
              {route.name === 'Bookmarks' && bookmarksCount > 0 && (
                <StreakBadge count={bookmarksCount} color={colors.primary} />
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="SwipeFeed"
        component={InshortsFeedScreenV2}
        options={{
          title: 'Clips',
        }}
      />
      
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Search',
        }}
      />
      
      {/* <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          title: 'Alerts',
          tabBarBadge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
        }}
      /> */}
      
      <Tab.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{
          title: 'Bookmarks',
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default MainTabNavigator;