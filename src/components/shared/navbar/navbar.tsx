import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ChevronDownIcon, GlobeIcon, PlusIcon } from '@radix-ui/react-icons';
import { Button, DropdownMenu } from '@radix-ui/themes';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { AppIcon, NetworkIcon, Search, ServiceIcon, SideBar, WebsiteLogo } from '@/components';
import i18n from '@/i18n';
import { logout } from '@/lib';
import { LANGUAGE_NAMES } from '@/lib/utils';

import styles from './navbar.module.css';

interface ProfileMenuProps {
  anchorEl?: HTMLElement;
  menuId: string;
  isMenuOpen: boolean;
  handleMenuClose: (args: any) => void;
}

interface NavBarProps {
  session: Session;
}

const ProfileMenu = (props: ProfileMenuProps) => {
  const { anchorEl, menuId, isMenuOpen, handleMenuClose } = props;
  const router = useRouter();
  const { t } = useTranslation('shared');

  const handleRedirect = (path: string) => {
    handleMenuClose(null);

    if (router.asPath.replace(/^\/+|\/+$/g, '') !== path.replace(/^\/+|\/+$/g, '')) {
      router.push(path);
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => handleRedirect('/settings')}>{t('navbar.settings')}</MenuItem>
      <MenuItem onClick={() => logout()}>{t('navbar.logout')}</MenuItem>
    </Menu>
  );
};

export function NavBar(props: NavBarProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isSideBarOpen, setIsSideBarOpen] = React.useState(false);
  const { t } = useTranslation('shared');

  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const profileMenuId = 'profile-menu';
  const router = useRouter();

  const handleCreateRedirect = (path: string) => {
    if (router.asPath.replace(/^\/+|\/+$/g, '') !== path.replace(/^\/+|\/+$/g, '')) {
      router.push(path);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position='static' color='secondary'>
        <Toolbar>
          <IconButton
            size='large'
            edge='start'
            color='inherit'
            aria-label='open drawer'
            sx={{ mr: 2 }}
            onClick={() => setIsSideBarOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <WebsiteLogo
              imageDisplay={{ xs: 'none', sm: 'flex' }}
              titleDisplay={{ xs: 'none', sm: 'block' }}
            />
          </Box>
          <Search />
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'flex' } }} alignItems={'center'}>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button
                  variant='surface'
                  size='2'
                  color='purple'
                  style={{
                    cursor: 'pointer',
                    backgroundColor: 'var(--purple-2)',
                    marginRight: '12px',
                  }}
                  className={styles.createButtonTrigger}
                >
                  <PlusIcon />
                  <ChevronDownIcon />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item
                  color='gray'
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleCreateRedirect('/apps/create/')}
                >
                  <AppIcon />
                  {t('navbar.createApp')}
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item
                  color='gray'
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleCreateRedirect('/services/create/')}
                >
                  <ServiceIcon />
                  {t('navbar.createService')}
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item
                  color='gray'
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleCreateRedirect('/networks/')}
                >
                  <NetworkIcon />
                  {t('navbar.createNetwork')}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button
                  variant='surface'
                  size='2'
                  color='purple'
                  style={{
                    cursor: 'pointer',
                    color: 'var(--purple-1)',
                    backgroundColor: 'var(--purple-7)',
                    marginRight: '12px',
                  }}
                  className={styles.languageButtonTrigger}
                >
                  <GlobeIcon width={18} height={18} />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                {Object.entries(LANGUAGE_NAMES).map(([code, name], index, entries) => (
                  <React.Fragment key={code}>
                    <DropdownMenu.Item
                      color='gray'
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
            <Typography
              sx={{ display: { xs: 'none', md: 'flex' } }}
              marginInline={1}
              fontWeight={'light'}
            >
              {(() => {
                const firstName = props.session.user?.name?.split(' ')[0] ?? '';
                return t('navbar.greeting', { name: firstName });
              })()}
            </Typography>
            <IconButton
              size='large'
              edge='end'
              aria-controls={profileMenuId}
              aria-haspopup='true'
              onClick={handleProfileMenuOpen}
              color='inherit'
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <SideBar isOpen={isSideBarOpen} setIsOpen={setIsSideBarOpen} />

      <ProfileMenu
        menuId={profileMenuId}
        isMenuOpen={isMenuOpen}
        handleMenuClose={handleMenuClose}
        anchorEl={anchorEl || undefined}
      />
    </Box>
  );
}
