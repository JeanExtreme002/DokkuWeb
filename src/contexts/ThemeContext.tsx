import { Theme as RadixTheme } from '@radix-ui/themes';
import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
  } catch {
    return 'light';
  }

  return 'light';
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(getInitialTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from localStorage
  useEffect(() => {
    try {
      const isLocalStorageAvailable = typeof Storage !== 'undefined' && window.localStorage;

      if (isLocalStorageAvailable) {
        const savedTheme = localStorage.getItem('theme') as ThemeMode;
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setMode(savedTheme);
        } else {
          setMode('light');
        }
      } else {
        setMode('light');
      }
    } catch {
      setMode('light');
    }
    setIsLoading(false);
  }, []);

  // Save theme to localStorage when changed
  useEffect(() => {
    if (isLoading) return;

    try {
      if (typeof Storage !== 'undefined' && window.localStorage) {
        localStorage.setItem('theme', mode);
      }
    } catch {
      console.warn('Could not save theme preference to localStorage');
    }

    document.documentElement.setAttribute('data-theme', mode);

    const root = document.documentElement;
    if (mode === 'dark') {
      root.style.setProperty('--mui-palette-background-paper', '#1a1a1a');
      root.style.setProperty('--mui-palette-background-default', '#0f0f0f');
      root.style.setProperty('--mui-palette-text-primary', '#f9fafb');
      root.style.setProperty('--mui-palette-text-secondary', '#d1d5db');
      root.style.setProperty('--mui-palette-divider', '#374151');
    } else {
      root.style.setProperty('--mui-palette-background-paper', '#ffffff');
      root.style.setProperty('--mui-palette-background-default', '#ffffff');
      root.style.setProperty('--mui-palette-text-primary', '#111827');
      root.style.setProperty('--mui-palette-text-secondary', '#4b5563');
      root.style.setProperty('--mui-palette-divider', '#e5e7eb');
    }
  }, [mode, isLoading]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Do not render anything until the theme is loaded
  if (isLoading) {
    return (
      <div
        style={{
          background: 'var(--background-color, #ffffff)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Simple loading spinner */}
        <div
          style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // We do not use the Material UI ThemeProvider to avoid interference
  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, isLoading }}>
      <RadixTheme
        appearance={mode}
        accentColor='jade'
        grayColor='gray'
        radius='medium'
        scaling='100%'
      >
        {children}
      </RadixTheme>
    </ThemeContext.Provider>
  );
};
