import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/styles/global';

interface TagChipProps {
  label: string;
  type?: 'coin' | 'category' | 'source';
  size?: 'small' | 'medium' | 'large';
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

const TagChip: React.FC<TagChipProps> = ({
  label,
  type = 'category',
  size = 'medium',
  selected = false,
  onPress,
  style,
  disabled = false,
}) => {
  const { colors } = useTheme();

  // Style calculations
  const chipStyles = React.useMemo(() => {
    const backgroundColor = (() => {
      if (disabled) return colors.border;
      if (selected) return colors.primary;
      
      switch (type) {
        case 'coin': return colors.warning + '20';
        case 'category': return colors.surface;
        case 'source': return colors.success + '20';
        default: return colors.surface;
      }
    })();

    const textColor = (() => {
      if (disabled) return colors.textSecondary;
      if (selected) return 'white';
      
      switch (type) {
        case 'coin': return colors.warning;
        case 'category': return colors.textSecondary;
        case 'source': return colors.success;
        default: return colors.textSecondary;
      }
    })();

    const borderColor = (() => {
      if (selected) return colors.primary;
      if (disabled) return colors.border;
      
      switch (type) {
        case 'coin': return colors.warning + '40';
        case 'category': return colors.border;
        case 'source': return colors.success + '40';
        default: return colors.border;
      }
    })();

    const sizeStyles = (() => {
      switch (size) {
        case 'small': return { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 };
        case 'large': return { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 };
        default: return { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 };
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

    return { backgroundColor, textColor, borderColor, sizeStyles, textStyle };
  }, [colors, disabled, selected, type, size]);

  const chipStyle = [
    styles.chip,
    chipStyles.sizeStyles,
    {
      backgroundColor: chipStyles.backgroundColor,
      borderColor: chipStyles.borderColor,
    },
    selected && styles.selected,
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    chipStyles.textStyle,
    styles.text,
    { color: chipStyles.textColor },
    selected && styles.selectedText,
  ];

  return (
    <TouchableOpacity
      style={chipStyle}
      onPress={onPress && !disabled ? onPress : undefined}
      disabled={!onPress || disabled}
      accessibilityRole="button"
      accessibilityLabel={`${type} tag: ${label}`}
      accessibilityState={{ selected }}
    >
      <Text style={textStyle} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
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

export default TagChip;