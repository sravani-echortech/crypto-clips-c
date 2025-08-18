import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/styles/global';
import * as Haptics from 'expo-haptics';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected = false,
  onPress,
  style,
  disabled = false,
  size = 'medium',
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  
  React.useEffect(() => {
    scale.value = withSpring(selected ? 1.05 : 1, {
      damping: 15,
      stiffness: 300,
    });
  }, [selected]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePress = async () => {
    if (disabled || !onPress) return;
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    if (selected) return colors.primary;
    return colors.surface;
  };

  const getTextColor = () => {
    if (disabled) return colors.textSecondary;
    if (selected) return 'white';
    return colors.text;
  };

  const getBorderColor = () => {
    if (disabled) return colors.border;
    if (selected) return colors.primary;
    return colors.border;
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
        };
      case 'large':
        return {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 16,
        };
      default: // medium
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 12,
        };
    }
  };

  const getTextStyle = () => {
    switch (size) {
      case 'small':
        return typography.footnote;
      case 'large':
        return typography.caption;
      default:
        return typography.footnote;
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.chip,
          getSizeStyles(),
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
          },
          selected && styles.selected,
          disabled && styles.disabled,
          style,
        ]}
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Filter: ${label}`}
        accessibilityState={{ selected }}
      >
        <Text 
          style={[
            getTextStyle(),
            styles.text,
            {
              color: getTextColor(),
            },
            selected && styles.selectedText,
          ]} 
          numberOfLines={1}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  selected: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedText: {
    fontWeight: '600',
  },
});

export default FilterChip;