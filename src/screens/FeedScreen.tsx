import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  FlatList, 
  RefreshControl, 
  StyleSheet, 
  Text,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';
import { useStore } from '@/store';
import { useToast } from '@/hooks';
import { NewsArticle, FilterState } from '@/types';
import { CATEGORIES } from '@/constants';

import {
  SafeContainer,
  ResponsiveAppHeader,
  NewsCard,
  LoadingSpinner,
  EmptyState,
  FilterChip,
  FiltersBottomSheet,
} from '@/components';

import ApiService from '@/services/apiSupabase';

const FeedScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  
  const {
    currentFilters,
    updateFilters,
    resetFilters,
    streak,
    tokens,
    addBookmark,
    removeBookmark,
    isBookmarked,
    markArticleAsViewed,
    addTokens,
  } = useStore();

  // State
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Load initial feed
  const loadFeed = useCallback(async (refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        setError(null);
      } else if (!refresh && articles.length === 0) {
        setLoading(true);
      }

      const response = await ApiService.getFeed(currentFilters);
      
      if (refresh) {
        setArticles(response.articles);
      } else {
        setArticles(prev => refresh ? response.articles : [...prev, ...response.articles]);
      }
      
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
      setError(null);
      
    } catch (err) {
      console.error('Failed to load feed:', err);
      setError('Failed to load articles. Please try again.');
      toast.showError('Failed to load feed', 'Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentFilters, articles.length, toast]);

  // Load more articles (pagination)
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !nextCursor) return;

    try {
      setLoadingMore(true);
      const response = await ApiService.getFeed(currentFilters, nextCursor);
      
      setArticles(prev => [...prev, ...response.articles]);
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
      
    } catch (err) {
      console.error('Failed to load more articles:', err);
      toast.showError('Failed to load more articles');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, nextCursor, currentFilters, toast]);

  // Initial load and refresh when filters change
  useEffect(() => {
    loadFeed(true);
  }, [currentFilters]);

  // Handle article interactions
  const handleArticlePress = useCallback((article: NewsArticle) => {
    markArticleAsViewed(article.id);
    addTokens(1, 'Article viewed');
    
    // navigation.navigate('ArticleViewer', { article });
    console.log('Navigate to article:', article.headline);
  }, [markArticleAsViewed, addTokens]);

  const handleReaction = useCallback(async (articleId: string, reaction: 'bull' | 'bear' | 'neutral') => {
    try {
      await ApiService.reactToArticle(articleId, reaction);
      addTokens(2, 'Article reaction');
      toast.showSuccess('Reaction added!');
    } catch (error) {
      toast.showError('Failed to react', 'Please try again');
    }
  }, [addTokens, toast]);

  const handleBookmark = useCallback((article: NewsArticle) => {
    const isAlreadyBookmarked = isBookmarked(article.id);
    
    if (isAlreadyBookmarked) {
      removeBookmark(article.id);
      toast.showSuccess('Bookmark removed');
    } else {
      addBookmark(article);
      toast.showSuccess('Article bookmarked');
    }
  }, [isBookmarked, addBookmark, removeBookmark, toast]);

  const handleShare = useCallback(async (article: NewsArticle) => {
    try {
      await ApiService.shareArticle(article.id);
      addTokens(5, 'Shared article');
      
      // In a real app, this would trigger native share
      Alert.alert('Share', `Would share: ${article.headline}`);
      toast.showSuccess('Article shared', 'Thanks for spreading the news!');
    } catch (error) {
      toast.showError('Failed to share', 'Please try again');
    }
  }, [addTokens, toast]);

  // Handle filter selection
  const handleFilterPress = useCallback((categoryId: string) => {
    const isSelected = currentFilters.categories.includes(categoryId);
    
    if (categoryId === 'all') {
      resetFilters();
    } else {
      updateFilters({
        categories: isSelected 
          ? currentFilters.categories.filter(id => id !== categoryId)
          : [...currentFilters.categories, categoryId]
      });
    }
  }, [currentFilters.categories, updateFilters, resetFilters]);

  const handleFiltersPress = useCallback(() => {
    // navigation.navigate('FilterSheet', { currentFilters });
    console.log('Navigate to filters');
  }, [currentFilters]);

  const handleSearchPress = useCallback(() => {
    // navigation.navigate('Search');
    console.log('Navigate to search');
  }, []);

  // Render methods
  const renderFilterChips = useMemo(() => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContainer}
      style={styles.filterScrollView}
    >
      <TouchableOpacity
        style={[styles.moreFiltersButton, { borderColor: colors.primary }]}
        onPress={() => setShowFilters(true)}
      >
        <Text style={[styles.moreFiltersText, { color: colors.primary }]}>⚙️ Filters</Text>
      </TouchableOpacity>
      {CATEGORIES.map((category) => (
        <FilterChip
          key={category.id}
          label={category.name}
          selected={category.id === 'all' 
            ? currentFilters.categories.length === 0 
            : currentFilters.categories.includes(category.id)
          }
          onPress={() => handleFilterPress(category.id)}
          style={styles.filterChip}
        />
      ))}
      
      <TouchableOpacity
        onPress={handleFiltersPress}
        style={[styles.moreFiltersButton, { borderColor: colors.border }]}
      >
        <Text style={[styles.moreFiltersText, { color: colors.primary }]}>
          More
        </Text>
      </TouchableOpacity>
    </ScrollView>
  ), [currentFilters.categories, handleFilterPress, handleFiltersPress, colors]);

  const renderArticle = useCallback(({ item, index }: { item: NewsArticle; index: number }) => (
    <Animated.View
      entering={FadeInUp.duration(300).delay(index * 50)}
    >
      <NewsCard
        article={item}
        onPress={() => handleArticlePress(item)}
        onReaction={(reaction) => handleReaction(item.id, reaction)}
        onBookmark={() => handleBookmark(item)}
        onShare={() => handleShare(item)}
        showImage={true}
      />
    </Animated.View>
  ), [handleArticlePress, handleReaction, handleBookmark, handleShare]);

  const renderEmpty = useCallback(() => (
    <EmptyState
      title="No articles found"
      message="Try adjusting your filters or check back later for new content."
      emoji="📰"
      actionText="Reset Filters"
      onAction={resetFilters}
    />
  ), [resetFilters]);

  const renderFooter = useCallback(() => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <LoadingSpinner size="small" text="Loading more..." />
        </View>
      );
    }
    
    if (!hasMore && articles.length > 0) {
      return (
        <View style={styles.endMessage}>
          <Text style={[styles.endMessageText, { color: colors.textSecondary }]}>
            You're all caught up! 🎉
          </Text>
        </View>
      );
    }
    
    return null;
  }, [loadingMore, hasMore, articles.length, colors]);

  if (loading && articles.length === 0) {
    return (
      <SafeContainer>
        <ResponsiveAppHeader 
          showLogo
          showStreak
          showTokens
          rightAction={handleSearchPress}
        />
        <LoadingSpinner text="Loading your feed..." />
      </SafeContainer>
    );
  }

  if (error && articles.length === 0) {
    return (
      <SafeContainer>
        <ResponsiveAppHeader 
          showLogo
          showStreak
          showTokens
          rightAction={handleSearchPress}
        />
        <EmptyState
          title="Something went wrong"
          message={error}
          emoji="⚠️"
          actionText="Try Again"
          onAction={() => loadFeed(true)}
        />
      </SafeContainer>
    );
  }

  return (
    <SafeContainer>
      <ResponsiveAppHeader 
        showLogo
        showStreak
        showTokens
        rightAction={handleSearchPress}
      />
      
      {/* Filter Chips */}
      <View style={[styles.filtersSection, { backgroundColor: colors.background }]}>
        {renderFilterChips}
      </View>

      {/* Articles Feed */}
      <FlatList
        data={articles}
        renderItem={renderArticle}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadFeed(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.listContainer,
          articles.length === 0 && styles.emptyListContainer,
        ]}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 100,
        }}
      />
      
      <FiltersBottomSheet
        isVisible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={(filters: FilterOptions) => {
          console.log('Applied filters:', filters);
          // Apply filters to feed
          setShowFilters(false);
        }}
      />
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  filtersSection: {
    paddingVertical: 8,
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    marginRight: 0, // Gap handled by container
  },
  moreFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreFiltersText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  footerLoader: {
    paddingVertical: 20,
  },
  endMessage: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endMessageText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FeedScreen;