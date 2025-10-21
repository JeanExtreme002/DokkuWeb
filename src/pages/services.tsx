import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

import { ServicesPage } from '@/components';

export default ServicesPage;

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
