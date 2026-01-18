import { keyframes } from '@emotion/react';
import GitHubIcon from '@mui/icons-material/GitHub';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Share1Icon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';

import {
  AppIcon,
  DashboardIcon,
  NetworkIcon,
  ServiceIcon,
  ThemeToggle,
  WebsiteLogo,
} from '@/components';
import { credits } from '@/lib';

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
  60% { transform: translateY(-3px); }
`;

interface SideBarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function SideBar({ isOpen, setIsOpen }: SideBarProps) {
  const { t } = useTranslation('shared');
  const toggleDrawer = (open: boolean) => () => {
    setIsOpen(open);
  };

  const theme = useTheme();
  const secondaryColor = theme.palette.secondary.main;

  const drawerItems = [
    { label: t('sidebar.overview'), href: '/', icon: <DashboardIcon /> },
    { label: t('sidebar.apps'), href: '/apps', icon: <AppIcon /> },
    { label: t('sidebar.sharedApps'), href: '/apps?shared=1', icon: <Share1Icon /> },
    { label: t('sidebar.services'), href: '/services', icon: <ServiceIcon /> },
    { label: t('sidebar.networks'), href: '/networks', icon: <NetworkIcon /> },
  ];

  return (
    <Drawer anchor='left' open={isOpen} onClose={toggleDrawer(false)}>
      <Box
        sx={{
          width: 350,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        role='presentation'
      >
        <ListItem
          key={'logo'}
          disablePadding
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <div
            style={{ background: secondaryColor, display: 'flex', width: '100%', padding: '20px' }}
          >
            <WebsiteLogo disableLink={true} titleDisplay={{ xs: 'block' }} />
          </div>
        </ListItem>

        <Box sx={{ flex: 1 }} onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
          <List>
            {drawerItems.map((item, index) => (
              <div key={item.label}>
                <ListItem>
                  <ListItemButton component='a' href={item.href}>
                    <ListItemIcon sx={{ minWidth: '40px' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
                {index < drawerItems.length - 1 && <Divider sx={{ mx: 2 }} />}
              </div>
            ))}
          </List>
        </Box>

        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, my: 3 }}
        >
          <Tooltip title={t('github.tooltip')}>
            <IconButton
              component='a'
              href={credits.github.projectLink}
              target='_blank'
              rel='noopener noreferrer'
              aria-label={`GitHub - ${credits.github.name}/${credits.github.projectName}`}
              sx={{
                bgcolor: 'var(--purple-8)',
                color: 'white',
                width: 44,
                height: 44,
                borderRadius: '50%',
                boxShadow: 1,
                '&:hover': {
                  opacity: 0.9,
                  bgcolor: 'var(--purple-5)',
                },
              }}
            >
              <GitHubIcon
                sx={{ animation: `${bounce} 1.8s ease-in-out infinite`, willChange: 'transform' }}
              />
            </IconButton>
          </Tooltip>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography
              component='a'
              href={credits.github.projectLink}
              target='_blank'
              rel='noopener noreferrer'
              variant='body1'
              sx={{ fontWeight: 500, color: 'var(--gray-10)', textDecoration: 'none' }}
            >
              {credits.github.projectName}
            </Typography>
            <Typography
              component='a'
              href={credits.github.projectLink}
              target='_blank'
              rel='noopener noreferrer'
              variant='caption'
              sx={{
                color: 'var(--gray-8)',
                textDecoration: 'none',
                cursor: 'pointer',
                '&:hover': { color: 'var(--gray-11)' },
              }}
            >
              {t('github.exploreSource')}
            </Typography>
          </Box>
        </Box>

        <ThemeToggle />
      </Box>
    </Drawer>
  );
}
