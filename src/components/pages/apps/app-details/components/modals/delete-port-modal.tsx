import { Button, Dialog, Flex } from '@radix-ui/themes';
import React from 'react';

interface PortMapping {
  protocol: string;
  origin: number | string;
  dest: number | string;
}

interface DeletePortModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portToDelete: PortMapping | null;
  deletingPort: string | null | undefined;
  removePortMapping: () => void;
}

export default function DeletePortModal(props: DeletePortModalProps) {
  const { open, onOpenChange, portToDelete, deletingPort, removePortMapping } = props;

  const mappingId = portToDelete
    ? `${portToDelete.protocol}-${portToDelete.origin}-${portToDelete.dest}`
    : '';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth='450px' style={{ padding: '24px' }}>
        <Dialog.Title style={{ marginBottom: '12px' }}>Confirmar Remoção</Dialog.Title>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          Tem certeza que deseja remover o mapeamento de porta{' '}
          <strong>
            {portToDelete?.protocol.toUpperCase()}: {portToDelete?.origin} → {portToDelete?.dest}
          </strong>
          ?
          <br />
          <br />
          Esta ação não pode ser desfeita e pode afetar o acesso ao aplicativo.
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button variant='soft' color='gray' style={{ cursor: 'pointer' }}>
              Cancelar
            </Button>
          </Dialog.Close>
          <Button
            color='red'
            onClick={removePortMapping}
            disabled={!!portToDelete && deletingPort === mappingId}
            style={{ backgroundColor: 'var(--red-9)', color: 'white', cursor: 'pointer' }}
          >
            {portToDelete && deletingPort === mappingId ? 'Removendo...' : 'Confirmar Remoção'}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
