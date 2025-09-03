# 🔐 Google OAuth Setup Guide for Crypto Clips

This guide will help you set up Google OAuth authentication with Supabase in your React Native app.

## 📋 Prerequisites

- ✅ Supabase project already configured
- ✅ React Native/Expo app with necessary dependencies
- ✅ Google Cloud Console access

## 🚀 Step 1: Google Cloud Console Setup

### 1.1 Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google+ API** and **Google OAuth2 API**
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **OAuth 2.0 Client IDs**

### 1.2 Configure OAuth Consent Screen

1. Set **Application Type** to **Web application**
2. Add **Authorized redirect URIs**:
   ```
   https://jmwggzasoikndnpwkrca.supabase.co/auth/v1/callback
   ```
3. Copy your **Client ID** and **Client Secret**

## 🔧 Step 2: Supabase Configuration

### 2.1 Enable Google Provider

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** and click **Enable**
5. Enter your Google OAuth credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret

### 2.2 Configure Redirect URLs

In Supabase **Authentication** → **URL Configuration**:
- **Site URL**: `https://jmwggzasoikndnpwkrca.supabase.co`
- **Redirect URLs**: 
  ```
  https://jmwggzasoikndnpwkrca.supabase.co/auth/v1/callback
  cryptoclips://auth/callback
  ```

## 📱 Step 3: React Native Configuration

### 3.1 App Scheme (Already Configured ✅)

Your `app.json` already has the correct scheme:
```json
{
  "expo": {
    "scheme": "cryptoclips"
  }
}
```

### 3.2 Deep Link Handling (Already Implemented ✅)

The app automatically handles OAuth callbacks via:
- `DeepLinkHandler` component
- Custom URL scheme: `cryptoclips://auth/callback`

## 🗄️ Step 4: Database Setup

### 4.1 Run Migration

Execute this SQL in your Supabase SQL Editor:

```sql
-- Create profiles table for storing user preferences and additional data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  email TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, username, preferences)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    '{}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
```

## 🧪 Step 5: Testing

### 5.1 Test OAuth Flow

1. **Run your app** in development
2. **Go to onboarding** and click "Continue with Google"
3. **Check console logs** for OAuth flow status
4. **Verify user creation** in Supabase Auth and profiles table

### 5.2 Expected Flow

```
User clicks "Continue with Google" 
→ Opens Google OAuth in browser 
→ User authenticates with Google 
→ Redirects to cryptoclips://auth/callback 
→ App processes callback 
→ User profile created in Supabase 
→ Onboarding preferences saved
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "OAuth is not supported on this platform"
- Ensure you're testing on a device/simulator, not web
- Check that `expo-web-browser` is properly installed

#### 2. "No OAuth URL received"
- Verify Google OAuth is enabled in Supabase
- Check Client ID and Secret are correct
- Ensure redirect URLs are properly configured

#### 3. Deep links not working
- Verify app scheme is correct in `app.json`
- Check that `DeepLinkHandler` is properly integrated
- Test with `npx uri-scheme open cryptoclips://test`

#### 4. User profile not created
- Check Supabase RLS policies
- Verify the trigger function is created
- Check console logs for errors

### Debug Commands

```bash
# Test deep link handling
npx uri-scheme open cryptoclips://auth/callback?code=test

# Check Supabase logs
# Go to Supabase Dashboard → Logs → Auth

# Verify database
# Go to Supabase Dashboard → Table Editor → profiles
```

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Expo WebBrowser Documentation](https://docs.expo.dev/versions/latest/sdk/webbrowser/)
- [React Native Deep Linking](https://reactnative.dev/docs/linking)

## ✅ What's Already Implemented

- ✅ Supabase client configuration
- ✅ OAuth handler service
- ✅ User profile service
- ✅ Deep link handling
- ✅ Auth context integration
- ✅ Onboarding preference saving
- ✅ Database migration script

## 🎯 Next Steps

1. **Run the database migration** in Supabase
2. **Configure Google OAuth** in Supabase dashboard
3. **Test the complete flow** in your app
4. **Verify user profiles** are created automatically
5. **Check that preferences** are saved to Supabase

## 🆘 Need Help?

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify all configuration steps are completed
3. Test with a fresh Supabase project if needed
4. Check Supabase logs for authentication errors

---

**Happy coding! 🚀**