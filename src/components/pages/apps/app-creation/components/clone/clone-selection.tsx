import { Box, Flex, Select, Text } from '@radix-ui/themes';
import { useEffect, useState } from 'react';

import { usePageTranslation } from '@/i18n/utils';
import { api } from '@/lib';

import styles from '../../app-creation.module.css';

interface AppsData {
  [appName: string]: object;
}

interface CloneSelectionProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CloneSelection({ value, onChange, disabled }: CloneSelectionProps) {
  const { t } = usePageTranslation();
  const [apps, setApps] = useState<AppsData>({});
  const [appsLoading, setAppsLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setAppsLoading(true);
        const response = await api.post('/api/apps/list', {}, { params: { return_info: false } });
        if (response.status === 200 && response.data.success) {
          setApps(response.data.result);
        }
      } catch (error) {
        console.error('Error fetching apps:', error);
      } finally {
        setAppsLoading(false);
      }
    };

    fetchApps();
  }, []);

  const appsList = Object.keys(apps);

  return (
    <Flex direction='column' gap='2' className={styles.cloneSelection}>
      <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
        {t('clone.label')}
      </Text>
      {appsLoading ? (
        <Box style={{ padding: '12px' }}>
          <Text size='2' color='gray' style={{ fontStyle: 'italic' }}>
            {t('clone.loading')}
          </Text>
        </Box>
      ) : (
        <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
          <Select.Trigger
            placeholder={t('clone.placeholder')}
            style={{ maxWidth: '300px', cursor: 'pointer' }}
          />
          <Select.Content>
            <Select.Item value='none' style={{ cursor: 'pointer' }}>
              {t('clone.none')}
            </Select.Item>
            {appsList.map((appName) => (
              <Select.Item key={appName} value={appName} style={{ cursor: 'pointer' }}>
                {appName}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      )}
    </Flex>
  );
}
