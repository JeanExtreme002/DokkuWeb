import { getServerSession, Session } from 'next-auth';

import { AdminPage } from '@/components';

import { authOptions } from './api/auth/[...nextauth]';
import Header from './header';

export default function Admin(props: { session: Session }) {
  return (
    <>
      <Header />
      <AdminPage session={props?.session} />
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
