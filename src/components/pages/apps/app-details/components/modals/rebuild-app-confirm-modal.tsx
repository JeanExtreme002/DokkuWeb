import { Button, Dialog, Flex } from '@radix-ui/themes';
import React from 'react';

interface RebuildAppConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rebuildLoading: boolean;
  onConfirm: () => void;
}

export default function RebuildAppConfirmModal(props: RebuildAppConfirmModalProps) {
  const { open, onOpenChange, rebuildLoading, onConfirm } = props;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth='450px' style={{ padding: '24px' }}>
        <Dialog.Title style={{ marginBottom: '12px' }}>Confirmar Ação</Dialog.Title>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          Tem certeza que deseja reconstruir o aplicativo?
          <br />
          <br />
          Esta ação irá reconstruir do zero a imagem do aplicativo, podendo levar alguns minutos.
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button
              variant='soft'
              color='gray'
              style={{ cursor: 'pointer' }}
              disabled={rebuildLoading}
            >
              Cancelar
            </Button>
          </Dialog.Close>
          <Button
            onClick={onConfirm}
            disabled={rebuildLoading}
            style={{ backgroundColor: 'var(--violet-9)', color: 'white', cursor: 'pointer' }}
          >
            {rebuildLoading ? 'Reconstruindo...' : 'Reconstruir Aplicativo'}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
