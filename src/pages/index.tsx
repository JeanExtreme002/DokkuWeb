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

  try {
    await fetch(`${backendUrl}/registerUserAccessToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: userEmail, accessToken }),
    });
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
