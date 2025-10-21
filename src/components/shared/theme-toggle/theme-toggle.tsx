import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { Box, FormControlLabel, Switch } from '@mui/material';

import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { mode, toggleTheme } = useTheme();

  const getTextColor = () => (mode === 'light' ? '#4b5563' : '#d1d5db');
  const getBorderColor = () => (mode === 'light' ? '#e5e7eb' : '#374151');

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        borderTop: `1px solid ${getBorderColor()}`,
        marginTop: 'auto',
        backgroundColor: mode === 'light' ? '#ffffff' : '#1a1a1a',
      }}
    >
      <FormControlLabel
        control={
          <Switch
            checked={mode === 'dark'}
            onChange={toggleTheme}
            color='primary'
            sx={{
              '& .MuiSwitch-track': {
                backgroundColor: mode === 'light' ? '#e5e7eb' : '#374151',
              },
              '& .MuiSwitch-thumb': {
                backgroundColor: mode === 'light' ? '#f59e0b' : '#3b82f6',
              },
            }}
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {mode === 'light' ? (
              <LightModeIcon sx={{ color: getTextColor(), fontSize: 20 }} />
            ) : (
              <DarkModeIcon sx={{ color: getTextColor(), fontSize: 20 }} />
            )}
            <span
              style={{
                color: getTextColor(),
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {mode === 'light' ? 'Modo Claro' : 'Modo Escuro'}
            </span>
          </Box>
        }
        sx={{
          margin: 0,
          '& .MuiFormControlLabel-label': {
            marginLeft: '8px',
          },
        }}
      />
    </Box>
  );
}
