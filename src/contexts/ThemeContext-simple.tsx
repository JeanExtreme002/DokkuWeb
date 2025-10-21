import { Theme as RadixTheme } from '@radix-ui/themes';
import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
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

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  // Carregar tema do localStorage ao inicializar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setMode(savedTheme);
    } else {
      // Detectar preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Salvar tema no localStorage quando mudado
  useEffect(() => {
    localStorage.setItem('theme', mode);

    // Aplicar classe no documento para CSS global
    document.documentElement.setAttribute('data-theme', mode);

    // Aplicar estilos CSS customizados para Material UI components sem interferir no layout
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
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Não usamos Material UI ThemeProvider para evitar interferências
  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
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
