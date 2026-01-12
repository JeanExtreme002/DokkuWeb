import { Flex, Text, TextField } from '@radix-ui/themes';
import React from 'react';

interface ValidationResult {
  isValid: boolean;
  message: string;
}

interface ServiceNameFieldProps {
  serviceName: string;
  onChange: (value: string) => void;
  creating: boolean;
  validateServiceName: (name: string) => ValidationResult;
}

export function ServiceNameField(props: ServiceNameFieldProps) {
  const { serviceName, onChange, creating, validateServiceName } = props;

  return (
    <Flex direction='column' gap='2'>
      <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
        Nome do Serviço
      </Text>
      <TextField.Root
        placeholder='Digite o nome do serviço'
        value={serviceName}
        onChange={(e) => {
          // Allow letters (uppercase and lowercase), numbers, and "_"
          const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
          onChange(value);
        }}
        disabled={creating}
        style={{
          fontSize: '14px',
          maxWidth: '400px',
        }}
      />
      <Text
        size='2'
        color={!validateServiceName(serviceName).isValid && serviceName.length > 0 ? 'red' : 'gray'}
      >
        {serviceName.length}/50 caracteres {validateServiceName(serviceName).message}
      </Text>
    </Flex>
  );
}
