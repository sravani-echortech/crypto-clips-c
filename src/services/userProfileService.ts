import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  preferences: any;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  following: {
    categories: string[];
    coins: string[];
    sources: string[];
  };
  notifications: {
    breaking: boolean;
    priceAlerts: boolean;
    digest: boolean;
    rewards: boolean;
    streaks: boolean;
  };
}

export class UserProfileService {
  private static instance: UserProfileService;

  private constructor() {}

  static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }

  // Get current user profile
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Save user preferences
  async saveUserPreferences(preferences: UserPreferences): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return false;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          preferences: preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving user preferences:', error);
        return false;
      }

      console.log('✅ User preferences saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return false;
    }
  }

  // Update user profile
  async updateUserProfile(updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return false;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating user profile:', error);
        return false;
      }

      console.log('✅ User profile updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  // Create or update user profile after OAuth sign-in
  async createOrUpdateProfile(user: User, additionalData?: any): Promise<boolean> {
    try {
      const profileData = {
        id: user.id,
        email: user.email,
        username: user.user_metadata?.name || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url,
        preferences: additionalData?.preferences || {},
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id',
        });

      if (error) {
        console.error('Error creating/updating user profile:', error);
        return false;
      }

      console.log('✅ User profile created/updated successfully');
      return true;
    } catch (error) {
      console.error('Error creating/updating user profile:', error);
      return false;
    }
  }

  // Delete user profile (for account deletion)
  async deleteUserProfile(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (error) {
        console.error('Error deleting user profile:', error);
        return false;
      }

      console.log('✅ User profile deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting user profile:', error);
      return false;
    }
  }
}

export default UserProfileService;
