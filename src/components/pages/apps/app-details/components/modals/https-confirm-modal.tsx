import { ReloadIcon } from '@radix-ui/react-icons';
import { Button, Dialog, Flex } from '@radix-ui/themes';
import React from 'react';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../app-details.module.css';

interface HttpsConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  httpsEnabled: boolean;
  httpsLoading: boolean;
  onConfirm: () => void;
}

export default function HttpsConfirmModal(props: HttpsConfirmModalProps) {
  const { open, onOpenChange, httpsEnabled, httpsLoading, onConfirm } = props;
  const { t } = usePageTranslation();

  const title = httpsEnabled
    ? t('security.https.confirmDisableTitle')
    : t('security.https.confirmEnableTitle');

  const description = httpsEnabled
    ? t('security.https.confirmDisableDescription')
    : t('security.https.confirmEnableDescription');

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth='450px' style={{ padding: '24px' }}>
        <Dialog.Title style={{ marginBottom: '12px' }}>{title}</Dialog.Title>
        <Dialog.Description size='2' style={{ color: 'var(--gray-11)', marginBottom: '8px' }}>
          {description}
        </Dialog.Description>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          {t('security.https.confirmQuestion')}
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button
              variant='soft'
              color='gray'
              style={{ cursor: 'pointer' }}
              disabled={httpsLoading}
            >
              {t('modals.common.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            onClick={onConfirm}
            disabled={httpsLoading}
            style={{
              backgroundColor: httpsEnabled ? 'var(--red-9)' : 'var(--green-9)',
              color: 'white',
              cursor: httpsLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {httpsLoading && <ReloadIcon className={styles.buttonSpinner} />}
            {httpsLoading
              ? httpsEnabled
                ? t('security.https.disabling')
                : t('security.https.enabling')
              : t('security.https.confirm')}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
