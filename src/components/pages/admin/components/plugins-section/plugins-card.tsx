import { InfoCircledIcon, ReloadIcon } from '@radix-ui/react-icons';
import { Badge, Box, Button, Card, Flex, Heading, Text, Tooltip } from '@radix-ui/themes';

import styles from '../../admin.module.css';

interface PluginInfo {
  version: string;
  status: string;
  description: string;
}

interface PluginsCardProps {
  plugins: Array<{ name: string } & PluginInfo>;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function PluginsCard({ plugins, loading, error, onRefresh }: PluginsCardProps) {
  return (
    <Card
      style={{
        border: '1px solid var(--amber-6)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        marginTop: '12px',
      }}
    >
      <Flex direction='column' gap='3' style={{ padding: '12px' }}>
        <Flex justify='between' align='center' className={styles.pluginsHeader}>
          <Flex align='center' gap='3'>
            <Heading size='5' weight='medium' style={{ color: 'var(--gray-12)' }}>
              Plugins
            </Heading>
            <Tooltip content='Lista de plugins instalados no Dokku'>
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
        {loading ? (
          <Flex align='center' gap='2' style={{ padding: '8px' }}>
            <Box className={styles.pluginsLoadingSpinner} aria-hidden='true' />
            <Text size='2' style={{ color: 'var(--gray-11)' }}>
              Carregando plugins...
            </Text>
          </Flex>
        ) : (
          <Box className={styles.pluginsTableWrapper}>
            <table className={styles.pluginsTable}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Versão</th>
                  <th>Status</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                {plugins.map((p) => (
                  <tr key={p.name}>
                    <td data-label='Nome'>{p.name}</td>
                    <td data-label='Versão'>{p.version}</td>
                    <td data-label='Status'>
                      <Badge
                        size='1'
                        className={
                          p.status === 'enabled' ? styles.statusEnabled : styles.statusDisabled
                        }
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td data-label='Descrição'>{p.description}</td>
                  </tr>
                ))}
                {plugins.length === 0 && !loading && !error && (
                  <tr>
                    <td colSpan={4}>
                      <Text size='2' style={{ color: 'var(--gray-11)' }}>
                        Nenhum plugin listado.
                      </Text>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        )}
      </Flex>
    </Card>
  );
}
