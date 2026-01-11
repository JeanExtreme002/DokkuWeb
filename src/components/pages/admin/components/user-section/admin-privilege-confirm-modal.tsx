import { Button, Dialog, Flex } from '@radix-ui/themes';

interface AdminPrivilegeConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetEmail?: string;
  pendingAdminValue: boolean | null;
  onConfirm: () => Promise<void> | void;
  loading: boolean;
}

export function AdminPrivilegeConfirmModal({
  open,
  onOpenChange,
  targetEmail,
  pendingAdminValue,
  onConfirm,
  loading,
}: AdminPrivilegeConfirmModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth='450px' style={{ padding: '24px' }}>
        <Dialog.Title style={{ marginBottom: '12px' }}>
          Confirmar Alteração de Privilégio
        </Dialog.Title>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          {pendingAdminValue ? (
            <>
              Deseja conceder privilégio de administrador para o usuário{' '}
              <strong>{targetEmail}</strong>?
            </>
          ) : (
            <>
              Deseja remover o privilégio de administrador do usuário <strong>{targetEmail}</strong>
              ?
            </>
          )}
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button variant='soft' color='gray' style={{ cursor: 'pointer' }}>
              Cancelar
            </Button>
          </Dialog.Close>
          <Button
            color='red'
            onClick={onConfirm}
            disabled={loading}
            style={{ backgroundColor: 'var(--red-9)', color: 'white', cursor: 'pointer' }}
          >
            Confirmar
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
