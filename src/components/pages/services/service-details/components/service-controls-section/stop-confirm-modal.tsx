import { Button, Dialog, Flex } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

interface StopConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stopLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function StopConfirmModal({
  open,
  onOpenChange,
  stopLoading,
  onCancel,
  onConfirm,
}: StopConfirmModalProps) {
  const { t } = usePageTranslation();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>{t('services.s.stopModal.title')}</Dialog.Title>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          {t('services.s.stopModal.description')}
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button
              variant='soft'
              color='gray'
              style={{ cursor: 'pointer' }}
              onClick={onCancel}
              disabled={stopLoading}
            >
              {t('services.s.stopModal.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            variant='solid'
            color='red'
            style={{ cursor: 'pointer' }}
            onClick={onConfirm}
            disabled={stopLoading}
          >
            {stopLoading ? t('services.s.stopModal.confirming') : t('services.s.stopModal.confirm')}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
