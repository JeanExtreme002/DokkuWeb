import { Button, Dialog, Flex } from '@radix-ui/themes';
import React from 'react';

interface StopAppConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stopLoading: boolean;
  onConfirm: () => void;
}

export default function StopAppConfirmModal(props: StopAppConfirmModalProps) {
  const { open, onOpenChange, stopLoading, onConfirm } = props;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth='450px' style={{ padding: '24px' }}>
        <Dialog.Title style={{ marginBottom: '12px' }}>Confirmar Ação</Dialog.Title>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          Tem certeza que deseja parar o aplicativo?
          <br />
          <br />
          Esta ação interromperá todos os processos e conexões ativas desse aplicativo.
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button
              variant='soft'
              color='gray'
              style={{ cursor: 'pointer' }}
              disabled={stopLoading}
            >
              Cancelar
            </Button>
          </Dialog.Close>
          <Button
            color='red'
            onClick={onConfirm}
            disabled={stopLoading}
            style={{ backgroundColor: 'var(--red-9)', color: 'white', cursor: 'pointer' }}
          >
            {stopLoading ? 'Parando...' : 'Parar Aplicativo'}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
