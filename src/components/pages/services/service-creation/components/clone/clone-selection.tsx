import { Flex, Select, Text } from '@radix-ui/themes';
import { useEffect, useState } from 'react';

import { usePageTranslation } from '@/i18n/utils';
import { api } from '@/lib';

interface ServicesData {
  [serviceName: string]: object;
}

interface CloneSelectionProps {
  selectedDatabaseType: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CloneSelection({
  selectedDatabaseType,
  value,
  onChange,
  disabled,
}: CloneSelectionProps) {
  const { t } = usePageTranslation();
  const [services, setServices] = useState<ServicesData>({});

  useEffect(() => {
    const fetchServices = async () => {
      onChange('none');

      try {
        const response = await api.post(
          `/api/databases/${selectedDatabaseType}/list/`,
          {},
          { params: { return_info: false } }
        );
        if (response.status === 200 && response.data.success) {
          setServices(response.data.result);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
      }
    };
    if (selectedDatabaseType) {
      fetchServices();
    }
  }, [selectedDatabaseType, onChange]);

  const servicesList = Object.keys(services);

  return (
    <Flex direction='column' gap='2'>
      <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
        {t('clone.label')}
      </Text>
      <Select.Root
        value={value}
        onValueChange={onChange}
        disabled={disabled || !selectedDatabaseType}
      >
        <Select.Trigger
          placeholder={t('clone.placeholder')}
          style={{ maxWidth: '300px', cursor: 'pointer' }}
        />
        <Select.Content>
          <Select.Item value='none' style={{ cursor: 'pointer' }}>
            {selectedDatabaseType ? t('clone.none') : t('clone.noServiceType')}
          </Select.Item>
          {servicesList.map((serviceName) => (
            <Select.Item key={serviceName} value={serviceName} style={{ cursor: 'pointer' }}>
              {serviceName}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Flex>
  );
}
