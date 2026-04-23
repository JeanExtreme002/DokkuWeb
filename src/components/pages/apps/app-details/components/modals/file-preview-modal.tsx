import { DownloadIcon } from '@radix-ui/react-icons';
import { Box, Button, Dialog, Flex, Text } from '@radix-ui/themes';
import React from 'react';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../app-details.module.css';
import { formatSize } from '../../helpers';

interface FilePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filename: string;
  fileSize: number;
  content: string | null;
  loading: boolean;
  error: string | null;
  onDownload: () => void;
}

export default function FilePreviewModal(props: FilePreviewModalProps) {
  const { open, onOpenChange, filename, fileSize, content, loading, error, onDownload } = props;
  const { t } = usePageTranslation();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: '800px', width: '90vw' }}>
        <Flex align='center' justify='between' gap='3' mb='3'>
          <Dialog.Title className={styles.filePreviewTitle} style={{ margin: 0 }}>
            {filename}
          </Dialog.Title>
          <Text size='1' style={{ color: 'var(--gray-10)', flexShrink: 0 }}>
            {formatSize(fileSize)}
          </Text>
        </Flex>

        {loading ? (
          <Box className={styles.loadingSpinner}>
            <Box className={styles.spinner} />
            <Text style={{ marginLeft: '12px' }}>{t('filesSection.preview.loading')}</Text>
          </Box>
        ) : error ? (
          <Text size='3' color='red'>
            {error}
          </Text>
        ) : (
          <Box
            style={{
              overflow: 'auto',
              maxHeight: '60vh',
              background: 'var(--gray-2)',
              border: '1px solid var(--gray-6)',
              borderRadius: '6px',
              padding: '12px',
            }}
          >
            <table
              style={{ borderCollapse: 'collapse', width: '100%' }}
              className={styles.filePreviewContent}
            >
              <tbody>
                {(content ?? '').split('\n').map((line, index) => (
                  <tr key={index}>
                    <td
                      style={{
                        userSelect: 'none',
                        textAlign: 'right',
                        paddingRight: '16px',
                        color: 'var(--gray-9)',
                        minWidth: '40px',
                        verticalAlign: 'top',
                      }}
                    >
                      {index + 1}
                    </td>
                    <td style={{ whiteSpace: 'pre', width: '100%' }}>{line}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button variant='soft' color='gray' style={{ cursor: 'pointer' }}>
              {t('modals.common.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            style={{ cursor: 'pointer' }}
            onClick={() => {
              onDownload();
              onOpenChange(false);
            }}
            disabled={loading || !!error}
          >
            <DownloadIcon />
            {t('filesSection.preview.download')}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
