import { Platform } from 'react-native';

// Safe import - only import if module is available
let GoogleSignin: any = null;
let statusCodes: any = null;

// Try to import the native module, but don't fail if it's not available
try {
  const googleSignInModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSignInModule.GoogleSignin;
  statusCodes = googleSignInModule.statusCodes;
} catch (error) {
  console.log('⚠️ Google Sign-In native module not available. Using web fallback.');
}

class GoogleSignInService {
  private static instance: GoogleSignInService;
  private isConfigured: boolean = false;
  private isNativeAvailable: boolean = false;

  private constructor() {
    this.isNativeAvailable = GoogleSignin !== null;
  }

  static getInstance(): GoogleSignInService {
    if (!GoogleSignInService.instance) {
      GoogleSignInService.instance = new GoogleSignInService();
    }
    return GoogleSignInService.instance;
  }

  isAvailable(): boolean {
    return this.isNativeAvailable;
  }

  async configure() {
    if (!this.isNativeAvailable) {
      console.log('⚠️ Google Sign-In native module not available');
      return;
    }

    if (this.isConfigured) {
      console.log('🔧 Google Sign-In already configured');
      return;
    }

    try {
      console.log('🔧 Configuring Google Sign-In...');
      
      // Configure Google Sign-In
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 
                     '1047720936825-vkjv7bhtbkokjv0g8nnlncgd18dgbcus.apps.googleusercontent.com',
        offlineAccess: true,
        forceCodeForRefreshToken: true,
        iosClientId: Platform.OS === 'ios' ? 
                     (process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined) : undefined,
      });

      this.isConfigured = true;
      console.log('✅ Google Sign-In configured successfully');
    } catch (error) {
      console.error('❌ Failed to configure Google Sign-In:', error);
      // Don't throw, just log the error
    }
  }

  async signIn(): Promise<{ idToken: string; user: any } | null> {
    if (!this.isNativeAvailable) {
      console.log('⚠️ Google Sign-In native module not available. Please use web OAuth.');
      return null;
    }

    try {
      // Ensure configuration
      await this.configure();

      console.log('🚀 Starting native Google Sign-In...');
      
      // Check if already signed in
      const isSignedIn = await this.isSignedIn();
      if (isSignedIn) {
        console.log('📱 User already signed in, getting current user...');
        await GoogleSignin.signInSilently();
      } else {
        console.log('📱 Prompting user to sign in...');
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        await GoogleSignin.signIn();
      }

      // Get the ID token
      const tokens = await GoogleSignin.getTokens();
      const currentUser = await GoogleSignin.getCurrentUser();

      console.log('✅ Native Google Sign-In successful');
      console.log('👤 User:', currentUser?.user?.email);

      return {
        idToken: tokens.idToken,
        user: currentUser?.user || currentUser
      };
    } catch (error: any) {
      console.error('❌ Native Google Sign-In error:', error);
      
      if (statusCodes && error.code) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log('User cancelled the sign-in');
            break;
          case statusCodes.IN_PROGRESS:
            console.log('Sign-in already in progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log('Play services not available');
            break;
          default:
            console.error('Unknown error:', error);
        }
      }
      
      return null;
    }
  }

  async isSignedIn(): Promise<boolean> {
    if (!this.isNativeAvailable) {
      return false;
    }

    try {
      return await GoogleSignin.isSignedIn();
    } catch (error) {
      console.error('Error checking sign-in status:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    if (!this.isNativeAvailable) {
      console.log('⚠️ Google Sign-In native module not available');
      return;
    }

    try {
      await GoogleSignin.signOut();
      console.log('✅ Signed out from Google');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  async revokeAccess(): Promise<void> {
    if (!this.isNativeAvailable) {
      console.log('⚠️ Google Sign-In native module not available');
      return;
    }

    try {
      await GoogleSignin.revokeAccess();
      console.log('✅ Google access revoked');
    } catch (error) {
      console.error('Error revoking access:', error);
    }
  }
}

export default GoogleSignInService.getInstance();