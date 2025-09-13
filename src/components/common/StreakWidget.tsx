import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/styles/global';

interface StreakWidgetProps {
  current: number;
  best?: number;
  compact?: boolean;
  onPress?: () => void;
  subtitle?: string;
}

const StreakWidget: React.FC<StreakWidgetProps> = ({
  current,
  best,
  compact = false,
  onPress,
  subtitle,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(0.8);
  
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

  // Flame component
  const renderFlame = React.useCallback(() => (
    <Animated.View style={animatedStyle}>
      <Text style={styles.flameIcon}>🔥</Text>
    </Animated.View>
  ), [animatedStyle]);

  // Style calculations
  const compactContainerStyle = React.useMemo(() => [
    styles.compactContainer,
    { backgroundColor: colors.surface }
  ], [colors.surface]);

  const compactCountStyle = React.useMemo(() => [
    styles.compactCount,
    { color: colors.text }
  ], [colors.text]);

  const containerStyle = React.useMemo(() => [
    styles.container,
    { backgroundColor: colors.surface }
  ], [colors.surface]);

  const titleStyle = React.useMemo(() => [
    styles.title,
    { color: colors.text }
  ], [colors.text]);

  const currentCountStyle = React.useMemo(() => [
    styles.currentCount,
    { color: colors.text }
  ], [colors.text]);

  const subtitleStyle = React.useMemo(() => [
    styles.subtitle,
    { color: colors.textSecondary }
  ], [colors.textSecondary]);

  const bestStyle = React.useMemo(() => [
    styles.best,
    { color: colors.textSecondary }
  ], [colors.textSecondary]);

  if (compact) {
    return (
      <TouchableOpacity 
        onPress={onPress}
        style={compactContainerStyle}
        accessibilityRole="button"
        accessibilityLabel={`Streak: ${current} days`}
        disabled={!onPress}
      >
        {renderFlame()}
        <Text style={compactCountStyle}>
          {current}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress}
      style={containerStyle}
      accessibilityRole="button"
      accessibilityLabel={`Current streak: ${current} days${best ? `, best streak: ${best} days` : ''}`}
      disabled={!onPress}
    >
      <View style={styles.header}>
        {renderFlame()}
        <Text style={titleStyle}>
          Streak
        </Text>
      </View>
      
      <Text style={currentCountStyle}>
        {current}
      </Text>
      
      <Text style={subtitleStyle}>
        {subtitle || (current === 1 ? 'day' : 'days')}
      </Text>
      
      {best && best > current && (
        <Text style={bestStyle}>
          Best: {best}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    ...typography.captionBold,
    marginLeft: 4,
  },
  flameIcon: {
    fontSize: 20,
  },
  currentCount: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  compactCount: {
    ...typography.captionBold,
    marginLeft: 4,
  },
  subtitle: {
    ...typography.footnote,
    marginTop: 2,
  },
  best: {
    ...typography.footnote,
    marginTop: 4,
    opacity: 0.7,
  },
});

export default StreakWidget;