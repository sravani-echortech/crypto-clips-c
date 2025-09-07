import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useStore } from '@/store';
import { 
  deviceSize, 
  headerResponsive, 
  responsiveFontSize, 
  responsiveSpacing,
  getResponsiveStyles 
} from '@/utils/responsive';
import ResponsiveStreakWidget from './ResponsiveStreakWidget';
import ResponsiveTokenBalance from './ResponsiveTokenBalance';

interface ResponsiveAppHeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  showStreak?: boolean;
  showTokens?: boolean;
  showBack?: boolean;
  leftAction?: () => void;
  rightAction?: () => void;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  children?: React.ReactNode;
  forceCompact?: boolean;
}

const ResponsiveAppHeader: React.FC<ResponsiveAppHeaderProps> = ({
  title,
  subtitle,
  showLogo = false,
  showStreak = false,
  showTokens = false,
  showBack = false,
  leftAction,
  rightAction,
  leftIcon,
  rightIcon = 'search',
  style,
  children,
  forceCompact = false,
}) => {
  const { colors, isDark } = useTheme();
  const { streak, tokens } = useStore();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  
  // Dynamic responsive styles
  const responsiveStyles = useMemo(() => getResponsiveStyles(), [width]);
  const isCompact = forceCompact || responsiveStyles.isCompact;
  const showWidgetsInline = !isCompact && responsiveStyles.showFullWidgets;
  
  // Determine what to show based on screen size
  const shouldShowStreak = showStreak && (showWidgetsInline || !showTokens);
  const shouldShowTokens = showTokens;
  const shouldStackWidgets = (showStreak && showTokens) && !showWidgetsInline;
  
  const dynamicStyles = useMemo(() => ({
    container: {
      backgroundColor: colors.background,
      borderBottomColor: colors.border,
      paddingTop: insets.top || headerResponsive.paddingVertical,
      minHeight: headerResponsive.height + (insets.top || 0),
    },
    content: {
      paddingHorizontal: headerResponsive.paddingHorizontal,
      paddingVertical: headerResponsive.paddingVertical,
      flexDirection: shouldStackWidgets ? 'column' as const : 'row' as const,
      minHeight: headerResponsive.height,
    },
    text: {
      color: colors.text,
    },
    textSecondary: {
      color: colors.textSecondary,
    },
    primaryColor: {
      color: colors.primary,
    },
  }), [colors, insets.top, shouldStackWidgets]);

  const renderLeftSection = () => (
    <View style={[
      styles.leftSection,
      isCompact && styles.leftSectionCompact,
      shouldStackWidgets && styles.leftSectionStacked
    ]}>
      {leftAction && leftIcon && (
        <TouchableOpacity 
          onPress={leftAction}
          style={[
            styles.iconButton,
            { width: headerResponsive.iconSize + 16, height: headerResponsive.iconSize + 16 }
          ]}
          accessibilityRole="button"
          accessibilityLabel="Navigation"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name={leftIcon} size={headerResponsive.iconSize} color={colors.text} />
        </TouchableOpacity>
      )}
      
      {showLogo && (
        <TouchableOpacity 
          onPress={() => {/* scroll to top */}}
          style={styles.logo}
          accessibilityRole="button"
          accessibilityLabel="CryptoClips Home"
        >
          <Text 
            style={[
              styles.logoText, 
              dynamicStyles.primaryColor,
              { fontSize: headerResponsive.logoFontSize }
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {deviceSize.isSmallPhone ? 'CC' : 'CryptoClips'}
          </Text>
        </TouchableOpacity>
      )}
      
      {title && !showLogo && (
        <View style={styles.titleContainer}>
          <Text 
            style={[
              styles.title, 
              dynamicStyles.text,
              { fontSize: headerResponsive.titleFontSize }
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {title}
          </Text>
          {subtitle && !isCompact && (
            <Text 
              style={[
                styles.subtitle, 
                dynamicStyles.textSecondary,
                { fontSize: responsiveFontSize(12) }
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const renderRightSection = () => (
    <View style={[
      styles.rightSection,
      isCompact && styles.rightSectionCompact,
      shouldStackWidgets && styles.rightSectionStacked
    ]}>
      {shouldShowStreak && (
        <ResponsiveStreakWidget 
          current={streak.current}
          variant={responsiveStyles.widgetSize as 'minimal' | 'compact' | 'full'}
        />
      )}
      
      {shouldShowTokens && (
        <ResponsiveTokenBalance 
          balance={tokens.balance}
          variant={responsiveStyles.widgetSize as 'minimal' | 'compact' | 'full'}
        />
      )}
      
      {rightAction && rightIcon && (
        <TouchableOpacity 
          onPress={rightAction}
          style={[
            styles.iconButton,
            { width: headerResponsive.iconSize + 16, height: headerResponsive.iconSize + 16 }
          ]}
          accessibilityRole="button"
          accessibilityLabel="Actions"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name={rightIcon} size={headerResponsive.iconSize} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderWidgetsRow = () => {
    if (!shouldStackWidgets) return null;
    
    return (
      <View style={styles.widgetsRow}>
        {showStreak && (
          <ResponsiveStreakWidget 
            current={streak.current}
            variant="compact"
          />
        )}
        {showTokens && (
          <ResponsiveTokenBalance 
            balance={tokens.balance}
            variant="compact"
          />
        )}
      </View>
    );
  };

  return (
    <View 
      style={[
        styles.container,
        dynamicStyles.container,
        style
      ]}
    >
      <View style={[styles.mainContent, dynamicStyles.content]}>
        {renderLeftSection()}
        
        {children && !shouldStackWidgets && (
          <View style={[styles.centerSection, isCompact && styles.centerSectionCompact]}>
            {children}
          </View>
        )}
        
        {!shouldStackWidgets && renderRightSection()}
      </View>
      
      {shouldStackWidgets && renderWidgetsRow()}
      
      {children && shouldStackWidgets && (
        <View style={styles.childrenContainer}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mainContent: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  leftSectionCompact: {
    flex: 0,
    marginRight: 'auto',
  },
  leftSectionStacked: {
    flex: 0,
    width: '100%',
    justifyContent: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(8),
  },
  centerSectionCompact: {
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    minWidth: 0,
    gap: responsiveSpacing(4),
  },
  rightSectionCompact: {
    flex: 0,
    marginLeft: 'auto',
  },
  rightSectionStacked: {
    position: 'absolute',
    right: responsiveSpacing(16),
    top: '50%',
    transform: [{ translateY: -20 }],
  },
  widgetsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(16),
    paddingBottom: responsiveSpacing(8),
    gap: responsiveSpacing(8),
  },
  childrenContainer: {
    paddingHorizontal: responsiveSpacing(16),
    paddingBottom: responsiveSpacing(8),
  },
  iconButton: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    marginLeft: responsiveSpacing(8),
  },
  logoText: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  titleContainer: {
    marginLeft: responsiveSpacing(8),
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 2,
  },
});

export default ResponsiveAppHeader;