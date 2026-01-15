import { renderHook } from '@testing-library/react';
import React from 'react';

import { PageI18nProvider } from './PageI18nProvider';
import { usePageTranslation } from './utils';

describe('i18n utils', () => {
  it('should provide translation hook with correct namespace', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PageI18nProvider ns='test-ns'>{children}</PageI18nProvider>
    );
    const { result } = renderHook(() => usePageTranslation(), { wrapper });

    expect(result.current).not.toBeNull();

    expect(result.current.i18n).toBeDefined();
    expect(typeof result.current.t).toBe('function');
    expect(typeof result.current.t('any-key')).toBe('string');

    warn.mockRestore();
  });

  it('should throw error if usePageTranslation is used outside provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() => {
        return usePageTranslation();
      });
    }).toThrow('usePageNamespace must be used within PageI18nProvider');
    spy.mockRestore();
  });
});
