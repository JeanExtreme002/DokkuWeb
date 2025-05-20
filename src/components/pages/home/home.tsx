import { Flex } from '@radix-ui/themes';
import { Session } from 'next-auth';

import { NavBar } from '@/components';

import styles from './home.module.css';

interface HomePageProps {
  session: Session;
}

export function HomePage(props: HomePageProps) {
  return (
    <>
      <NavBar session={props.session} />

      <main className={styles.root}>
        <Flex direction='row' gap='9'></Flex>
      </main>
    </>
  );
}
