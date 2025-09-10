# Fixing Google OAuth Loop in Expo Go

## The Problem
When testing Google OAuth in Expo Go, you're experiencing a redirect loop because:
1. Expo Go uses `exp://` URLs, not custom schemes like `cryptoclips://`
2. The OAuth callback can't return to Expo Go properly
3. Supabase needs a proper redirect URL that works with your development environment

## The Solution

### Step 1: Update Supabase Dashboard

Go to your [Supabase Dashboard](https://app.supabase.com/) and add these redirect URLs:

1. **Authentication → URL Configuration → Redirect URLs**

Add ALL of these URLs:
```
https://jmwggzasoikndnpwkrca.supabase.co/auth/v1/callback
http://localhost:3000/**
http://localhost:19006/**
exp://localhost:8082/**
exp://192.168.0.223:8082/**
cryptoclips://auth/callback
```

### Step 2: Configure Site URL

In the same section, set:
- **Site URL**: `http://localhost:19006`

### Step 3: Update Google Cloud Console

Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Your OAuth Client

Add these **Authorized redirect URIs**:
```
https://jmwggzasoikndnpwkrca.supabase.co/auth/v1/callback
http://localhost:19006
http://localhost:3000
```

### Step 4: Use the Updated Code

The code has been updated to:
1. Detect when running in Expo Go
2. Use `WebBrowser.openBrowserAsync()` instead of `openAuthSessionAsync()`
3. Check for session after browser closes

### Step 5: Test Authentication

1. **Clear your browser cookies** (especially for Google and Supabase)
2. **Restart Expo Go**
3. **Try signing in again**

## How It Works Now

1. When in Expo Go, the app opens Google sign-in in your default browser
2. After authentication, Supabase redirects to its own success page
3. You manually close the browser
4. The app checks for the session and logs you in

## Alternative Solutions

### Option 1: Use Email/Password Authentication in Development
```typescript
// For testing in Expo Go
await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'testpassword123'
});
```

### Option 2: Create a Development Build
```bash
# This gives you a custom app with proper deep linking
npx expo prebuild
npx expo run:android
# or
npx expo run:ios
```

### Option 3: Use Supabase Magic Link
```typescript
// Send magic link to email
await supabase.auth.signInWithOtp({
  email: 'your@email.com',
  options: {
    emailRedirectTo: 'http://localhost:19006'
  }
});
```

## Debugging Tips

1. **Check logs for redirect URL**:
   Look for: `📱 Generated redirect URL: ...`

2. **Verify session after sign-in**:
   ```typescript
   const { data: { session } } = await supabase.auth.getSession();
   console.log('Session:', session);
   ```

3. **Clear AsyncStorage if needed**:
   ```typescript
   await AsyncStorage.clear();
   ```

## Production Build

For production, create a standalone build:
```bash
eas build --platform android --profile preview
```

This will have proper deep linking and won't have the Expo Go limitations.

## Important Notes

- **Expo Go Limitation**: Expo Go doesn't support custom URL schemes
- **Deep Links**: Only work in standalone builds, not in Expo Go
- **Browser Tab**: The browser tab staying open is normal in Expo Go
- **Session Persistence**: Sessions are saved in AsyncStorage automatically