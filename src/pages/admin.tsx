import { getServerSession, Session } from 'next-auth';

import { AdminPage } from '@/components';
import { I18nNamespaceBoundary } from '@/i18n/I18nNamespaceBoundary';
import { PageI18nProvider } from '@/i18n/PageI18nProvider';

import { authOptions } from './api/auth/[...nextauth]';
import Header from './header';

export default function Admin(props: { session: Session }) {
  return (
    <I18nNamespaceBoundary ns='admin'>
      <PageI18nProvider ns='admin'>
        <Header />
        <AdminPage session={props?.session} />
      </PageI18nProvider>
    </I18nNamespaceBoundary>
  );
}

export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return { props: { session } };
}
