import { Button, Dialog, Flex } from '@radix-ui/themes';

interface TakeoverConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetEmail?: string;
  onConfirm: () => void;
  loading: boolean;
}

export function TakeoverConfirmModal({
  open,
  onOpenChange,
  targetEmail,
  onConfirm,
  loading,
}: TakeoverConfirmModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth='450px' style={{ padding: '24px' }}>
        <Dialog.Title style={{ marginBottom: '12px' }}>Confirmar Takeover</Dialog.Title>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          Tem certeza que deseja assumir o controle da conta <strong>{targetEmail}</strong>? Esta
          ação irá substituir sua sessão atual pela sessão da conta selecionada.
          <br />
          <br />
          Quaisquer ações terão <strong>impacto real</strong> na conta desse usuário.
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
            {loading ? 'Processando...' : 'Confirmar Takeover'}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
