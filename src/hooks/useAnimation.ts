import { useSharedValue, withSpring, withTiming, runOnJS } from 'react-native-reanimated';

interface UseAnimationReturn {
  scale: (to: number, duration?: number) => void;
  opacity: (to: number, duration?: number) => void;
  translateX: (to: number, duration?: number) => void;
  translateY: (to: number, duration?: number) => void;
  rotate: (to: number, duration?: number) => void;
  fadeIn: (duration?: number) => void;
  fadeOut: (duration?: number) => void;
  slideUp: (duration?: number) => void;
  slideDown: (duration?: number) => void;
  scaleIn: (duration?: number) => void;
  scaleOut: (duration?: number) => void;
}


export const useReanimatedAnimation = (): UseAnimationReturn => {
  const scaleValue = useSharedValue(1);
  const opacityValue = useSharedValue(1);
  const translateXValue = useSharedValue(0);
  const translateYValue = useSharedValue(0);
  const rotateValue = useSharedValue(0);

  const scale = (to: number, duration = 300) => {
    scaleValue.value = withSpring(to, { damping: 15, stiffness: 150 });
  };

  const opacity = (to: number, duration = 300) => {
    opacityValue.value = withTiming(to, { duration });
  };

  const translateX = (to: number, duration = 300) => {
    translateXValue.value = withTiming(to, { duration });
  };

  const translateY = (to: number, duration = 300) => {
    translateYValue.value = withTiming(to, { duration });
  };

  const rotate = (to: number, duration = 300) => {
    rotateValue.value = withTiming(to, { duration });
  };

  const fadeIn = (duration = 300) => {
    opacityValue.value = withTiming(1, { duration });
  };

  const fadeOut = (duration = 300) => {
    opacityValue.value = withTiming(0, { duration });
  };

  const slideUp = (duration = 300) => {
    translateYValue.value = withTiming(-50, { duration });
  };

  const slideDown = (duration = 300) => {
    translateYValue.value = withTiming(50, { duration });
  };

  const scaleIn = (duration = 300) => {
    scaleValue.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const scaleOut = (duration = 300) => {
    scaleValue.value = withSpring(0, { damping: 15, stiffness: 150 });
  };

  return {
    scale,
    opacity,
    translateX,
    translateY,
    rotate,
    fadeIn,
    fadeOut,
    slideUp,
    slideDown,
    scaleIn,
    scaleOut,
  };
};


export default useReanimatedAnimation;