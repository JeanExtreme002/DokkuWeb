import { Box, Card, Flex, Text } from '@radix-ui/themes';
import React from 'react';

import { DotIcon } from '@/components/shared/icons';

interface ErrorCardProps {
  error: string | null;
}

export function ErrorCard({ error }: ErrorCardProps) {
  if (!error) return null;

  return (
    <Card
      style={{
        border: '1px solid var(--red-6)',
        backgroundColor: 'var(--red-2)',
        padding: '20px',
      }}
    >
      <Flex align='center' gap='3'>
        <Box style={{ color: 'var(--red-11)' }}>
          <DotIcon />
        </Box>
        <Text size='3' style={{ color: 'var(--red-11)' }}>
          {error}
        </Text>
      </Flex>
    </Card>
  );
}
