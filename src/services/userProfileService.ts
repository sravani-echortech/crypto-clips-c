import { supabaseFixed } from '@/lib/supabaseFixed';
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

export class UserProfileService {
  private static instance: UserProfileService;

  private constructor() {}

  static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
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

      const { error } = await supabaseFixed
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

  // Get user profile with preferences
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabaseFixed
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Update user preferences in Supabase
  async updateUserPreferences(userId: string, preferences: any): Promise<boolean> {
    try {
      const { error } = await supabaseFixed
        .from('profiles')
        .update({ 
          preferences: preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user preferences:', error);
        return false;
      }

      console.log('✅ User preferences updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  }

}

export default UserProfileService;




