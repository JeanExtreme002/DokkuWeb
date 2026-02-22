import { Flex, Text, TextField } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

import { useAppNameValidation } from '../../../utils';

interface AppNameInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function AppNameInput({ value, onChange, disabled }: AppNameInputProps) {
  const { t } = usePageTranslation();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^a-zA-Z0-9-]/g, '');
    onChange(cleaned);
  };

  return (
    <Flex direction='column' gap='2'>
      <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
        {t('name.label')}
      </Text>
      <TextField.Root
        placeholder={t('name.placeholder')}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        style={{ fontSize: '14px', maxWidth: '400px' }}
      />
      <Text
        size='2'
        color={!useAppNameValidation(value).isValid && value.length > 0 ? 'red' : 'gray'}
      >
        {t('name.counter', { count: value.length })} {useAppNameValidation(value).message}
      </Text>
    </Flex>
  );
}
