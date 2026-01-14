import { Box, Select, Text } from '@radix-ui/themes';
import { useEffect, useState } from 'react';

import { usePageTranslation } from '@/i18n/utils';
import { api } from '@/lib';

interface NetworksData {
  [networkName: string]: object;
}

interface NetworkSelectionProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function NetworkSelection({ value, onChange, disabled }: NetworkSelectionProps) {
  const { t } = usePageTranslation();
  const [networks, setNetworks] = useState<NetworksData>({});
  const [networksLoading, setNetworksLoading] = useState(true);

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        setNetworksLoading(true);
        const response = await api.post('/api/networks/list/');
        if (response.status === 200 && response.data.success) {
          setNetworks(response.data.result);
        }
      } catch (error) {
        console.error('Error fetching networks:', error);
      } finally {
        setNetworksLoading(false);
      }
    };

    fetchNetworks();
  }, []);

  const networksList = Object.keys(networks);

  return (
    <>
      <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
        {t('network.label')}
      </Text>
      {networksLoading ? (
        <Box style={{ padding: '12px' }}>
          <Text size='2' color='gray' style={{ fontStyle: 'italic' }}>
            {t('network.loading')}
          </Text>
        </Box>
      ) : (
        <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
          <Select.Trigger
            placeholder={t('network.placeholder')}
            style={{ maxWidth: '300px', cursor: 'pointer' }}
          />
          <Select.Content>
            <Select.Item value='none' style={{ cursor: 'pointer' }}>
              {t('network.none')}
            </Select.Item>
            {networksList.map((networkName) => (
              <Select.Item key={networkName} value={networkName} style={{ cursor: 'pointer' }}>
                {networkName}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      )}
    </>
  );
}
