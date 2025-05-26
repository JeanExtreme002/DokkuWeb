import { getServerSession, Session } from 'next-auth';

import { HomePage } from '@/components';

import { authOptions } from './api/auth/[...nextauth]';
import Header from './header';

export default function IndexPage(props: { session: Session }) {
  return (
    <>
      <Header />
      <HomePage session={props?.session} />
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

  const userEmail = session?.user?.email;
  const accessToken = session?.accessToken;

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
