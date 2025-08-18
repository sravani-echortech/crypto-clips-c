# Supabase Backend Setup Guide

## Overview
This guide provides complete instructions for setting up Supabase as the backend for the CryptoClips app.

## Project Configuration

### Supabase Project Details
- **Project URL**: `https://jmwggzasoikndnpwkrca.supabase.co`
- **Project ID**: `jmwggzasoikndnpwkrca`
- **Region**: Default (US East)

### Environment Variables
The `.env` file has been created with:
```env
EXPO_PUBLIC_SUPABASE_URL=https://jmwggzasoikndnpwkrca.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_CRYPTO_API_KEY=a69a4ddcb181c18e05869ab13eaa2ab1b3dfcb02e808966e7b5db786960666e5
EXPO_PUBLIC_CRYPTO_API_BASE_URL=https://min-api.cryptocompare.com/data/v2
```

## Database Setup

### 1. Run Database Migration
Execute the SQL script located at `supabase/migrations/001_initial_schema.sql` in your Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire content of `001_initial_schema.sql`
4. Click "Run" to create all tables and policies

### 2. Tables Created
- **news_items**: Stores crypto news articles
- **favorites**: User's bookmarked articles
- **user_preferences**: User's category preferences
- **user_interactions**: Tracks user interactions (views, likes, shares)

### 3. Row Level Security (RLS)
All tables have RLS enabled with appropriate policies for secure data access.

## Edge Functions Setup

### 1. Deploy the News Sync Function
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref jmwggzasoikndnpwkrca

# Deploy the edge function
supabase functions deploy sync-news-6hourly
```

### 2. Set Environment Variables for Edge Function
In your Supabase Dashboard:
1. Go to Settings → Edge Functions
2. Add the following environment variables:
   - `CRYPTO_API_KEY`: a69a4ddcb181c18e05869ab13eaa2ab1b3dfcb02e808966e7b5db786960666e5
   - `CRYPTO_API_BASE_URL`: https://min-api.cryptocompare.com/data/v2
   - `SUPABASE_SERVICE_ROLE_KEY`: (Get from Settings → API)

### 3. Set Up Cron Job (Optional)
To automatically sync news every 6 hours:

1. Go to your Supabase Dashboard
2. Navigate to Database → Extensions
3. Enable the `pg_cron` extension
4. Run this SQL to create the cron job:

```sql
-- Schedule the edge function to run every 6 hours
SELECT cron.schedule(
  '6-hourly-news-sync',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://jmwggzasoikndnpwkrca.supabase.co/functions/v1/sync-news-6hourly',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_ANON_KEY',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

## Testing the Integration

### 1. Test Database Connection
```javascript
// In your React Native app
import { DatabaseService } from '@/lib/database';

const db = DatabaseService.getInstance();
const isConnected = await db.testConnection();
console.log('Database connected:', isConnected);
```

### 2. Test News Sync
```bash
# Manually trigger the sync function
curl -X POST https://jmwggzasoikndnpwkrca.supabase.co/functions/v1/sync-news-6hourly \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### 3. Test API Integration
```javascript
// In your React Native app
import apiService from '@/services/apiSupabase';

// Sync news from CryptoCompare API
const success = await apiService.syncNews();

// Fetch news from database
const response = await apiService.getFeed();
console.log('Articles:', response.articles);
```

## Features Implemented

### 1. Core Services
- **Authentication Service** (`src/services/auth.ts`)
  - Email/password authentication
  - Anonymous demo users
  - Profile management

- **News Service** (`src/services/newsService.ts`)
  - Fetch news from database
  - Sync with CryptoCompare API
  - Favorites management
  - Interaction tracking
  - Real-time updates

- **Database Service** (`src/lib/database.ts`)
  - CRUD operations for all tables
  - Caching layer
  - User preferences
  - Offline support

### 2. Real-time Features
- **News Updates**: Automatic feed refresh when new articles arrive
- **Favorites Sync**: Real-time bookmark synchronization
- **User Preferences**: Instant preference updates

### 3. API Integration
- **CryptoCompare API**: Fetches latest crypto news
- **Supabase Integration**: Stores and serves news data
- **Caching**: 5-minute cache for better performance
- **Offline Support**: AsyncStorage fallback

## Usage in the App

### 1. Using Supabase-enabled Feed Screen
Replace the default FeedScreen with FeedScreenSupabase:

```javascript
// In MainTabNavigator.tsx
import FeedScreenSupabase from '@/screens/FeedScreenSupabase';

// Use FeedScreenSupabase instead of FeedScreen
<Tab.Screen
  name="Feed"
  component={FeedScreenSupabase}
  options={{ title: 'Feed' }}
/>
```

### 2. Using Authentication
```javascript
import { AuthService } from '@/services/auth';

const auth = AuthService.getInstance();

// Sign up
const { user, error } = await auth.signUp(email, password);

// Sign in
const { user, error } = await auth.signIn(email, password);

// Sign out
await auth.signOut();
```

### 3. Using Real-time Subscriptions
```javascript
import { useNewsUpdates } from '@/hooks/useSupabase';

// In your component
useNewsUpdates((newArticle) => {
  console.log('New article:', newArticle);
  // Refresh your feed
});
```

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check your Supabase URL and anon key in `.env`
   - Ensure tables are created (run migration SQL)
   - Verify RLS policies are in place

2. **News sync not working**
   - Check edge function deployment status
   - Verify environment variables are set
   - Check CryptoCompare API key validity

3. **Real-time updates not working**
   - Ensure Realtime is enabled for tables in Supabase
   - Check WebSocket connection
   - Verify anon key has proper permissions

### Debug Commands
```bash
# Check edge function logs
supabase functions logs sync-news-6hourly

# Test database connection
curl -X GET "https://jmwggzasoikndnpwkrca.supabase.co/rest/v1/news_items?select=count" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Security Notes

1. **Never commit service role key** - Keep it server-side only
2. **Use RLS policies** - All tables have Row Level Security enabled
3. **Validate user input** - Always sanitize data before database operations
4. **Rate limiting** - Consider implementing rate limits for API calls

## Next Steps

1. **Enable Authentication**: Implement full user authentication flow
2. **Add Social Login**: Configure OAuth providers in Supabase
3. **Implement Push Notifications**: Set up push notification service
4. **Add Analytics**: Track user engagement and app performance
5. **Set Up Monitoring**: Configure error tracking and monitoring

## Support

For issues or questions:
- Supabase Documentation: https://supabase.com/docs
- CryptoCompare API: https://min-api.cryptocompare.com/documentation
- Project Repository: [Your GitHub Repo]