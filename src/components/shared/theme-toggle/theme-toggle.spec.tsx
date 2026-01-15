import { fireEvent, render, screen } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/contexts/ThemeContext';

import { ThemeToggle } from './theme-toggle';

jest.mock('@/contexts/ThemeContext');
jest.mock('react-i18next');

const mockToggleTheme = jest.fn();
const mockT = jest.fn((key) => key);

function setupThemeContext({ mode = 'light', isLoading = false } = {}) {
  (useTheme as jest.Mock).mockReturnValue({
    mode,
    toggleTheme: mockToggleTheme,
    isLoading,
  });
}

function setupTranslation() {
  (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupTranslation();
  });

  it('should show loading spinner when isLoading is true', () => {
    setupThemeContext({ isLoading: true });
    render(<ThemeToggle />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should show light mode UI when mode is light', () => {
    setupThemeContext({ mode: 'light' });
    render(<ThemeToggle />);
    expect(screen.getByText('themeToggle.light')).toBeInTheDocument();
    expect(screen.getByLabelText('themeToggle.switchLabel')).not.toBeChecked();
  });

  it('should show dark mode UI when mode is dark', () => {
    setupThemeContext({ mode: 'dark' });
    render(<ThemeToggle />);
    expect(screen.getByText('themeToggle.dark')).toBeInTheDocument();
    expect(screen.getByLabelText('themeToggle.switchLabel')).toBeChecked();
  });

  it('should call toggleTheme when switch is clicked', () => {
    setupThemeContext({ mode: 'light' });
    render(<ThemeToggle />);

    fireEvent.click(screen.getByLabelText('themeToggle.switchLabel'));
    expect(mockToggleTheme).toHaveBeenCalled();
  });
});
