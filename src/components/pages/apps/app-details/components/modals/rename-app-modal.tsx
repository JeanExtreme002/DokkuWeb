import { ReloadIcon } from '@radix-ui/react-icons';
import { Box, Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes';
import React from 'react';
import { Trans } from 'react-i18next';

import { usePageTranslation } from '@/i18n/utils';

import { useAppNameValidation } from '../../../utils';
import styles from '../../app-details.module.css';

interface RenameAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  newName: string;
  onSetNewName: (val: string) => void;
  confirmText: string;
  onSetConfirmText: (val: string) => void;
  renameLoading: boolean;
  renameError: string | null;
  onConfirm: () => void;
}

export default function RenameAppModal(props: RenameAppModalProps) {
  const {
    open,
    onOpenChange,
    currentName,
    newName,
    onSetNewName,
    confirmText,
    onSetConfirmText,
    renameLoading,
    renameError,
    onConfirm,
  } = props;

  const { t } = usePageTranslation();
  const validation = useAppNameValidation(newName);
  const expectedConfirmText = `${t('modals.renameApp.confirmInputPrefix')}-${currentName}`;
  const isConfirmValid = confirmText.trim() === expectedConfirmText;
  const isNewNameValid = validation.isValid;
  const handleNewNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^a-zA-Z0-9-]/g, '');
    onSetNewName(cleaned);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: '520px' }}>
        <Dialog.Title>{t('modals.renameApp.title')}</Dialog.Title>
        <Dialog.Description style={{ marginBottom: '16px', color: 'var(--gray-11)' }}>
          <Text size='2' style={{ color: 'var(--gray-11)', marginBottom: '8px', display: 'block' }}>
            <Trans
              t={t}
              i18nKey='modals.renameApp.description'
              values={{ name: currentName }}
              components={{ strong: <strong /> }}
            />
          </Text>
        </Dialog.Description>

        <Box style={{ marginTop: '8px' }}>
          <Text size='2' style={{ color: 'var(--gray-11)', marginBottom: '8px', display: 'block' }}>
            <strong>{t('modals.renameApp.newNameLabel')}</strong>
          </Text>
          <TextField.Root
            placeholder={t('modals.renameApp.newNamePlaceholder')}
            value={newName}
            onChange={handleNewNameChange}
            disabled={renameLoading}
          />
          <Text
            size='2'
            color={!validation.isValid && newName.length > 0 ? 'red' : 'gray'}
            style={{ marginTop: '6px', display: 'block' }}
          >
            {t('name.counter', { count: newName.length })} {validation.message}
          </Text>
        </Box>

        <Box style={{ marginTop: '24px' }}>
          <Text size='2' style={{ color: 'var(--gray-11)', marginBottom: '8px', display: 'block' }}>
            <Trans
              t={t}
              i18nKey='modals.renameApp.confirmInstruction'
              values={{ confirmText: expectedConfirmText }}
              components={{ strong: <strong /> }}
            />
          </Text>
          <TextField.Root
            placeholder={t('modals.renameApp.confirmInputPlaceholder', {
              confirmText: expectedConfirmText,
            })}
            value={confirmText}
            onChange={(e) => onSetConfirmText(e.target.value)}
            disabled={renameLoading}
          />
        </Box>

        {renameError && (
          <Text size='2' style={{ color: 'var(--red-10)', marginTop: '12px', display: 'block' }}>
            {renameError}
          </Text>
        )}

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button
              variant='soft'
              color='gray'
              style={{ cursor: 'pointer' }}
              disabled={renameLoading}
            >
              {t('modals.common.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            color='red'
            onClick={onConfirm}
            disabled={renameLoading || !isNewNameValid || !isConfirmValid}
            style={{ cursor: 'pointer' }}
          >
            {renameLoading ? (
              <>
                <ReloadIcon className={styles.buttonSpinner} /> {t('modals.renameApp.renaming')}
              </>
            ) : (
              t('modals.renameApp.confirm')
            )}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
