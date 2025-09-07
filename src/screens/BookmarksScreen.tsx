import React, { useState, useCallback, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl,
  Alert,
  TextInput,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeContainer, ResponsiveAppHeader, NewsCard, EmptyState } from '@/components';
import { useTheme } from '@/contexts/ThemeContext';
import { useStore } from '@/store';
import { NewsArticle, Bookmark } from '@/types';
import { responsiveFontSize, responsiveSpacing, deviceSize } from '@/utils/responsive';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 380;

// Removed BookmarkFolder interface - not needed for v1

const BookmarksScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { 
    bookmarks, 
    removeBookmark, 
    clearBookmarks,
    markArticleAsViewed,
    addTokens
  } = useStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'title'>('recent');

  // Folders removed for v1 - will be added in future version

  const filteredBookmarks = useMemo(() => {
    let filtered = [...bookmarks];

    if (searchQuery) {
      filtered = filtered.filter(bookmark => {
        const article = bookmark.article;
        if (!article) return false;
        return (
          article.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.sourceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.categories?.some(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      });
    }

    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt || 0);
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      case 'oldest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt || 0);
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt || 0);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case 'title':
        filtered.sort((a, b) => {
          const titleA = a.article?.headline || '';
          const titleB = b.article?.headline || '';
          return titleA.localeCompare(titleB);
        });
        break;
    }

    return filtered;
  }, [bookmarks, searchQuery, sortBy]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleRemoveBookmark = useCallback((id: string) => {
    Alert.alert(
      'Remove Bookmark',
      'Are you sure you want to remove this bookmark?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            removeBookmark(id);
            addTokens(-1, 'Bookmark removed');
          }
        }
      ]
    );
  }, [removeBookmark, addTokens]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear All Bookmarks',
      'This will remove all your saved bookmarks. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: clearBookmarks
        }
      ]
    );
  }, [clearBookmarks]);

  const handleArticlePress = useCallback((article: NewsArticle) => {
    markArticleAsViewed(article.id);
    addTokens(1, 'Article viewed from bookmarks');
    console.log('Navigate to article:', article.headline);
  }, [markArticleAsViewed, addTokens]);

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      {/* Title Row */}
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.text }]}>Bookmarks</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {bookmarks.length > 0 ? `${bookmarks.length} saved` : 'No saved articles'}
        </Text>
      </View>
      
      {/* Search and Sort Row */}
      <View style={styles.searchRow}>
        <View style={[styles.searchContainer, { backgroundColor: colors.card, flex: 1 }]}>
          <Ionicons name="search" size={responsiveFontSize(18)} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search bookmarks..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={responsiveFontSize(18)} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.sortButton, { backgroundColor: colors.card }]}
          onPress={() => {
            const options: ('recent' | 'oldest' | 'title')[] = ['recent', 'oldest', 'title'];
            const currentIndex = options.indexOf(sortBy);
            setSortBy(options[(currentIndex + 1) % options.length]);
          }}
        >
          <Ionicons 
            name={sortBy === 'title' ? 'text' : 'time-outline'} 
            size={responsiveFontSize(16)} 
            color={colors.primary} 
          />
          <Text style={[styles.sortText, { color: colors.primary }]}>
            {sortBy === 'recent' ? 'Recent' : sortBy === 'oldest' ? 'Oldest' : 'A-Z'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Clear All Button - only if many bookmarks exist */}
      {bookmarks.length > 10 && (
        <TouchableOpacity
          style={[styles.clearAllButton, { backgroundColor: colors.card }]}
          onPress={handleClearAll}
        >
          <Ionicons name="trash-outline" size={responsiveFontSize(16)} color={colors.error} />
          <Text style={[styles.clearAllText, { color: colors.error }]}>Clear All</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderBookmark = ({ item }: { item: any }) => {
    const article = item.article;
    if (!article) return null;
    
    return (
      <View style={styles.bookmarkWrapper}>
        <NewsCard
          article={article}
          onPress={() => handleArticlePress(article)}
          onBookmark={() => handleRemoveBookmark(item.id)}
          isBookmarked={true}
          compact={true}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + responsiveSpacing(8) }]}>
      
      {bookmarks.length === 0 ? (
        <View style={{ flex: 1 }}>
          {renderHeader()}
          <EmptyState
            icon="bookmarks-outline"
            title="No Bookmarks Yet"
            description="Save articles to read them later, even offline"
            actionText="Browse Articles"
            onAction={() => console.log('Navigate to feed')}
          />
        </View>
      ) : (
        <FlatList
          data={filteredBookmarks}
          renderItem={renderBookmark}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <EmptyState
              icon="search"
              title="No Results"
              description="No bookmarks match your search"
              actionText="Clear Search"
              onAction={() => setSearchQuery('')}
            />
          }
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: responsiveSpacing(8),
  },
  header: {
    paddingHorizontal: responsiveSpacing(12),
    paddingBottom: responsiveSpacing(2),
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveSpacing(8),
  },
  title: {
    fontSize: responsiveFontSize(20),
    fontWeight: '700',
  },
  subtitle: {
    fontSize: responsiveFontSize(12),
    fontWeight: '500',
  },
  searchRow: {
    flexDirection: 'row',
    gap: responsiveSpacing(6), // Reduced from 8
    marginTop: responsiveSpacing(2), // Reduced from 6
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(8), // Reduced from 10
    paddingVertical: isSmallScreen ? 6 : 7, // Reduced from 7:9
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: responsiveSpacing(4), // Reduced from 6
    fontSize: responsiveFontSize(13), // Reduced from 14
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(8), // Reduced from 10
    paddingVertical: isSmallScreen ? 6 : 7, // Reduced from 7:9
    borderRadius: 8,
    gap: responsiveSpacing(3), // Reduced from 4
  },
  sortText: {
    fontSize: responsiveFontSize(12), // Reduced from 13
    fontWeight: '600',
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: responsiveSpacing(8),
    paddingVertical: responsiveSpacing(4), // Reduced from 5
    borderRadius: 6,
    marginTop: responsiveSpacing(3), // Reduced from 6
    gap: responsiveSpacing(3), // Reduced from 4
  },
  clearAllText: {
    fontSize: responsiveFontSize(12),
    fontWeight: '500',
  },
  list: {
    paddingBottom: responsiveSpacing(80),
  },
  bookmarkWrapper: {
    paddingHorizontal: responsiveSpacing(12),
  },
});

export default BookmarksScreen;