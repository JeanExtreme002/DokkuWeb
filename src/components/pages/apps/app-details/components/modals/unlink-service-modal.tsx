import { ReloadIcon, TrashIcon } from '@radix-ui/react-icons';
import { Button, Dialog, Flex, Text } from '@radix-ui/themes';
import React from 'react';

import { usePageTranslation } from '@/i18n/utils';

interface UnlinkServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceName: string | null;
  unlinkLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function UnlinkServiceModal({
  open,
  onOpenChange,
  serviceName,
  unlinkLoading,
  onCancel,
  onConfirm,
}: UnlinkServiceModalProps) {
  const { t } = usePageTranslation();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>{t('modals.unlinkService.title')}</Dialog.Title>
        <Dialog.Description style={{ marginTop: '12px', marginBottom: '20px' }}>
          <Text size='2' weight='medium' style={{ color: 'var(--gray-11)' }}>
            {t('modals.unlinkService.description.prefix')} <strong>{serviceName}</strong>{' '}
            {t('modals.unlinkService.description.suffix')}
          </Text>
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button variant='soft' color='gray' style={{ cursor: 'pointer' }} onClick={onCancel}>
              {t('modals.common.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            variant='solid'
            color='red'
            style={{ cursor: 'pointer' }}
            onClick={onConfirm}
            disabled={unlinkLoading}
          >
            {unlinkLoading ? <ReloadIcon /> : <TrashIcon />}
            {unlinkLoading
              ? t('modals.unlinkService.confirming')
              : t('modals.unlinkService.confirm')}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
