import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface LoginScreenProps {
  onSkip?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSkip }) => {
  const { signInWithGoogle, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Google sign-in handler
  const handleGoogleSignIn = React.useCallback(async () => {
    console.log('🚀 LoginScreen: Google sign-in button pressed');
    
    try {
      setIsSigningIn(true);
      console.log('🔍 LoginScreen: Setting signing in state');
      
      console.log('🔄 LoginScreen: Calling signInWithGoogle...');
      
      await signInWithGoogle();
      
      console.log('✅ LoginScreen: Google sign-in completed successfully');
      console.log('✅ LoginScreen: Sign-in successful');
    } catch (error: any) {
      console.error('❌ LoginScreen: Login error:', error);
      console.log('❌ LoginScreen: Sign-in failed:', error.message || 'Unknown error');
      
      Alert.alert(
        'Authentication Error',
        error.message || 'Failed to sign in with Google. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSigningIn(false);
      console.log('🔍 LoginScreen: Clearing signing in state');
      console.log('🏁 LoginScreen: Google sign-in flow completed');
    }
  }, [signInWithGoogle]);

  // Check if any action is loading
  const isAnyLoading = React.useMemo(() => loading || isSigningIn, [loading, isSigningIn]);

  // Memoized styles
  const googleButtonStyle = React.useMemo(() => [
    styles.googleButton,
    { opacity: isAnyLoading ? 0.7 : 1 }
  ], [isAnyLoading]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="trending-up" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.appTitle}>
            CryptoClips
          </Text>
          <Text style={styles.appSubtitle}>
            Your personalized crypto news feed
          </Text>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            Welcome Back!
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Sign in to access your personalized crypto news and save your favorite articles
          </Text>
        </View>

        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={googleButtonStyle}
            onPress={handleGoogleSignIn}
            disabled={isAnyLoading}
          >
            {isAnyLoading ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <>
                <View style={styles.googleIcon}>
                  <Image 
                    source={{ uri: 'https://www.google.com/favicon.ico' }}
                    style={styles.googleIconImage}
                  />
                </View>
                <Text style={styles.googleButtonText}>
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          {onSkip && (
            <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
              <Text style={styles.skipButtonText}>
                Skip for now
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By signing in, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  appSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    color: '#8892B0',
  },
  welcomeSection: {
    alignItems: 'center',
    marginVertical: 40,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#FFFFFF',
  },
  welcomeSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    color: '#8892B0',
  },
  buttonSection: {
    marginBottom: 40,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 16,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIconImage: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 15,
    color: '#8892B0',
    textDecorationLine: 'underline',
  },
  footer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    color: '#64748B',
  },
  linkText: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
});