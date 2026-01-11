import { ReloadIcon, TrashIcon } from '@radix-ui/react-icons';
import { Button, Dialog, Flex, Text } from '@radix-ui/themes';

import styles from '../../service-details.module.css';

interface UnlinkAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appName: string | null;
  unlinkLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function UnlinkAppModal({
  open,
  onOpenChange,
  appName,
  unlinkLoading,
  onCancel,
  onConfirm,
}: UnlinkAppModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>Confirmar Desvinculação</Dialog.Title>
        <Dialog.Description style={{ marginTop: '12px', marginBottom: '20px' }}>
          Tem certeza que deseja desvincular a aplicação{' '}
          <Text weight='medium' style={{ color: 'var(--gray-12)' }}>
            {appName?.replace(/^\d+-/, '')}
          </Text>{' '}
          deste serviço? Esta ação não pode ser desfeita.
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button variant='soft' color='gray' style={{ cursor: 'pointer' }} onClick={onCancel}>
              Cancelar
            </Button>
          </Dialog.Close>
          <Button
            variant='solid'
            color='red'
            style={{ cursor: 'pointer' }}
            onClick={onConfirm}
            disabled={unlinkLoading}
          >
            {unlinkLoading ? <ReloadIcon className={styles.buttonSpinner} /> : <TrashIcon />}
            {unlinkLoading ? 'Desvinculando...' : 'Desvincular'}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
