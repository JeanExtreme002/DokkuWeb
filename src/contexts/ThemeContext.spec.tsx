import '@testing-library/jest-dom';

import { act, render } from '@testing-library/react';
import React from 'react';

import { ThemeProvider, useTheme } from './ThemeContext';

const ThemeConsumer: React.FC = () => {
  const { mode, toggleTheme, isLoading } = useTheme();
  return (
    <div>
      <span data-testid='mode'>{mode}</span>
      <span data-testid='loading'>{isLoading ? 'loading' : 'loaded'}</span>
      <button data-testid='toggle' onClick={toggleTheme}>
        Toggle
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('should default to light mode if no theme is saved', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(getByTestId('mode')).toHaveTextContent('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should load theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(getByTestId('mode')).toHaveTextContent('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should toggle theme and persist to localStorage', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(getByTestId('mode')).toHaveTextContent('light');
    act(() => {
      getByTestId('toggle').click();
    });
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(getByTestId('mode')).toHaveTextContent('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should throw error if useTheme is used outside provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ThemeConsumer />)).toThrow('useTheme must be used within a ThemeProvider');
    spy.mockRestore();
  });
});
