import { Box, Typography } from '@mui/material';
import { Button } from '@radix-ui/themes';
import { useRouter } from 'next/router';

import { Image } from '@/components';

import styles from './not-found.module.css';

export function NotFoundPage() {
  const router = useRouter();

  const goBackHome = (event: Event) => {
    event.preventDefault();
    router.push('/');
  };

  return (
    <>
      <Box
        alignItems={'center'}
        width={'100%'}
        height={'100vh'}
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'center'}
      >
        <Image alt={'Error Image'} src='/images/dokku/logo-error.png' className={styles.logo} />
        <Typography marginTop={2} variant={'h2'}>
          404
        </Typography>
        <Typography margin={5} variant={'h5'}>
          Página não encontrada
        </Typography>
        <Typography marginInline={5} align='center'>
          O conteúdo que você buscou está indisponível ou foi removido.
        </Typography>
        <Button
          color='blue'
          className={styles.goBackHomeButton}
          onClick={goBackHome as any}
          style={{ cursor: 'pointer', marginTop: '5vh' }}
        >
          IR PARA A PÁGINA INICIAL
        </Button>
      </Box>
    </>
  );
}
