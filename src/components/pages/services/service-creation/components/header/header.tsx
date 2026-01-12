import { Box, Heading, Text } from '@radix-ui/themes';
import React from 'react';

export function Header() {
  return (
    <Box>
      <Heading
        size='7'
        weight='medium'
        style={{
          color: 'var(--gray-12)',
          marginBottom: '4px',
        }}
      >
        Criar novo serviço
      </Heading>
      <Text size='3' color='gray'>
        Configure seu novo serviço no Dokku
      </Text>
    </Box>
  );
}
