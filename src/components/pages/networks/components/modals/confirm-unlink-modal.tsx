import { AlertDialog, Button, Flex } from '@radix-ui/themes';

interface UnlinkModalState {
  networkName: string;
  appName: string;
}

interface ConfirmUnlinkModalProps {
  state: UnlinkModalState | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmUnlinkModal({ state, onClose, onConfirm }: ConfirmUnlinkModalProps) {
  if (!state) return null;

  return (
    <AlertDialog.Root open={!!state} onOpenChange={onClose}>
      <AlertDialog.Content style={{ maxWidth: '450px' }}>
        <AlertDialog.Title>Desvincular Aplicativo</AlertDialog.Title>
        <AlertDialog.Description size='2'>
          Tem certeza que deseja desvincular o aplicativo <strong>{state.appName}</strong> da rede{' '}
          <strong>{state.networkName}</strong>?
        </AlertDialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <AlertDialog.Cancel>
            <Button variant='soft' color='gray' style={{ cursor: 'pointer' }}>
              Cancelar
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button variant='solid' color='red' style={{ cursor: 'pointer' }} onClick={onConfirm}>
              Desvincular
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
