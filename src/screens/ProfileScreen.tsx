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
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/store';
import { useToast } from '@/hooks';
import { TokenTransaction } from '@/types';

import {
  SafeContainer,
  AppHeader,
  Button,
  StreakWidget,
  TokenBalance,
  WalletEntry,
  LoadingSpinner,
} from '@/components';

import { formatters } from '@/utils';
import { CATEGORIES } from '@/constants';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user, signOut, signInWithGoogle, loading: authLoading } = useAuth() as any;
  const toast = useToast();
  
  const {
    streak,
    tokens,
    tokenHistory,
    preferences,
    updatePreferences,
    bookmarks,
  } = useStore();

  // State
  const [showWalletHistory, setShowWalletHistory] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handlers
  const handleDataSaverToggle = useCallback(() => {
    updatePreferences({ dataSaver: !preferences.dataSaver });
    toast.showSuccess(
      preferences.dataSaver ? 'Data saver disabled' : 'Data saver enabled'
    );
  }, [preferences.dataSaver, updatePreferences, toast]);

  const handleWalletHistoryToggle = useCallback(() => {
    setShowWalletHistory(!showWalletHistory);
  }, [showWalletHistory]);

  const handleManageFollowing = useCallback(() => {
    navigation.navigate('ManageFollowing' as never);
  }, [navigation]);

  const handleNotificationSettings = useCallback(() => {
    navigation.navigate('NotificationSettings' as never);
  }, [navigation]);

  const handleSettings = useCallback(() => {
    navigation.navigate('Settings' as never);
  }, [navigation]);

  const handleRewards = useCallback(() => {
    navigation.navigate('RewardsCatalog' as never);
  }, [navigation]);

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
    <Animated.View
      entering={FadeInUp.duration(400)}
      style={[styles.profileHeader, { backgroundColor: colors.surface }]}
    >
      <View style={styles.avatarContainer}>
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
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

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.text }]}>
            {totalArticlesRead}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Articles Read
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.text }]}>
            {totalBookmarks}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Bookmarked
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
  );

  const renderGamificationSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Your Progress
      </Text>
      
      <View style={styles.gamificationRow}>
        <TouchableOpacity 
          style={[styles.gamificationCard, { backgroundColor: colors.surface }]}
          onPress={handleWalletHistoryToggle}
        >
          <StreakWidget 
            current={streak.current}
            best={streak.best}
            subtitle={streak.current === 0 ? 'Start your streak!' : 
                     streak.current === 1 ? 'Keep it going!' : 'Amazing streak!'}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.gamificationCard, { backgroundColor: colors.surface }]}
          onPress={handleWalletHistoryToggle}
        >
          <TokenBalance 
            balance={tokens.balance}
            showDelta={false}
          />
          <TouchableOpacity 
            style={[styles.rewardsButton, { backgroundColor: colors.primary + '20' }]}
            onPress={handleRewards}
          >
            <Text style={[styles.rewardsButtonText, { color: colors.primary }]}>
              View Rewards
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWalletHistory = () => {
    if (!showWalletHistory) return null;

    const recentTransactions = tokenHistory.slice(0, 10);

    return (
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={styles.section}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Activity
          </Text>
          <TouchableOpacity onPress={handleWalletHistoryToggle}>
            <Ionicons name="chevron-up" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.walletHistoryContainer, { backgroundColor: colors.surface }]}>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <WalletEntry 
                key={transaction.id}
                transaction={transaction}
                showDate={true}
              />
            ))
          ) : (
            <View style={styles.emptyWallet}>
              <Ionicons name="wallet-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyWalletText, { color: colors.textSecondary }]}>
                No transactions yet
              </Text>
            </View>
          )}
          
          {tokenHistory.length > 10 && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('WalletHistory' as never)}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                View All Transactions
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

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
        <TouchableOpacity style={styles.settingsItem} onPress={handleDataSaverToggle}>
          <View style={styles.settingsItemLeft}>
            <Ionicons name="cellular" size={20} color={colors.textSecondary} />
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
        
        <TouchableOpacity style={styles.settingsItem} onPress={handleNotificationSettings}>
          <View style={styles.settingsItemLeft}>
            <Ionicons name="notifications" size={20} color={colors.textSecondary} />
            <Text style={[styles.settingsText, { color: colors.text }]}>
              Notifications
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsItem} onPress={handleSettings}>
          <View style={styles.settingsItemLeft}>
            <Ionicons name="settings" size={20} color={colors.textSecondary} />
            <Text style={[styles.settingsText, { color: colors.text }]}>
              More Settings
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
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
    <SafeContainer style={{ backgroundColor: colors.background }}>
      <AppHeader 
        title="Profile" 
        rightIcon="settings-outline"
        rightAction={handleSettings}
      />
      
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderProfileHeader()}
        {renderGamificationSection()}
        {renderWalletHistory()}
        {renderFollowingSection()}
        {renderSettingsSection()}
        {renderSignOutSection()}
      </ScrollView>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  profileHeader: {
    padding: 20,
    margin: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  displayName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gamificationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gamificationCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  rewardsButton: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rewardsButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  walletHistoryContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyWallet: {
    padding: 32,
    alignItems: 'center',
  },
  emptyWalletText: {
    fontSize: 14,
    marginTop: 8,
  },
  viewAllButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
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
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsText: {
    fontSize: 16,
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