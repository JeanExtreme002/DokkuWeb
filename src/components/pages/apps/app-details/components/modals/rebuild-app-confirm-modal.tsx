import { Button, Dialog, Flex } from '@radix-ui/themes';
import React from 'react';

import { usePageTranslation } from '@/i18n/utils';

interface RebuildAppConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rebuildLoading: boolean;
  onConfirm: () => void;
}

export default function RebuildAppConfirmModal(props: RebuildAppConfirmModalProps) {
  const { open, onOpenChange, rebuildLoading, onConfirm } = props;
  const { t } = usePageTranslation();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth='450px' style={{ padding: '24px' }}>
        <Dialog.Title style={{ marginBottom: '12px' }}>{t('modals.rebuildApp.title')}</Dialog.Title>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          {t('modals.rebuildApp.descriptionTop')}
          <br />
          <br />
          {t('modals.rebuildApp.descriptionBottom')}
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button
              variant='soft'
              color='gray'
              style={{ cursor: 'pointer' }}
              disabled={rebuildLoading}
            >
              {t('modals.common.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            onClick={onConfirm}
            disabled={rebuildLoading}
            style={{ backgroundColor: 'var(--violet-9)', color: 'white', cursor: 'pointer' }}
          >
            {rebuildLoading ? t('modals.rebuildApp.rebuilding') : t('modals.rebuildApp.confirm')}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
