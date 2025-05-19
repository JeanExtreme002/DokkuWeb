import { Flex } from '@radix-ui/themes';

import { NavBar } from '@/components';

import styles from './home.module.css';

export function HomePage() {
  return (
    <>
      <NavBar />

      <main className={styles.root}>
        <Flex direction='row' gap='9'></Flex>
      </main>
    </>
  );
}
