import { Box, Heading, Text } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

export function HeaderSection() {
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
        {t('header.title')}
      </Heading>
      <Text size='3' color='gray'>
        {t('header.subtitle')}
      </Text>
    </Box>
  );
}
