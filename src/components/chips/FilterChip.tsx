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

  const handlePress = () => {
    if (disabled || !onPress) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  // Style calculations
  const chipStyles = React.useMemo(() => {
    const backgroundColor = disabled ? colors.border : selected ? colors.primary : colors.surface;
    const borderColor = disabled ? colors.border : selected ? colors.primary : colors.border;
    const textColor = disabled ? colors.textSecondary : selected ? 'white' : colors.text;

    const sizeStyles = (() => {
      switch (size) {
        case 'small':
          return { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 };
        case 'large':
          return { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 };
        default:
          return { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 };
      }
    })();

    const textStyle = (() => {
      switch (size) {
        case 'small':
        case 'medium':
          return typography.footnote;
        case 'large':
          return typography.caption;
        default:
          return typography.footnote;
      }
    })();

    return { backgroundColor, borderColor, textColor, sizeStyles, textStyle };
  }, [colors, disabled, selected, size]);

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.chip,
          chipStyles.sizeStyles,
          {
            backgroundColor: chipStyles.backgroundColor,
            borderColor: chipStyles.borderColor,
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
            chipStyles.textStyle,
            styles.text,
            { color: chipStyles.textColor },
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