import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useStore } from '@/store';
import { globalStyles, typography } from '@/styles/global';
import StreakWidget from './StreakWidget';
import TokenBalance from './TokenBalance';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  showStreak?: boolean;
  showTokens?: boolean;
  leftAction?: () => void;
  rightAction?: () => void;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  children?: React.ReactNode;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showLogo = false,
  showStreak = false,
  showTokens = false,
  leftAction,
  rightAction,
  leftIcon,
  rightIcon = 'search',
  style,
  children,
}) => {
  const { colors } = useTheme();
  const { streak, tokens } = useStore();
  const insets = useSafeAreaInsets();

  // Style calculations
  const containerStyle = React.useMemo(() => [
    styles.container,
    { 
      backgroundColor: colors.background,
      borderBottomColor: colors.border,
      paddingTop: insets.top,
    },
    style
  ], [colors, insets.top, style]);

  // Icon button component
  const IconButton = React.useCallback(({ 
    onPress, 
    icon, 
    accessibilityLabel 
  }: { 
    onPress: () => void; 
    icon: keyof typeof Ionicons.glyphMap; 
    accessibilityLabel: string; 
  }) => (
    <TouchableOpacity 
      onPress={onPress}
      style={styles.iconButton}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name={icon} size={24} color={colors.text} />
    </TouchableOpacity>
  ), [colors.text]);

  return (
    <View style={containerStyle}>
      <View style={styles.content}>
        {/* Left Side */}
        <View style={styles.leftSection}>
          {leftAction && leftIcon && (
            <IconButton 
              onPress={leftAction}
              icon={leftIcon}
              accessibilityLabel="Back"
            />
          )}
          
          {showLogo && (
            <TouchableOpacity 
              onPress={() => {/* scroll to top */}}
              style={styles.logo}
              accessibilityRole="button"
              accessibilityLabel="CryptoClips Home"
            >
              <Text style={[styles.logoText, { color: colors.primary }]}>
                CryptoClips
              </Text>
            </TouchableOpacity>
          )}
          
          {title && !showLogo && (
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                {title}
              </Text>
              {subtitle && (
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  {subtitle}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Center Content */}
        {children && (
          <View style={styles.centerSection}>
            {children}
          </View>
        )}

        {/* Right Side */}
        <View style={styles.rightSection}>
          {showStreak && (
            <StreakWidget 
              current={streak.current}
              compact
            />
          )}
          
          {showTokens && (
            <TokenBalance 
              balance={tokens.balance}
              compact
            />
          )}
          
          {rightAction && rightIcon && (
            <IconButton 
              onPress={rightAction}
              icon={rightIcon}
              accessibilityLabel="Search"
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    ...globalStyles.shadow,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    marginLeft: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  title: {
    ...typography.headline,
    marginLeft: 8,
  },
  subtitle: {
    ...typography.caption,
    marginLeft: 8,
    marginTop: 2,
  },
});

export default AppHeader;