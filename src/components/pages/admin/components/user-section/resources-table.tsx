import { Box, Flex, Text } from '@radix-ui/themes';

import styles from '../../admin.module.css';

export interface ResourceItem {
  name: string;
  user_email: string;
  created_at: string;
}

interface ResourcesTableProps {
  typeLabel: 'Aplicativo' | 'Serviço' | 'Rede';
  resources: ResourceItem[];
  loading: boolean;
  error: string | null;
}

export function ResourcesTable({ typeLabel, resources, loading, error }: ResourcesTableProps) {
  return (
    <Box className={styles.resourcesTableWrapper}>
      {error && (
        <Text size='2' style={{ color: 'var(--red-11)' }}>
          {error}
        </Text>
      )}
      {loading ? (
        <Flex align='center' gap='2' style={{ padding: '8px' }}>
          <Box className={styles.pluginsLoadingSpinner} aria-hidden='true' />
          <Text size='2' style={{ color: 'var(--gray-11)' }}>
            Carregando recursos...
          </Text>
        </Flex>
      ) : (
        <table className={styles.pluginsTable}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Criado em</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((r, idx) => (
              <tr key={`${r.user_email}-${r.name}-${idx}`}>
                <td data-label='Email'>{r.user_email}</td>
                <td data-label='Nome'>{r.name}</td>
                <td data-label='Tipo'>{typeLabel}</td>
                <td data-label='Criado em'>{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {resources.length === 0 && !loading && !error && (
              <tr>
                <td colSpan={4}>
                  <Text size='2' style={{ color: 'var(--gray-11)' }}>
                    Nenhum recurso encontrado.
                  </Text>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </Box>
  );
}
