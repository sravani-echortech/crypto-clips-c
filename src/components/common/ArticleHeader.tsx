import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { responsiveFontSize, responsiveSpacing, deviceSize } from '@/utils/responsive';

interface ArticleHeaderProps {
  sourceName: string;
  publishedAt: string;
  onBack: () => void;
  onBookmark: () => void;
  onShare: () => void;
  isBookmarked: boolean;
  onFontDecrease?: () => void;
  onFontIncrease?: () => void;
  fontSize?: number;
}

const ArticleHeader: React.FC<ArticleHeaderProps> = ({
  sourceName,
  publishedAt,
  onBack,
  onBookmark,
  onShare,
  isBookmarked,
  onFontDecrease,
  onFontIncrease,
  fontSize = 16,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: colors.background,
        borderBottomColor: colors.border,
        paddingTop: insets.top + responsiveSpacing(8),
      }
    ]}>
      {/* Main Header Row */}
      <View style={styles.mainRow}>
        <TouchableOpacity 
          onPress={onBack}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.titleSection}>
          <Text 
            style={[styles.sourceName, { color: colors.text }]}
            numberOfLines={1}
          >
            {sourceName}
          </Text>
          <Text 
            style={[styles.publishedAt, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {publishedAt}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            onPress={onBookmark}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={isBookmarked ? "bookmark" : "bookmark-outline"} 
              size={20} 
              color={isBookmarked ? colors.primary : colors.text} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={onShare}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="share-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Font Controls Row */}
      {onFontDecrease && onFontIncrease && (
        <View style={[styles.fontControls, { borderTopColor: colors.border }]}>
          <TouchableOpacity 
            onPress={onFontDecrease}
            style={styles.fontButton}
            hitSlop={{ top: 5, bottom: 5, left: 10, right: 10 }}
          >
            <Text style={[styles.fontButtonText, { color: colors.text }]}>A-</Text>
          </TouchableOpacity>

          <Text style={[styles.fontSizeText, { color: colors.textSecondary }]}>
            {fontSize}px
          </Text>

          <TouchableOpacity 
            onPress={onFontIncrease}
            style={styles.fontButton}
            hitSlop={{ top: 5, bottom: 5, left: 10, right: 10 }}
          >
            <Text style={[styles.fontButtonText, { color: colors.text }]}>A+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 0.5,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(8),
  },
  iconButton: {
    padding: responsiveSpacing(4),
  },
  titleSection: {
    flex: 1,
    marginHorizontal: responsiveSpacing(12),
  },
  sourceName: {
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
  },
  publishedAt: {
    fontSize: responsiveFontSize(11),
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: responsiveSpacing(8),
  },
  fontControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveSpacing(6),
    borderTopWidth: 0.5,
    gap: responsiveSpacing(16),
  },
  fontButton: {
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(4),
  },
  fontButtonText: {
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
  },
  fontSizeText: {
    fontSize: responsiveFontSize(12),
  },
});

export default ArticleHeader;