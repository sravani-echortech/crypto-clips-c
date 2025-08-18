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

  const renderFlame = () => (
    <Animated.View style={animatedStyle}>
      <Text style={styles.flameIcon}>🔥</Text>
    </Animated.View>
  );

  if (compact) {
    return (
      <TouchableOpacity 
        onPress={onPress}
        style={[styles.compactContainer, { backgroundColor: colors.surface }]}
        accessibilityRole="button"
        accessibilityLabel={`Streak: ${current} days`}
        disabled={!onPress}
      >
        {renderFlame()}
        <Text style={[styles.compactCount, { color: colors.text }]}>
          {current}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.container, { backgroundColor: colors.surface }]}
      accessibilityRole="button"
      accessibilityLabel={`Current streak: ${current} days${best ? `, best streak: ${best} days` : ''}`}
      disabled={!onPress}
    >
      <View style={styles.header}>
        {renderFlame()}
        <Text style={[styles.title, { color: colors.text }]}>
          Streak
        </Text>
      </View>
      
      <Text style={[styles.currentCount, { color: colors.text }]}>
        {current}
      </Text>
      
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {subtitle || (current === 1 ? 'day' : 'days')}
      </Text>
      
      {best && best > current && (
        <Text style={[styles.best, { color: colors.textSecondary }]}>
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