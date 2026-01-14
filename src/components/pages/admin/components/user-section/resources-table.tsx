import { Box, Flex, Text } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../admin.module.css';

export interface ResourceItem {
  name: string;
  user_email: string;
  created_at: string;
}

interface ResourcesTableProps {
  typeLabel: string;
  resources: ResourceItem[];
  loading: boolean;
  error: string | null;
}

export function ResourcesTable({ typeLabel, resources, loading, error }: ResourcesTableProps) {
  const { t } = usePageTranslation();
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
            {t('admin.resources.table.loading')}
          </Text>
        </Flex>
      ) : (
        <table className={styles.pluginsTable}>
          <thead>
            <tr>
              <th>{t('admin.resources.table.columns.email')}</th>
              <th>{t('admin.resources.table.columns.name')}</th>
              <th>{t('admin.resources.table.columns.type')}</th>
              <th>{t('admin.resources.table.columns.created_at')}</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((r, idx) => (
              <tr key={`${r.user_email}-${r.name}-${idx}`}>
                <td data-label='enail'>{r.user_email}</td>
                <td data-label='name'>{r.name}</td>
                <td data-label='type'>{typeLabel}</td>
                <td data-label='created_at'>{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {resources.length === 0 && !loading && !error && (
              <tr>
                <td colSpan={4}>
                  <Text size='2' style={{ color: 'var(--gray-11)' }}>
                    {t('admin.resources.table.empty')}
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
