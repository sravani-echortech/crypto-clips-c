import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  UserPreferences, 
  Streak, 
  Token, 
  TokenTransaction,
  Bookmark,
  NewsArticle,
  FilterState,
  // PriceAlert,
  // NewsAlert,
  DigestSettings,
  Reward,
  Redemption
} from '@/types';
import { STORAGE_KEYS } from '@/constants';

interface AppState {
  // User & Auth
  user: User | null;
  isAuthenticated: boolean;
  isOnboardingCompleted: boolean;
  
  // Preferences
  preferences: UserPreferences;
  
  // Gamification
  streak: Streak;
  tokens: Token;
  tokenHistory: TokenTransaction[];
  
  // Content
  bookmarks: Bookmark[];
  viewedArticles: Set<string>;
  cachedFeed: NewsArticle[];
  searchHistory: string[];
  
  // Filters
  currentFilters: FilterState;
  
  // Alerts - commented out for v1
  // priceAlerts: PriceAlert[];
  // newsAlerts: NewsAlert[];
  digestSettings: DigestSettings | null;
  
  // Rewards
  rewards: Reward[];
  redemptions: Redemption[];
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  
  // Streak actions
  updateStreak: (streak: Partial<Streak>) => void;
  checkAndUpdateStreak: () => void;
  
  // Token actions
  addTokens: (amount: number, reason: string) => void;
  spendTokens: (amount: number, reason: string) => boolean;
  
  // Bookmark actions
  addBookmark: (article: NewsArticle) => void;
  removeBookmark: (articleId: string) => void;
  isBookmarked: (articleId: string) => boolean;
  clearBookmarks: () => void;
  
  // Article actions
  markArticleAsViewed: (articleId: string) => void;
  
  // Filter actions
  updateFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  
  // Search actions
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  
  // Alert actions - commented out for v1
  // addPriceAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => void;
  // removePriceAlert: (alertId: string) => void;
  // togglePriceAlert: (alertId: string) => void;
  
  // Following actions
  followCoin: (coinId: string) => void;
  unfollowCoin: (coinId: string) => void;
  followCategory: (categoryId: string) => void;
  unfollowCategory: (categoryId: string) => void;
  followSource: (sourceId: string) => void;
  unfollowSource: (sourceId: string) => void;
  
  // Reward actions
  redeemReward: (rewardId: string) => Promise<boolean>;
  
  // App actions
  initializeApp: () => Promise<void>;
  resetApp: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  language: 'en',
  region: 'US',
  dataSaver: false,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
  notifications: {
    breaking: true,
    priceAlerts: true,
    digest: true,
    rewards: true,
    streaks: true,
  },
  following: {
    coins: ['bitcoin', 'ethereum'],
    categories: ['bitcoin', 'defi'],
    sources: ['coindesk'],
  },
  hiddenSources: [],
  hiddenTopics: [],
};

const defaultStreak: Streak = {
  current: 7,
  best: 12,
  lastActiveDate: new Date(),
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  todayViewed: false,
};

const defaultTokens: Token = {
  balance: 125,
  lifetimeEarned: 250,
  lifetimeSpent: 125,
};

const defaultFilters: FilterState = {
  categories: [],
  coins: [],
  sources: [],
  highImpactOnly: false,
  timeRange: 'all',
};

const createStore = () => create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isOnboardingCompleted: false,
      preferences: defaultPreferences,
      streak: defaultStreak,
      tokens: defaultTokens,
      tokenHistory: [
        {
          id: '1',
          type: 'earned' as const,
          amount: 10,
          reason: 'Daily app open',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
        {
          id: '2',
          type: 'earned' as const,
          amount: 2,
          reason: 'Article reaction',
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
        {
          id: '3',
          type: 'earned' as const,
          amount: 5,
          reason: 'Shared article',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        },
        {
          id: '4',
          type: 'spent' as const,
          amount: -50,
          reason: 'Redeemed: Sticker Pack',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      ],
      bookmarks: [],
      viewedArticles: new Set(),
      cachedFeed: [],
      searchHistory: [],
      currentFilters: defaultFilters,
      // priceAlerts: [],
      // newsAlerts: [],
      digestSettings: null,
      rewards: [],
      redemptions: [],
      isLoading: false,
      isRefreshing: false,
      
      // User actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setOnboardingCompleted: (completed) => set({ isOnboardingCompleted: completed }),
      
      // Preferences actions
      updatePreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs }
      })),
      
      // Streak actions
      updateStreak: (streak) => set((state) => ({
        streak: { ...state.streak, ...streak }
      })),
      
      checkAndUpdateStreak: () => {
        const today = new Date().toDateString();
        const lastActive = new Date(get().streak.lastActiveDate).toDateString();
        
        if (today !== lastActive) {
          set((state) => ({
            streak: {
              ...state.streak,
              todayViewed: false,
            }
          }));
        }
      },
      
      // Token actions
      addTokens: (amount, reason) => {
        const transaction: TokenTransaction = {
          id: Date.now().toString(),
          type: 'earned',
          amount,
          reason,
          createdAt: new Date(),
        };
        
        set((state) => ({
          tokens: {
            balance: state.tokens.balance + amount,
            lifetimeEarned: state.tokens.lifetimeEarned + amount,
            lifetimeSpent: state.tokens.lifetimeSpent,
          },
          tokenHistory: [transaction, ...state.tokenHistory],
        }));
      },
      
      spendTokens: (amount, reason) => {
        if (get().tokens.balance < amount) return false;
        
        const transaction: TokenTransaction = {
          id: Date.now().toString(),
          type: 'spent',
          amount: -amount,
          reason,
          createdAt: new Date(),
        };
        
        set((state) => ({
          tokens: {
            balance: state.tokens.balance - amount,
            lifetimeEarned: state.tokens.lifetimeEarned,
            lifetimeSpent: state.tokens.lifetimeSpent + amount,
          },
          tokenHistory: [transaction, ...state.tokenHistory],
        }));
        
        return true;
      },
      
      // Bookmark actions
      addBookmark: (article) => {
        const bookmark: Bookmark = {
          id: Date.now().toString(),
          articleId: article.id,
          article,
          createdAt: new Date(),
          isOfflineAvailable: false,
        };
        
        set((state) => ({
          bookmarks: [bookmark, ...state.bookmarks],
        }));
      },
      
      removeBookmark: (articleId) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter(b => b.articleId !== articleId),
        }));
      },
      
      isBookmarked: (articleId) => {
        return get().bookmarks.some(b => b.articleId === articleId);
      },
      
      clearBookmarks: () => {
        set({ bookmarks: [] });
      },
      
      // Article actions
      markArticleAsViewed: (articleId) => {
        set((state) => ({
          viewedArticles: new Set([...state.viewedArticles, articleId]),
        }));
      },
      
      // Filter actions
      updateFilters: (filters) => {
        set((state) => ({
          currentFilters: { ...state.currentFilters, ...filters },
        }));
      },
      
      resetFilters: () => {
        set({ currentFilters: defaultFilters });
      },
      
      // Search actions
      addToSearchHistory: (query) => {
        set((state) => ({
          searchHistory: [query, ...state.searchHistory.filter(q => q !== query)].slice(0, 10),
        }));
      },
      
      clearSearchHistory: () => {
        set({ searchHistory: [] });
      },
      
      // Alert actions - commented out for v1
      // addPriceAlert: (alert) => {
      //   const newAlert: PriceAlert = {
      //     ...alert,
      //     id: Date.now().toString(),
      //     createdAt: new Date(),
      //   };
      //   
      //   set((state) => ({
      //     priceAlerts: [...state.priceAlerts, newAlert],
      //   }));
      // },
      // 
      // removePriceAlert: (alertId) => {
      //   set((state) => ({
      //     priceAlerts: state.priceAlerts.filter(a => a.id !== alertId),
      //   }));
      // },
      // 
      // togglePriceAlert: (alertId) => {
      //   set((state) => ({
      //     priceAlerts: state.priceAlerts.map(a =>
      //       a.id === alertId ? { ...a, isActive: !a.isActive } : a
      //     ),
      //   }));
      // },
      
      // Following actions
      followCoin: (coinId) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            following: {
              ...state.preferences.following,
              coins: [...new Set([...state.preferences.following.coins, coinId])],
            },
          },
        }));
      },
      
      unfollowCoin: (coinId) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            following: {
              ...state.preferences.following,
              coins: state.preferences.following.coins.filter(id => id !== coinId),
            },
          },
        }));
      },
      
      followCategory: (categoryId) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            following: {
              ...state.preferences.following,
              categories: [...new Set([...state.preferences.following.categories, categoryId])],
            },
          },
        }));
      },
      
      unfollowCategory: (categoryId) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            following: {
              ...state.preferences.following,
              categories: state.preferences.following.categories.filter(id => id !== categoryId),
            },
          },
        }));
      },
      
      followSource: (sourceId) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            following: {
              ...state.preferences.following,
              sources: [...new Set([...state.preferences.following.sources, sourceId])],
            },
          },
        }));
      },
      
      unfollowSource: (sourceId) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            following: {
              ...state.preferences.following,
              sources: state.preferences.following.sources.filter(id => id !== sourceId),
            },
          },
        }));
      },
      
      // Reward actions
      redeemReward: async (rewardId) => {
        const reward = get().rewards.find(r => r.id === rewardId);
        if (!reward) return false;
        
        const success = get().spendTokens(reward.tokenCost, `Redeemed: ${reward.title}`);
        if (success) {
          const redemption: Redemption = {
            id: Date.now().toString(),
            rewardId,
            reward,
            redeemedAt: new Date(),
            status: 'pending',
            fulfillmentCode: Math.random().toString(36).substring(2, 15).toUpperCase(),
          };
          
          set((state) => ({
            redemptions: [redemption, ...state.redemptions],
          }));
        }
        
        return success;
      },
      
      // App actions
      initializeApp: async () => {
        set({ isLoading: true });
        
        // Load persisted data
        try {
          // Check if today is a new day for streak
          get().checkAndUpdateStreak();
        } catch (error) {
          console.error('Failed to initialize app:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      resetApp: () => {
        set({
          user: null,
          isAuthenticated: false,
          isOnboardingCompleted: false,
          preferences: defaultPreferences,
          streak: defaultStreak,
          tokens: defaultTokens,
          tokenHistory: [],
          bookmarks: [],
          viewedArticles: new Set(),
          cachedFeed: [],
          searchHistory: [],
          currentFilters: defaultFilters,
          // priceAlerts: [],
          // newsAlerts: [],
          digestSettings: null,
          rewards: [],
          redemptions: [],
        });
      },
    }),
    {
      name: 'cryptoclips-storage',
      storage: createJSONStorage(() => AsyncStorage, {
        reviver: (key, value) => {
          // Convert ISO date strings back to Date objects
          if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
            const date = new Date(value);
            // Check if it's a valid date
            if (!isNaN(date.getTime())) {
              return date;
            }
          }
          return value;
        },
        replacer: (key, value) => {
          // Convert Date objects to ISO strings
          if (value instanceof Date) {
            return value.toISOString();
          }
          return value;
        },
      }),
      partialize: (state) => ({
        user: state.user,
        isOnboardingCompleted: state.isOnboardingCompleted,
        preferences: state.preferences,
        streak: state.streak,
        tokens: state.tokens,
        tokenHistory: state.tokenHistory.slice(0, 100), // Keep last 100 transactions
        bookmarks: state.bookmarks,
        searchHistory: state.searchHistory,
        currentFilters: state.currentFilters,
        // priceAlerts: state.priceAlerts,
        // newsAlerts: state.newsAlerts,
        digestSettings: state.digestSettings,
        redemptions: state.redemptions,
      }),
    }
  )
);

export const useStore = createStore();