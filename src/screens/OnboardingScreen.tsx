import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/store';
import { CATEGORIES } from '@/constants';
import UserProfileService from '@/services/userProfileService';

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  iconComponent?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'Swipe Through Crypto News',
    subtitle: 'Like scrolling, but smarter',
    description: 'Get bite-sized crypto updates with our signature swipe experience. Your personalized feed learns what you love.',
    icon: '📰',
    iconComponent: 'layers',
  },
  {
    id: 2,
    title: 'Track Your Favorites',
    subtitle: 'Your coins, your way',
    description: 'Follow Bitcoin, Ethereum, or any altcoin. Set price alerts and never miss a market move.',
    icon: '🎯',
    iconComponent: 'trending-up',
  },
  {
    id: 3,
    title: 'Real-Time Alerts',
    subtitle: 'Breaking news, instantly',
    description: 'Smart notifications for price changes, breaking news, and market trends that matter to you.',
    icon: '🔔',
    iconComponent: 'notifications',
  },
  {
    id: 4,
    title: 'Earn While You Learn',
    subtitle: 'Knowledge pays off',
    description: 'Build daily streaks, earn tokens, unlock exclusive content. The more you read, the more you earn.',
    icon: '🏆',
    iconComponent: 'trophy',
  },
];

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { signInWithGoogle, signInWithMagicLink } = useAuth();
  const { setOnboardingCompleted, updatePreferences } = useStore();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['bitcoin', 'ethereum']);
  const [selectedCoins, setSelectedCoins] = useState<string[]>(['bitcoin', 'ethereum']);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userName, setUserName] = useState('');

  const handleNext = useCallback(() => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    completeOnboarding();
  }, []);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const toggleCategory = useCallback((categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const toggleCoin = useCallback((coinId: string) => {
    setSelectedCoins(prev => 
      prev.includes(coinId)
        ? prev.filter(id => id !== coinId)
        : [...prev, coinId]
    );
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      const userProfileService = UserProfileService.getInstance();
      
      // Prepare preferences object
      const preferences = {
        following: {
          categories: selectedCategories,
          coins: selectedCoins,
          sources: ['coindesk', 'cointelegraph'],
        },
        notifications: {
          breaking: notificationsEnabled,
          priceAlerts: notificationsEnabled,
          digest: notificationsEnabled,
          rewards: true,
          streaks: true,
        },
      };

      // Save to local store
      updatePreferences(preferences);

      // Try to save to Supabase if user is authenticated
      try {
        const { user } = useAuth();
        if (user) {
          await userProfileService.saveUserPreferences(preferences);
          console.log('✅ Preferences saved to Supabase');
        }
      } catch (supabaseError) {
        console.log('⚠️ Could not save to Supabase, using local storage only:', supabaseError);
      }

      // Mark onboarding as completed
      setOnboardingCompleted(true);

      // Navigate to main app
      (navigation as any).navigate('Main');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    }
  }, [selectedCategories, selectedCoins, notificationsEnabled, updatePreferences, setOnboardingCompleted, navigation]);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      await signInWithGoogle();
      completeOnboarding();
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  }, [signInWithGoogle, completeOnboarding]);

  const handleEmailSignIn = useCallback(async () => {
    if (!userName.trim()) return;
    
    try {
      // For demo purposes, we'll just complete onboarding
      // In a real app, you'd implement email sign-in
      completeOnboarding();
    } catch (error) {
      console.error('Email sign-in failed:', error);
    }
  }, [userName, completeOnboarding]);

  const renderWelcomeStep = () => {
    return (
      <View style={styles.stepContainer}>
        {/* Icon Container */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconBackground, { backgroundColor: colors.primary }]}>
            <Ionicons 
              name="layers" 
              size={48} 
              color="#FFFFFF" 
            />
          </View>
        </View>
        
        <View style={styles.contentWrapper}>
          <Text style={[styles.stepTitle, { color: colors.text }]}>
            Swipe Through Crypto News
          </Text>
          <Text style={[styles.stepSubtitle, { color: colors.primary }]}>
            Like scrolling, but smarter
          </Text>
          <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
            Get bite-sized crypto updates with our signature swipe experience. Your personalized feed learns what you love.
          </Text>
        </View>
      </View>
    );
  };

  const renderPreferencesStep = () => {
    return (
      <View style={styles.stepContainer}>
        <View style={styles.contentWrapper}>
          <Text style={[styles.stepTitle, { color: colors.text }]}>Choose Your Interests</Text>
          
          <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
            Select categories you want to follow
          </Text>
          
          <ScrollView 
            style={styles.preferencesScrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.preferencesContent}
          >
            <View style={styles.modernChipContainer}>
              {CATEGORIES.slice(1).map((category, index) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.modernChip,
                      { 
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                      isSelected && styles.modernChipSelected
                    ]}
                    onPress={() => toggleCategory(category.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.chipContent}>
                      <Text style={styles.chipIcon}>{category.icon}</Text>
                      <Text style={[
                        styles.modernChipText,
                        { color: isSelected ? '#FFFFFF' : colors.text },
                        isSelected && styles.modernChipTextSelected
                      ]}>
                        {category.name}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={18} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {selectedCategories.length > 0 && (
              <View style={styles.selectionCounter}>
                <Text style={[styles.counterText, { color: colors.textSecondary }]}>
                  {selectedCategories.length} selected
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderNotificationsStep = () => {
    return (
      <View style={styles.stepContainer}>
        <View style={styles.contentWrapper}>
          <View style={styles.notificationIconContainer}>
            <View style={[styles.notificationIconBg, { backgroundColor: colors.primary }]}>
              <Ionicons name="notifications" size={48} color="#fff" />
            </View>
          </View>
          
          <Text style={[styles.stepTitle, { color: colors.text }]}>Stay in the Loop</Text>
          <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
            We'll keep you updated on what matters
          </Text>
          
          <View style={styles.notificationCard}>
            <View style={[styles.notificationCardContent, { 
              backgroundColor: colors.surface,
              borderColor: colors.border 
            }]}>
              <View style={styles.notificationRow}>
                <View style={styles.notificationLeftContent}>
                  <View style={[styles.notificationDot, { backgroundColor: colors.primary }]} />
                  <View>
                    <Text style={[styles.notificationCardTitle, { color: colors.text }]}>Smart Alerts</Text>
                    <Text style={[styles.notificationCardDesc, { color: colors.textSecondary }]}>Breaking news & price changes</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.modernToggle,
                    { backgroundColor: notificationsEnabled ? colors.primary : colors.border },
                  ]}
                  onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.modernToggleThumb,
                    { transform: [{ translateX: notificationsEnabled ? 24 : 0 }] }
                  ]} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {notificationsEnabled && (
            <View style={styles.notificationHint}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={[styles.hintText, { color: colors.primary }]}>
                Perfect! You won't miss anything important
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderAuthStep = () => {
    return (
      <View style={styles.stepContainer}>
        <View style={styles.contentWrapper}>
          <View style={[styles.authIconBg, { backgroundColor: colors.primary }]}>
            <Ionicons name="trophy" size={48} color="#fff" />
          </View>
          
          <Text style={[styles.stepTitle, { color: colors.text }]}>Ready to Start Earning?</Text>
          <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
            Sign in to unlock rewards and sync across devices
          </Text>
          
          <View style={styles.authOptions}>
            <TouchableOpacity
              style={styles.modernAuthButton}
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
            >
              <View style={[styles.authButtonContent, { backgroundColor: '#4285F4' }]}>
                <View style={styles.googleIconBg}>
                  <Ionicons name="logo-google" size={20} color="#4285F4" />
                </View>
                <Text style={styles.modernAuthButtonText}>Continue with Google</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.dividerContainer}>
              <View style={[styles.modernDivider, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
              <View style={[styles.modernDivider, { backgroundColor: colors.border }]} />
            </View>
            
            <TouchableOpacity
              style={styles.skipAuthButton}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={[styles.skipAuthText, { color: colors.text }]}>Continue as Guest</Text>
              <Text style={[styles.skipAuthSubtext, { color: colors.textSecondary }]}>You can always sign in later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderWelcomeStep();
      case 1:
        return renderPreferencesStep();
      case 2:
        return renderNotificationsStep();
      case 3:
        return renderAuthStep();
      default:
        return renderWelcomeStep();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Progress Bar */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.modernProgressContainer}>
          <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.progressBarFill,
                { 
                  width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%`,
                  backgroundColor: colors.primary
                }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {currentStep + 1} of {ONBOARDING_STEPS.length}
          </Text>
        </View>
        
        {currentStep > 0 && (
          <TouchableOpacity 
            style={[styles.modernBackButton, { backgroundColor: colors.surface, borderColor: colors.border }]} 
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStepContent()}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.modernFooter, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View style={styles.footerContent}>
          <TouchableOpacity
            style={[styles.modernNextButton, { backgroundColor: colors.primary }]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.modernNextButtonText}>
              {currentStep === ONBOARDING_STEPS.length - 1 ? 'Start Exploring' : 'Continue'}
            </Text>
            <Ionicons name="arrow-forward" size={22} color="#fff" />
          </TouchableOpacity>
          
          {currentStep < ONBOARDING_STEPS.length - 1 && (
            <TouchableOpacity 
              style={styles.modernSkipButton} 
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={[styles.modernSkipText, { color: colors.textSecondary }]}>Skip for now</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  modernProgressContainer: {
    flex: 1,
    marginRight: 16,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  modernBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    minHeight: 400,
  },
  
  // Icon Styles
  iconContainer: {
    marginBottom: 48,
    position: 'relative',
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  
  // Content Styles
  contentWrapper: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  
  // Preferences Styles
  preferencesScrollView: {
    maxHeight: 300,
  },
  preferencesContent: {
    paddingBottom: 20,
  },
  modernChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  modernChip: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modernChipSelected: {
    borderColor: 'transparent',
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  chipIcon: {
    fontSize: 20,
  },
  modernChipText: {
    fontSize: 15,
    fontWeight: '500',
  },
  modernChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectionCounter: {
    marginTop: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
    alignSelf: 'center',
  },
  counterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Notification Styles
  notificationIconContainer: {
    marginBottom: 32,
  },
  notificationIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCard: {
    width: '100%',
    marginTop: 32,
  },
  notificationCardContent: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  notificationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  notificationCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationCardDesc: {
    fontSize: 14,
  },
  modernToggle: {
    width: 52,
    height: 28,
    borderRadius: 16,
    padding: 2,
    overflow: 'hidden',
  },
  modernToggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  notificationHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  hintText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Auth Styles
  authIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  authOptions: {
    width: '100%',
    marginTop: 32,
  },
  modernAuthButton: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  authButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernAuthButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  modernDivider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  skipAuthButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipAuthText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  skipAuthSubtext: {
    fontSize: 13,
  },
  
  // Footer Styles
  modernFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  footerContent: {
    width: '100%',
  },
  modernNextButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modernNextButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modernSkipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modernSkipText: {
    fontSize: 15,
    fontWeight: '500',
  },
});

export default OnboardingScreen;
