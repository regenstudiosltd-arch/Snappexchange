'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';

// constants
const THEME_STORAGE_KEY = 'app-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Helper to determine if the system is currently in dark mode.
 */
const getSystemTheme = (): 'dark' | 'light' =>
  window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 1. Initial state derived from localStorage if available
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || 'system';
    }
    return 'system';
  });

  // 2. Wrap setTheme in useCallback to keep the identity stable for consumers
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;

    /**
     * Logic to sync the DOM classes with the current state.
     */
    const syncThemeToDom = () => {
      const isDark =
        theme === 'dark' || (theme === 'system' && getSystemTheme() === 'dark');
      root.classList.toggle('dark', isDark);
      root.classList.toggle('light', !isDark);
    };

    syncThemeToDom();

    // 3. Listener for system theme changes (only active when theme is 'system')
    if (theme === 'system') {
      const mediaQuery = window.matchMedia(DARK_QUERY);

      mediaQuery.addEventListener('change', syncThemeToDom);
      return () => mediaQuery.removeEventListener('change', syncThemeToDom);
    }
  }, [theme]);

  // 4. Memoize the value object to prevent all consumers from re-rendering
  // whenever ThemeProvider's parent re-renders.
  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
