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
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '@/store';
import { useTheme } from '@/contexts/ThemeContext';
import { NewsArticle } from '@/types';
import apiService from '@/services/apiSupabase';
import { SwipeableCardStack } from '@/components';
import { CATEGORIES } from '@/constants';

const InshortsFeedScreenV2: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const categoryScrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  
  // Responsive design helpers using hook for dynamic updates
  const { width: screenWidth } = useWindowDimensions();
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 768;

  // Log screen initialization
  React.useEffect(() => {
    console.log('📰 InshortsFeedScreenV2: Screen initialized', {
      screenWidth,
      isSmallScreen,
      isMediumScreen,
      platform: Platform.OS,
    });
    
    // Log the completion of the entire Google sign-in to clips page flow
    console.log('🎯 COMPLETE FLOW SUCCESS: User has reached the Clips page after Google sign-in!');
  }, [screenWidth, isSmallScreen, isMediumScreen]);
  
  // COMPACT Dynamic responsive values - Reduced by ~40%
  const tabPaddingHorizontal = isSmallScreen ? 6 : isMediumScreen ? 8 : 10;
  const tabPaddingVertical = isSmallScreen ? 3 : isMediumScreen ? 4 : 5;
  const tabFontSize = isSmallScreen ? 14 : isMediumScreen ? 16 : 18;
  const tabMinHeight = isSmallScreen ? 24 : isMediumScreen ? 26 : 28;
  const containerPaddingTop = isSmallScreen ? 6 : 8; // Equal spacing
  const containerPaddingBottom = isSmallScreen ? 6 : 8; // Equal spacing
  
  // Enhanced responsive values for better UX
  const tabBorderRadius = isSmallScreen ? 10 : isMediumScreen ? 12 : 14;
  const tabMarginRight = isSmallScreen ? 4 : isMediumScreen ? 5 : 6;
  const containerPaddingHorizontal = isSmallScreen ? 8 : isMediumScreen ? 10 : 12;
  const tabShadowRadius = 0; // Removed shadow for cleaner look

  // No need for manual dimension listener since we're using useWindowDimensions hook

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCategory, setCurrentCategory] = useState(CATEGORIES[0]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  // Removed categoryLoading state - categories should always be interactive
  
  // Request cancellation
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentRequestRef = useRef<string>('');
  
  const {
    currentFilters,
    addBookmark,
    removeBookmark,
    isBookmarked,
    markArticleAsViewed,
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
    
    console.log('📰 InshortsFeedScreenV2: Loading articles', {
      category: currentCategory.id,
      refresh,
      requestId,
    });
    
    
    try {
      // Cancel previous request
      cancelPreviousRequest();
      
      currentRequestRef.current = requestId;
      
      if (refresh) {
        setRefreshing(true);
        console.log('🔄 InshortsFeedScreenV2: Refreshing articles');
      } else {
        setLoading(true);
        console.log('⏳  InshortsFeedScreenV2: Initial loading');
      }

      const filters = currentCategory.id === 'all' 
        ? currentFilters 
        : { ...currentFilters, categories: [currentCategory.slug] };

      // 🚀 DEBUG: Log detailed filter information
      console.log('🔍  InshortsFeedScreenV2: Filter creation details');
      console.log('  - Current Category ID:', currentCategory.id);
      console.log('  - Current Category Name:', currentCategory.name);
      console.log('  - Current Category Slug:', currentCategory.slug);
      console.log('  - Created Filters:', JSON.stringify(filters, null, 2));
      console.log('  - Is "All" Category?', currentCategory.id === 'all');
      console.log(`📰  InshortsFeedScreenV2: Loading articles for category: ${currentCategory.name} (${currentCategory.id})`, filters);
      
      
      // Check if this request is still current
      if (currentRequestRef.current !== requestId) {
        console.log('Request cancelled, skipping response');
        return;
      }
      
      // Try to get real data first, with force sync if needed
      let response;
      try {
        console.log('🌐  InshortsFeedScreenV2: Calling API service for articles');
        response = await apiService.getFeed(filters);
        console.log(`📊  InshortsFeedScreenV2: API response received - ${response.articles.length} articles`);
        
        // If no articles returned, try force sync
        if (response.articles.length === 0) {
          console.log('⚠️  InshortsFeedScreenV2: No articles found, trying force sync...');
          response = await apiService.forceSyncAndGetFeed(filters);
          console.log(`🔄  InshortsFeedScreenV2: Force sync completed - ${response.articles.length} articles`);
        }
      } catch (error) {
        console.error('❌  InshortsFeedScreenV2: Error getting feed:', error);
        // Fallback to mock data - will be handled by the API service
        response = { articles: [], hasMore: false };
      }
      
      // Check if this request is still current
      if (currentRequestRef.current !== requestId) {
        console.log('Request cancelled, skipping response');
        return;
      }
      
      console.log(`📰  InshortsFeedScreenV2: Loaded ${response.articles.length} articles for ${currentCategory.name}`);
      
      
      // Log first article to check if it's real or mock data
      if (response.articles.length > 0) {
        const firstArticle = response.articles[0];
        console.log('🔍 DATA CHECK:');
        console.log('Article Title:', firstArticle.headline);
        console.log('Source:', firstArticle.sourceName);
        console.log('Is Mock Data?:', firstArticle.headline.includes('Breaking:') ? 'YES - MOCK' : 'NO - REAL DATA');
        console.log('📊 Total articles in state:', response.articles.length);
        console.log('📊 Articles array:', response.articles.map((a: NewsArticle) => a.headline.substring(0, 30) + '...'));
      } else {
        console.log('⚠️ No articles loaded!');
      }
      
      // Deduplicate articles by ID to prevent repeats
      const existingIds = new Set(articles.map(article => article.id));
      const newArticles = response.articles.filter(article => !existingIds.has(article.id));
      
      if (refresh) {
        setArticles(response.articles); // On refresh, replace all articles
        setCurrentIndex(0);
      } else {
        setArticles(response.articles); // On initial load, replace all articles
      }
      
      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
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
    if (loadingMore || !hasMore || articles.length === 0) return;
    
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
      
      // Try to get real data first, with force sync if needed
      let response;
      try {
        response = await apiService.getFeed(filters, nextCursor);
        
        // If no articles returned, try force sync
        if (response.articles.length === 0) {
          console.log('⚠️ No articles found, trying force sync...');
          response = await apiService.forceSyncAndGetFeed(filters);
        }
      } catch (error) {
        console.error('❌ Error getting feed:', error);
        // Fallback to mock data - will be handled by the API service
        response = { articles: [], hasMore: false };
      }
      
      // Check if this request is still current
      if (currentRequestRef.current !== requestId) {
        console.log('Load more request cancelled, skipping response');
        return;
      }
      
      // Deduplicate articles by ID to prevent repeats
      setArticles(prev => {
        const existingIds = new Set(prev.map(article => article.id));
        const newArticles = response.articles.filter(article => !existingIds.has(article.id));
        
        console.log(`📊 LoadMore: Found ${newArticles.length} new articles (${response.articles.length} total, ${existingIds.size} existing)`);
        
        if (newArticles.length === 0) {
          console.log('⚠️ No new articles found, setting hasMore to false');
          setHasMore(false);
          return prev; // Return current articles unchanged
        }
        
        setHasMore(response.hasMore && newArticles.length > 0);
        setNextCursor(response.nextCursor);
        return [...prev, ...newArticles];
      });
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
    }
    
    // Infinite scrolling is now handled by SwipeableCardStack component
  }, [articles, markArticleAsViewed, loadMore]);

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
      await apiService.reactToArticle(articleId, reaction);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Failed to react:', error);
    }
  }, []);

  // Handle bookmark
  const handleBookmark = useCallback((article: NewsArticle) => {
    if (isBookmarked(article.id)) {
      removeBookmark(article.id);
    } else {
      addBookmark(article);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [isBookmarked, addBookmark, removeBookmark]);

  // Handle share
  const handleShare = useCallback(async (article: NewsArticle) => {
    try {
      await Share.share({
        message: `Check out this crypto news: ${article.headline}\n\n${article.url}`,
        title: article.headline,
        url: article.url,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, []);

  // Handle read more
  const handleReadMore = useCallback((article: NewsArticle) => {
    console.log('Navigate to full article:', article.headline);
    // Convert Date objects to strings to avoid navigation serialization warnings
    const serializedArticle = {
      ...article,
      publishedAt: article.publishedAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    };
    (navigation as any).navigate('ArticleViewer', { article: serializedArticle });
  }, [navigation]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    loadArticles(true);
  }, [loadArticles]);

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <StatusBar barStyle="light-content" />

      {/* Responsive Category Tabs - Minimal & Subtle */}
      <View style={[
        styles.categoryContainer,
        {
          paddingTop: containerPaddingTop,
          paddingBottom: containerPaddingBottom,
          paddingHorizontal: containerPaddingHorizontal,
        }
      ]}>
        <ScrollView
          ref={categoryScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryTabs}
          contentContainerStyle={[
            styles.categoryTabsContent,
            {
              paddingHorizontal: isSmallScreen ? 4 : 8,
              paddingRight: isSmallScreen ? 8 : 12,
            }
          ]}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                {
                  paddingHorizontal: tabPaddingHorizontal,
                  paddingVertical: tabPaddingVertical,
                  minHeight: tabMinHeight,
                  marginRight: tabMarginRight,
                  borderRadius: tabBorderRadius,
                  shadowRadius: tabShadowRadius,
                },
                currentCategory.id === category.id && [
                  styles.activeCategoryTab,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                    shadowColor: colors.primary,
                  }
                ],
              ]}
              onPress={() => {
                console.log(`Tab pressed: ${category.name}`);
                // Add haptic feedback for better UX
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCurrentCategory(category);
              }}
              accessible={true}
              accessibilityLabel={`${category.name} category`}
              accessibilityHint={`Switch to ${category.name} news category`}
              accessibilityRole="button"
              accessibilityState={{ selected: currentCategory.id === category.id }}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  { 
                    color: colors.textSecondary,
                    fontSize: tabFontSize,
                    fontWeight: isSmallScreen ? '400' : '500',
                  },
                  currentCategory.id === category.id && styles.activeCategoryTabText,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit={isSmallScreen}
                minimumFontScale={0.8}
              >
                {!isSmallScreen && category.icon} {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Enhanced News Card Area - More Prominent */}
      <View style={styles.newsCardContainer}>
        {loading ? (
          <View style={styles.cardLoadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Loading {currentCategory.name} news...
            </Text>
            <Text style={[styles.loadingSubtext, { color: colors.textSecondary }]}>
              {currentCategory.id === 'all' ? 'Fetching diverse articles...' : `Finding ${currentCategory.name} articles...`}
            </Text>
          </View>
        ) : articles.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="newspaper-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              No {currentCategory.name} articles found
            </Text>
            <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
              Try refreshing or check back later
            </Text>
          </View>
        ) : (
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
            isBookmarked={isBookmarked}
            onLoadMore={loadMore}
            hasMore={hasMore}
            loadingMore={loadingMore}
          />
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },

  // Responsive Category Container - Minimal Space
  categoryContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },

  categoryTabs: {
    flexGrow: 0,
  },
  
  categoryTabsContent: {
    alignItems: 'center',
  },

  // Responsive Category Tabs - Subtle Design
  categoryTab: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  activeCategoryTab: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  categoryTabText: {
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  activeCategoryTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Enhanced News Card Container - More Prominent
  newsCardContainer: {
    flex: 1,
    paddingTop: 8,
  },

  // Loading States
  loadingSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.8,
  },

  // Empty State
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },

  emptyStateSubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.8,
  },

});

export default InshortsFeedScreenV2;