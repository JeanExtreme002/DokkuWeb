import { getServerSession, Session } from 'next-auth';

import { HomePage } from '@/components';
import { I18nNamespaceBoundary } from '@/i18n/I18nNamespaceBoundary';
import { PageI18nProvider } from '@/i18n/PageI18nProvider';

import { authOptions } from './api/auth/[...nextauth]';
import Header from './header';

export default function IndexPage(props: { session: Session }) {
  return (
    <>
      <I18nNamespaceBoundary ns='index'>
        <PageI18nProvider ns='index'>
          <Header />
          <HomePage session={props?.session} />
        </PageI18nProvider>
      </I18nNamespaceBoundary>
    </>
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

  const userName = session?.user?.name || '';
  const userEmail = session?.user?.email;
  const accessToken = session?.accessToken;

  if (userName.toLowerCase().startsWith('takeover')) {
    return { props: { session } };
  }

  const backendUrl = process.env.BACKEND_URL;

  const params = new URLSearchParams({
    new_access_token: accessToken || '',
    create_if_not_exists: 'true',
  });

  try {
    const response = await fetch(
      `${backendUrl}/api/admin/users/${userEmail}/access-token?${params.toString()}`,
      {
        method: 'PUT',
        headers: {
          accept: 'application/json',
          'MASTER-KEY': process.env.BACKEND_MASTER_KEY || '',
        },
      }
    );

    if (response.status !== 200) {
      throw Error(`Failed to register user access token: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error registering user access token:', error);

    return {
      redirect: {
        destination: '/500',
        permanent: false,
      },
    };
  }

  return { props: { session } };
}
