import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
  id: string;
  email?: string;
  username?: string;
  avatar_url?: string;
  created_at?: string;
}

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Sign up with email and password
  async signUp(email: string, password: string, username?: string): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.user_metadata?.username,
          avatar_url: data.user.user_metadata?.avatar_url,
          created_at: data.user.created_at,
        };
        return { user: authUser, error: null };
      }

      return { user: null, error: 'Sign up failed' };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { user: null, error: error.message || 'Sign up failed' };
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.user_metadata?.username,
          avatar_url: data.user.user_metadata?.avatar_url,
          created_at: data.user.created_at,
        };
        return { user: authUser, error: null };
      }

      return { user: null, error: 'Sign in failed' };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { user: null, error: error.message || 'Sign in failed' };
    }
  }

  // Sign out
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }
      
      // Clear any local storage
      await AsyncStorage.removeItem('userPreferences');
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error: error.message || 'Sign out failed' };
    }
  }

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username,
        avatar_url: user.user_metadata?.avatar_url,
        created_at: user.created_at,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Get session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Get session error:', error);
        return null;
      }
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(updates: { username?: string; avatar_url?: string }): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { error: error.message || 'Update failed' };
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'cryptoclips://reset-password',
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { error: error.message || 'Reset password failed' };
    }
  }

  // Update password
  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Update password error:', error);
      return { error: error.message || 'Update password failed' };
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email,
          username: session.user.user_metadata?.username,
          avatar_url: session.user.user_metadata?.avatar_url,
          created_at: session.user.created_at,
        };
        callback(authUser);
      } else {
        callback(null);
      }
    });
  }

  // Sign in anonymously (for demo purposes)
  async signInAnonymously(): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      // Generate a demo user ID
      let demoUserId = await AsyncStorage.getItem('demoUserId');
      if (!demoUserId) {
        demoUserId = 'demo-user-' + Math.random().toString(36).substr(2, 9);
        await AsyncStorage.setItem('demoUserId', demoUserId);
      }

      const demoUser: AuthUser = {
        id: demoUserId,
        email: `${demoUserId}@demo.com`,
        username: 'Demo User',
        created_at: new Date().toISOString(),
      };

      // Store demo user in AsyncStorage
      await AsyncStorage.setItem('demoUser', JSON.stringify(demoUser));

      return { user: demoUser, error: null };
    } catch (error: any) {
      console.error('Sign in anonymously error:', error);
      return { user: null, error: error.message || 'Anonymous sign in failed' };
    }
  }

  // Check if user is demo user
  async isDemoUser(): Promise<boolean> {
    try {
      const demoUser = await AsyncStorage.getItem('demoUser');
      return !!demoUser;
    } catch (error) {
      return false;
    }
  }
}