import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Select,
  Separator,
  Text,
  TextField,
} from '@radix-ui/themes';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';
import React, { useEffect, useState } from 'react';

import { NavBar } from '@/components/shared';
import { api } from '@/lib';

import styles from './create-app.module.css';

interface CreateAppPageProps {
  session: Session;
}

interface NetworksData {
  [networkName: string]: object;
}

interface EnvironmentVariable {
  key: string;
  value: string;
  id: string;
}

export function CreateAppPage(props: CreateAppPageProps) {
  const router = useRouter();
  const [appName, setAppName] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('none');
  const [networks, setNetworks] = useState<NetworksData>({});
  const [networksLoading, setNetworksLoading] = useState(true);
  const [environmentVariables, setEnvironmentVariables] = useState<EnvironmentVariable[]>([]);
  const [currentEnvKey, setCurrentEnvKey] = useState('');
  const [currentEnvValue, setCurrentEnvValue] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect if the screen is small
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Load available networks
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

  // Add a new environment variable
  const addEnvironmentVariable = () => {
    if (!currentEnvKey.trim() || !currentEnvValue.trim()) return;

    const newVariable: EnvironmentVariable = {
      key: currentEnvKey.trim(),
      value: currentEnvValue.trim(),
      id: Date.now().toString(),
    };

    setEnvironmentVariables((prev) => [...prev, newVariable]);
    setCurrentEnvKey('');
    setCurrentEnvValue('');
  };

  // Remove an environment variable
  const removeEnvironmentVariable = (id: string) => {
    setEnvironmentVariables((prev) => prev.filter((variable) => variable.id !== id));
  };

  // Validate the app name and return validation info
  const validateAppName = (name: string) => {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) return { isValid: false, message: '' };

    const startsWithLetter = /^[a-zA-Z]/.test(trimmedName);
    const endsWithLetterOrNumber = /[a-zA-Z0-9]$/.test(trimmedName);
    const letterCount = (trimmedName.match(/[a-zA-Z]/g) || []).length;

    if (trimmedName.length < 3) {
      return { isValid: false, message: '(mínimo 3 caracteres)' };
    }
    if (!startsWithLetter) {
      return { isValid: false, message: '(deve começar com uma letra)' };
    }
    if (!endsWithLetterOrNumber) {
      return { isValid: false, message: '(deve terminar com letra ou número)' };
    }
    if (letterCount < 3) {
      return { isValid: false, message: '(mínimo 3 letras)' };
    }
    if (trimmedName.length > 50) {
      return { isValid: false, message: '(máximo 50 caracteres)' };
    }

    return { isValid: true, message: '' };
  };

  // Validate whether the form can be submitted
  const canSubmit = () => {
    return validateAppName(appName).isValid && !creating;
  };

  // Create the application
  const handleCreateApp = async () => {
    if (!canSubmit()) return;

    setCreating(true);
    setError(null);

    // Small delay to ensure state is updated before requests
    await new Promise((resolve) => setTimeout(resolve, 10));

    try {
      // 1. Create the application
      const createAppResponse = await api.post(
        `/api/apps/${appName.trim()}`,
        {},
        { params: { unique_app: 'true' } }
      );

      if (createAppResponse.status !== 200 && createAppResponse.status !== 201) {
        throw new Error(`Failed to create app: ${createAppResponse.status}`);
      }

      // 2. Create parallel requests for config and network
      const promises: Promise<any>[] = [];

      // Add network link request (if one was selected)
      if (selectedNetwork && selectedNetwork !== 'none') {
        promises.push(
          api.post(`/api/networks/${selectedNetwork}/link/${appName.trim()}/`).catch((error) => {
            console.error('Error linking app to network:', error);
            // Do not fail the process if network link errors
          })
        );
      }

      // Add config requests for each environment variable
      environmentVariables.forEach((envVar) => {
        promises.push(
          api
            .put(`/api/config/${appName.trim()}/${envVar.key}/`, undefined, {
              params: { value: envVar.value },
            })
            .catch((error) => {
              console.error(`Error setting config ${envVar.key}:`, error);
              // Do not fail the process if config errors
            })
        );
      });

      // Execute all requests in parallel
      await Promise.all(promises);

      // Small delay before redirecting to show success
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Redirect to the apps page
      router.push('/apps');
    } catch (error: any) {
      console.error('Error creating app:', error);

      if (error.response?.status === 403) {
        if (error.response?.data?.detail === 'Quota exceeded') {
          setError('Você já utilizou toda sua cota disponível de aplicativos!');
        } else if (error.response?.data?.detail === 'App already exists') {
          setError(`O aplicativo "${appName.trim()}" já existe.`);
        } else if (error.response?.data?.detail == 'App name already in use') {
          setError(`O nome de aplicativo "${appName.trim()}" já está em uso.`);
        } else {
          setError('Acesso negado. Verifique suas permissões.');
        }
      } else {
        setError('Ocorreu um erro ao criar o aplicativo. Tente novamente.');
      }
    } finally {
      setCreating(false);
    }
  };

  const networksList = Object.keys(networks);

  return (
    <>
      <NavBar session={props.session} />

      <main className={styles.root}>
        <Flex direction='column' gap='5' className={styles.mainContainer}>
          {/* Header */}
          <Box>
            <Heading
              size='7'
              weight='medium'
              style={{
                color: 'var(--gray-12)',
                marginBottom: '4px',
              }}
            >
              Criar novo aplicativo
            </Heading>
            <Text size='3' color='gray'>
              Configure seu novo aplicativo Dokku
            </Text>
          </Box>

          <Separator size='4' style={{ margin: '10px 0' }} />

          {/* Form */}
          <Card
            style={{
              border: '1px solid var(--gray-6)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              padding: '20px',
            }}
          >
            <Flex direction='column' gap='5'>
              {/* App Name */}
              <Flex direction='column' gap='2'>
                <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
                  Nome do Aplicativo
                </Text>
                <TextField.Root
                  placeholder='Digite o nome do aplicativo'
                  value={appName}
                  onChange={(e) => {
                    // Allow letters (uppercase and lowercase), numbers and "-"
                    const value = e.target.value.replace(/[^a-zA-Z0-9-]/g, '');
                    setAppName(value);
                  }}
                  disabled={creating}
                  style={{
                    fontSize: '14px',
                    maxWidth: '400px',
                  }}
                />
                <Text
                  size='2'
                  color={!validateAppName(appName).isValid && appName.length > 0 ? 'red' : 'gray'}
                >
                  {appName.length}/50 caracteres {validateAppName(appName).message}
                </Text>
              </Flex>

              {/* Network Selection */}
              <Flex direction='column' gap='2'>
                <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
                  Rede (Opcional)
                </Text>
                {networksLoading ? (
                  <Box style={{ padding: '12px' }}>
                    <Text size='2' color='gray' style={{ fontStyle: 'italic' }}>
                      Carregando redes...
                    </Text>
                  </Box>
                ) : (
                  <Select.Root
                    value={selectedNetwork}
                    onValueChange={setSelectedNetwork}
                    disabled={creating}
                  >
                    <Select.Trigger
                      placeholder='Selecione uma rede (opcional)'
                      style={{ maxWidth: '300px', cursor: 'pointer' }}
                    />
                    <Select.Content>
                      <Select.Item value='none' style={{ cursor: 'pointer' }}>
                        Nenhum
                      </Select.Item>
                      {networksList.map((networkName) => (
                        <Select.Item
                          key={networkName}
                          value={networkName}
                          style={{ cursor: 'pointer' }}
                        >
                          {networkName}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              </Flex>

              {/* Environment Variables */}
              <Flex direction='column' gap='3'>
                <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
                  Variáveis de Ambiente
                </Text>

                {/* Inputs for new variable */}
                <Flex gap='2' align='end' className={styles.envInputsContainer}>
                  <Box style={{ width: '200px' }}>
                    <Text size='2' color='gray' style={{ marginBottom: '4px' }}>
                      Chave
                    </Text>
                    <TextField.Root
                      placeholder='NOME_VARIAVEL'
                      value={currentEnvKey}
                      onChange={(e) => {
                        // Remove only spaces, allow all other characters
                        const value = e.target.value.replace(/\s/g, '');
                        setCurrentEnvKey(value);
                      }}
                      disabled={creating}
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
                      disabled={creating}
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
                      disabled={!currentEnvKey.trim() || !currentEnvValue.trim() || creating}
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

                {/* List of added variables */}
                {environmentVariables.length > 0 && (
                  <Box
                    style={{
                      border: '1px solid var(--gray-6)',
                      borderRadius: '8px',
                      padding: '12px',
                      backgroundColor: 'var(--gray-1)',
                    }}
                  >
                    <Text size='2' color='gray' weight='medium' style={{ marginBottom: '12px' }}>
                      Variáveis Configuradas:
                    </Text>
                    <Flex direction='column' gap='2'>
                      {environmentVariables.map((envVar) => (
                        <Flex
                          key={envVar.id}
                          align='center'
                          justify='between'
                          style={{
                            padding: '8px 12px',
                            backgroundColor: 'var(--color-surface)',
                            borderRadius: '6px',
                            border: '1px solid var(--gray-5)',
                          }}
                        >
                          <Flex gap='3' align='center' style={{ flex: 1 }}>
                            <Text
                              size='2'
                              weight='medium'
                              style={{
                                color: 'var(--blue-11)',
                                fontFamily: 'monospace',
                                minWidth: '120px',
                              }}
                            >
                              {envVar.key}
                            </Text>
                            <Text size='2' color='gray'>
                              =
                            </Text>
                            <Text
                              size='2'
                              style={{
                                color: 'var(--gray-11)',
                                fontFamily: 'monospace',
                                wordBreak: 'break-all',
                              }}
                            >
                              {envVar.value}
                            </Text>
                          </Flex>
                          <Button
                            size='1'
                            variant='ghost'
                            onClick={() => removeEnvironmentVariable(envVar.id)}
                            disabled={creating}
                            style={{
                              color: 'var(--red-11)',
                              cursor: 'pointer',
                            }}
                          >
                            <TrashIcon />
                          </Button>
                        </Flex>
                      ))}
                    </Flex>
                  </Box>
                )}
              </Flex>

              {/* Error message */}
              {error && (
                <Box
                  style={{
                    padding: '12px',
                    backgroundColor: 'var(--red-2)',
                    borderRadius: '8px',
                    border: '1px solid var(--red-6)',
                  }}
                >
                  <Text size='3' className={styles.errorMessage} style={{ color: 'var(--red-11)' }}>
                    {error}
                  </Text>
                </Box>
              )}

              {/* Create button */}
              <Flex justify='end' gap='3' className={styles.buttonsContainer}>
                <Button
                  size='3'
                  color='gray'
                  variant='outline'
                  style={{ cursor: 'pointer' }}
                  onClick={() => router.push('/apps')}
                  disabled={creating}
                >
                  Cancelar
                </Button>
                <Button
                  size='3'
                  onClick={handleCreateApp}
                  disabled={!canSubmit()}
                  style={{
                    background: canSubmit()
                      ? 'linear-gradient(135deg, var(--green-9) 0%, var(--green-10) 100%)'
                      : 'var(--gray-5)',
                    border: 'none',
                    color: 'white',
                    cursor: canSubmit() ? 'pointer' : 'not-allowed',
                    fontWeight: '500',
                    padding: '12px 24px',
                    minWidth: '180px',
                  }}
                >
                  {creating ? (
                    <Flex align='center' gap='2'>
                      <Box
                        className={styles.spinner}
                        style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid transparent',
                          borderTop: '2px solid white',
                          borderRadius: '50%',
                        }}
                      />
                      <Text>Criando...</Text>
                    </Flex>
                  ) : (
                    'Criar novo aplicativo'
                  )}
                </Button>
              </Flex>
            </Flex>
          </Card>
        </Flex>
      </main>
    </>
  );
}
