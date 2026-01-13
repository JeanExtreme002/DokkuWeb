import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

import { AppDetailsPage } from '@/components';
import { I18nNamespaceBoundary } from '@/i18n/I18nNamespaceBoundary';
import { PageI18nProvider } from '@/i18n/PageI18nProvider';
import Header from '@/pages/header';

interface AppDetailsPageProps {
  appName: string;
}

export default function AppDetails(props: AppDetailsPageProps) {
  return (
    <I18nNamespaceBoundary ns='apps.a'>
      <PageI18nProvider ns='apps.a'>
        <Header />
        <AppDetailsPage appName={props.appName} />
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

  const { appName } = context.params!;

  return {
    props: {
      appName: appName as string,
    },
  };
};
