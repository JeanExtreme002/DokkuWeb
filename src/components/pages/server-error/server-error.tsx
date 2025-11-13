import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { Image } from '@/components';

import styles from './server-error.module.css';

export function ServerErrorPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

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
        <Typography
          margin={5}
          variant={'h5'}
          sx={{
            '@media (max-width: 600px)': {
              fontSize: '1.20rem',
            },
          }}
        >
          [500] Internal Server Error
        </Typography>
        <Typography marginInline={5} align='center'>
          Ocorreu um erro em nosso serviço, estamos corrigindo o problema. Tente novamente em breve.
        </Typography>
      </Box>
    </>
  );
}
