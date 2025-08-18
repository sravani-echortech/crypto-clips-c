import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useStore } from '@/store';

interface AppStateContextType {
  isOnline: boolean;
  appState: AppStateStatus;
  isDataSaverEnabled: boolean;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const { preferences, checkAndUpdateStreak } = useStore();
  const appStateRef = useRef(AppState.currentState);
  
  useEffect(() => {
    // Monitor network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });
    
    return unsubscribe;
  }, []);
  
  useEffect(() => {
    // Monitor app state changes
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to foreground
        checkAndUpdateStreak();
      }
      
      appStateRef.current = nextAppState;
      setAppState(nextAppState);
    });
    
    return () => {
      subscription.remove();
    };
  }, [checkAndUpdateStreak]);
  
  const value = {
    isOnline,
    appState,
    isDataSaverEnabled: preferences.dataSaver,
  };
  
  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};