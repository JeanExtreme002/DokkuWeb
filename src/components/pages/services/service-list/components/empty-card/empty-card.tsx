import { Card, Text } from '@radix-ui/themes';
import React from 'react';

import { usePageTranslation } from '@/i18n/utils';

export function EmptyCard() {
  const { t } = usePageTranslation();
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
        {t('list.empty.title')}
      </Text>
    </Card>
  );
}
