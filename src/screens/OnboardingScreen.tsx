import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { SafeContainer } from '@/components';
import { AuthScreen } from '@/components/AuthScreen';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/store';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  gradient: [string, string];
  content?: React.ReactNode;
}

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { signInWithGoogle, user, loading: authLoading } = useAuth() as any;
  const scrollViewRef = useRef<ScrollView>(null);
  
  const {
    updatePreferences,
    setOnboardingCompleted,
    addTokens,
    preferences,
  } = useStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [username, setUsername] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const interests = [
    { id: 'bitcoin', label: 'Bitcoin', icon: 'logo-bitcoin' },
    { id: 'ethereum', label: 'Ethereum', icon: 'cube' },
    { id: 'defi', label: 'DeFi', icon: 'swap-horizontal' },
    { id: 'nfts', label: 'NFTs', icon: 'image' },
    { id: 'trading', label: 'Trading', icon: 'trending-up' },
    { id: 'regulation', label: 'Regulation', icon: 'shield-checkmark' },
    { id: 'mining', label: 'Mining', icon: 'hardware-chip' },
    { id: 'web3', label: 'Web3', icon: 'globe' },
    { id: 'metaverse', label: 'Metaverse', icon: 'glasses' },
    { id: 'gaming', label: 'Gaming', icon: 'game-controller' },
  ];

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to CryptoClips',
      subtitle: 'Your personalized crypto news feed',
      icon: 'newspaper',
      gradient: ['#667eea', '#764ba2'],
      content: (
        <View style={styles.stepContent}>
          <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
            <Ionicons name="flash" size={24} color={colors.primary} />
            <Text style={[styles.featureTitle, { color: colors.text }]}>
              Lightning Fast
            </Text>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Get breaking crypto news as it happens
            </Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
            <Ionicons name="trophy" size={24} color="#FFD700" />
            <Text style={[styles.featureTitle, { color: colors.text }]}>
              Earn Rewards
            </Text>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Read articles, earn tokens, redeem prizes
            </Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
            <Ionicons name="analytics" size={24} color="#4CAF50" />
            <Text style={[styles.featureTitle, { color: colors.text }]}>
              Smart Insights
            </Text>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              AI-powered summaries and sentiment analysis
            </Text>
          </View>
        </View>
      ),
    },
    {
      id: 'personalize',
      title: 'Personalize Your Feed',
      subtitle: 'Select topics you\'re interested in',
      icon: 'color-palette',
      gradient: ['#f093fb', '#f5576c'],
      content: (
        <View style={styles.stepContent}>
          <View style={styles.interestsGrid}>
            {interests.map(interest => (
              <TouchableOpacity
                key={interest.id}
                style={[
                  styles.interestChip,
                  {
                    backgroundColor: selectedInterests.includes(interest.id)
                      ? colors.primary
                      : colors.card,
                    borderColor: selectedInterests.includes(interest.id)
                      ? colors.primary
                      : colors.border,
                  },
                ]}
                onPress={() => {
                  if (selectedInterests.includes(interest.id)) {
                    setSelectedInterests(prev => prev.filter(i => i !== interest.id));
                  } else {
                    setSelectedInterests(prev => [...prev, interest.id]);
                  }
                  if (preferences.haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              >
                <Ionicons
                  name={interest.icon as any}
                  size={24}
                  color={selectedInterests.includes(interest.id) ? '#fff' : colors.text}
                />
                <Text
                  style={[
                    styles.interestLabel,
                    {
                      color: selectedInterests.includes(interest.id) ? '#fff' : colors.text,
                    },
                  ]}
                >
                  {interest.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.selectionHint, { color: colors.textSecondary }]}>
            Select at least 3 topics to continue
          </Text>
        </View>
      ),
    },
    {
      id: 'notifications',
      title: 'Stay Updated',
      subtitle: 'Get notified about breaking news',
      icon: 'notifications',
      gradient: ['#4facfe', '#00f2fe'],
      content: (
        <View style={styles.stepContent}>
          <View style={[styles.notificationCard, { backgroundColor: colors.card }]}>
            <View style={styles.notificationHeader}>
              <Ionicons name="notifications" size={32} color={colors.primary} />
              <Text style={[styles.notificationTitle, { color: colors.text }]}>
                Enable Notifications
              </Text>
            </View>
            
            <Text style={[styles.notificationText, { color: colors.textSecondary }]}>
              Get instant alerts for:
            </Text>

            <View style={styles.notificationFeatures}>
              <View style={styles.notificationFeature}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={[styles.notificationFeatureText, { color: colors.text }]}>
                  Breaking crypto news
                </Text>
              </View>
              <View style={styles.notificationFeature}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={[styles.notificationFeatureText, { color: colors.text }]}>
                  Price alerts for your favorites
                </Text>
              </View>
              <View style={styles.notificationFeature}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={[styles.notificationFeatureText, { color: colors.text }]}>
                  Daily streak reminders
                </Text>
              </View>
            </View>

            <View style={styles.toggleContainer}>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>
                Push Notifications
              </Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
            You can change this anytime in Settings
          </Text>
        </View>
      ),
    },
    {
      id: 'signin',
      title: 'Create Your Account',
      subtitle: 'Sign in to sync across devices and save your preferences',
      icon: 'person-circle',
      gradient: ['#6366F1', '#8B5CF6'],
      content: (
        <View style={styles.stepContent}>
          {user ? (
            <View style={[styles.authCard, { backgroundColor: colors.card }]}>
              <View style={styles.signedInContainer}>
                <Ionicons name="checkmark-circle" size={48} color="#34A853" />
                <Text style={[styles.signedInText, { color: colors.text }]}>
                  Signed in as
                </Text>
                <Text style={[styles.userEmail, { color: colors.primary }]}>
                  {user.email}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.miniAuthContainer}>
              <AuthScreen onSkip={() => handleNext()} />
            </View>
          )}
        </View>
      ),
    },
  ];

  const handleNext = useCallback(() => {
    if (currentStep === 1 && selectedInterests.length < 3) {
      Alert.alert('Select More Topics', 'Please select at least 3 topics to continue');
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      scrollViewRef.current?.scrollTo({ x: width * (currentStep + 1), animated: true });
    } else {
      completeOnboarding();
    }

    if (preferences.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [currentStep, selectedInterests, preferences.haptics]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      scrollViewRef.current?.scrollTo({ x: width * (currentStep - 1), animated: true });
      if (preferences.haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [currentStep, preferences.haptics]);

  const completeOnboarding = useCallback(() => {
    setOnboardingCompleted(true);

    updatePreferences({
      notifications: notificationsEnabled,
    });

    addTokens(100, 'Onboarding bonus');

    const welcomeMessage = user 
      ? `Welcome ${user.email?.split('@')[0]}! 🎉`
      : 'Welcome! 🎉';

    Alert.alert(
      welcomeMessage,
      'You\'ve earned 100 tokens for completing onboarding!',
      [
        {
          text: 'Start Reading',
          onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'Main' as any }],
          }),
        },
      ]
    );
  }, [user, notificationsEnabled, setOnboardingCompleted, updatePreferences, addTokens, navigation]);

  const renderStep = (step: OnboardingStep, index: number) => (
    <View key={step.id} style={styles.stepContainer}>
      <LinearGradient
        colors={step.gradient}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          entering={ZoomIn.springify().delay(index * 100)}
          style={styles.iconContainer}
        >
          <Ionicons name={step.icon as any} size={80} color="#fff" />
        </Animated.View>
      </LinearGradient>

      <View style={styles.contentContainer}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          {step.subtitle}
        </Text>

        {step.content}
      </View>
    </View>
  );

  return (
    <SafeContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          {currentStep > 0 && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Skip Onboarding?',
                'You can always personalize your experience later in Settings',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Skip',
                    onPress: () => {
                      setOnboardingCompleted(true);
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Main' as any }],
                      });
                    },
                  },
                ]
              );
            }}
            style={styles.skipButton}
          >
            <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
        >
          {steps.map((step, index) => renderStep(step, index))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    backgroundColor: index === currentStep ? colors.primary : colors.border,
                    width: index === currentStep ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: colors.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeContainer>
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
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    width,
    flex: 1,
  },
  gradientBackground: {
    height: height * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  stepContent: {
    flex: 1,
  },
  featureCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  interestChip: {
    width: (width - 64) / 3,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  interestLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  selectionHint: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  notificationCard: {
    padding: 20,
    borderRadius: 16,
  },
  notificationHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  notificationTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
  },
  notificationText: {
    fontSize: 14,
    marginBottom: 16,
  },
  notificationFeatures: {
    gap: 12,
    marginBottom: 24,
  },
  notificationFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationFeatureText: {
    fontSize: 14,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  privacyText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  profileCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  usernameInput: {
    width: '100%',
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 8,
  },
  usernameHint: {
    fontSize: 14,
  },
  bonusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 12,
  },
  bonusText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  authCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  googleIconContainer: {
    marginRight: 12,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  skipButtonText: {
    fontSize: 15,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signedInContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  signedInText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 18,
    fontWeight: '600',
  },
  benefitsContainer: {
    marginTop: 24,
    gap: 12,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    flex: 1,
  },
  miniAuthContainer: {
    marginTop: -20,
    marginHorizontal: -20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;