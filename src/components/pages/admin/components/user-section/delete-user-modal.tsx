import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Box, Button, Dialog, Flex, Spinner, Text, TextField } from '@radix-ui/themes';
import React from 'react';
import { Trans } from 'react-i18next';

import { usePageTranslation } from '@/i18n/utils';

interface DeleteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email?: string | null;
  confirmText: string;
  onConfirmTextChange: (val: string) => void;
  loading: boolean;
  onConfirm: () => void;
}

export function DeleteUserModal(props: DeleteUserModalProps) {
  const { open, onOpenChange, email, confirmText, onConfirmTextChange, loading, onConfirm } = props;

  const { t } = usePageTranslation();
  const expectedConfirm = (email || '').trim();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: '480px' }}>
        <Dialog.Title>{t('admin.users.delete.modal.title')}</Dialog.Title>
        <Dialog.Description size='2' style={{ marginBottom: '16px', color: 'var(--gray-11)' }}>
          <Trans
            t={t}
            i18nKey='admin.users.delete.modal.description'
            components={{ strong: <strong /> }}
          />
        </Dialog.Description>

        <Box style={{ marginTop: '8px' }}>
          <Text size='2' style={{ color: 'var(--gray-11)', marginBottom: '8px', display: 'block' }}>
            <Trans
              t={t}
              i18nKey='admin.users.delete.modal.confirmInstruction'
              values={{ email: expectedConfirm }}
              components={{ strong: <strong /> }}
            />
          </Text>
          <TextField.Root
            placeholder={t('admin.users.delete.modal.confirmInputPlaceholder', {
              email: expectedConfirm,
            })}
            value={confirmText}
            onChange={(e) => onConfirmTextChange(e.target.value)}
          />
        </Box>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button variant='soft' color='gray' style={{ cursor: 'pointer' }} disabled={loading}>
              {t('admin.users.delete.modal.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            onClick={onConfirm}
            disabled={loading || !expectedConfirm || confirmText.trim() !== expectedConfirm}
            variant='surface'
            color='red'
            style={{
              cursor: 'pointer',
            }}
          >
            {loading ? (
              <>
                <Spinner />
                {t('admin.users.delete.modal.confirm_loading')}
              </>
            ) : (
              <>
                <ExclamationTriangleIcon />
                {t('admin.users.delete.modal.confirm')}
              </>
            )}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
