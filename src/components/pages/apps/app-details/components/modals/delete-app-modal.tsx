import { ReloadIcon } from '@radix-ui/react-icons';
import { Box, Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes';
import React from 'react';
import { Trans } from 'react-i18next';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../app-details.module.css';

interface DeleteAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayName: string;
  deleteConfirmText: string;
  onSetDeleteConfirmText: (val: string) => void;
  deleteAppLoading: boolean;
  deleteApp: () => void;
}

export default function DeleteAppModal(props: DeleteAppModalProps) {
  const {
    open,
    onOpenChange,
    displayName,
    deleteConfirmText,
    onSetDeleteConfirmText,
    deleteAppLoading,
    deleteApp,
  } = props;

  const { t } = usePageTranslation();
  const confirmPrefix = t('modals.deleteApp.confirmInputPrefix');
  const confirmText = `${confirmPrefix}-${displayName}`;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: '480px' }}>
        <Dialog.Title>{t('modals.deleteApp.title')}</Dialog.Title>
        <Dialog.Description style={{ marginBottom: '16px', color: 'var(--gray-11)' }}>
          <Trans
            t={t}
            i18nKey='modals.deleteApp.description'
            values={{ name: displayName }}
            components={{ strong: <strong /> }}
          />
          <br />
          <br />
          {t('modals.deleteApp.warning')}
        </Dialog.Description>

        <Box style={{ marginTop: '8px' }}>
          <Text size='2' style={{ color: 'var(--gray-11)', marginBottom: '8px', display: 'block' }}>
            <Trans
              t={t}
              i18nKey='modals.deleteApp.confirmInstruction'
              values={{ confirmText }}
              components={{ strong: <strong /> }}
            />
          </Text>
          <TextField.Root
            placeholder={t('modals.deleteApp.confirmInputPlaceholder', { confirmText })}
            value={deleteConfirmText}
            onChange={(e) => onSetDeleteConfirmText(e.target.value)}
          />
        </Box>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button
              variant='soft'
              color='gray'
              style={{ cursor: 'pointer' }}
              disabled={deleteAppLoading}
            >
              {t('modals.common.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            onClick={deleteApp}
            disabled={deleteAppLoading || deleteConfirmText.trim() !== confirmText}
            style={{
              backgroundColor: 'var(--red-9)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {deleteAppLoading ? (
              <>
                <ReloadIcon className={styles.buttonSpinner} /> {t('modals.deleteApp.deleting')}
              </>
            ) : (
              t('modals.deleteApp.confirm')
            )}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
