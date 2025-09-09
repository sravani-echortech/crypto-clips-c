import React, { createContext, useContext, useMemo } from 'react';
import { THEMES, THEME_METADATA } from '@/constants';
import { useStore } from '@/store';

interface ThemeContextType {
  colors: typeof THEMES.light;
  isDark: boolean;
  currentTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { preferences, updatePreferences } = useStore();
  
  const currentTheme = preferences.theme;
  const colors = useMemo(() => {
    return THEMES[currentTheme];
  }, [currentTheme]);
  
  const isDark = useMemo(() => {
    return THEME_METADATA[currentTheme].isDark;
  }, [currentTheme]);

  const setTheme = (theme: 'light' | 'dark') => {
    updatePreferences({ theme });
  };

  const value = useMemo(() => ({
    colors,
    isDark,
    currentTheme,
    setTheme,
  }), [colors, isDark, currentTheme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};