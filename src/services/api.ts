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

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate occasional errors for testing
const shouldSimulateError = () => Math.random() < MOCK_CONFIG.MOCK_ERROR_RATE;

export class ApiService {
  // Feed & Articles
  static async getFeed(filters?: FilterState, cursor?: string): Promise<{
    articles: NewsArticle[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    await delay(MOCK_CONFIG.MOCK_DELAY);
    
    if (shouldSimulateError()) {
      throw new Error('Failed to fetch feed');
    }

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
    
    return {
      articles,
      nextCursor: endIndex < filteredArticles.length ? endIndex.toString() : undefined,
      hasMore: endIndex < filteredArticles.length,
    };
  }

  static async getArticle(id: string): Promise<NewsArticle> {
    await delay(MOCK_CONFIG.MOCK_DELAY);
    
    if (shouldSimulateError()) {
      throw new Error('Failed to fetch article');
    }

    const article = MOCK_ARTICLES.find(a => a.id === id);
    if (!article) {
      throw new Error('Article not found');
    }
    
    return article;
  }

  // Search
  static async searchArticles(query: SearchQuery): Promise<{
    articles: NewsArticle[];
    suggestions: string[];
  }> {
    await delay(MOCK_CONFIG.MOCK_DELAY);
    
    if (shouldSimulateError()) {
      throw new Error('Search failed');
    }

    const searchTerm = query.query.toLowerCase();
    const filteredArticles = MOCK_ARTICLES.filter(article =>
      article.headline.toLowerCase().includes(searchTerm) ||
      article.summary.toLowerCase().includes(searchTerm) ||
      article.coins.some(coin => coin.name.toLowerCase().includes(searchTerm)) ||
      article.categories.some(cat => cat.name.toLowerCase().includes(searchTerm))
    );

    // Get relevant suggestions
    const suggestions = MOCK_SEARCH_SUGGESTIONS.filter(suggestion =>
      suggestion.toLowerCase().includes(searchTerm)
    );

    return {
      articles: filteredArticles,
      suggestions,
    };
  }

  static async getSearchSuggestions(query: string): Promise<string[]> {
    await delay(200); // Faster for suggestions
    
    const searchTerm = query.toLowerCase();
    return MOCK_SEARCH_SUGGESTIONS.filter(suggestion =>
      suggestion.toLowerCase().includes(searchTerm)
    ).slice(0, 5);
  }

  static async getTrendingQueries(): Promise<string[]> {
    await delay(MOCK_CONFIG.MOCK_DELAY);
    return MOCK_TRENDING_QUERIES;
  }

  // Coins & Prices
  static async getCoins(): Promise<Coin[]> {
    await delay(MOCK_CONFIG.MOCK_DELAY);
    
    if (shouldSimulateError()) {
      throw new Error('Failed to fetch coins');
    }
    
    return MOCK_COINS;
  }

  static async getCoinPrice(coinId: string): Promise<Coin> {
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
  static async getCategories(): Promise<Category[]> {
    await delay(MOCK_CONFIG.MOCK_DELAY);
    return MOCK_CATEGORIES;
  }

  static async getSources(): Promise<Source[]> {
    await delay(MOCK_CONFIG.MOCK_DELAY);
    return MOCK_SOURCES;
  }

  // Rewards
  static async getRewards(): Promise<Reward[]> {
    await delay(MOCK_CONFIG.MOCK_DELAY);
    
    if (shouldSimulateError()) {
      throw new Error('Failed to fetch rewards');
    }
    
    return MOCK_REWARDS;
  }

  static async redeemReward(rewardId: string): Promise<{
    success: boolean;
    fulfillmentCode?: string;
  }> {
    await delay(MOCK_CONFIG.MOCK_DELAY);
    
    if (shouldSimulateError()) {
      throw new Error('Redemption failed');
    }
    
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
  static async reactToArticle(
    articleId: string, 
    reaction: 'bull' | 'bear' | 'neutral'
  ): Promise<{ success: boolean }> {
    await delay(300); // Faster for interactions
    
    if (shouldSimulateError()) {
      throw new Error('Failed to react');
    }
    
    // In a real app, this would update the article's reaction counts
    return { success: true };
  }

  static async bookmarkArticle(articleId: string): Promise<{ success: boolean }> {
    await delay(300);
    
    if (shouldSimulateError()) {
      throw new Error('Failed to bookmark');
    }
    
    return { success: true };
  }

  static async shareArticle(articleId: string): Promise<{ success: boolean }> {
    await delay(300);
    
    if (shouldSimulateError()) {
      throw new Error('Failed to share');
    }
    
    return { success: true };
  }

  // Analytics
  static async trackView(articleId: string, viewTime: number): Promise<void> {
    await delay(100); // Very fast for analytics
    
    // In a real app, this would send analytics data
    console.log(`Tracked view for article ${articleId}, duration: ${viewTime}ms`);
  }

  static async trackEvent(eventName: string, properties: Record<string, any>): Promise<void> {
    await delay(100);
    
    console.log(`Analytics event: ${eventName}`, properties);
  }
}

export default ApiService;