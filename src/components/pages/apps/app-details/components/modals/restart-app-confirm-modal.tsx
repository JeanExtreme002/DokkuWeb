import { Button, Dialog, Flex } from '@radix-ui/themes';
import React from 'react';

interface RestartAppConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restartLoading: boolean;
  onConfirm: () => void;
}

export default function RestartAppConfirmModal(props: RestartAppConfirmModalProps) {
  const { open, onOpenChange, restartLoading, onConfirm } = props;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth='450px' style={{ padding: '24px' }}>
        <Dialog.Title style={{ marginBottom: '12px' }}>Confirmar Ação</Dialog.Title>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          Tem certeza que deseja reiniciar o aplicativo?
          <br />
          <br />
          Esta ação interromperá temporariamente todos os processos e conexões ativas, e inicializar
          novamente o aplicativo.
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button
              variant='soft'
              color='gray'
              style={{ cursor: 'pointer' }}
              disabled={restartLoading}
            >
              Cancelar
            </Button>
          </Dialog.Close>
          <Button
            onClick={onConfirm}
            disabled={restartLoading}
            style={{ backgroundColor: 'var(--orange-8)', color: 'white', cursor: 'pointer' }}
          >
            {restartLoading ? 'Reiniciando...' : 'Reiniciar Aplicativo'}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
