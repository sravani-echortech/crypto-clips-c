import React from 'react';
import { Text, TextProps, useWindowDimensions, Platform } from 'react-native';

interface ResponsiveTextProps extends TextProps {
  children: React.ReactNode;
  fontSize?: number;
  minFontSize?: number;
  maxFontSize?: number;
  scaleFactor?: number;
  autoScale?: boolean;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  fontSize = 14,
  minFontSize = 10,
  maxFontSize = 24,
  scaleFactor = 1,
  autoScale = true,
  style,
  numberOfLines,
  adjustsFontSizeToFit = true,
  minimumFontScale = 0.7,
  ...props
}) => {
  const { width, fontScale } = useWindowDimensions();
  
  // Calculate responsive font size
  const getResponsiveFontSize = () => {
    if (!autoScale) return fontSize;
    
    const baseWidth = 375; // iPhone SE width as base
    const scale = width / baseWidth;
    const scaledSize = fontSize * scale * scaleFactor;
    
    // Apply system font scale for accessibility
    const accessibleSize = scaledSize * (Platform.OS === 'ios' ? 1 : fontScale || 1);
    
    // Clamp between min and max
    return Math.max(minFontSize, Math.min(maxFontSize, accessibleSize));
  };

  return (
    <Text
      {...props}
      style={[
        { fontSize: getResponsiveFontSize() },
        style,
      ]}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={numberOfLines ? adjustsFontSizeToFit : false}
      minimumFontScale={numberOfLines ? minimumFontScale : undefined}
      allowFontScaling={true}
    >
      {children}
    </Text>
  );
};

export default ResponsiveText;