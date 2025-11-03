import * as Accordion from '@radix-ui/react-accordion';
import {
  AlertDialog,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Separator,
  Spinner,
  Text,
} from '@radix-ui/themes';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';
import { useEffect, useState } from 'react';

import { NavBar } from '@/components';
import {
  AppIcon,
  ChevronDownIcon,
  DotIcon,
  EyeIcon,
  LinkIcon,
  NetworkIcon,
  TrashIcon,
} from '@/components/shared/icons';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { api } from '@/lib';

import styles from './networks.module.css';

interface NetworksPageProps {
  session: Session;
}

interface NetworksData {
  [networkName: string]: object;
}

export function NetworksPage(props: NetworksPageProps) {
  const router = useRouter();
  const [networks, setNetworks] = useState<NetworksData>({});
  const [linkedApps, setLinkedApps] = useState<Record<string, string[]>>({});
  const [expandedNetwork, setExpandedNetwork] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAppName, setNewAppName] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);
  const [unlinkModalOpen, setUnlinkModalOpen] = useState<{
    networkName: string;
    appName: string;
  } | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newNetworkName, setNewNetworkName] = useState('');
  const [createNetworkError, setCreateNetworkError] = useState<string | null>(null);
  const [creatingNetwork, setCreatingNetwork] = useState(false);
  const [isUpdatingFromServer, setIsUpdatingFromServer] = useState(false);

  useEffect(() => {
    const fetchNetworksAndApps = async () => {
      try {
        setLoading(true);

        // Primeiro busca as redes (pode vir do cache)
        const networksResponse = await api.post('/api/networks/list/');

        if (networksResponse.status === 200 && networksResponse.data.success) {
          const networksData = networksResponse.data.result;
          setNetworks(networksData);

          // Lista de nomes das redes
          const networkNames = Object.keys(networksData);

          if (networkNames.length > 0) {
            // Busca os linked-apps de todas as redes em paralelo (pode vir do cache)
            const linkedAppsPromises = networkNames.map(async (networkName) => {
              try {
                const response = await api.post(`/api/networks/${networkName}/linked-apps/`);

                if (response.status === 200 && response.data.success) {
                  return {
                    networkName,
                    apps: response.data.result,
                  };
                }
                return {
                  networkName,
                  apps: [],
                };
              } catch (error) {
                console.error(`Error fetching linked apps for ${networkName}:`, error);
                return {
                  networkName,
                  apps: [],
                };
              }
            });

            // Aguarda todas as requisições terminarem
            const linkedAppsResults = await Promise.all(linkedAppsPromises);

            // Monta o objeto com todos os linked-apps
            const allLinkedApps: Record<string, string[]> = {};
            linkedAppsResults.forEach(({ networkName, apps }) => {
              allLinkedApps[networkName] = apps;
            });

            setLinkedApps(allLinkedApps);
          }

          // Verifica se a resposta das redes veio do cache
          const cacheStatus = networksResponse.headers['x-cache'];
          if (cacheStatus === 'HIT') {
            // Se veio do cache, faz uma requisição em background para obter dados atualizados
            fetchFreshNetworksAndApps();
          }
        } else {
          throw new Error(`HTTP error! status: ${networksResponse.status}`);
        }
      } catch (error) {
        console.error('Error fetching networks and apps:', error);
        setError('Erro ao carregar redes');
      } finally {
        setLoading(false);
      }
    };

    const fetchFreshNetworksAndApps = async () => {
      try {
        setIsUpdatingFromServer(true);

        // Busca as redes sem cache
        const networksResponse = await api.post(
          '/api/networks/list/',
          {},
          {
            headers: { 'x-cache': 'false' },
          }
        );

        if (networksResponse.status === 200 && networksResponse.data.success) {
          const networksData = networksResponse.data.result;
          setNetworks(networksData);

          // Lista de nomes das redes
          const networkNames = Object.keys(networksData);

          if (networkNames.length > 0) {
            // Busca os linked-apps de todas as redes em paralelo sem cache
            const linkedAppsPromises = networkNames.map(async (networkName) => {
              try {
                const response = await api.post(
                  `/api/networks/${networkName}/linked-apps/`,
                  {},
                  {
                    headers: { 'x-cache': 'false' },
                  }
                );

                if (response.status === 200 && response.data.success) {
                  return {
                    networkName,
                    apps: response.data.result,
                  };
                }
                return {
                  networkName,
                  apps: [],
                };
              } catch (error) {
                console.error(`Error fetching fresh linked apps for ${networkName}:`, error);
                return {
                  networkName,
                  apps: [],
                };
              }
            });

            // Aguarda todas as requisições terminarem
            const linkedAppsResults = await Promise.all(linkedAppsPromises);

            // Monta o objeto com todos os linked-apps
            const allLinkedApps: Record<string, string[]> = {};
            linkedAppsResults.forEach(({ networkName, apps }) => {
              allLinkedApps[networkName] = apps;
            });

            setLinkedApps(allLinkedApps);
          }
        }
      } catch (error) {
        // Ignora erros na atualização em background
        console.warn('Failed to fetch fresh networks data:', error);
      } finally {
        setIsUpdatingFromServer(false);
      }
    };

    fetchNetworksAndApps();
  }, []);

  const fetchLinkedApps = async (networkName: string) => {
    try {
      // Sempre busca dados frescos quando chamado manualmente (após ações como vincular/desvincular)
      const response = await api.post(
        `/api/networks/${networkName}/linked-apps/`,
        {},
        {
          headers: { 'x-cache': 'false' },
        }
      );

      if (response.status === 200 && response.data.success) {
        setLinkedApps((prev) => ({
          ...prev,
          [networkName]: response.data.result,
        }));
      }
    } catch (error) {
      console.error('Error fetching linked apps:', error);
    }
  };

  const handleLinkApp = async (networkName: string) => {
    const appName = newAppName[networkName]?.trim();
    if (!appName) return;

    setActionLoading((prev) => ({ ...prev, [networkName]: true }));

    try {
      const response = await api.post(`/api/networks/${networkName}/link/${appName}`);

      if (response.status === 200) {
        await fetchLinkedApps(networkName);
        setNewAppName((prev) => ({ ...prev, [networkName]: '' }));
      }
    } catch (error) {
      console.error('Error linking app:', error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [networkName]: false }));
    }
  };

  const handleUnlinkApp = async (networkName: string, appName: string) => {
    try {
      const response = await api.delete(`/api/networks/${networkName}/link/${appName}`);

      if (response.status === 200) {
        await fetchLinkedApps(networkName);
      }
    } catch (error) {
      console.error('Error unlinking app:', error);
    } finally {
      setUnlinkModalOpen(null);
    }
  };

  const confirmUnlinkApp = () => {
    if (unlinkModalOpen) {
      handleUnlinkApp(unlinkModalOpen.networkName, unlinkModalOpen.appName);
    }
  };

  const handleViewApp = (appName: string) => {
    router.push(`/apps/${appName}`);
  };

  const handleCreateNetwork = async () => {
    if (!newNetworkName.trim()) return;

    setCreateNetworkError(null); // Limpa erros anteriores
    setCreatingNetwork(true); // Inicia loading

    try {
      const response = await api.post(`/api/networks/${newNetworkName.trim()}`);

      if (response.status === 200 || response.status === 201) {
        // Recarrega a lista de redes
        const networksResponse = await api.post('/api/networks/list/');
        if (networksResponse.status === 200 && networksResponse.data.success) {
          setNetworks(networksResponse.data.result);
        }

        setCreateModalOpen(false);
        setNewNetworkName('');
        setCreateNetworkError(null);
      }
    } catch (error: any) {
      console.error('Error creating network:', error);

      if (error.response?.status === 403) {
        if (error.response?.data?.detail === 'Quota exceeded') {
          setCreateNetworkError('Você já utilizou toda sua cota disponível de redes!');
        } else if (error.response?.data?.detail === 'Network already exists') {
          setCreateNetworkError(`A rede "${newNetworkName.trim()}" já existe.`);
        } else {
          setCreateNetworkError('Acesso negado. Verifique suas permissões.');
        }
      } else {
        setCreateNetworkError('Ocorreu um erro ao criar a rede. Tente novamente.');
      }
    } finally {
      setCreatingNetwork(false); // Para loading
    }
  };

  const handleDeleteNetwork = async (networkName: string) => {
    try {
      const response = await api.delete(`/api/networks/${networkName}`);

      if (response.status === 200) {
        setNetworks((prev) => {
          const newNetworks = { ...prev };
          delete newNetworks[networkName];
          return newNetworks;
        });
        setLinkedApps((prev) => {
          const newLinkedApps = { ...prev };
          delete newLinkedApps[networkName];
          return newLinkedApps;
        });
        setExpandedNetwork(null);
      }
    } catch (error) {
      console.error('Error deleting network:', error);
    }
    setDeleteModalOpen(null);
  };

  // Converte o objeto de redes em um array para facilitar a renderização
  const networksList = Object.keys(networks);

  return (
    <>
      <NavBar session={props.session} />

      <main className={styles.root}>
        <Flex direction='column' gap='5' className={styles.mainContainer}>
          <Flex className={styles.headerSection}>
            <Box>
              <Heading
                size='7'
                weight='medium'
                style={{
                  color: 'var(--gray-12)',
                  marginBottom: '4px',
                }}
              >
                Minhas Redes
              </Heading>
              <Text size='3' color='gray'>
                Gerencie suas redes de aplicações no Dokku
              </Text>
            </Box>

            <Button
              size='3'
              onClick={() => setCreateModalOpen(true)}
              className={styles.createButton}
              style={{
                background: 'linear-gradient(135deg, var(--green-9) 0%, var(--green-10) 100%)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '500',
                padding: '12px 20px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(34, 197, 94, 0.3)';
              }}
            >
              + Criar Rede
            </Button>
          </Flex>

          {/* Separador */}
          <Separator size='4' style={{ margin: '10px 0' }} />

          {/* Indicador de atualização do servidor */}
          {isUpdatingFromServer && (
            <Flex align='center' gap='3'>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid var(--gray-6)',
                  borderTop: '2px solid var(--gray-9)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <Text size='3' style={{ color: 'var(--gray-11)', fontWeight: '500' }}>
                Sincronizando informações com o servidor...
              </Text>
            </Flex>
          )}

          {/* Estado de carregamento */}
          {loading && (
            <LoadingSpinner
              title='Carregando Redes'
              messages={[
                'Conectando ao Dokku...',
                'Listando redes Docker...',
                'Carregando aplicativos vinculados...',
                'Processando dados de conectividade...',
                'Preparando visualização...',
              ]}
            />
          )}

          {/* Estado de erro */}
          {error && (
            <Card
              style={{
                border: '1px solid var(--red-6)',
                backgroundColor: 'var(--red-2)',
                padding: '20px',
              }}
            >
              <Flex align='center' gap='3'>
                <Box style={{ color: 'var(--red-11)' }}>
                  <DotIcon />
                </Box>
                <Text size='3' style={{ color: 'var(--red-11)' }}>
                  {error}
                </Text>
              </Flex>
            </Card>
          )}

          {/* Lista de redes */}
          {!loading && !error && (
            <>
              {networksList.length === 0 ? (
                <Card
                  style={{
                    border: '1px solid var(--gray-6)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    padding: '40px',
                    textAlign: 'center',
                  }}
                >
                  <Text size='3' color='gray'>
                    Nenhuma rede criada ainda.
                  </Text>
                </Card>
              ) : (
                <Accordion.Root
                  type='single'
                  collapsible
                  className={styles.networksAccordion}
                  value={expandedNetwork || ''}
                  onValueChange={(value) => {
                    setExpandedNetwork(value || null);
                  }}
                >
                  {networksList.map((networkName) => {
                    const apps = linkedApps[networkName] || [];

                    return (
                      <Accordion.Item
                        key={networkName}
                        value={networkName}
                        className={styles.networkItem}
                      >
                        <Accordion.Trigger className={styles.networkTrigger}>
                          <Box className={styles.networkIcon}>
                            <NetworkIcon />
                          </Box>

                          <Flex direction='column' className={styles.networkInfo}>
                            <Heading
                              size='4'
                              weight='bold'
                              className={styles.networkName}
                              style={{ color: 'var(--gray-12)', marginBottom: '4px' }}
                            >
                              {networkName}
                            </Heading>
                            <Text
                              size='2'
                              className={styles.networkAppsCount}
                              style={{ color: 'var(--gray-10)' }}
                            >
                              {apps.length}{' '}
                              {apps.length === 1 ? 'app vinculado' : 'apps vinculados'}
                            </Text>
                          </Flex>

                          <Box className={styles.chevronIcon}>
                            <ChevronDownIcon />
                          </Box>
                        </Accordion.Trigger>

                        <Accordion.Content className={styles.networkContent}>
                          {/* Seção para vincular novos apps */}
                          <div className={styles.linkAppSection}>
                            <Heading
                              size='3'
                              style={{ marginBottom: '8px', color: 'var(--gray-12)' }}
                            >
                              Vincular Aplicativo
                            </Heading>
                            <Text
                              size='2'
                              style={{
                                marginBottom: '16px',
                                color: 'var(--gray-10)',
                                lineHeight: '1.4',
                              }}
                            >
                              Aplicativos vinculados à mesma rede podem se comunicar entre si.
                            </Text>
                            <div className={styles.linkAppForm}>
                              <input
                                type='text'
                                placeholder='Nome do aplicativo'
                                value={newAppName[networkName] || ''}
                                onChange={(e) =>
                                  setNewAppName((prev) => ({
                                    ...prev,
                                    [networkName]: e.target.value,
                                  }))
                                }
                                className={styles.linkAppInput}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleLinkApp(networkName);
                                  }
                                }}
                              />
                              <button
                                className={styles.linkButton}
                                onClick={() => handleLinkApp(networkName)}
                                disabled={
                                  !newAppName[networkName]?.trim() || actionLoading[networkName]
                                }
                              >
                                <LinkIcon />
                                Vincular
                              </button>
                            </div>
                          </div>

                          {/* Lista de apps vinculados */}
                          <div>
                            <Heading
                              size='3'
                              style={{ marginBottom: '12px', color: 'var(--gray-12)' }}
                            >
                              Apps Vinculados ({apps.length})
                            </Heading>

                            {apps.length === 0 ? (
                              <Text size='2' color='gray' style={{ fontStyle: 'italic' }}>
                                Nenhum aplicativo vinculado
                              </Text>
                            ) : (
                              <div className={styles.linkedAppsList}>
                                {apps.map((appName) => (
                                  <div key={appName} className={styles.linkedAppItem}>
                                    <div className={styles.linkedAppIcon}>
                                      <AppIcon />
                                    </div>
                                    <Text size='2' style={{ flex: 1, color: 'var(--gray-12)' }}>
                                      {appName}
                                    </Text>
                                    <button
                                      className={styles.viewButton}
                                      onClick={() => handleViewApp(appName)}
                                      title='Ver aplicativo'
                                    >
                                      <EyeIcon />
                                    </button>
                                    <button
                                      className={styles.unlinkButton}
                                      onClick={() => setUnlinkModalOpen({ networkName, appName })}
                                      title='Desvincular aplicativo'
                                    >
                                      <TrashIcon />
                                      <span>Desvincular</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Seção de excluir rede */}
                          <div className={styles.deleteNetworkSection}>
                            <Heading
                              size='3'
                              style={{ marginBottom: '12px', color: 'var(--red-11)' }}
                            >
                              Zona de Perigo
                            </Heading>
                            <button
                              className={styles.deleteNetworkButton}
                              onClick={() => setDeleteModalOpen(networkName)}
                              title='Excluir rede'
                            >
                              <TrashIcon />
                              Excluir Rede
                            </button>
                          </div>
                        </Accordion.Content>
                      </Accordion.Item>
                    );
                  })}
                </Accordion.Root>
              )}
            </>
          )}

          {/* Modal de confirmação de exclusão */}
          {deleteModalOpen && (
            <AlertDialog.Root
              open={!!deleteModalOpen}
              onOpenChange={() => setDeleteModalOpen(null)}
            >
              <AlertDialog.Content style={{ maxWidth: '450px' }}>
                <AlertDialog.Title>Excluir Rede</AlertDialog.Title>
                <AlertDialog.Description size='2'>
                  Tem certeza que deseja excluir a rede <strong>{deleteModalOpen}</strong>? Esta
                  ação não pode ser desfeita.
                </AlertDialog.Description>

                <Flex gap='3' mt='4' justify='end'>
                  <AlertDialog.Cancel>
                    <Button variant='soft' color='gray'>
                      Cancelar
                    </Button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action>
                    <Button
                      variant='solid'
                      color='red'
                      onClick={() => handleDeleteNetwork(deleteModalOpen)}
                    >
                      Excluir
                    </Button>
                  </AlertDialog.Action>
                </Flex>
              </AlertDialog.Content>
            </AlertDialog.Root>
          )}

          {/* Modal de confirmação de desvinculação */}
          {unlinkModalOpen && (
            <AlertDialog.Root
              open={!!unlinkModalOpen}
              onOpenChange={() => setUnlinkModalOpen(null)}
            >
              <AlertDialog.Content style={{ maxWidth: '450px' }}>
                <AlertDialog.Title>Desvincular Aplicativo</AlertDialog.Title>
                <AlertDialog.Description size='2'>
                  Tem certeza que deseja desvincular o aplicativo{' '}
                  <strong>{unlinkModalOpen.appName}</strong> da rede{' '}
                  <strong>{unlinkModalOpen.networkName}</strong>?
                </AlertDialog.Description>

                <Flex gap='3' mt='4' justify='end'>
                  <AlertDialog.Cancel>
                    <Button variant='soft' color='gray'>
                      Cancelar
                    </Button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action>
                    <Button variant='solid' color='red' onClick={confirmUnlinkApp}>
                      Desvincular
                    </Button>
                  </AlertDialog.Action>
                </Flex>
              </AlertDialog.Content>
            </AlertDialog.Root>
          )}

          {/* Modal de criação de rede */}
          <AlertDialog.Root
            open={createModalOpen}
            onOpenChange={(open) => {
              setCreateModalOpen(open);
              if (!open) {
                setCreateNetworkError(null);
                setNewNetworkName('');
                setCreatingNetwork(false);
              }
            }}
          >
            <AlertDialog.Content style={{ maxWidth: '450px' }}>
              <AlertDialog.Title>Criar Nova Rede</AlertDialog.Title>
              <AlertDialog.Description size='2'>
                Digite um nome para a nova rede que será criada.
              </AlertDialog.Description>

              <Box mt='4'>
                <input
                  type='text'
                  placeholder='Nome da rede'
                  value={newNetworkName}
                  onChange={(e) => setNewNetworkName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newNetworkName.trim() && !creatingNetwork) {
                      handleCreateNetwork();
                    }
                  }}
                  disabled={creatingNetwork}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--gray-6)',
                    borderRadius: '8px',
                    background: creatingNetwork ? 'var(--gray-3)' : 'var(--color-surface)',
                    color: creatingNetwork ? 'var(--gray-9)' : 'var(--gray-12)',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: creatingNetwork ? 'not-allowed' : 'text',
                  }}
                />

                {createNetworkError && (
                  <Text size='2' color='red' style={{ marginTop: '8px', display: 'block' }}>
                    {createNetworkError}
                  </Text>
                )}
              </Box>

              <Flex gap='3' mt='4' justify='end'>
                <AlertDialog.Cancel>
                  <Button variant='soft' color='gray'>
                    Cancelar
                  </Button>
                </AlertDialog.Cancel>
                <Button
                  variant='solid'
                  color='green'
                  onClick={handleCreateNetwork}
                  disabled={!newNetworkName.trim() || creatingNetwork}
                >
                  {creatingNetwork ? <Spinner size='2' /> : 'Criar Rede'}
                </Button>
              </Flex>
            </AlertDialog.Content>
          </AlertDialog.Root>
        </Flex>
      </main>
    </>
  );
}
