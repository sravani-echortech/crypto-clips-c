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

  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    if (selected) return colors.primary;
    
    switch (type) {
      case 'coin':
        return colors.warning + '20'; // 20% opacity
      case 'category':
        return colors.surface;
      case 'source':
        return colors.success + '20';
      default:
        return colors.surface;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textSecondary;
    if (selected) return 'white';
    
    switch (type) {
      case 'coin':
        return colors.warning;
      case 'category':
        return colors.textSecondary;
      case 'source':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const getBorderColor = () => {
    if (selected) return colors.primary;
    if (disabled) return colors.border;
    
    switch (type) {
      case 'coin':
        return colors.warning + '40';
      case 'category':
        return colors.border;
      case 'source':
        return colors.success + '40';
      default:
        return colors.border;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 6,
          paddingVertical: 2,
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
          paddingHorizontal: 10,
          paddingVertical: 4,
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

  const chipStyle = [
    styles.chip,
    getSizeStyles(),
    {
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
    },
    selected && styles.selected,
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    getTextStyle(),
    styles.text,
    {
      color: getTextColor(),
    },
    selected && styles.selectedText,
  ];

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        style={chipStyle}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${type} tag: ${label}`}
        accessibilityState={{ selected }}
      >
        <Text style={textStyle} numberOfLines={1}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={chipStyle} disabled>
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