import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useTheme } from '@mui/material/styles';

import {
  AppIcon,
  DashboardIcon,
  NetworkIcon,
  ServiceIcon,
  ThemeToggle,
  WebsiteLogo,
} from '@/components';

interface SideBarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function SideBar({ isOpen, setIsOpen }: SideBarProps) {
  const toggleDrawer = (open: boolean) => () => {
    setIsOpen(open);
  };

  const theme = useTheme();
  const secondaryColor = theme.palette.secondary.main;

  const drawerItems = [
    { label: 'VISÃO GERAL', href: '/', icon: <DashboardIcon /> },
    { label: 'APLICATIVOS', href: '/apps', icon: <AppIcon /> },
    { label: 'SERVIÇOS', href: '/services', icon: <ServiceIcon /> },
    { label: 'REDES', href: '/networks', icon: <NetworkIcon /> },
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
        {/* Header com logo */}
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

        {/* Menu de navegação */}
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

        {/* Switch de tema na parte inferior */}
        <ThemeToggle />
      </Box>
    </Drawer>
  );
}
