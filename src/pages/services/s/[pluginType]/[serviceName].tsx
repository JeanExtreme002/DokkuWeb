import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

import { ServiceDetailsPage } from '@/components/pages/services';
import Header from '@/pages/header';

interface ServiceDetailsPageProps {
  pluginType: string;
  serviceName: string;
}

export default function ServiceDetails(props: ServiceDetailsPageProps) {
  return (
    <>
      <Header />
      <ServiceDetailsPage pluginType={props.pluginType} serviceName={props.serviceName} />
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

  const { pluginType, serviceName } = context.params!;

  return {
    props: {
      pluginType: pluginType as string,
      serviceName: serviceName as string,
    },
  };
};
