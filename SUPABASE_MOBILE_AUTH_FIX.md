# Fix for Mobile Authentication with Expo Go

## The Problem
When testing on mobile with Expo Go, the authentication redirects to `localhost:19006` which doesn't exist on your phone. This causes the "site can't be reached" error.

## Immediate Fix - Update Supabase Dashboard

### Go to Supabase Dashboard → Authentication → URL Configuration

1. **Change Site URL to:**
   ```
   https://jmwggzasoikndnpwkrca.supabase.co
   ```
   (NOT localhost - use your Supabase project URL)

2. **Add these Redirect URLs:**
   ```
   https://jmwggzasoikndnpwkrca.supabase.co/**
   exp://192.168.0.223:8082/**
   exp://**
   ```

3. **Save the changes**

## Why This Works

- The Site URL is now a real URL that mobile browsers can access
- After Google auth, it redirects to Supabase's domain (which works on mobile)
- The app polls for the session and logs you in

## Testing Steps

1. **Clear Everything:**
   ```bash
   # Restart Expo
   npx expo start -c
   ```

2. **On Your Phone:**
   - Clear browser cookies/data
   - Force close and reopen Expo Go

3. **Sign In:**
   - Tap "Sign in with Google"
   - Complete authentication
   - You'll see Supabase success page (not localhost error)
   - Switch back to Expo Go
   - Wait a few seconds - you'll be logged in!

## Alternative: Manual Session Creation (Quick Test)

If you want to test quickly without fixing redirect:

1. **In Supabase Dashboard:**
   - Go to Authentication → Users
   - Click "Invite User"
   - Send invite to your email
   - Click the link and set password

2. **In App:**
   - Use email/password sign-in instead of Google

## Long-term Solution

Create a development build with proper deep linking:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure your project
eas build:configure

# Create development build
eas build --profile development --platform android

# Or for local build
npx expo run:android
```

This gives you a custom app that handles `cryptoclips://` URLs properly.

## Expected Flow After Fix

1. Tap Google sign-in
2. Browser opens → Sign in with Google
3. Redirects to Supabase success page (not localhost)
4. Return to Expo Go app
5. App detects session and logs you in

## Troubleshooting

**Still getting localhost error?**
- Make sure you saved the Supabase dashboard changes
- The Site URL must NOT be localhost
- Clear all browser data and try again

**Session not detected?**
- Wait up to 60 seconds after returning to app
- Check console logs for "Session found after OAuth!"
- Try refreshing the app

**Want to skip OAuth completely for testing?**
Use the magic link option:
```javascript
// In your app, use:
await supabase.auth.signInWithOtp({
  email: 'your@email.com'
});
```

The key is that Supabase's Site URL must be accessible from your mobile device!