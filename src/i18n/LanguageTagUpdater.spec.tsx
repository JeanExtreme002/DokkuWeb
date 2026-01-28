import { cleanup, render } from '@testing-library/react';
import React from 'react';

import i18n from '@/i18n';
import LanguageTagUpdater from '@/i18n/LanguageTagUpdater';

jest.mock('@/i18n', () => {
  const listeners = new Set<(lng: string) => void>();
  const mock: any = {
    language: 'en-US',
    resolvedLanguage: undefined,
    on: (event: string, handler: (lng: string) => void) => {
      if (event === 'languageChanged') listeners.add(handler);
    },
    off: (event: string, handler: (lng: string) => void) => {
      if (event === 'languageChanged') listeners.delete(handler);
    },
    changeLanguage: (lng: string) => {
      mock.language = lng;
      listeners.forEach((fn) => fn(lng));
    },
    __listenersCount: () => listeners.size,
    __reset: () => {
      listeners.clear();
      mock.language = 'en-US';
      mock.resolvedLanguage = undefined;
    },
  };
  return { __esModule: true, default: mock };
});

describe('LanguageTagUpdater', () => {
  beforeEach(() => {
    (i18n as any).__reset?.();
    document.documentElement.lang = '';
  });

  afterEach(() => {
    cleanup();
  });

  it('should set document lang on mount based on i18n.language (normalized)', () => {
    (i18n as any).language = 'pt-BR';
    render(<LanguageTagUpdater />);
    expect(document.documentElement.lang).toBe('pt');
  });

  it('should update document lang when i18n emits languageChanged', () => {
    (i18n as any).language = 'en-US';
    render(<LanguageTagUpdater />);
    expect(document.documentElement.lang).toBe('en');

    (i18n as any).changeLanguage('pt');
    expect(document.documentElement.lang).toBe('pt');
  });

  it('should remove listener on unmount', () => {
    const { unmount } = render(<LanguageTagUpdater />);
    expect((i18n as any).__listenersCount()).toBe(1);
    unmount();
    expect((i18n as any).__listenersCount()).toBe(0);
  });
});
