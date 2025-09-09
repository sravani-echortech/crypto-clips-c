export const APP_CONFIG = {
  APP_NAME: 'CryptoClips',
  VERSION: '1.0.0',
  API_BASE_URL: 'https://api.cryptoclips.com', // Will be replaced with actual API
  WEBSOCKET_URL: 'wss://ws.cryptoclips.com',
  SUPPORT_EMAIL: 'support@cryptoclips.com',
};

export const STORAGE_KEYS = {
  USER_PREFERENCES: '@cryptoclips:preferences',
  AUTH_TOKEN: '@cryptoclips:auth_token',
  USER_DATA: '@cryptoclips:user_data',
  BOOKMARKS: '@cryptoclips:bookmarks',
  VIEWED_ARTICLES: '@cryptoclips:viewed_articles',
  STREAK_DATA: '@cryptoclips:streak',
  TOKEN_DATA: '@cryptoclips:tokens',
  ONBOARDING_COMPLETED: '@cryptoclips:onboarding_completed',
  CACHED_FEED: '@cryptoclips:cached_feed',
  SEARCH_HISTORY: '@cryptoclips:search_history',
  FILTERS: '@cryptoclips:filters',
};

export const ANIMATION_CONFIG = {
  CARD_SWIPE_THRESHOLD: 100,
  CARD_ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
  SKELETON_ANIMATION_DURATION: 1000,
  REFRESH_CONTROL_THRESHOLD: 80,
};

export const FEED_CONFIG = {
  PAGE_SIZE: 20,
  PREFETCH_THRESHOLD: 5,
  VIEW_TRACKING_THRESHOLD: 0.7, // 70% visibility
  VIEW_TRACKING_DURATION: 2000, // 2 seconds
  PRICE_UPDATE_INTERVAL: 30000, // 30 seconds
  CACHE_DURATION: 300000, // 5 minutes
};

export const GAMIFICATION = {
  DAILY_TOKEN_CAP: 100,
  TOKENS_PER_ARTICLE_VIEW: 1,
  TOKENS_PER_REACTION: 2,
  TOKENS_PER_SHARE: 5,
  TOKENS_PER_DAILY_OPEN: 10,
  TOKENS_PER_STREAK_MILESTONE: 50,
  STREAK_MILESTONES: [7, 14, 30, 60, 100],
};

export const CATEGORIES = [
  { id: 'all', name: 'All', slug: 'all', icon: '🌐' },
  { id: 'bitcoin', name: 'Bitcoin', slug: 'BTC', icon: '₿' },
  { id: 'ethereum', name: 'Ethereum', slug: 'ETH', icon: '🪙' },
  { id: 'solana', name: 'Solana', slug: 'SOL', icon: '🪙' },
  { id: 'trading', name: 'Trading', slug: 'TRADING', icon: '📊' },
  { id: 'market', name: 'Market', slug: 'MARKET', icon: '📈' },
  { id: 'cryptocurrency', name: 'Cryptocurrency', slug: 'CRYPTOCURRENCY', icon: '🪙' },
  { id: 'business', name: 'Business', slug: 'BUSINESS', icon: '💼' },
  { id: 'regulation', name: 'Regulation', slug: 'REGULATION', icon: '⚖️' },
  { id: 'exchanges', name: 'Exchanges', slug: 'EXCHANGE', icon: '💱' },
  { id: 'blockchain', name: 'Blockchain', slug: 'BLOCKCHAIN', icon: '🔗' },
];

export const THEMES = {
  // Clean Light Theme for News App
  light: {
    background: '#FFFFFF', // Pure white background
    surface: '#F8FAFC', // Very light gray surface
    card: '#FFFFFF', // White cards
    text: '#1E293B', // Dark slate text
    textSecondary: '#64748B', // Medium gray secondary text
    border: '#E2E8F0', // Light gray borders
    primary: '#3B82F6', // Blue primary
    primaryGradient: ['#3B82F6', '#2563EB'],
    secondary: '#10B981', // Green secondary
    secondaryGradient: ['#10B981', '#059669'],
    success: '#10B981', // Green success
    successGradient: ['#10B981', '#059669'],
    danger: '#EF4444', // Red danger
    dangerGradient: ['#EF4444', '#DC2626'],
    error: '#EF4444',
    warning: '#F59E0B', // Orange warning
    accent: '#F59E0B', // Orange accent
    accentGradient: ['#F59E0B', '#D97706'],
    cardShadow: 'rgba(0, 0, 0, 0.1)',
    cardBorder: '#E2E8F0',
    priceUp: '#10B981', // Green for positive
    priceDown: '#EF4444', // Red for negative
  },
  
  // Modern Dark Theme for Crypto App
  dark: {
    background: '#0F172A', // Dark slate background
    surface: '#1E293B', // Darker surface
    card: '#334155', // Dark cards
    text: '#F8FAFC', // Light text
    textSecondary: '#94A3B8', // Muted light text
    border: '#475569', // Dark borders
    primary: '#3B82F6', // Blue primary (same as light)
    primaryGradient: ['#3B82F6', '#2563EB'],
    secondary: '#10B981', // Green secondary (same as light)
    secondaryGradient: ['#10B981', '#059669'],
    success: '#10B981', // Green success
    successGradient: ['#10B981', '#059669'],
    danger: '#EF4444', // Red danger
    dangerGradient: ['#EF4444', '#DC2626'],
    error: '#EF4444',
    warning: '#F59E0B', // Orange warning
    accent: '#F59E0B', // Orange accent
    accentGradient: ['#F59E0B', '#D97706'],
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    cardBorder: '#475569',
    priceUp: '#10B981', // Green for positive
    priceDown: '#EF4444', // Red for negative
  },
};

export const THEME_METADATA = {
  light: {
    name: 'Light',
    description: 'Clean and readable light theme',
    category: 'Classic',
    isDark: false,
  },
  dark: {
    name: 'Dark',
    description: 'Modern dark theme for crypto trading',
    category: 'Modern',
    isDark: true,
  },
};

export const ACCESSIBILITY = {
  MIN_TOUCH_TARGET: 44,
  MIN_TEXT_SIZE: 14,
  CONTRAST_RATIO_AA: 4.5,
  CONTRAST_RATIO_AAA: 7,
};

export const MOCK_CONFIG = {
  USE_MOCK_DATA: true,
  MOCK_DELAY: 500,
  MOCK_ERROR_RATE: 0.05, // 5% chance of error for testing
};