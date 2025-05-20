import { getServerSession } from 'next-auth';

import { LoginPage } from '@/components';

import { authOptions } from './api/auth/[...nextauth]';
import Header from './header';

export default function NotFoundErrorPage() {
  return (
    <>
      <Header />
      <LoginPage />
    </>
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
