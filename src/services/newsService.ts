import { DatabaseService } from '@/lib/database';
import { CryptoApi, NewsItem } from '@/lib/api';
import { supabaseFixed } from '@/lib/supabaseFixed';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NewsArticleExtended extends NewsItem {
  isFavorite?: boolean;
  userReaction?: 'bull' | 'bear' | 'neutral';
  reactions?: {
    bull: number;
    bear: number;
    neutral: number;
  };
}

export class NewsService {
  private static instance: NewsService;
  private dbService: DatabaseService;
  private cryptoApi: CryptoApi;
  private lastFetch: number = 0;
  private readonly FETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.dbService = DatabaseService.getInstance();
    this.cryptoApi = CryptoApi.getInstance();
  }

  static getInstance(): NewsService {
    if (!NewsService.instance) {
      NewsService.instance = new NewsService();
    }
    return NewsService.instance;
  }

  // Fetch news with automatic sync
  async fetchNews(categories?: string[], forceRefresh: boolean = false): Promise<NewsArticleExtended[]> {
    try {
      const now = Date.now();
      const shouldFetchFromAPI = forceRefresh || (now - this.lastFetch > this.FETCH_INTERVAL);

      // 🚀 DEBUG: Log news service processing
      console.log('🔍 DEBUG: NEWS SERVICE PROCESSING');
      console.log('  - Received Categories:', categories);
      console.log('  - Categories Length:', categories?.length || 0);
      console.log('  - Categories Type:', typeof categories);
      console.log('  - Is Array?', Array.isArray(categories));
      
      // 🚀 OPTIMIZED: Reduced limits for faster loading
      const limit = categories && categories.length > 0 ? 30 : 20;  // 30 for categories, 20 for "All"
      console.log('  - Calculated Limit:', limit);
      console.log('  - Limit Reason:', categories && categories.length > 0 ? 'Specific Category (30)' : 'All Category (20)');
      
      // First, try to get news from database
      let newsItems = await this.dbService.getNews(limit, categories);

      // If database is empty or we need to refresh, fetch from API
      if (newsItems.length === 0 || shouldFetchFromAPI) {
        console.log('📡 Fetching fresh news from API...');
        const apiNews = await this.cryptoApi.getNews(limit);  // Fetch more for categories
        
        // Save to database
        await this.dbService.saveNewsItems(apiNews);
        
        // Get the updated news from database (with proper filtering)
        newsItems = await this.dbService.getNews(limit, categories);
        this.lastFetch = now;
      }

      // Enhance news items with user-specific data
      const enhancedNews = await this.enhanceNewsItems(newsItems);
      
      return enhancedNews;
    } catch (error) {
      console.error('Error fetching news:', error);
      
      // Fallback to cached data
      const cachedNews = await this.getCachedNews();
      if (cachedNews.length > 0) {
        console.log('📦 Using cached news as fallback');
        return cachedNews;
      }
      
      throw error;
    }
  }

  // Enhance news items with user-specific data (OPTIMIZED with parallel processing)
  private async enhanceNewsItems(newsItems: NewsItem[]): Promise<NewsArticleExtended[]> {
    // Process all items in parallel instead of sequentially
    const enhancedPromises = newsItems.map(async (item) => {
      const isFavorite = await this.dbService.isFavorite(item.id);
      
      return {
        ...item,
        isFavorite,
        reactions: {
          bull: Math.floor(Math.random() * 100),
          bear: Math.floor(Math.random() * 100),
          neutral: Math.floor(Math.random() * 100),
        },
      };
    });
    
    // Wait for all enhancements to complete in parallel
    const enhanced = await Promise.all(enhancedPromises);
    return enhanced;
  }

  // Toggle favorite status
  async toggleFavorite(newsItemId: string, currentStatus: boolean): Promise<boolean> {
    try {
      if (currentStatus) {
        return await this.dbService.removeFromFavorites(newsItemId);
      } else {
        return await this.dbService.addToFavorites(newsItemId);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  }

  // Get user's favorite articles
  async getFavorites(): Promise<NewsArticleExtended[]> {
    try {
      const favorites = await this.dbService.getFavorites();
      return favorites.map(item => ({
        ...item,
        isFavorite: true,
        reactions: {
          bull: Math.floor(Math.random() * 100),
          bear: Math.floor(Math.random() * 100),
          neutral: Math.floor(Math.random() * 100),
        },
      }));
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  // Track user interaction
  async trackInteraction(newsItemId: string, type: 'view' | 'like' | 'dislike' | 'share' | 'favorite'): Promise<void> {
    try {
      await this.dbService.trackInteraction(newsItemId, type);
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }

  // Search news
  async searchNews(query: string, categories?: string[]): Promise<NewsArticleExtended[]> {
    try {
      // Get all news from database
      const allNews = await this.dbService.getNews(100, categories);
      
      // Filter by search query
      const filtered = allNews.filter(item => {
        const searchTerm = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(searchTerm) ||
          item.body.toLowerCase().includes(searchTerm) ||
          item.source_info.name.toLowerCase().includes(searchTerm) ||
          item.categories.toLowerCase().includes(searchTerm)
        );
      });
      
      // Enhance and return
      return await this.enhanceNewsItems(filtered);
    } catch (error) {
      console.error('Error searching news:', error);
      return [];
    }
  }

  // Get news by category
  async getNewsByCategory(category: string): Promise<NewsArticleExtended[]> {
    try {
      const newsItems = await this.dbService.getNews(50, [category]);
      return await this.enhanceNewsItems(newsItems);
    } catch (error) {
      console.error('Error getting news by category:', error);
      return [];
    }
  }

  // Cache news for offline access
  private async cacheNews(newsItems: NewsArticleExtended[]): Promise<void> {
    try {
      await AsyncStorage.setItem('cachedNews', JSON.stringify(newsItems));
      await AsyncStorage.setItem('cachedNewsTimestamp', Date.now().toString());
    } catch (error) {
      console.error('Error caching news:', error);
    }
  }

  // Get cached news
  private async getCachedNews(): Promise<NewsArticleExtended[]> {
    try {
      const cached = await AsyncStorage.getItem('cachedNews');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Error getting cached news:', error);
    }
    return [];
  }

  // Sync news from API to database (manual trigger)
  async syncNews(): Promise<boolean> {
    try {
      console.log('🔄 Starting manual news sync...');
      
      // Fetch latest news from API
      const apiNews = await this.cryptoApi.getNews(50);
      
      // Save to database
      const success = await this.dbService.saveNewsItems(apiNews);
      
      if (success) {
        console.log('✅ News sync completed successfully');
        this.lastFetch = Date.now();
      }
      
      return success;
    } catch (error) {
      console.error('Error syncing news:', error);
      return false;
    }
  }

  // Get available categories
  async getAvailableCategories(): Promise<string[]> {
    try {
      const categories = await this.dbService.getAvailableCategories();
      if (categories.length === 0) {
        // Return default categories if none found
        return ['Bitcoin', 'Ethereum', 'Altcoins', 'DeFi', 'NFT', 'Regulation', 'Mining', 'Trading'];
      }
      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      return ['Bitcoin', 'Ethereum', 'Altcoins', 'DeFi', 'NFT', 'Regulation', 'Mining', 'Trading'];
    }
  }

  // Clear old news from database
  async clearOldNews(daysToKeep: number = 30): Promise<boolean> {
    try {
      return await this.dbService.clearOldNews(daysToKeep);
    } catch (error) {
      console.error('Error clearing old news:', error);
      return false;
    }
  }

  // Subscribe to real-time updates
  subscribeToNewsUpdates(callback: (payload: any) => void) {
    return supabaseFixed
      .channel('news_updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'news_items' }, callback)
      .subscribe();
  }

  // Unsubscribe from real-time updates
  unsubscribeFromNewsUpdates() {
    supabaseFixed.channel('news_updates').unsubscribe();
  }
}