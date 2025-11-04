import '@radix-ui/themes/styles.css';
import './global.css';

import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';

import { ThemeProvider } from '@/contexts/ThemeContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider
      session={pageProps.session}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </SessionProvider>
  );
}
