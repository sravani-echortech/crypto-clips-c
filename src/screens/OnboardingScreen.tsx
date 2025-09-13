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
import { Layers, Lock, ChevronLeft, ArrowRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/store';

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
    title: 'Welcome to CryptoClips',
    subtitle: 'Your crypto news companion',
    description: 'Get bite-sized crypto updates with our signature swipe experience. Stay informed and never miss what matters in crypto.',
    icon: '📰',
    iconComponent: 'layers',
  },
  {
    id: 2,
    title: 'Get Started',
    subtitle: 'Sign in to sync your progress',
    description: 'Sign in with Google to save your bookmarks and preferences across all your devices.',
    icon: '🔐',
    iconComponent: 'lock-closed',
  },
];

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { signInWithGoogle } = useAuth();
  const { setOnboardingCompleted } = useStore();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  // Responsive font scaling based on screen width
  const getResponsiveFontSize = (baseSize: number) => {
    const scale = Math.min(SCREEN_WIDTH / 375, 1.2); // Base width 375px, max scale 1.2
    return Math.round(baseSize * scale);
  };
  
  const [currentStep, setCurrentStep] = useState(0);

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


  const completeOnboarding = useCallback(async () => {
    console.log('🎯 OnboardingScreen: Starting onboarding completion');
    
    try {
      // Mark onboarding as completed
      setOnboardingCompleted(true);
      console.log('✅  Onboarding marked as completed');

      // Navigate to main app
      console.log('🧭  Navigating to Main screen');
      (navigation as any).navigate('Main');
      
      console.log('✅  Onboarding completion successful');
      console.log('🎉  Onboarding completed successfully!');
      
    } catch (error) {
      console.error('❌  Error completing onboarding:', error);
      console.log('❌  Onboarding completion failed:', error instanceof Error ? error.message : 'Unknown error');
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    }
  }, [setOnboardingCompleted, navigation]);

  const handleGoogleSignIn = useCallback(async () => {
      console.log('🚀  OnboardingScreen: Google sign-in initiated');
      
      try {
        await signInWithGoogle();
        console.log('✅  OnboardingScreen: Google sign-in successful, completing onboarding');
        console.log('✅  Onboarding Google sign-in successful');
        
        completeOnboarding();
      } catch (error) {
        console.error('❌  OnboardingScreen: Google sign-in failed:', error);
        console.log('❌  Onboarding Google sign-in failed:', error instanceof Error ? error.message : 'Unknown error');
      }
  }, [signInWithGoogle, completeOnboarding]);


  const renderWelcomeStep = () => {
    return (
      <View style={styles.stepContainer}>
        {/* Icon Container */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconBackground, { backgroundColor: colors.primary }]}>
            <Layers 
              size={42} 
              color="#FFFFFF" 
            />
          </View>
        </View>
        
        <View style={styles.contentWrapper}>
          <Text style={[styles.stepTitle, { color: colors.text, fontSize: getResponsiveFontSize(32) }]}>
            Welcome to CryptoClips
          </Text>
          <Text style={[styles.stepSubtitle, { color: colors.primary, fontSize: getResponsiveFontSize(17) }]}>
            Your crypto news companion
          </Text>
          <Text style={[styles.stepDescription, { color: colors.textSecondary, fontSize: getResponsiveFontSize(16) }]}>
            Get bite-sized crypto updates with our signature swipe experience. Stay informed and never miss what matters in crypto.
          </Text>
        </View>
      </View>
    );
  };


  const renderAuthStep = () => {
    return (
      <View style={styles.stepContainer}>
        <View style={styles.contentWrapper}>
          <View style={[styles.authIconBg, { backgroundColor: colors.primary }]}>
            <Lock size={40} color="#fff" />
          </View>
          
          <Text style={[styles.stepTitle, { color: colors.text, fontSize: getResponsiveFontSize(32) }]}>Get Started</Text>
          <Text style={[styles.stepDescription, { color: colors.textSecondary, fontSize: getResponsiveFontSize(16) }]}>
            Sign in with Google to save your bookmarks and preferences across all your devices.
          </Text>
          
          <View style={styles.authOptions}>
            <TouchableOpacity
              style={styles.modernAuthButton}
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
            >
              <View style={[styles.authButtonContent, { backgroundColor: '#FFFFFF' }]}>
                <Image 
                  source={require('../../assets/google.png')} 
                  style={styles.googleLogo}
                  resizeMode="contain"
                />
                <Text style={[styles.modernAuthButtonText, { fontSize: getResponsiveFontSize(16) }]}>Continue with Google</Text>
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
              <Text style={[styles.skipAuthLink, { color: colors.primary, fontSize: getResponsiveFontSize(15) }]}>Continue as Guest</Text>
              <Text style={[styles.skipAuthSubtext, { color: colors.textSecondary, fontSize: getResponsiveFontSize(12) }]}>You can always sign in later</Text>
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
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
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
        
        {currentStep > 0 ? (
          <TouchableOpacity 
            style={[styles.modernBackButton, { backgroundColor: colors.surface, borderColor: colors.border }]} 
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <ChevronLeft size={22} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36, height: 36 }} />
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStepContent()}
      </ScrollView>

      {/* Footer - Only show for first step */}
      {currentStep === 0 && (
        <View style={[styles.modernFooter, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <View style={styles.footerContent}>
            <TouchableOpacity
              style={[styles.modernNextButton, { backgroundColor: colors.primary }]}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={[styles.modernNextButtonText, { fontSize: getResponsiveFontSize(17) }]}>Continue</Text>
              <ArrowRight size={20} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modernSkipButton} 
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={[styles.modernSkipText, { color: colors.textSecondary, fontSize: getResponsiveFontSize(15) }]}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  modernProgressContainer: {
    flex: 1,
    marginRight: 12,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  modernBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  stepContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  
  // Icon Styles
  iconContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  
  // Content Styles
  contentWrapper: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  
  // Auth Styles
  authIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  authOptions: {
    width: '100%',
    marginTop: 28,
  },
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
  googleLogo: {
    width: 20,
    height: 20,
  },
  modernAuthButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
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
    paddingVertical: 20,
    alignItems: 'center',
  },
  skipAuthLink: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
    textDecorationLine: 'underline',
  },
  skipAuthSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  
  // Footer Styles
  modernFooter: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    borderTopWidth: 0,
  },
  footerContent: {
    width: '100%',
  },
  modernNextButton: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
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
