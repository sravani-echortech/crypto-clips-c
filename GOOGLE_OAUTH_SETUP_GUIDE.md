# Complete Google OAuth Setup Guide with Supabase

## Prerequisites
- Supabase project with Google provider enabled
- Google Cloud Console account
- Expo/React Native project

## Step 1: Google Cloud Console Setup

### 1.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**

### 1.2 Configure OAuth Client

**For Web Application:**
```
Application type: Web application
Name: CryptoClips Web

Authorized JavaScript origins:
- http://localhost:19006
- http://localhost:3000
- https://your-production-domain.com

Authorized redirect URIs:
- https://jmwggzasoikndnpwkrca.supabase.co/auth/v1/callback
- http://localhost:19006/auth/callback
- cryptoclips://auth/callback
```

**For Mobile Application (Android):**
```
Application type: Android
Name: CryptoClips Android
Package name: com.yourcompany.cryptoclips
SHA-1 certificate fingerprint: [Your SHA-1]
```

**For Mobile Application (iOS):**
```
Application type: iOS
Name: CryptoClips iOS
Bundle ID: com.yourcompany.cryptoclips
```

### 1.3 Save Credentials
Copy your:
- **Client ID**: `YOUR_GOOGLE_CLIENT_ID`
- **Client Secret**: `YOUR_GOOGLE_CLIENT_SECRET`

## Step 2: Supabase Configuration

### 2.1 Enable Google Provider

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click **Enable**
4. Add your credentials:
   - **Client ID**: `YOUR_GOOGLE_CLIENT_ID`
   - **Client Secret**: `YOUR_GOOGLE_CLIENT_SECRET`
5. Click **Save**

### 2.2 Configure Redirect URLs

In Supabase Dashboard → **Authentication** → **URL Configuration**:

```
Site URL: http://localhost:19006
Redirect URLs:
- cryptoclips://auth/callback
- http://localhost:19006/auth/callback
- http://localhost:3000/auth/callback
- https://your-production-domain.com/auth/callback
```

## Step 3: Environment Variables

### 3.1 Create/Update `.env` file

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://jmwggzasoikndnpwkrca.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth (optional, for native sign-in)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_google_ios_client_id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_google_android_client_id
```

## Step 4: App Configuration

### 4.1 Update `app.json`

```json
{
  "expo": {
    "scheme": "cryptoclips",
    "ios": {
      "bundleIdentifier": "com.yourcompany.cryptoclips",
      "config": {
        "googleSignIn": {
          "reservedClientId": "YOUR_GOOGLE_IOS_CLIENT_ID"
        }
      }
    },
    "android": {
      "package": "com.yourcompany.cryptoclips",
      "config": {
        "googleSignIn": {
          "apiKey": "YOUR_ANDROID_API_KEY",
          "certificateHash": "YOUR_CERTIFICATE_HASH"
        }
      }
    }
  }
}
```

### 4.2 Deep Link Configuration

The app is already configured to handle deep links with the scheme `cryptoclips://`

## Step 5: Implementation

### 5.1 Using the Google Auth Service

```typescript
import googleAuthService from '@/services/googleAuthService';

// Sign in
const handleGoogleSignIn = async () => {
  try {
    const result = await googleAuthService.signInWithGoogle();
    if (result.success) {
      console.log('User signed in successfully');
    }
  } catch (error) {
    console.error('Sign in failed:', error);
  }
};

// Sign out
const handleSignOut = async () => {
  await googleAuthService.signOut();
};

// Check if signed in
const isSignedIn = await googleAuthService.isSignedIn();
```

### 5.2 Using AuthContext (Recommended)

```typescript
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { signInWithGoogle, signOut, user } = useAuth();
  
  return (
    <Button onPress={signInWithGoogle} title="Sign in with Google" />
  );
};
```

## Step 6: Testing

### 6.1 Local Development (Expo Go)

1. Start the development server:
   ```bash
   npm start
   ```

2. Open in Expo Go app
3. Test Google sign-in (will use web OAuth flow)

### 6.2 Development Build

For native Google Sign-In module:

```bash
# Create development build
npx expo prebuild
npx expo run:android
# or
npx expo run:ios
```

### 6.3 Production Build

```bash
# Using EAS Build
eas build --platform all
```

## Troubleshooting

### Common Issues and Solutions

1. **"Invalid redirect URL"**
   - Add the URL to Supabase Dashboard → Authentication → URL Configuration
   - Add the URL to Google Console → Authorized redirect URIs

2. **"User cancelled the sign-in"**
   - This is normal when user closes the browser
   - Handle gracefully in your code

3. **Deep link not working**
   - Ensure `scheme` in `app.json` matches your redirect URL
   - For Android, check AndroidManifest.xml has the intent filter
   - For iOS, check Info.plist has the URL scheme

4. **Session not persisting**
   - Check AsyncStorage is properly configured
   - Ensure `persistSession: true` in Supabase client

5. **"Google Sign-In not available"**
   - This happens in Expo Go (expected)
   - Create a development build for native module support

## Security Best Practices

1. **Never commit credentials**
   - Use environment variables
   - Add `.env` to `.gitignore`

2. **Validate redirect URLs**
   - Only add trusted domains
   - Use HTTPS in production

3. **Token handling**
   - Let Supabase handle token refresh
   - Don't store tokens manually

4. **Rate limiting**
   - Implement rate limiting for auth endpoints
   - Use Supabase's built-in protections

## Production Checklist

- [ ] Production Google OAuth credentials created
- [ ] Production redirect URLs configured
- [ ] Environment variables set in production
- [ ] Deep links tested on real devices
- [ ] Error handling implemented
- [ ] Analytics tracking added
- [ ] Privacy policy updated
- [ ] Terms of service updated

## Support Links

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Expo Authentication Guide](https://docs.expo.dev/guides/authentication/)
- [React Native Deep Linking](https://reactnative.dev/docs/linking)