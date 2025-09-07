import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { Ionicons } from '@expo/vector-icons';
import UserProfileService from '@/services/userProfileService';
import OAuthHandler from '@/services/oauthHandler';
import GoogleSignInService from '@/services/googleSignInService';
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

  useEffect(() => {
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event);
      
      if (session) {
        setSession(session);
        setUser(session.user);
        console.log('✅ User authenticated:', session.user.email);
        
        // Create or update user profile after authentication
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          try {
            await userProfileService.createOrUpdateProfile(session.user);
          } catch (error) {
            console.error('Error creating/updating user profile:', error);
          }
        }
      } else {
        setSession(null);
        setUser(null);
        console.log('⚠️ User not authenticated');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
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
    console.log('🚀 Google sign-in requested');
    setLoading(true);
    
    try {
      // Check if native Google Sign-In is available
      const googleSignInService = GoogleSignInService;
      
      if (Platform.OS !== 'web' && googleSignInService.isAvailable()) {
        // Use native Google Sign-In for mobile platforms when available
        const result = await googleSignInService.signIn();
        
        if (result) {
          console.log('✅ Native Google sign-in successful, authenticating with Supabase...');
          
          // Authenticate with Supabase using the ID token
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: result.idToken,
          });
          
          if (error) {
            console.error('❌ Supabase authentication failed:', error);
            throw error;
          }
          
          console.log('✅ Supabase authentication successful');
          // The auth state change listener will handle setting the user and session
        } else {
          console.log('⚠️ Google sign-in was cancelled');
        }
      } else {
        // Fallback to OAuth flow for web or when native module is not available
        console.log('📱 Using OAuth flow (native module not available or on web)');
        const oauthHandler = OAuthHandler.getInstance();
        
        if (!oauthHandler.isSupported()) {
          // Show email sign-in modal as fallback
          console.log('⚠️ OAuth not supported, falling back to email sign-in');
          Alert.alert(
            'Sign-In Not Available',
            'Google Sign-In requires a custom development build. Please use email sign-in instead.',
            [{ text: 'OK', onPress: () => setShowEmailModal(true) }]
          );
          return;
        }
        
        const result = await oauthHandler.signInWithGoogle();
        
        if (result) {
          console.log('✅ OAuth sign-in completed successfully');
        } else {
          console.log('⚠️ OAuth sign-in was cancelled');
        }
      }
      
    } catch (error: any) {
      console.error('❌ Google sign-in failed:', error);
      Alert.alert('Google Sign-In Error', error.message || 'Failed to sign in with Google');
      throw error;
    } finally {
      setLoading(false);
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
      // Sign out from Google if using native sign-in
      if (Platform.OS !== 'web') {
        const googleSignInService = GoogleSignInService.getInstance();
        await googleSignInService.signOut();
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error.message);
        Alert.alert('Sign Out Error', error.message);
        throw error;
      }
      
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