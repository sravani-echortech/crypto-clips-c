import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/styles/global';
import * as Haptics from 'expo-haptics';

interface ReactionBarProps {
  reactions: {
    bull: number;
    bear: number;
    neutral: number;
  };
  userReaction?: 'bull' | 'bear' | 'neutral';
  onReaction: (reaction: 'bull' | 'bear' | 'neutral') => void;
  compact?: boolean;
  showPercentages?: boolean;
}

const ReactionBar: React.FC<ReactionBarProps> = ({
  reactions,
  userReaction,
  onReaction,
  compact = false,
  showPercentages = false,
}) => {
  const { colors } = useTheme();
  const [pressing, setPressing] = useState<string | null>(null);
  const scaleValues = {
    bull: useSharedValue(1),
    bear: useSharedValue(1),
    neutral: useSharedValue(1),
  };

  const totalReactions = reactions.bull + reactions.bear + reactions.neutral;

  const getPercentage = (count: number) => {
    if (totalReactions === 0) return 0;
    return Math.round((count / totalReactions) * 100);
  };

  const handleReaction = (reaction: 'bull' | 'bear' | 'neutral') => {
    Haptics.selectionAsync();
    onReaction(reaction);
  };
  
  const getAnimatedStyle = (type: 'bull' | 'bear' | 'neutral') => useAnimatedStyle(() => ({
    transform: [{ scale: scaleValues[type].value }]
  }));
  
  React.useEffect(() => {
    Object.keys(scaleValues).forEach(key => {
      const reactionType = key as 'bull' | 'bear' | 'neutral';
      scaleValues[reactionType].value = withSpring(
        pressing === reactionType ? 0.9 : 1,
        { damping: 15, stiffness: 300 }
      );
    });
  }, [pressing]);

  const getReactionIcon = (type: 'bull' | 'bear' | 'neutral') => {
    switch (type) {
      case 'bull':
        return '📈';
      case 'bear':
        return '📉';
      case 'neutral':
        return '🤷‍♂️';
    }
  };

  const getReactionColor = (type: 'bull' | 'bear' | 'neutral') => {
    switch (type) {
      case 'bull':
        return colors.success;
      case 'bear':
        return colors.danger;
      case 'neutral':
        return colors.textSecondary;
    }
  };

  const renderReactionButton = (type: 'bull' | 'bear' | 'neutral') => {
    const isSelected = userReaction === type;
    const count = reactions[type];
    const percentage = getPercentage(count);
    const color = getReactionColor(type);

    return (
      <Pressable
        key={type}
        onPress={() => handleReaction(type)}
        onPressIn={() => setPressing(type)}
        onPressOut={() => setPressing(null)}
        style={[
          styles.reactionButton,
          compact && styles.compactButton,
          isSelected && { backgroundColor: color + '20' },
          pressing === type && styles.pressing,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${type} reaction: ${count} votes${showPercentages ? `, ${percentage}%` : ''}`}
        accessibilityState={{ selected: isSelected }}
      >
        <Animated.View style={getAnimatedStyle(type)}>
          <Text style={styles.reactionIcon}>
            {getReactionIcon(type)}
          </Text>
        </Animated.View>
        
        <View style={styles.reactionInfo}>
          <Text style={[
            styles.reactionCount,
            { color: isSelected ? color : colors.textSecondary },
            compact && styles.compactCount,
          ]}>
            {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
          </Text>
          
          {showPercentages && totalReactions > 0 && (
            <Text style={[
              styles.reactionPercentage,
              { color: isSelected ? color : colors.textSecondary },
            ]}>
              {percentage}%
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      {renderReactionButton('bull')}
      {renderReactionButton('neutral')}
      {renderReactionButton('bear')}
      
      {totalReactions > 0 && !compact && (
        <Text style={[styles.totalCount, { color: colors.textSecondary }]}>
          {totalReactions} {totalReactions === 1 ? 'vote' : 'votes'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactContainer: {
    gap: 4,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
  },
  compactButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 40,
  },
  pressing: {
    opacity: 0.7,
  },
  reactionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  reactionInfo: {
    alignItems: 'center',
  },
  reactionCount: {
    ...typography.footnote,
    fontWeight: '600',
  },
  compactCount: {
    fontSize: 10,
  },
  reactionPercentage: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  totalCount: {
    ...typography.footnote,
    marginLeft: 8,
    opacity: 0.7,
  },
});

export default ReactionBar;