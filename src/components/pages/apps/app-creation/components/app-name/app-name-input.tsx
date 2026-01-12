import { Flex, Text, TextField } from '@radix-ui/themes';

import { validateAppName } from '../../utils';

interface AppNameInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function AppNameInput({ value, onChange, disabled }: AppNameInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^a-zA-Z0-9-]/g, '');
    onChange(cleaned);
  };

  return (
    <Flex direction='column' gap='2'>
      <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
        Nome do Aplicativo
      </Text>
      <TextField.Root
        placeholder='Digite o nome do aplicativo'
        value={value}
        onChange={handleChange}
        disabled={disabled}
        style={{ fontSize: '14px', maxWidth: '400px' }}
      />
      <Text size='2' color={!validateAppName(value).isValid && value.length > 0 ? 'red' : 'gray'}>
        {value.length}/50 caracteres {validateAppName(value).message}
      </Text>
    </Flex>
  );
}
