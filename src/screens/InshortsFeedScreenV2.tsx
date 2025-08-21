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
import { rgbaArrayToRGBAColor } from 'react-native-reanimated/lib/typescript/Colors';

const InshortsFeedScreenV2: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const categoryScrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  
  // Responsive design helpers using hook for dynamic updates
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 768;
  const isLargeScreen = screenWidth >= 768;
  
  // Dynamic responsive values
  const tabPaddingHorizontal = isSmallScreen ? 10 : isMediumScreen ? 12 : 16;
  const tabPaddingVertical = isSmallScreen ? 6 : isMediumScreen ? 8 : 10;
  const tabFontSize = isSmallScreen ? 11 : isMediumScreen ? 12 : 13;
  const tabMinHeight = isSmallScreen ? 32 : isMediumScreen ? 36 : 40;
  const containerPaddingTop = Math.max(insets.top, Platform.OS === 'ios' ? (isSmallScreen ? 6 : 8) : (isSmallScreen ? 12 : 16));
  const containerPaddingBottom = isSmallScreen ? 8 : 12;
  
  // Enhanced responsive values for better UX
  const tabBorderRadius = isSmallScreen ? 12 : isMediumScreen ? 14 : 16;
  const tabMarginRight = isSmallScreen ? 6 : isMediumScreen ? 8 : 10;
  const containerPaddingHorizontal = isSmallScreen ? 10 : isMediumScreen ? 12 : 16;
  const tabShadowRadius = isSmallScreen ? 2 : isMediumScreen ? 3 : 4;

  // No need for manual dimension listener since we're using useWindowDimensions hook

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
      
      // Try to get real data first, with force sync if needed
      let response;
      try {
        response = await apiService.getFeed(filters);
        
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
        console.log('📊 Total articles in state:', response.articles.length);
        console.log('📊 Articles array:', response.articles.map((a: NewsArticle) => a.headline.substring(0, 30) + '...'));
      } else {
        console.log('⚠️ No articles loaded!');
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
      
      // Try to get real data first, with force sync if needed
      let response;
      try {
        response = await apiService.getFeed(filters);
        
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
    }
    
    // Load more when near the end
    if (index >= articles.length - 3) {
      loadMore();
    }
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
    (navigation as any).navigate('ArticleViewer', { article });
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
              paddingHorizontal: isSmallScreen ? 8 : 12,
              paddingRight: isSmallScreen ? 12 : 16,
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
                {category.icon} {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Enhanced News Card Area - More Prominent */}
      <View style={styles.newsCardContainer}>
        {loading && articles.length === 0 ? (
          <View style={styles.cardLoadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Loading {currentCategory.name} news...
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
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
});

export default InshortsFeedScreenV2;