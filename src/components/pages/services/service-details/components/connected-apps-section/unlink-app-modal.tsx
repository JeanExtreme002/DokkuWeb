import { ReloadIcon, TrashIcon } from '@radix-ui/react-icons';
import { Button, Dialog, Flex, Text } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../service-details.module.css';

interface UnlinkAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appName: string | null;
  unlinkLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function UnlinkAppModal({
  open,
  onOpenChange,
  appName,
  unlinkLoading,
  onCancel,
  onConfirm,
}: UnlinkAppModalProps) {
  const { t } = usePageTranslation();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>{t('services.s.unlinkModal.title')}</Dialog.Title>
        <Dialog.Description style={{ marginTop: '12px', marginBottom: '20px' }}>
          <Text size='2' weight='medium' style={{ color: 'var(--gray-11)' }}>
            {t('services.s.unlinkModal.description.prefix')}{' '}
            <strong>{appName?.replace(/^\d+-/, '')}</strong>{' '}
            {t('services.s.unlinkModal.description.suffix')}
          </Text>{' '}
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button variant='soft' color='gray' style={{ cursor: 'pointer' }} onClick={onCancel}>
              {t('services.s.unlinkModal.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            variant='solid'
            color='red'
            style={{ cursor: 'pointer' }}
            onClick={onConfirm}
            disabled={unlinkLoading}
          >
            {unlinkLoading ? <ReloadIcon className={styles.buttonSpinner} /> : <TrashIcon />}
            {unlinkLoading
              ? t('services.s.unlinkModal.confirming')
              : t('services.s.unlinkModal.confirm')}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
