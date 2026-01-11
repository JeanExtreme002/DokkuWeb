import { Button, Dialog, Flex } from '@radix-ui/themes';

interface RestartConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restartLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RestartConfirmModal({
  open,
  onOpenChange,
  restartLoading,
  onCancel,
  onConfirm,
}: RestartConfirmModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>Confirmar Ação</Dialog.Title>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          Tem certeza que deseja reiniciar o serviço?
          <br />
          <br />
          Esta ação pode causar indisponibilidade temporária.
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button
              variant='soft'
              color='gray'
              style={{ cursor: 'pointer' }}
              onClick={onCancel}
              disabled={restartLoading}
            >
              Cancelar
            </Button>
          </Dialog.Close>
          <Button
            variant='solid'
            color='orange'
            style={{ cursor: 'pointer' }}
            onClick={onConfirm}
            disabled={restartLoading}
          >
            {restartLoading ? 'Reiniciando...' : 'Reiniciar Serviço'}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
