import { Button, Dialog, Flex } from '@radix-ui/themes';

interface StopConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stopLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function StopConfirmModal({
  open,
  onOpenChange,
  stopLoading,
  onCancel,
  onConfirm,
}: StopConfirmModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>Confirmar Ação</Dialog.Title>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          Tem certeza que deseja parar o serviço?
          <br />
          <br />
          Esta ação definitivamente interromperá todas as conexões e processos deste serviço.
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button
              variant='soft'
              color='gray'
              style={{ cursor: 'pointer' }}
              onClick={onCancel}
              disabled={stopLoading}
            >
              Cancelar
            </Button>
          </Dialog.Close>
          <Button
            variant='solid'
            color='red'
            style={{ cursor: 'pointer' }}
            onClick={onConfirm}
            disabled={stopLoading}
          >
            {stopLoading ? 'Parando...' : 'Parar Serviço'}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
