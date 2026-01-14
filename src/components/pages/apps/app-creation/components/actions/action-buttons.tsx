import { Box, Button, Flex, Text } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../app-creation.module.css';

interface ActionButtonsProps {
  creating: boolean;
  canSubmit: boolean;
  onCancel: () => void;
  onCreate: () => void;
}

export function ActionButtons({ creating, canSubmit, onCancel, onCreate }: ActionButtonsProps) {
  const { t } = usePageTranslation();
  return (
    <Flex justify='end' gap='3' className={styles.buttonsContainer}>
      <Button
        size='3'
        color='gray'
        variant='outline'
        style={{ cursor: 'pointer' }}
        onClick={onCancel}
        disabled={creating}
      >
        {t('actions.cancel')}
      </Button>
      <Button
        size='3'
        onClick={onCreate}
        disabled={!canSubmit}
        style={{
          background: canSubmit
            ? 'linear-gradient(135deg, var(--green-9) 0%, var(--green-10) 100%)'
            : 'var(--gray-5)',
          border: 'none',
          color: 'white',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          fontWeight: '500',
          padding: '12px 24px',
          minWidth: '180px',
        }}
      >
        {creating ? (
          <Flex align='center' gap='2'>
            <Box
              className={styles.spinner}
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid white',
                borderRadius: '50%',
              }}
            />
            <Text>{t('actions.creating')}</Text>
          </Flex>
        ) : (
          t('actions.createApp')
        )}
      </Button>
    </Flex>
  );
}
