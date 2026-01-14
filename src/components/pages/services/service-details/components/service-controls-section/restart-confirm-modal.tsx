import { Button, Dialog, Flex } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

interface RestartConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restartLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RestartConfirmModal({
  open,
  onOpenChange,
  restartLoading,
  onCancel,
  onConfirm,
}: RestartConfirmModalProps) {
  const { t } = usePageTranslation();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>{t('services.s.restartModal.title')}</Dialog.Title>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          {t('services.s.restartModal.description')}
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button
              variant='soft'
              color='gray'
              style={{ cursor: 'pointer' }}
              onClick={onCancel}
              disabled={restartLoading}
            >
              {t('services.s.restartModal.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            variant='solid'
            color='orange'
            style={{ cursor: 'pointer' }}
            onClick={onConfirm}
            disabled={restartLoading}
          >
            {restartLoading
              ? t('services.s.restartModal.confirming')
              : t('services.s.restartModal.confirm')}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
