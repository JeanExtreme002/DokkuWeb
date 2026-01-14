import { Box, Card, Flex, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { DotIcon } from '@/components/shared/icons';

export interface ErrorCardProps {
  error?: string | null;
}

export function ErrorCard({ error }: ErrorCardProps) {
  const { t } = useTranslation('shared');
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
          {t('errorCard.prefix')} {error}
        </Text>
      </Flex>
    </Card>
  );
}
