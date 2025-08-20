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
  { id: 'bitcoin', name: 'Bitcoin', slug: 'bitcoin', icon: '₿' },
  { id: 'altcoins', name: 'Altcoins', slug: 'altcoins', icon: '🪙' },
  { id: 'defi', name: 'DeFi', slug: 'defi', icon: '🏦' },
  { id: 'nft', name: 'NFTs', slug: 'nft', icon: '🖼️' },
  { id: 'regulation', name: 'Regulation', slug: 'regulation', icon: '⚖️' },
  { id: 'exchanges', name: 'Exchanges', slug: 'exchanges', icon: '💱' },
  { id: 'tech', name: 'Technology', slug: 'tech', icon: '💻' },
  { id: 'analysis', name: 'Analysis', slug: 'analysis', icon: '📊' },
  { id: 'education', name: 'Education', slug: 'education', icon: '📚' },
];

export const THEMES = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    primary: '#3B82F6',
    primaryGradient: ['#60A5FA', '#3B82F6'],
    secondary: '#8B5CF6',
    secondaryGradient: ['#A78BFA', '#8B5CF6'],
    success: '#6B7280',
    successGradient: ['#9CA3AF', '#6B7280'],
    danger: '#EF4444',
    dangerGradient: ['#EF4444', '#DC2626'],
    error: '#EF4444',
    warning: '#94A3B8',
    accent: '#EC4899',
    accentGradient: ['#EC4899', '#BE185D'],
    cardShadow: 'rgba(0, 0, 0, 0.1)',
    cardBorder: 'rgba(99, 102, 241, 0.1)',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    card: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    border: '#334155',
    primary: '#3B82F6',
    primaryGradient: ['#60A5FA', '#3B82F6'],
    secondary: '#8B5CF6',
    secondaryGradient: ['#A78BFA', '#8B5CF6'],
    success: '#6B7280',
    successGradient: ['#9CA3AF', '#6B7280'],
    danger: '#EF4444',
    dangerGradient: ['#EF4444', '#DC2626'],
    error: '#EF4444',
    warning: '#94A3B8',
    accent: '#EC4899',
    accentGradient: ['#EC4899', '#BE185D'],
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    cardBorder: 'rgba(99, 102, 241, 0.2)',
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