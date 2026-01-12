import Head from 'next/head';

import { config, credits } from '@/lib';

export default function Header() {
  const title = config.website.title + ' | ' + config.website.subtitle;
  const year = new Date().getFullYear();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name='author' content={credits.author} />
        <meta name='creator' content={credits.github.name} />
        <meta name='publisher' content={credits.github.name} />
        <meta name='project' content={credits.github.projectName} />
        <meta name='reply-to' content={credits.email} />
        <meta name='copyright' content={`© ${year} ${credits.author}`} />
        <link rel='icon' href='/favicon.ico' sizes='any' />
        <link rel='author' href={credits.github.profile} />
        <link rel='project' href={credits.github.projectLink} />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, user-scalable=no, shrink-to-fit=no, viewport-fit=cover'
        ></meta>
      </Head>
    </>
  );
}
