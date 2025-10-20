import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

import { AppsPage } from '@/components';

export default AppsPage;

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
