import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

import { CreateAppPage } from '@/components/pages/apps/create';

import Header from '../header';

export default function CreateApp(props: any) {
  return (
    <>
      <Header />
      <CreateAppPage session={props?.session} />
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
