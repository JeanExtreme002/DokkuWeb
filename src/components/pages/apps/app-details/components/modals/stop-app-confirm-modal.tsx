import { Button, Dialog, Flex } from '@radix-ui/themes';
import React from 'react';

import { usePageTranslation } from '@/i18n/utils';

interface StopAppConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stopLoading: boolean;
  onConfirm: () => void;
}

export default function StopAppConfirmModal(props: StopAppConfirmModalProps) {
  const { open, onOpenChange, stopLoading, onConfirm } = props;
  const { t } = usePageTranslation();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth='450px' style={{ padding: '24px' }}>
        <Dialog.Title style={{ marginBottom: '12px' }}>{t('modals.stopApp.title')}</Dialog.Title>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          {t('modals.stopApp.description')}
          <br />
          <br />
          {t('modals.stopApp.warning')}
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button
              variant='soft'
              color='gray'
              style={{ cursor: 'pointer' }}
              disabled={stopLoading}
            >
              {t('modals.common.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            color='red'
            onClick={onConfirm}
            disabled={stopLoading}
            style={{ backgroundColor: 'var(--red-9)', color: 'white', cursor: 'pointer' }}
          >
            {stopLoading ? t('modals.stopApp.stopping') : t('modals.stopApp.confirm')}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
