export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface NewsArticle {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceAvatar?: string;
  headline: string;
  summary: string;
  content?: string;
  url: string;
  publishedAt: Date;
  updatedAt: Date;
  coins: Coin[];
  categories: Category[];
  thumbnail?: string;
  reactions: {
    bull: number;
    bear: number;
    neutral: number;
  };
  userReaction?: 'bull' | 'bear' | 'neutral';
  isBookmarked?: boolean;
  viewCount: number;
  readTime?: number;
}

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  logo?: string;
  currentPrice?: number;
  priceChange24h?: number;
  priceChangePercentage24h?: number;
  marketCap?: number;
  rank?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
}

export interface Source {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  credibilityScore?: number;
  description?: string;
}

export interface PriceAlert {
  id: string;
  coinId: string;
  coinSymbol: string;
  type: 'above' | 'below' | 'change_percent';
  value: number;
  isActive: boolean;
  createdAt: Date;
  lastTriggered?: Date;
}

export interface NewsAlert {
  id: string;
  type: 'breaking' | 'followed_topic' | 'price_movement';
  title: string;
  description?: string;
  isActive: boolean;
  filters?: {
    coins?: string[];
    categories?: string[];
    sources?: string[];
  };
}

export interface DigestSettings {
  id: string;
  frequency: 'daily' | 'weekly';
  time: string; // HH:mm format
  daysOfWeek?: number[]; // 0-6, Sunday-Saturday
  isActive: boolean;
}

export interface Bookmark {
  id: string;
  articleId: string;
  article?: NewsArticle;
  createdAt: Date;
  isOfflineAvailable?: boolean;
}

export interface Streak {
  current: number;
  best: number;
  lastActiveDate: Date;
  startDate: Date;
  todayViewed: boolean;
}

export interface Token {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

export interface TokenTransaction {
  id: string;
  type: 'earned' | 'spent' | 'bonus';
  amount: number;
  reason: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  image?: string;
  tokenCost: number;
  category: 'sticker' | 'theme' | 'raffle' | 'merch' | 'premium';
  inventory?: number;
  isAvailable: boolean;
  expiresAt?: Date;
  terms?: string;
}

export interface Redemption {
  id: string;
  rewardId: string;
  reward?: Reward;
  redeemedAt: Date;
  fulfillmentCode?: string;
  status: 'pending' | 'fulfilled' | 'failed';
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  region: string;
  dataSaver: boolean;
  haptics?: boolean;
  analytics?: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  notifications: {
    breaking: boolean;
    priceAlerts: boolean;
    digest: boolean;
    rewards: boolean;
    streaks: boolean;
  };
  following: {
    coins: string[];
    categories: string[];
    sources: string[];
  };
  hiddenSources: string[];
  hiddenTopics: string[];
}

export interface FilterState {
  categories: string[];
  coins: string[];
  sources: string[];
  highImpactOnly: boolean;
  timeRange: 'today' | 'week' | 'month' | 'all';
}

export interface SearchQuery {
  query: string;
  filters?: FilterState;
  sortBy?: 'relevance' | 'date' | 'popularity';
}

export interface ViewTracking {
  articleId: string;
  viewStartTime: Date;
  viewEndTime?: Date;
  scrollDepth: number;
  isRead: boolean;
}

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: Date;
  sessionId: string;
  userId?: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export type NavigationParamList = {
  Main: undefined;
  Onboarding: undefined;
  SwipeFeed: undefined;
  Feed: undefined;
  ArticleViewer: { article: NewsArticle };
  RewardDetails: { reward: Reward };
  RedemptionSuccess: { redemption: Redemption };
  Settings: undefined;
};