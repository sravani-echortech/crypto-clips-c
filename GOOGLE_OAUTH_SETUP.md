# Google OAuth Setup Guide for CryptoClips

## Important: Supabase Dashboard Configuration

### 1. Enable Google OAuth in Supabase
1. Go to https://supabase.com/dashboard/project/jmwggzasoikndnpwkrca/auth/providers
2. Find "Google" in the list of providers
3. Toggle it ON
4. You'll need to add your Google OAuth credentials (see section 2)

### 2. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click and Enable it

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: **Web application**
   - Name: "CryptoClips OAuth"
   - Authorized JavaScript origins:
     - `https://jmwggzasoikndnpwkrca.supabase.co`
   - Authorized redirect URIs:
     - `https://jmwggzasoikndnpwkrca.supabase.co/auth/v1/callback`
   - Click "Create"

5. Copy the Client ID and Client Secret

### 3. Add Credentials to Supabase
1. Go back to Supabase Dashboard
2. In the Google provider settings, add:
   - **Client ID**: Your Google OAuth client ID
   - **Client Secret**: Your Google OAuth client secret
3. Save the settings

### 4. Configure Redirect URLs in Supabase
1. Still in Supabase Dashboard
2. Go to Authentication > URL Configuration
3. Add these to "Redirect URLs" (IMPORTANT - add ALL of these):
   ```
   https://auth.expo.io/@your-expo-username/crypto-clips
   exp://localhost:8081
   exp://localhost:8082
   exp://localhost:8083
   exp://192.168.0.104:8081
   exp://192.168.0.104:8082
   exp://192.168.0.104:8083
   cryptoclips://auth
   cryptoclips://
   ```
   
   **Note**: Replace `192.168.0.104` with your actual local IP address (shown in Expo when you start the app)
   
4. Save the configuration

## Testing the OAuth Flow

### For Development (Expo Go):
The app uses `useProxy: true` which routes through Expo's auth proxy. This should work automatically.

### For Production:
1. Build a standalone app
2. The `cryptoclips://auth` URL scheme will be used
3. Make sure this is added to Supabase redirect URLs

## Troubleshooting

### "OAuth flow was dismissed" error
- Make sure you've enabled Google provider in Supabase
- Verify all redirect URLs are added to Supabase
- Check that Google OAuth credentials are correctly added

### "Invalid redirect_uri" error
- Add the exact redirect URL shown in the error to both:
  - Google Cloud Console authorized redirect URIs
  - Supabase redirect URLs

### Session not persisting
- Check that AsyncStorage is working properly
- Verify Supabase client configuration

## Current Configuration
- **Supabase URL**: https://jmwggzasoikndnpwkrca.supabase.co
- **URL Scheme**: cryptoclips
- **Expo Auth Proxy**: Enabled for development