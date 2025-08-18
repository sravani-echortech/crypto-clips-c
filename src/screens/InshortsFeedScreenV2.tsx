import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '@/store';
import { useTheme } from '@/contexts/ThemeContext';
import { NewsArticle } from '@/types';
import ApiService from '@/services/apiSupabase';
import { SwipeableCardStack } from '@/components';
import { CATEGORIES } from '@/constants';

const InshortsFeedScreenV2: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const categoryScrollRef = useRef<ScrollView>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCategory, setCurrentCategory] = useState(CATEGORIES[0]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Request cancellation
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentRequestRef = useRef<string>('');
  
  const {
    currentFilters,
    addBookmark,
    removeBookmark,
    isBookmarked,
    markArticleAsViewed,
    addTokens,
    streak,
    tokens,
  } = useStore();

  // Cancel previous request
  const cancelPreviousRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
  }, []);

  // Load articles
  const loadArticles = useCallback(async (refresh = false) => {
    const requestId = `${currentCategory.id}-${Date.now()}`;
    
    try {
      // Cancel previous request
      cancelPreviousRequest();
      
      currentRequestRef.current = requestId;
      
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const filters = currentCategory.id === 'all' 
        ? currentFilters 
        : { ...currentFilters, categories: [currentCategory.slug] };

      console.log(`Loading articles for category: ${currentCategory.name} (${currentCategory.id})`, filters);
      
      // Check if this request is still current
      if (currentRequestRef.current !== requestId) {
        console.log('Request cancelled, skipping response');
        return;
      }
      
      const response = await ApiService.getFeed(filters);
      
      // Check if this request is still current
      if (currentRequestRef.current !== requestId) {
        console.log('Request cancelled, skipping response');
        return;
      }
      
      console.log(`Loaded ${response.articles.length} articles for ${currentCategory.name}`);
      
      // Log first article to check if it's real or mock data
      if (response.articles.length > 0) {
        const firstArticle = response.articles[0];
        console.log('🔍 DATA CHECK:');
        console.log('Article Title:', firstArticle.headline);
        console.log('Source:', firstArticle.sourceName);
        console.log('Is Mock Data?:', firstArticle.headline.includes('Breaking:') ? 'YES - MOCK' : 'NO - REAL DATA');
      }
      
      if (refresh) {
        setArticles(response.articles);
        setCurrentIndex(0);
      } else {
        setArticles(response.articles);
      }
      
      setHasMore(response.hasMore);
    } catch (error: any) {
      // Don't update state if request was cancelled
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }
      
      console.error(`Failed to load articles for ${currentCategory.name}:`, error);
      // Set empty articles on error
      setArticles([]);
    } finally {
      // Only update loading state if this is still the current request
      if (currentRequestRef.current === requestId) {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    }
  }, [currentFilters, currentCategory, cancelPreviousRequest]);

  // Load more articles
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    const requestId = `loadmore-${Date.now()}`;
    
    try {
      // Cancel previous request
      cancelPreviousRequest();
      
      currentRequestRef.current = requestId;
      
      setLoadingMore(true);
      
      const filters = currentCategory.id === 'all' 
        ? currentFilters 
        : { ...currentFilters, categories: [currentCategory.slug] };
      
      // Check if this request is still current
      if (currentRequestRef.current !== requestId) {
        console.log('Load more request cancelled, skipping response');
        return;
      }
      
      const response = await ApiService.getFeed(filters);
      
      // Check if this request is still current
      if (currentRequestRef.current !== requestId) {
        console.log('Load more request cancelled, skipping response');
        return;
      }
      
      setArticles(prev => [...prev, ...response.articles]);
      setHasMore(response.hasMore);
    } catch (error: any) {
      // Don't update state if request was cancelled
      if (error.name === 'AbortError') {
        console.log('Load more request was cancelled');
        return;
      }
      
      console.error('Failed to load more:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, currentFilters, currentCategory, cancelPreviousRequest]);

  useEffect(() => {
    loadArticles();
    // Auto-scroll category tabs to show active category
    const categoryIndex = CATEGORIES.findIndex(c => c.id === currentCategory.id);
    if (categoryScrollRef.current && categoryIndex >= 0) {
      const scrollPosition = Math.max(0, categoryIndex * 120 - 100);
      categoryScrollRef.current.scrollTo({ x: scrollPosition, animated: true });
    }
  }, [currentCategory.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelPreviousRequest();
    };
  }, [cancelPreviousRequest]);

  // Handle article index change
  const handleIndexChange = useCallback((index: number) => {
    setCurrentIndex(index);
    
    const article = articles[index];
    if (article) {
      markArticleAsViewed(article.id);
      addTokens(1, 'Article viewed');
    }
    
    // Load more when near the end
    if (index >= articles.length - 3) {
      loadMore();
    }
  }, [articles, markArticleAsViewed, addTokens, loadMore]);

  // Handle horizontal swipe for category change
  const handleCategorySwipe = useCallback((direction: 'left' | 'right') => {
    try {
      const currentIdx = CATEGORIES.findIndex(c => c.id === currentCategory.id);
      console.log(`Current category index: ${currentIdx}, Total categories: ${CATEGORIES.length}`);
      console.log(`Swipe direction: ${direction}`);
      
      let newIdx = currentIdx;
      
      if (direction === 'left') {
        if (currentIdx < CATEGORIES.length - 1) {
          newIdx = currentIdx + 1;
        } else {
          console.log('Already at last category');
          return;
        }
      } else if (direction === 'right') {
        if (currentIdx > 0) {
          newIdx = currentIdx - 1;
        } else {
          console.log('Already at first category');
          return;
        }
      }
      
      if (newIdx >= 0 && newIdx < CATEGORIES.length) {
        console.log(`Switching from ${CATEGORIES[currentIdx].name} (${currentIdx}) to ${CATEGORIES[newIdx].name} (${newIdx})`);
        setCurrentCategory(CATEGORIES[newIdx]);
        setCurrentIndex(0); // Reset to first article in new category
      }
    } catch (error) {
      console.error('Error in handleCategorySwipe:', error);
    }
  }, [currentCategory]);

  // Handle reactions
  const handleReaction = useCallback(async (articleId: string, reaction: 'bull' | 'bear' | 'neutral') => {
    try {
      await ApiService.reactToArticle(articleId, reaction);
      addTokens(2, 'Article reaction');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Failed to react:', error);
    }
  }, [addTokens]);

  // Handle bookmark
  const handleBookmark = useCallback((article: NewsArticle) => {
    if (isBookmarked(article.id)) {
      removeBookmark(article.id);
    } else {
      addBookmark(article);
      addTokens(1, 'Article bookmarked');
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [isBookmarked, addBookmark, removeBookmark, addTokens]);

  // Handle share
  const handleShare = useCallback(async (article: NewsArticle) => {
    try {
      await Share.share({
        message: `Check out this crypto news: ${article.headline}\n\n${article.url}`,
        title: article.headline,
        url: article.url,
      });
      addTokens(5, 'Article shared');
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [addTokens]);

  // Handle read more
  const handleReadMore = useCallback((article: NewsArticle) => {
    console.log('Navigate to full article:', article.headline);
    (navigation as any).navigate('ArticleViewer', { article });
  }, [navigation]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    loadArticles(true);
  }, [loadArticles]);

  if (loading && articles.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading crypto news...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="default" />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>CryptoClips</Text>
          <View style={styles.headerStats}>
            <View style={styles.streakChip}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={[styles.streakText, { color: colors.text }]}>
                {streak.current}
              </Text>
            </View>
            <View style={[styles.tokenChip, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.tokenText, { color: colors.primary }]}>
                🪙 {tokens.balance}
              </Text>
            </View>
          </View>
        </View>

        {/* Category Tabs */}
        <ScrollView 
          ref={categoryScrollRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryTabs}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                currentCategory.id === category.id && styles.activeCategoryTab,
                currentCategory.id === category.id && { backgroundColor: colors.primary }
              ]}
              onPress={() => {
                console.log(`Tab pressed: ${category.name}`);
                setCurrentCategory(category);
              }}
            >
              <Text 
                style={[
                  styles.categoryTabText,
                  { color: currentCategory.id === category.id ? '#fff' : colors.textSecondary }
                ]}
              >
                {category.icon} {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Swipeable Card Stack */}
      <SwipeableCardStack
        articles={articles}
        currentCategoryName={currentCategory.name}
        onIndexChange={handleIndexChange}
        onReaction={handleReaction}
        onBookmark={handleBookmark}
        onShare={handleShare}
        onReadMore={handleReadMore}
        onSwipeHorizontal={handleCategorySwipe}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 30,
    paddingBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 100,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerStats: {
    flexDirection: 'row',
    gap: 10,
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tokenChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tokenText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTabs: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
  },
  activeCategoryTab: {
    transform: [{ scale: 1.05 }],
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default InshortsFeedScreenV2;