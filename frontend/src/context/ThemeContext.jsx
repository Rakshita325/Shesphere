import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('shesphere_theme') || 'light';
    } catch {
      return 'light';
    }
  });

  const setTheme = (mode) => {
    const validMode = mode === 'dark' ? 'dark' : 'light';
    setThemeState(validMode);
    try {
      localStorage.setItem('shesphere_theme', validMode);
    } catch (e) {
      console.warn('LocalStorage error saving theme:', e);
    }

    const root = document.documentElement;
    if (validMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Sync on mount & storage events
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
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
