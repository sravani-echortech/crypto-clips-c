import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  Easing,
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useStore } from '@/store';
import { useTheme } from '@/contexts/ThemeContext';
import { NewsArticle } from '@/types';
import ApiService from '@/services/api';
import { SafeContainer } from '@/components';
import { format } from 'date-fns';
import { CATEGORIES } from '@/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT;
const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

interface NewsCardProps {
  article: NewsArticle;
  isActive: boolean;
  onReaction: (reaction: 'bull' | 'bear' | 'neutral') => void;
  onBookmark: () => void;
  onShare: () => void;
  onReadMore: () => void;
  onSwipeHorizontal: (direction: 'left' | 'right') => void;
}

// Empty State Card Component
interface EmptyStateCardProps {
  category: typeof CATEGORIES[0];
  onSwipeHorizontal: (direction: 'left' | 'right') => void;
  colors: any;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({ category, onSwipeHorizontal, colors }) => {
  const translateX = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const opacity = useSharedValue(1);
  
  const horizontalGesture = Gesture.Pan()
    .activeOffsetX([-30, 30])
    .failOffsetY([-50, 50])
    .onUpdate((event) => {
      if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
        translateX.value = event.translationX;
        rotateZ.value = interpolate(
          event.translationX,
          [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
          [-15, 0, 15]
        );
        opacity.value = interpolate(
          Math.abs(event.translationX),
          [0, SCREEN_WIDTH * 0.8],
          [1, 0.3]
        );
      }
    })
    .onEnd((event) => {
      const shouldSwipe = Math.abs(event.translationX) > SCREEN_WIDTH * 0.25 || 
                         Math.abs(event.velocityX) > 500;
      
      if (shouldSwipe && Math.abs(event.translationX) > Math.abs(event.translationY)) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        runOnJS(onSwipeHorizontal)(direction);
        
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        rotateZ.value = withSpring(0, { damping: 15, stiffness: 150 });
        opacity.value = withSpring(1, { damping: 15, stiffness: 150 });
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        rotateZ.value = withSpring(0, { damping: 15, stiffness: 150 });
        opacity.value = withSpring(1, { damping: 15, stiffness: 150 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotateZ: `${rotateZ.value}deg` }
    ],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={horizontalGesture}>
      <Animated.View style={[styles.emptyStateContainer, animatedStyle]}>
        <LinearGradient
          colors={[colors.background, colors.card]}
          style={styles.gradient}
        >
          <View style={styles.emptyStateContent}>
            <Text style={[styles.emptyStateIcon, { fontSize: 80 }]}>
              {category.icon}
            </Text>
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              No {category.name} articles yet
            </Text>
            <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
              Check back later for the latest {category.name.toLowerCase()} news
            </Text>
            
            {/* Swipe Instructions */}
            <View style={styles.swipeInstructions}>
              <View style={styles.swipeHint}>
                <Ionicons name="arrow-back" size={24} color={colors.textSecondary} />
                <Text style={[styles.swipeHintText, { color: colors.textSecondary }]}>
                  Swipe right for previous
                </Text>
              </View>
              <View style={styles.swipeHint}>
                <Text style={[styles.swipeHintText, { color: colors.textSecondary }]}>
                  Swipe left for next
                </Text>
                <Ionicons name="arrow-forward" size={24} color={colors.textSecondary} />
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </GestureDetector>
  );
};

const NewsCard: React.FC<NewsCardProps> = ({
  article,
  isActive,
  onReaction,
  onBookmark,
  onShare,
  onReadMore,
  onSwipeHorizontal,
}) => {
  const { colors } = useTheme();
  const { isBookmarked } = useStore();
  const [userReaction, setUserReaction] = useState<string | null>(null);
  
  const translateX = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const opacity = useSharedValue(1);
  const cardScale = useSharedValue(isActive ? 1 : 0.95);

  useEffect(() => {
    cardScale.value = withSpring(isActive ? 1 : 0.95, {
      damping: 15,
      stiffness: 100,
    });
  }, [isActive]);

  const handleReaction = (reaction: 'bull' | 'bear' | 'neutral') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUserReaction(reaction);
    onReaction(reaction);
  };

  const handleBookmark = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBookmark();
  };

  const horizontalGesture = Gesture.Pan()
    .activeOffsetX([-30, 30]) // Activation threshold
    .failOffsetY([-50, 50]) // Allow some vertical movement
    .enabled(isActive) // Only enable for active card
    .shouldCancelWhenOutside(false)
    .onUpdate((event) => {
      // Check if gesture is primarily horizontal
      if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
        translateX.value = event.translationX;
        // Add subtle rotation effect like Inshorts
        rotateZ.value = interpolate(
          event.translationX,
          [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
          [-15, 0, 15]
        );
        // Fade out as card moves away
        opacity.value = interpolate(
          Math.abs(event.translationX),
          [0, SCREEN_WIDTH * 0.8],
          [1, 0.2]
        );
      }
    })
    .onEnd((event) => {
      const shouldSwipe = Math.abs(event.translationX) > SCREEN_WIDTH * 0.25 || 
                         Math.abs(event.velocityX) > 500;
      
      if (shouldSwipe && Math.abs(event.translationX) > Math.abs(event.translationY)) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        
        // Trigger haptic feedback
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        
        // Immediately trigger the category change
        runOnJS(onSwipeHorizontal)(direction);
        
        // Reset animation values after triggering
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        rotateZ.value = withSpring(0, { damping: 15, stiffness: 150 });
        opacity.value = withSpring(1, { damping: 15, stiffness: 150 });
      } else {
        // Spring back to center
        translateX.value = withSpring(0, { 
          damping: 15,
          stiffness: 150,
          mass: 1
        });
        rotateZ.value = withSpring(0, { 
          damping: 15,
          stiffness: 150
        });
        opacity.value = withSpring(1, { 
          damping: 15,
          stiffness: 150
        });
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotateZ: `${rotateZ.value}deg` },
      { scale: cardScale.value },
    ],
  }));

  const animatedOpacityStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={horizontalGesture}>
      <Animated.View style={[styles.card, animatedCardStyle]}>
        <View style={StyleSheet.absoluteFillObject}>
          <Animated.View style={[StyleSheet.absoluteFillObject, animatedOpacityStyle]}>
            <LinearGradient
          colors={[colors.background, colors.card, '#000']}
          style={styles.gradient}
          locations={[0, 0.3, 1]}
        >
          {/* Large Background Crypto Symbol */}
          <View style={styles.backgroundPattern}>
            <View
              style={styles.cryptoBackgroundContainer}
            >
              <Text style={[styles.cryptoBackground, { color: colors.primary }]}>
                {article.coins[0]?.symbol || 'CRYPTO'}
              </Text>
            </View>
          </View>

          {/* Top Section: Source & Category */}
          <View 
            style={styles.topSection}
          >
            <View style={styles.sourceRow}>
              <View style={styles.sourceInfo}>
                <View style={[styles.sourceAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.sourceAvatarText}>
                    {article.sourceName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.sourceName, { color: colors.text }]}>
                    {article.sourceName}
                  </Text>
                  <Text style={[styles.publishTime, { color: colors.textSecondary }]}>
                    {format(new Date(article.publishedAt), 'MMM d, h:mm a')}
                  </Text>
                </View>
              </View>
              
              {/* Category Pills */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoryPills}
              >
                {article.categories.map((category) => (
                  <View 
                    key={category.id} 
                    style={[styles.categoryPill, { backgroundColor: colors.primary + '20' }]}
                  >
                    <Text style={[styles.categoryText, { color: colors.primary }]}>
                      {category.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.contentContainer}>
            {isActive && (
              <View>
                {/* Headline */}
                <Text style={[styles.headline, { color: colors.text }]}>
                  {article.headline}
                </Text>

                {/* Summary */}
                <Text style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={6}>
                  {article.summary}
                </Text>

                {/* Coin Tags with Prices */}
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.coinsContainer}
                >
                  {article.coins.map((coin, index) => (
                    <View
                      key={coin.id}
                      style={[styles.coinTag, { backgroundColor: colors.surface }]}
                    >
                      <Text style={[styles.coinSymbol, { color: colors.primary }]}>
                        {coin.symbol}
                      </Text>
                      {coin.currentPrice && (
                        <Text style={[styles.coinPrice, { color: colors.text }]}>
                          ${coin.currentPrice.toLocaleString()}
                        </Text>
                      )}
                      {coin.priceChangePercentage24h && (
                        <Text style={[
                          styles.coinChange,
                          { color: coin.priceChangePercentage24h > 0 ? '#4CAF50' : '#F44336' }
                        ]}>
                          {coin.priceChangePercentage24h > 0 ? '↑' : '↓'}
                          {Math.abs(coin.priceChangePercentage24h).toFixed(2)}%
                        </Text>
                      )}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Bottom Actions */}
          <View style={styles.bottomSection}>
            {/* Reaction Bar */}
            <View style={styles.reactionBar}>
              <TouchableOpacity 
                style={[
                  styles.reactionButton,
                  userReaction === 'bull' && styles.activeReaction
                ]}
                onPress={() => handleReaction('bull')}
              >
                <Text style={styles.reactionEmoji}>🐂</Text>
                <Text style={[styles.reactionCount, { color: colors.textSecondary }]}>
                  {article.reactions.bull}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.reactionButton,
                  userReaction === 'bear' && styles.activeReaction
                ]}
                onPress={() => handleReaction('bear')}
              >
                <Text style={styles.reactionEmoji}>🐻</Text>
                <Text style={[styles.reactionCount, { color: colors.textSecondary }]}>
                  {article.reactions.bear}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.reactionButton,
                  userReaction === 'neutral' && styles.activeReaction
                ]}
                onPress={() => handleReaction('neutral')}
              >
                <Text style={styles.reactionEmoji}>😐</Text>
                <Text style={[styles.reactionCount, { color: colors.textSecondary }]}>
                  {article.reactions.neutral}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={onReadMore}
              >
                <Text style={styles.actionButtonText}>Read Full Article</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>

              <View style={styles.secondaryActions}>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={handleBookmark}
                >
                  <Ionicons 
                    name={isBookmarked(article.id) ? "bookmark" : "bookmark-outline"} 
                    size={24} 
                    color={isBookmarked(article.id) ? colors.warning : colors.text}
                  />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={onShare}
                >
                  <Ionicons name="share-social-outline" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Swipe Instructions */}
            {isActive && (
              <View
                style={styles.swipeHints}
              >
                <View style={styles.swipeHint}>
                  <Ionicons name="arrow-up" size={16} color={colors.textSecondary} />
                  <Text style={[styles.swipeHintText, { color: colors.textSecondary }]}>
                    Swipe up for next
                  </Text>
                </View>
                <View style={styles.swipeHint}>
                  <Ionicons name="swap-horizontal" size={16} color={colors.textSecondary} />
                  <Text style={[styles.swipeHintText, { color: colors.textSecondary }]}>
                    Swipe left/right to filter
                  </Text>
                </View>
              </View>
            )}
          </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const InshortsFeedScreen: React.FC = () => {
  const { colors } = useTheme();
  const pagerRef = useRef<PagerView>(null);
  const categoryScrollRef = useRef<ScrollView>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCategory, setCurrentCategory] = useState(CATEGORIES[0]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const {
    currentFilters,
    updateFilters,
    addBookmark,
    removeBookmark,
    isBookmarked,
    markArticleAsViewed,
    addTokens,
    streak,
    tokens,
  } = useStore();

  const categories = useMemo(() => {
    // Use the actual category objects from constants
    return CATEGORIES;
  }, []);

  // Load articles
  const loadArticles = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setLoading(true);
      }

      const filters = currentCategory.id === 'all' 
        ? currentFilters 
        : { ...currentFilters, categories: [currentCategory.slug] };

      console.log(`Loading articles for category: ${currentCategory.name} (${currentCategory.id})`, filters);
      const response = await ApiService.getFeed(filters);
      console.log(`Loaded ${response.articles.length} articles for ${currentCategory.name}`);
      
      if (refresh) {
        setArticles(response.articles);
        setCurrentIndex(0);
        pagerRef.current?.setPage(0);
      } else {
        setArticles(prev => [...prev, ...response.articles]);
      }
      
      setHasMore(response.hasMore);
    } catch (error) {
      console.error(`Failed to load articles for ${currentCategory.name}:`, error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [currentFilters, currentCategory.id]);

  // Load more when near end
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || articles.length - currentIndex < 3) return;
    
    setLoadingMore(true);
    await loadArticles(false);
  }, [loadingMore, hasMore, currentIndex, articles.length, loadArticles]);

  useEffect(() => {
    loadArticles(true);
    // Auto-scroll category tabs to show active category
    const categoryIndex = categories.findIndex(c => c.id === currentCategory.id);
    if (categoryScrollRef.current && categoryIndex >= 0) {
      // Rough estimate: each tab is about 120px wide
      const scrollPosition = Math.max(0, categoryIndex * 120 - 100);
      categoryScrollRef.current.scrollTo({ x: scrollPosition, animated: true });
    }
  }, [currentCategory.id]);

  useEffect(() => {
    // Load more when approaching the end
    if (currentIndex >= articles.length - 3) {
      loadMore();
    }
    
    // Mark article as viewed
    const article = articles[currentIndex];
    if (article) {
      markArticleAsViewed(article.id);
      addTokens(1, 'Article viewed');
    }
  }, [currentIndex]);

  // Handle page change
  const onPageSelected = (e: any) => {
    const index = e.nativeEvent.position;
    console.log(`Page changed to article ${index + 1} of ${articles.length}`);
    setCurrentIndex(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Handle horizontal swipe for category change
  const handleCategorySwipe = useCallback((direction: 'left' | 'right') => {
    try {
      const currentIdx = categories.findIndex(c => c.id === currentCategory.id);
      console.log(`Current category index: ${currentIdx}, Total categories: ${categories.length}`);
      console.log(`Swipe direction: ${direction}`);
      
      let newIdx = currentIdx;
      
      // Note: Swipe left goes to NEXT category (higher index)
      // Swipe right goes to PREVIOUS category (lower index)
      if (direction === 'left') {
        if (currentIdx < categories.length - 1) {
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
      
      if (newIdx >= 0 && newIdx < categories.length) {
        console.log(`Switching from ${categories[currentIdx].name} (${currentIdx}) to ${categories[newIdx].name} (${newIdx})`);
        setCurrentCategory(categories[newIdx]);
      } else {
        console.error(`Invalid category index: ${newIdx}`);
      }
    } catch (error) {
      console.error('Error in handleCategorySwipe:', error);
    }
  }, [currentCategory.id, categories]);

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
      <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} />
      
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
          {categories.map((category) => (
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

      {/* News Feed Pager */}
      {articles.length > 0 ? (
        <AnimatedPagerView
          ref={pagerRef}
          style={styles.pagerView}
          initialPage={0}
          orientation="vertical"
          onPageSelected={onPageSelected}
          overdrag={true}
          scrollEnabled={true}
        >
          {articles.map((article, index) => (
            <View key={article.id} style={styles.page}>
              <NewsCard
                article={article}
                isActive={index === currentIndex}
                onReaction={(reaction) => handleReaction(article.id, reaction)}
                onBookmark={() => handleBookmark(article)}
                onShare={() => handleShare(article)}
                onReadMore={() => handleReadMore(article)}
                onSwipeHorizontal={handleCategorySwipe}
              />
            </View>
          ))}
        </AnimatedPagerView>
      ) : (
        <EmptyStateCard 
          category={currentCategory}
          onSwipeHorizontal={handleCategorySwipe}
          colors={colors}
        />
      )}

      {/* Progress Dots */}
      {articles.length > 0 && (
        <View style={styles.progressContainer}>
          {articles.slice(Math.max(0, currentIndex - 2), Math.min(articles.length, currentIndex + 3)).map((_, idx) => {
            const actualIndex = Math.max(0, currentIndex - 2) + idx;
            const isActive = actualIndex === currentIndex;
            return (
              <View
                key={`dot-${actualIndex}`}
                style={[
                  styles.progressDot,
                  { 
                    backgroundColor: colors.primary,
                    width: isActive ? 24 : 6,
                    opacity: isActive ? 1 : 0.3,
                  }
                ]}
              />
            );
          })}
        </View>
      )}
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
    gap: 8,
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  tokenChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
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
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  card: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  gradient: {
    flex: 1,
    paddingTop: 20,
  },
  backgroundPattern: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 0,
  },
  cryptoBackgroundContainer: {
    opacity: 0.1,
  },
  cryptoBackground: {
    fontSize: 120,
    fontWeight: 'bold',
  },
  topSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 1,
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sourceAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sourceName: {
    fontSize: 15,
    fontWeight: '600',
  },
  publishTime: {
    fontSize: 12,
    marginTop: 2,
  },
  categoryPills: {
    marginLeft: 48,
    maxHeight: 30,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    zIndex: 1,
  },
  headline: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 34,
  },
  summary: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  coinsContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  coinTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  coinSymbol: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  coinPrice: {
    fontSize: 13,
    marginLeft: 8,
  },
  coinChange: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    zIndex: 1,
  },
  reactionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginBottom: 24,
  },
  reactionButton: {
    alignItems: 'center',
    padding: 8,
  },
  activeReaction: {
    transform: [{ scale: 1.2 }],
  },
  reactionEmoji: {
    fontSize: 32,
  },
  reactionCount: {
    fontSize: 12,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  swipeHints: {
    marginTop: 20,
    alignItems: 'center',
    gap: 8,
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swipeHintText: {
    fontSize: 11,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  progressDot: {
    height: 3,
    borderRadius: 2,
  },
  emptyStateContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  emptyStateContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  swipeInstructions: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
});

export default InshortsFeedScreen;