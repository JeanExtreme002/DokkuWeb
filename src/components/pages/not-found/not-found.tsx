import { Box, Typography } from '@mui/material';
import { Button } from '@radix-ui/themes';
import { useRouter } from 'next/router';

import { Image } from '@/components';
import { usePageTranslation } from '@/i18n/utils';

import styles from './not-found.module.css';

export function NotFoundPage() {
  const { t } = usePageTranslation();
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
        <Image alt={t('imageAlt')} src='/images/dokku/logo-error.png' className={styles.logo} />
        <Typography marginTop={2} variant={'h2'}>
          {t('code')}
        </Typography>
        <Typography margin={5} variant={'h5'}>
          {t('heading')}
        </Typography>
        <Typography marginInline={5} align='center'>
          {t('description')}
        </Typography>
        <Button
          color='blue'
          className={styles.goBackHomeButton}
          onClick={goBackHome as any}
          style={{ cursor: 'pointer', marginTop: '5vh' }}
        >
          {t('goHome')}
        </Button>
      </Box>
    </>
  );
}
