import { useTranslation } from 'react-i18next';

import { usePageNamespace } from './PageI18nContext';

export function usePageTranslation() {
  const ns = usePageNamespace();
  return useTranslation(ns);
}
