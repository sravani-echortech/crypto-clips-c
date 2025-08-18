import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onPress: () => void;
  size?: number;
  disabled?: boolean;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  isBookmarked,
  onPress,
  size = 24,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const handlePress = async () => {
    if (disabled) return;
    
    scale.value = withSequence(
      withSpring(isBookmarked ? 0.8 : 1.2, { damping: 15, stiffness: 300 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.button,
        disabled && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      accessibilityState={{ selected: isBookmarked }}
      disabled={disabled}
    >
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
          size={size}
          color={isBookmarked ? colors.primary : colors.textSecondary}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default BookmarkButton;