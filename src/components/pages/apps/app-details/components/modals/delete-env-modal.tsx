import { Button, Dialog, Flex } from '@radix-ui/themes';
import React from 'react';

interface DeleteEnvModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  envToDelete: string | null;
  deletingEnv: string | null | undefined;
  removeEnvironmentVariable: () => void;
}

export default function DeleteEnvModal(props: DeleteEnvModalProps) {
  const { open, onOpenChange, envToDelete, deletingEnv, removeEnvironmentVariable } = props;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth='450px' style={{ padding: '24px' }}>
        <Dialog.Title style={{ marginBottom: '12px' }}>Confirmar Remoção</Dialog.Title>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          Tem certeza que deseja remover a variável de ambiente{' '}
          <strong>&quot;{envToDelete}&quot;</strong>?
          <br />
          <br />
          Esta ação não pode ser desfeita e pode afetar o funcionamento do aplicativo.
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button variant='soft' color='gray' style={{ cursor: 'pointer' }}>
              Cancelar
            </Button>
          </Dialog.Close>
          <Button
            color='red'
            onClick={removeEnvironmentVariable}
            disabled={!!envToDelete && deletingEnv === envToDelete}
            style={{ backgroundColor: 'var(--red-9)', color: 'white', cursor: 'pointer' }}
          >
            {envToDelete && deletingEnv === envToDelete ? 'Removendo...' : 'Confirmar Remoção'}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
