import { DownloadIcon, ReloadIcon } from '@radix-ui/react-icons';
import { Box, Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../service-details.module.css';

interface ExportDatabaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportConfirmText: string;
  onExportConfirmTextChange: (value: string) => void;
  exportLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ExportDatabaseModal({
  open,
  onOpenChange,
  exportConfirmText,
  onExportConfirmTextChange,
  exportLoading,
  onCancel,
  onConfirm,
}: ExportDatabaseModalProps) {
  const { t } = usePageTranslation();
  const token = t('services.s.exportModal.token');

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: '480px' }}>
        <Dialog.Title>{t('services.s.exportModal.title')}</Dialog.Title>
        <Dialog.Description style={{ marginBottom: '16px', color: 'var(--gray-11)' }}>
          {t('services.s.exportModal.description')}
        </Dialog.Description>

        <Box style={{ marginTop: '8px' }}>
          <Text size='2' style={{ color: 'var(--gray-11)', marginBottom: '8px', display: 'block' }}>
            {t('services.s.exportModal.prompt.prefix')} <strong>{token}</strong>{' '}
            {t('services.s.exportModal.prompt.suffix')}
          </Text>
          <TextField.Root
            placeholder={token}
            value={exportConfirmText}
            onChange={(e) => onExportConfirmTextChange(e.target.value)}
          />
        </Box>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button
              variant='soft'
              color='gray'
              style={{ cursor: 'pointer' }}
              disabled={exportLoading}
              onClick={onCancel}
            >
              {t('services.s.exportModal.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            onClick={onConfirm}
            disabled={exportLoading || exportConfirmText.trim() !== token}
            style={{ cursor: 'pointer' }}
            color='red'
          >
            {exportLoading ? (
              <>
                <ReloadIcon className={styles.buttonSpinner} />{' '}
                {t('services.s.exportModal.confirming')}
              </>
            ) : (
              <>
                <DownloadIcon />
                {t('services.s.exportModal.confirm')}
              </>
            )}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
