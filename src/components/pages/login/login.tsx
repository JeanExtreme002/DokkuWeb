import { Box, Divider, Link, Typography } from '@mui/material';
import React from 'react';
import GoogleButton from 'react-google-button';

import { WebsiteLogo } from '@/components';
import { config, login } from '@/lib';

export function LoginPage() {
  return (
    <Box display='flex' height='100vh'>
      {/* Left side with background image */}
      <Box
        flex={1}
        sx={{
          backgroundImage: `url(/backgrounds/salvador.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Vertical divider */}
      <Divider orientation='vertical' flexItem />

      {/* Right side with sidebar */}
      <Box
        width={{ xs: '100%', lg: '400px' }}
        bgcolor='background.paper'
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='space-between'
        px={4}
        py={6}
        sx={{
          boxShadow: '-8px 0 20px rgba(0, 0, 0, 0.2)',
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
          <WebsiteLogo size='medium' color={'black'} disableLink={true} breakLogo={true} />
          <p>{config.website.subtitle}</p>
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
          <Typography variant='h6' gutterBottom>
            Entrar com:
          </Typography>

          <Divider sx={{ width: '100%', maxWidth: '500px', my: 2 }} />

          <GoogleButton
            style={{ width: '100%', maxWidth: '400px' }}
            label='Email institucional @ufba.br'
            onClick={() => login()}
          />

          <Link href={config.support.url} underline='hover' sx={{ mt: 10 }}>
            Precisa de ajuda? Acesse o {config.support.name}.
          </Link>
        </Box>

        {/* Empty bottom spacer */}
        <Box height='10%' />
      </Box>
    </Box>
  );
}
