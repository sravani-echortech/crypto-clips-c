import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useStore } from '@/store';
import { THEMES } from '@/constants';

interface ThemeContextType {
  theme: 'light' | 'dark';
  colors: typeof THEMES.light;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemTheme = useColorScheme();
  const { preferences, updatePreferences } = useStore();
  
  const theme = useMemo(() => {
    if (preferences.theme === 'system') {
      return systemTheme || 'light';
    }
    return preferences.theme;
  }, [preferences.theme, systemTheme]);
  
  const colors = theme === 'dark' ? THEMES.dark : THEMES.light;
  const isDark = theme === 'dark';
  
  const toggleTheme = () => {
    const newTheme = preferences.theme === 'light' ? 'dark' : 
                     preferences.theme === 'dark' ? 'system' : 'light';
    updatePreferences({ theme: newTheme });
  };
  
  const value = useMemo(
    () => ({ theme, colors, isDark, toggleTheme }),
    [theme, colors, isDark]
  );
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};