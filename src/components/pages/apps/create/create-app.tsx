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

  // Detecta se é uma tela pequena
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Carrega as redes disponíveis
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

  // Adiciona uma nova variável de ambiente
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

  // Remove uma variável de ambiente
  const removeEnvironmentVariable = (id: string) => {
    setEnvironmentVariables((prev) => prev.filter((variable) => variable.id !== id));
  };

  // Valida o nome do app e retorna informações de validação
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

  // Valida se o formulário pode ser enviado
  const canSubmit = () => {
    return validateAppName(appName).isValid && !creating;
  };

  // Cria o aplicativo
  const handleCreateApp = async () => {
    if (!canSubmit()) return;

    setCreating(true);
    setError(null);

    // Pequeno delay para garantir que o estado seja atualizado antes das requisições
    await new Promise((resolve) => setTimeout(resolve, 10));

    try {
      // 1. Cria o aplicativo
      const createAppResponse = await api.post(
        `/api/apps/${appName.trim()}`,
        {},
        { params: { unique_app: 'true' } }
      );

      if (createAppResponse.status !== 200 && createAppResponse.status !== 201) {
        throw new Error(`Failed to create app: ${createAppResponse.status}`);
      }

      // 2. Cria as requisições paralelas para config e network
      const promises: Promise<any>[] = [];

      // Adiciona requisição de vinculação à rede (se uma foi selecionada)
      if (selectedNetwork && selectedNetwork !== 'none') {
        promises.push(
          api.post(`/api/networks/${selectedNetwork}/link/${appName.trim()}/`).catch((error) => {
            console.error('Error linking app to network:', error);
            // Não falha o processo se network link der erro
          })
        );
      }

      // Adiciona requisições de config para cada variável de ambiente
      environmentVariables.forEach((envVar) => {
        promises.push(
          api
            .post(`/api/config/${appName.trim()}/${envVar.key}/${envVar.value}/`)
            .catch((error) => {
              console.error(`Error setting config ${envVar.key}:`, error);
              // Não falha o processo se config der erro
            })
        );
      });

      // Executa todas as requisições em paralelo
      await Promise.all(promises);

      // Pequeno delay antes de redirecionar para mostrar sucesso
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Redireciona para a página de apps
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

          {/* Formulário */}
          <Card
            style={{
              border: '1px solid var(--gray-6)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              padding: '20px',
            }}
          >
            <Flex direction='column' gap='5'>
              {/* Nome do App */}
              <Flex direction='column' gap='2'>
                <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
                  Nome do Aplicativo
                </Text>
                <TextField.Root
                  placeholder='Digite o nome do aplicativo'
                  value={appName}
                  onChange={(e) => {
                    // Permite letras (maiúsculas e minúsculas), números e "-"
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

              {/* Seleção de Rede */}
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
                      style={{ maxWidth: '300px' }}
                    />
                    <Select.Content>
                      <Select.Item value='none'>Nenhum</Select.Item>
                      {networksList.map((networkName) => (
                        <Select.Item key={networkName} value={networkName}>
                          {networkName}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              </Flex>

              {/* Variáveis de Ambiente */}
              <Flex direction='column' gap='3'>
                <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
                  Variáveis de Ambiente
                </Text>

                {/* Inputs para nova variável */}
                <Flex gap='2' align='end' className={styles.envInputsContainer}>
                  <Box style={{ width: '200px' }}>
                    <Text size='2' color='gray' style={{ marginBottom: '4px' }}>
                      Chave
                    </Text>
                    <TextField.Root
                      placeholder='NOME_VARIAVEL'
                      value={currentEnvKey}
                      onChange={(e) => {
                        // Remove apenas espaços, permite todos os outros caracteres
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
                      onClick={addEnvironmentVariable}
                      disabled={!currentEnvKey.trim() || !currentEnvValue.trim() || creating}
                      style={{
                        background:
                          'linear-gradient(135deg, var(--green-9) 0%, var(--green-10) 100%)',
                        border: 'none',
                        color: 'white',
                        minWidth: isMobile ? 'auto' : '44px',
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

                {/* Lista de variáveis adicionadas */}
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

              {/* Mensagem de erro */}
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

              {/* Botão de criar */}
              <Flex justify='end' gap='3' className={styles.buttonsContainer}>
                <Button
                  size='3'
                  color='blue'
                  variant='outline'
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
