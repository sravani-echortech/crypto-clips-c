import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Image,
  FlatList 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/store';
import { useToast } from '@/hooks';
import { TokenTransaction } from '@/types';
import { responsiveFontSize, responsiveSpacing, deviceSize } from '@/utils/responsive';

const isSmallScreen = deviceSize.isSmallPhone;

import {
  SafeContainer,
  ResponsiveAppHeader,
  Button,
  // ResponsiveStreakWidget,
  // ResponsiveTokenBalance,
  // WalletEntry,
  LoadingSpinner,
} from '@/components';

import { formatters } from '@/utils';
import { CATEGORIES } from '@/constants';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, signOut, signInWithGoogle, loading: authLoading } = useAuth() as any;
  const toast = useToast();
  
  const {
    // streak,
    // tokens,
    // tokenHistory,
    preferences,
    updatePreferences,
    bookmarks,
  } = useStore();

  // State
  // const [showWalletHistory, setShowWalletHistory] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handlers
  const handleDataSaverToggle = useCallback(() => {
    updatePreferences({ dataSaver: !preferences.dataSaver });
    toast.showSuccess(
      preferences.dataSaver ? 'Data saver disabled' : 'Data saver enabled'
    );
  }, [preferences.dataSaver, updatePreferences, toast]);

  // const handleWalletHistoryToggle = useCallback(() => {
  //   setShowWalletHistory(!showWalletHistory);
  // }, [showWalletHistory]);

  const handleManageFollowing = useCallback(() => {
    navigation.navigate('ManageFollowing' as never);
  }, [navigation]);

  // Removed notification settings navigation for v1
  // const handleNotificationSettings = useCallback(() => {
  //   navigation.navigate('NotificationSettings' as never);
  // }, [navigation]);

  const handleSettings = useCallback(() => {
    navigation.navigate('Settings' as never);
  }, [navigation]);

  const handleThemeToggle = useCallback(() => {
    const newTheme = preferences.theme === 'light' ? 'dark' : 'light';
    updatePreferences({ theme: newTheme });
    toast.showSuccess(
      `Switched to ${newTheme} theme`
    );
  }, [preferences.theme, updatePreferences, toast]);

  const handleHapticsToggle = useCallback(() => {
    updatePreferences({ haptics: !preferences.haptics });
    if (!preferences.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toast.showSuccess(
      preferences.haptics ? 'Haptic feedback disabled' : 'Haptic feedback enabled'
    );
  }, [preferences.haptics, updatePreferences, toast]);

  const handleNotificationsToggle = useCallback(() => {
    updatePreferences({ 
      notifications: { 
        ...preferences.notifications, 
        breaking: !preferences.notifications.breaking 
      }
    });
    toast.showSuccess(
      preferences.notifications.breaking ? 'Notifications disabled' : 'Notifications enabled'
    );
  }, [preferences.notifications, updatePreferences, toast]);

  const handleAnalyticsToggle = useCallback(() => {
    updatePreferences({ analytics: !preferences.analytics });
    toast.showSuccess(
      preferences.analytics ? 'Analytics disabled' : 'Analytics enabled'
    );
  }, [preferences.analytics, updatePreferences, toast]);

  // const handleRewards = useCallback(() => {
  //   navigation.navigate('RewardsCatalog' as never);
  // }, [navigation]);

  const handleSignOut = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await signOut();
              toast.showSuccess('Signed out successfully');
            } catch (error) {
              toast.showError('Failed to sign out');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [signOut, toast]);

  // Calculate stats
  const totalArticlesRead = Array.from(useStore.getState().viewedArticles).length;
  const totalBookmarks = bookmarks.length;
  const followingCount = 
    preferences.following.coins.length + 
    preferences.following.categories.length + 
    preferences.following.sources.length;

  const renderProfileHeader = () => (
    <View style={styles.headerContainer}>
      {/* Title Row */}
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity onPress={handleSettings}>
          <Ionicons name="settings-outline" size={responsiveFontSize(20)} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* Profile Card with Background */}
      <Animated.View
        entering={FadeInUp.duration(400)}
        style={[styles.profileHeader, { backgroundColor: colors.surface }]}
      >
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText]}>
                {user?.displayName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={[styles.displayName, { color: colors.text }]}>
            {user?.displayName || 'Anonymous User'}
          </Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>
            {user?.email || 'user@cryptoclips.com'}
          </Text>
        </View>

        {/* Stats Row - simplified for v1 */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {totalBookmarks}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Saved
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {followingCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Following
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );

  // Gamification section commented out for v1
  // const renderGamificationSection = () => (
  //   <View style={styles.section}>
  //     <Text style={[styles.sectionTitle, { color: colors.text }]}>
  //       Your Progress
  //     </Text>
  //     
  //     <View style={styles.gamificationRow}>
  //       <TouchableOpacity 
  //         style={[styles.gamificationCard, { backgroundColor: colors.surface }]}
  //         onPress={handleWalletHistoryToggle}
  //       >
  //         <ResponsiveStreakWidget 
  //           current={streak.current}
  //           best={streak.best}
  //           subtitle={streak.current === 0 ? 'Start your streak!' : 
  //                    streak.current === 1 ? 'Keep it going!' : 'Amazing streak!'}
  //         />
  //       </TouchableOpacity>
  //       
  //       <TouchableOpacity 
  //         style={[styles.gamificationCard, { backgroundColor: colors.surface }]}
  //         onPress={handleWalletHistoryToggle}
  //       >
  //         <ResponsiveTokenBalance 
  //           balance={tokens.balance}
  //           showDelta={false}
  //         />
  //         <TouchableOpacity 
  //           style={[styles.rewardsButton, { backgroundColor: colors.primary + '20' }]}
  //           onPress={handleRewards}
  //         >
  //           <Text style={[styles.rewardsButtonText, { color: colors.primary }]}>
  //             View Rewards
  //           </Text>
  //         </TouchableOpacity>
  //       </TouchableOpacity>
  //     </View>
  //   </View>
  // );

  // Wallet history commented out for v1
  // const renderWalletHistory = () => {
  //   if (!showWalletHistory) return null;

  //   const recentTransactions = tokenHistory.slice(0, 10);

  //   return (
  //     <Animated.View
  //       entering={FadeInDown.duration(400)}
  //       style={styles.section}
  //     >
  //       <View style={styles.sectionHeader}>
  //         <Text style={[styles.sectionTitle, { color: colors.text }]}>
  //           Recent Activity
  //         </Text>
  //         <TouchableOpacity onPress={handleWalletHistoryToggle}>
  //           <Ionicons name="chevron-up" size={20} color={colors.textSecondary} />
  //         </TouchableOpacity>
  //       </View>
        
  //       <View style={[styles.walletHistoryContainer, { backgroundColor: colors.surface }]}>
  //         {recentTransactions.length > 0 ? (
  //           recentTransactions.map((transaction) => (
  //             <WalletEntry 
  //               key={transaction.id}
  //               transaction={transaction}
  //               showDate={true}
  //             />
  //           ))
  //         ) : (
  //           <View style={styles.emptyWallet}>
  //             <Ionicons name="wallet-outline" size={48} color={colors.textSecondary} />
  //             <Text style={[styles.emptyWalletText, { color: colors.textSecondary }]}>
  //               No transactions yet
  //             </Text>
  //           </View>
  //         )}
          
  //         {tokenHistory.length > 10 && (
  //           <TouchableOpacity 
  //             style={styles.viewAllButton}
  //             onPress={() => navigation.navigate('WalletHistory' as never)}
  //           >
  //             <Text style={[styles.viewAllText, { color: colors.primary }]}>
  //               View All Transactions
  //             </Text>
  //           </TouchableOpacity>
  //         )}
  //       </View>
  //     </Animated.View>
  //   );
  // };

  const renderFollowingSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Following
        </Text>
        <TouchableOpacity onPress={handleManageFollowing}>
          <Text style={[styles.manageText, { color: colors.primary }]}>
            Manage
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.followingContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.followingItem}>
          <Ionicons name="trending-up" size={20} color={colors.warning} />
          <Text style={[styles.followingText, { color: colors.text }]}>
            {preferences.following.coins.length} Coins
          </Text>
        </View>
        
        <View style={styles.followingItem}>
          <Ionicons name="grid" size={20} color={colors.success} />
          <Text style={[styles.followingText, { color: colors.text }]}>
            {preferences.following.categories.length} Categories
          </Text>
        </View>
        
        <View style={styles.followingItem}>
          <Ionicons name="newspaper" size={20} color={colors.primary} />
          <Text style={[styles.followingText, { color: colors.text }]}>
            {preferences.following.sources.length} Sources
          </Text>
        </View>
      </View>
    </View>
  );

  const renderSettingsSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Settings
      </Text>
      
      <View style={[styles.settingsContainer, { backgroundColor: colors.surface }]}>
        {/* Theme Toggle */}
        <TouchableOpacity style={styles.settingsItem} onPress={handleThemeToggle}>
          <View style={styles.settingsItemLeft}>
            <Ionicons 
              name={preferences.theme === 'dark' ? "moon" : "sunny"} 
              size={responsiveFontSize(18)} 
              color={colors.textSecondary} 
            />
            <Text style={[styles.settingsText, { color: colors.text }]}>
              {preferences.theme === 'dark' ? 'Dark' : 'Light'} Theme
            </Text>
          </View>
          <View style={[
            styles.toggle, 
            { backgroundColor: preferences.theme === 'dark' ? colors.primary : colors.border }
          ]}>
            <View style={[
              styles.toggleThumb,
              { 
                backgroundColor: 'white',
                transform: [{ translateX: preferences.theme === 'dark' ? 16 : 2 }]
              }
            ]} />
          </View>
        </TouchableOpacity>

        {/* Separator */}
        <View style={[styles.settingsSeparator, { backgroundColor: colors.border }]} />

        {/* Notifications Toggle */}
        <TouchableOpacity style={styles.settingsItem} onPress={handleNotificationsToggle}>
          <View style={styles.settingsItemLeft}>
            <Ionicons name="notifications" size={responsiveFontSize(18)} color={colors.textSecondary} />
            <Text style={[styles.settingsText, { color: colors.text }]}>
              Push Notifications
            </Text>
          </View>
          <View style={[
            styles.toggle, 
            { backgroundColor: preferences.notifications.breaking ? colors.primary : colors.border }
          ]}>
            <View style={[
              styles.toggleThumb,
              { 
                backgroundColor: 'white',
                transform: [{ translateX: preferences.notifications.breaking ? 16 : 2 }]
              }
            ]} />
          </View>
        </TouchableOpacity>

        {/* Separator */}
        <View style={[styles.settingsSeparator, { backgroundColor: colors.border }]} />

        {/* Haptic Feedback Toggle */}
        <TouchableOpacity style={styles.settingsItem} onPress={handleHapticsToggle}>
          <View style={styles.settingsItemLeft}>
            <Ionicons name="vibrate" size={responsiveFontSize(18)} color={colors.textSecondary} />
            <Text style={[styles.settingsText, { color: colors.text }]}>
              Haptic Feedback
            </Text>
          </View>
          <View style={[
            styles.toggle, 
            { backgroundColor: preferences.haptics ? colors.primary : colors.border }
          ]}>
            <View style={[
              styles.toggleThumb,
              { 
                backgroundColor: 'white',
                transform: [{ translateX: preferences.haptics ? 16 : 2 }]
              }
            ]} />
          </View>
        </TouchableOpacity>

        {/* Separator */}
        <View style={[styles.settingsSeparator, { backgroundColor: colors.border }]} />

        {/* Data Saver Toggle */}
        <TouchableOpacity style={styles.settingsItem} onPress={handleDataSaverToggle}>
          <View style={styles.settingsItemLeft}>
            <Ionicons name="cellular" size={responsiveFontSize(18)} color={colors.textSecondary} />
            <Text style={[styles.settingsText, { color: colors.text }]}>
              Data Saver
            </Text>
          </View>
          <View style={[
            styles.toggle, 
            { backgroundColor: preferences.dataSaver ? colors.primary : colors.border }
          ]}>
            <View style={[
              styles.toggleThumb,
              { 
                backgroundColor: 'white',
                transform: [{ translateX: preferences.dataSaver ? 16 : 2 }]
              }
            ]} />
          </View>
        </TouchableOpacity>

        {/* Separator */}
        <View style={[styles.settingsSeparator, { backgroundColor: colors.border }]} />

        {/* Analytics Toggle */}
        <TouchableOpacity style={styles.settingsItem} onPress={handleAnalyticsToggle}>
          <View style={styles.settingsItemLeft}>
            <Ionicons name="analytics" size={responsiveFontSize(18)} color={colors.textSecondary} />
            <Text style={[styles.settingsText, { color: colors.text }]}>
              Analytics
            </Text>
          </View>
          <View style={[
            styles.toggle, 
            { backgroundColor: preferences.analytics ? colors.primary : colors.border }
          ]}>
            <View style={[
              styles.toggleThumb,
              { 
                backgroundColor: 'white',
                transform: [{ translateX: preferences.analytics ? 16 : 2 }]
              }
            ]} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSignOutSection = () => {
    // Show Google Sign In button if user is not authenticated
    if (!user || !user.email || user.email.includes('@demo.com')) {
      return (
        <View style={styles.section}>
          <Button
            title="Sign in with Google"
            onPress={async () => {
              try {
                await signInWithGoogle();
                toast.showSuccess('Successfully signed in!');
              } catch (error) {
                console.error('Sign in error:', error);
                toast.showError('Failed to sign in');
              }
            }}
            variant="primary"
            size="large"
            loading={authLoading || loading}
            style={styles.signInButton}
          />
        </View>
      );
    }

    // Show Sign Out button if user is authenticated
    return (
      <View style={styles.section}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          size="large"
          loading={loading}
          style={{
            ...styles.signOutButton,
            borderColor: colors.danger,
          }}
          textStyle={{ color: colors.danger }}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + responsiveSpacing(8) }]}>
      
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderProfileHeader()}
        {/* {renderGamificationSection()} */}
        {/* {renderWalletHistory()} */}
        {renderFollowingSection()}
        {renderSettingsSection()}
        {renderSignOutSection()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveSpacing(8),
  },
  title: {
    fontSize: responsiveFontSize(20),
    fontWeight: '700',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  headerContainer: {
    paddingHorizontal: responsiveSpacing(12),
    paddingBottom: responsiveSpacing(8),
  },
  profileHeader: {
    padding: responsiveSpacing(16),
    margin: responsiveSpacing(12),
    marginTop: responsiveSpacing(8),
    borderRadius: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: responsiveSpacing(12),
  },
  avatar: {
    width: isSmallScreen ? 70 : 80,
    height: isSmallScreen ? 70 : 80,
    borderRadius: isSmallScreen ? 35 : 40,
  },
  avatarPlaceholder: {
    width: isSmallScreen ? 70 : 80,
    height: isSmallScreen ? 70 : 80,
    borderRadius: isSmallScreen ? 35 : 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: responsiveFontSize(28),
    fontWeight: 'bold',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: responsiveSpacing(16),
  },
  displayName: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    marginBottom: responsiveSpacing(3),
  },
  email: {
    fontSize: responsiveFontSize(13),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    marginBottom: responsiveSpacing(3),
  },
  statLabel: {
    fontSize: responsiveFontSize(11),
  },
  // Gamification styles commented out for v1
  // statsRow: {
  //   display: 'none', // Hidden since we use compact stats now
  // },
  // statItem: {
  //   display: 'none',
  // },
  // statNumber: {
  //   display: 'none',
  // },
  // statLabel: {
  //   display: 'none',
  // },
  section: {
    marginHorizontal: responsiveSpacing(12),
    marginBottom: responsiveSpacing(16), // Reduced from 24
  },
  sectionTitle: {
    fontSize: responsiveFontSize(16), // Reduced from 18
    fontWeight: '600',
    marginBottom: responsiveSpacing(8), // Reduced from 12
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  // gamificationRow: {
  //   flexDirection: 'row',
  //   gap: responsiveSpacing(8), // Reduced from 12
  // },
  // gamificationCard: {
  //   flex: 1,
  //   padding: responsiveSpacing(12), // Reduced from 16
  //   borderRadius: 10,
  //   alignItems: 'center',
  // },
  // Rewards/wallet styles commented out for v1
  // rewardsButton: {
  //   marginTop: 12,
  //   paddingHorizontal: 12,
  //   paddingVertical: 6,
  //   borderRadius: 8,
  // },
  // rewardsButtonText: {
  //   fontSize: 12,
  //   fontWeight: '600',
  // },
  // walletHistoryContainer: {
  //   borderRadius: 12,
  //   overflow: 'hidden',
  // },
  // emptyWallet: {
  //   padding: 32,
  //   alignItems: 'center',
  // },
  // emptyWalletText: {
  //   fontSize: 14,
  //   marginTop: 8,
  // },
  // viewAllButton: {
  //   padding: 16,
  //   alignItems: 'center',
  //   borderTopWidth: 1,
  //   borderTopColor: 'rgba(0,0,0,0.1)',
  // },
  // viewAllText: {
  //   fontSize: 14,
  //   fontWeight: '500',
  // },
  followingContainer: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  followingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  followingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  manageText: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingsContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingsSeparator: {
    height: 1,
    marginLeft: 50,
    marginRight: 16,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsText: {
    fontSize: responsiveFontSize(14),
  },
  settingsValue: {
    fontSize: 14,
  },
  toggle: {
    width: 36,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  signOutButton: {
    marginTop: 8,
  },
  signInButton: {
    marginTop: 8,
  },
});

export default ProfileScreen;