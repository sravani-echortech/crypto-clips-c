import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Breakpoints
export const breakpoints = {
  xs: 320,  // Small phones
  sm: 375,  // Standard phones
  md: 414,  // Large phones
  lg: 768,  // Tablets
  xl: 1024, // Large tablets
} as const;

// Device size detection
export const deviceSize = {
  isSmallPhone: screenWidth < breakpoints.sm,
  isPhone: screenWidth < breakpoints.lg,
  isTablet: screenWidth >= breakpoints.lg && screenWidth < breakpoints.xl,
  isLargeTablet: screenWidth >= breakpoints.xl,
};

// Base dimensions for scaling (iPhone 14 as reference)
const baseWidth = 390;
const baseHeight = 844;

// Scale factors
export const widthScale = screenWidth / baseWidth;
export const heightScale = screenHeight / baseHeight;
export const scale = Math.min(widthScale, heightScale);
export const moderateScale = (size: number, factor = 0.5) => 
  size + (scale - 1) * size * factor;

// Responsive sizing functions
export const responsiveWidth = (width: number): number => {
  return Math.round(width * widthScale);
};

export const responsiveHeight = (height: number): number => {
  return Math.round(height * heightScale);
};

export const responsiveFontSize = (fontSize: number): number => {
  const newSize = moderateScale(fontSize, 0.3);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Responsive padding/margin
export const responsiveSpacing = (spacing: number): number => {
  if (deviceSize.isSmallPhone) {
    return Math.round(spacing * 0.75);
  }
  if (deviceSize.isTablet) {
    return Math.round(spacing * 1.25);
  }
  if (deviceSize.isLargeTablet) {
    return Math.round(spacing * 1.5);
  }
  return spacing;
};

// Header specific responsive values
export const headerResponsive = {
  height: deviceSize.isSmallPhone ? 56 : deviceSize.isTablet ? 72 : 64,
  paddingHorizontal: responsiveSpacing(16),
  paddingVertical: responsiveSpacing(12),
  iconSize: deviceSize.isSmallPhone ? 20 : deviceSize.isTablet ? 28 : 24,
  logoFontSize: responsiveFontSize(20),
  titleFontSize: responsiveFontSize(18),
  compactWidgetMinWidth: deviceSize.isSmallPhone ? 60 : 80,
};

// Get dynamic styles based on screen width
export const getResponsiveStyles = () => {
  const isCompact = screenWidth < breakpoints.sm;
  const showFullWidgets = screenWidth >= breakpoints.md;
  
  return {
    isCompact,
    showFullWidgets,
    headerFlexDirection: isCompact ? 'column' as const : 'row' as const,
    widgetSize: isCompact ? 'minimal' : showFullWidgets ? 'full' : 'compact',
  };
};

// Font scaling with accessibility support
export const getAccessibleFontSize = (baseSize: number): number => {
  const scaledSize = responsiveFontSize(baseSize);
  
  // Respect system font scaling for accessibility
  if (Platform.OS === 'android') {
    return PixelRatio.getFontScale() * scaledSize;
  }
  
  return scaledSize;
};

// Safe area padding helpers
export const getSafeAreaPadding = (insets: { top: number; bottom: number; left: number; right: number }) => {
  return {
    paddingTop: Math.max(insets.top, deviceSize.isSmallPhone ? 20 : 24),
    paddingBottom: insets.bottom,
    paddingLeft: Math.max(insets.left, responsiveSpacing(16)),
    paddingRight: Math.max(insets.right, responsiveSpacing(16)),
  };
};