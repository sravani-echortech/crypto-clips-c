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
  Image,
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
  const { colors, isDark } = useTheme();
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
        colors={['#F8FAFC', '#E2E8F0']}
        style={[
          styles.cardGradient, 
          { 
            borderWidth: 1,
            borderColor: 'rgba(245, 158, 11, 0.3)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 6,
          }
        ]}
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
          {/* Source Info with Reactions */}
          <View style={styles.sourceRow}>
            <View style={styles.sourceInfo}>
              <View style={[styles.sourceAvatar, { backgroundColor: '#3B82F6' }]}>
                <Text style={styles.sourceAvatarText}>
                  {article.sourceName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={[styles.sourceName, { color: '#0F172A' }]}>
                  {article.sourceName}
                </Text>
                <Text style={[styles.publishTime, { color: '#64748B' }]}>
                  {format(new Date(article.publishedAt), 'MMM d, h:mm a')}
                </Text>
              </View>
            </View>
            
            {/* Compact Reactions */}
            <View style={styles.compactReactions}>
              <TouchableOpacity 
                style={styles.compactReactionButton}
                onPress={() => onReaction(article.id, 'bull')}
              >
                <Text style={styles.compactReactionEmoji}>🐂</Text>
                <Text style={styles.compactReactionCount}>{article.reactions.bull}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.compactReactionButton}
                onPress={() => onReaction(article.id, 'bear')}
              >
                <Text style={styles.compactReactionEmoji}>🐻</Text>
                <Text style={styles.compactReactionCount}>{article.reactions.bear}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Article Image */}
          {article.thumbnail && (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: article.thumbnail }}
                style={styles.articleImage}
                resizeMode="cover"
                onError={() => console.log('Image failed to load:', article.thumbnail)}
              />
            </View>
          )}

          {/* Headline */}
          <Text style={[styles.headline, { color: '#0F172A' }]}>
            {article.headline}
          </Text>

          {/* Summary */}
          <Text style={[styles.summary, { color: '#64748B' }]}>
            {article.summary}
          </Text>

          {/* Tags */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tagsContainer}
          >
            {article.coins.map((coin) => (
              <View key={coin.id} style={[styles.tag, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <Text style={[styles.tagText, { color: '#3B82F6' }]}>
                  ${coin.symbol}
                </Text>
                {coin.priceChangePercentage24h && (
                  <Text style={[
                    styles.tagPrice,
                    { color: coin.priceChangePercentage24h > 0 ? '#6B7280' : '#94A3B8' }
                  ]}>
                    {coin.priceChangePercentage24h > 0 ? '+' : ''}
                    {coin.priceChangePercentage24h.toFixed(2)}%
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </ScrollView>

        {/* Sticky Actions Bar */}
        <View style={styles.stickyActionsBar}>
          {/* Read More Button - Half Width */}
                      <TouchableOpacity 
              style={styles.readMoreButtonHalf}
              onPress={() => onReadMore(article)}
            >
              <Text style={[styles.readMoreText, { color: '#FFFFFF' }]}>Read Full Article</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>

          {/* Save and Share - Half Width */}
          <View style={styles.saveShareContainer}>
            <TouchableOpacity 
              style={styles.saveShareButton}
              onPress={() => onBookmark(article)}
            >
              <Ionicons name="bookmark-outline" size={16} color="#0F172A" />
              <Text style={styles.saveShareText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.saveShareButton}
              onPress={() => onShare(article)}
            >
              <Ionicons name="share-social-outline" size={16} color="#0F172A" />
              <Text style={styles.saveShareText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }, [colors, isDark, onReaction, onBookmark, onShare, onReadMore, refreshing, onRefresh]);

  if (articles.length === 0) {
    return (
      <LinearGradient
        colors={['#F8FAFC', '#E2E8F0']}
        style={styles.container}
      >
        <View style={styles.emptyContainer} {...panResponder.panHandlers}>
          <Text style={[styles.emptyText, { color: '#0F172A' }]}>
            No articles in {currentCategoryName}
          </Text>
          <Text style={[styles.emptySubtext, { color: '#64748B' }]}>
            Swipe left or right to change categories
          </Text>
        </View>
      </LinearGradient>
    );
  }

  const mainCardRotateInterpolate = mainCardRotate.interpolate({
    inputRange: [-30, 0, 30],
    outputRange: ['-30deg', '0deg', '30deg'],
  });

  return (
          <LinearGradient
        colors={['#F8FAFC', '#E2E8F0']}
        style={styles.container}
      >
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

      {/* Progress Indicator - Removed for better UX */}

      {/* Swipe Instructions */}
      <View style={styles.swipeHints}>
        <Text style={[styles.swipeHintText, { color: '#64748B' }]}>
          ↑ Swipe up for next • ↓ Swipe down for previous
        </Text>
      </View>
    </LinearGradient>
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
    elevation: 15,
    shadowColor: 'rgba(59, 130, 246, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  backgroundCard: {
    zIndex: 5,
    shadowColor: 'rgba(59, 130, 246, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  cardGradient: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 60, // Reduced space for compact sticky actions bar
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(59, 130, 246, 0.3)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  sourceAvatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sourceName: {
    fontSize: 13,
    fontWeight: '600',
  },
  publishTime: {
    fontSize: 10,
  },
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 32,
  },
  summary: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  imageContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  articleImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 8,
    shadowColor: 'rgba(59, 130, 246, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    gap: 6,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: 'rgba(59, 130, 246, 0.3)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inlineActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 16,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  reactionEmoji: {
    fontSize: 18,
  },
  actionLabel: {
    fontSize: 10,
  },
  compactReactions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactReactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  compactReactionEmoji: {
    fontSize: 14,
  },
  compactReactionCount: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  combinedActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  readMoreButtonHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
    backgroundColor: '#3B82F6',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  saveShareContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  saveShareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  saveShareText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  stickyActionsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16, // Reduced padding for safe area
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