import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import ArticleHeader from '@/components/common/ArticleHeader';
import ResponsiveAppHeader from '@/components/common/ResponsiveAppHeader';
import { useTheme } from '@/contexts/ThemeContext';
import { useStore } from '@/store';
import { NewsArticle } from '@/types';
import { format } from 'date-fns';

const ArticleViewerScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();

  const rawArticle = (route.params as any)?.article as NewsArticle;
  
  // Convert string dates back to Date objects if needed
  const article: NewsArticle = rawArticle ? {
    ...rawArticle,
    publishedAt: typeof rawArticle.publishedAt === 'string' 
      ? new Date(rawArticle.publishedAt) 
      : rawArticle.publishedAt,
    updatedAt: typeof rawArticle.updatedAt === 'string' 
      ? new Date(rawArticle.updatedAt) 
      : rawArticle.updatedAt,
  } : rawArticle;

  const {
    addBookmark,
    removeBookmark,
    isBookmarked,
    markArticleAsViewed,
    addTokens,
    preferences,
  } = useStore();

  const [fontSize, setFontSize] = useState(16);

  const isBookmarkedArticle = isBookmarked(article?.id || '');

  useEffect(() => {
    if (article) {
      markArticleAsViewed(article.id);
      addTokens(1, 'Article read');
    }
  }, [article?.id]);

  const handleBookmark = useCallback(() => {
    if (!article) return;
    
    if (preferences.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (isBookmarkedArticle) {
      removeBookmark(article.id);
    } else {
      addBookmark(article);
    }
  }, [article, isBookmarkedArticle, addBookmark, removeBookmark, preferences.haptics]);

  const handleShare = useCallback(async () => {
    if (!article) return;

    try {
      await Share.share({
        title: article.headline,
        message: `${article.headline}\n\nRead more: ${article.url}`,
        url: article.url,
      });
      addTokens(2, 'Article shared');
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  }, [article, addTokens]);

  const changeFontSize = useCallback((delta: number) => {
    setFontSize(prev => Math.max(12, Math.min(24, prev + delta)));
  }, []);

  if (!article) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ResponsiveAppHeader 
          title="Article" 
          leftIcon="arrow-back"
          leftAction={() => navigation.goBack()} 
        />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Article not found
          </Text>
        </View>
      </View>
    );
  }

  const renderContent = () => (
    <ScrollView 
      style={styles.readerContent}
      contentContainerStyle={styles.readerContentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.readerHeadline, { color: colors.text, fontSize: fontSize + 4 }]}>
        {article.headline}
      </Text>
      
      <View style={styles.readerMeta}>
        <Text style={[styles.readerMetaText, { color: colors.textSecondary }]}>
          {article.sourceName} • {format(new Date(article.publishedAt), 'MMMM d, yyyy')}
        </Text>
        {article.readTime && (
          <Text style={[styles.readerMetaText, { color: colors.textSecondary }]}>
            {article.readTime} min read
          </Text>
        )}
      </View>

      {article.thumbnail && (
        <View style={styles.readerImage}>
          <Image 
            source={{ uri: article.thumbnail }}
            style={styles.articleImage}
            resizeMode="cover"
            onError={() => console.log('Image failed to load:', article.thumbnail)}
          />
        </View>
      )}

      <Text style={[styles.readerBody, { color: colors.text, fontSize }]}>
        {article.content || article.summary}
      </Text>

      {article.coins && article.coins.length > 0 && (
        <View style={styles.coinsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize - 2 }]}>
            Related Coins
          </Text>
          <View style={styles.coinsContainer}>
            {article.coins.map((coin, index) => (
              <View key={index} style={[styles.coinTag, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.coinTagText, { color: colors.primary }]}>
                  {coin.symbol}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {article.categories && article.categories.length > 0 && (
        <View style={styles.categoriesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize - 2 }]}>
            Categories
          </Text>
          <View style={styles.categoriesContainer}>
            {article.categories.map((category, index) => (
              <View key={index} style={[styles.categoryTag, { backgroundColor: colors.secondary + '20' }]}>
                <Text style={[styles.categoryTagText, { color: colors.secondary }]}>
                  {category.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ArticleHeader
        sourceName={article.sourceName}
        publishedAt={format(new Date(article.publishedAt), 'MMM d, h:mm a')}
        onBack={() => navigation.goBack()}
        onBookmark={handleBookmark}
        onShare={handleShare}
        isBookmarked={isBookmarkedArticle}
        onFontDecrease={() => changeFontSize(-2)}
        onFontIncrease={() => changeFontSize(2)}
        fontSize={fontSize}
      />
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  readerContent: {
    flex: 1,
  },
  readerContentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  readerHeadline: {
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 32,
  },
  readerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    alignItems: 'center',
  },
  readerMetaText: {
    fontSize: 14,
  },
  readerImage: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  articleImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  readerBody: {
    lineHeight: 28,
    marginBottom: 32,
    textAlign: 'justify',
  },
  coinsSection: {
    marginBottom: 24,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  coinsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  coinTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  coinTagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTagText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ArticleViewerScreen;