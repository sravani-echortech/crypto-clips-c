# Google OAuth 500 Error - Complete Solution

## The Problem
Even with correct Client ID and Secret, you're getting:
```
code: 500
error_code: unexpected_failure
```

## Root Causes (In Order of Likelihood)

### 1. ❌ Wrong OAuth Client Type
**Most common issue!** Your Google OAuth client must be type **"Web application"**, not Android/iOS.

**Check in Google Console:**
- APIs & Services → Credentials → Your OAuth Client
- **Application type** must say: "Web application"
- If it says "Android" or "iOS", that's the problem!

**Fix:**
1. Create NEW OAuth 2.0 Client ID
2. Choose type: **Web application**
3. Add redirect URI: `https://jmwggzasoikndnpwkrca.supabase.co/auth/v1/callback`
4. Copy new Client ID and Secret to Supabase

### 2. ❌ Google API Not Enabled
**Fix:**
1. Go to Google Cloud Console
2. APIs & Services → Library
3. Search and enable: **"Identity Toolkit API"**
4. Also enable: **"Google+ API"** (if available)
5. Wait 5 minutes for it to activate

### 3. ❌ OAuth Consent Screen Issue
**Fix:**
1. APIs & Services → OAuth consent screen
2. Ensure it's configured with:
   - User type: External
   - Publishing status: Testing (OK for development)
   - Test users: Add your email

### 4. ❌ Redirect URI Mismatch
The redirect URI in Google Console must be EXACTLY:
```
https://jmwggzasoikndnpwkrca.supabase.co/auth/v1/callback
```
Not `/auth/callback` or any variation!

## Immediate Workaround - Use Quick Auth

The app now has **Quick Demo Account** button that:
1. Creates account instantly
2. No email verification needed
3. Works immediately
4. Bypasses Google completely

**To use:**
1. Restart app: `npx expo start -c`
2. Tap **"Quick Demo Account"** (green button)
3. You're signed in!

## Test What's Actually Wrong

### Test 1: Check if it's Supabase or Google
```javascript
// Run this in browser console
fetch('https://jmwggzasoikndnpwkrca.supabase.co/auth/v1/health')
  .then(r => r.json())
  .then(console.log);
```
Should return `{"healthy":true}`

### Test 2: Try Different Provider
In Supabase Dashboard, enable GitHub or Discord provider and test if those work.
If they work, it's specifically a Google configuration issue.

### Test 3: Check Supabase Logs
Supabase Dashboard → Logs → Auth Logs
Look for the actual error message from Google.

## Nuclear Option - Reset Everything

If nothing works:

### 1. Create New Google OAuth Client
```
1. Delete current OAuth client in Google Console
2. Create new Web Application client
3. Add redirect URI
4. Copy Client ID and Secret
```

### 2. Clear Supabase Provider
```
1. In Supabase: Disable Google provider
2. Save
3. Re-enable Google provider
4. Add new Client ID and Secret
5. Save
```

### 3. Wait and Test
```
1. Wait 5 minutes
2. Clear all browser data
3. Test direct link:
   https://jmwggzasoikndnpwkrca.supabase.co/auth/v1/authorize?provider=google
```

## Alternative Solutions Ready Now

### Option 1: Magic Link (Email)
```javascript
await supabase.auth.signInWithOtp({
  email: 'your@email.com'
});
```

### Option 2: Password Account
```javascript
await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'TestPassword123!'
});
```

### Option 3: Quick Demo (Already Implemented)
Just tap the green "Quick Demo Account" button!

## Contact Supabase Support

If still failing, email Supabase support with:
- Project ref: `jmwggzasoikndnpwkrca`
- Error: 500 unexpected_failure on Google OAuth
- Your Client ID (not secret)
- Screenshot of your Google Console redirect URIs

They can check server logs for the exact error.

## Current App Status

The app now has multiple fallbacks:
1. **Quick Demo Account** - Works instantly
2. **Magic Link** - Email authentication
3. **Local Mode** - Use without authentication

You can use the app immediately with these alternatives while fixing Google OAuth!