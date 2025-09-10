# Test Authentication Now

## Your New Client Secret is Active!

Client Secret: `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` ✅

## Quick Test Steps

### 1. Test Direct Link (Do This First!)
Open this in your phone's browser:
```
https://jmwggzasoikndnpwkrca.supabase.co/auth/v1/authorize?provider=google
```

**What should happen:**
- ✅ **If it opens Google sign-in**: Configuration is fixed! 
- ❌ **If you get 500 error**: Still configuration issue (see below)

### 2. Test in App

```bash
# Restart Expo with clean cache
npx expo start -c
```

On your phone:
1. Clear browser cookies
2. Open Expo Go
3. Try "Sign in with Google"

### 3. Expected Flow

1. Tap "Sign in with Google"
2. Browser opens
3. Sign in with your Google account
4. You'll see success page
5. Return to Expo Go
6. Wait 2-5 seconds
7. You're logged in!

## If Still Getting 500 Error

### Option A: The Client ID might be wrong too

Check in Supabase Dashboard → Authentication → Providers → Google:
- **Client ID** should end with `.apps.googleusercontent.com`
- Example: `1234567890-abc123.apps.googleusercontent.com`

### Option B: Google API not enabled

In Google Cloud Console:
1. Go to "APIs & Services" → "Library"
2. Search for "Google Identity Toolkit API"
3. Click and Enable it
4. Wait 2 minutes
5. Try again

### Option C: Use Magic Link (Guaranteed to Work)

If Google still fails, the app has magic link:
1. When error appears, choose "Use Magic Link"
2. Enter your email
3. Check email for link
4. Click to sign in

## Debug Logs to Check

When you try signing in, look for these in console:

**Good signs:**
```
✅ OAuth URL received: https://...
✅ Session found!
✅ User: your-email@gmail.com
```

**Bad signs:**
```
❌ OAuth initialization error: 500
❌ unexpected failure
```

## Current Status Check

The app now uses `SimpleGoogleAuth` which:
1. Bypasses some Supabase complexity
2. Adds cache-busting timestamp
3. Polls for session for 60 seconds
4. Has fallback to magic link

## If Everything Else Fails

Create a test account directly:
```javascript
// In your app console
const quickTest = async () => {
  const { data, error } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'Test123!'
  });
  console.log('Result:', data, error);
};
```

---

**The new Client Secret should work now. Give it 2-3 minutes to propagate, then test!**