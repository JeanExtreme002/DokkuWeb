import { Box, Link, Typography } from '@mui/material';

import { Image } from '@/components';
import { config } from '@/lib';

import styles from './website-logo.module.css';

interface WebsiteLogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  disableLink?: boolean;
  titleDisplay?: any;
  breakLogo?: boolean;
}

export function WebsiteLogo({
  size,
  color,
  disableLink,
  breakLogo,
  titleDisplay,
}: WebsiteLogoProps) {
  const href = '/';

  let imgClassName = styles.smallLogoImg;

  if (size === 'medium') {
    imgClassName = styles.mediumLogoImg;
  } else if (size === 'large') {
    imgClassName = styles.largeLogoImg;
  }

  const getlogoImage = () => {
    if (disableLink) {
      return <Image src='/logo.png' alt='Logo' className={imgClassName} />;
    }
    return (
      <Link underline='none' href={href}>
        <Image src='/logo.png' alt='Logo' className={imgClassName} />
      </Link>
    );
  };

  const getLogoText = () => {
    if (disableLink) {
      return <span style={{ color: color || 'white' }}>{config.website.title}</span>;
    }
    return (
      <Link underline='none' href={href} style={{ color: color || 'white' }}>
        {config.website.title}
      </Link>
    );
  };
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: breakLogo ? 'column' : 'row',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <Box>{getlogoImage()}</Box>
      <Typography
        marginLeft={'5px'}
        variant='h6'
        noWrap
        component='div'
        sx={{ display: titleDisplay || { xs: 'none' } }}
      >
        {getLogoText()}
      </Typography>
    </div>
  );
}
