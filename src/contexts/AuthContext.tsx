import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { supabaseFixed } from '@/lib/supabaseFixed';
import type { User, Session } from '@supabase/supabase-js';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import UserProfileService from '@/services/userProfileService';
import AuthDiagnostics from '@/services/authDiagnostics';
import { Platform } from 'react-native';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  session: Session | null;
  showEmailModal: boolean;
  setShowEmailModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const userProfileService = UserProfileService.getInstance();

  // Handle OAuth callback from deep links
  const handleOAuthCallback = async (url: string) => {
      console.log('🔗  Processing OAuth callback:', url);
      // addBreadcrumb({
      //   message: 'OAuth callback received',
      //   category: 'auth',
      //   level: 'info',
      //   data: { url: url.substring(0, 100) + '...' }, // Truncate for privacy
      // });
      
      // Log URL details for debugging
      console.log('🔍  URL details:', { url_length: url.length, has_cryptoclips: url.includes('cryptoclips://') });
      
      // Only process cryptoclips:// URLs
      if (!url.includes('cryptoclips://')) {
        console.log('⚠️  Not an OAuth callback, ignoring');
        // addBreadcrumb({
        //   message: 'Non-OAuth callback ignored',
        //   category: 'auth',
        //   level: 'info',
        // });
        return;
      }
      
      try {
        // Extract the code or tokens from the URL
        const parsedUrl = new URL(url);
        console.log('🔍  URL params:', { has_code: !!parsedUrl.searchParams.get('code'), has_error: !!parsedUrl.searchParams.get('error') });
        
        // Check for error in callback
        const error = parsedUrl.searchParams.get('error');
        if (error) {
          const errorDescription = parsedUrl.searchParams.get('error_description');
          console.error('❌  OAuth error:', error, errorDescription);
          
          // captureException(new Error(`OAuth Error: ${error}`), {
          //   tags: {
          //     component: 'AuthContext',
          //     method: 'handleOAuthCallback',
          //     oauth_error: error,
          //   },
          //   extra: {
          //     error_description: errorDescription,
          //     url: url.substring(0, 200), // Truncate for privacy
          //   },
          // });
          
          Alert.alert('Authentication Error', errorDescription || error);
          return;
        }
        
        console.log('🔄  Exchanging code for session...');
        // addBreadcrumb({
        //   message: 'Code exchange started',
        //   category: 'auth',
        //   level: 'info',
        // });
        
        const { data, error: exchangeError } = await supabaseFixed.auth.exchangeCodeForSession(url);
        
        if (exchangeError) {
          console.error('❌  Code exchange failed:', exchangeError);
          
          // captureException(exchangeError, {
          //   tags: {
          //     component: 'AuthContext',
          //     method: 'handleOAuthCallback',
          //     step: 'code_exchange',
          //   },
          // });
          
          // Try alternative: extract code and exchange manually
          const code = parsedUrl.searchParams.get('code');
          if (code) {
            console.log('🔄  Trying manual code exchange...');
            // addBreadcrumb({
            //   message: 'Manual code exchange fallback',
            //   category: 'auth',
            //   level: 'info',
            // });
            
            const { data: manualData, error: manualError } = await supabaseFixed.auth.exchangeCodeForSession(code);
            
            if (!manualError && manualData?.session) {
              console.log('✅  Manual code exchange successful!');
              // addBreadcrumb({
              //   message: 'Manual code exchange successful',
              //   category: 'auth',
              //   level: 'info',
              //   data: { user_email: manualData.session.user.email },
              // });
              
              setSession(manualData.session);
              setUser(manualData.session.user);
              return;
            }
          }
          
          Alert.alert('Authentication Failed', 'Could not complete sign-in. Please try again.');
          return;
        }
        
        if (data?.session) {
          console.log('✅  OAuth session established!');
          console.log('👤  User:', data.session.user.email);
          
          // addBreadcrumb({
          //   message: 'OAuth session established',
          //   category: 'auth',
          //   level: 'info',
          //   data: { user_email: data.session.user.email },
          // });
          
          setSession(data.session);
          setUser(data.session.user);
        }
      } catch (error) {
        console.error('❌  OAuth callback error:', error);
        
        // captureException(error, {
        //   tags: {
        //     component: 'AuthContext',
        //     method: 'handleOAuthCallback',
        //   },
        //   extra: {
        //     url: url.substring(0, 200), // Truncate for privacy
        //   },
        // });
      } finally {
        console.log('🏁  OAuth callback processing completed');
        // addBreadcrumb({
        //   message: 'OAuth callback processing completed',
        //   category: 'auth',
        //   level: 'info',
        // });
      }
  };

  useEffect(() => {
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐  Auth state changed:', event);
      
      // addBreadcrumb({
      //   message: `Auth state changed: ${event}`,
      //   category: 'auth',
      //   level: 'info',
      //   data: {
      //     event,
      //     has_session: !!session,
      //     user_email: session?.user?.email,
      //   },
      // });
      
      if (session) {
        setSession(session);
        setUser(session.user);
        console.log('✅  User authenticated:', session.user.email);
        
        // Set user context
        // setUser({
        //   id: session.user.id,
        //   email: session.user.email,
        // });
        
        // addBreadcrumb({
        //   message: 'User authenticated successfully',
        //   category: 'auth',
        //   level: 'info',
        //   data: {
        //     user_id: session.user.id,
        //     user_email: session.user.email,
        //     event,
        //   },
        // });
        
        // Create or update user profile after authentication
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          (async () => {
            try {
              console.log('👤  Creating/updating user profile...');
              await userProfileService.createOrUpdateProfile(session.user);
              console.log('✅  User profile updated successfully');
              
              console.log('✅  Profile update successful');
              // addBreadcrumb({
              //   message: 'User profile updated successfully',
              //   category: 'auth',
              //   level: 'info',
              // });
              
              // Log the complete authentication flow completion
              console.log('🎉  Complete authentication flow finished - user ready for app');
              // addBreadcrumb({
              //   message: 'Complete authentication flow finished - user ready for app',
              //   category: 'auth',
              //   level: 'info',
              //   data: {
              //     user_id: session.user.id,
              //     user_email: session.user.email,
              //     event,
              //     timestamp: new Date().toISOString(),
              //   },
              // });
              
            } catch (error) {
              console.error('❌  Error creating/updating user profile:', error);
              
              // captureException(error, {
              //   tags: {
              //     component: 'AuthContext',
              //     method: 'onAuthStateChange',
              //     step: 'profile_update',
              //   },
              //   extra: {
              //     user_id: session.user.id,
              //     user_email: session.user.email,
              //   },
              // });
              
              console.log('❌  Profile update failed:', error instanceof Error ? error.message : 'Unknown error');
            }
          })();
        }
      } else {
        setSession(null);
        setUser(null);
        console.log('⚠️  User not authenticated');
        
        // Clear user context
        // setUser(null);
        
        // addBreadcrumb({
        //   message: 'User signed out or session expired',
        //   category: 'auth',
        //   level: 'info',
        //   data: { event },
        // });
      }
    });

    // Set up deep link handling for OAuth callbacks
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🔗 Initial URL:', url);
        handleOAuthCallback(url);
      }
    });

    const urlListener = Linking.addEventListener('url', (event) => {
      console.log('🔗 Deep link received:', event.url);
      handleOAuthCallback(event.url);
    });

    return () => {
      authListener?.subscription.unsubscribe();
      urlListener?.remove();
    };
  }, []);

  const checkUser = async () => {
    try {
      setLoading(true);
      console.log('🔍 Checking for existing session...');
      
      // Get session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session check error:', error.message);
        throw error;
      }
      
      if (session) {
        console.log('✅ Session found:', session.user.email);
        setSession(session);
        setUser(session.user);
      } else {
        console.log('⚠️ No active session found');
        
        // Check for demo user in AsyncStorage
        const demoUserData = await AsyncStorage.getItem('demoUser');
        if (demoUserData) {
          const demoUser = JSON.parse(demoUserData);
          console.log('👤 Using demo user');
          setUser(demoUser);
        }
      }
    } catch (error) {
      console.error('❌ Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const startTime = Date.now();
      console.log('🚀  Starting complete Google sign-in flow');
      // addBreadcrumb({
      //   message: 'Complete Google sign-in flow initiated',
      //   category: 'auth',
      //   level: 'info',
      //   data: {
      //     startTime: new Date().toISOString(),
      //     timestamp: startTime,
      //   },
      // });
      
      setLoading(true);
      
      try {
        // Log platform and environment info
        // setContext('auth_environment', {
        //   platform: Platform.OS,
        //   version: Platform.Version,
        //   timestamp: new Date().toISOString(),
        // });
        
        console.log('🔍  Platform info:', { platform: Platform.OS, timestamp: new Date().toISOString() });
        
        // Use the new deep link OAuth flow
        const { signInWithGoogle: deepLinkSignIn } = await import('@/services/googleAuthDeepLink');
        console.log('📦  Google auth service imported successfully');
        // addBreadcrumb({
        //   message: 'Google auth service imported',
        //   category: 'auth',
        //   level: 'info',
        // });
        
        console.log('🔄  Executing OAuth flow...');
        // addBreadcrumb({
        //   message: 'OAuth flow execution started',
        //   category: 'auth',
        //   level: 'info',
        // });
        
        const authFunction = await deepLinkSignIn();
        const { success } = await authFunction();
        console.log('📊  OAuth result:', { success });
        
        if (!success) {
          console.log('❌  OAuth flow failed');
          // addBreadcrumb({
          //   message: 'OAuth flow failed',
          //   category: 'auth',
          //   level: 'error',
          // });
          
          Alert.alert(
            'Sign-In Failed',
            'Unable to sign in with Google. Please try again or use email sign-in.',
            [
              { text: 'Try Again', onPress: () => signInWithGoogle() },
              { text: 'Use Email', onPress: () => setShowEmailModal(true) },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        } else {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          console.log('✅  Google OAuth successful!', { duration: `${duration}ms` });
          // addBreadcrumb({
          //   message: 'Google OAuth completed successfully',
          //   category: 'auth',
          //   level: 'info',
          //   data: {
          //     duration: `${duration}ms`,
          //     endTime: new Date().toISOString(),
          //   },
          // });
          
          // Log performance metrics
          // addBreadcrumb({
          //   message: 'Google sign-in performance metrics',
          //   category: 'performance',
          //   level: 'info',
          //   data: {
          //     totalDuration: duration,
          //     startTime: new Date(startTime).toISOString(),
          //     endTime: new Date(endTime).toISOString(),
          //   },
          // });
          
          // Session is automatically set by the deep link flow
          // Auth state listener will update the user
        }
      } catch (error: any) {
        console.error('❌  Google OAuth error:', error);
        
        // Log error with context
        // captureException(error, {
        //   tags: {
        //     component: 'AuthContext',
        //     method: 'signInWithGoogle',
        //   },
        //   extra: {
        //     platform: Platform.OS,
        //     timestamp: new Date().toISOString(),
        //   },
        // });
        
        // Handle user cancellation gracefully
        if (error.message?.includes('User cancelled') || error.message?.includes('cancelled')) {
          console.log('👤  User cancelled OAuth flow');
          // addBreadcrumb({
          //   message: 'User cancelled OAuth flow',
          //   category: 'auth',
          //   level: 'info',
          // });
          return;
        }
        
        Alert.alert(
          'Authentication Error',
          error.message || 'Failed to sign in with Google. Please try again.',
          [
            { text: 'Try Again', onPress: () => signInWithGoogle() },
            { text: 'Use Email', onPress: () => setShowEmailModal(true) },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } finally {
        setLoading(false);
        
        console.log('🏁  Google sign-in flow completed');
        // addBreadcrumb({
        //   message: 'Google sign-in flow completed',
        //   category: 'auth',
        //   level: 'info',
        // });
      }
  };

  const signInWithEmail = async (email: string, password: string) => {
    console.log('📧 Signing in with email:', email);
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Sign in error:', error.message);
        Alert.alert('Sign In Error', error.message);
        throw error;
      }
      
      if (data.user) {
        console.log('✅ Successfully signed in:', data.user.email);
        setUser(data.user);
        setSession(data.session);
      }
    } catch (error: any) {
      console.error('❌ Sign in failed:', error);
      Alert.alert('Error', error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    console.log('📝 Signing up with email:', email);
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
          },
        },
      });
      
      if (error) {
        console.error('❌ Sign up error:', error.message);
        Alert.alert('Sign Up Error', error.message);
        throw error;
      }
      
      if (data.user) {
        console.log('✅ Successfully signed up:', data.user.email);
        
        // Check if email confirmation is required
        if (data.user.identities?.length === 0) {
          Alert.alert(
            'Confirmation Required',
            'Please check your email to confirm your account before signing in.'
          );
        } else {
          setUser(data.user);
          setSession(data.session);
        }
      }
    } catch (error: any) {
      console.error('❌ Sign up failed:', error);
      Alert.alert('Error', error.message || 'Failed to sign up');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithMagicLink = async (email: string) => {
    console.log('🔮 Sending magic link to:', email);
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: 'cryptoclips://auth/callback',
        },
      });
      
      if (error) {
        console.error('❌ Magic link error:', error.message);
        Alert.alert('Error', error.message);
        throw error;
      }
      
      console.log('✅ Magic link sent successfully');
      Alert.alert(
        'Check Your Email',
        'We\'ve sent you a magic link. Click the link in your email to sign in.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('❌ Magic link failed:', error);
      Alert.alert('Error', error.message || 'Failed to send magic link');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!emailInput.trim()) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      await signInWithMagicLink(emailInput.trim());
      setShowEmailModal(false);
      setEmailInput('');
    } catch (error) {
      console.error('Email sign-in failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('🚶‍♂️ Signing out...');
    setLoading(true);
    
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('✅ Successfully signed out');
      setUser(null);
      setSession(null);
      
      await AsyncStorage.removeItem('userPreferences');
      await AsyncStorage.removeItem('demoUser');
    } catch (error: any) {
      console.error('❌ Sign out exception:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signInWithMagicLink,
      signOut, 
      session,
      showEmailModal,
      setShowEmailModal,
    }}>
      {children}
      
      {/* Email Input Modal (Fallback) */}
      <Modal
        visible={showEmailModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEmailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sign in with Google</Text>
            <Text style={styles.modalSubtitle}>
              Enter your Gmail address to receive a magic link
            </Text>
            
            <TextInput
              style={styles.emailInput}
              placeholder="Enter your email"
              placeholderTextColor="#666"
              value={emailInput}
              onChangeText={setEmailInput}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEmailModal(false);
                  setEmailInput('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleEmailSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Send Magic Link</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1F3A',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 24,
    textAlign: 'center',
  },
  emailInput: {
    backgroundColor: '#0A0E27',
    borderRadius: 8,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2A2F4A',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#2A2F4A',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});