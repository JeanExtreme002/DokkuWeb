import { Box, Typography } from '@mui/material';

import { Image } from '@/components';

import styles from './server-error.module.css';

export function ServerErrorPage() {
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
        <Image alt={'Error 500 Image'} src='/logo-error-500.png' className={styles.logo} />
        <Typography margin={5} variant={'h5'}>
          [500] Internal Server Error
        </Typography>
        <Typography marginInline={5} align='center'>
          Ocorreu um erro em nosso serviço, estamos corrigindo o problema. Tente novamente em breve.
        </Typography>
      </Box>
    </>
  );
}
