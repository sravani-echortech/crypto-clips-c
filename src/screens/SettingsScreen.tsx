import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { SafeContainer, AppHeader } from '@/components';
import { useTheme } from '@/contexts/ThemeContext';
import { useStore } from '@/store';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark, toggleTheme } = useTheme();
  const {
    preferences,
    updatePreferences,
    resetApp,
    tokens,
    streak,
  } = useStore();

  const [dataSaverEnabled, setDataSaverEnabled] = useState(preferences.dataSaver || false);

  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          icon: 'moon',
          label: 'Dark Mode',
          description: 'Reduce eye strain in low light',
          type: 'switch',
          value: isDark,
          onValueChange: toggleTheme,
        },
        {
          icon: 'text',
          label: 'Font Size',
          description: 'Adjust article text size',
          type: 'navigation',
          onPress: () => Alert.alert('Font Size', 'Font size adjustment will be available soon'),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: 'notifications',
          label: 'Push Notifications',
          description: 'Breaking news and price alerts',
          type: 'switch',
          value: preferences.notifications,
          onValueChange: (value: boolean) => updatePreferences({ notifications: value }),
        },
        {
          icon: 'mail',
          label: 'Email Digest',
          description: 'Daily summary of top news',
          type: 'switch',
          value: false,
          onValueChange: () => Alert.alert('Coming Soon', 'Email digest feature coming soon'),
        },
        {
          icon: 'vibrate',
          label: 'Haptic Feedback',
          description: 'Vibration on interactions',
          type: 'switch',
          value: preferences.haptics,
          onValueChange: (value: boolean) => {
            updatePreferences({ haptics: value });
            if (value) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          },
        },
      ],
    },
    {
      title: 'Data & Storage',
      items: [
        {
          icon: 'cellular',
          label: 'Data Saver',
          description: 'Reduce data usage and load times',
          type: 'switch',
          value: dataSaverEnabled,
          onValueChange: (value: boolean) => {
            setDataSaverEnabled(value);
            updatePreferences({ dataSaver: value });
            Alert.alert(
              value ? 'Data Saver Enabled' : 'Data Saver Disabled',
              value 
                ? 'Images will load in lower quality and videos won\'t autoplay'
                : 'Full quality content will be loaded'
            );
          },
        },
        {
          icon: 'cloud-offline',
          label: 'Offline Mode',
          description: 'Download articles for offline reading',
          type: 'navigation',
          onPress: () => Alert.alert('Offline Mode', 'Configure offline reading settings'),
        },
        {
          icon: 'trash',
          label: 'Clear Cache',
          description: 'Free up storage space',
          type: 'action',
          onPress: () => {
            Alert.alert(
              'Clear Cache',
              'This will remove all cached data. Continue?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Clear',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('Success', 'Cache cleared successfully');
                  },
                },
              ]
            );
          },
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          icon: 'analytics',
          label: 'Analytics',
          description: 'Help us improve with usage data',
          type: 'switch',
          value: preferences.analytics !== false,
          onValueChange: (value: boolean) => updatePreferences({ analytics: value }),
        },
        {
          icon: 'shield-checkmark',
          label: 'Privacy Policy',
          description: 'How we protect your data',
          type: 'navigation',
          onPress: () => Linking.openURL('https://cryptoclips.app/privacy'),
        },
        {
          icon: 'document-text',
          label: 'Terms of Service',
          description: 'Terms and conditions',
          type: 'navigation',
          onPress: () => Linking.openURL('https://cryptoclips.app/terms'),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: 'person',
          label: 'Profile',
          description: 'Manage your profile',
          type: 'navigation',
          onPress: () => navigation.navigate('Profile' as any),
        },
        {
          icon: 'wallet',
          label: 'Wallet',
          description: `${tokens.balance} tokens • ${streak.current} day streak`,
          type: 'navigation',
          onPress: () => navigation.navigate('Profile' as any),
        },
        {
          icon: 'bookmark',
          label: 'Manage Bookmarks',
          description: 'Organize saved articles',
          type: 'navigation',
          onPress: () => navigation.navigate('Bookmarks' as any),
        },
        {
          icon: 'log-out',
          label: 'Sign Out',
          description: 'Sign out of your account',
          type: 'action',
          onPress: () => {
            Alert.alert(
              'Sign Out',
              'Are you sure you want to sign out?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Sign Out',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('Signed Out', 'You have been signed out');
                  },
                },
              ]
            );
          },
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle',
          label: 'Help Center',
          description: 'FAQs and guides',
          type: 'navigation',
          onPress: () => Linking.openURL('https://cryptoclips.app/help'),
        },
        {
          icon: 'chatbubbles',
          label: 'Contact Support',
          description: 'Get help from our team',
          type: 'navigation',
          onPress: () => Linking.openURL('mailto:support@cryptoclips.app'),
        },
        {
          icon: 'star',
          label: 'Rate App',
          description: 'Share your feedback',
          type: 'navigation',
          onPress: () => Alert.alert('Rate App', 'Thank you for your feedback!'),
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'information-circle',
          label: 'Version',
          description: '1.0.0 (Build 100)',
          type: 'info',
        },
        {
          icon: 'refresh',
          label: 'Check for Updates',
          description: 'Get the latest features',
          type: 'action',
          onPress: () => Alert.alert('Up to Date', 'You have the latest version'),
        },
        {
          icon: 'warning',
          label: 'Reset App',
          description: 'Clear all data and start fresh',
          type: 'action',
          danger: true,
          onPress: () => {
            Alert.alert(
              'Reset App',
              'This will delete all your data including bookmarks, preferences, and tokens. This cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset',
                  style: 'destructive',
                  onPress: () => {
                    resetApp();
                    Alert.alert('App Reset', 'All data has been cleared');
                  },
                },
              ]
            );
          },
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => {
    if (item.type === 'switch') {
      return (
        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingContent}>
            <Ionicons name={item.icon} size={24} color={colors.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {item.label}
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                {item.description}
              </Text>
            </View>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onValueChange}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={item.value ? '#fff' : '#f4f3f4'}
          />
        </View>
      );
    }

    if (item.type === 'info') {
      return (
        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingContent}>
            <Ionicons name={item.icon} size={24} color={colors.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {item.label}
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                {item.description}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: colors.card }]}
        onPress={item.onPress}
      >
        <View style={styles.settingContent}>
          <Ionicons 
            name={item.icon} 
            size={24} 
            color={item.danger ? colors.error : colors.primary} 
          />
          <View style={styles.settingText}>
            <Text style={[
              styles.settingLabel, 
              { color: item.danger ? colors.error : colors.text }
            ]}>
              {item.label}
            </Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              {item.description}
            </Text>
          </View>
        </View>
        {(item.type === 'navigation' || item.type === 'action') && (
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={colors.textSecondary} 
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#E2E8F0', '#F1F5F9']}
      style={{ flex: 1 }}
    >
      <SafeContainer style={{ backgroundColor: 'transparent' }}>
      <AppHeader 
        title="Settings" 
        showBack
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.title}
            </Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  {renderSettingItem(item)}
                  {itemIndex < section.items.length - 1 && (
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Made with ❤️ by CryptoClips Team
          </Text>
          <Text style={[styles.footerVersion, { color: colors.textSecondary }]}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
      </SafeContainer>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    marginLeft: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
  },
  separator: {
    height: 1,
    marginLeft: 52,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 12,
  },
});

export default SettingsScreen;