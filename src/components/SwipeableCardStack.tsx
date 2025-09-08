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
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { NewsArticle } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { format } from 'date-fns';
import EmptyState from './feedback/EmptyState';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

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
  isBookmarked: (articleId: string) => boolean;
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
  isBookmarked,
}) => {
  const { colors, isDark } = useTheme();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeBackgroundCard, setActiveBackgroundCard] = useState<'next' | 'prev' | null>(null);
  const [loadingArticleId, setLoadingArticleId] = useState<string | null>(null);

  // Button area detection no longer needed since buttons are outside PanResponder

  const handleReadMore = useCallback((article: NewsArticle) => {
    console.log('🎯 handleReadMore called for article:', article.id);
    
    // Simple debouncing - prevent multiple rapid taps on the same article
    if (loadingArticleId === article.id) {
      console.log('🚫 Button already loading, ignoring tap');
      return;
    }
    
    console.log('🔄 Setting loading state for article:', article.id);
    setLoadingArticleId(article.id);
    
    try {
      console.log('🚀 Calling onReadMore for article:', article.id);
      onReadMore(article);
      
      // Simple cleanup after 1 second
      setTimeout(() => {
        setLoadingArticleId(null);
      }, 1000);
    } catch (error) {
      console.error('Error in handleReadMore:', error);
      setLoadingArticleId(null);
    }
  }, [onReadMore, loadingArticleId]);

  const handleBookmark = useCallback((article: NewsArticle) => {
    // Simple debouncing - prevent multiple rapid taps on the same article
    if (loadingArticleId === article.id) {
      console.log('🚫 Button already loading, ignoring tap');
      return;
    }
    
    setLoadingArticleId(article.id);
    
    try {
      onBookmark(article);
      
      // Quick cleanup after 300ms
      setTimeout(() => {
        setLoadingArticleId(null);
      }, 300);
    } catch (error) {
      console.error('Error in handleBookmark:', error);
      setLoadingArticleId(null);
    }
  }, [onBookmark, loadingArticleId]);

  const handleShare = useCallback((article: NewsArticle) => {
    // Simple debouncing - prevent multiple rapid taps on the same article
    if (loadingArticleId === article.id) {
      console.log('🚫 Button already loading, ignoring tap');
      return;
    }
    
    setLoadingArticleId(article.id);
    
    try {
      onShare(article);
      
      // Quick cleanup after 300ms
      setTimeout(() => {
        setLoadingArticleId(null);
      }, 300);
    } catch (error) {
      console.error('Error in handleShare:', error);
      setLoadingArticleId(null);
    }
  }, [onShare, loadingArticleId]);

  const handleReaction = useCallback((articleId: string, reaction: 'bull' | 'bear' | 'neutral') => {
    // Simple debouncing - prevent multiple rapid taps on the same article
    if (loadingArticleId === articleId) {
      console.log('🚫 Button already loading, ignoring tap');
      return;
    }
    
    setLoadingArticleId(articleId);
    
    try {
      onReaction(articleId, reaction);
      
      // Quick cleanup after 200ms
      setTimeout(() => {
        setLoadingArticleId(null);
      }, 200);
    } catch (error) {
      console.error('Error in handleReaction:', error);
      setLoadingArticleId(null);
    }
  }, [onReaction, loadingArticleId]);
  
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
  
  // Dynamic swipe thresholds based on screen dimensions
  const SWIPE_THRESHOLD = useMemo(() => SCREEN_HEIGHT * 0.15, [SCREEN_HEIGHT]);
  const HORIZONTAL_SWIPE_THRESHOLD = useMemo(() => SCREEN_WIDTH * 0.25, [SCREEN_WIDTH]);
  const VELOCITY_THRESHOLD = 0.7;
  const MAX_SWIPE_DISTANCE = useMemo(() => SCREEN_HEIGHT * 0.8, [SCREEN_HEIGHT]);

  // Reset current index when articles change
  useEffect(() => {
    if (articles.length > 0 && currentIndex >= articles.length) {
      setCurrentIndex(0);
    }
  }, [articles.length, currentIndex]);

  // Reset loading state when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      // Only reset if we're actually returning to this screen (not just initial mount)
      const resetTimeout = setTimeout(() => {
        console.log('🔄 Screen focused, resetting loading state');
        setLoadingArticleId(null);
      }, 100);

      return () => clearTimeout(resetTimeout);
    }, [])
  );

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
  }, [currentIndex, onIndexChange, SCREEN_HEIGHT, mainCardY, mainCardScale, nextCardY, nextCardScale, nextCardOpacity, prevCardY, prevCardScale, prevCardOpacity]);

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
  }, [currentIndex, onIndexChange, SCREEN_HEIGHT, mainCardY, mainCardScale, nextCardY, nextCardScale, nextCardOpacity, prevCardY, prevCardScale, prevCardOpacity]);

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
  }, [mainCardY, mainCardX, mainCardScale, mainCardRotate, mainCardOpacity, nextCardY, nextCardScale, nextCardOpacity, prevCardY, prevCardScale, prevCardOpacity]);

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

  // Reset loading state when current article changes (swipe navigation)
  useEffect(() => {
    if (currentItem) {
      console.log('🔄 Current article changed to:', currentItem.id, 'Resetting loading state');
      setLoadingArticleId(null);
    }
  }, [currentItem?.id]);

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

  // Main swipe gesture handler - FIXED: Much more restrictive touch handling
  const panResponder = useMemo(() => PanResponder.create({
    // Don't grab touches immediately. Let buttons receive taps.
    onStartShouldSetPanResponder: () => false,
    onStartShouldSetPanResponderCapture: () => false,

    // FIXED: Buttons are now outside PanResponder, so we can use normal thresholds
    onMoveShouldSetPanResponder: (_, gestureState) => {
      const verticalMovement = Math.abs(gestureState.dy);
      const horizontalMovement = Math.abs(gestureState.dx);
      // Normal thresholds since buttons are separate
      return verticalMovement > 15 || horizontalMovement > 20;
    },

    // If a child (e.g., TouchableOpacity) asked for the responder, let it have it
    onPanResponderTerminationRequest: () => true,
    onShouldBlockNativeResponder: () => false,
    
    // Prevent other components from interfering with vertical swipes
    onPanResponderReject: () => {
      // Don't let other components handle vertical swipes
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
      
      if (verticalMovement > 15 || horizontalMovement > 15) {
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

  // MEMOIZED: Render card content to prevent excessive re-renders
  const renderCard = useCallback((article: NewsArticle | null) => {
    if (!article) return null;

    return (
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={[
          styles.cardGradient, 
          { 
            borderWidth: 1,
            borderColor: '#E2E8F0',
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          }
        ]}
      >
        {/* Article Content */}
        <ScrollView 
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          // Disabled RefreshControl to prevent conflicts with swipe gestures
          // refreshControl={
          //   onRefresh ? (
          //     <RefreshControl
          //       refreshing={refreshing || false}
          //       onRefresh={onRefresh}
          //       tintColor={colors.primary}
          //     />
          //   ) : undefined
          // }
        >
          {/* Source Info with Reactions */}
          <View style={styles.sourceRow}>
            <View style={styles.sourceInfo}>
              <View style={[styles.sourceAvatar, { 
                backgroundColor: '#3B82F6',
                shadowColor: 'rgba(0, 0, 0, 0.1)'
              }]}>
                <Text style={[styles.sourceAvatarText, { color: '#FFFFFF' }]}>
                  {article.sourceName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={[styles.sourceName, { color: '#1E293B' }]}>
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
                style={[styles.compactReactionButton, { 
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(59, 130, 246, 0.2)'
                }]}
                onPress={() => handleReaction(article.id, 'bull')}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.compactReactionEmoji}>🐂</Text>
                <Text style={[styles.compactReactionCount, { color: '#64748B' }]}>{article.reactions.bull}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.compactReactionButton, { 
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(59, 130, 246, 0.2)'
                }]}
                onPress={() => handleReaction(article.id, 'bear')}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.compactReactionEmoji}>🐻</Text>
                <Text style={[styles.compactReactionCount, { color: '#64748B' }]}>{article.reactions.bear}</Text>
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
          <Text style={[styles.headline, { color: '#1E293B' }]}>
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
              <View key={coin.id} style={[styles.tag, { 
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                shadowColor: 'rgba(0, 0, 0, 0.1)'
              }]}>
                <Text style={[styles.tagText, { color: '#3B82F6' }]}>
                  ${coin.symbol}
                </Text>
                {coin.priceChangePercentage24h && (
                  <Text style={[
                    styles.tagPrice,
                    { color: coin.priceChangePercentage24h > 0 ? '#10B981' : '#EF4444' }
                  ]}>
                    {coin.priceChangePercentage24h > 0 ? '+' : ''}
                    {coin.priceChangePercentage24h.toFixed(2)}%
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </ScrollView>

        {/* Content area - no buttons here */}
      </LinearGradient>
    );
  }, [colors, isDark, handleReaction, handleBookmark, handleShare, handleReadMore, refreshing, onRefresh, loadingArticleId, insets.bottom, isBookmarked]);

  if (articles.length === 0) {
    return (
      <EmptyState 
        title={`No articles in ${currentCategoryName}`}
        message="Swipe left or right to change categories"
      />
    );
  }

  const mainCardRotateInterpolate = mainCardRotate.interpolate({
    inputRange: [-30, 0, 30],
    outputRange: ['-30deg', '0deg', '30deg'],
  });

  return (
    <LinearGradient
      colors={['#FFFFFF', '#F8FAFC']}
      style={styles.container}
    >
      {/* Swipe area - NO buttons, cleaner touch handling */}
      <View style={styles.swipeArea} {...panResponder.panHandlers}>
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
                shadowColor: colors.cardShadow,
                borderColor: colors.cardBorder,
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
                shadowColor: colors.cardShadow,
                borderColor: colors.cardBorder,
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
              shadowColor: colors.cardShadow,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          {renderCard(currentItem)}
        </Animated.View>
      </View>

      {/* Button area - NO swipe handling, completely separate */}
      <View style={[styles.buttonArea, { paddingBottom: 16 + insets.bottom }]}>
        {/* Read More Button - Half Width */}
        <TouchableOpacity 
          style={[styles.readMoreButtonHalf, { 
            backgroundColor: loadingArticleId === currentItem?.id ? '#94A3B8' : '#3B82F6',
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            opacity: loadingArticleId === currentItem?.id ? 0.7 : 1,
          }]}
          onPress={() => currentItem && handleReadMore(currentItem)}
          disabled={loadingArticleId === currentItem?.id}
          activeOpacity={0.6} // Better visual feedback
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }} // Larger hit area
          accessible={true}
          accessibilityLabel="Read full article"
          accessibilityRole="button"
          accessibilityState={{ disabled: loadingArticleId === currentItem?.id }}
        >
          {loadingArticleId === currentItem?.id ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={[styles.readMoreText, { color: '#FFFFFF', marginLeft: 8 }]}>Opening...</Text>
            </View>
          ) : (
            <>
              <Text style={[styles.readMoreText, { color: '#FFFFFF' }]}>Read Full Article</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>

        {/* Save and Share - Half Width */}
        <View style={styles.saveShareContainer}>
          <TouchableOpacity 
            style={[styles.saveShareButton, { backgroundColor: '#FFFFFF' }]}
            onPress={() => currentItem && handleBookmark(currentItem)}
            activeOpacity={0.6} // Better visual feedback
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }} // Larger hit area
            accessible={true}
            accessibilityLabel={currentItem && isBookmarked(currentItem.id) ? "Remove bookmark" : "Add bookmark"}
            accessibilityRole="button"
          >
            <Ionicons 
              name={currentItem && isBookmarked(currentItem.id) ? "bookmark" : "bookmark-outline"} 
              size={16} 
              color={currentItem && isBookmarked(currentItem.id) ? "#3B82F6" : "#64748B"} 
            />
            <Text style={[
              styles.saveShareText, 
              { color: currentItem && isBookmarked(currentItem.id) ? "#3B82F6" : "#64748B" }
            ]}>
              {currentItem && isBookmarked(currentItem.id) ? "Saved" : "Save"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveShareButton, { backgroundColor: '#FFFFFF' }]}
            onPress={() => currentItem && handleShare(currentItem)}
            activeOpacity={0.6} // Better visual feedback
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }} // Larger hit area
            accessible={true}
            accessibilityLabel="Share article"
            accessibilityRole="button"
          >
            <Ionicons name="share-outline" size={16} color="#64748B" />
            <Text style={[styles.saveShareText, { color: '#64748B' }]}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  swipeArea: {
    flex: 1,
    position: 'relative',
    paddingBottom: 120, // Space for buttons
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
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  backgroundCard: {
    zIndex: 5,
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
    paddingBottom: 60,
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
    height: undefined,
    aspectRatio: 16 / 9,
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
  },
  compactReactionEmoji: {
    fontSize: 14,
  },
  compactReactionCount: {
    fontSize: 10,
    fontWeight: '600',
  },
  readMoreButtonHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    minHeight: 48, // Ensure minimum touch target
    zIndex: 1001, // Higher than container
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
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
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    minHeight: 48, // Ensure minimum touch target
    zIndex: 1001, // Higher than container
  },
  saveShareText: {
    fontSize: 12,
    fontWeight: '600',
  },
  buttonArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 1000, // Ensure buttons are on top
    elevation: 1000, // Android elevation
    backgroundColor: 'transparent', // Let card background show through
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
    zIndex: 1000, // Ensure buttons are on top
    elevation: 1000, // Android elevation
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Semi-transparent background
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