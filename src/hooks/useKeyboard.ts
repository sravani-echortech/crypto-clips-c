import { useState, useEffect } from 'react';
import { Keyboard } from 'react-native';

interface UseKeyboardReturn {
  keyboardHeight: number;
  isKeyboardVisible: boolean;
}

export default function useKeyboard(): UseKeyboardReturn {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsKeyboardVisible(true);
    });

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
    };
  }, []);

  return {
    keyboardHeight,
    isKeyboardVisible,
  };
}