import { ReloadIcon } from '@radix-ui/react-icons';
import { Box, Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes';
import React from 'react';

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

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: '480px' }}>
        <Dialog.Title>Confirmar Exclusão</Dialog.Title>
        <Dialog.Description style={{ marginBottom: '16px', color: 'var(--gray-11)' }}>
          Tem certeza que deseja prosseguir com a exclusão da aplicação {'"'}
          <strong>{displayName}</strong>
          {'"'}?
          <br />
          <br />
          Esta ação não pode ser desfeita.
        </Dialog.Description>

        <Box style={{ marginTop: '8px' }}>
          <Text size='2' style={{ color: 'var(--gray-11)', marginBottom: '8px', display: 'block' }}>
            Para confirmar, digite <strong>{`deletar-${displayName}`}</strong> abaixo:
          </Text>
          <TextField.Root
            placeholder={`deletar-${displayName}`}
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
              Cancelar
            </Button>
          </Dialog.Close>
          <Button
            onClick={deleteApp}
            disabled={deleteAppLoading || deleteConfirmText.trim() !== `deletar-${displayName}`}
            style={{
              backgroundColor: 'var(--red-9)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {deleteAppLoading ? (
              <>
                <ReloadIcon className={styles.buttonSpinner} /> Deletando...
              </>
            ) : (
              'Confirmar Exclusão'
            )}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
