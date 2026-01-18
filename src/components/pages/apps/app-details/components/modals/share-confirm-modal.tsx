import { Button, Dialog, Flex } from '@radix-ui/themes';
import React from 'react';

import { usePageTranslation } from '@/i18n/utils';

interface ShareConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingShareEmail: string | null;
  sharingLoading: boolean;
  onConfirm: () => void;
}

export default function ShareConfirmModal(props: ShareConfirmModalProps) {
  const { open, onOpenChange, pendingShareEmail, sharingLoading, onConfirm } = props;
  const { t } = usePageTranslation();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth='480px' style={{ padding: '24px' }}>
        <Dialog.Title style={{ marginBottom: '12px' }}>
          {t('security.sharing.confirmTitle')}
        </Dialog.Title>
        <Dialog.Description size='2' style={{ color: 'var(--gray-11)', marginBottom: '8px' }}>
          {t('security.sharing.confirmDescription')}
        </Dialog.Description>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          {t('security.sharing.confirmQuestion')}{' '}
          {pendingShareEmail ? <strong>{pendingShareEmail}</strong> : null}?
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button
              variant='soft'
              color='gray'
              style={{ cursor: 'pointer' }}
              disabled={sharingLoading}
            >
              {t('security.sharing.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            onClick={onConfirm}
            disabled={sharingLoading}
            color='orange'
            style={{ cursor: 'pointer' }}
          >
            {t('security.sharing.confirm')}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
