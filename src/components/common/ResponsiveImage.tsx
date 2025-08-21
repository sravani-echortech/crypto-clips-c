import React, { useState } from 'react';
import { 
  Image, 
  ImageProps, 
  View, 
  ActivityIndicator, 
  useWindowDimensions,
  StyleSheet 
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ResponsiveImageProps extends Omit<ImageProps, 'style'> {
  aspectRatio?: number;
  maxHeight?: number;
  maxWidth?: number;
  minHeight?: number;
  minWidth?: number;
  fallbackColor?: string;
  showLoading?: boolean;
  rounded?: boolean | number;
  containerStyle?: any;
  imageStyle?: any;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  source,
  aspectRatio = 16 / 9,
  maxHeight,
  maxWidth,
  minHeight,
  minWidth,
  fallbackColor,
  showLoading = true,
  rounded = false,
  containerStyle,
  imageStyle,
  onError,
  onLoad,
  ...props
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Calculate image dimensions
  const getImageDimensions = () => {
    const containerWidth = screenWidth - 32; // Default padding
    let width = containerWidth;
    let height = width / aspectRatio;
    
    // Apply max constraints
    if (maxWidth && width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    
    if (maxHeight && height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    // Apply min constraints
    if (minWidth && width < minWidth) {
      width = minWidth;
      height = width / aspectRatio;
    }
    
    if (minHeight && height < minHeight) {
      height = minHeight;
      width = height * aspectRatio;
    }
    
    return { width, height };
  };
  
  const dimensions = getImageDimensions();
  const borderRadius = typeof rounded === 'number' ? rounded : rounded ? 12 : 0;
  
  const handleError = (e: any) => {
    setError(true);
    setLoading(false);
    onError?.(e);
  };
  
  const handleLoad = (e: any) => {
    setLoading(false);
    onLoad?.(e);
  };
  
  if (error) {
    return (
      <View
        style={[
          styles.container,
          dimensions,
          { 
            backgroundColor: fallbackColor || colors.border,
            borderRadius,
          },
          containerStyle,
        ]}
      />
    );
  }
  
  return (
    <View
      style={[
        styles.container,
        dimensions,
        { borderRadius },
        containerStyle,
      ]}
    >
      <Image
        {...props}
        source={source}
        style={[
          StyleSheet.absoluteFillObject,
          { borderRadius },
          imageStyle,
        ]}
        onError={handleError}
        onLoad={handleLoad}
        resizeMode="cover"
      />
      
      {loading && showLoading && (
        <View style={[StyleSheet.absoluteFillObject, styles.loadingContainer]}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});

export default ResponsiveImage;