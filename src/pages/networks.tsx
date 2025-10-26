import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';

import { NetworksPage } from '@/components/pages/networks';

import { authOptions } from './api/auth/[...nextauth]';
import Header from './header';

export default function Networks({ session }: any) {
  return (
    <>
      <Header />
      <NetworksPage session={session} />
    </>
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
