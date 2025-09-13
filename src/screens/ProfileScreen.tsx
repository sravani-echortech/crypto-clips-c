import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Image
} from 'react-native';
import { Moon, Sun } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/store';
import { useToast } from '@/hooks';
import { responsiveFontSize, responsiveSpacing, deviceSize } from '@/utils/responsive';

const isSmallScreen = deviceSize.isSmallPhone;

import {
  Button,
} from '@/components';


const ProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, signOut, signInWithGoogle, loading: authLoading } = useAuth() as any;
  
  // Debug logging for user data
  React.useEffect(() => {
    console.log('👤 ProfileScreen - User data:', {
      user: user ? {
        id: user.id,
        email: user.email,
        displayName: user.user_metadata?.name || user.email?.split('@')[0],
        avatar: user.user_metadata?.avatar_url
      } : null
    });
  }, [user]);
  const toast = useToast();
  
  const {
    preferences,
    updatePreferences,
    bookmarks,
  } = useStore();

  // State
  const [loading, setLoading] = useState(false);

  // Handlers





  const handleThemeToggle = useCallback(() => {
    const newTheme = preferences.theme === 'light' ? 'dark' : 'light';
    updatePreferences({ theme: newTheme });
    toast.showSuccess(
      `Switched to ${newTheme} theme`
    );
  }, [preferences.theme, updatePreferences, toast]);





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

  const renderProfileHeader = () => (
    <View style={styles.headerContainer}>
      {/* Title Row */}
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
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
              {totalArticlesRead}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Read
            </Text>
          </View>
        </View>
      </Animated.View>
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
            {preferences.theme === 'dark' ? (
              <Moon size={responsiveFontSize(18)} color={colors.textSecondary} />
            ) : (
              <Sun size={responsiveFontSize(18)} color={colors.textSecondary} />
            )}
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

      </View>
    </View>
  );

  const renderSignOutSection = () => {
    // Show Sign Out button if user is authenticated
    if (user && user.email && !user.email.includes('@demo.com')) {
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
    }

    // Show message and sign in button for unauthenticated users
    return (
      <View style={styles.section}>
        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            Sign in to sync your preferences
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Your preferences and bookmarks will be saved and synced across all your devices
          </Text>
          
          <Button
            title="Sign In"
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
  // Google Sign-in Button Styles (matching OnboardingScreen)
  modernAuthButton: {
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  authButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleLogoContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleLogo: {
    width: 16,
    height: 16,
  },
  modernAuthButtonText: {
    fontSize: responsiveFontSize(16),
    fontWeight: '600',
    color: '#000000',
  },
  // Info card styles
  infoCard: {
    padding: responsiveSpacing(16),
    borderRadius: 12,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: '600',
    marginBottom: responsiveSpacing(8),
    textAlign: 'center',
  },
  infoText: {
    fontSize: responsiveFontSize(14),
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: responsiveSpacing(16),
  },
  signInButton: {
    marginTop: responsiveSpacing(8),
  },
});

export default ProfileScreen;