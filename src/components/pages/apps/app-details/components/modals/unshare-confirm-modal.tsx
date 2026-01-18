import { Button, Dialog, Flex } from '@radix-ui/themes';
import React from 'react';

import { usePageTranslation } from '@/i18n/utils';

interface UnshareConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingUnshareEmail: string | null;
  unsharingLoading: boolean;
  onConfirm: () => void;
}

export default function UnshareConfirmModal(props: UnshareConfirmModalProps) {
  const { open, onOpenChange, pendingUnshareEmail, unsharingLoading, onConfirm } = props;
  const { t } = usePageTranslation();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth='480px' style={{ padding: '24px' }}>
        <Dialog.Title style={{ marginBottom: '12px' }}>
          {t('security.sharing.unshareConfirmTitle')}
        </Dialog.Title>
        <Dialog.Description size='2' style={{ color: 'var(--gray-11)', marginBottom: '8px' }}>
          {t('security.sharing.unshareConfirmDescription')}
        </Dialog.Description>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          {t('security.sharing.unshareConfirmQuestion')}{' '}
          {pendingUnshareEmail ? <strong>{pendingUnshareEmail}</strong> : null}?
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button
              variant='soft'
              color='gray'
              style={{ cursor: 'pointer' }}
              disabled={unsharingLoading}
            >
              {t('security.sharing.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            onClick={onConfirm}
            disabled={unsharingLoading}
            style={{ backgroundColor: 'var(--red-9)', color: 'white', cursor: 'pointer' }}
          >
            {t('security.sharing.unshare')}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
