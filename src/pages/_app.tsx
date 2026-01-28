import '@/i18n';
import '@radix-ui/themes/styles.css';
import './global.css';

import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';

import { ThemeProvider } from '@/contexts/ThemeContext';
import LanguageTagUpdater from '@/i18n/LanguageTagUpdater';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider
      session={pageProps.session}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      <ThemeProvider>
        <LanguageTagUpdater />
        <Component {...pageProps} />
      </ThemeProvider>
    </SessionProvider>
  );
}
