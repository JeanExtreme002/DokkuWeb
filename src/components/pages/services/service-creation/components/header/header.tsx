import { Box, Heading, Text } from '@radix-ui/themes';
import React from 'react';

import { usePageTranslation } from '@/i18n/utils';

export function Header() {
  const { t } = usePageTranslation();
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
        {t('services.create.header.title')}
      </Heading>
      <Text size='3' color='gray'>
        {t('services.create.header.subtitle')}
      </Text>
    </Box>
  );
}
