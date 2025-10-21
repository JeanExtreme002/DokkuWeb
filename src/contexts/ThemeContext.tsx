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

// Função para detectar o tema inicial antes da hidratação
const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light'; // SSR default
  }

  try {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
  } catch {
    // Em caso de erro (como em abas anônimas), usar light mode
  }

  return 'light';
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(getInitialTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar tema do localStorage ao inicializar
  useEffect(() => {
    try {
      // Verificar se localStorage está disponível (pode não estar em modo privado/anônimo)
      const isLocalStorageAvailable = typeof Storage !== 'undefined' && window.localStorage;

      if (isLocalStorageAvailable) {
        const savedTheme = localStorage.getItem('theme') as ThemeMode;
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setMode(savedTheme);
        } else {
          // Se não há tema salvo, usar light mode
          setMode('light');
        }
      } else {
        // Se localStorage não está disponível, sempre usar light mode
        setMode('light');
      }
    } catch {
      // Em caso de erro (como em abas anônimas), sempre usar light mode
      setMode('light');
    }

    // Marcar como carregado após definir o tema
    setIsLoading(false);
  }, []);

  // Salvar tema no localStorage quando mudado
  useEffect(() => {
    if (isLoading) return; // Não aplicar mudanças durante o loading inicial

    try {
      // Só tentar salvar se localStorage estiver disponível
      if (typeof Storage !== 'undefined' && window.localStorage) {
        localStorage.setItem('theme', mode);
      }
    } catch {
      // Ignorar erros de localStorage (comum em modo privado/anônimo)
      console.warn('Could not save theme preference to localStorage');
    }

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
  }, [mode, isLoading]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Não renderizar nada até que o tema seja carregado
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
        {/* Loading spinner simples */}
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

  // Não usamos Material UI ThemeProvider para evitar interferências
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
