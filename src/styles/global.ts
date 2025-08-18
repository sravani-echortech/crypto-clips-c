import { StyleSheet, Platform } from 'react-native';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  shadowLarge: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  border: {
    borderWidth: 1,
  },
  borderRadius: {
    borderRadius: 8,
  },
  borderRadiusLarge: {
    borderRadius: 12,
  },
  borderRadiusSmall: {
    borderRadius: 4,
  },
  padding: {
    padding: 16,
  },
  paddingHorizontal: {
    paddingHorizontal: 16,
  },
  paddingVertical: {
    paddingVertical: 16,
  },
  margin: {
    margin: 16,
  },
  marginHorizontal: {
    marginHorizontal: 16,
  },
  marginVertical: {
    marginVertical: 16,
  },
  textCenter: {
    textAlign: 'center',
  },
  fontWeight400: {
    fontWeight: '400',
  },
  fontWeight500: {
    fontWeight: '500',
  },
  fontWeight600: {
    fontWeight: '600',
  },
  fontWeight700: {
    fontWeight: '700',
  },
  fontSize12: {
    fontSize: 12,
  },
  fontSize14: {
    fontSize: 14,
  },
  fontSize16: {
    fontSize: 16,
  },
  fontSize18: {
    fontSize: 18,
  },
  fontSize20: {
    fontSize: 20,
  },
  fontSize24: {
    fontSize: 24,
  },
  fontSize28: {
    fontSize: 28,
  },
  fontSize32: {
    fontSize: 32,
  },
  lineHeight: {
    lineHeight: 24,
  },
  opacity50: {
    opacity: 0.5,
  },
  opacity75: {
    opacity: 0.75,
  },
  opacity0: {
    opacity: 0,
  },
  opacity100: {
    opacity: 1,
  },
  absolute: {
    position: 'absolute',
  },
  relative: {
    position: 'relative',
  },
  zIndex1: {
    zIndex: 1,
  },
  zIndex10: {
    zIndex: 10,
  },
  zIndex100: {
    zIndex: 100,
  },
  overflow: {
    overflow: 'hidden',
  },
  overflowVisible: {
    overflow: 'visible',
  },
});

export const typography = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  headline: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
  },
  subheadline: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  captionBold: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  footnote: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
  },
  footnoteBold: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
});

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const layout = {
  headerHeight: 60,
  tabBarHeight: 60,
  cardPadding: 16,
  screenPadding: 16,
  minTouchTarget: 44,
};