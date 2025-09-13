import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { responsiveFontSize, responsiveSpacing } from '@/utils/responsive';

type WidgetVariant = 'minimal' | 'compact' | 'full';

interface ResponsiveStreakWidgetProps {
  current: number;
  best?: number;
  variant?: WidgetVariant;
  onPress?: () => void;
  subtitle?: string;
}

const ResponsiveStreakWidget: React.FC<ResponsiveStreakWidgetProps> = ({
  current,
  best,
  variant = 'compact',
  onPress,
  subtitle,
}) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const scale = useSharedValue(0.8);
  
  // Auto-detect best variant based on screen size if not specified
  const effectiveVariant = useMemo(() => {
    if (variant !== 'compact') return variant;
    
    if (width < 360) return 'minimal';
    if (width < 414) return 'compact';
    return 'full';
  }, [variant, width]);
  
  // Animation effect
  React.useEffect(() => {
    if (current > 0) {
      scale.value = withRepeat(
        withSpring(1, { damping: 15, stiffness: 150 }),
        -1,
        true
      );
    } else {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }
  }, [current]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

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
    };

    const configs = {
      minimal: {
        ...baseStyles,
        containerStyle: styles.minimalContainer,
        flameSize: responsiveFontSize(16),
        countSize: responsiveFontSize(12),
        showBest: false,
        showSubtitle: false,
      },
      compact: {
        ...baseStyles,
        containerStyle: styles.compactContainer,
        flameSize: responsiveFontSize(18),
        countSize: responsiveFontSize(14),
        showBest: false,
        showSubtitle: false,
      },
      full: {
        ...baseStyles,
        containerStyle: styles.fullContainer,
        flameSize: responsiveFontSize(20),
        countSize: responsiveFontSize(28),
        showBest: true,
        showSubtitle: true,
      },
    };

    return configs[effectiveVariant];
  }, [effectiveVariant, colors]);

  const renderFlame = React.useCallback(() => (
    <Animated.View style={animatedStyle}>
      <Text style={{ fontSize: variantConfig.flameSize }}>🔥</Text>
    </Animated.View>
  ), [animatedStyle, variantConfig.flameSize]);

  if (effectiveVariant === 'minimal') {
    return (
      <TouchableOpacity 
        onPress={onPress}
        style={[variantConfig.containerStyle, variantConfig.container]}
        accessibilityRole="button"
        accessibilityLabel={`Streak: ${current} days`}
        disabled={!onPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {renderFlame()}
        <Text style={[styles.minimalCount, variantConfig.text, { fontSize: variantConfig.countSize }]}>
          {current}
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
        accessibilityLabel={`Streak: ${current} days`}
        disabled={!onPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {renderFlame()}
        <Text style={[styles.compactCount, variantConfig.text, { fontSize: variantConfig.countSize }]}>
          {current}
        </Text>
      </TouchableOpacity>
    );
  }

  // Full variant
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[variantConfig.containerStyle, variantConfig.container]}
      accessibilityRole="button"
      accessibilityLabel={`Current streak: ${current} days${best ? `, best streak: ${best} days` : ''}`}
      disabled={!onPress}
    >
      <View style={styles.header}>
        {renderFlame()}
        <Text style={[styles.title, variantConfig.text, { fontSize: responsiveFontSize(14) }]}>
          Streak
        </Text>
      </View>
      
      <Text style={[styles.currentCount, variantConfig.text, { fontSize: variantConfig.countSize }]}>
        {current}
      </Text>
      
      {subtitle && variantConfig.showSubtitle && (
        <Text 
          style={[styles.subtitle, variantConfig.textSecondary, { fontSize: responsiveFontSize(11) }]}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      )}
      
      {best && variantConfig.showBest && best > current && (
        <Text 
          style={[styles.best, variantConfig.textSecondary, { fontSize: responsiveFontSize(11) }]}
          numberOfLines={1}
        >
          Best: {best}
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
  currentCount: {
    fontWeight: '700',
  },
  minimalCount: {
    fontWeight: '600',
    marginLeft: responsiveSpacing(2),
  },
  compactCount: {
    fontWeight: '600',
    marginLeft: responsiveSpacing(4),
  },
  subtitle: {
    marginTop: responsiveSpacing(2),
  },
  best: {
    marginTop: responsiveSpacing(4),
    opacity: 0.7,
  },
});

export default ResponsiveStreakWidget;