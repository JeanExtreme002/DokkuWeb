import { Card, Flex, Separator, Text } from '@radix-ui/themes';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';
import { useEffect, useState } from 'react';

import { LoadingSpinner, NavBar } from '@/components';

import {
  ConfirmDeleteModal,
  ConfirmUnlinkModal,
  CreateNetworkModal,
  ErrorCard,
  HeaderSection,
  NetworksAccordion,
  UpdatingIndicator,
} from './components';
import styles from './networks.module.css';
import {
  createNetwork as svcCreateNetwork,
  deleteNetwork as svcDeleteNetwork,
  getLinkedApps as svcGetLinkedApps,
  linkApp as svcLinkApp,
  listNetworks as svcListNetworks,
  unlinkApp as svcUnlinkApp,
} from './requests';

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

        // First fetch the networks (fresh, no cache)
        const networksData = await svcListNetworks(true);

        setNetworks(networksData);

        // List of network names for subsequent linked-apps fetch
        const networkNames = Object.keys(networksData);

        if (networkNames.length > 0) {
          // Fetch linked apps for all networks in parallel (may come from cache)
          const cachedNetworks: string[] = [];

          const linkedAppsPromises = networkNames.map(async (networkName) => {
            try {
              const { apps, cacheHit } = await svcGetLinkedApps(networkName);
              if (cacheHit) cachedNetworks.push(networkName);
              return { networkName, apps };
            } catch (error) {
              console.error(`Error fetching linked apps for ${networkName}:`, error);
              return { networkName, apps: [] };
            }
          });

          const linkedAppsResults = await Promise.all(linkedAppsPromises);

          const allLinkedApps: Record<string, string[]> = {};
          linkedAppsResults.forEach(({ networkName, apps }) => {
            allLinkedApps[networkName] = apps;
          });

          setLinkedApps(allLinkedApps);

          if (cachedNetworks.length > 0) {
            fetchFreshLinkedApps(cachedNetworks);
          }
        }
      } catch (error) {
        console.error('Error fetching networks and apps:', error);
        setError('Erro ao carregar redes');
      } finally {
        setLoading(false);
      }
    };

    const fetchFreshLinkedApps = async (networkNames: string[]) => {
      try {
        setIsUpdatingFromServer(true);

        // Fetch linked apps for specified networks without cache
        const linkedAppsPromises = networkNames.map(async (networkName) => {
          try {
            const { apps } = await svcGetLinkedApps(networkName, true);
            return { networkName, apps };
          } catch (error) {
            console.error(`Error fetching fresh linked apps for ${networkName}:`, error);
            return { networkName, apps: [] };
          }
        });

        const linkedAppsResults = await Promise.all(linkedAppsPromises);

        // Update only the linked apps of the specified networks
        linkedAppsResults.forEach(({ networkName, apps }) => {
          setLinkedApps((prev) => ({
            ...prev,
            [networkName]: apps,
          }));
        });
      } catch (error) {
        // Ignore errors during background refresh
        console.warn('Failed to fetch fresh linked apps data:', error);
      } finally {
        setIsUpdatingFromServer(false);
      }
    };

    fetchNetworksAndApps();
  }, []);

  const fetchLinkedApps = async (networkName: string) => {
    try {
      // Always fetch fresh data when called manually (after link/unlink actions)
      const { apps } = await svcGetLinkedApps(networkName, true);
      setLinkedApps((prev) => ({
        ...prev,
        [networkName]: apps,
      }));
    } catch (error) {
      console.error('Error fetching linked apps:', error);
    }
  };

  const handleLinkApp = async (networkName: string) => {
    const appName = newAppName[networkName]?.trim();
    if (!appName) return;

    setActionLoading((prev) => ({ ...prev, [networkName]: true }));

    try {
      const ok = await svcLinkApp(networkName, appName);
      if (ok) {
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
      const ok = await svcUnlinkApp(networkName, appName);
      if (ok) {
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
    router.push(`/apps/a/${appName}`);
  };

  const handleCreateNetwork = async () => {
    if (!newNetworkName.trim()) return;

    setCreateNetworkError(null);
    setCreatingNetwork(true);

    try {
      const status = await svcCreateNetwork(newNetworkName.trim());
      if (status === 200 || status === 201) {
        const networksData = await svcListNetworks();
        setNetworks(networksData);

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
      setCreatingNetwork(false);
    }
  };

  const handleDeleteNetwork = async (networkName: string) => {
    try {
      const ok = await svcDeleteNetwork(networkName);
      if (ok) {
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

  const networksList = Object.keys(networks);

  return (
    <>
      <NavBar session={props.session} />

      <main className={styles.root}>
        <Flex direction='column' gap='5' className={styles.mainContainer}>
          <HeaderSection onOpenCreateModal={() => setCreateModalOpen(true)} />

          <Separator size='4' style={{ margin: '10px 0' }} />

          {isUpdatingFromServer && <UpdatingIndicator />}

          {/* Loading state */}
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

          {/* Error state */}
          {error && <ErrorCard message={error} />}

          {/* Network list */}
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
                <NetworksAccordion
                  networksList={networksList}
                  linkedApps={linkedApps}
                  expandedNetwork={expandedNetwork}
                  onExpandedChange={(val) => setExpandedNetwork(val)}
                  newAppName={newAppName}
                  setNewAppName={setNewAppName}
                  actionLoading={actionLoading}
                  onLinkApp={handleLinkApp}
                  onViewApp={handleViewApp}
                  onOpenUnlink={(networkName, appName) =>
                    setUnlinkModalOpen({ networkName, appName })
                  }
                  onOpenDelete={(networkName) => setDeleteModalOpen(networkName)}
                />
              )}
            </>
          )}

          {/* Delete confirmation modal */}
          <ConfirmDeleteModal
            openName={deleteModalOpen}
            onClose={() => setDeleteModalOpen(null)}
            onConfirm={() => deleteModalOpen && handleDeleteNetwork(deleteModalOpen)}
          />

          {/* Unlink confirmation modal */}
          <ConfirmUnlinkModal
            state={unlinkModalOpen}
            onClose={() => setUnlinkModalOpen(null)}
            onConfirm={confirmUnlinkApp}
          />

          {/* Create network modal */}
          <CreateNetworkModal
            open={createModalOpen}
            onOpenChange={(open) => {
              setCreateModalOpen(open);
              if (!open) {
                setCreateNetworkError(null);
                setNewNetworkName('');
                setCreatingNetwork(false);
              }
            }}
            newNetworkName={newNetworkName}
            setNewNetworkName={(val) => setNewNetworkName(val)}
            creatingNetwork={creatingNetwork}
            createNetworkError={createNetworkError}
            onSubmit={handleCreateNetwork}
          />
        </Flex>
      </main>
    </>
  );
}
