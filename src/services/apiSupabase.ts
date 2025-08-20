import { 
  NewsArticle, 
  Coin, 
  Category, 
  Source, 
  Reward, 
  FilterState, 
  SearchQuery 
} from '@/types';
import { 
  MOCK_ARTICLES, 
  MOCK_COINS, 
  MOCK_CATEGORIES, 
  MOCK_SOURCES, 
  MOCK_REWARDS,
  MOCK_SEARCH_SUGGESTIONS,
  MOCK_TRENDING_QUERIES
} from './mockData';
import { MOCK_CONFIG } from '@/constants';
import { NewsService } from './newsService';
import { DatabaseService } from '@/lib/database';
import { AuthService } from './auth';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class ApiServiceSupabase {
  private static instance: ApiServiceSupabase;
  private newsService: NewsService;
  private dbService: DatabaseService;
  private authService: AuthService;

  private constructor() {
    this.newsService = NewsService.getInstance();
    this.dbService = DatabaseService.getInstance();
    this.authService = AuthService.getInstance();
  }

  static getInstance(): ApiServiceSupabase {
    if (!ApiServiceSupabase.instance) {
      ApiServiceSupabase.instance = new ApiServiceSupabase();
    }
    return ApiServiceSupabase.instance;
  }

  // Feed & Articles
  async getFeed(filters?: FilterState, cursor?: string): Promise<{
    articles: NewsArticle[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    try {
      console.log('🔍 FETCHING REAL DATA from Supabase...');
      
      // Extract categories from filters
      const categories = filters?.categories || [];
      
      // Fetch news from Supabase
      const newsItems = await this.newsService.fetchNews(categories);
      
      console.log('📊 Supabase returned:', newsItems.length, 'articles');
      
      // Transform to NewsArticle format
      const articles: NewsArticle[] = newsItems.map(item => ({
        id: item.id,
        sourceId: item.source_info.name.toLowerCase().replace(/\s+/g, '-'),
        sourceName: item.source_info.name,
        sourceAvatar: item.imageurl,
        headline: item.title,
        summary: item.body.substring(0, 200) + '...',
        content: item.body,
        url: item.url,
        publishedAt: new Date(item.published_on * 1000),
        updatedAt: new Date(item.published_on * 1000),
        coins: this.extractCoins(item.categories),
        categories: this.extractCategories(item.categories),
        thumbnail: item.imageurl,
        reactions: item.reactions || {
          bull: Math.floor(Math.random() * 100),
          bear: Math.floor(Math.random() * 100),
          neutral: Math.floor(Math.random() * 100),
        },
        isBookmarked: item.isFavorite,
        viewCount: Math.floor(Math.random() * 5000),
        readTime: Math.ceil(item.body.split(' ').length / 200),
      }));
      
      // Apply additional filters
      let filtered = articles;
      
      if (filters) {
        if (filters.highImpactOnly) {
          filtered = filtered.filter(article => article.viewCount > 1000);
        }
        
        if (filters.timeRange && filters.timeRange !== 'all') {
          const now = new Date();
          const timeRanges = {
            'today': 24 * 60 * 60 * 1000,
            'week': 7 * 24 * 60 * 60 * 1000,
            'month': 30 * 24 * 60 * 60 * 1000,
          };
          const range = timeRanges[filters.timeRange as keyof typeof timeRanges];
          if (range) {
            filtered = filtered.filter(article => 
              now.getTime() - new Date(article.publishedAt).getTime() < range
            );
          }
        }
      }
      
      // Handle pagination
      const pageSize = 10;
      const startIndex = cursor ? parseInt(cursor) : 0;
      const endIndex = startIndex + pageSize;
      const paginatedArticles = filtered.slice(startIndex, endIndex);
      
      return {
        articles: paginatedArticles,
        nextCursor: endIndex < filtered.length ? endIndex.toString() : undefined,
        hasMore: endIndex < filtered.length,
      };
    } catch (error) {
      console.error('❌ Error getting feed from Supabase:', error);
      console.log('🔄 Falling back to mock data...');
      // Fallback to mock data
      return this.getFeedMock(filters, cursor);
    }
  }

  private async getFeedMock(filters?: FilterState, cursor?: string): Promise<{
    articles: NewsArticle[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    await delay(MOCK_CONFIG.MOCK_DELAY);
    
    console.log('📰 FALLBACK: Using mock data');
    console.log('📰 MOCK DATA: Total articles available:', MOCK_ARTICLES.length);
    
    let filteredArticles = [...MOCK_ARTICLES];

    // Apply filters
    if (filters) {
      if (filters.categories.length > 0) {
        filteredArticles = filteredArticles.filter(article =>
          article.categories.some(cat => filters.categories.includes(cat.id))
        );
      }
      
      if (filters.coins.length > 0) {
        filteredArticles = filteredArticles.filter(article =>
          article.coins.some(coin => filters.coins.includes(coin.id))
        );
      }
      
      if (filters.sources.length > 0) {
        filteredArticles = filteredArticles.filter(article =>
          filters.sources.includes(article.sourceId)
        );
      }

      if (filters.timeRange !== 'all') {
        const now = new Date();
        const timeThreshold = new Date();
        
        switch (filters.timeRange) {
          case 'today':
            timeThreshold.setHours(0, 0, 0, 0);
            break;
          case 'week':
            timeThreshold.setDate(now.getDate() - 7);
            break;
          case 'month':
            timeThreshold.setMonth(now.getMonth() - 1);
            break;
        }
        
        filteredArticles = filteredArticles.filter(article =>
          new Date(article.publishedAt) >= timeThreshold
        );
      }
    }

    // Simulate pagination
    const pageSize = 10;
    const startIndex = cursor ? parseInt(cursor) : 0;
    const endIndex = startIndex + pageSize;
    const articles = filteredArticles.slice(startIndex, endIndex);
    
    console.log('📰 MOCK DATA: Returning articles:', articles.length);
    console.log('📰 MOCK DATA: First article:', articles[0]?.headline);
    
    return {
      articles,
      nextCursor: endIndex < filteredArticles.length ? endIndex.toString() : undefined,
      hasMore: endIndex < filteredArticles.length,
    };
  }

  async getArticle(id: string): Promise<NewsArticle> {
    try {
      const newsItems = await this.newsService.fetchNews();
      const item = newsItems.find(n => n.id === id);
      
      if (!item) {
        throw new Error('Article not found');
      }
      
      return {
        id: item.id,
        sourceId: item.source_info.name.toLowerCase().replace(/\s+/g, '-'),
        sourceName: item.source_info.name,
        sourceAvatar: item.imageurl,
        headline: item.title,
        summary: item.body.substring(0, 200) + '...',
        content: item.body,
        url: item.url,
        publishedAt: new Date(item.published_on * 1000),
        updatedAt: new Date(item.published_on * 1000),
        coins: this.extractCoins(item.categories),
        categories: this.extractCategories(item.categories),
        thumbnail: item.imageurl,
        reactions: item.reactions || {
          bull: Math.floor(Math.random() * 100),
          bear: Math.floor(Math.random() * 100),
          neutral: Math.floor(Math.random() * 100),
        },
        isBookmarked: item.isFavorite,
        viewCount: Math.floor(Math.random() * 5000),
        readTime: Math.ceil(item.body.split(' ').length / 200),
      };
    } catch (error) {
      console.error('Error getting article:', error);
      const article = MOCK_ARTICLES.find(a => a.id === id);
      if (!article) {
        throw new Error('Article not found');
      }
      return article;
    }
  }

  // Search
  async searchArticles(query: SearchQuery): Promise<{
    articles: NewsArticle[];
    suggestions: string[];
  }> {
    try {
      const results = await this.newsService.searchNews(query.query);
      
      const articles = results.map(item => ({
        id: item.id,
        sourceId: item.source_info.name.toLowerCase().replace(/\s+/g, '-'),
        sourceName: item.source_info.name,
        sourceAvatar: item.imageurl,
        headline: item.title,
        summary: item.body.substring(0, 200) + '...',
        content: item.body,
        url: item.url,
        publishedAt: new Date(item.published_on * 1000),
        updatedAt: new Date(item.published_on * 1000),
        coins: this.extractCoins(item.categories),
        categories: this.extractCategories(item.categories),
        thumbnail: item.imageurl,
        reactions: item.reactions || {
          bull: 0,
          bear: 0,
          neutral: 0,
        },
        isBookmarked: item.isFavorite,
        viewCount: Math.floor(Math.random() * 5000),
        readTime: Math.ceil(item.body.split(' ').length / 200),
      }));
      
      // Get relevant suggestions
      const suggestions = MOCK_SEARCH_SUGGESTIONS.filter(suggestion =>
        suggestion.toLowerCase().includes(query.query.toLowerCase())
      );
      
      return { articles, suggestions };
    } catch (error) {
      console.error('Error searching news:', error);
      // Fallback to mock search
      const searchTerm = query.query.toLowerCase();
      const filteredArticles = MOCK_ARTICLES.filter(article =>
        article.headline.toLowerCase().includes(searchTerm) ||
        article.summary.toLowerCase().includes(searchTerm)
      );
      
      const suggestions = MOCK_SEARCH_SUGGESTIONS.filter(suggestion =>
        suggestion.toLowerCase().includes(searchTerm)
      );
      
      return { articles: filteredArticles, suggestions };
    }
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    await delay(200); // Faster for suggestions
    
    const searchTerm = query.toLowerCase();
    return MOCK_SEARCH_SUGGESTIONS.filter(suggestion =>
      suggestion.toLowerCase().includes(searchTerm)
    ).slice(0, 5);
  }

  async getTrendingQueries(): Promise<string[]> {
    await delay(MOCK_CONFIG.MOCK_DELAY);
    return MOCK_TRENDING_QUERIES;
  }

  // Coins & Prices
  async getCoins(): Promise<Coin[]> {
    await delay(MOCK_CONFIG.MOCK_DELAY);
    return MOCK_COINS;
  }

  async getCoinPrice(coinId: string): Promise<Coin> {
    await delay(MOCK_CONFIG.MOCK_DELAY);
    
    const coin = MOCK_COINS.find(c => c.id === coinId);
    if (!coin) {
      throw new Error('Coin not found');
    }
    
    // Simulate price fluctuation
    const fluctuation = (Math.random() - 0.5) * 0.02; // ±1% fluctuation
    const newPrice = coin.currentPrice! * (1 + fluctuation);
    const priceChange = newPrice - coin.currentPrice!;
    const percentageChange = (priceChange / coin.currentPrice!) * 100;
    
    return {
      ...coin,
      currentPrice: newPrice,
      priceChange24h: priceChange,
      priceChangePercentage24h: percentageChange,
    };
  }

  // Categories & Sources
  async getCategories(): Promise<Category[]> {
    try {
      const availableCategories = await this.newsService.getAvailableCategories();
      
      // Map to Category format
      return availableCategories.map((cat, index) => ({
        id: cat.toLowerCase(),
        name: cat,
        slug: cat.toLowerCase(),
        icon: '📰',
        color: MOCK_CATEGORIES[index % MOCK_CATEGORIES.length]?.color || '#000000',
      }));
    } catch (error) {
      console.error('Error getting categories:', error);
      return MOCK_CATEGORIES;
    }
  }

  async getSources(): Promise<Source[]> {
    await delay(MOCK_CONFIG.MOCK_DELAY);
    return MOCK_SOURCES;
  }

  // Rewards
  async getRewards(): Promise<Reward[]> {
    await delay(MOCK_CONFIG.MOCK_DELAY);
    return MOCK_REWARDS;
  }

  async redeemReward(rewardId: string): Promise<{
    success: boolean;
    fulfillmentCode?: string;
  }> {
    await delay(MOCK_CONFIG.MOCK_DELAY);
    
    const reward = MOCK_REWARDS.find(r => r.id === rewardId);
    if (!reward) {
      throw new Error('Reward not found');
    }
    
    if (!reward.isAvailable || (reward.inventory !== undefined && reward.inventory <= 0)) {
      throw new Error('Reward not available');
    }
    
    return {
      success: true,
      fulfillmentCode: Math.random().toString(36).substring(2, 15).toUpperCase(),
    };
  }

  // Reactions & Interactions
  async reactToArticle(
    articleId: string, 
    reaction: 'bull' | 'bear' | 'neutral'
  ): Promise<{ success: boolean }> {
    try {
      await this.newsService.trackInteraction(
        articleId, 
        reaction === 'bull' ? 'like' : reaction === 'bear' ? 'dislike' : 'view'
      );
      return { success: true };
    } catch (error) {
      console.error('Error tracking reaction:', error);
      return { success: false };
    }
  }

  async bookmarkArticle(articleId: string, currentStatus: boolean = false): Promise<{ success: boolean }> {
    try {
      const success = await this.newsService.toggleFavorite(articleId, currentStatus);
      return { success };
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      return { success: false };
    }
  }

  async shareArticle(articleId: string): Promise<{ success: boolean }> {
    try {
      await this.newsService.trackInteraction(articleId, 'share');
      return { success: true };
    } catch (error) {
      console.error('Error tracking share:', error);
      return { success: false };
    }
  }

  // Get user's bookmarks
  async getBookmarks(): Promise<NewsArticle[]> {
    try {
      const favorites = await this.newsService.getFavorites();
      
      return favorites.map(item => ({
        id: item.id,
        sourceId: item.source_info.name.toLowerCase().replace(/\s+/g, '-'),
        sourceName: item.source_info.name,
        sourceAvatar: item.imageurl,
        headline: item.title,
        summary: item.body.substring(0, 200) + '...',
        content: item.body,
        url: item.url,
        publishedAt: new Date(item.published_on * 1000),
        updatedAt: new Date(item.published_on * 1000),
        coins: this.extractCoins(item.categories),
        categories: this.extractCategories(item.categories),
        thumbnail: item.imageurl,
        reactions: item.reactions || {
          bull: 0,
          bear: 0,
          neutral: 0,
        },
        isBookmarked: true,
        viewCount: Math.floor(Math.random() * 5000),
        readTime: Math.ceil(item.body.split(' ').length / 200),
      }));
    } catch (error) {
      console.error('Error getting bookmarks:', error);
      return [];
    }
  }

  // Analytics
  async trackView(articleId: string, viewTime: number): Promise<void> {
    try {
      await this.newsService.trackInteraction(articleId, 'view');
      console.log(`Tracked view for article ${articleId}, duration: ${viewTime}ms`);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }

  async trackEvent(eventName: string, properties: Record<string, any>): Promise<void> {
    console.log(`Analytics event: ${eventName}`, properties);
  }

  // Sync news from API
  async syncNews(): Promise<boolean> {
    try {
      console.log('🔄 Starting manual news sync...');
      const result = await this.newsService.syncNews();
      console.log('✅ News sync result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error syncing news:', error);
      return false;
    }
  }

  // Force sync and get fresh data
  async forceSyncAndGetFeed(filters?: FilterState): Promise<{
    articles: NewsArticle[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    try {
      console.log('🔄 Force syncing news from API...');
      await this.syncNews();
      
      // Wait a bit for the sync to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Now try to get the feed again
      return await this.getFeed(filters);
    } catch (error) {
      console.error('❌ Error in force sync:', error);
      return this.getFeedMock(filters);
    }
  }

  // Helper methods
  private extractCoins(categoriesString: string): Coin[] {
    const coins: Coin[] = [];
    const lowerCategories = categoriesString.toLowerCase();
    
    if (lowerCategories.includes('bitcoin') || lowerCategories.includes('btc')) {
      coins.push(MOCK_COINS[0]); // Bitcoin
    }
    if (lowerCategories.includes('ethereum') || lowerCategories.includes('eth')) {
      coins.push(MOCK_COINS[1]); // Ethereum
    }
    if (lowerCategories.includes('cardano') || lowerCategories.includes('ada')) {
      const cardano = MOCK_COINS.find(c => c.symbol === 'ADA');
      if (cardano) coins.push(cardano);
    }
    if (lowerCategories.includes('solana') || lowerCategories.includes('sol')) {
      const solana = MOCK_COINS.find(c => c.symbol === 'SOL');
      if (solana) coins.push(solana);
    }
    
    return coins.length > 0 ? coins : [MOCK_COINS[0]]; // Default to Bitcoin
  }

  private extractCategories(categoriesString: string): Category[] {
    const categories: Category[] = [];
    const lowerCategories = categoriesString.toLowerCase();
    
    MOCK_CATEGORIES.forEach(cat => {
      if (lowerCategories.includes(cat.slug.toLowerCase())) {
        categories.push(cat);
      }
    });
    
    return categories.length > 0 ? categories : [MOCK_CATEGORIES[0]]; // Default to first category
  }
}

// Export singleton instance
const apiService = ApiServiceSupabase.getInstance();
export default apiService;