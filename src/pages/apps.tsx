import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

import { AppListPage } from '@/components';

import Header from './header';

export default function Apps(props: any) {
  return (
    <>
      <Header />
      <AppListPage session={props?.session} />
    </>
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
