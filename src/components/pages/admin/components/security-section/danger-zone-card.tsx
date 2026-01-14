import { TrashIcon } from '@radix-ui/react-icons';
import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../admin.module.css';

interface DangerZoneCardProps {
  onOpenShutdownModal: () => void;
  shutdownError: string | null;
}

export function DangerZoneCard({ onOpenShutdownModal, shutdownError }: DangerZoneCardProps) {
  const { t } = usePageTranslation();
  return (
    <Box style={{ marginTop: '45px' }}>
      <Heading size='5' style={{ marginBottom: '12px', color: 'var(--red-11)' }}>
        {t('admin.security.danger_zone.title')}
      </Heading>
      <Card
        style={{
          border: '1px solid var(--red-6)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          padding: '16px',
          background: 'var(--red-2)',
        }}
      >
        <Flex align='center' justify='between' gap='4' className={styles.dangerZoneHeader}>
          <Flex direction='column' gap='1'>
            <Text size='3' weight='bold' style={{ color: 'var(--gray-12)', display: 'block' }}>
              {t('admin.security.danger_zone.header')}
            </Text>
            <Text size='2' style={{ color: 'var(--gray-11)', display: 'block' }}>
              {t('admin.security.danger_zone.description')}
            </Text>
          </Flex>
          <Button
            size='2'
            onClick={onOpenShutdownModal}
            style={{
              background: 'var(--gray-4)',
              color: 'var(--red-9)',
              border: '1px solid var(--gray-7)',
              cursor: 'pointer',
            }}
            className={styles.dangerZoneButton}
          >
            <TrashIcon />
            {t('admin.security.danger_zone.button')}
          </Button>
        </Flex>
        {shutdownError && (
          <Text size='2' style={{ color: 'var(--red-11)' }}>
            {shutdownError}
          </Text>
        )}
      </Card>
    </Box>
  );
}
