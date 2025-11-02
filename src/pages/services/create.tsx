import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

import { CreateServicePage } from '@/components/pages/services/create';

import Header from '../header';

export default function CreateService(props: any) {
  return (
    <>
      <Header />
      <CreateServicePage session={props?.session} />
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
