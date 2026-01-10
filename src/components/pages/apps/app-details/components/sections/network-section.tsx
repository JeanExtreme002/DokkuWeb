import { GlobeIcon, ReloadIcon, TrashIcon } from '@radix-ui/react-icons';
import { Box, Button, Card, Flex, Heading, Select, Text, TextField } from '@radix-ui/themes';
import React from 'react';

import styles from '../../app-details.module.css';

interface NetworkPortMapping {
  protocol: string;
  origin: number;
  dest: number;
}

interface NetworkData {
  network?: string | null;
}

interface NetworkSectionProps {
  networkLoading: boolean;
  errorNetwork: string | null | undefined;
  networkData: NetworkData;
  protocol: string;
  onSetProtocol: (val: string) => void;
  originPort: string;
  onSetOriginPort: (val: string) => void;
  destPort: string;
  onSetDestPort: (val: string) => void;
  portSubmitting: boolean;
  addPortMapping: () => void;
  portMappingsLoading: boolean;
  errorPortMappings: string | null | undefined;
  portMappings: NetworkPortMapping[];
  openDeletePortModal: (mapping: NetworkPortMapping) => void;
  deletingPort: string | null | undefined;
}

export default function NetworkSection(props: NetworkSectionProps) {
  const {
    networkLoading,
    errorNetwork,
    networkData,
    protocol,
    onSetProtocol,
    originPort,
    onSetOriginPort,
    destPort,
    onSetDestPort,
    portSubmitting,
    addPortMapping,
    portMappingsLoading,
    errorPortMappings,
    portMappings,
    openDeletePortModal,
    deletingPort,
  } = props;

  return (
    <Flex direction='column' gap='4'>
      <Heading size='5' style={{ color: 'var(--gray-12)' }}>
        Rede
      </Heading>

      {networkLoading ? (
        <Box className={styles.loadingSpinner}>
          <Box className={styles.spinner}></Box>
          <Text style={{ marginLeft: '12px' }}>Obtendo dados de rede...</Text>
        </Box>
      ) : errorNetwork ? (
        <Card
          style={{
            border: '1px solid var(--red-6)',
            backgroundColor: 'var(--red-2)',
            padding: '10px',
          }}
        >
          <Text style={{ color: 'var(--red-11)' }}>{errorNetwork}</Text>
        </Card>
      ) : (
        <Box>
          {/* Network Info Card */}
          <Card
            style={{
              border: '1px solid var(--gray-6)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              padding: '20px',
              marginBottom: '24px',
            }}
          >
            <Flex align='center' gap='4' style={{ minHeight: '80px' }}>
              {/* Network Icon */}
              <Box
                className={styles.desktopOnly}
                style={{
                  flexShrink: 0,
                  width: '80px',
                  height: '80px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, var(--green-3) 0%, var(--blue-3) 100%)',
                  border: '1px solid var(--green-6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GlobeIcon width='48' height='48' style={{ color: 'var(--green-11)' }} />
              </Box>

              {/* Network Info */}
              <Flex direction='column' gap='2' style={{ flex: 1 }}>
                <Text
                  size='3'
                  className={styles.networkName}
                  style={{
                    fontFamily: 'monospace',
                    color: 'var(--gray-11)',
                    background: 'var(--gray-2)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--gray-6)',
                  }}
                >
                  {networkData.network || 'Rede padrão do Dokku'}
                </Text>
                <Flex align='center' gap='2'>
                  <Box
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: networkData.network ? 'var(--green-9)' : 'var(--blue-9)',
                    }}
                  />
                  <Text size='2' weight='medium' style={{ color: 'var(--gray-11)' }}>
                    {networkData.network ? 'Rede vinculada' : 'Padrão'}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Card>

          {/* Port Mapping Section */}
          <Heading size='4' style={{ marginBottom: '16px' }}>
            Mapeamento de Portas
          </Heading>

          {/* Add Port Mapping Form */}
          <Box className={styles.portMappingForm}>
            <Box className={styles.portInput}>
              <Text size='2' style={{ marginBottom: '4px' }}>
                Protocolo:
              </Text>
              <Select.Root value={protocol} onValueChange={onSetProtocol}>
                <Select.Trigger style={{ width: '100px', cursor: 'pointer' }} />
                <Select.Content>
                  <Select.Item style={{ cursor: 'pointer' }} value='http'>
                    HTTP
                  </Select.Item>
                  <Select.Item style={{ cursor: 'pointer' }} value='https'>
                    HTTPS
                  </Select.Item>
                  <Select.Item style={{ cursor: 'pointer' }} value='tcp'>
                    TCP
                  </Select.Item>
                  <Select.Item style={{ cursor: 'pointer' }} value='udp'>
                    UDP
                  </Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>
            <Box className={styles.ports}>
              <Box className={styles.portInput}>
                <Text size='2' style={{ marginBottom: '4px' }}>
                  Mapear:
                </Text>
                <TextField.Root
                  type='number'
                  placeholder='80'
                  value={originPort}
                  onChange={(e) => onSetOriginPort(e.target.value)}
                  disabled={portSubmitting}
                />
              </Box>

              <Box className={styles.portInput}>
                <Text size='2' style={{ marginBottom: '4px' }}>
                  para:
                </Text>
                <TextField.Root
                  type='number'
                  placeholder='8080'
                  value={destPort}
                  onChange={(e) => onSetDestPort(e.target.value)}
                  disabled={portSubmitting}
                />
              </Box>
            </Box>

            <Box>
              <div style={{ marginBottom: '20px' }}></div>
              <Button
                className={styles.portMappingButton}
                onClick={addPortMapping}
                disabled={!originPort || !destPort || portSubmitting}
                style={{
                  background: 'linear-gradient(135deg, var(--green-9) 0%, var(--green-10) 100%)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                {portSubmitting ? 'Salvando...' : 'Mapear porta'}
              </Button>
            </Box>
          </Box>

          {/* Port Mappings List */}
          <Box>
            {portMappingsLoading ? (
              <Box className={styles.loadingSpinner}>
                <Box className={styles.spinner}></Box>
                <Text style={{ marginLeft: '12px' }}>Carregando mapeamentos de porta...</Text>
              </Box>
            ) : errorPortMappings ? (
              <Card
                style={{
                  border: '1px solid var(--red-6)',
                  backgroundColor: 'var(--red-2)',
                  padding: '20px',
                }}
              >
                <Text style={{ color: 'var(--red-11)' }}>{errorPortMappings}</Text>
              </Card>
            ) : portMappings.length === 0 ? (
              <Card
                style={{
                  border: '1px solid var(--gray-6)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  padding: '40px',
                  textAlign: 'center',
                }}
              >
                <Text size='3' color='gray' className={styles.emptyPortMessage}>
                  Nenhum mapeamento de porta configurado ainda.
                </Text>
              </Card>
            ) : (
              portMappings.map((mapping, index) => (
                <Card key={index} className={styles.portMappingCard}>
                  <Box>
                    <Text size='3' weight='medium'>
                      {mapping.protocol.toUpperCase()}: {mapping.origin} → {mapping.dest}
                    </Text>
                  </Box>
                  <Button
                    size='2'
                    color='red'
                    variant='surface'
                    style={{ cursor: 'pointer' }}
                    onClick={() => openDeletePortModal(mapping)}
                    disabled={
                      deletingPort === `${mapping.protocol}-${mapping.origin}-${mapping.dest}`
                    }
                  >
                    {deletingPort === `${mapping.protocol}-${mapping.origin}-${mapping.dest}` ? (
                      <ReloadIcon className={styles.buttonSpinner} />
                    ) : (
                      <TrashIcon />
                    )}
                  </Button>
                </Card>
              ))
            )}
          </Box>
        </Box>
      )}
    </Flex>
  );
}
