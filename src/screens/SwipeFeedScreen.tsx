import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ViewToken,
  Share,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useStore } from '@/store';
import { useTheme } from '@/contexts/ThemeContext';
import { NewsArticle } from '@/types';
import ApiService from '@/services/api';
import { SafeContainer } from '@/components';
import { format } from 'date-fns';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT - 100; // Leave some space for status bar

interface SwipeCardProps {
  article: NewsArticle;
  index: number;
  currentIndex: number;
  onReaction: (reaction: 'bull' | 'bear' | 'neutral') => void;
  onBookmark: () => void;
  onShare: () => void;
  onReadMore: () => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  article,
  index,
  currentIndex,
  onReaction,
  onBookmark,
  onShare,
  onReadMore,
}) => {
  const { colors } = useTheme();
  const { isBookmarked } = useStore();
  const isActive = index === currentIndex;
  const scale = useSharedValue(1);
  const [userReaction, setUserReaction] = useState<string | null>(null);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1 : 0.95);
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleReaction = (reaction: 'bull' | 'bear' | 'neutral') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUserReaction(reaction);
    onReaction(reaction);
  };

  const handleBookmark = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBookmark();
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShare();
  };

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <LinearGradient
        colors={[colors.background, colors.card]}
        style={styles.gradient}
      >
        {/* Background Image Placeholder */}
        <View style={[styles.imageContainer, { backgroundColor: colors.surface }]}>
          {article.thumbnail ? (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="image" size={80} color={colors.primary} />
            </View>
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.cryptoSymbol, { color: colors.primary }]}>
                {article.coins[0]?.symbol || 'CRYPTO'}
              </Text>
            </View>
          )}
        </View>

        {/* Content Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
          style={styles.contentOverlay}
        >
          <View style={styles.content}>
            {/* Source and Time */}
            <View style={styles.sourceRow}>
              <View style={styles.sourceInfo}>
                <View style={[styles.sourceAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.sourceAvatarText}>
                    {article.sourceName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.sourceName}>{article.sourceName}</Text>
                  <Text style={styles.publishTime}>
                    {format(new Date(article.publishedAt), 'MMM d, h:mm a')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.followButton, { borderColor: colors.primary }]}
                onPress={() => console.log('Follow source')}
              >
                <Text style={[styles.followText, { color: colors.primary }]}>Follow</Text>
              </TouchableOpacity>
            </View>

            {/* Headline */}
            <Text style={styles.headline}>{article.headline}</Text>

            {/* Summary */}
            <Text style={styles.summary} numberOfLines={4}>
              {article.summary}
            </Text>

            {/* Tags */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.tagsContainer}
            >
              {article.coins.map((coin) => (
                <View key={coin.id} style={[styles.tag, { backgroundColor: colors.primary + '30' }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>
                    ${coin.symbol}
                  </Text>
                  {coin.priceChangePercentage24h && (
                    <Text style={[
                      styles.tagPrice,
                      { color: coin.priceChangePercentage24h > 0 ? '#4CAF50' : '#F44336' }
                    ]}>
                      {coin.priceChangePercentage24h > 0 ? '+' : ''}
                      {coin.priceChangePercentage24h.toFixed(2)}%
                    </Text>
                  )}
                </View>
              ))}
              {article.categories.map((category) => (
                <View key={category.id} style={[styles.tag, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.tagText, { color: colors.text }]}>
                    #{category.name}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Read More Button */}
            <TouchableOpacity 
              style={[styles.readMoreButton, { backgroundColor: colors.primary }]}
              onPress={onReadMore}
            >
              <Text style={styles.readMoreText}>Read Full Article</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Reactions */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleReaction('bull')}
          >
            <View style={[
              styles.reactionButton,
              userReaction === 'bull' && styles.activeReaction
            ]}>
              <Text style={styles.reactionEmoji}>🐂</Text>
            </View>
            <Text style={styles.actionLabel}>{article.reactions.bull}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleReaction('bear')}
          >
            <View style={[
              styles.reactionButton,
              userReaction === 'bear' && styles.activeReaction
            ]}>
              <Text style={styles.reactionEmoji}>🐻</Text>
            </View>
            <Text style={styles.actionLabel}>{article.reactions.bear}</Text>
          </TouchableOpacity>

          {/* Bookmark */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleBookmark}
          >
            <Ionicons 
              name={isBookmarked(article.id) ? "bookmark" : "bookmark-outline"} 
              size={28} 
              color={isBookmarked(article.id) ? colors.warning : '#fff'}
            />
            <Text style={styles.actionLabel}>Save</Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Ionicons name="share-social-outline" size={28} color="#fff" />
            <Text style={styles.actionLabel}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Swipe Hint */}
        {isActive && (
          <Animated.View 
            entering={FadeIn.delay(1000).duration(500)}
            exiting={FadeOut}
            style={styles.swipeHint}
          >
            <Ionicons name="chevron-up" size={24} color="#fff" />
            <Text style={styles.swipeHintText}>Swipe up for next</Text>
          </Animated.View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const SwipeFeedScreen: React.FC = () => {
  const { colors } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const {
    currentFilters,
    addBookmark,
    removeBookmark,
    isBookmarked,
    markArticleAsViewed,
    addTokens,
  } = useStore();

  // Load articles
  const loadArticles = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await ApiService.getFeed(currentFilters);
      
      if (refresh) {
        setArticles(response.articles);
        setCurrentIndex(0);
      } else {
        setArticles(prev => [...prev, ...response.articles]);
      }
      
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentFilters]);

  // Load more articles when approaching the end
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const response = await ApiService.getFeed(currentFilters);
      setArticles(prev => [...prev, ...response.articles]);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, currentFilters]);

  useEffect(() => {
    loadArticles();
  }, []);

  // Track viewed articles
  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index || 0;
      setCurrentIndex(index);
      
      const article = articles[index];
      if (article) {
        markArticleAsViewed(article.id);
        addTokens(1, 'Article viewed in swipe feed');
        
        // Load more when near the end
        if (index >= articles.length - 3) {
          loadMore();
        }
      }
    }
  }, [articles, markArticleAsViewed, addTokens, loadMore]);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  // Handle reactions
  const handleReaction = useCallback(async (articleId: string, reaction: 'bull' | 'bear' | 'neutral') => {
    try {
      await ApiService.reactToArticle(articleId, reaction);
      addTokens(2, 'Article reaction');
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
    // navigation.navigate('ArticleViewer', { article });
  }, []);

  const renderItem = ({ item, index }: { item: NewsArticle; index: number }) => (
    <SwipeCard
      article={item}
      index={index}
      currentIndex={currentIndex}
      onReaction={(reaction) => handleReaction(item.id, reaction)}
      onBookmark={() => handleBookmark(item)}
      onShare={() => handleShare(item)}
      onReadMore={() => handleReadMore(item)}
    />
  );

  if (loading && articles.length === 0) {
    return (
      <SafeContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading your crypto feed...
          </Text>
        </View>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Crypto Clips</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="filter" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Swipe Feed */}
      <FlatList
        ref={flatListRef}
        data={articles}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        vertical={true}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={CARD_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        refreshing={refreshing}
        onRefresh={() => loadArticles(true)}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
      />

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {articles.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor: index === currentIndex ? colors.primary : colors.border,
                width: index === currentIndex ? 20 : 6,
              },
            ]}
          />
        ))}
      </View>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  card: {
    height: CARD_HEIGHT,
    width: SCREEN_WIDTH,
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cryptoSymbol: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 100,
    paddingBottom: 80,
  },
  content: {
    paddingHorizontal: 20,
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sourceAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sourceName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  publishTime: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  followText: {
    fontSize: 14,
    fontWeight: '600',
  },
  headline: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 32,
  },
  summary: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  tagsContainer: {
    marginBottom: 20,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tagPrice: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  readMoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  reactionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeReaction: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    transform: [{ scale: 1.1 }],
  },
  reactionEmoji: {
    fontSize: 24,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 12,
  },
  swipeHint: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeHintText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  progressContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  progressDot: {
    height: 3,
    borderRadius: 2,
    transition: 'width 0.3s',
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default SwipeFeedScreen;