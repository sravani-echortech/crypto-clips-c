import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/styles/global';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  haptic?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  accessibilityLabel,
  haptic = true,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const handlePress = async () => {
    if (disabled || loading) return;
    
    // Animate button press
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    });
    
    if (haptic) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const getBackgroundColor = () => {
    if (disabled || loading) {
      return colors.border;
    }
    
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.surface;
      case 'outline':
        return 'transparent';
      case 'ghost':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled || loading) {
      return colors.textSecondary;
    }
    
    switch (variant) {
      case 'primary':
        return 'white';
      case 'secondary':
        return colors.text;
      case 'outline':
        return colors.primary;
      case 'ghost':
        return colors.primary;
      default:
        return 'white';
    }
  };

  const getBorderColor = () => {
    if (disabled || loading) {
      return colors.border;
    }
    
    switch (variant) {
      case 'outline':
        return colors.primary;
      case 'secondary':
        return colors.border;
      default:
        return 'transparent';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
        };
      case 'large':
        return {
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 12,
        };
      default: // medium
        return {
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 10,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return typography.footnote;
      case 'large':
        return typography.body;
      default:
        return typography.caption;
    }
  };

  const buttonStyle = [
    styles.button,
    getSizeStyles(),
    {
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
    },
    (disabled || loading) && styles.disabled,
    style,
  ];

  const titleStyle = [
    getTextSize(),
    styles.text,
    {
      color: getTextColor(),
    },
    textStyle,
  ];

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={buttonStyle}
        onPress={handlePress}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityState={{ disabled: disabled || loading }}
      >
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={getTextColor()} 
          />
        ) : (
          <Text style={titleStyle}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 44, // Accessibility minimum touch target
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default Button;