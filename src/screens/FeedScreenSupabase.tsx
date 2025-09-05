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
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '@/contexts/ThemeContext';
import { useStore } from '@/store';
import { useToast } from '@/hooks';
import { useNewsUpdates } from '@/hooks/useSupabase';
import { NewsArticle, FilterState } from '@/types';
import { CATEGORIES } from '@/constants';

import {
  SafeContainer,
  AppHeader,
  NewsCard,
  LoadingSpinner,
  EmptyState,
  FilterChip,
  FiltersBottomSheet,
} from '@/components';

import apiService from '@/services/apiSupabase';

const FeedScreenSupabase: React.FC = () => {
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

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Subscribe to real-time news updates
  useNewsUpdates((newArticle) => {
    console.log('New article received:', newArticle);
    // Refresh feed when new article arrives
    loadFeed(true);
  });

  // Load feed
  const loadFeed = useCallback(async (refresh = false) => {
    if (!refresh && loadingMore) return;

    try {
      if (refresh) {
        setRefreshing(true);
        setNextCursor(undefined);
      } else if (!nextCursor && articles.length > 0) {
        return; // No more data to load
      } else {
        setLoadingMore(true);
      }

      // Apply category filter
      const filters: FilterState = {
        ...currentFilters,
        categories: selectedCategory.id === 'all' ? [] : [selectedCategory.id],
      };

      const response = await apiService.getFeed(
        filters,
        refresh ? undefined : nextCursor
      );

      if (refresh) {
        setArticles(response.articles);
        
        // First time viewing today - earn tokens
        if (!initialLoadComplete) {
          addTokens(10, 'Daily app open');
          toast.show('success', '+10 Tokens', 'Welcome back! Daily bonus earned');
          setInitialLoadComplete(true);
        }
      } else {
        setArticles(prev => [...prev, ...response.articles]);
      }

      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Failed to load feed:', error);
      toast.show('error', 'Failed to load feed', 'Please try again');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [currentFilters, selectedCategory, nextCursor, articles.length, addTokens, toast, initialLoadComplete]);

  // Initial load
  useEffect(() => {
    loadFeed(true);
  }, [selectedCategory]);

  // Sync news from API
  const syncNews = useCallback(async () => {
    try {
      toast.show('info', 'Syncing...', 'Fetching latest news');
      const success = await apiService.syncNews();
      
      if (success) {
        toast.show('success', 'Sync Complete', 'Latest news available');
        loadFeed(true);
      } else {
        toast.show('error', 'Sync Failed', 'Please try again');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.show('error', 'Sync Failed', 'Please check your connection');
    }
  }, [toast]);

  // Handle bookmark toggle
  const handleBookmark = useCallback(async (article: NewsArticle) => {
    const bookmarked = isBookmarked(article.id);
    
    // Optimistic update
    if (bookmarked) {
      removeBookmark(article.id);
    } else {
      addBookmark(article);
    }

    // Sync with backend
    const result = await apiService.bookmarkArticle(article.id, bookmarked);
    
    if (!result.success) {
      // Revert on failure
      if (bookmarked) {
        addBookmark(article);
      } else {
        removeBookmark(article.id);
      }
      toast.show('error', 'Failed to update bookmark', 'Please try again');
    } else {
      toast.show('success', bookmarked ? 'Removed' : 'Saved', bookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
    }
  }, [isBookmarked, addBookmark, removeBookmark, toast]);

  // Handle reaction
  const handleReaction = useCallback(async (article: NewsArticle, reaction: 'bull' | 'bear' | 'neutral') => {
    try {
      const result = await apiService.reactToArticle(article.id, reaction);
      
      if (result.success) {
        // First reaction of the day - earn tokens
        const today = new Date().toDateString();
        const lastReaction = await AsyncStorage.getItem('lastReactionDate');
        
        if (lastReaction !== today) {
          addTokens(2, 'Article reaction');
          await AsyncStorage.setItem('lastReactionDate', today);
          toast.show('success', '+2 Tokens', 'Reaction bonus earned');
        }
      }
    } catch (error) {
      console.error('Failed to react:', error);
    }
  }, [addTokens, toast]);

  // Handle share
  const handleShare = useCallback(async (article: NewsArticle) => {
    try {
      await apiService.shareArticle(article.id);
      
      // Share bonus (once per day)
      const today = new Date().toDateString();
      const lastShare = await AsyncStorage.getItem('lastShareDate');
      
      if (lastShare !== today) {
        addTokens(5, 'Shared article');
        await AsyncStorage.setItem('lastShareDate', today);
        toast.show('success', '+5 Tokens', 'Share bonus earned');
      }
    } catch (error) {
      console.error('Failed to track share:', error);
    }
  }, [addTokens, toast]);

  // Handle article press
  const handleArticlePress = useCallback((article: NewsArticle) => {
    markArticleAsViewed(article.id);
    apiService.trackView(article.id, 0);
    // Convert Date objects to strings to avoid navigation serialization warnings
    const serializedArticle = {
      ...article,
      publishedAt: article.publishedAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    };
    navigation.navigate('ArticleViewer', { article: serializedArticle });
  }, [markArticleAsViewed, navigation]);

  // Apply filters
  const handleApplyFilters = useCallback((filters: FilterState) => {
    updateFilters(filters);
    setShowFilters(false);
    loadFeed(true);
  }, [updateFilters]);

  // Render article card
  const renderArticle = useCallback(({ item, index }: { item: NewsArticle; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 50)}>
      <NewsCard
        article={item}
        onPress={() => handleArticlePress(item)}
        onBookmark={() => handleBookmark(item)}
        onReaction={(reaction) => handleReaction(item, reaction)}
        onShare={() => handleShare(item)}
        isBookmarked={isBookmarked(item.id)}
      />
    </Animated.View>
  ), [handleArticlePress, handleBookmark, handleReaction, handleShare, isBookmarked]);

  // Render category filter
  const renderCategoryFilter = useCallback(() => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScroll}
      contentContainerStyle={styles.categoryContent}
    >
      {CATEGORIES.map((category) => (
        <FilterChip
          key={category.id}
          label={category.name}
          selected={selectedCategory.id === category.id}
          onPress={() => setSelectedCategory(category)}
          style={styles.categoryChip}
        />
      ))}
      <TouchableOpacity
        onPress={() => setShowFilters(true)}
        style={[styles.moreButton, { backgroundColor: colors.surface }]}
      >
        <Text style={[styles.moreButtonText, { color: colors.primary }]}>
          More Filters
        </Text>
      </TouchableOpacity>
    </ScrollView>
  ), [selectedCategory, colors]);

  // Render header
  const renderHeader = useCallback(() => (
    <View>
      <AppHeader
        title="Feed"
        showStreak={true}
        streakCount={streak.current}
        showTokens={true}
        tokenCount={tokens.balance}
        rightAction={{
          icon: 'sync-outline',
          onPress: syncNews,
        }}
      />
      {renderCategoryFilter()}
    </View>
  ), [streak.current, tokens.balance, syncNews, renderCategoryFilter]);

  // Render footer
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footer}>
        <LoadingSpinner size="small" />
      </View>
    );
  }, [loadingMore]);

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (loading) {
      return <LoadingSpinner />;
    }
    
    return (
      <EmptyState
        title="No Articles Found"
        message="Try adjusting your filters or check back later for new content"
        actionLabel="Reset Filters"
        onAction={() => {
          resetFilters();
          setSelectedCategory(CATEGORIES[0]);
          loadFeed(true);
        }}
      />
    );
  }, [loading, resetFilters]);

  return (
    <SafeContainer>
      <FlatList
        data={articles}
        renderItem={renderArticle}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.content,
          articles.length === 0 && styles.emptyContent
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadFeed(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={() => hasMore && loadFeed(false)}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
      
      <FiltersBottomSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        currentFilters={currentFilters}
      />
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 20,
  },
  emptyContent: {
    flexGrow: 1,
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  moreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default FeedScreenSupabase;