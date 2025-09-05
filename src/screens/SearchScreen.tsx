import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  Keyboard,
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInUp } from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';
import { useStore } from '@/store';
import { useDebounce, useToast } from '@/hooks';
import { NewsArticle, SearchQuery } from '@/types';
import { 
  SafeContainer, 
  NewsCard, 
  LoadingSpinner, 
  EmptyState, 
  FilterChip 
} from '@/components';

import ApiService from '@/services/apiSupabase';
import { CATEGORIES } from '@/constants';
import { formatters } from '@/utils';

const SearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  
  const {
    searchHistory,
    addToSearchHistory,
    clearSearchHistory,
    currentFilters,
    updateFilters,
    resetFilters,
    addBookmark,
    removeBookmark,
    isBookmarked,
    markArticleAsViewed,
    addTokens,
  } = useStore();

  // State
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trendingQueries, setTrendingQueries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search query
  const debouncedQuery = useDebounce(query, 500);

  // Load trending queries on mount
  useEffect(() => {
    loadTrendingQueries();
  }, []);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery);
      loadSuggestions(debouncedQuery);
    } else {
      setArticles([]);
      setSuggestions([]);
      setSearching(false);
    }
  }, [debouncedQuery]);

  // Load trending queries
  const loadTrendingQueries = async () => {
    try {
      const queries = await ApiService.getTrendingQueries();
      setTrendingQueries(queries);
    } catch (err) {
      console.error('Failed to load trending queries:', err);
    }
  };

  // Load search suggestions
  const loadSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    try {
      const suggestions = await ApiService.getSearchSuggestions(searchQuery);
      setSuggestions(suggestions);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    }
  }, []);

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError(null);

    try {
      const searchParams: SearchQuery = {
        query: searchQuery,
        filters: currentFilters,
        sortBy: 'relevance',
      };

      const response = await ApiService.searchArticles(searchParams);
      setArticles(response.articles);
      
      // Add to search history
      addToSearchHistory(searchQuery);
      
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
      toast.showError('Search failed', 'Please check your connection and try again.');
    } finally {
      setSearching(false);
    }
  }, [currentFilters, addToSearchHistory, toast]);

  // Handle search input
  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    setShowSuggestions(text.length > 0);
  }, []);

  // Handle suggestion selection
  const handleSuggestionPress = useCallback((suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    Keyboard.dismiss();
  }, []);

  // Handle search submit
  const handleSearchSubmit = useCallback(() => {
    if (query.trim()) {
      setShowSuggestions(false);
      Keyboard.dismiss();
      performSearch(query);
    }
  }, [query, performSearch]);

  // Clear search
  const handleClear = useCallback(() => {
    setQuery('');
    setArticles([]);
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
  }, []);

  // Article interactions
  const handleArticlePress = useCallback((article: NewsArticle) => {
    markArticleAsViewed(article.id);
    addTokens(1, 'Article viewed from search');
    // Convert Date objects to strings to avoid navigation serialization warnings
    const serializedArticle = {
      ...article,
      publishedAt: article.publishedAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    };
    navigation.navigate('ArticleViewer' as never, { article: serializedArticle } as never);
  }, [markArticleAsViewed, addTokens, navigation]);

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

  // Filter handling
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

  // Render methods
  const renderSearchBar = useMemo(() => (
    <View style={[styles.searchBarContainer, { backgroundColor: colors.surface }]}>
      <Ionicons name="search" size={20} color={colors.textSecondary} />
      
      <TextInput
        style={[
          styles.searchInput,
          { 
            color: colors.text,
            flex: 1,
          }
        ]}
        placeholder="Search crypto news..."
        placeholderTextColor={colors.textSecondary}
        value={query}
        onChangeText={handleQueryChange}
        onSubmitEditing={handleSearchSubmit}
        returnKeyType="search"
        clearButtonMode="while-editing"
        autoCorrect={false}
        autoCapitalize="none"
      />
      
      {query.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  ), [query, colors, handleQueryChange, handleSearchSubmit, handleClear]);

  const renderFilterChips = useMemo(() => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContainer}
      style={styles.filterScrollView}
    >
      {CATEGORIES.slice(0, 8).map((category) => (
        <FilterChip
          key={category.id}
          label={category.name}
          selected={category.id === 'all' 
            ? currentFilters.categories.length === 0 
            : currentFilters.categories.includes(category.id)
          }
          onPress={() => handleFilterPress(category.id)}
          size="small"
          style={styles.filterChip}
        />
      ))}
    </ScrollView>
  ), [currentFilters.categories, handleFilterPress]);

  const renderSuggestions = useMemo(() => {
    if (!showSuggestions) return null;

    const allSuggestions = [
      ...suggestions,
      ...searchHistory.filter(h => 
        h.toLowerCase().includes(query.toLowerCase()) && 
        !suggestions.includes(h)
      ).slice(0, 3),
    ].slice(0, 5);

    return (
      <Animated.View
        entering={SlideInUp.duration(200)}
        style={[styles.suggestionsContainer, { backgroundColor: colors.surface }]}
      >
        {allSuggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={`${suggestion}-${index}`}
            style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
            onPress={() => handleSuggestionPress(suggestion)}
          >
            <Ionicons 
              name={searchHistory.includes(suggestion) ? "time" : "search"} 
              size={16} 
              color={colors.textSecondary} 
            />
            <Text style={[styles.suggestionText, { color: colors.text }]}>
              {suggestion}
            </Text>
          </TouchableOpacity>
        ))}
        
        {searchHistory.length > 0 && (
          <TouchableOpacity
            style={styles.clearHistoryButton}
            onPress={clearSearchHistory}
          >
            <Text style={[styles.clearHistoryText, { color: colors.textSecondary }]}>
              Clear History
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  }, [showSuggestions, suggestions, searchHistory, query, colors, handleSuggestionPress, clearSearchHistory]);

  const renderRecentSearches = useMemo(() => {
    if (query.trim() || articles.length > 0) return null;

    return (
      <View style={styles.recentSection}>
        {searchHistory.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Searches
            </Text>
            <View style={styles.chipGrid}>
              {searchHistory.slice(0, 6).map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.recentChip, { backgroundColor: colors.surface }]}
                  onPress={() => handleSuggestionPress(item)}
                >
                  <Text style={[styles.recentChipText, { color: colors.text }]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {trendingQueries.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Trending
            </Text>
            <View style={styles.chipGrid}>
              {trendingQueries.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.trendingChip, { backgroundColor: colors.primary + '20' }]}
                  onPress={() => handleSuggestionPress(item)}
                >
                  <Ionicons name="trending-up" size={14} color={colors.primary} />
                  <Text style={[styles.trendingChipText, { color: colors.primary }]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    );
  }, [query, articles.length, searchHistory, trendingQueries, colors, handleSuggestionPress]);

  const renderArticle = useCallback(({ item }: { item: NewsArticle }) => (
    <NewsCard
      article={item}
      onPress={() => handleArticlePress(item)}
      onBookmark={() => handleBookmark(item)}
      onShare={() => {/* handle share */}}
      compact={true}
    />
  ), [handleArticlePress, handleBookmark]);

  const renderResults = useMemo(() => {
    if (searching) {
      return <LoadingSpinner text="Searching..." />;
    }

    if (error) {
      return (
        <EmptyState
          title="Search failed"
          message={error}
          emoji="⚠️"
          actionText="Try Again"
          onAction={() => performSearch(query)}
        />
      );
    }

    if (query.trim() && articles.length === 0 && !searching) {
      return (
        <EmptyState
          title="No results found"
          message={`No articles found for "${query}". Try different keywords or adjust your filters.`}
          emoji="🔍"
          actionText="Clear Filters"
          onAction={resetFilters}
        />
      );
    }

    if (articles.length > 0) {
      return (
        <FlatList
          data={articles}
          renderItem={renderArticle}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsList}
          ListHeaderComponent={() => (
            <Text style={[styles.resultsHeader, { color: colors.textSecondary }]}>
              {articles.length} result{articles.length !== 1 ? 's' : ''} for "{query}"
            </Text>
          )}
        />
      );
    }

    return renderRecentSearches;
  }, [searching, error, query, articles, renderArticle, renderRecentSearches, colors, performSearch, resetFilters]);

  return (
    <SafeContainer style={{ backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        {renderSearchBar}
      </View>

      {/* Filters */}
      <View style={[styles.filtersSection, { backgroundColor: colors.background }]}>
        {renderFilterChips}
      </View>

      {/* Suggestions Overlay */}
      {renderSuggestions}

      {/* Content */}
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        {renderResults}
      </View>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginVertical: 8,
  },
  searchInput: {
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
  },
  clearButton: {
    padding: 4,
  },
  filtersSection: {
    paddingVertical: 8,
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 6,
  },
  filterChip: {
    marginRight: 0,
  },
  suggestionsContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 100,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
    marginLeft: 12,
  },
  clearHistoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  clearHistoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  recentSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 16,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recentChipText: {
    fontSize: 14,
  },
  trendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  trendingChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsHeader: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  resultsList: {
    paddingBottom: 20,
  },
});

export default SearchScreen;