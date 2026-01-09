import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

import { SearchPage } from '@/components';

import Header from './header';

export default function Search(props: any) {
  return (
    <>
      <Header />
      <SearchPage session={props?.session} />
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
