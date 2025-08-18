import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface ShareButtonProps {
  onPress: () => void;
  size?: number;
  disabled?: boolean;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  onPress,
  size = 24,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const handlePress = async () => {
    if (disabled) return;
    
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    });
    
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
      accessibilityLabel="Share article"
      disabled={disabled}
    >
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={Platform.OS === 'ios' ? 'share-outline' : 'share-social-outline'}
          size={size}
          color={colors.textSecondary}
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

export default ShareButton;