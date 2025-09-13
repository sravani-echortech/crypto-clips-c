import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/styles/global';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color,
  text,
  overlay = false,
}) => {
  const { colors } = useTheme();

  // Style calculations
  const spinnerColor = React.useMemo(() => color || colors.primary, [color, colors.primary]);
  
  const overlayStyle = React.useMemo(() => [
    styles.overlay,
    { backgroundColor: colors.background + 'E0' } // 88% opacity
  ], [colors.background]);

  const textStyle = React.useMemo(() => [
    styles.text,
    { color: colors.textSecondary }
  ], [colors.textSecondary]);

  // Spinner content component
  const SpinnerContent = React.useMemo(() => (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.container}
    >
      <ActivityIndicator 
        size={size} 
        color={spinnerColor}
        accessibilityLabel="Loading"
      />
      
      {text && (
        <Text style={textStyle}>
          {text}
        </Text>
      )}
    </Animated.View>
  ), [size, spinnerColor, text, textStyle]);

  // Conditional rendering
  if (overlay) {
    return (
      <View style={overlayStyle}>
        {SpinnerContent}
      </View>
    );
  }

  return SpinnerContent;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  text: {
    ...typography.caption,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default LoadingSpinner;