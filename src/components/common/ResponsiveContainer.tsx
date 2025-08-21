import React from 'react';
import { View, ViewProps, useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ResponsiveContainerProps extends ViewProps {
  children: React.ReactNode;
  useSafeArea?: boolean;
  safeAreaEdges?: ('top' | 'bottom' | 'left' | 'right')[];
  maxWidth?: number;
  minWidth?: number;
  responsive?: boolean;
  paddingHorizontal?: number | 'responsive';
  paddingVertical?: number | 'responsive';
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  useSafeArea = false,
  safeAreaEdges = ['top', 'bottom', 'left', 'right'],
  maxWidth,
  minWidth,
  responsive = true,
  paddingHorizontal = 'responsive',
  paddingVertical = 'responsive',
  style,
  ...props
}) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  // Calculate responsive padding
  const getResponsivePadding = (type: 'horizontal' | 'vertical', value: number | 'responsive') => {
    if (typeof value === 'number') return value;
    
    const baseWidth = 375;
    const scale = width / baseWidth;
    
    if (type === 'horizontal') {
      // Base padding: 16px on small screens, up to 24px on large screens
      const basePadding = width < 375 ? 12 : width < 768 ? 16 : 24;
      return basePadding * Math.min(scale, 1.5);
    } else {
      // Vertical padding scales less aggressively
      const basePadding = height < 700 ? 12 : 16;
      return basePadding;
    }
  };
  
  // Build safe area padding
  const getSafeAreaPadding = () => {
    if (!useSafeArea) return {};
    
    return {
      paddingTop: safeAreaEdges.includes('top') ? insets.top : 0,
      paddingBottom: safeAreaEdges.includes('bottom') ? insets.bottom : 0,
      paddingLeft: safeAreaEdges.includes('left') ? insets.left : 0,
      paddingRight: safeAreaEdges.includes('right') ? insets.right : 0,
    };
  };
  
  // Build responsive constraints
  const getConstraints = () => {
    const constraints: any = {};
    
    if (maxWidth) {
      constraints.maxWidth = maxWidth;
      if (width > maxWidth) {
        // Center the container when max width is reached
        constraints.alignSelf = 'center';
        constraints.width = '100%';
      }
    }
    
    if (minWidth) {
      constraints.minWidth = Math.min(minWidth, width);
    }
    
    return constraints;
  };
  
  const horizontalPadding = getResponsivePadding('horizontal', paddingHorizontal);
  const verticalPadding = getResponsivePadding('vertical', paddingVertical);

  return (
    <View
      {...props}
      style={[
        responsive && {
          paddingHorizontal: horizontalPadding,
          paddingVertical: verticalPadding,
        },
        getSafeAreaPadding(),
        getConstraints(),
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default ResponsiveContainer;