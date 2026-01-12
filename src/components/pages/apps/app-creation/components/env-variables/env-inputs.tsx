import { PlusIcon } from '@radix-ui/react-icons';
import { Box, Button, Flex, Text, TextField } from '@radix-ui/themes';
import React, { useState } from 'react';

import styles from '../../app-creation.module.css';

interface EnvInputsProps {
  onAdd: (key: string, value: string) => void;
  disabled?: boolean;
  isMobile?: boolean;
}

export function EnvInputs({ onAdd, disabled, isMobile }: EnvInputsProps) {
  const [currentEnvKey, setCurrentEnvKey] = useState('');
  const [currentEnvValue, setCurrentEnvValue] = useState('');

  const addEnvironmentVariable = () => {
    if (!currentEnvKey.trim() || !currentEnvValue.trim()) return;
    onAdd(currentEnvKey.trim(), currentEnvValue.trim());
    setCurrentEnvKey('');
    setCurrentEnvValue('');
  };

  return (
    <Flex gap='2' align='end' className={styles.envInputsContainer}>
      <Box style={{ width: '200px' }}>
        <Text size='2' color='gray' style={{ marginBottom: '4px' }}>
          Chave
        </Text>
        <TextField.Root
          placeholder='NOME_VARIAVEL'
          value={currentEnvKey}
          onChange={(e) => {
            const value = e.target.value.replace(/\s/g, '');
            setCurrentEnvKey(value);
          }}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addEnvironmentVariable();
            }
          }}
        />
      </Box>
      <Box style={{ width: '250px' }}>
        <Text size='2' color='gray' style={{ marginBottom: '4px' }}>
          Valor
        </Text>
        <TextField.Root
          placeholder='valor_da_variavel'
          value={currentEnvValue}
          onChange={(e) => setCurrentEnvValue(e.target.value)}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addEnvironmentVariable();
            }
          }}
        />
      </Box>
      <Box>
        <div style={{ marginBottom: '4px', height: '14px' }}></div>
        <Button
          size='2'
          variant='surface'
          onClick={addEnvironmentVariable}
          disabled={!currentEnvKey.trim() || !currentEnvValue.trim() || !!disabled}
          style={{
            minWidth: isMobile ? '100%' : '44px',
            height: '32px',
            cursor: 'pointer',
            padding: isMobile ? '8px 16px' : '8px',
          }}
        >
          {isMobile ? (
            <Flex align='center' gap='2'>
              <PlusIcon />
              <Text size='2'>Adicionar Variável</Text>
            </Flex>
          ) : (
            <PlusIcon />
          )}
        </Button>
      </Box>
    </Flex>
  );
}
