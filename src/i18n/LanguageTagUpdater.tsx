import { useEffect } from 'react';

import i18n from '@/i18n';

export default function LanguageTagUpdater() {
  useEffect(() => {
    const applyLang = (lng?: string) => {
      const lang = (lng || i18n.language || 'en').split('-')[0];
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
      }
    };

    applyLang();

    const handler = (lng: string) => applyLang(lng);
    i18n.on('languageChanged', handler);

    return () => {
      i18n.off('languageChanged', handler);
    };
  }, []);

  return null;
}
