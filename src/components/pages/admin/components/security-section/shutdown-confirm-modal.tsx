import { Box, Button, Dialog, Flex, TextField } from '@radix-ui/themes';

interface ShutdownConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyword: string;
  confirmText: string;
  onConfirmTextChange: (val: string) => void;
  onConfirm: () => void;
  loading: boolean;
}

export function ShutdownConfirmModal({
  open,
  onOpenChange,
  keyword,
  confirmText,
  onConfirmTextChange,
  onConfirm,
  loading,
}: ShutdownConfirmModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth='480px' style={{ padding: '24px' }}>
        <Dialog.Title style={{ marginBottom: '12px' }}>Confirmar Desligamento da API</Dialog.Title>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          Esta ação irá desligar a API e interromper as funcionalidades do website.
          <br />
          Para confirmar, digite <strong>{keyword}</strong> abaixo.
        </Dialog.Description>

        <Box style={{ marginTop: '8px' }}>
          <TextField.Root
            placeholder={keyword || 'shutdown-XXXXXX'}
            value={confirmText}
            onChange={(e) => onConfirmTextChange(e.target.value)}
          />
        </Box>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button variant='soft' color='gray' style={{ cursor: 'pointer' }} disabled={loading}>
              Cancelar
            </Button>
          </Dialog.Close>
          <Button
            onClick={onConfirm}
            disabled={loading || confirmText.trim() !== keyword}
            style={{
              backgroundColor: 'var(--red-9)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {loading ? <>Processando...</> : 'Confirmar Desligamento'}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
