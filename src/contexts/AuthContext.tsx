import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from 'react';
import { Alert, Platform, TextInput, Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

WebBrowser.maybeCompleteAuthSession();

const URL_SCHEME = 'cryptoclips';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  session: Session | null;
  showEmailModal: boolean;
  setShowEmailModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const initialLoadDoneRef = useRef(false);

  useEffect(() => {
    console.log('🔐 Setting up authentication listeners...');

    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        console.log('📱 Initial session check:', { 
          hasSession: !!currentSession, 
          userId: currentSession?.user?.id 
        });

        if (currentSession) {
          console.log('✅ Session found, setting user state');
          setSession(currentSession);
          setUser(currentSession.user);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (!initialLoadDoneRef.current) {
          console.log('✅ Initial auth check complete, setting loading to false');
          setLoading(false);
          initialLoadDoneRef.current = true;
        }
      }
    };

    initAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`🔄 Auth state change: ${event}`);
        console.log('📊 New session:', newSession?.user?.id);

        const eventUser = newSession?.user ?? null;
        
        setSession(newSession);
        setUser(eventUser);

        if (!initialLoadDoneRef.current) {
          console.log('✅ First auth event received, setting loading to false');
          setLoading(false);
          initialLoadDoneRef.current = true;
        }
        
        if (event === 'SIGNED_IN') {
          console.log('🎉 User signed in successfully:', eventUser?.id);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed for user:', eventUser?.id);
        }
      }
    );

    const timer = setTimeout(() => {
      if (!initialLoadDoneRef.current) {
        console.warn('⏰ Auth timeout: Forcing loading to false');
        setLoading(false);
        initialLoadDoneRef.current = true; 
      }
    }, 2500);

    return () => {
      console.log('🧹 Cleaning up auth listeners');
      authListener?.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    console.log('🔐 Signing in with email:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        throw error;
      }

      console.log('✅ Signed in successfully');
      return;
    } catch (error: any) {
      console.error('❌ Sign in failed:', error);
      Alert.alert('Sign In Error', error.message || 'Failed to sign in');
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    console.log('📝 Signing up with email:', email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign up error:', error);
        throw error;
      }

      if (data.user) {
        console.log('✅ Sign up successful, check email for verification');
        Alert.alert(
          'Check Your Email',
          'We sent you a verification link. Please check your email to verify your account.',
          [{ text: 'OK' }]
        );
      }
      return;
    } catch (error: any) {
      console.error('❌ Sign up failed:', error);
      Alert.alert('Sign Up Error', error.message || 'Failed to sign up');
      throw error;
    }
  };

  const signInWithMagicLink = async (email: string) => {
    console.log('✉️ Sending magic link to:', email);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        console.error('❌ Magic link error:', error);
        throw error;
      }

      console.log('✅ Magic link sent successfully');
      Alert.alert(
        'Check Your Email',
        `We've sent a magic link to ${email}. Click the link in your email to sign in.`,
        [{ text: 'OK' }]
      );
      return;
    } catch (error: any) {
      console.error('❌ Magic link failed:', error);
      Alert.alert('Error', error.message || 'Failed to send magic link');
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    console.log('🚀 Google sign-in requested');
    setShowEmailModal(true);
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
      
      {/* Email Input Modal */}
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
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleEmailSubmit}
                disabled={loading || !emailInput.trim()}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Sending...' : 'Send Link'}
                </Text>
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  submitButton: {
    backgroundColor: '#6366F1',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};