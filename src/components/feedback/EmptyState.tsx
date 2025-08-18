import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { typography, globalStyles } from '@/styles/global';
import Button from '../buttons/Button';

interface EmptyStateProps {
  title: string;
  message?: string;
  emoji?: string;
  actionText?: string;
  onAction?: () => void;
  showAction?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  emoji = '📰',
  actionText = 'Try again',
  onAction,
  showAction = true,
}) => {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={ZoomIn.springify().damping(15).stiffness(150)}
      style={[styles.container, globalStyles.centered]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      
      <Text style={[
        styles.title,
        { color: colors.text }
      ]}>
        {title}
      </Text>
      
      {message && (
        <Text style={[
          styles.message,
          { color: colors.textSecondary }
        ]}>
          {message}
        </Text>
      )}
      
      {showAction && onAction && (
        <View style={styles.actionContainer}>
          <Button
            title={actionText}
            onPress={onAction}
            variant="outline"
            size="medium"
          />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },
  emoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    ...typography.headline,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 280,
  },
  actionContainer: {
    marginTop: 8,
    minWidth: 140,
  },
});

export default EmptyState;