import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useTheme } from '@mui/material/styles';

import { NavBarLogo } from '@/components';

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
    { label: 'APLICATIVOS', href: '/apps' },
    { label: 'SERVIÇOS', href: '/services' },
    { label: 'REDES', href: '/networks' },
    { label: 'ARMAZENAMENTO', href: '/storages' },
  ];

  return (
    <Drawer anchor='left' open={isOpen} onClose={toggleDrawer(false)}>
      <Box
        sx={{ width: 350 }}
        role='presentation'
        onClick={toggleDrawer(false)}
        onKeyDown={toggleDrawer(false)}
      >
        <ListItem key={'logo'} disablePadding>
          <div
            style={{ background: secondaryColor, display: 'flex', width: '100%', padding: '10px' }}
          >
            <NavBarLogo disableLink={true} />
          </div>
        </ListItem>
        <List>
          {drawerItems.map((item) => (
            <ListItem key={item.label}>
              <ListItemButton component='a' href={item.href}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
