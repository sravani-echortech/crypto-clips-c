import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { SafeContainer, AppHeader } from '@/components';
import { useTheme } from '@/contexts/ThemeContext';
import { useStore } from '@/store';
import { NewsArticle } from '@/types';
import { format } from 'date-fns';

const { width, height } = Dimensions.get('window');

const ArticleViewerScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  const article = (route.params as any)?.article as NewsArticle;

  const {
    addBookmark,
    removeBookmark,
    isBookmarked,
    markArticleAsViewed,
    addTokens,
    preferences,
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showReaderMode, setShowReaderMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [scrollPosition, setScrollPosition] = useState(0);

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

  const toggleReaderMode = useCallback(() => {
    setShowReaderMode(!showReaderMode);
    if (preferences.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [showReaderMode, preferences.haptics]);

  const changeFontSize = useCallback((delta: number) => {
    setFontSize(prev => Math.max(12, Math.min(24, prev + delta)));
  }, []);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleLoadError = () => {
    setError(true);
    setLoading(false);
    Alert.alert(
      'Failed to load article',
      'Please check your connection and try again.',
      [
        { text: 'Cancel', onPress: () => navigation.goBack() },
        { text: 'Retry', onPress: () => webViewRef.current?.reload() },
      ]
    );
  };

  const handleLoadProgress = ({ nativeEvent }: any) => {
    setProgress(nativeEvent.progress);
  };

  const injectedJavaScript = `
    (function() {
      // Reader mode styling
      if (${showReaderMode}) {
        document.body.style.padding = '20px';
        document.body.style.maxWidth = '800px';
        document.body.style.margin = '0 auto';
        document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        document.body.style.fontSize = '${fontSize}px';
        document.body.style.lineHeight = '1.6';
        document.body.style.backgroundColor = '${colors.background}';
        document.body.style.color = '${colors.text}';
        
        // Hide ads and unnecessary elements
        const elementsToHide = document.querySelectorAll('iframe, .ad, .ads, .advertisement, .banner, .popup, .modal, .newsletter, .social-share');
        elementsToHide.forEach(el => el.style.display = 'none');
      }
      
      // Dark mode support
      if (${isDark}) {
        document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)';
        document.querySelectorAll('img, video').forEach(el => {
          el.style.filter = 'invert(1) hue-rotate(180deg)';
        });
      }
      
      true;
    })();
  `;

  if (!article) {
    return (
      <SafeContainer>
        <AppHeader title="Article" showBack onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Article not found
          </Text>
        </View>
      </SafeContainer>
    );
  }

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.card }]}>
      <TouchableOpacity 
        style={styles.headerButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.headerTitle}>
        <Text style={[styles.sourceText, { color: colors.textSecondary }]}>
          {article.source}
        </Text>
        <Text style={[styles.timeText, { color: colors.textSecondary }]}>
          {format(new Date(article.timestamp), 'MMM d, h:mm a')}
        </Text>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={toggleReaderMode}
        >
          <Ionicons 
            name={showReaderMode ? "book" : "book-outline"} 
            size={22} 
            color={showReaderMode ? colors.primary : colors.text} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleBookmark}
        >
          <Ionicons 
            name={isBookmarkedArticle ? "bookmark" : "bookmark-outline"} 
            size={22} 
            color={isBookmarkedArticle ? colors.primary : colors.text} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReaderControls = () => (
    <View style={[styles.readerControls, { backgroundColor: colors.card }]}>
      <TouchableOpacity 
        style={styles.fontButton}
        onPress={() => changeFontSize(-2)}
      >
        <Text style={[styles.fontButtonText, { color: colors.text }]}>A-</Text>
      </TouchableOpacity>

      <Text style={[styles.fontSizeText, { color: colors.textSecondary }]}>
        {fontSize}px
      </Text>

      <TouchableOpacity 
        style={styles.fontButton}
        onPress={() => changeFontSize(2)}
      >
        <Text style={[styles.fontButtonText, { color: colors.text }]}>A+</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (showReaderMode && article.content) {
      return (
        <ScrollView 
          style={styles.readerContent}
          contentContainerStyle={styles.readerContentContainer}
        >
          <Text style={[styles.readerHeadline, { color: colors.text, fontSize: fontSize + 4 }]}>
            {article.headline}
          </Text>
          
          <View style={styles.readerMeta}>
            <Text style={[styles.readerMetaText, { color: colors.textSecondary }]}>
              {article.source} • {format(new Date(article.timestamp), 'MMMM d, yyyy')}
            </Text>
            <Text style={[styles.readerMetaText, { color: colors.textSecondary }]}>
              {article.readTime} min read
            </Text>
          </View>

          {article.imageUrl && (
            <View style={styles.readerImage}>
              {/* Image would be rendered here */}
              <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]}>
                <Ionicons name="image" size={40} color={colors.textSecondary} />
              </View>
            </View>
          )}

          <Text style={[styles.readerBody, { color: colors.text, fontSize }]}>
            {article.summary}
            {'\n\n'}
            {article.content || 'Full article content would be displayed here in reader mode. The content would be extracted from the web page and formatted for optimal reading experience.'}
          </Text>

          <View style={styles.readerTags}>
            {article.tags?.map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>#{tag}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        {loading && (
          <View style={[styles.loadingOverlay, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading article...
            </Text>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: colors.primary,
                    width: `${progress * 100}%`
                  }
                ]} 
              />
            </View>
          </View>
        )}
        
        <WebView
          ref={webViewRef}
          source={{ uri: article.url }}
          style={styles.webView}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onLoadProgress={handleLoadProgress}
          onError={handleLoadError}
          injectedJavaScript={injectedJavaScript}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsBackForwardNavigationGestures={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="compatibility"
          renderLoading={() => (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      {showReaderMode && renderReaderControls()}
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 12,
  },
  sourceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  readerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  fontButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  fontButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  fontSizeText: {
    fontSize: 14,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  progressBar: {
    width: 200,
    height: 3,
    borderRadius: 1.5,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
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
  },
  readerHeadline: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  readerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  readerMetaText: {
    fontSize: 14,
  },
  readerImage: {
    marginBottom: 20,
  },
  imagePlaceholder: {
    height: 200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readerBody: {
    lineHeight: 24,
    marginBottom: 20,
  },
  readerTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 20,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ArticleViewerScreen;