import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

import { AppListPage } from '@/components';
import { I18nNamespaceBoundary } from '@/i18n/I18nNamespaceBoundary';
import { PageI18nProvider } from '@/i18n/PageI18nProvider';

import Header from './header';

export default function Apps(props: any) {
  return (
    <I18nNamespaceBoundary ns='apps'>
      <PageI18nProvider ns='apps'>
        <Header />
        <AppListPage session={props?.session} />
      </PageI18nProvider>
    </I18nNamespaceBoundary>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

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
