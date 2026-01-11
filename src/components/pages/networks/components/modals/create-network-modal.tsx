import { AlertDialog, Box, Button, Flex, Spinner, Text } from '@radix-ui/themes';

interface CreateNetworkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newNetworkName: string;
  setNewNetworkName: (value: string) => void;
  creatingNetwork: boolean;
  createNetworkError: string | null;
  onSubmit: () => void;
}

export function CreateNetworkModal({
  open,
  onOpenChange,
  newNetworkName,
  setNewNetworkName,
  creatingNetwork,
  createNetworkError,
  onSubmit,
}: CreateNetworkModalProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Content style={{ maxWidth: '450px' }}>
        <AlertDialog.Title>Criar Nova Rede</AlertDialog.Title>
        <AlertDialog.Description size='2'>
          Digite um nome para a nova rede que será criada.
        </AlertDialog.Description>

        <Box mt='4'>
          <input
            type='text'
            placeholder='Nome da rede'
            value={newNetworkName}
            onChange={(e) => setNewNetworkName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newNetworkName.trim() && !creatingNetwork) {
                onSubmit();
              }
            }}
            disabled={creatingNetwork}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--gray-6)',
              borderRadius: '8px',
              background: creatingNetwork ? 'var(--gray-3)' : 'var(--color-surface)',
              color: creatingNetwork ? 'var(--gray-9)' : 'var(--gray-12)',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
              cursor: creatingNetwork ? 'not-allowed' : 'text',
            }}
          />

          {createNetworkError && (
            <Text size='2' color='red' style={{ marginTop: '8px', display: 'block' }}>
              {createNetworkError}
            </Text>
          )}
        </Box>

        <Flex gap='3' mt='4' justify='end'>
          <AlertDialog.Cancel>
            <Button variant='soft' color='gray' style={{ cursor: 'pointer' }}>
              Cancelar
            </Button>
          </AlertDialog.Cancel>
          <Button
            variant='solid'
            color='green'
            style={{ cursor: 'pointer' }}
            onClick={onSubmit}
            disabled={!newNetworkName.trim() || creatingNetwork}
          >
            {creatingNetwork ? <Spinner size='2' /> : 'Criar Rede'}
          </Button>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
