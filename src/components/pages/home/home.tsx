import { Flex } from '@radix-ui/themes';
import axios from 'axios';
import { Session } from 'next-auth';
import { useEffect } from 'react';

import { NavBar } from '@/components';

import styles from './home.module.css';

interface HomePageProps {
  session: Session;
}

export function HomePage(props: HomePageProps) {
  useEffect(() => {
    axios
      .post('api/proxy/api/quota')
      .then((response) => {
        console.log('Quota data:', response.data);
        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      })
      .catch((error) => {
        console.error('Error fetching quota:', error);
      });
  }, []);

  return (
    <>
      <NavBar session={props.session} />

      <main className={styles.root}>
        <Flex direction='row' gap='9'></Flex>
      </main>
    </>
  );
}
