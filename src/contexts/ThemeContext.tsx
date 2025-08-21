import React, { createContext, useContext, useMemo } from 'react';
import { THEMES } from '@/constants';

interface ThemeContextType {
  colors: typeof THEMES.light;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colors = useMemo(() => {
    return THEMES.light;
  }, []);
  
  const isDark = useMemo(() => {
    return false; // Light theme is never dark
  }, []);

  const value = useMemo(() => ({
    colors,
    isDark,
  }), [colors, isDark]);

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