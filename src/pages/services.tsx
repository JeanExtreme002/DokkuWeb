import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

import { ServicesPage } from '@/components';

import Header from './header';

export default function Services(props: any) {
  return (
    <>
      <Header />
      <ServicesPage session={props?.session} />
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
