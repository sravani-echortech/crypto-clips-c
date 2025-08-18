import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface AuthScreenProps {
  onSkip?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSkip }) => {
  const { signInWithEmail, signUpWithEmail, signInWithMagicLink, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailAuth = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithMagicLink(email);
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="trending-up" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.appTitle}>CryptoClips</Text>
            <Text style={styles.appSubtitle}>
              Sign in to save your preferences and sync across devices
            </Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#8892B0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#8892B0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#8892B0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password (min 6 characters)"
                placeholderTextColor="#8892B0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#8892B0"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, { opacity: (isLoading || loading) ? 0.7 : 1 }]}
              onPress={handleEmailAuth}
              disabled={isLoading || loading}
            >
              {isLoading || loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.magicLinkButton, { opacity: (isLoading || loading) ? 0.7 : 1 }]}
              onPress={handleMagicLink}
              disabled={isLoading || loading}
            >
              <Ionicons name="mail" size={20} color="#6366F1" />
              <Text style={styles.magicLinkButtonText}>
                Send Magic Link to Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchMode}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.switchModeText}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>

          {onSkip && (
            <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By signing in, you agree to our{' '}
              <Text style={styles.linkText}>Terms of Service</Text> and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#6366F1',
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
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    color: '#8892B0',
    paddingHorizontal: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2A2F4A',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A2F4A',
  },
  dividerText: {
    color: '#8892B0',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  magicLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
  },
  magicLinkButtonText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  switchMode: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchModeText: {
    color: '#8892B0',
    fontSize: 14,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  skipButtonText: {
    color: '#8892B0',
    fontSize: 15,
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
    color: '#6366F1',
    textDecorationLine: 'underline',
  },
});