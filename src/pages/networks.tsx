import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';

import { NetworksPage } from '@/components/pages/networks';
import { I18nNamespaceBoundary } from '@/i18n/I18nNamespaceBoundary';
import { PageI18nProvider } from '@/i18n/PageI18nProvider';

import { authOptions } from './api/auth/[...nextauth]';
import Header from './header';

export default function Networks({ session }: any) {
  return (
    <I18nNamespaceBoundary ns='networks'>
      <PageI18nProvider ns='networks'>
        <Header />
        <NetworksPage session={session} />
      </PageI18nProvider>
    </I18nNamespaceBoundary>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};
