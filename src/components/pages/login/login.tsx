import { Google as GoogleIcon } from '@mui/icons-material';
import { Box, Card, CardActionArea, CardContent, Divider, Link, Typography } from '@mui/material';
import React from 'react';

import { NavBarLogo } from '@/components/shared';
import { config } from '@/lib';

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
      >
        {/* Centered title */}
        <Box
          display='flex'
          flexDirection={'column'}
          justifyContent='center'
          alignItems='center'
          height='20%'
        >
          <NavBarLogo color={'black'} disableLink={true} breakLogo={true} />
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
            Entrar com
          </Typography>

          <Divider sx={{ width: '100%', maxWidth: '500px', my: 2 }} />

          <Card variant='outlined' sx={{ width: '100%', maxWidth: '400px' }}>
            <CardActionArea onClick={() => alert('Login com Google')}>
              {/* TODO: Implement it */}
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <GoogleIcon color='action' />
                <Typography variant='body1'>Google</Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          <Link href='https://suporteic.ufba.br/' underline='hover' sx={{ mt: 10 }}>
            Precisa de ajuda? Acesse o SuporteIC.
          </Link>
        </Box>

        {/* Empty bottom spacer */}
        <Box height='10%' />
      </Box>
    </Box>
  );
}
