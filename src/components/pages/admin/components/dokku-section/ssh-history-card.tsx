import { InfoCircledIcon, ReloadIcon } from '@radix-ui/react-icons';
import { Box, Button, Card, Flex, Heading, Text, Tooltip } from '@radix-ui/themes';
import { useEffect, useRef } from 'react';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../admin.module.css';

interface SshHistoryCardProps {
  history: string[] | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function SshHistoryCard({ history, loading, error, onRefresh }: SshHistoryCardProps) {
  const { t } = usePageTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (history && history.length > 0) {
      el.scrollTop = el.scrollHeight;
    }
  }, [history]);

  return (
    <Card style={{ border: '1px solid var(--amber-6)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <Flex direction='column' gap='3' style={{ padding: '12px' }}>
        <Flex justify='between' align='center' className={styles.sshHeader}>
          <Flex align='center' gap='3'>
            <Heading size='5' weight='medium' style={{ color: 'var(--gray-12)' }}>
              {t('admin.dokku.ssh_history.title')}
            </Heading>
            <Tooltip content={t('admin.dokku.ssh_history.tooltip')}>
              <InfoCircledIcon style={{ color: 'var(--gray-9)' }} />
            </Tooltip>
          </Flex>
          <Button
            className={styles.sshUpdateButton}
            onClick={onRefresh}
            disabled={loading}
            variant='outline'
          >
            <ReloadIcon className={loading ? styles.buttonSpinner : ''} />
            {loading
              ? t('admin.dokku.ssh_history.refresh.loading')
              : t('admin.dokku.ssh_history.refresh.label')}
          </Button>
        </Flex>
        {error && (
          <Text size='2' style={{ color: 'var(--red-11)' }}>
            {error}
          </Text>
        )}
        <Box
          ref={containerRef}
          style={{
            backgroundColor: 'var(--gray-1)',
            border: '1px solid var(--gray-6)',
            borderRadius: 8,
            padding: 12,
            maxHeight: 280,
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: 12,
          }}
        >
          {history && history.length > 0 ? (
            <ul style={{ paddingLeft: 16, margin: 0 }}>
              {history.map((line, idx) => (
                <li key={idx} style={{ marginBottom: 4 }}>
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <Text size='2' style={{ color: 'var(--gray-11)' }}>
              {loading
                ? t('admin.dokku.ssh_history.empty.loading')
                : t('admin.dokku.ssh_history.empty.no_history')}
            </Text>
          )}
        </Box>
      </Flex>
    </Card>
  );
}
