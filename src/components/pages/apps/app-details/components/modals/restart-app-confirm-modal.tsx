import { Button, Dialog, Flex } from '@radix-ui/themes';
import React from 'react';

import { usePageTranslation } from '@/i18n/utils';

interface RestartAppConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restartLoading: boolean;
  onConfirm: () => void;
}

export default function RestartAppConfirmModal(props: RestartAppConfirmModalProps) {
  const { open, onOpenChange, restartLoading, onConfirm } = props;
  const { t } = usePageTranslation();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth='450px' style={{ padding: '24px' }}>
        <Dialog.Title style={{ marginBottom: '12px' }}>{t('modals.restartApp.title')}</Dialog.Title>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          {t('modals.restartApp.descriptionTop')}
          <br />
          <br />
          {t('modals.restartApp.descriptionBottom')}
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button
              variant='soft'
              color='gray'
              style={{ cursor: 'pointer' }}
              disabled={restartLoading}
            >
              {t('modals.common.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            onClick={onConfirm}
            disabled={restartLoading}
            style={{ backgroundColor: 'var(--orange-8)', color: 'white', cursor: 'pointer' }}
          >
            {restartLoading ? t('modals.restartApp.restarting') : t('modals.restartApp.confirm')}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
