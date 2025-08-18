import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  PanResponder,
  Animated,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { NewsArticle } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { format } from 'date-fns';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SwipeableCardStackProps {
  articles: NewsArticle[];
  onIndexChange?: (index: number) => void;
  onReaction: (articleId: string, reaction: 'bull' | 'bear' | 'neutral') => void;
  onBookmark: (article: NewsArticle) => void;
  onShare: (article: NewsArticle) => void;
  onReadMore: (article: NewsArticle) => void;
  onSwipeHorizontal?: (direction: 'left' | 'right') => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  currentCategoryName?: string;
}

export const SwipeableCardStack: React.FC<SwipeableCardStackProps> = ({
  articles,
  onIndexChange,
  onReaction,
  onBookmark,
  onShare,
  onReadMore,
  onSwipeHorizontal,
  refreshing = false,
  onRefresh,
  currentCategoryName = 'All',
}) => {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeBackgroundCard, setActiveBackgroundCard] = useState<'next' | 'prev' | null>(null);
  
  // Animation values for each card position
  const mainCardY = useRef(new Animated.Value(0)).current;
  const mainCardX = useRef(new Animated.Value(0)).current;
  const mainCardScale = useRef(new Animated.Value(1)).current;
  const mainCardRotate = useRef(new Animated.Value(0)).current;
  const mainCardOpacity = useRef(new Animated.Value(1)).current;
  
  const nextCardY = useRef(new Animated.Value(8)).current;
  const nextCardScale = useRef(new Animated.Value(0.95)).current;
  const nextCardOpacity = useRef(new Animated.Value(0)).current;
  
  const prevCardY = useRef(new Animated.Value(8)).current;
  const prevCardScale = useRef(new Animated.Value(0.95)).current;
  const prevCardOpacity = useRef(new Animated.Value(0)).current;
  
  // Swipe thresholds
  const SWIPE_THRESHOLD = SCREEN_HEIGHT * 0.15;
  const HORIZONTAL_SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
  const VELOCITY_THRESHOLD = 0.7;
  const MAX_SWIPE_DISTANCE = SCREEN_HEIGHT * 0.8;

  // Reset current index when articles change
  useEffect(() => {
    if (articles.length > 0 && currentIndex >= articles.length) {
      setCurrentIndex(0);
    }
  }, [articles.length, currentIndex]);

  const animateToNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.parallel([
      // Main card exits
      Animated.timing(mainCardY, {
        toValue: -SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(mainCardScale, {
        toValue: 0.9,
        duration: 250,
        useNativeDriver: true,
      }),
      // Next card enters
      Animated.timing(nextCardY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(nextCardScale, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(nextCardOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setActiveBackgroundCard(null);
      onIndexChange?.(newIndex);
      
      // Reset animations
      requestAnimationFrame(() => {
        mainCardY.setValue(0);
        mainCardScale.setValue(1);
        nextCardY.setValue(8);
        nextCardScale.setValue(0.95);
        nextCardOpacity.setValue(0);
        prevCardY.setValue(8);
        prevCardScale.setValue(0.95);
        prevCardOpacity.setValue(0);
      });
    });
  }, [currentIndex, onIndexChange]);

  const animateToPrevious = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.parallel([
      // Main card exits
      Animated.timing(mainCardY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(mainCardScale, {
        toValue: 0.9,
        duration: 250,
        useNativeDriver: true,
      }),
      // Previous card enters
      Animated.timing(prevCardY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(prevCardScale, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(prevCardOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setActiveBackgroundCard(null);
      onIndexChange?.(newIndex);
      
      // Reset animations
      requestAnimationFrame(() => {
        mainCardY.setValue(0);
        mainCardScale.setValue(1);
        nextCardY.setValue(8);
        nextCardScale.setValue(0.95);
        nextCardOpacity.setValue(0);
        prevCardY.setValue(8);
        prevCardScale.setValue(0.95);
        prevCardOpacity.setValue(0);
      });
    });
  }, [currentIndex, onIndexChange]);

  const resetPosition = useCallback(() => {
    setActiveBackgroundCard(null);
    
    Animated.parallel([
      Animated.spring(mainCardY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(mainCardX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(mainCardScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(mainCardRotate, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(mainCardOpacity, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(nextCardY, {
        toValue: 8,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(nextCardScale, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(nextCardOpacity, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(prevCardY, {
        toValue: 8,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(prevCardScale, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(prevCardOpacity, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();
  }, []);

  // Memoize current items
  const currentItem = useMemo(() => articles[currentIndex], [articles, currentIndex]);
  const nextItem = useMemo(() => 
    currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null, 
    [articles, currentIndex]
  );
  const previousItem = useMemo(() => 
    currentIndex > 0 ? articles[currentIndex - 1] : null, 
    [articles, currentIndex]
  );

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      // Stop all animations
      mainCardY.stopAnimation();
      mainCardX.stopAnimation();
      mainCardScale.stopAnimation();
      mainCardRotate.stopAnimation();
      mainCardOpacity.stopAnimation();
      nextCardY.stopAnimation();
      nextCardScale.stopAnimation();
      nextCardOpacity.stopAnimation();
      prevCardY.stopAnimation();
      prevCardScale.stopAnimation();
      prevCardOpacity.stopAnimation();
    };
  }, []);

  // Main swipe gesture handler
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      const verticalMovement = Math.abs(gestureState.dy);
      const horizontalMovement = Math.abs(gestureState.dx);
      return verticalMovement > 5 || horizontalMovement > 5;
    },
    onPanResponderGrant: () => {
      // Stop any ongoing animations
      mainCardY.stopAnimation();
      mainCardX.stopAnimation();
      mainCardScale.stopAnimation();
      mainCardRotate.stopAnimation();
      mainCardOpacity.stopAnimation();
      nextCardY.stopAnimation();
      nextCardScale.stopAnimation();
      nextCardOpacity.stopAnimation();
      prevCardY.stopAnimation();
      prevCardScale.stopAnimation();
      prevCardOpacity.stopAnimation();
      
      setActiveBackgroundCard(null);
    },
    onPanResponderMove: (_, gestureState) => {
      const { dx, dy } = gestureState;
      
      const verticalMovement = Math.abs(dy);
      const horizontalMovement = Math.abs(dx);
      
      if (verticalMovement > 10 || horizontalMovement > 10) {
        const isVerticalSwipe = verticalMovement > horizontalMovement * 1.2;
        const isHorizontalSwipe = horizontalMovement > verticalMovement * 1.2;
        
        if (isVerticalSwipe) {
          // Handle vertical swipe for article navigation
          const limitedDy = Math.max(-MAX_SWIPE_DISTANCE, Math.min(MAX_SWIPE_DISTANCE, dy));
          const progress = Math.abs(limitedDy) / SWIPE_THRESHOLD;
          const clampedProgress = Math.min(progress, 1);
          
          mainCardY.setValue(limitedDy);
          
          // Scale effect during swipe
          const scaleValue = clampedProgress > 0.8 ? 1 - ((clampedProgress - 0.8) * 0.1) : 1;
          mainCardScale.setValue(scaleValue);
          
          // Background card animations
          const bgScale = 0.95 + (clampedProgress * 0.05);
          const bgTranslateY = 8 - (clampedProgress * 8);
          const bgOpacity = clampedProgress > 0.2 ? Math.min((clampedProgress - 0.2) / 0.8, 1) : 0;
          
          if (dy < 0 && nextItem) {
            // Swiping up - show next card
            setActiveBackgroundCard('next');
            nextCardY.setValue(bgTranslateY);
            nextCardScale.setValue(bgScale);
            nextCardOpacity.setValue(bgOpacity);
          } else if (dy > 0 && previousItem) {
            // Swiping down - show previous card
            setActiveBackgroundCard('prev');
            prevCardY.setValue(bgTranslateY);
            prevCardScale.setValue(bgScale);
            prevCardOpacity.setValue(bgOpacity);
          }
        } else if (isHorizontalSwipe && onSwipeHorizontal) {
          // Handle horizontal swipe for category navigation
          mainCardX.setValue(dx);
          
          // Add rotation effect
          const rotation = (dx / SCREEN_WIDTH) * 15;
          mainCardRotate.setValue(rotation);
          
          // Fade out effect
          const opacity = 1 - Math.abs(dx) / (SCREEN_WIDTH * 0.8);
          mainCardOpacity.setValue(Math.max(0.2, opacity));
        }
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      const { dx, dy, vx, vy } = gestureState;
      
      const verticalMovement = Math.abs(dy);
      const horizontalMovement = Math.abs(dx);
      
      const isVerticalSwipe = verticalMovement > horizontalMovement * 1.2;
      const isHorizontalSwipe = horizontalMovement > verticalMovement * 1.2;
      
      if (isVerticalSwipe && (verticalMovement > SWIPE_THRESHOLD || Math.abs(vy) > VELOCITY_THRESHOLD)) {
        if (dy < 0 && currentIndex < articles.length - 1) {
          animateToNext();
        } else if (dy > 0 && currentIndex > 0) {
          animateToPrevious();
        } else {
          resetPosition();
        }
      } else if (isHorizontalSwipe && onSwipeHorizontal && 
                (horizontalMovement > HORIZONTAL_SWIPE_THRESHOLD || Math.abs(vx) > VELOCITY_THRESHOLD)) {
        const direction = dx > 0 ? 'right' : 'left';
        
        // Animate card out
        Animated.parallel([
          Animated.timing(mainCardX, {
            toValue: dx > 0 ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(mainCardRotate, {
            toValue: dx > 0 ? 30 : -30,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(mainCardOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onSwipeHorizontal(direction);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          
          // Reset for new category
          mainCardX.setValue(0);
          mainCardRotate.setValue(0);
          mainCardOpacity.setValue(1);
        });
      } else {
        resetPosition();
      }
    },
  }), [
    currentIndex, 
    articles.length, 
    onSwipeHorizontal, 
    nextItem, 
    previousItem, 
    SWIPE_THRESHOLD, 
    HORIZONTAL_SWIPE_THRESHOLD, 
    VELOCITY_THRESHOLD, 
    MAX_SWIPE_DISTANCE,
    SCREEN_WIDTH,
    mainCardY,
    mainCardX,
    mainCardScale,
    mainCardRotate,
    mainCardOpacity,
    nextCardY,
    nextCardScale,
    nextCardOpacity,
    prevCardY,
    prevCardScale,
    prevCardOpacity,
    animateToNext,
    animateToPrevious,
    resetPosition
  ]);

  // Render card content
  const renderCard = useCallback((article: NewsArticle | null) => {
    if (!article) return null;

    return (
      <LinearGradient
        colors={[colors.background, colors.card, '#000']}
        style={styles.cardGradient}
        locations={[0, 0.3, 1]}
      >
        {/* Article Content */}
        <ScrollView 
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || false}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Source Info */}
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
          </View>

          {/* Headline */}
          <Text style={[styles.headline, { color: colors.text }]}>
            {article.headline}
          </Text>

          {/* Summary */}
          <Text style={[styles.summary, { color: colors.textSecondary }]}>
            {article.summary}
          </Text>

          {/* Tags */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tagsContainer}
          >
            {article.coins.map((coin) => (
              <View key={coin.id} style={[styles.tag, { backgroundColor: colors.surface }]}>
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
          </ScrollView>

          {/* Read More Button */}
          <TouchableOpacity 
            style={[styles.readMoreButton, { backgroundColor: colors.primary }]}
            onPress={() => onReadMore(article)}
          >
            <Text style={styles.readMoreText}>Read Full Article</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onReaction(article.id, 'bull')}
          >
            <Text style={styles.reactionEmoji}>🐂</Text>
            <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>
              {article.reactions.bull}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onReaction(article.id, 'bear')}
          >
            <Text style={styles.reactionEmoji}>🐻</Text>
            <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>
              {article.reactions.bear}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onBookmark(article)}
          >
            <Ionicons name="bookmark-outline" size={24} color={colors.text} />
            <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onShare(article)}
          >
            <Ionicons name="share-social-outline" size={24} color={colors.text} />
            <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>Share</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }, [colors, onReaction, onBookmark, onShare, onReadMore, refreshing, onRefresh]);

  if (articles.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No articles in {currentCategoryName}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Swipe left or right to change categories
          </Text>
        </View>
      </View>
    );
  }

  const mainCardRotateInterpolate = mainCardRotate.interpolate({
    inputRange: [-30, 0, 30],
    outputRange: ['-30deg', '0deg', '30deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.cardContainer} {...panResponder.panHandlers}>
        {/* Background card - next */}
        {activeBackgroundCard === 'next' && nextItem && (
          <Animated.View 
            key={`next-${nextItem.id}`}
            style={[
              styles.cardLayer,
              styles.backgroundCard,
              {
                opacity: nextCardOpacity,
                transform: [
                  { scale: nextCardScale },
                  { translateY: nextCardY },
                ],
              }
            ]}
          >
            {renderCard(nextItem)}
          </Animated.View>
        )}

        {/* Background card - previous */}
        {activeBackgroundCard === 'prev' && previousItem && (
          <Animated.View 
            key={`prev-${previousItem.id}`}
            style={[
              styles.cardLayer,
              styles.backgroundCard,
              {
                opacity: prevCardOpacity,
                transform: [
                  { scale: prevCardScale },
                  { translateY: prevCardY },
                ],
              }
            ]}
          >
            {renderCard(previousItem)}
          </Animated.View>
        )}

        {/* Main card */}
        <Animated.View
          key={`main-${currentItem?.id}`}
          style={[
            styles.cardLayer,
            styles.mainCard,
            {
              opacity: mainCardOpacity,
              transform: [
                { translateY: mainCardY },
                { translateX: mainCardX },
                { rotate: mainCardRotateInterpolate },
                { scale: mainCardScale },
              ],
            },
          ]}
        >
          {renderCard(currentItem)}
        </Animated.View>
      </View>

      {/* Progress Indicator */}
      <View style={styles.bottomIndicator}>
        <View style={[styles.progressContainer, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
          <Text style={styles.progressText}>
            {currentIndex + 1} of {articles.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentIndex + 1) / articles.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Swipe Instructions */}
      <View style={styles.swipeHints}>
        <Text style={[styles.swipeHintText, { color: colors.textSecondary }]}>
          ↑ Swipe up for next • ↓ Swipe down for previous
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
    position: 'relative',
  },
  cardLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mainCard: {
    zIndex: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backgroundCard: {
    zIndex: 5,
  },
  cardGradient: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    fontSize: 16,
    fontWeight: '600',
  },
  publishTime: {
    fontSize: 12,
  },
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 32,
  },
  summary: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  tagsContainer: {
    marginBottom: 24,
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
    marginTop: 20,
  },
  readMoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  reactionEmoji: {
    fontSize: 24,
  },
  actionLabel: {
    fontSize: 12,
  },
  bottomIndicator: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 15,
  },
  progressContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  progressBar: {
    width: 100,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  swipeHints: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeHintText: {
    fontSize: 11,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
});

export default SwipeableCardStack;