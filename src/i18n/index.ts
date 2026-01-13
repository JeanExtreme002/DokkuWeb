import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['pt', 'en'],
    ns: ['shared'],
    defaultNS: 'shared',
    load: 'currentOnly',
    interpolation: { escapeValue: false },

    backend: {
      loadPath: '/locales/{{ns}}/{{lng}}.json',
    },

    react: {
      useSuspense: true,
    },
  });

export default i18n;
