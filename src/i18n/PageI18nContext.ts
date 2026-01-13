import { createContext, useContext } from 'react';

export const PageI18nContext = createContext<string | null>(null);

export function usePageNamespace() {
  const ns = useContext(PageI18nContext);
  if (!ns) {
    throw new Error('usePageNamespace must be used within PageI18nProvider');
  }
  return ns;
}
