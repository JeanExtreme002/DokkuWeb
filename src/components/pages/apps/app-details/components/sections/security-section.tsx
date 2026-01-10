import { InfoCircledIcon, TrashIcon } from '@radix-ui/react-icons';
import { Box, Button, Card, Flex, Heading, Text, TextField, Tooltip } from '@radix-ui/themes';
import React from 'react';

import styles from '../../app-details.module.css';

interface SecuritySectionProps {
  deploymentToken: string | null;
  showDeploymentToken: boolean;
  onToggleShowToken: () => void;
  onCopyToken: () => void;
  onOpenDeleteModal: () => void;
}

export default function SecuritySection(props: SecuritySectionProps) {
  const {
    deploymentToken,
    showDeploymentToken,
    onToggleShowToken,
    onCopyToken,
    onOpenDeleteModal,
  } = props;

  return (
    <>
      <Heading size='5' style={{ marginBottom: '20px' }}>
        Tokens
      </Heading>

      {/* Deployment Token Section */}
      <Card
        style={{
          border: '1px solid var(--gray-6)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          padding: '16px',
        }}
      >
        <Flex direction='column' gap='1'>
          <Flex align='center' gap='2'>
            <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
              Token da Aplicação
            </Text>
            <Tooltip content='Use este token para fazer deployments via arquivo .ZIP ou programáticos CI/CD via API'>
              <InfoCircledIcon
                style={{
                  color: 'var(--gray-9)',
                  cursor: 'help',
                  width: '14px',
                  height: '14px',
                }}
              />
            </Tooltip>
          </Flex>

          <Flex gap='2' align='center' mt='1'>
            <TextField.Root
              value={deploymentToken || ''}
              readOnly
              style={{
                flex: 1,
                fontFamily: 'monospace',
                fontSize: '12px',
                filter: showDeploymentToken ? 'none' : 'blur(4px)',
                transition: 'filter 0.2s ease',
              }}
              placeholder={deploymentToken ? 'Token de deployment' : 'Carregando token...'}
            />
            <Button
              size='2'
              variant='soft'
              onClick={onToggleShowToken}
              style={{
                minWidth: '34px',
                width: '34px',
                height: '34px',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--purple-3)',
                border: '1px solid var(--purple-6)',
                color: 'var(--purple-11)',
                cursor: 'pointer',
              }}
              title={showDeploymentToken ? 'Ocultar token' : 'Mostrar token'}
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                {showDeploymentToken ? (
                  <path
                    d='M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8M6 10H18M6 10V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V10'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                ) : (
                  <>
                    <rect
                      x='3'
                      y='11'
                      width='18'
                      height='11'
                      rx='2'
                      ry='2'
                      stroke='currentColor'
                      strokeWidth='2'
                      fill='none'
                    />
                    <path
                      d='M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11'
                      stroke='currentColor'
                      strokeWidth='2'
                      fill='none'
                    />
                  </>
                )}
              </svg>
            </Button>
            <Button
              size='2'
              onClick={onCopyToken}
              disabled={!deploymentToken}
              style={{
                minWidth: '70px',
                background: 'var(--purple-9)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Copiar
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Delete Application Section */}
      <Box style={{ marginTop: '45px' }}>
        <Heading size='5' style={{ marginBottom: '12px', color: 'var(--red-11)' }}>
          Zona de Perigo
        </Heading>
        <Card
          style={{
            border: '1px solid var(--red-6)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            padding: '16px',
            background: 'var(--red-2)',
          }}
        >
          <Flex align='center' justify='between' gap='4' className={styles.dangerRow}>
            <Flex direction='column' gap='1'>
              <Text size='3' weight='bold' style={{ color: 'var(--gray-12)', display: 'block' }}>
                Deletar essa aplicação
              </Text>
              <Text size='2' style={{ color: 'var(--gray-11)', display: 'block' }}>
                Uma vez que você exclui uma aplicação, não há como voltar atrás.
              </Text>
            </Flex>
            <Button
              className={styles.dangerRowButton}
              size='2'
              onClick={onOpenDeleteModal}
              style={{
                background: 'var(--gray-4)',
                color: 'var(--red-9)',
                border: '1px solid var(--gray-7)',
                cursor: 'pointer',
              }}
            >
              <TrashIcon />
              Deletar Aplicação
            </Button>
          </Flex>
        </Card>
      </Box>
    </>
  );
}
