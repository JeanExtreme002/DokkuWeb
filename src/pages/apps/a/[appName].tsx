import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

import { AppDetailsPage } from '@/components/pages/apps';

interface AppDetailsPageProps {
  appName: string;
}

export default function AppDetails(props: AppDetailsPageProps) {
  return <AppDetailsPage appName={props.appName} />;
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

  const { appName } = context.params!;

  return {
    props: {
      appName: appName as string,
    },
  };
};
