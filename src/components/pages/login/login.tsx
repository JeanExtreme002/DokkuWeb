import { Box, Divider, Link, Typography, useMediaQuery } from '@mui/material';
import React from 'react';
import GoogleButton from 'react-google-button';

import { WebsiteLogo } from '@/components';
import { config, login } from '@/lib';

export function LoginPage() {
  const isSmallScreen = useMediaQuery('(max-width:430px)');

  return (
    <Box
      display='flex'
      height='100vh'
      sx={{
        // Para mobile (xs e sm), o background cobre toda a tela
        backgroundImage: { xs: `url(/backgrounds/salvador.png)`, md: 'none' },
        backgroundSize: { xs: 'cover', md: 'initial' },
        backgroundPosition: { xs: 'center', md: 'initial' },
        // Para mobile, usar flex column e centralizar
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'center', md: 'stretch' },
        justifyContent: { xs: 'center', md: 'flex-start' },
        // Forçar cores do light mode
        backgroundColor: '#ffffff',
        color: '#111827',
      }}
    >
      {/* Left side with background image - apenas para desktop */}
      <Box
        flex={1}
        sx={{
          display: { xs: 'none', md: 'block' },
          backgroundImage: `url(/backgrounds/salvador.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Vertical divider - apenas para desktop */}
      <Divider orientation='vertical' flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

      {/* Right side with sidebar */}
      <Box
        width={{ xs: '75%', sm: '80%', md: '480px' }}
        maxWidth={{ xs: '420px', md: 'none' }}
        bgcolor='background.paper'
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='space-between'
        px={4}
        py={6}
        sx={{
          // Para mobile: adicionar sombra escura e bordas arredondadas
          boxShadow: {
            xs: '0 8px 32px rgba(0, 0, 0, 0.6)',
            md: '-8px 0 20px rgba(0, 0, 0, 0.2)',
          },
          borderRadius: { xs: 2, md: 0 },
          // Para mobile: adicionar backdrop com transparência
          backgroundColor: { xs: 'rgba(255, 255, 255, 0.95)', md: 'background.paper' },
          backdropFilter: { xs: 'blur(10px)', md: 'none' },
        }}
      >
        {/* Centered title */}
        <Box
          display='flex'
          flexDirection={'column'}
          justifyContent='center'
          alignItems='center'
          height='20%'
        >
          <WebsiteLogo size='large' color={'black'} disableLink={true} breakLogo={true} />
          <Typography
            variant='body2'
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
              textAlign: 'center',
              mt: 1,
            }}
          >
            {config.website.subtitle}
          </Typography>
        </Box>

        {/* Login area */}
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='flex-start'
          height='50%'
          width='100%'
        >
          <Typography
            variant='h6'
            gutterBottom
            sx={{
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
            }}
          >
            Entrar com:
          </Typography>

          <Divider sx={{ width: '100%', maxWidth: '500px', my: 2 }} />

          <GoogleButton
            style={{ width: '100%', maxWidth: '400px' }}
            label={isSmallScreen ? 'Entrar com @ufba.br' : 'Entre com seu email @ufba.br'}
            onClick={() => login()}
          />

          <Link
            href={config.support.url}
            underline='hover'
            sx={{
              mt: 10,
              fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' },
              textAlign: 'center',
            }}
          >
            Precisa de ajuda? Acesse o {config.support.name}.
          </Link>
        </Box>

        {/* Empty bottom spacer */}
        <Box height='10%' />
      </Box>
    </Box>
  );
}
