# CryptoClips - React Native Crypto News App

## Project Overview
CryptoClips is a React Native crypto news application that provides an Inshorts-style interface for consuming cryptocurrency news. The app features swipeable cards, real-time price data, user engagement features, and comprehensive Supabase integration.

## Tech Stack

### Frontend
- **React Native 0.81.4** with **Expo SDK 54**
- **TypeScript** for type safety
- **React Navigation 6** for navigation
- **NativeWind (Tailwind CSS)** for styling
- **Zustand** for state management
- **React Native Reanimated** for animations
- **Expo Vector Icons** for iconography

### Backend & Services
- **Supabase** (PostgreSQL, Auth, Edge Functions)
- **CryptoCompare API** for news data
- **AsyncStorage** for local persistence
- **React Native Gesture Handler** for touch interactions

## Project Structure

```
crypto-clips-c/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── cards/          # NewsCard, SwipeableCardStack
│   │   ├── buttons/        # ReactionBar, BookmarkButton, ShareButton
│   │   ├── chips/          # FilterChip, PriceChip, TagChip
│   │   ├── common/         # AppHeader, LoadingSpinner, ErrorBoundary
│   │   └── feedback/       # EmptyState components
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.tsx # Authentication state
│   │   ├── ThemeContext.tsx # Theme management
│   │   └── AppStateContext.tsx # App state management
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Core libraries and utilities
│   │   ├── supabase.ts     # Supabase client
│   │   ├── supabaseFixed.ts # Mobile-optimized Supabase client
│   │   ├── database.ts     # Database service layer
│   │   └── api.ts          # CryptoCompare API client
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # Main app screens
│   ├── services/           # Business logic services
│   ├── store/              # Zustand state management
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── supabase/               # Supabase configuration
│   ├── migrations/         # Database migrations
│   └── functions/          # Edge Functions
└── android/ios/            # Platform-specific code
```

## Supabase Integration

### Database Schema
```sql
-- Core Tables
news_items (id, title, body, url, imageurl, source_name, published_on, categories, categories_array)
favorites (id, user_id, news_id, created_at)
user_preferences (id, user_id, preferred_categories, created_at, updated_at)
user_interactions (id, user_id, news_id, interaction_type, created_at)
profiles (id, username, email, avatar_url, preferences, created_at, updated_at)
```

### Authentication System
- **Multiple Auth Methods**: Google OAuth, Email/Password, Magic Link
- **Deep Link Handling**: Custom `cryptoclips://` scheme
- **Session Management**: Persistent sessions with auto-refresh using PKCE flow
- **User Profiles**: Automatic profile creation on signup with trigger functions
- **Fallback Support**: Demo user for unauthenticated access

### Key Features
1. **Row Level Security (RLS)** enabled on all tables
2. **Array-based category filtering** with GIN indexes for performance
3. **Automated news sync** via Edge Functions (6-hourly)
4. **User profile management** with automatic creation
5. **Comprehensive fallback** to local storage

### Mobile-Specific Adaptations
- **Custom AsyncStorage adapter** for React Native compatibility
- **Deep link OAuth** with custom URL scheme handling
- **Error handling** for storage operations with graceful fallbacks
- **Debug utilities** for storage inspection and troubleshooting

## Core Features

### News Feed
- **Swipeable Cards**: Inshorts-style interface for news consumption
- **Category Filtering**: Filter by Bitcoin, Ethereum, DeFi, etc.
- **Real-time Price Data**: Live crypto prices with 24h changes
- **Infinite Scroll**: Pagination with cursor-based navigation
- **Pull-to-Refresh**: Manual content refresh

### User Engagement
- **Reactions**: Bull/Bear/Neutral reaction system
- **Bookmarks**: Save articles for later reading
- **Share**: Native sharing functionality
- **Search**: Find articles by keywords and categories
- **Gamification**: Streaks, tokens, and user engagement

### Authentication
- **Google OAuth**: Primary authentication method
- **Email/Password**: Secondary authentication
- **Magic Link**: Passwordless authentication
- **Deep Link Support**: Mobile OAuth callback handling
- **Session Persistence**: Automatic login on app restart

### Offline Support
- **Local Storage**: Cached content for offline reading
- **Fallback System**: 3-tier fallback (Supabase → Local → Mock)
- **Bookmark Sync**: Offline bookmark management
- **Smart Refresh**: Updates based on user behavior

## Performance Optimizations

### Database
- **GIN Indexes**: For array-based category searches
- **Query Optimization**: Selective field loading and pagination
- **Connection Pooling**: Efficient database connections
- **Caching**: 10-minute in-memory cache with TTL

### Mobile
- **Lazy Loading**: Images and content loaded on demand
- **Request Cancellation**: Prevents race conditions
- **Memoization**: Expensive operations cached
- **Smooth Animations**: 60fps scrolling with Reanimated

### Network
- **Edge Functions**: Serverless news synchronization
- **Batch Processing**: Efficient data updates
- **Retry Logic**: Exponential backoff for failed requests
- **Offline First**: Works without internet connection

## Security Features

### Data Protection
- **Row Level Security**: User data isolation
- **Input Validation**: Sanitized user inputs
- **API Key Security**: Environment variable management
- **Deep Link Validation**: Secure OAuth callbacks

### Authentication Security
- **PKCE Flow**: OAuth security best practices
- **Session Management**: Secure token handling
- **User Isolation**: RLS policies for data access
- **Error Handling**: No sensitive data exposure

## Development Tools

### Debugging
- **Connection Testing**: Supabase and API connectivity tests
- **Storage Debugging**: AsyncStorage inspection utilities
- **Error Logging**: Comprehensive error tracking
- **Performance Monitoring**: App performance metrics

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **Error Boundaries**: Crash prevention
- **Comprehensive Logging**: Debug information

## Build & Deployment

### Development
- **Expo CLI**: Development server and tools
- **Hot Reload**: Fast development iteration
- **Debug Tools**: Flipper and React Native Debugger
- **Type Checking**: TypeScript compilation

### Production
- **EAS Build**: App store builds
- **Environment Variables**: Secure configuration
- **Platform Builds**: iOS and Android optimization
- **Code Signing**: App store deployment

## Known Issues & Technical Debt

### Current Issues
1. **Large Component Files**: `InshortsFeedScreenV2.tsx` needs refactoring
2. **Mixed State Management**: Zustand + Context could be consolidated
3. **Error Handling**: Some API calls lack proper error boundaries
4. **Memory Leaks**: Timer cleanup needs improvement

### Improvements Needed
1. **Unit Tests**: Add testing for critical components
2. **Performance Monitoring**: Implement proper analytics
3. **Bundle Optimization**: Code splitting for smaller bundles
4. **Offline Sync**: Better conflict resolution

## Environment Variables

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://jmwggzasoikndnpwkrca.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# CryptoCompare API
EXPO_PUBLIC_CRYPTO_API_BASE_URL=https://min-api.cryptocompare.com/data/v2
EXPO_PUBLIC_CRYPTO_API_KEY=a69a4ddcb181c18e05869ab13eaa2ab1b3dfcb02e808966e7b5db786960666e5
```

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator
- Supabase account

### Installation
```bash
npm install
npx expo start
```

### Database Setup
1. Run Supabase migrations
2. Set up RLS policies
3. Configure Edge Functions
4. Set environment variables

## Architecture Decisions

### Why Supabase?
- **Real-time**: Built-in real-time subscriptions
- **Auth**: Comprehensive authentication system
- **Edge Functions**: Serverless backend logic
- **PostgreSQL**: Robust relational database
- **Mobile SDK**: Excellent React Native support

### Why React Native + Expo?
- **Cross-platform**: Single codebase for iOS/Android
- **Fast Development**: Expo toolchain and services
- **Native Performance**: Compiled to native code
- **Rich Ecosystem**: Extensive library support

### Why Zustand?
- **Lightweight**: Minimal bundle size impact
- **TypeScript**: Excellent type safety
- **Simple**: Easy to understand and maintain
- **Performance**: Efficient re-renders

## Future Enhancements

### Planned Features
1. **Push Notifications**: Breaking news alerts
2. **Price Alerts**: Custom price threshold notifications
3. **Rewards System**: Token redemption for premium features
4. **Social Features**: User comments and sharing
5. **Advanced Analytics**: User behavior insights

### Technical Improvements
1. **Microservices**: Break down monolithic services
2. **GraphQL**: More efficient data fetching
3. **CDN**: Global content delivery
4. **Machine Learning**: Personalized content recommendations
5. **Real-time Sync**: Live collaboration features

## Support & Maintenance

### Monitoring
- **Error Tracking**: Sentry integration
- **Performance**: App performance monitoring
- **Analytics**: User engagement metrics
- **Uptime**: Service availability tracking

### Maintenance
- **Regular Updates**: Dependencies and security patches
- **Database Maintenance**: Cleanup and optimization
- **Performance Tuning**: Continuous optimization
- **User Feedback**: Feature requests and bug reports
