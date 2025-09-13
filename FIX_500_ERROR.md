# Fix Supabase 500 Error - Google OAuth Configuration

## The Error
```
code: 500
error_code: unexpected_failure
msg: unexpected failure
```

This error occurs when there's a mismatch between Google OAuth and Supabase configuration.

## Root Causes & Solutions

### 1. Check Supabase Google Provider Settings

**Go to Supabase Dashboard → Authentication → Providers → Google**

Ensure you have:
- ✅ Google Provider **Enabled**
- ✅ **Client ID** (from Google Cloud Console)
- ✅ **Client Secret** (from Google Cloud Console)
- ✅ **Skip nonce check** = OFF (leave unchecked)

If any are missing, the 500 error will occur.

### 2. Verify Google Cloud Console Configuration

**Go to [Google Cloud Console](https://console.cloud.google.com/)**

1. **APIs & Services → Credentials → Your OAuth Client**

2. **Authorized redirect URIs must include:**
   ```
   https://jmwggzasoikndnpwkrca.supabase.co/auth/v1/callback
   ```
   (This EXACT URL - with YOUR project reference)

3. **OAuth consent screen:**
   - Publishing status: "Testing" is fine for development
   - Test users: Add your email

### 3. Fix URL Configuration in Supabase

**Supabase Dashboard → Authentication → URL Configuration**

```
Site URL: https://jmwggzasoikndnpwkrca.supabase.co

Redirect URLs:
- https://jmwggzasoikndnpwkrca.supabase.co/**
- https://jmwggzasoikndnpwkrca.supabase.co/auth/v1/callback
```

### 4. Quick Test Without Google OAuth

While fixing Google OAuth, you can test with these alternatives:

#### Option A: Magic Link (Easiest)
```javascript
// Already implemented - just enter any email
await supabase.auth.signInWithOtp({
  email: 'your@email.com'
});
```

#### Option B: Create Test Account
The app now has a diagnostic feature that creates test accounts:
1. Try Google sign-in
2. When it fails with 500 error
3. Select "Create Test Account"
4. Save the credentials shown

#### Option C: Direct Email/Password
```javascript
// Sign up
await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'TestPassword123!'
});

// Sign in
await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'TestPassword123!'
});
```

## Diagnostic Commands

Run these in your app to debug:

```javascript
import { supabaseFixed, testSupabaseConnection } from '@/lib/supabaseFixed';

// Test Supabase connection
await testSupabaseConnection();

// Check current session
const { data: { session } } = await supabaseFixed.auth.getSession();
console.log('Session:', session);
```

## Common Fixes

### If Client ID/Secret are correct but still failing:

1. **Regenerate Client Secret in Google Console**
   - APIs & Services → Credentials → OAuth 2.0 Client IDs
   - Click your client → "Reset Secret"
   - Copy new secret to Supabase

2. **Clear Supabase Cache**
   - Save settings with empty values
   - Wait 30 seconds
   - Re-enter correct values
   - Save again

3. **Check API Enablement**
   - In Google Cloud Console
   - APIs & Services → Enabled APIs
   - Ensure "Google+ API" or "Google Identity Toolkit API" is enabled

## Working Alternative - Use Supabase Auth UI

If Google OAuth continues to fail, use Supabase's hosted auth:

```javascript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: window.location.origin,
    // Use Supabase's hosted auth page
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    }
  }
});
```

## Test Your Fix

After making changes:

1. **Clear everything:**
   - Browser cookies
   - Expo cache: `npx expo start -c`
   - App data

2. **Test authentication:**
   - Try Google sign-in
   - If it works: ✅ Fixed!
   - If 500 error: Use magic link as fallback

## Need More Help?

1. **Check Supabase Logs:**
   - Dashboard → Logs → Auth Logs
   - Look for error details

2. **Enable Debug Mode:**
   ```javascript
   // In your supabase client
   const supabase = createClient(url, key, {
     auth: {
       debug: true // Add this
     }
   });
   ```

3. **Contact Supabase Support:**
   - Include your project reference: `jmwggzasoikndnpwkrca`
   - Include the full error message
   - They can check server logs

The 500 error is almost always a configuration mismatch between Google and Supabase!