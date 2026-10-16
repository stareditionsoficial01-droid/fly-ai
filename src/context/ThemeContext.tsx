import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode } from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('fly_ai_theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch {}
    return 'system';
  });

  const getSystemIsDark = () => {
    if (typeof window === 'undefined') return false;
    return Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  };

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return getSystemIsDark();
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let activeIsDark = false;
      if (theme === 'dark') {
        activeIsDark = true;
      } else if (theme === 'light') {
        activeIsDark = false;
      } else {
        activeIsDark = mediaQuery.matches;
      }

      setIsDark(activeIsDark);
      if (activeIsDark) {
        root.classList.add('dark');
        root.classList.remove('light');
        root.style.colorScheme = 'dark';
        if (body) {
          body.classList.add('dark');
          body.classList.remove('light');
        }
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        root.style.colorScheme = 'light';
        if (body) {
          body.classList.remove('dark');
          body.classList.add('light');
        }
      }
    };

    applyTheme();
    try {
      localStorage.setItem('fly_ai_theme', theme);
    } catch {}

    const listener = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const systemDark = e.matches;
        setIsDark(systemDark);
        if (systemDark) {
          root.classList.add('dark');
          root.classList.remove('light');
          root.style.colorScheme = 'dark';
          if (body) {
            body.classList.add('dark');
            body.classList.remove('light');
          }
        } else {
          root.classList.remove('dark');
          root.classList.add('light');
          root.style.colorScheme = 'light';
          if (body) {
            body.classList.remove('dark');
            body.classList.add('light');
          }
        }
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
