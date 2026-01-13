import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

import { ServiceDetailsPage } from '@/components/pages/services';
import { I18nNamespaceBoundary } from '@/i18n/I18nNamespaceBoundary';
import { PageI18nProvider } from '@/i18n/PageI18nProvider';
import Header from '@/pages/header';

interface ServiceDetailsPageProps {
  pluginType: string;
  serviceName: string;
}

export default function ServiceDetails(props: ServiceDetailsPageProps) {
  return (
    <I18nNamespaceBoundary ns='services.s'>
      <PageI18nProvider ns='services.s'>
        <Header />
        <ServiceDetailsPage pluginType={props.pluginType} serviceName={props.serviceName} />
      </PageI18nProvider>
    </I18nNamespaceBoundary>
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
