import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { responsiveFontSize, responsiveSpacing } from '@/utils/responsive';

type WidgetVariant = 'minimal' | 'compact' | 'full';

interface ResponsiveTokenBalanceProps {
  balance: number;
  delta?: number;
  variant?: WidgetVariant;
  onPress?: () => void;
  showDelta?: boolean;
}

const ResponsiveTokenBalance: React.FC<ResponsiveTokenBalanceProps> = ({
  balance,
  delta = 0,
  variant = 'compact',
  onPress,
  showDelta = false,
}) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  // Auto-detect best variant based on screen size if not specified
  const effectiveVariant = useMemo(() => {
    if (variant !== 'compact') return variant;
    
    if (width < 360) return 'minimal';
    if (width < 414) return 'compact';
    return 'full';
  }, [variant, width]);

  // Balance formatting function
  const formatBalance = React.useCallback((value: number) => {
    if (effectiveVariant === 'minimal') {
      if (value >= 1000000) return `${Math.floor(value / 1000000)}M`;
      if (value >= 1000) return `${Math.floor(value / 1000)}K`;
      return value.toString();
    }
    
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }, [effectiveVariant]);

  // Variant configuration
  const variantConfig = useMemo(() => {
    const baseStyles = {
      container: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
      },
      text: {
        color: colors.text,
      },
      textSecondary: {
        color: colors.textSecondary,
      },
      iconColor: colors.warning,
    };

    const configs = {
      minimal: {
        ...baseStyles,
        containerStyle: styles.minimalContainer,
        iconSize: 14,
        balanceSize: responsiveFontSize(12),
        showSubtitle: false,
      },
      compact: {
        ...baseStyles,
        containerStyle: styles.compactContainer,
        iconSize: 16,
        balanceSize: responsiveFontSize(14),
        showSubtitle: false,
      },
      full: {
        ...baseStyles,
        containerStyle: styles.fullContainer,
        iconSize: 20,
        balanceSize: responsiveFontSize(28),
        showSubtitle: true,
      },
    };

    return configs[effectiveVariant];
  }, [effectiveVariant, colors]);

  const renderDelta = React.useCallback(() => {
    if (!showDelta || delta === 0 || effectiveVariant === 'minimal') return null;
    
    return (
      <Animated.View
        entering={ZoomIn.duration(200)}
        exiting={ZoomOut.duration(200)}
        style={[
          styles.deltaContainer,
          {
            backgroundColor: delta > 0 ? colors.success : colors.danger,
            paddingHorizontal: responsiveSpacing(4),
            paddingVertical: responsiveSpacing(2),
          }
        ]}
      >
        <Ionicons 
          name={delta > 0 ? 'arrow-up' : 'arrow-down'} 
          size={10} 
          color="white" 
        />
        <Text style={[styles.deltaText, { fontSize: responsiveFontSize(10) }]}>
          {Math.abs(delta)}
        </Text>
      </Animated.View>
    );
  }, [showDelta, delta, effectiveVariant, colors.success, colors.danger]);

  if (effectiveVariant === 'minimal') {
    return (
      <TouchableOpacity 
        onPress={onPress}
        style={[variantConfig.containerStyle, variantConfig.container]}
        accessibilityRole="button"
        accessibilityLabel={`Token balance: ${balance}`}
        disabled={!onPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="diamond" size={variantConfig.iconSize} color={variantConfig.iconColor} />
        <Text style={[styles.minimalBalance, variantConfig.text, { fontSize: variantConfig.balanceSize }]}>
          {formatBalance(balance)}
        </Text>
      </TouchableOpacity>
    );
  }

  if (effectiveVariant === 'compact') {
    return (
      <TouchableOpacity 
        onPress={onPress}
        style={[variantConfig.containerStyle, variantConfig.container]}
        accessibilityRole="button"
        accessibilityLabel={`Token balance: ${balance}`}
        disabled={!onPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="diamond" size={variantConfig.iconSize} color={variantConfig.iconColor} />
        <Text style={[styles.compactBalance, variantConfig.text, { fontSize: variantConfig.balanceSize }]}>
          {formatBalance(balance)}
        </Text>
        {renderDelta()}
      </TouchableOpacity>
    );
  }

  // Full variant
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[variantConfig.containerStyle, variantConfig.container]}
      accessibilityRole="button"
      accessibilityLabel={`Token balance: ${balance}`}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Ionicons name="diamond" size={variantConfig.iconSize} color={variantConfig.iconColor} />
        <Text style={[styles.title, variantConfig.text, { fontSize: responsiveFontSize(14) }]}>
          Tokens
        </Text>
      </View>
      
      <View style={styles.balanceRow}>
        <Text style={[styles.balance, variantConfig.text, { fontSize: variantConfig.balanceSize }]}>
          {formatBalance(balance)}
        </Text>
        {renderDelta()}
      </View>
      
      {variantConfig.showSubtitle && (
        <Text 
          style={[styles.subtitle, variantConfig.textSecondary, { fontSize: responsiveFontSize(11) }]}
          numberOfLines={1}
        >
          Available
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  minimalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(6),
    paddingVertical: responsiveSpacing(4),
    borderRadius: responsiveSpacing(12),
    borderWidth: 0,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(8),
    paddingVertical: responsiveSpacing(6),
    borderRadius: responsiveSpacing(14),
    borderWidth: 0.5,
  },
  fullContainer: {
    padding: responsiveSpacing(12),
    borderRadius: responsiveSpacing(12),
    alignItems: 'center',
    minWidth: responsiveSpacing(100),
    borderWidth: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(6),
  },
  title: {
    fontWeight: '600',
    marginLeft: responsiveSpacing(4),
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balance: {
    fontWeight: '700',
  },
  minimalBalance: {
    fontWeight: '600',
    marginLeft: responsiveSpacing(2),
  },
  compactBalance: {
    fontWeight: '600',
    marginLeft: responsiveSpacing(4),
  },
  subtitle: {
    marginTop: responsiveSpacing(2),
  },
  deltaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: responsiveSpacing(10),
    marginLeft: responsiveSpacing(6),
  },
  deltaText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 2,
  },
});

export default ResponsiveTokenBalance;