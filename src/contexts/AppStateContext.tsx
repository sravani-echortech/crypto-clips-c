import React, { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useStore } from '@/store';

interface AppStateProviderProps {
  children: React.ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const { checkAndUpdateStreak } = useStore();
  const appStateRef = useRef(AppState.currentState);
  
  useEffect(() => {
    // Monitor app state changes to update streak when app comes to foreground
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to foreground - update streak
        checkAndUpdateStreak();
      }
      
      appStateRef.current = nextAppState;
    });
    
    return () => {
      subscription.remove();
    };
  }, [checkAndUpdateStreak]);
  
  return <>{children}</>;
};