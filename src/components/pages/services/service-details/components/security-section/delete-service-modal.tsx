import { ReloadIcon } from '@radix-ui/react-icons';
import { Box, Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes';

import styles from '../../service-details.module.css';

interface DeleteServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceType: string;
  displayName: string;
  deleteConfirmText: string;
  onDeleteConfirmTextChange: (value: string) => void;
  deleteLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteServiceModal({
  open,
  onOpenChange,
  serviceType,
  displayName,
  deleteConfirmText,
  onDeleteConfirmTextChange,
  deleteLoading,
  onCancel,
  onConfirm,
}: DeleteServiceModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: '480px' }}>
        <Dialog.Title>Confirmar Exclusão</Dialog.Title>
        <Dialog.Description style={{ marginBottom: '16px', color: 'var(--gray-11)' }}>
          Tem certeza que deseja prosseguir com a exclusão do serviço {serviceType} {'"'}
          <strong>{displayName}</strong>
          {'"'}?
          <br />
          <br />
          Esta ação não pode ser desfeita.
        </Dialog.Description>

        <Box style={{ marginTop: '8px' }}>
          <Text size='2' style={{ color: 'var(--gray-11)', marginBottom: '8px', display: 'block' }}>
            Para confirmar, digite <strong>{`deletar-${displayName}`}</strong> abaixo:
          </Text>
          <TextField.Root
            placeholder={`deletar-${displayName}`}
            value={deleteConfirmText}
            onChange={(e) => onDeleteConfirmTextChange(e.target.value)}
          />
        </Box>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button
              variant='soft'
              color='gray'
              style={{ cursor: 'pointer' }}
              disabled={deleteLoading}
              onClick={onCancel}
            >
              Cancelar
            </Button>
          </Dialog.Close>
          <Button
            onClick={onConfirm}
            disabled={deleteLoading || deleteConfirmText.trim() !== `deletar-${displayName}`}
            style={{
              backgroundColor: 'var(--red-9)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {deleteLoading ? (
              <>
                <ReloadIcon className={styles.buttonSpinner} /> Deletando...
              </>
            ) : (
              'Confirmar Exclusão'
            )}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
