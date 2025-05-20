import { Button, Flex, Text } from '@radix-ui/themes';
import { useRouter } from 'next/router';

import { Image } from '@/components';

import envImg from './assets/env.svg';
import styles from './not-found.module.css';

export function NotFoundPage() {
  const router = useRouter();

  const goBackHome = (event: Event) => {
    event.preventDefault();
    router.push('/');
  };

  return (
    <>
      <main className={styles.root}>
        <Flex
          align='center'
          justify='center'
          direction='column'
          gap='9'
          style={{ marginLeft: '15vw', marginRight: '15vw', maxWidth: '1400px' }}
        >
          <div className={styles.container}>
            <div className={styles.leftComponent}>
              <Text weight='medium' size='8'>
                Página não encontrada
              </Text>

              <Text as='div' weight='medium' size='3' color='gray' style={{ marginTop: '3vh' }}>
                O conteúdo que você buscou está indisponível ou foi removido.
              </Text>

              <Button
                color='blue'
                className={styles.goBackHomeButton}
                onClick={goBackHome as any}
                style={{ cursor: 'pointer', marginTop: '5vh' }}
              >
                IR PARA A PÁGINA INICIAL
              </Button>
            </div>

            <div className={styles.rightComponent}>
              <Image alt={'404 Image'} src={envImg} className={styles.envImage} />
            </div>
          </div>
        </Flex>
      </main>
    </>
  );
}
