import { 
  NewsArticle, 
  Category, 
  FilterState, 
  SearchQuery 
} from '@/types';
import { 
  MOCK_ARTICLES, 
  MOCK_COINS, 
  MOCK_CATEGORIES, 
  MOCK_SEARCH_SUGGESTIONS
} from './mockData';
import { MOCK_CONFIG } from '@/constants';
import { NewsService } from './newsService';
import { DatabaseService } from '@/lib/database';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class ApiServiceSupabase {
  private static instance: ApiServiceSupabase;
  private newsService: NewsService;
  private dbService: DatabaseService;

  private constructor() {
    this.newsService = NewsService.getInstance();
    this.dbService = DatabaseService.getInstance();
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
      
      // 🚀 DEBUG: Log filter processing
      console.log('🔍 DEBUG: API SERVICE FILTER PROCESSING');
      console.log('  - Received Filters:', JSON.stringify(filters, null, 2));
      console.log('  - Extracted Categories:', categories);
      console.log('  - Categories Length:', categories.length);
      console.log('  - Categories Type:', typeof categories);
      console.log('  - Is Array?', Array.isArray(categories));
      
      // 🚀 INFINITE SCROLL: Pass current article count for smart refresh
      const currentArticleCount = cursor ? parseInt(cursor) + 10 : 0; // Estimate current count
      const newsItems = await this.newsService.fetchNews(categories, false, currentArticleCount);
      
      console.log('📊 Supabase returned:', newsItems.length, 'articles');
      
      // Transform to NewsArticle format
      const articles: NewsArticle[] = newsItems.map(item => ({
        id: item.id,
        sourceId: item.source_info.name.toLowerCase().replace(/\s+/g, '-'),
        sourceName: item.source_info.name,
        sourceAvatar: item.imageurl,
        headline: this.optimizeHeadline(item.title),
        summary: this.generateSummary(item.body),
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
      
      // 🚀 DEBUG: Log pagination details
      console.log('🔍 DEBUG: API SERVICE PAGINATION');
      console.log('  - Total Articles Before Pagination:', filtered.length);
      console.log('  - Categories Present:', categories && categories.length > 0);
      console.log('  - Page Size:', categories && categories.length > 0 ? 20 : 10);
      
      // 🚀 OPTIMIZED: Smaller page sizes for faster initial load
      const pageSize = categories && categories.length > 0 ? 15 : 10;  // 15 for categories, 10 for "All"
      const startIndex = cursor ? parseInt(cursor) : 0;
      const endIndex = startIndex + pageSize;
      const paginatedArticles = filtered.slice(startIndex, endIndex);
      
      console.log('  - Pagination Details:');
      console.log('    - Page Size:', pageSize);
      console.log('    - Start Index:', startIndex);
      console.log('    - End Index:', endIndex);
      console.log('    - Articles After Pagination:', paginatedArticles.length);
      console.log('    - Total Filtered Articles:', filtered.length);
      console.log('    - Has More:', endIndex < filtered.length);
      console.log('    - Next Cursor:', endIndex < filtered.length ? endIndex.toString() : undefined);
      console.log('    - Cursor Received:', cursor);
      
      return {
        articles: paginatedArticles,
        nextCursor: endIndex < filtered.length ? endIndex.toString() : undefined,
        hasMore: endIndex < filtered.length,
      };
    } catch (error) {
      console.error('❌ Error getting feed from Supabase:', error);
      console.log('🔄 Falling back to mock data...');
      
      // Run debug diagnostics
      console.log('🔍 Running connection diagnostics...');
      const debugResults = await this.debugConnections();
      
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
        headline: this.optimizeHeadline(item.title),
        summary: this.generateSummary(item.body),
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
        headline: this.optimizeHeadline(item.title),
        summary: this.generateSummary(item.body),
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
        headline: this.optimizeHeadline(item.title),
        summary: this.generateSummary(item.body),
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

  // Debug function to test all connections
  async debugConnections(): Promise<{
    supabase: boolean;
    cryptoApi: boolean;
    database: boolean;
    newsService: boolean;
    errors: string[];
  }> {
    const results = {
      supabase: false,
      cryptoApi: false,
      database: false,
      newsService: false,
      errors: [] as string[]
    };

    console.log('🔍 DEBUGGING ALL CONNECTIONS...');

    // Test 0: Environment Variables
    console.log('🔧 Checking environment variables...');
    console.log('  - EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('  - EXPO_PUBLIC_SUPABASE_ANON_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
    console.log('  - EXPO_PUBLIC_CRYPTO_API_BASE_URL:', process.env.EXPO_PUBLIC_CRYPTO_API_BASE_URL ? 'SET' : 'NOT SET');
    console.log('  - EXPO_PUBLIC_CRYPTO_API_KEY:', process.env.EXPO_PUBLIC_CRYPTO_API_KEY ? 'SET' : 'NOT SET');

    // Test 1: Supabase Connection
    try {
      console.log('📡 Testing Supabase connection...');
      const { testSupabaseConnection } = await import('@/lib/supabaseFixed');
      const supabaseResult = await testSupabaseConnection();
      results.supabase = supabaseResult.auth && supabaseResult.database;
      console.log('✅ Supabase:', results.supabase ? 'CONNECTED' : 'FAILED');
    } catch (error) {
      results.errors.push(`Supabase: ${error}`);
      console.error('❌ Supabase test failed:', error);
    }

    // Test 2: CryptoCompare API
    try {
      console.log('🌐 Testing CryptoCompare API...');
      const cryptoApi = this.newsService['cryptoApi'];
      const apiResult = await cryptoApi.testConnection();
      results.cryptoApi = apiResult;
      console.log('✅ CryptoCompare API:', results.cryptoApi ? 'CONNECTED' : 'FAILED');
    } catch (error) {
      results.errors.push(`CryptoCompare API: ${error}`);
      console.error('❌ CryptoCompare API test failed:', error);
    }

    // Test 3: Database Service
    try {
      console.log('🗄️ Testing Database Service...');
      const dbResult = await this.dbService.testConnection();
      results.database = dbResult;
      console.log('✅ Database Service:', results.database ? 'CONNECTED' : 'FAILED');
    } catch (error) {
      results.errors.push(`Database Service: ${error}`);
      console.error('❌ Database Service test failed:', error);
    }

    // Test 4: News Service
    try {
      console.log('📰 Testing News Service...');
      const newsResult = await this.newsService.fetchNews([], true);
      results.newsService = newsResult.length > 0;
      console.log('✅ News Service:', results.newsService ? `CONNECTED (${newsResult.length} articles)` : 'FAILED');
    } catch (error) {
      results.errors.push(`News Service: ${error}`);
      console.error('❌ News Service test failed:', error);
    }

    console.log('📊 FINAL DEBUG RESULTS:', results);
    return results;
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
  private generateSummary(fullContent: string): string {
    // Clean the content
    const cleanContent = fullContent
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s.,!?]/g, '') // Remove special characters except basic punctuation
      .trim();
    
    // Split into sentences
    const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length === 0) {
      return cleanContent.substring(0, 150) + '...';
    }
    
    // For crypto news, prioritize sentences with key terms
    const keyTerms = ['bitcoin', 'ethereum', 'crypto', 'blockchain', 'price', 'market', 'trading', 'defi', 'nft'];
    
    // Score sentences based on key terms and length
    const scoredSentences = sentences.map(sentence => {
      const lowerSentence = sentence.toLowerCase();
      let score = 0;
      
      // Score based on key terms
      keyTerms.forEach(term => {
        if (lowerSentence.includes(term)) {
          score += 2;
        }
      });
      
      // Prefer sentences of medium length (not too short, not too long)
      const length = sentence.trim().length;
      if (length > 50 && length < 200) {
        score += 1;
      }
      
      // Prefer sentences that start with capital letters (likely proper sentences)
      if (/^[A-Z]/.test(sentence.trim())) {
        score += 1;
      }
      
      return { sentence: sentence.trim(), score };
    });
    
    // Sort by score and take the best sentences
    const sortedSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Take top 3 sentences for more content
    
    // If no good sentences found, fall back to first sentence
    if (sortedSentences.length === 0 || sortedSentences[0].score === 0) {
      const firstSentence = sentences[0]?.trim();
      return firstSentence ? firstSentence.substring(0, 150) + '...' : cleanContent.substring(0, 150) + '...';
    }
    
    // Combine sentences to fill available space without truncation
    let summary = '';
    let wordCount = 0;
    const maxWords = 55; // Maximum words for more detailed content (~275-330 characters)
    
    for (const sentenceData of sortedSentences) {
      const sentence = sentenceData.sentence;
      const sentenceWords = sentence.split(' ');
      
      // Check if adding this sentence would exceed our limit
      if (wordCount + sentenceWords.length > maxWords) {
        break; // Stop here to avoid truncation
      }
      
      // Add the complete sentence
      if (summary) {
        summary += '. ' + sentence;
      } else {
        summary = sentence;
      }
      wordCount += sentenceWords.length;
    }
    
    // Ensure the summary ends with a proper full stop
    if (summary && !summary.endsWith('.')) {
      summary += '.';
    }
    
    return summary;
  }

  private optimizeHeadline(headline: string): string {
    // Clean the headline
    const cleanHeadline = headline.trim();
    
    // For mobile display with 2 lines max, aim for ~60-70 characters
    // This accounts for font size 18px and typical mobile screen width
    const maxChars = 65;
    
    if (cleanHeadline.length <= maxChars) {
      return cleanHeadline;
    }
    
    // Try to break at natural word boundaries
    const truncated = cleanHeadline.substring(0, maxChars);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxChars * 0.7) { // If we can break at a reasonable point
      return cleanHeadline.substring(0, lastSpace);
    }
    
    // If no good break point, just truncate
    return truncated;
  }

  private extractCoins(categoriesString: string): any[] {
    const coins: any[] = [];
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