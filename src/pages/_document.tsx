import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='en'>
      <Head />
      <body className='antialiased'>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('theme');
                if (savedTheme === 'dark') {
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.style.setProperty('--mui-palette-background-paper', '#1a1a1a');
                  document.documentElement.style.setProperty('--mui-palette-background-default', '#0f0f0f');
                  document.documentElement.style.setProperty('--mui-palette-text-primary', '#f9fafb');
                  document.documentElement.style.setProperty('--mui-palette-text-secondary', '#d1d5db');
                  document.documentElement.style.setProperty('--mui-palette-divider', '#374151');
                } else {
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.style.setProperty('--mui-palette-background-paper', '#ffffff');
                  document.documentElement.style.setProperty('--mui-palette-background-default', '#ffffff');
                  document.documentElement.style.setProperty('--mui-palette-text-primary', '#111827');
                  document.documentElement.style.setProperty('--mui-palette-text-secondary', '#4b5563');
                  document.documentElement.style.setProperty('--mui-palette-divider', '#e5e7eb');
                }
              } catch (e) {
                // In case of error, apply light theme
                document.documentElement.setAttribute('data-theme', 'light');
              }
            `,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
