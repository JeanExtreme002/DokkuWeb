import { InfoCircledIcon, ReloadIcon } from '@radix-ui/react-icons';
import { Badge, Box, Button, Card, Flex, Heading, Text, Tooltip } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../admin.module.css';

interface SshKeyInfo {
  file_path: string;
  directory: string;
  filename: string;
  size_bytes: number;
  permissions: string;
  owner_uid: number;
  group_gid: number;
  created_at: string;
  modified_at: string;
  accessed_at: string;
  is_readable: boolean;
  is_writable: boolean;
  is_executable: boolean;
}

interface SshKeyCardProps {
  info: SshKeyInfo | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function SshKeyCard({ info, loading, error, onRefresh }: SshKeyCardProps) {
  const { t } = usePageTranslation();
  return (
    <Card style={{ border: '1px solid var(--amber-6)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <Flex direction='column' gap='3' style={{ padding: '12px' }}>
        <Flex justify='between' align='center'>
          <Flex align='center' gap='3'>
            <Heading size='5' weight='medium' style={{ color: 'var(--gray-12)' }}>
              {t('admin.security.ssh_key.title')}
            </Heading>
            <Tooltip content={t('admin.security.ssh_key.tooltip')}>
              <InfoCircledIcon style={{ color: 'var(--gray-9)' }} />
            </Tooltip>
          </Flex>
          <Button
            onClick={onRefresh}
            disabled={loading}
            variant='outline'
            style={{ cursor: 'pointer' }}
          >
            <ReloadIcon className={loading ? styles.buttonSpinner : ''} />
            <span className={styles.refreshLabel}>
              {loading
                ? t('admin.security.refresh.label_loading')
                : t('admin.security.refresh.label')}
            </span>
          </Button>
        </Flex>
        {error && (
          <Text size='2' style={{ color: 'var(--red-11)' }}>
            {error}
          </Text>
        )}
        {info && (
          <Box
            style={{
              backgroundColor: 'var(--gray-1)',
              border: '1px solid var(--gray-6)',
              borderRadius: 8,
              padding: 12,
            }}
          >
            <Flex direction='column' gap='2'>
              <Text size='2'>
                <strong>File: </strong>
                <code>{info.file_path}</code>
              </Text>
              <Text size='2'>
                <strong>Path: </strong>
                <code>{info.directory}</code>
              </Text>
              <Text size='2'>
                <strong>Name: </strong>
                {info.filename}
              </Text>
              <Text size='2'>
                <strong>Size: </strong>
                {info.size_bytes} bytes
              </Text>
              <Text size='2'>
                <strong>Permissions: </strong>
                {info.permissions}
              </Text>
              <Text size='2'>
                <strong>Owner UID: </strong>
                {info.owner_uid}
              </Text>
              <Text size='2'>
                <strong>Group GID: </strong>
                {info.group_gid}
              </Text>
              <Text size='2'>
                <strong>Created at: </strong>
                {new Date(info.created_at).toLocaleString()}
              </Text>
              <Text size='2'>
                <strong>Modified at: </strong>
                {new Date(info.modified_at).toLocaleString()}
              </Text>
              <Text size='2'>
                <strong>Accessed at: </strong>
                {new Date(info.accessed_at).toLocaleString()}
              </Text>
              <Flex gap='2' style={{ marginTop: 6 }} className={styles.sshKeyBadges}>
                <Badge size='1' variant='soft' color={info.is_readable ? 'green' : 'red'}>
                  {info.is_readable ? 'readable' : 'not readable'}
                </Badge>
                <Badge size='1' variant='soft' color={info.is_writable ? 'green' : 'red'}>
                  {info.is_writable ? 'writable' : 'not writable'}
                </Badge>
                <Badge size='1' variant='soft' color={info.is_executable ? 'green' : 'red'}>
                  {info.is_executable ? 'executable' : 'not executable'}
                </Badge>
              </Flex>
            </Flex>
          </Box>
        )}
      </Flex>
    </Card>
  );
}
