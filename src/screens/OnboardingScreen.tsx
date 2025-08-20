import React, { useState, useCallback, useEffect } from 'react';
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
import Animated, { 
  FadeInUp, 
  FadeInDown, 
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
  ZoomIn,
  SlideInRight,
  BounceIn
} from 'react-native-reanimated';

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
  iconComponent?: string;
  gradientColors: string[];
  accentColor: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'Swipe Through Crypto News',
    subtitle: 'Like scrolling, but smarter',
    description: 'Get bite-sized crypto updates with our signature swipe experience. Your personalized feed learns what you love.',
    icon: '📰',
    iconComponent: 'layers',
    gradientColors: ['#667EEA', '#764BA2'],
    accentColor: '#667EEA',
  },
  {
    id: 2,
    title: 'Track Your Favorites',
    subtitle: 'Your coins, your way',
    description: 'Follow Bitcoin, Ethereum, or any altcoin. Set price alerts and never miss a market move.',
    icon: '🎯',
    iconComponent: 'trending-up',
    gradientColors: ['#F093FB', '#F5576C'],
    accentColor: '#F093FB',
  },
  {
    id: 3,
    title: 'Real-Time Alerts',
    subtitle: 'Breaking news, instantly',
    description: 'Smart notifications for price changes, breaking news, and market trends that matter to you.',
    icon: '🔔',
    iconComponent: 'notifications',
    gradientColors: ['#4FACFE', '#00F2FE'],
    accentColor: '#4FACFE',
  },
  {
    id: 4,
    title: 'Earn While You Learn',
    subtitle: 'Knowledge pays off',
    description: 'Build daily streaks, earn tokens, unlock exclusive content. The more you read, the more you earn.',
    icon: '🏆',
    iconComponent: 'trophy',
    gradientColors: ['#FA709A', '#FEE140'],
    accentColor: '#FA709A',
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

  // Safe pulse animation for icons (no rotation)
  const pulseAnimation = useSharedValue(1);
  const glowAnimation = useSharedValue(0);

  useEffect(() => {
    // Gentle pulse animation for current step icon
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Glow animation for highlights
    glowAnimation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [currentStep]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowAnimation.value,
  }));

  // Progress bar animation
  const progressAnimation = useSharedValue(0);
  
  useEffect(() => {
    progressAnimation.value = withSpring((currentStep + 1) / ONBOARDING_STEPS.length, {
      damping: 15,
      stiffness: 100,
    });
  }, [currentStep]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressAnimation.value * 100}%`,
  }));


  const renderWelcomeStep = () => {
    const currentStepData = ONBOARDING_STEPS[currentStep];
    
    return (
      <View style={styles.stepContainer}>

        {/* Icon with Glass Effect */}
        <Animated.View entering={ZoomIn.delay(200).springify()} style={styles.iconContainer}>
          <Animated.View style={pulseStyle}>
            <LinearGradient
              colors={currentStepData.gradientColors}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.iconInner}>
                <Ionicons 
                  name={currentStepData.iconComponent as any || 'layers'} 
                  size={48} 
                  color="#FFFFFF" 
                />
              </View>
            </LinearGradient>
            {/* Glow effect behind icon */}
            <Animated.View style={[styles.iconGlow, glowStyle, { backgroundColor: currentStepData.accentColor }]} />
          </Animated.View>
        </Animated.View>
        
        <Animated.View entering={FadeInUp.delay(400)} style={styles.contentWrapper}>
          <Text style={[styles.stepTitle, { color: colors.text }]}>
            {currentStepData.title}
          </Text>
          <Text style={[styles.stepSubtitle, { color: currentStepData.accentColor }]}>
            {currentStepData.subtitle}
          </Text>
          <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
            {currentStepData.description}
          </Text>
        </Animated.View>
      </View>
    );
  };

     const renderPreferencesStep = () => {
     const currentStepData = ONBOARDING_STEPS[1];
     
     return (
       <View style={styles.stepContainer}>
         <Animated.View entering={FadeInUp.delay(200)} style={styles.contentWrapper}>
           <Text style={[styles.stepTitle, { color: colors.text }]}>Choose Your Interests</Text>
           
           <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
             Select categories you want to follow
           </Text>
          
          <ScrollView 
            style={styles.preferencesScrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.preferencesContent}
          >
            <Animated.View entering={FadeInUp.delay(300)} style={styles.modernChipContainer}>
              {CATEGORIES.slice(1).map((category, index) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <Animated.View
                    key={category.id}
                    entering={SlideInRight.delay(300 + index * 50).springify()}
                  >
                    <TouchableOpacity
                      style={[
                        styles.modernChip,
                        { 
                          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                          borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
                        },
                        isSelected && styles.modernChipSelected
                      ]}
                      onPress={() => toggleCategory(category.id)}
                      activeOpacity={0.7}
                    >
                                             {isSelected && (
                         <LinearGradient
                           colors={currentStepData.gradientColors}
                           style={[StyleSheet.absoluteFillObject, { borderRadius: 16 }]}
                           start={{ x: 0, y: 0 }}
                           end={{ x: 0, y: 1 }}
                         />
                       )}
                      <View style={styles.chipContent}>
                        <Text style={[styles.chipIcon]}>{category.icon}</Text>
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
                  </Animated.View>
                );
              })}
            </Animated.View>
            
            {selectedCategories.length > 0 && (
              <Animated.View entering={FadeIn.delay(600)} style={styles.selectionCounter}>
                <Text style={styles.counterText}>
                  {selectedCategories.length} selected
                </Text>
              </Animated.View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    );
  };

  const renderNotificationsStep = () => {
    const currentStepData = ONBOARDING_STEPS[2];
    
    return (
      <View style={styles.stepContainer}>
        <Animated.View entering={FadeInUp.delay(200)} style={styles.contentWrapper}>
          <Animated.View entering={BounceIn.delay(300).springify()} style={styles.notificationIconContainer}>
                         <LinearGradient
               colors={currentStepData.gradientColors}
               style={styles.notificationIconBg}
               start={{ x: 0, y: 0 }}
               end={{ x: 0, y: 1 }}
             >
              <Ionicons name="notifications" size={48} color="#fff" />
            </LinearGradient>
          </Animated.View>
          
          <Text style={[styles.stepTitle, { color: colors.text }]}>Stay in the Loop</Text>
          <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
            We'll keep you updated on what matters
          </Text>
          
          <Animated.View entering={SlideInRight.delay(400).springify()} style={styles.notificationCard}>
            <LinearGradient
              colors={isDark ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.02)']}
              style={[styles.notificationCardGradient, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
            >
              <View style={styles.notificationRow}>
                <View style={styles.notificationLeftContent}>
                  <View style={[styles.notificationDot, { backgroundColor: currentStepData.accentColor }]} />
                  <View>
                    <Text style={[styles.notificationCardTitle, { color: colors.text }]}>Smart Alerts</Text>
                    <Text style={[styles.notificationCardDesc, { color: colors.textSecondary }]}>Breaking news & price changes</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.modernToggle,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
                    notificationsEnabled && styles.modernToggleActive
                  ]}
                  onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                  activeOpacity={0.8}
                >
                                     {notificationsEnabled && (
                     <LinearGradient
                       colors={currentStepData.gradientColors}
                       style={[StyleSheet.absoluteFillObject, { borderRadius: 16 }]}
                       start={{ x: 0, y: 0 }}
                       end={{ x: 0, y: 1 }}
                     />
                   )}
                  <Animated.View style={[
                    styles.modernToggleThumb,
                    { transform: [{ translateX: notificationsEnabled ? 24 : 0 }] }
                  ]} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
          
          {notificationsEnabled && (
            <Animated.View entering={FadeIn.delay(500)} style={styles.notificationHint}>
              <Ionicons name="checkmark-circle" size={20} color={currentStepData.accentColor} />
              <Text style={[styles.hintText, { color: currentStepData.accentColor }]}>
                Perfect! You won't miss anything important
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      </View>
    );
  };

  const renderAuthStep = () => {
    const currentStepData = ONBOARDING_STEPS[3];
    
    return (
      <View style={styles.stepContainer}>
        <Animated.View entering={FadeInUp.delay(200)} style={styles.contentWrapper}>
                     <LinearGradient
             colors={currentStepData.gradientColors}
             style={styles.authIconBg}
             start={{ x: 0, y: 0 }}
             end={{ x: 0, y: 1 }}
           >
            <Ionicons name="trophy" size={48} color="#fff" />
          </LinearGradient>
          
          <Text style={[styles.stepTitle, { color: colors.text }]}>Ready to Start Earning?</Text>
          <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
            Sign in to unlock rewards and sync across devices
          </Text>
          
          <View style={styles.authOptions}>
            <Animated.View entering={FadeInUp.delay(400)}>
              <TouchableOpacity
                style={styles.modernAuthButton}
                onPress={handleGoogleSignIn}
                activeOpacity={0.8}
              >
                                 <LinearGradient
                   colors={['#4285F4', '#356AC3']}
                   style={[StyleSheet.absoluteFillObject, { borderRadius: 16 }]}
                   start={{ x: 0, y: 0 }}
                   end={{ x: 0, y: 1 }}
                 />
                <View style={styles.authButtonContent}>
                  <View style={styles.googleIconBg}>
                    <Ionicons name="logo-google" size={20} color="#4285F4" />
                  </View>
                  <Text style={styles.modernAuthButtonText}>Continue with Google</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View entering={FadeInUp.delay(500)} style={styles.dividerContainer}>
              <View style={[styles.modernDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
              <View style={[styles.modernDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
            </Animated.View>
            
            <Animated.View entering={FadeInUp.delay(600)}>
              <TouchableOpacity
                style={styles.skipAuthButton}
                onPress={handleSkip}
                activeOpacity={0.7}
              >
                <Text style={[styles.skipAuthText, { color: colors.text }]}>Continue as Guest</Text>
                <Text style={[styles.skipAuthSubtext, { color: colors.textSecondary }]}>You can always sign in later</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#0A0E27', '#1A1F3A', '#0A0E27'] : [colors.background, '#F1F5F9', colors.background]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      {/* Progress Bar */}
      <View style={styles.header}>
        <View style={styles.modernProgressContainer}>
          <View style={[styles.progressBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
            <Animated.View 
              style={[
                styles.progressBarFill,
                progressBarStyle,
                { 
                  backgroundColor: ONBOARDING_STEPS[currentStep].accentColor 
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
            style={[styles.modernBackButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} 
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

      {/* Modern Footer */}
      <View style={[styles.modernFooter, { backgroundColor: isDark ? 'rgba(10,14,39,0.95)' : 'rgba(255,255,255,0.95)' }]}>
        <Animated.View entering={FadeInUp.delay(700)} style={styles.footerContent}>
          <TouchableOpacity
            style={styles.modernNextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
                         <LinearGradient
               colors={ONBOARDING_STEPS[currentStep].gradientColors}
               style={[StyleSheet.absoluteFillObject, { borderRadius: 28 }]}
               start={{ x: 0, y: 0 }}
               end={{ x: 0, y: 1 }}
             />
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
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.3s ease',
  },
  progressText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  modernBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
    minHeight: SCREEN_HEIGHT * 0.65,
  },
  
  // Icon Styles
  iconContainer: {
    marginBottom: 48,
    position: 'relative',
  },
  iconGradient: {
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
  iconInner: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  iconGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    top: -10,
    left: -10,
    zIndex: -1,
    opacity: 0.3,
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
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  stepTitleLight: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
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
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  
  // Preferences Styles
  headerGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  preferencesScrollView: {
    maxHeight: SCREEN_HEIGHT * 0.4,
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
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
    color: 'rgba(255,255,255,0.8)',
  },
  modernChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectionCounter: {
    marginTop: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    alignSelf: 'center',
  },
  counterText: {
    color: 'rgba(255,255,255,0.6)',
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
  notificationCardGradient: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notificationCardDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  modernToggle: {
    width: 52,
    height: 28,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 2,
    overflow: 'hidden',
  },
  modernToggleActive: {
    backgroundColor: 'transparent',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
  },
  skipAuthButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipAuthText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  skipAuthSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
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
    backgroundColor: 'rgba(10,14,39,0.95)',
    backdropFilter: 'blur(10px)',
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
    overflow: 'hidden',
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
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
});

export default OnboardingScreen;
