import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import { useStore } from '@/store';

import InshortsFeedScreenV2 from '@/screens/InshortsFeedScreenV2';
import SearchScreen from '@/screens/SearchScreen';
import BookmarksScreen from '@/screens/BookmarksScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import * as Sentry from '@sentry/react-native';

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
  
  // Log tab navigator initialization
  React.useEffect(() => {
    console.log('📱 [SENTRY] MainTabNavigator: Initialized', {
      streak,
      tokens,
      bookmarksCount: bookmarks.length,
      isDark,
      platform: Platform.OS,
    });
    
    Sentry.addBreadcrumb({
      message: 'MainTabNavigator initialized',
      category: 'navigation',
      level: 'info',
      data: {
        streak,
        tokens,
        bookmarksCount: bookmarks.length,
        isDark,
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
      },
    });
  }, [streak, tokens, bookmarks.length, isDark]);
  
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
      screenListeners={{
        state: (e) => {
          console.log('📱 [SENTRY] MainTabNavigator: Tab state changed');
          Sentry.addBreadcrumb({
            message: 'MainTabNavigator tab state changed',
            category: 'navigation',
            level: 'info',
            data: {
              timestamp: new Date().toISOString(),
            },
          });
        },
        tabPress: (e) => {
          const tabName = e.target?.split('-')[0] || 'unknown';
          console.log(`📱 [SENTRY] MainTabNavigator: Tab pressed - ${tabName}`);
          Sentry.addBreadcrumb({
            message: `Tab pressed: ${tabName}`,
            category: 'navigation',
            level: 'info',
            data: {
              tab: tabName,
              timestamp: new Date().toISOString(),
            },
          });
        },
        focus: (e) => {
          const tabName = e.target?.split('-')[0] || 'unknown';
          console.log(`📱 [SENTRY] MainTabNavigator: Tab focused - ${tabName}`);
          Sentry.addBreadcrumb({
            message: `Tab focused: ${tabName}`,
            category: 'navigation',
            level: 'info',
            data: {
              tab: tabName,
              timestamp: new Date().toISOString(),
            },
          });
          
          // Special logging for SwipeFeed (Clips) tab
          if (tabName === 'SwipeFeed') {
            console.log('🎯 [SENTRY] MainTabNavigator: User returned to Clips tab');
            Sentry.addBreadcrumb({
              message: 'User returned to Clips tab after authentication',
              category: 'navigation',
              level: 'info',
              data: {
                tab: 'SwipeFeed',
                timestamp: new Date().toISOString(),
              },
            });
          }
        },
      }}
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