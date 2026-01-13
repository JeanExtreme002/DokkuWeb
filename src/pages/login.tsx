import { getServerSession } from 'next-auth';

import { LoginPage } from '@/components';
import { I18nNamespaceBoundary } from '@/i18n/I18nNamespaceBoundary';
import { PageI18nProvider } from '@/i18n/PageI18nProvider';

import { authOptions } from './api/auth/[...nextauth]';
import Header from './header';

export default function NotFoundErrorPage() {
  return (
    <I18nNamespaceBoundary ns='login'>
      <PageI18nProvider ns='login'>
        <Header />
        <LoginPage />
      </PageI18nProvider>
    </I18nNamespaceBoundary>
  );
}

export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return { props: {} };
}
