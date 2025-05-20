import '@radix-ui/themes/styles.css';
import './global.css';

import { Theme } from '@radix-ui/themes';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Theme accentColor='jade'>
        <Component {...pageProps} />
      </Theme>
    </SessionProvider>
  );
}
