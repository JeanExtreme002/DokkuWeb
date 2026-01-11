import { InfoCircledIcon, ReloadIcon } from '@radix-ui/react-icons';
import { Badge, Box, Button, Card, Flex, Heading, Text, Tooltip } from '@radix-ui/themes';

import styles from '../../admin.module.css';

interface SecurityConfig {
  workers_count: number;
  max_connections_per_request: number;
  reload: boolean;
  log_level: string;
  api_key: string | null;
  api_name: string | null;
  api_version_number: string | null;
  volume_dir: string | null;
  ssh_server: { hostname: string; port: number; key_path: string } | null;
  database: {
    host: string;
    port: number;
    db_name: string;
    user: string;
    password: string;
    url: string;
  } | null;
  available_databases: string[] | null;
}

interface SecurityConfigCardProps {
  config: SecurityConfig | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function SecurityConfigCard({ config, loading, error, onRefresh }: SecurityConfigCardProps) {
  return (
    <Card style={{ border: '1px solid var(--amber-6)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <Flex direction='column' gap='3' style={{ padding: '12px' }}>
        <Flex justify='between' align='center'>
          <Flex align='center' gap='3'>
            <Heading size='5' weight='medium' style={{ color: 'var(--gray-12)' }}>
              Configurações
            </Heading>
            <Tooltip content='Informações de configuração da API e servidor'>
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
            <span className={styles.refreshLabel}>{loading ? 'Atualizando...' : 'Atualizar'}</span>
          </Button>
        </Flex>
        {error && (
          <Text size='2' style={{ color: 'var(--red-11)' }}>
            {error}
          </Text>
        )}
        {config && (
          <Flex direction='column' gap='3'>
            <Box
              style={{
                backgroundColor: 'var(--gray-1)',
                border: '1px solid var(--gray-6)',
                borderRadius: 8,
                padding: 12,
              }}
            >
              <Heading size='4' style={{ color: 'var(--gray-12)', marginBottom: 8 }}>
                General
              </Heading>
              <Flex direction='column' gap='2'>
                <Text size='2'>
                  <strong>API Version: </strong>
                  {config.api_version_number ?? '—'}
                </Text>
                <Text size='2'>
                  <strong>Workers: </strong>
                  {config.workers_count}
                </Text>
                <Text size='2'>
                  <strong>Max connections per request: </strong>
                  {config.max_connections_per_request}
                </Text>
                <Text size='2'>
                  <strong>Reload: </strong>
                  {config.reload ? 'true' : 'false'}
                </Text>
                <Text size='2'>
                  <strong>Log Level: </strong>
                  {config.log_level}
                </Text>
                {config.api_key && (
                  <Text size='2'>
                    <strong>API Key: </strong>
                    <code>{config.api_key}</code>
                  </Text>
                )}
                {config.volume_dir && (
                  <Text size='2'>
                    <strong>Volume Dir: </strong>
                    <code>{config.volume_dir}</code>
                  </Text>
                )}
              </Flex>
            </Box>

            <Box
              style={{
                backgroundColor: 'var(--gray-1)',
                border: '1px solid var(--gray-6)',
                borderRadius: 8,
                padding: 12,
              }}
            >
              <Heading size='4' style={{ color: 'var(--gray-12)', marginBottom: 8 }}>
                SSH Server
              </Heading>
              {config.ssh_server ? (
                <Flex direction='column' gap='2'>
                  <Text size='2'>
                    <strong>Hostname: </strong>
                    {config.ssh_server.hostname}
                  </Text>
                  <Text size='2'>
                    <strong>Port: </strong>
                    {config.ssh_server.port}
                  </Text>
                  <Text size='2'>
                    <strong>Key Path: </strong>
                    <code>{config.ssh_server.key_path}</code>
                  </Text>
                </Flex>
              ) : (
                <Text size='2' style={{ color: 'var(--gray-11)' }}>
                  Sem informação de servidor SSH.
                </Text>
              )}
            </Box>

            <Box
              style={{
                backgroundColor: 'var(--gray-1)',
                border: '1px solid var(--gray-6)',
                borderRadius: 8,
                padding: 12,
              }}
            >
              <Heading size='4' style={{ color: 'var(--gray-12)', marginBottom: 8 }}>
                Database
              </Heading>
              {config.database ? (
                <Flex direction='column' gap='2'>
                  <Text size='2'>
                    <strong>Host: </strong>
                    {config.database.host}
                  </Text>
                  <Text size='2'>
                    <strong>Port: </strong>
                    {config.database.port}
                  </Text>
                  <Text size='2'>
                    <strong>Name: </strong>
                    {config.database.db_name}
                  </Text>
                  <Text size='2'>
                    <strong>User: </strong>
                    {config.database.user}
                  </Text>
                  <Text size='2'>
                    <strong>URI: </strong>
                    <code>{config.database.url}</code>
                  </Text>
                </Flex>
              ) : (
                <Text size='2' style={{ color: 'var(--gray-11)' }}>
                  Sem informação de banco de dados.
                </Text>
              )}
              {config.available_databases && config.available_databases.length > 0 && (
                <Box style={{ marginTop: 8 }}>
                  <Text size='2' style={{ color: 'var(--gray-11)' }}>
                    Available Services:
                  </Text>
                  <Flex wrap='wrap' gap='2' style={{ marginTop: 6 }}>
                    {config.available_databases.map((db) => (
                      <Badge key={db} size='1' variant='soft'>
                        {db}
                      </Badge>
                    ))}
                  </Flex>
                </Box>
              )}
            </Box>
          </Flex>
        )}
      </Flex>
    </Card>
  );
}
