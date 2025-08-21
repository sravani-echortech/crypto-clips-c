import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useStore } from '@/store';
import { NewsArticle } from '@/types';
import { typography, globalStyles } from '@/styles/global';
import TagChip from '../chips/TagChip';
import PriceChip from '../chips/PriceChip';
import ReactionBar from '../buttons/ReactionBar';
import BookmarkButton from '../buttons/BookmarkButton';
import ShareButton from '../buttons/ShareButton';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
  article: NewsArticle;
  onPress?: () => void;
  onReaction?: (reaction: 'bull' | 'bear' | 'neutral') => void;
  onBookmark?: () => void;
  onShare?: () => void;
  showImage?: boolean;
  compact?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onPress,
  onReaction,
  onBookmark,
  onShare,
  showImage = true,
  compact = false,
}) => {
  const { colors, isDark } = useTheme();
  const { preferences, isBookmarked, markArticleAsViewed } = useStore();
  const [imageError, setImageError] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);

  useEffect(() => {
    // Track view after 2 seconds
    const timer = setTimeout(() => {
      if (!viewTracked) {
        markArticleAsViewed(article.id);
        setViewTracked(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handlePress = () => {
    markArticleAsViewed(article.id);
    onPress?.();
  };

  const handleReaction = (reaction: 'bull' | 'bear' | 'neutral') => {
    onReaction?.(reaction);
  };

  const handleBookmark = () => {
    onBookmark?.();
  };

  const handleShare = () => {
    onShare?.();
  };

  const shouldShowImage = showImage && 
    article.thumbnail && 
    !imageError && 
    (!preferences.dataSaver || !preferences.dataSaver);

  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true });

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      style={[
        styles.container,
        { 
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          shadowColor: colors.cardShadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        },
        compact && styles.compactContainer,
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        style={styles.touchable}
        accessibilityRole="button"
        accessibilityLabel={`Read article: ${article.headline}`}
      >
        {/* Header */}
        <View style={styles.header}>
          {article.sourceAvatar && (
            <Image 
              source={{ uri: article.sourceAvatar }}
              style={styles.sourceAvatar}
            />
          )}
          <View style={styles.sourceInfo}>
            <Text style={[styles.sourceName, { color: colors.text }]}>
              {article.sourceName}
            </Text>
            <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>
              {timeAgo}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={[styles.textContent, shouldShowImage && styles.textWithImage]}>
            <Text 
              style={[
                styles.headline, 
                { color: colors.text },
                compact && styles.compactHeadline,
              ]}
              numberOfLines={compact ? 2 : 3}
            >
              {article.headline}
            </Text>
            
            {!compact && (
              <Text 
                style={[styles.summary, { color: colors.textSecondary }]}
                numberOfLines={3}
              >
                {article.summary}
              </Text>
            )}

            {/* Tags */}
            <View style={styles.tags}>
              {article.coins.slice(0, 3).map((coin) => (
                <TagChip 
                  key={coin.id}
                  label={coin.symbol}
                  type="coin"
                  size="small"
                />
              ))}
              {article.categories.slice(0, 2).map((category) => (
                <TagChip 
                  key={category.id}
                  label={category.name}
                  type="category"
                  size="small"
                />
              ))}
            </View>
          </View>

          {shouldShowImage && (
            <Image 
              source={{ uri: article.thumbnail }}
              style={[styles.thumbnail, { backgroundColor: colors.border }]}
              onError={() => setImageError(true)}
              accessibilityLabel="Article thumbnail"
            />
          )}
        </View>

        {/* Price Chips */}
        {article.coins.length > 0 && (
          <View style={styles.priceChips}>
            {article.coins.slice(0, 2).map((coin) => (
              <PriceChip 
                key={coin.id}
                coin={coin}
                showChange
                compact
              />
            ))}
          </View>
        )}
      </TouchableOpacity>

      {/* Actions */}
      {!compact && (
        <View style={[styles.actions, { borderTopColor: colors.cardBorder }]}>
          <ReactionBar 
            reactions={article.reactions}
            userReaction={article.userReaction}
            onReaction={handleReaction}
          />
          
          <View style={styles.rightActions}>
            <BookmarkButton 
              isBookmarked={isBookmarked(article.id)}
              onPress={handleBookmark}
            />
            <ShareButton 
              onPress={handleShare}
            />
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    // Theme-specific shadows will be applied dynamically
  },
  compactContainer: {
    marginVertical: 4,
  },
  touchable: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sourceAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    ...typography.captionBold,
  },
  timeAgo: {
    ...typography.footnote,
    marginTop: 2,
  },
  content: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  textContent: {
    flex: 1,
  },
  textWithImage: {
    marginRight: 12,
  },
  headline: {
    ...typography.subheadline,
    marginBottom: 8,
    lineHeight: 22,
  },
  compactHeadline: {
    fontSize: 14,
    lineHeight: 18,
  },
  summary: {
    ...typography.caption,
    lineHeight: 20,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  priceChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});

export default NewsCard;