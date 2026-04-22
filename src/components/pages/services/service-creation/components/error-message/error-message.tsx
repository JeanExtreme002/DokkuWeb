import { Box, Flex, Text } from '@radix-ui/themes';
import React from 'react';

interface ErrorMessageProps {
  error: string | null;
  hint?: React.ReactNode;
}

export function ErrorMessage(props: ErrorMessageProps) {
  const { error, hint } = props;
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
      <Flex direction='column' gap='1'>
        <Text size='3' style={{ color: 'var(--red-11)' }}>
          {error}
        </Text>
        {hint && (
          <Text size='1' style={{ color: 'var(--gray-11)' }}>
            {hint}
          </Text>
        )}
      </Flex>
    </Box>
  );
}
