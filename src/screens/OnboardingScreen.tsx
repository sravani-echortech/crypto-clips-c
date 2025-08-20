import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/store';
import { CATEGORIES } from '@/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome to CryptoClips',
    subtitle: 'Your Daily Crypto News Companion',
    description: 'Stay updated with the latest cryptocurrency news, market trends, and insights in a beautiful, swipeable format.',
    icon: '📰',
    color: '#3B82F6',
  },
  {
    id: 2,
    title: 'Personalized Experience',
    subtitle: 'Choose Your Interests',
    description: 'Select the cryptocurrencies, categories, and topics you care about most. We\'ll curate your feed accordingly.',
    icon: '🎯',
    color: '#8B5CF6',
  },
  {
    id: 3,
    title: 'Stay Connected',
    subtitle: 'Never Miss Important News',
    description: 'Get instant notifications for breaking news, price alerts, and updates from your favorite sources.',
    icon: '🔔',
    color: '#EF4444',
  },
  {
    id: 4,
    title: 'Earn Rewards',
    subtitle: 'Engage & Get Rewarded',
    description: 'Build streaks, earn tokens, and redeem rewards as you explore the world of cryptocurrency.',
    icon: '🏆',
    color: '#F59E0B',
  },
];

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { signInWithGoogle, signInWithMagicLink } = useAuth();
  const { setOnboardingCompleted, updatePreferences } = useStore();
  
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
      // Save user preferences
      updatePreferences({
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
      });

      // Mark onboarding as completed
      setOnboardingCompleted(true);

      // Navigate to main app
      (navigation as any).navigate('Main');
    } catch (error) {
      console.error('Error completing onboarding:', error);
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

  const renderWelcomeStep = () => (
    <View style={styles.stepContainer}>
      <Animated.View entering={FadeInUp.delay(200)} style={styles.iconContainer}>
        <Text style={[styles.stepIcon, { color: ONBOARDING_STEPS[currentStep].color }]}>
          {ONBOARDING_STEPS[currentStep].icon}
        </Text>
      </Animated.View>
      
      <Animated.View entering={FadeInUp.delay(400)} style={styles.contentContainer}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          {ONBOARDING_STEPS[currentStep].title}
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.primary }]}>
          {ONBOARDING_STEPS[currentStep].subtitle}
        </Text>
        <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
          {ONBOARDING_STEPS[currentStep].description}
        </Text>
      </Animated.View>
    </View>
  );

  const renderPreferencesStep = () => (
    <View style={styles.stepContainer}>
      <Animated.View entering={FadeInUp.delay(200)} style={styles.contentContainer}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Choose Your Interests
        </Text>
        <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
          Select the categories and coins you're most interested in
        </Text>
        
        <View style={styles.preferencesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
          <View style={styles.chipContainer}>
            {CATEGORIES.slice(1).map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.chip,
                  selectedCategories.includes(category.id) && { backgroundColor: colors.primary }
                ]}
                onPress={() => toggleCategory(category.id)}
              >
                <Text style={[
                  styles.chipText,
                  { color: selectedCategories.includes(category.id) ? '#fff' : colors.text }
                ]}>
                  {category.icon} {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );

  const renderNotificationsStep = () => (
    <View style={styles.stepContainer}>
      <Animated.View entering={FadeInUp.delay(200)} style={styles.contentContainer}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Stay Updated
        </Text>
        <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
          Get notified about breaking news and important updates
        </Text>
        
        <View style={styles.notificationOption}>
          <View style={styles.notificationInfo}>
            <Ionicons name="notifications" size={24} color={colors.primary} />
            <View style={styles.notificationText}>
              <Text style={[styles.notificationTitle, { color: colors.text }]}>
                Enable Notifications
              </Text>
              <Text style={[styles.notificationDescription, { color: colors.textSecondary }]}>
                Get alerts for breaking news and price movements
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.toggle,
              { backgroundColor: notificationsEnabled ? colors.primary : colors.border }
            ]}
            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
          >
            <View style={[
              styles.toggleThumb,
              { transform: [{ translateX: notificationsEnabled ? 20 : 0 }] }
            ]} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );

  const renderAuthStep = () => (
    <View style={styles.stepContainer}>
      <Animated.View entering={FadeInUp.delay(200)} style={styles.contentContainer}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Create Your Account
        </Text>
        <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
          Sign in to sync your preferences and earn rewards
        </Text>
        
        <View style={styles.authOptions}>
          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: colors.primary }]}
            onPress={handleGoogleSignIn}
          >
            <Ionicons name="logo-google" size={20} color="#fff" />
            <Text style={styles.authButtonText}>Continue with Google</Text>
          </TouchableOpacity>
          
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>
          
          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: 'transparent', borderColor: colors.border }]}
            onPress={handleSkip}
          >
            <Text style={[styles.authButtonText, { color: colors.text }]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );

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
    <LinearGradient
      colors={isDark ? ['#0F172A', '#1E293B'] : ['#F8FAFC', '#E2E8F0']}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          {ONBOARDING_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentStep && { backgroundColor: colors.primary }
              ]}
            />
          ))}
        </View>
        
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.primary }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
        
        {currentStep < ONBOARDING_STEPS.length - 1 && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
              Skip
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: SCREEN_HEIGHT * 0.6,
  },
  iconContainer: {
    marginBottom: 40,
  },
  stepIcon: {
    fontSize: 80,
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  preferencesSection: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginTop: 20,
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationText: {
    marginLeft: 12,
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  authOptions: {
    width: '100%',
    marginTop: 20,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default OnboardingScreen;
