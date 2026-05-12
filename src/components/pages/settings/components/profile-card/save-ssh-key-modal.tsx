import { ReloadIcon, UploadIcon } from '@radix-ui/react-icons';
import { Box, Button, Dialog, Flex, Separator, Text, TextArea } from '@radix-ui/themes';
import { useEffect, useState } from 'react';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../settings.module.css';

interface SaveSSHKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFile: () => void;
  onSubmitText: (rawKey: string) => void | Promise<void>;
  isSaving: boolean;
  isRegistered: boolean;
  errorMessage?: string | null;
  errorDetail?: string | null;
}

export function SaveSSHKeyModal({
  open,
  onOpenChange,
  onSelectFile,
  onSubmitText,
  isSaving,
  isRegistered,
  errorMessage,
  errorDetail,
}: SaveSSHKeyModalProps) {
  const { t } = usePageTranslation();
  const [text, setText] = useState('');

  useEffect(() => {
    if (!open) setText('');
  }, [open]);

  useEffect(() => {
    if (isRegistered && open) onOpenChange(false);
  }, [isRegistered, open, onOpenChange]);

  const trimmed = text.trim();
  const canSubmit = !!trimmed && !isSaving;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmitText(trimmed);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (isSaving && !nextOpen) return;
        onOpenChange(nextOpen);
      }}
    >
      <Dialog.Content maxWidth='500px'>
        <Dialog.Title>{t('profile.ssh.modal.title')}</Dialog.Title>
        <Dialog.Description size='2' style={{ color: 'var(--gray-11)' }}>
          {t('profile.ssh.modal.description')}
        </Dialog.Description>

        <Box mt='4'>
          <Text
            as='label'
            size='2'
            weight='medium'
            style={{ color: 'var(--gray-12)', display: 'block', marginBottom: '6px' }}
          >
            {t('profile.ssh.modal.pasteLabel')}
          </Text>
          <TextArea
            color='orange'
            placeholder={t('profile.ssh.modal.placeholder')}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSaving}
            rows={6}
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              minHeight: '120px',
              resize: 'vertical',
            }}
          />
          <Button
            color='orange'
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{ cursor: 'pointer', marginTop: '10px', width: '100%' }}
          >
            {isSaving ? (
              <>
                <ReloadIcon className={styles.buttonSpinner} />
                {t('profile.ssh.modal.saving')}
              </>
            ) : (
              t('profile.ssh.modal.save')
            )}
          </Button>
        </Box>

        <Flex align='center' gap='3' style={{ margin: '18px 0' }}>
          <Separator size='4' style={{ flex: 1 }} />
          <Text size='1' style={{ color: 'var(--gray-9)', textTransform: 'uppercase' }}>
            {t('profile.ssh.modal.or')}
          </Text>
          <Separator size='4' style={{ flex: 1 }} />
        </Flex>

        <Button
          color='orange'
          variant='outline'
          onClick={onSelectFile}
          disabled={isSaving}
          style={{ width: '100%', cursor: 'pointer' }}
        >
          <UploadIcon />
          {t('profile.ssh.modal.selectFile')}
        </Button>

        {errorMessage && (
          <Box style={{ marginTop: '12px' }}>
            <Text size='2' color='red' style={{ display: 'block' }}>
              {errorMessage}
            </Text>
            {errorDetail && (
              <pre
                style={{
                  marginTop: '8px',
                  marginBottom: 0,
                  padding: '8px 12px',
                  background: 'var(--gray-3)',
                  border: '1px solid var(--gray-5)',
                  borderRadius: 'var(--radius-2)',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: 'var(--gray-12)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflowX: 'auto',
                }}
              >
                {errorDetail}
              </pre>
            )}
          </Box>
        )}

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button variant='soft' color='gray' style={{ cursor: 'pointer' }} disabled={isSaving}>
              {t('profile.ssh.modal.cancel')}
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
