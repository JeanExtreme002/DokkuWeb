import { Box, Divider, Link, Typography, useMediaQuery } from '@mui/material';
import { ChevronUpIcon, GlobeIcon } from '@radix-ui/react-icons';
import { Button, DropdownMenu, Heading } from '@radix-ui/themes';
import React from 'react';
import GoogleButton from 'react-google-button';

import { WebsiteLogo } from '@/components';
import i18n from '@/i18n';
import { usePageTranslation } from '@/i18n/utils';
import { config, login } from '@/lib';
import { LANGUAGE_NAMES } from '@/lib/utils';

const BACKGROUND_IMAGE_URL = '/images/backgrounds/login-background.png';

const rootContainerSx = {
  // For mobile (xs and sm), the background covers the entire screen
  backgroundImage: { xs: `url(${BACKGROUND_IMAGE_URL})`, md: 'none' },
  backgroundSize: { xs: 'cover', md: 'initial' },
  backgroundPosition: { xs: 'center', md: 'initial' },

  // For mobile, use flex column and center
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: { xs: 'center', md: 'stretch' },

  justifyContent: { xs: 'center', md: 'flex-start' },
  // Enforce light mode colors
  backgroundColor: '#ffffff',
  color: '#111827',
} as const;

const leftSideSx = {
  display: { xs: 'none', md: 'block' },
  backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
} as const;

const rightSidebarSx = {
  // For mobile: add dark shadow and rounded borders
  boxShadow: {
    xs: '0 8px 32px rgba(0, 0, 0, 0.6)',
    md: '-8px 0 20px rgba(0, 0, 0, 0.2)',
  },
  borderRadius: { xs: 2, md: 0 },

  // For mobile: add backdrop with transparency
  backgroundColor: { xs: 'rgba(255, 255, 255, 0.95)', md: 'background.paper' },
  backdropFilter: { xs: 'blur(10px)', md: 'none' },
} as const;

const titleTypographySx = {
  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.9rem' },
  textAlign: 'center',
  mt: 1,
} as const;

const loginTypographySx = {
  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
} as const;

const dividerSx = { width: '100%', maxWidth: '500px', my: 2 } as const;

const helpLinkSx = {
  mt: 10,
  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' },
  textAlign: 'center',
} as const;

const googleButtonStyle: React.CSSProperties = { width: '100%', maxWidth: '400px' };

function buildGoogleLabel(
  isSmallScreen: boolean,
  domains: string[],
  t: (key: string, options?: Record<string, any>) => string
) {
  if (domains.length === 1) {
    return isSmallScreen
      ? t('google.label.single.small', { domain: domains[0] })
      : t('google.label.single.large', { domain: domains[0] });
  }
  return t('google.label.multiple');
}

export function LoginPage() {
  const isSmallScreen = useMediaQuery('(max-width:430px)');
  const isUnder440 = useMediaQuery('(max-width:440px)');
  const { t } = usePageTranslation();

  return (
    <Box display='flex' height='100vh' sx={rootContainerSx}>
      <Box position='fixed' bottom={32} left={32} zIndex={1000}>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button
              variant='surface'
              size='2'
              color='blue'
              style={{
                cursor: 'pointer',
                color: 'var(--gray-1)',
                backgroundColor: 'var(--gray-12)',
              }}
            >
              <GlobeIcon width={18} height={18} />
              <ChevronUpIcon />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content style={{ backgroundColor: 'white' }}>
            {Object.entries(LANGUAGE_NAMES).map(([code, name], index, entries) => (
              <React.Fragment key={code}>
                <DropdownMenu.Item
                  color='sky'
                  style={{ cursor: 'pointer' }}
                  onClick={() => i18n.changeLanguage(code)}
                >
                  {name}
                </DropdownMenu.Item>
                {index < entries.length - 1 ? <DropdownMenu.Separator /> : null}
              </React.Fragment>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Box>
      {/* Left side with background image - desktop only */}
      <Box flex={1} sx={leftSideSx} />

      {/* Vertical divider - desktop only */}
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
        sx={rightSidebarSx}
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
          <Heading size='6' weight='medium' style={{ color: 'var(--gray-12)', marginTop: '20px' }}>
            {t('title', { companyName: config.website.companyName })}
          </Heading>
          <Typography variant='body2' sx={titleTypographySx}>
            {t('subtitle', { companyName: config.website.companyName })}
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
          marginTop='70px'
        >
          <Typography variant='h6' gutterBottom sx={loginTypographySx}>
            {t('loginWith')}
          </Typography>

          <Divider sx={dividerSx} />

          <GoogleButton
            style={{ ...googleButtonStyle, fontSize: isUnder440 ? 14 : 16 }}
            label={buildGoogleLabel(isSmallScreen, config.website.emailDomains, t)}
            onClick={() => login()}
          />

          <Link href={config.support.url} underline='hover' sx={helpLinkSx}>
            {t('helpLink', { supportName: config.support.name })}
          </Link>
        </Box>

        {/* Empty bottom spacer */}
        <Box height='10%' />
      </Box>
    </Box>
  );
}
