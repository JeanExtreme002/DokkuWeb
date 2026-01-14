import { ReloadIcon } from '@radix-ui/react-icons';
import { Box, Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

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
  const { t } = usePageTranslation();
  const tokenPrefix = t('services.s.deleteModal.tokenPrefix');
  const token = `${tokenPrefix}-${displayName}`;
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: '480px' }}>
        <Dialog.Title>{t('services.s.deleteModal.title')}</Dialog.Title>
        <Dialog.Description style={{ marginBottom: '16px', color: 'var(--gray-11)' }}>
          {t('services.s.deleteModal.description.prefix')} {serviceType} {'"'}
          <strong>{displayName}</strong>
          {'"'}
          {t('services.s.deleteModal.description.suffix')}
          <br />
          <br />
          {t('services.s.deleteModal.description.note')}
        </Dialog.Description>

        <Box style={{ marginTop: '8px' }}>
          <Text size='2' style={{ color: 'var(--gray-11)', marginBottom: '8px', display: 'block' }}>
            {t('services.s.deleteModal.prompt.prefix')} <strong>{token}</strong>{' '}
            {t('services.s.deleteModal.prompt.suffix')}
          </Text>
          <TextField.Root
            placeholder={token}
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
              {t('services.s.deleteModal.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            onClick={onConfirm}
            disabled={deleteLoading || deleteConfirmText.trim() !== token}
            style={{
              backgroundColor: 'var(--red-9)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {deleteLoading ? (
              <>
                <ReloadIcon className={styles.buttonSpinner} />{' '}
                {t('services.s.deleteModal.confirming')}
              </>
            ) : (
              t('services.s.deleteModal.confirm')
            )}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
