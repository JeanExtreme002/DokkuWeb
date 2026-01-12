import { Card, Text } from '@radix-ui/themes';
import React from 'react';

export function EmptyCard() {
  return (
    <Card
      style={{
        border: '1px solid var(--gray-6)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        padding: '40px',
        textAlign: 'center',
      }}
    >
      <Text size='3' color='gray'>
        Nenhum serviço criado ainda.
      </Text>
    </Card>
  );
}
