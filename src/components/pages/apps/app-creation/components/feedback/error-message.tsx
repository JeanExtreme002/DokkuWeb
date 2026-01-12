import { Box, Text } from '@radix-ui/themes';

import styles from '../../app-creation.module.css';

interface ErrorMessageProps {
  error: string | null;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <Box
      style={{
        padding: '12px',
        backgroundColor: 'var(--red-2)',
        borderRadius: '8px',
        border: '1px solid var(--red-6)',
      }}
    >
      <Text size='3' className={styles.errorMessage} style={{ color: 'var(--red-11)' }}>
        {error}
      </Text>
    </Box>
  );
}
