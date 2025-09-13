import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { responsiveFontSize, responsiveSpacing } from '@/utils/responsive';

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

  // Style calculations
  const containerStyle = React.useMemo(() => [
    styles.container, 
    { 
      backgroundColor: colors.background,
      borderBottomColor: colors.border,
      paddingTop: insets.top + responsiveSpacing(8),
    }
  ], [colors, insets.top]);

  // Icon button component
  const IconButton = React.useCallback(({ 
    onPress, 
    icon, 
    size = 24,
    color = colors.text,
    hitSlop = { top: 10, bottom: 10, left: 10, right: 10 }
  }: { 
    onPress: () => void; 
    icon: keyof typeof Ionicons.glyphMap; 
    size?: number;
    color?: string;
    hitSlop?: { top: number; bottom: number; left: number; right: number };
  }) => (
    <TouchableOpacity 
      onPress={onPress}
      style={styles.iconButton}
      hitSlop={hitSlop}
    >
      <Ionicons name={icon} size={size} color={color} />
    </TouchableOpacity>
  ), [colors.text]);

  // Font button component
  const FontButton = React.useCallback(({ 
    onPress, 
    text 
  }: { 
    onPress: () => void; 
    text: string; 
  }) => (
    <TouchableOpacity 
      onPress={onPress}
      style={styles.fontButton}
      hitSlop={{ top: 5, bottom: 5, left: 10, right: 10 }}
    >
      <Text style={[styles.fontButtonText, { color: colors.text }]}>{text}</Text>
    </TouchableOpacity>
  ), [colors.text]);

  return (
    <View style={containerStyle}>
      {/* Main Header Row */}
      <View style={styles.mainRow}>
        <IconButton 
          onPress={onBack}
          icon="arrow-back"
        />

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
          <IconButton 
            onPress={onBookmark}
            icon={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={20}
            color={isBookmarked ? colors.primary : colors.text}
          />

          <IconButton 
            onPress={onShare}
            icon="share-outline"
            size={20}
          />
        </View>
      </View>

      {/* Font Controls Row */}
      {onFontDecrease && onFontIncrease && (
        <View style={[styles.fontControls, { borderTopColor: colors.border }]}>
          <FontButton onPress={onFontDecrease} text="A-" />
          
          <Text style={[styles.fontSizeText, { color: colors.textSecondary }]}>
            {fontSize}px
          </Text>
          
          <FontButton onPress={onFontIncrease} text="A+" />
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