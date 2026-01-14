import { Button, Dialog, Flex } from '@radix-ui/themes';
import React from 'react';
import { Trans } from 'react-i18next';

import { usePageTranslation } from '@/i18n/utils';

interface PortMapping {
  protocol: string;
  origin: number | string;
  dest: number | string;
}

interface DeletePortModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portToDelete: PortMapping | null;
  deletingPort: string | null | undefined;
  removePortMapping: () => void;
}

export default function DeletePortModal(props: DeletePortModalProps) {
  const { open, onOpenChange, portToDelete, deletingPort, removePortMapping } = props;
  const { t } = usePageTranslation();

  const mappingId = portToDelete
    ? `${portToDelete.protocol}-${portToDelete.origin}-${portToDelete.dest}`
    : '';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth='450px' style={{ padding: '24px' }}>
        <Dialog.Title style={{ marginBottom: '12px' }}>{t('modals.deletePort.title')}</Dialog.Title>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          <Trans
            t={t}
            i18nKey='modals.deletePort.description'
            values={{
              mapping: `${portToDelete?.protocol.toUpperCase()}: ${portToDelete?.origin} → ${portToDelete?.dest}`,
            }}
            components={{ strong: <strong /> }}
          />
          <br />
          <br />
          {t('modals.deletePort.warning')}
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button variant='soft' color='gray' style={{ cursor: 'pointer' }}>
              {t('modals.common.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            color='red'
            onClick={removePortMapping}
            disabled={!!portToDelete && deletingPort === mappingId}
            style={{ backgroundColor: 'var(--red-9)', color: 'white', cursor: 'pointer' }}
          >
            {portToDelete && deletingPort === mappingId
              ? t('modals.deletePort.removing')
              : t('modals.deletePort.confirm')}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
