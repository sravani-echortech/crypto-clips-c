# Debug Steps for 500 Error

## The Real Issue

The 500 error with message "unexpected failure" usually means one of these:

1. **Client Secret Mismatch** - Most common
2. **Redirect URL Mismatch** 
3. **Google API not enabled**
4. **OAuth Consent Screen Issue**

## Let's Debug Step by Step

### 1. Test Direct Browser Link

Open this URL directly in your phone's browser:
```
https://jmwggzasoikndnpwkrca.supabase.co/auth/v1/authorize?provider=google
```

If this works (opens Google sign-in), the issue is with the app's OAuth request.
If this also gives 500 error, it's definitely a Supabase/Google configuration issue.

### 2. Double-Check Client Secret

**This is the #1 cause of 500 errors!**

1. Go to Google Cloud Console → Credentials
2. Click your OAuth 2.0 Client ID
3. Click "RESET SECRET" to generate a new one
4. Copy the NEW secret
5. Go to Supabase Dashboard → Authentication → Providers → Google
6. Clear the Client Secret field completely
7. Paste the new secret
8. Save
9. **Wait 1 minute** (Supabase needs time to update)
10. Try again

### 3. Verify Exact Redirect URL

In Google Cloud Console, the redirect URL must be EXACTLY:
```
https://jmwggzasoikndnpwkrca.supabase.co/auth/v1/callback
```

Common mistakes:
- ❌ `https://jmwggzasoikndnpwkrca.supabase.co/auth/callback` (missing v1)
- ❌ `https://jmwggzasoikndnpwkrca.supabase.co/auth/v1/callback/` (trailing slash)
- ❌ `https://jmwggzasoikndnpwkrca.supabase.io/auth/v1/callback` (wrong domain)

### 4. Check Google API Status

In Google Cloud Console:
1. Go to "APIs & Services" → "Enabled APIs"
2. Make sure these are enabled:
   - Google+ API (deprecated but sometimes still needed)
   - OR Google Identity Toolkit API
   - OR Identity and Access Management (IAM) API

If none are enabled, enable "Google Identity Toolkit API"

### 5. OAuth Consent Screen

In Google Cloud Console → APIs & Services → OAuth consent screen:
- Publishing status: Can be "Testing"
- User type: External
- Test users: Add your email if in testing mode

### 6. Try Raw Supabase API

Test if Supabase itself is working:

```javascript
// Run this in your app console
const testSupabase = async () => {
  const response = await fetch('https://jmwggzasoikndnpwkrca.supabase.co/auth/v1/health');
  const data = await response.json();
  console.log('Supabase health:', data);
};
testSupabase();
```

### 7. Alternative: Skip Google, Use Password Auth

Since Google is failing, create an account directly:

```javascript
// Quick account creation
const quickSignUp = async () => {
  const email = `test${Date.now()}@example.com`;
  const password = 'TestPass123!';
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  
  console.log('Account created:', email, password);
  console.log('Result:', data, error);
};
```

## Most Likely Fix

Based on the 500 error, here's what to do:

1. **Generate new Client Secret** (90% of cases)
2. **Wait 2 minutes after saving** in Supabase
3. **Clear all app data and browser cookies**
4. **Try again**

## If Still Failing

The issue might be on Supabase's end. Check:
- https://status.supabase.com/ (for outages)
- Supabase Dashboard → Settings → API → Service Role Key (make sure it exists)

## Working Alternative Right Now

Use the magic link feature that's already in the app:
1. Click "Sign in with Google" 
2. When it fails, choose "Use Magic Link"
3. Enter your email
4. Check email for link
5. Click link to sign in

This bypasses Google OAuth completely and should work immediately!