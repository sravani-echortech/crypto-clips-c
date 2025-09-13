import type { NewsItem } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseFixed as supabase, getCurrentUser } from './supabaseFixed';

export interface DatabaseNewsItem {
  id: string;
  title: string;
  body: string;
  url: string;
  imageurl?: string;
  source_name: string;
  published_on: number;
  categories: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserFavorite {
  id?: string;
  user_id: string;
  news_id: string;
  created_at?: string;
}

export interface UserPreference {
  id?: string;
  user_id: string;
  preferred_categories: string[];
  created_at?: string;
  updated_at?: string;
}

export interface UserInteraction {
  id?: string;
  user_id: string;
  news_id: string;
  interaction_type: 'view' | 'like' | 'dislike' | 'share' | 'favorite';
  created_at?: string;
}

export class DatabaseService {
  private static instance: DatabaseService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache - increased for better performance
  private connectionRetries = 0;
  private readonly MAX_RETRIES = 3;
  private isConnected = false;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private async getCurrentUserId(): Promise<string> {
    const user = await getCurrentUser();
    if (user) {
      return user.id;
    }
    
    // Fallback to demo user for unauthenticated users
    let demoUserId = await AsyncStorage.getItem('demoUserId');
    if (!demoUserId) {
      demoUserId = 'demo-user-' + Math.random().toString(36).substr(2, 9);
      await AsyncStorage.setItem('demoUserId', demoUserId);
    }
    return demoUserId;
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing database connection...');
      
      const { count, error } = await supabase
        .from('news_items')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('❌ Database connection test failed:', error);
        this.isConnected = false;
        return false;
      }
      
      console.log('✅ Database connection successful');
      this.isConnected = true;
      this.connectionRetries = 0; // Reset retry counter on success
      return true;
    } catch (error) {
      console.error('❌ Database connection test error:', error);
      this.isConnected = false;
      return false;
    }
  }

  private async ensureConnection(): Promise<boolean> {
    if (this.isConnected) {
      return true;
    }

    if (this.connectionRetries >= this.MAX_RETRIES) {
      console.warn('⚠️ Max database connection retries reached, using fallback');
      return false;
    }

    this.connectionRetries++;
    console.log(`🔄 Attempting database connection (attempt ${this.connectionRetries}/${this.MAX_RETRIES})`);
    
    return await this.testConnection();
  }

  async saveNewsItems(newsItems: NewsItem[]): Promise<boolean> {
    try {
      const isConnected = await this.ensureConnection();
      if (!isConnected) {
        console.warn('⚠️ Database not connected, saving to local storage as fallback');
        return await this.saveNewsItemsToLocal(newsItems);
      }

      console.log(`💾 Saving ${newsItems.length} news items to database...`);
      
      const dbNewsItems: DatabaseNewsItem[] = newsItems.map(item => ({
        id: item.id,
        title: item.title,
        body: item.body,
        url: item.url,
        imageurl: item.imageurl,
        source_name: item.source_info.name,
        published_on: item.published_on,
        categories: item.categories,
      }));

      // Use proper upsert to prevent duplicates
      const { data, error } = await supabase
        .from('news_items')
        .upsert(dbNewsItems, { 
          onConflict: 'id',
          ignoreDuplicates: true
        });

      if (error) {
        console.error('❌ Error saving news items to database:', error);
        // Fallback to local storage
        return await this.saveNewsItemsToLocal(newsItems);
      }

      console.log(`✅ Successfully upserted ${newsItems.length} news items to database`);
      return true;
    } catch (error) {
      console.error('❌ Error in saveNewsItems:', error);
      // Fallback to local storage
      return await this.saveNewsItemsToLocal(newsItems);
    }
  }

  private async saveNewsItemsToLocal(newsItems: NewsItem[]): Promise<boolean> {
    try {
      const existingItems = await this.getLocalNewsItems();
      const combinedItems = [...existingItems, ...newsItems];
      
      // Remove duplicates based on ID
      const uniqueItems = combinedItems.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );
      
      // Keep only the latest 100 items
      const limitedItems = uniqueItems.slice(-100);
      
      await AsyncStorage.setItem('localNewsItems', JSON.stringify(limitedItems));
      await AsyncStorage.setItem('localNewsTimestamp', Date.now().toString());
      
      console.log(`✅ Saved ${newsItems.length} news items to local storage`);
      return true;
    } catch (error) {
      console.error('❌ Error saving to local storage:', error);
      return false;
    }
  }

  private async getLocalNewsItems(): Promise<NewsItem[]> {
    try {
      const stored = await AsyncStorage.getItem('localNewsItems');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Error reading local news items:', error);
      return [];
    }
  }

  async getNews(limit: number = 50, categories?: string[]): Promise<NewsItem[]> {
    try {
      // Create cache key based on parameters
      const cacheKey = `news_${limit}_${categories?.join(',') || 'all'}`;
      
      // Check cache first
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        console.log('📋 Returning cached news data');
        return cachedData;
      }

      const isConnected = await this.ensureConnection();
      
      if (isConnected) {
        console.log(`📖 Fetching news items from database...`);
        
        let query = supabase
          .from('news_items')
          .select('*')
          .order('published_on', { ascending: false });

        if (categories && categories.length > 0) {
          // Use array-based filtering for better performance
          query = query.contains('categories_array', categories).limit(limit);
          console.log(`🔍 DB: Filtering by ${categories.length} categories`);
        } else {
          query = query.limit(limit);
          console.log('🔍 DB: Loading all categories');
        }

        const { data, error } = await query;

        if (error) {
          console.error('❌ Database query error:', error);
          throw new Error(`Database query failed: ${error.message}`);
        }

        // 🚀 DEBUG: Log query results
        console.log('🔍 DEBUG: DATABASE QUERY RESULTS');
        console.log('  - Raw Data Count:', data?.length || 0);
        console.log('  - Error:', error);
        console.log('  - First Raw Item (if exists):', data?.[0] ? {
          id: data[0].id,
          title: data[0].title?.substring(0, 50) + '...',
          categories: data[0].categories,
          categories_array: data[0].categories_array
        } : 'No data');

        const newsItems = (data || []).map((item: DatabaseNewsItem) => this.transformDatabaseItem(item));
        
        // Cache the results
        this.setCachedData(cacheKey, newsItems);
        
        console.log(`✅ Retrieved ${newsItems.length} news items from database`);
        console.log('  - Transformed Items Count:', newsItems.length);
        console.log('  - First Transformed Item (if exists):', newsItems[0] ? {
          id: newsItems[0].id,
          title: newsItems[0].title?.substring(0, 50) + '...',
          categories: newsItems[0].categories
        } : 'No data');
        
        return newsItems;
      } else {
        // Fallback to local storage
        console.log('📖 Fetching news items from local storage...');
        const localItems = await this.getLocalNewsItems();
        
        let filteredItems = localItems;
        
        // Apply category filter
        if (categories && categories.length > 0) {
          filteredItems = localItems.filter(item =>
            categories.some(cat => 
              item.categories.toLowerCase().includes(cat.toLowerCase())
            )
          );
        }
        
        // Sort by published date and limit
        const sortedItems = filteredItems
          .sort((a, b) => b.published_on - a.published_on)
          .slice(0, limit);
        
        console.log(`✅ Retrieved ${sortedItems.length} news items from local storage`);
        return sortedItems;
      }
    } catch (error) {
      console.error('❌ Error fetching news from database:', error);
      
      // Final fallback to local storage
      try {
        const localItems = await this.getLocalNewsItems();
        console.log(`✅ Retrieved ${localItems.length} news items from local storage (fallback)`);
        return localItems.slice(0, limit);
      } catch (localError) {
        console.error('❌ Error reading local storage:', localError);
        return [];
      }
    }
  }

  private transformDatabaseItem(item: DatabaseNewsItem): NewsItem {
    return {
      id: item.id,
      title: item.title,
      body: item.body,
      url: item.url,
      imageurl: item.imageurl,
      source_info: {
        name: item.source_name,
      },
      published_on: item.published_on,
      categories: item.categories,
    };
  }

  // Favorites functionality
  async addToFavorites(newsItemId: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      const favorite: UserFavorite = {
        user_id: userId,
        news_id: newsItemId,
      };

      const isConnected = await this.ensureConnection();
      
      if (isConnected) {
        const { error } = await supabase
          .from('favorites')
          .insert([favorite]);

        if (error) {
          if (error.code === '23505') { // Duplicate key error
            console.log('Item already in favorites');
            return true;
          }
          console.error('Error adding to favorites:', error);
          return false;
        }
      } else {
        // Fallback to local storage
        return await this.addToFavoritesLocal(newsItemId);
      }

      console.log('✅ Added to favorites');
      return true;
    } catch (error) {
      console.error('Error in addToFavorites:', error);
      return await this.addToFavoritesLocal(newsItemId);
    }
  }

  private async addToFavoritesLocal(newsItemId: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      const favorites = await this.getLocalFavorites();
      
      // Check if already exists
      if (favorites.some(f => f.news_id === newsItemId)) {
        return true;
      }
      
      favorites.push({
        user_id: userId,
        news_id: newsItemId,
        created_at: new Date().toISOString(),
      });
      
      await AsyncStorage.setItem('localFavorites', JSON.stringify(favorites));
      console.log('✅ Added to local favorites');
      return true;
    } catch (error) {
      console.error('Error adding to local favorites:', error);
      return false;
    }
  }

  private async getLocalFavorites(): Promise<UserFavorite[]> {
    try {
      const stored = await AsyncStorage.getItem('localFavorites');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading local favorites:', error);
      return [];
    }
  }

  async removeFromFavorites(newsItemId: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      const isConnected = await this.ensureConnection();
      
      if (isConnected) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('news_id', newsItemId);

        if (error) {
          console.error('Error removing from favorites:', error);
          return false;
        }
      } else {
        // Fallback to local storage
        return await this.removeFromFavoritesLocal(newsItemId);
      }

      console.log('✅ Removed from favorites');
      return true;
    } catch (error) {
      console.error('Error in removeFromFavorites:', error);
      return await this.removeFromFavoritesLocal(newsItemId);
    }
  }

  private async removeFromFavoritesLocal(newsItemId: string): Promise<boolean> {
    try {
      const favorites = await this.getLocalFavorites();
      const filteredFavorites = favorites.filter(f => f.news_id !== newsItemId);
      
      await AsyncStorage.setItem('localFavorites', JSON.stringify(filteredFavorites));
      console.log('✅ Removed from local favorites');
      return true;
    } catch (error) {
      console.error('Error removing from local favorites:', error);
      return false;
    }
  }

  async getFavorites(): Promise<NewsItem[]> {
    try {
      const userId = await this.getCurrentUserId();
      const isConnected = await this.ensureConnection();
      
      if (isConnected) {
        const { data, error } = await supabase
          .from('favorites')
          .select(`
            news_id,
            news_items (*)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching favorites:', error);
          return [];
        }

        if (!data || data.length === 0) {
          return [];
        }

        return data
          .filter((item: any) => item.news_items)
          .map((item: any) => this.transformDatabaseItem(item.news_items as DatabaseNewsItem));
      } else {
        // Fallback to local storage
        return await this.getLocalFavoritesWithNews();
      }
    } catch (error) {
      console.error('Error in getFavorites:', error);
      return await this.getLocalFavoritesWithNews();
    }
  }

  private async getLocalFavoritesWithNews(): Promise<NewsItem[]> {
    try {
      const favorites = await this.getLocalFavorites();
      const allNews = await this.getLocalNewsItems();
      
      const favoriteNews = favorites
        .map(favorite => allNews.find(news => news.id === favorite.news_id))
        .filter(Boolean) as NewsItem[];
      
      return favoriteNews;
    } catch (error) {
      console.error('Error getting local favorites with news:', error);
      return [];
    }
  }

  async isFavorite(newsItemId: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      const isConnected = await this.ensureConnection();
      
      if (isConnected) {
        const { data, error } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', userId)
          .eq('news_id', newsItemId)
          .limit(1);

        if (error) {
          console.error('Error checking favorite status:', error);
          return false;
        }

        return data && data.length > 0;
      } else {
        // Fallback to local storage
        const favorites = await this.getLocalFavorites();
        return favorites.some(f => f.news_id === newsItemId);
      }
    } catch (error) {
      console.error('Error in isFavorite:', error);
      return false;
    }
  }

  // Get all favorite IDs in a single query for batch processing
  async getAllFavoriteIds(): Promise<string[]> {
    try {
      const userId = await this.getCurrentUserId();
      const isConnected = await this.ensureConnection();
      
      if (isConnected) {
        const { data, error } = await supabase
          .from('favorites')
          .select('news_id')
          .eq('user_id', userId);

        if (error) {
          console.error('Error getting favorite IDs:', error);
          return [];
        }

        return data?.map(item => item.news_id) || [];
      } else {
        // Fallback to local storage
        const favorites = await this.getLocalFavorites();
        return favorites.map(f => f.news_id);
      }
    } catch (error) {
      console.error('Error getting favorite IDs:', error);
      return [];
    }
  }

  // User preferences functionality
  async saveUserPreferences(categories: string[]): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      console.log('🔄 saveUserPreferences called for user:', userId, 'with categories:', categories);
      
      const preference: UserPreference = {
        user_id: userId,
        preferred_categories: categories,
      };

      const isConnected = await this.ensureConnection();
      
      if (isConnected) {
        const { error } = await supabase
          .from('user_preferences')
          .upsert([preference], { onConflict: 'user_id' });

        if (error) {
          console.error('❌ Error saving user preferences to DB:', error.message);
          // Store preferences in AsyncStorage as fallback
          await AsyncStorage.setItem('userPreferences', JSON.stringify(categories));
          console.log('✅ User preferences saved to local storage as fallback');
          return true;
        }

        console.log('✅ User preferences saved to database');
        return true;
      } else {
        // Store preferences in AsyncStorage as fallback
        await AsyncStorage.setItem('userPreferences', JSON.stringify(categories));
        console.log('✅ User preferences saved to local storage as fallback');
        return true;
      }
    } catch (error) {
      console.error('Error in saveUserPreferences:', error);
      // Fallback to AsyncStorage
      try {
        await AsyncStorage.setItem('userPreferences', JSON.stringify(categories));
        console.log('✅ User preferences saved to local storage as fallback');
        return true;
      } catch (storageError) {
        console.error('Error saving to AsyncStorage:', storageError);
        return false;
      }
    }
  }

  async getUserPreferences(): Promise<string[]> {
    try {
      const userId = await this.getCurrentUserId();
      console.log('📱 getUserPreferences called for user:', userId);
      
      const isConnected = await this.ensureConnection();
      
      if (isConnected) {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preferred_categories')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('❌ Error fetching user preferences from DB:', error.message);
          // Try to get from AsyncStorage fallback
          try {
            const stored = await AsyncStorage.getItem('userPreferences');
            if (stored) {
              console.log('📱 Loaded user preferences from local storage');
              return JSON.parse(stored);
            }
          } catch (storageError) {
            console.error('Error reading from AsyncStorage:', storageError);
          }
          
          // Return default preferences for any error
          const defaultPrefs = ['All', 'Bitcoin', 'Ethereum', 'Altcoins'];
          console.log('📱 Using default user preferences');
          return defaultPrefs;
        }

        if (!data || !data.preferred_categories) {
          console.log('No user preferences found in database, using defaults');
          return ['All', 'Bitcoin', 'Ethereum', 'Altcoins'];
        }

        console.log('✅ User preferences loaded from database');
        return data.preferred_categories;
      } else {
        // Try AsyncStorage fallback
        try {
          const stored = await AsyncStorage.getItem('userPreferences');
          if (stored) {
            console.log('📱 Loaded user preferences from local storage as fallback');
            return JSON.parse(stored);
          }
        } catch (storageError) {
          console.error('Error reading from AsyncStorage:', storageError);
        }
        
        const defaultPrefs = ['All', 'Bitcoin', 'Ethereum', 'Altcoins'];
        console.log('📱 Using default user preferences after connection failure');
        return defaultPrefs;
      }
    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      // Try AsyncStorage fallback
      try {
        const stored = await AsyncStorage.getItem('userPreferences');
        if (stored) {
          console.log('📱 Loaded user preferences from local storage as fallback');
          return JSON.parse(stored);
        }
      } catch (storageError) {
        console.error('Error reading from AsyncStorage:', storageError);
      }
      
      const defaultPrefs = ['All', 'Bitcoin', 'Ethereum', 'Altcoins'];
      console.log('📱 Using default user preferences after error');
      return defaultPrefs;
    }
  }

  // User interactions functionality
  async trackInteraction(newsItemId: string, interactionType: 'view' | 'like' | 'dislike' | 'share' | 'favorite'): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      const interaction: UserInteraction = {
        user_id: userId,
        news_id: newsItemId,
        interaction_type: interactionType,
      };

      const isConnected = await this.ensureConnection();
      
      if (isConnected) {
        const { error } = await supabase
          .from('user_interactions')
          .insert([interaction]);

        if (error) {
          console.error('Error tracking interaction:', error);
          return false;
        }
      } else {
        // Fallback to local storage
        return await this.trackInteractionLocal(newsItemId, interactionType);
      }

      return true;
    } catch (error) {
      console.error('Error in trackInteraction:', error);
      return await this.trackInteractionLocal(newsItemId, interactionType);
    }
  }

  private async trackInteractionLocal(newsItemId: string, interactionType: string): Promise<boolean> {
    try {
      const interactions = await this.getLocalInteractions();
      interactions.push({
        user_id: await this.getCurrentUserId(),
        news_id: newsItemId,
        interaction_type: interactionType as any,
        created_at: new Date().toISOString(),
      });
      
      await AsyncStorage.setItem('localInteractions', JSON.stringify(interactions));
      return true;
    } catch (error) {
      console.error('Error tracking local interaction:', error);
      return false;
    }
  }

  private async getLocalInteractions(): Promise<UserInteraction[]> {
    try {
      const stored = await AsyncStorage.getItem('localInteractions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading local interactions:', error);
      return [];
    }
  }

  // Get available categories from news items
  async getAvailableCategories(): Promise<string[]> {
    try {
      const isConnected = await this.ensureConnection();
      
      if (isConnected) {
        const { data, error } = await supabase
          .from('news_items')
          .select('categories')
          .not('categories', 'is', null);

        if (error) {
          console.error('Error fetching categories:', error);
          return [];
        }

        if (!data || data.length === 0) {
          return [];
        }

        const allCategories = new Set<string>();
        data.forEach((item: any) => {
          if (item.categories) {
            const categories = item.categories.split('|').map((cat: string) => cat.trim()).filter((cat: string) => cat.length > 0);
            categories.forEach((cat: string) => allCategories.add(cat));
          }
        });

        return Array.from(allCategories).sort();
      } else {
        // Fallback to local storage
        const localItems = await this.getLocalNewsItems();
        const allCategories = new Set<string>();
        
        localItems.forEach((item) => {
          if (item.categories) {
            const categories = item.categories.split('|').map((cat: string) => cat.trim()).filter((cat: string) => cat.length > 0);
            categories.forEach((cat: string) => allCategories.add(cat));
          }
        });
        
        return Array.from(allCategories).sort();
      }
    } catch (error) {
      console.error('Error in getAvailableCategories:', error);
      return [];
    }
  }

  async clearOldNews(daysToKeep: number = 30): Promise<boolean> {
    try {
      const isConnected = await this.ensureConnection();
      
      if (isConnected) {
        const cutoffTimestamp = Math.floor(Date.now() / 1000) - (daysToKeep * 24 * 60 * 60);
        
        const { error } = await supabase
          .from('news_items')
          .delete()
          .lt('published_on', cutoffTimestamp);

        if (error) {
          console.error('Error clearing old news:', error);
          return false;
        }

        console.log(`✅ Cleared news older than ${daysToKeep} days`);
        return true;
      } else {
        // Fallback to local storage cleanup
        return await this.clearOldNewsLocal(daysToKeep);
      }
    } catch (error) {
      console.error('Error in clearOldNews:', error);
      return await this.clearOldNewsLocal(daysToKeep);
    }
  }

  private async clearOldNewsLocal(daysToKeep: number): Promise<boolean> {
    try {
      const cutoffTimestamp = Math.floor(Date.now() / 1000) - (daysToKeep * 24 * 60 * 60);
      const localItems = await this.getLocalNewsItems();
      
      const filteredItems = localItems.filter(item => item.published_on >= cutoffTimestamp);
      
      await AsyncStorage.setItem('localNewsItems', JSON.stringify(filteredItems));
      console.log(`✅ Cleared local news older than ${daysToKeep} days`);
      return true;
    } catch (error) {
      console.error('Error clearing old local news:', error);
      return false;
    }
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

}