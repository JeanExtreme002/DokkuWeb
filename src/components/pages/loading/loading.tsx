import { Box, CircularProgress } from '@mui/material';

export function LoadingPage() {
  return (
    <Box
      alignItems={'center'}
      width={'100%'}
      height={'100vh'}
      display={'flex'}
      justifyContent={'center'}
    >
      <CircularProgress />
    </Box>
  );
}
