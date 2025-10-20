import { getServerSession, Session } from 'next-auth';

import { SettingsPage } from '@/components';

import { authOptions } from './api/auth/[...nextauth]';
import Header from './header';

export default function Settings(props: { session: Session }) {
  return (
    <>
      <Header />
      <SettingsPage session={props?.session} />
    </>
  );
}

export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return { props: { session } };
}
