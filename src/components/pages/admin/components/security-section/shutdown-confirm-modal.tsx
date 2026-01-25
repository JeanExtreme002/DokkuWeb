import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Box, Button, Dialog, Flex, Spinner, TextField } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

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
  const { t } = usePageTranslation();
  const description = t('admin.security.shutdown.modal.description', { keyword });
  const descriptionParts = description.split('\n');
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth='480px' style={{ padding: '24px' }}>
        <Dialog.Title style={{ marginBottom: '12px' }}>
          {t('admin.security.shutdown.modal.title')}
        </Dialog.Title>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          {descriptionParts.map((part, idx) => {
            if (keyword && part.includes(keyword)) {
              const [before, after] = part.split(keyword);
              return (
                <span key={idx}>
                  {before}
                  <strong>{keyword}</strong>
                  {after}
                  {idx < descriptionParts.length - 1 ? <br /> : null}
                </span>
              );
            }
            return (
              <span key={idx}>
                {part}
                {idx < descriptionParts.length - 1 ? <br /> : null}
              </span>
            );
          })}
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
              {t('admin.security.shutdown.modal.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            color='red'
            onClick={onConfirm}
            disabled={loading || confirmText.trim() !== keyword}
            style={{
              cursor: 'pointer',
            }}
          >
            {loading ? (
              <>
                <Spinner />
                {t('admin.security.shutdown.modal.confirm_loading')}
              </>
            ) : (
              <>
                <ExclamationTriangleIcon />
                {t('admin.security.shutdown.modal.confirm')}
              </>
            )}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
