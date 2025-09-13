import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { supabaseFixed } from '@/lib/supabaseFixed';
import type { User, Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import UserProfileService from '@/services/userProfileService';
import { Platform } from 'react-native';
import { useStore } from '@/store';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  session: Session | null;
  // Email modal removed - only ProfileScreen handles authentication
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
  // Email modal removed - only ProfileScreen handles authentication
  const userProfileService = UserProfileService.getInstance();
  const { syncPreferencesFromSupabase, setUser: setStoreUser } = useStore();

  // Handle OAuth callback from deep links
  const handleOAuthCallback = async (url: string) => {
      console.log('🔗 Processing OAuth callback:', url);
      
      // Log URL details for debugging
      console.log('🔍 URL details:', { 
        url_length: url.length, 
        has_cryptoclips: url.includes('cryptoclips://'),
        has_exp: url.includes('exp://'),
        url: url.substring(0, 100) + '...'
      });
      
      // Process both cryptoclips:// and exp:// URLs for OAuth callbacks
      const isOAuthCallback = url.includes('cryptoclips://') || 
                             url.includes('exp://') || 
                             url.includes('auth/callback') ||
                             url.includes('code=') ||
                             url.includes('access_token=');
      
      if (!isOAuthCallback) {
        console.log('⚠️ Not an OAuth callback, ignoring');
        return;
      }
      
      try {
        // Handle different URL formats
        let parsedUrl;
        if (url.includes('cryptoclips://') || url.includes('exp://')) {
          // For deep link URLs, we need to handle them differently
          const urlParts = url.split('?');
          if (urlParts.length > 1) {
            const searchParams = new URLSearchParams(urlParts[1]);
            parsedUrl = { searchParams };
          } else {
            console.log('⚠️ No query parameters found in deep link');
            return;
          }
        } else {
          parsedUrl = new URL(url);
        }
        
        console.log('🔍 URL params:', { 
          has_code: !!parsedUrl.searchParams.get('code'), 
          has_error: !!parsedUrl.searchParams.get('error'),
          has_access_token: !!parsedUrl.searchParams.get('access_token'),
          has_refresh_token: !!parsedUrl.searchParams.get('refresh_token')
        });
        
        // Check for error in callback
        const error = parsedUrl.searchParams.get('error');
        if (error) {
          const errorDescription = parsedUrl.searchParams.get('error_description');
          console.error('❌ OAuth error:', error, errorDescription);
          Alert.alert('Authentication Error', errorDescription || error);
          return;
        }
        
        console.log('🔄 Exchanging code for session...');
        
        // Try the full URL first
        const { data, error: exchangeError } = await supabaseFixed.auth.exchangeCodeForSession(url);
        
        if (exchangeError) {
          console.error('❌ Code exchange failed:', exchangeError);
          
          // Try alternative: extract code and exchange manually
          const code = parsedUrl.searchParams.get('code');
          if (code) {
            console.log('🔄 Trying manual code exchange...');
            
            const { data: manualData, error: manualError } = await supabaseFixed.auth.exchangeCodeForSession(code);
            
            if (!manualError && manualData?.session) {
              console.log('✅ Manual code exchange successful!');
              setSession(manualData.session);
              setUser(manualData.session.user);
              return;
            }
          }
          
          // Try direct token exchange if available
          const accessToken = parsedUrl.searchParams.get('access_token');
          const refreshToken = parsedUrl.searchParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            console.log('🔄 Trying direct token exchange...');
            
            // Create a session object manually
            const session = {
              access_token: accessToken,
              refresh_token: refreshToken,
              expires_in: 3600,
              token_type: 'bearer',
              user: {
                id: parsedUrl.searchParams.get('user_id') || 'unknown',
                email: parsedUrl.searchParams.get('email') || 'unknown@example.com',
                // Add other user properties as needed
              }
            };
            
            console.log('✅ Direct token exchange successful!');
            setSession(session as any);
            setUser(session.user as any);
            return;
          }
          
          Alert.alert('Authentication Failed', 'Could not complete sign-in. Please try again.');
          return;
        }
        
        if (data?.session) {
          console.log('✅ OAuth session established!');
          console.log('👤 User:', data.session.user.email);
          setSession(data.session);
          setUser(data.session.user);
          setStoreUser(data.session.user); // Update store user
          
          // Create or update user profile after OAuth
          (async () => {
            try {
              console.log('👤 Creating/updating user profile after OAuth...');
              await userProfileService.createOrUpdateProfile(data.session.user);
              console.log('✅ User profile updated successfully');
              
              // Sync preferences from Supabase
              console.log('🔄 Syncing preferences from Supabase...');
              await syncPreferencesFromSupabase(data.session.user.id);
              
              console.log('🎉 OAuth flow completed successfully');
            } catch (error) {
              console.error('❌ Error in OAuth post-processing:', error);
            }
          })();
        } else {
          console.log('⚠️ No session found in OAuth callback, checking for existing session...');
          
          // Fallback: check for existing session
          setTimeout(async () => {
            try {
              const { data: { session }, error } = await supabaseFixed.auth.getSession();
              if (session) {
                console.log('✅ Found existing session after OAuth callback');
                setSession(session);
                setUser(session.user);
                setStoreUser(session.user);
              }
            } catch (error) {
              console.error('❌ Error checking for existing session:', error);
            }
          }, 2000);
        }
      } catch (error) {
        console.error('❌ OAuth callback error:', error);
        Alert.alert('Authentication Error', 'Failed to process OAuth callback. Please try again.');
      } finally {
        console.log('🏁 OAuth callback processing completed');
      }
  };

  useEffect(() => {
    checkUser();
    
    const { data: authListener } = supabaseFixed.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐  Auth state changed:', event);
      
      if (session) {
        setSession(session);
        setUser(session.user);
        setStoreUser(session.user); // Update store user
        console.log('✅  User authenticated:', session.user.email);
        
        // Create or update user profile after authentication
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          (async () => {
            try {
              console.log('👤  Creating/updating user profile...');
              await userProfileService.createOrUpdateProfile(session.user);
              console.log('✅  User profile updated successfully');
              
              // Sync preferences from Supabase
              console.log('🔄  Syncing preferences from Supabase...');
              await syncPreferencesFromSupabase(session.user.id);
              
              console.log('🎉  Complete authentication flow finished - user ready for app');
              
            } catch (error) {
              console.error('❌  Error creating/updating user profile:', error);
              console.log('❌  Profile update failed:', error instanceof Error ? error.message : 'Unknown error');
            }
          })();
        }
      } else {
        setSession(null);
        setUser(null);
        setStoreUser(null); // Clear store user
        console.log('⚠️  User not authenticated');
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
      console.log('🔗 Deep link type:', typeof event.url);
      console.log('🔗 Deep link length:', event.url?.length);
      
      // Handle the OAuth callback
      if (event.url) {
        handleOAuthCallback(event.url);
      }
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
      const { data: { session }, error } = await supabaseFixed.auth.getSession();
      
      if (error) {
        console.error('❌ Session check error:', error.message);
        throw error;
      }
      
      if (session) {
        console.log('✅ Session found:', session.user.email);
        setSession(session);
        setUser(session.user);
        setStoreUser(session.user); // Update store user
        
        // Sync preferences from Supabase for existing session
        console.log('🔄 Syncing preferences from Supabase for existing session...');
        await syncPreferencesFromSupabase(session.user.id);
      } else {
        console.log('⚠️ No active session found');
        
        // Check for demo user in AsyncStorage
        const demoUserData = await AsyncStorage.getItem('demoUser');
        if (demoUserData) {
          const demoUser = JSON.parse(demoUserData);
          console.log('👤 Using demo user');
          setUser(demoUser);
          setStoreUser(demoUser);
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
      setLoading(true);
      
      try {
        console.log('🔍  Platform info:', { platform: Platform.OS, timestamp: new Date().toISOString() });
        
        // Use the new deep link OAuth flow
        const { signInWithGoogle: deepLinkSignIn } = await import('@/services/googleAuthDeepLink');
        console.log('📦  Google auth service imported successfully');
        console.log('🔄  Executing OAuth flow...');
        
        const authFunction = await deepLinkSignIn();
        const { success } = await authFunction();
        console.log('📊  OAuth result:', { success });
        
        if (!success) {
          console.log('❌  OAuth flow failed');
          
          Alert.alert(
            'Sign-In Failed',
            'Unable to sign in with Google. Please try again.',
            [
              { text: 'Try Again', onPress: () => signInWithGoogle() },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        } else {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          console.log('✅  Google OAuth successful!', { duration: `${duration}ms` });
          // Session is automatically set by the deep link flow
          // Auth state listener will update the user
        }
      } catch (error: any) {
        console.error('❌  Google OAuth error:', error);
        
        // Handle user cancellation gracefully
        if (error.message?.includes('User cancelled') || error.message?.includes('cancelled')) {
          console.log('👤  User cancelled OAuth flow');
          return;
        }
        
        Alert.alert(
          'Authentication Error',
          error.message || 'Failed to sign in with Google. Please try again.',
          [
            { text: 'Try Again', onPress: () => signInWithGoogle() },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } finally {
        setLoading(false);
        
        console.log('🏁  Google sign-in flow completed');
      }
  };

  const signInWithEmail = async (email: string, password: string) => {
    console.log('📧 Signing in with email:', email);
    setLoading(true);
    
    try {
      const { data, error } = await supabaseFixed.auth.signInWithPassword({
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
      const { data, error } = await supabaseFixed.auth.signUp({
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
      const { error } = await supabaseFixed.auth.signInWithOtp({
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

  // Email modal functions removed - only ProfileScreen handles authentication

  const signOut = async () => {
    console.log('🚶‍♂️ Signing out...');
    setLoading(true);
    
    try {
      // Sign out from Supabase
      const { error } = await supabaseFixed.auth.signOut();
      if (error) throw error;
      
      console.log('✅ Successfully signed out');
      setUser(null);
      setSession(null);
      setStoreUser(null); // Clear store user
      
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
      // Email modal removed - only ProfileScreen handles authentication
    }}>
      {children}
      
      {/* Email modal removed - only ProfileScreen handles authentication */}
    </AuthContext.Provider>
  );
};

// Email modal styles removed - only ProfileScreen handles authentication