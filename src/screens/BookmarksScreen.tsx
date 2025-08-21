import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl,
  Alert,
  TextInput,
  ScrollView,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeContainer, AppHeader, NewsCard, EmptyState } from '@/components';
import { useTheme } from '@/contexts/ThemeContext';
import { useStore } from '@/store';
import { NewsArticle, Bookmark } from '@/types';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

interface BookmarkFolder {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
}

const BookmarksScreen: React.FC = () => {
  const { colors } = useTheme();
  const { 
    bookmarks, 
    removeBookmark, 
    clearBookmarks,
    markArticleAsViewed,
    addTokens
  } = useStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'title'>('recent');
  const [editMode, setEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const folders: BookmarkFolder[] = [
    { id: 'all', name: 'All', icon: 'bookmarks', count: bookmarks.length, color: colors.primary },
    { id: 'trading', name: 'Trading', icon: 'trending-up', count: 0, color: '#6B7280' },
    { id: 'news', name: 'News', icon: 'newspaper', count: 0, color: '#3B82F6' },
    { id: 'defi', name: 'DeFi', icon: 'cube', count: 0, color: '#8B5CF6' },
    { id: 'nfts', name: 'NFTs', icon: 'image', count: 0, color: '#94A3B8' },
  ];

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

  const handleBatchDelete = useCallback(() => {
    if (selectedItems.size === 0) return;
    
    Alert.alert(
      'Delete Selected',
      `Remove ${selectedItems.size} bookmark${selectedItems.size > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            selectedItems.forEach(id => removeBookmark(id));
            setSelectedItems(new Set());
            setEditMode(false);
          }
        }
      ]
    );
  }, [selectedItems, removeBookmark]);

  const toggleSelectItem = useCallback((id: string) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedItems(newSet);
  }, [selectedItems]);

  const handleArticlePress = useCallback((article: NewsArticle) => {
    if (editMode) {
      toggleSelectItem(article.id);
    } else {
      markArticleAsViewed(article.id);
      addTokens(1, 'Article viewed from bookmarks');
      console.log('Navigate to article:', article.headline);
    }
  }, [editMode, toggleSelectItem, markArticleAsViewed, addTokens]);

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search bookmarks..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.foldersContainer}
      >
        {folders.map(folder => (
          <TouchableOpacity
            key={folder.id}
            style={[
              styles.folderChip,
              { 
                backgroundColor: selectedFolder === folder.id ? folder.color : colors.card,
                borderColor: folder.color,
              }
            ]}
            onPress={() => setSelectedFolder(folder.id)}
          >
            <Ionicons 
              name={folder.icon as any} 
              size={16} 
              color={selectedFolder === folder.id ? '#fff' : folder.color} 
            />
            <Text style={[
              styles.folderText,
              { color: selectedFolder === folder.id ? '#fff' : colors.text }
            ]}>
              {folder.name} ({folder.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.toolbar}>
        <View style={styles.sortContainer}>
          <Text style={[styles.sortLabel, { color: colors.textSecondary }]}>Sort by:</Text>
          <TouchableOpacity
            style={[styles.sortButton, { backgroundColor: colors.card }]}
            onPress={() => {
              const options: ('recent' | 'oldest' | 'title')[] = ['recent', 'oldest', 'title'];
              const currentIndex = options.indexOf(sortBy);
              setSortBy(options[(currentIndex + 1) % options.length]);
            }}
          >
            <Text style={[styles.sortText, { color: colors.primary }]}>
              {sortBy === 'recent' ? 'Most Recent' : sortBy === 'oldest' ? 'Oldest' : 'Title A-Z'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          {editMode ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.error }]}
                onPress={handleBatchDelete}
                disabled={selectedItems.size === 0}
              >
                <Ionicons name="trash" size={18} color="#fff" />
                <Text style={styles.actionText}>Delete ({selectedItems.size})</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.card }]}
                onPress={() => {
                  setEditMode(false);
                  setSelectedItems(new Set());
                }}
              >
                <Text style={[styles.actionText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.card }]}
                onPress={() => setEditMode(true)}
                disabled={bookmarks.length === 0}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.text} />
                <Text style={[styles.actionText, { color: colors.text }]}>Select</Text>
              </TouchableOpacity>
              {bookmarks.length > 0 && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.error }]}
                  onPress={handleClearAll}
                >
                  <Ionicons name="trash-bin" size={18} color="#fff" />
                  <Text style={styles.actionText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>

      {filteredBookmarks.length > 0 && (
        <View style={[styles.statsBar, { backgroundColor: colors.card }]}>
          <View style={styles.stat}>
            <Ionicons name="bookmarks" size={16} color={colors.primary} />
            <Text style={[styles.statText, { color: colors.text }]}>
              {filteredBookmarks.length} article{filteredBookmarks.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="time" size={16} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {Math.ceil(filteredBookmarks.reduce((acc, bookmark) => acc + (bookmark.article?.readTime || 3), 0))} min read
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderBookmark = ({ item }: { item: any }) => {
    const article = item.article;
    if (!article) return null;
    
    return (
      <View style={styles.bookmarkWrapper}>
        {editMode && (
          <TouchableOpacity
            style={[
              styles.checkbox,
              { 
                backgroundColor: selectedItems.has(item.id) ? colors.primary : colors.card,
                borderColor: colors.border
              }
            ]}
            onPress={() => toggleSelectItem(item.id)}
          >
            {selectedItems.has(item.id) && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <NewsCard
            article={article}
            onPress={() => handleArticlePress(article)}
            onBookmark={() => handleRemoveBookmark(item.id)}
            isBookmarked={true}
            compact={true}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeContainer style={{ backgroundColor: colors.background }}>
      <AppHeader 
        title="Bookmarks" 
        subtitle={`${bookmarks.length} saved articles`}
        showBack={false}
      />
      
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
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  foldersContainer: {
    marginVertical: 8,
  },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  folderText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sortText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  statsBar: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
  },
  list: {
    paddingBottom: 100,
  },
  bookmarkWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BookmarksScreen;