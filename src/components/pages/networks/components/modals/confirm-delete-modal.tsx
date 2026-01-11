import { AlertDialog, Button, Flex } from '@radix-ui/themes';

interface ConfirmDeleteModalProps {
  openName: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({ openName, onClose, onConfirm }: ConfirmDeleteModalProps) {
  if (!openName) return null;

  return (
    <AlertDialog.Root open={!!openName} onOpenChange={onClose}>
      <AlertDialog.Content style={{ maxWidth: '450px' }}>
        <AlertDialog.Title>Excluir Rede</AlertDialog.Title>
        <AlertDialog.Description size='2'>
          Tem certeza que deseja excluir a rede <strong>{openName}</strong>? Esta ação não pode ser
          desfeita.
        </AlertDialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <AlertDialog.Cancel>
            <Button variant='soft' color='gray' style={{ cursor: 'pointer' }}>
              Cancelar
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button variant='solid' color='red' style={{ cursor: 'pointer' }} onClick={onConfirm}>
              Excluir
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
