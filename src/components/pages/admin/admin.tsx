import { InfoCircledIcon, ReloadIcon, TrashIcon } from '@radix-ui/react-icons';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  Select,
  Separator,
  Switch,
  Tabs,
  Text,
  TextField,
  Tooltip,
} from '@radix-ui/themes';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { AppIcon, NavBar, NetworkIcon, ServiceIcon } from '@/components';
import { api } from '@/lib';

import styles from './admin.module.css';

interface AdminPageProps {
  session: Session;
}

interface QuotaInfo {
  apps_quota: number;
  networks_quota: number;
  services_quota: number;
}

interface UserQuotaInfo extends QuotaInfo {
  email?: string;
}

export function AdminPage(props: AdminPageProps) {
  const { data: sessionData, update: updateSession } = useSession();
  const router = useRouter();

  const [usersList, setUsersList] = useState<string[]>([]);
  const [usersListLoading, setUsersListLoading] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');

  // Quota states
  const [userQuota, setUserQuota] = useState<UserQuotaInfo | null>(null);
  const [userQuotaLoading, setUserQuotaLoading] = useState(false);
  const [userQuotaError, setUserQuotaError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editQuota, setEditQuota] = useState<QuotaInfo>({
    apps_quota: 0,
    networks_quota: 0,
    services_quota: 0,
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  // Admin toggle for selected user
  const [selectedUserIsAdmin, setSelectedUserIsAdmin] = useState<boolean | null>(null);
  const [toggleAdminLoading, setToggleAdminLoading] = useState(false);
  const [confirmAdminModalOpen, setConfirmAdminModalOpen] = useState(false);
  const [pendingAdminValue, setPendingAdminValue] = useState<boolean | null>(null);

  // Takeover states
  const [showTakeoverModal, setShowTakeoverModal] = useState(false);
  const [takeoverLoading, setTakeoverLoading] = useState(false);

  // Admin gate states
  const [adminChecked, setAdminChecked] = useState(false);
  const [adminAllowed, setAdminAllowed] = useState(false);

  // Dokku tab states
  const [commandInput, setCommandInput] = useState('');
  const [commandLoading, setCommandLoading] = useState(false);
  const [commandOutput, setCommandOutput] = useState<string>('');
  const [commandError, setCommandError] = useState<string | null>(null);
  const [sshHistory, setSshHistory] = useState<string[] | null>(null);
  const [sshHistoryLoading, setSshHistoryLoading] = useState(false);
  const [sshHistoryError, setSshHistoryError] = useState<string | null>(null);
  const sshHistoryContainerRef = useRef<HTMLDivElement | null>(null);
  // Plugins tab states
  interface PluginInfo {
    version: string;
    status: string;
    description: string;
  }
  const [plugins, setPlugins] = useState<Array<{ name: string } & PluginInfo>>([]);
  const [pluginsLoading, setPluginsLoading] = useState(false);
  const [pluginsError, setPluginsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('usuarios');
  // Security tab states
  interface SecurityConfig {
    workers_count: number;
    max_connections_per_request: number;
    reload: boolean;
    log_level: string;
    api_key: string | null;
    api_name: string | null;
    api_version_number: string | null;
    volume_dir: string | null;
    ssh_server: { hostname: string; port: number; key_path: string } | null;
    database: {
      host: string;
      port: number;
      db_name: string;
      user: string;
      password: string;
      url: string;
    } | null;
    available_databases: string[] | null;
  }
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig | null>(null);
  const [securityConfigLoading, setSecurityConfigLoading] = useState(false);
  const [securityConfigError, setSecurityConfigError] = useState<string | null>(null);
  interface SshKeyInfo {
    file_path: string;
    directory: string;
    filename: string;
    size_bytes: number;
    permissions: string;
    owner_uid: number;
    group_gid: number;
    created_at: string;
    modified_at: string;
    accessed_at: string;
    is_readable: boolean;
    is_writable: boolean;
    is_executable: boolean;
  }
  const [sshKeyInfo, setSshKeyInfo] = useState<SshKeyInfo | null>(null);
  const [sshKeyLoading, setSshKeyLoading] = useState(false);
  const [sshKeyError, setSshKeyError] = useState<string | null>(null);

  // Danger Zone - Shutdown API states
  const [showShutdownModal, setShowShutdownModal] = useState(false);
  const [shutdownLoading, setShutdownLoading] = useState(false);
  const [shutdownConfirmText, setShutdownConfirmText] = useState('');
  const [shutdownKeyword, setShutdownKeyword] = useState('');
  const [shutdownError, setShutdownError] = useState<string | null>(null);

  // Admin users list states
  const [adminUsers, setAdminUsers] = useState<string[]>([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminUsersError, setAdminUsersError] = useState<string | null>(null);

  // Resources section states
  interface ResourceItem {
    name: string;
    user_email: string;
    created_at: string;
  }
  const [resourcesTab, setResourcesTab] = useState<'apps' | 'services' | 'networks'>('apps');
  const [resourcesList, setResourcesList] = useState<ResourceItem[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [resourcesError, setResourcesError] = useState<string | null>(null);
  const [resourcesLimit, setResourcesLimit] = useState<number>(20);
  const [resourcesOffset, setResourcesOffset] = useState<number>(0);

  const fetchResources = useCallback(
    async (tab: 'apps' | 'services' | 'networks', offset: number, limit: number) => {
      try {
        setResourcesLoading(true);
        setResourcesError(null);
        const resp = await api.post<ResourceItem[]>(
          `/api/admin/resources/${tab}/?offset=${offset}&limit=${limit}`
        );
        setResourcesList(resp.data || []);
      } catch (error) {
        console.error('Error fetching resources:', error);
        setResourcesError('Erro ao carregar recursos');
        setResourcesList([]);
      } finally {
        setResourcesLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    (async () => {
      await fetchResources(resourcesTab, resourcesOffset, resourcesLimit);
    })();
  }, [fetchResources, resourcesTab, resourcesOffset, resourcesLimit]);

  useEffect(() => {
    const checkAdminStatus = async (email: string): Promise<boolean> => {
      try {
        const response = await api.post<{ result: boolean }>(`/api/admin/users/${email}/admin/`);
        const allowed = response.data.result;
        setAdminAllowed(allowed);
        setAdminChecked(true);
        if (!allowed) {
          router.replace('/404');
        }
        return allowed;
      } catch (error) {
        console.error('Error checking admin status:', error);
        setAdminAllowed(false);
        setAdminChecked(true);
        router.replace('/404');
        return false;
      }
    };

    const fetchUsers = async () => {
      try {
        setUsersListLoading(true);
        const response = await api.post<string[]>('/api/admin/users/list/');
        setUsersList(response.data);
      } catch (error) {
        console.error('Error fetching users list:', error);
        setUsersList([]);
      } finally {
        setUsersListLoading(false);
      }
    };

    const run = async () => {
      const email = (sessionData || props.session)?.user?.email;
      if (!email) return;
      const allowed = await checkAdminStatus(email);
      if (allowed) {
        await fetchUsers();
        await fetchSshHistory();
        await fetchAdminUsers();
      }
    };

    run();
  }, [sessionData, props.session, router]);

  const searchUserData = async () => {
    if (!selectedUserEmail.trim()) return;

    try {
      setUserQuotaLoading(true);
      setUserQuotaError(null);

      const [quotaResp, adminResp] = await Promise.all([
        api.post<QuotaInfo>(`/api/admin/users/${selectedUserEmail}/quota/`),
        api.post<{ result: boolean }>(`/api/admin/users/${selectedUserEmail}/admin/`),
      ]);

      setUserQuota({ ...quotaResp.data, email: selectedUserEmail });
      setEditQuota(quotaResp.data);
      setSelectedUserIsAdmin(adminResp.data.result);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserQuotaError('Erro ao buscar informações do usuário');
      setUserQuota(null);
      setSelectedUserIsAdmin(null);
    } finally {
      setUserQuotaLoading(false);
    }
  };

  const updateUserQuota = async () => {
    if (!userQuota?.email) return;
    try {
      setUpdateLoading(true);
      await api.put(
        `/api/admin/users/${userQuota.email}/quota/`,
        {},
        {
          params: {
            apps_quota: editQuota.apps_quota,
            networks_quota: editQuota.networks_quota,
            services_quota: editQuota.services_quota,
          },
        }
      );
      setUserQuota({ ...editQuota, email: userQuota.email });
      setEditMode(false);
    } catch (error) {
      console.error('Error updating user quota:', error);
      setUserQuotaError('Erro ao atualizar quota do usuário');
    } finally {
      setUpdateLoading(false);
    }
  };

  const toggleUserAdmin = async (isAdmin: boolean) => {
    if (!selectedUserEmail.trim()) return;

    try {
      setToggleAdminLoading(true);
      await api.put(
        `/api/admin/users/${selectedUserEmail}/admin/`,
        {},
        { params: { is_admin: isAdmin } }
      );
      setSelectedUserIsAdmin(isAdmin);
    } catch (error) {
      console.error('Error toggling user admin:', error);
    } finally {
      setToggleAdminLoading(false);
    }
  };

  const performTakeover = async () => {
    if (!userQuota?.email) return;

    try {
      setTakeoverLoading(true);
      const response = await api.post<{ access_token: string }>(
        `/api/admin/users/${userQuota.email}/take-over/`
      );

      await updateSession({
        accessToken: response.data.access_token,
        user: {
          name: `Takeover User ${userQuota.email}`,
          email: userQuota.email,
        },
      });

      setShowTakeoverModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Error performing takeover:', error);
      setUserQuotaError('Erro ao realizar takeover do usuário');
    } finally {
      setTakeoverLoading(false);
    }
  };

  const session = sessionData || props.session;

  // Do not render anything until admin check completes, and hide content if not allowed
  const runDokkuCommand = async () => {
    if (!commandInput.trim()) return;
    try {
      setCommandLoading(true);
      setCommandError(null);
      setCommandOutput('');
      const resp = await api.post<{ message: string; success: boolean; command: string }>(
        `/api/admin/api/run-command/`,
        {},
        { params: { command: commandInput } }
      );
      setCommandOutput(resp.data.message || '');
    } catch (error) {
      console.error('Error running dokku command:', error);
      setCommandError('Erro ao executar comando Dokku');
    } finally {
      setCommandLoading(false);
    }
  };

  const fetchPlugins = useCallback(async () => {
    try {
      setPluginsLoading(true);
      setPluginsError(null);
      const resp = await api.post<{ success: boolean; result: Record<string, PluginInfo> }>(
        `/api/admin/plugins/list/`
      );
      const list = Object.entries(resp.data.result || {}).map(([name, info]) => ({
        name,
        ...info,
      }));
      setPlugins(list);
    } catch (error) {
      console.error('Error fetching plugins list:', error);
      setPluginsError('Erro ao carregar plugins');
      setPlugins([]);
    } finally {
      setPluginsLoading(false);
    }
  }, []);

  const fetchSecurityConfig = useCallback(async () => {
    try {
      setSecurityConfigLoading(true);
      setSecurityConfigError(null);
      const resp = await api.post<SecurityConfig>(`/api/admin/api/config/`);
      setSecurityConfig(resp.data);
    } catch (error) {
      console.error('Error fetching security config:', error);
      setSecurityConfigError('Erro ao carregar configurações');
      setSecurityConfig(null);
    } finally {
      setSecurityConfigLoading(false);
    }
  }, []);

  const fetchSshKeyInfo = useCallback(async () => {
    try {
      setSshKeyLoading(true);
      setSshKeyError(null);
      const resp = await api.post<SshKeyInfo>(`/api/admin/api/ssh-key/`);
      setSshKeyInfo(resp.data);
    } catch (error) {
      console.error('Error fetching SSH key info:', error);
      setSshKeyError('Erro ao carregar informações da chave SSH');
      setSshKeyInfo(null);
    } finally {
      setSshKeyLoading(false);
    }
  }, []);

  const fetchSshHistory = async () => {
    try {
      setSshHistoryLoading(true);
      setSshHistoryError(null);
      const resp = await api.post<{ status: string; history: string[] }>(
        `/api/admin/api/ssh-history/`
      );
      setSshHistory(resp.data.history || []);
    } catch (error) {
      console.error('Error fetching SSH history:', error);
      setSshHistoryError('Erro ao carregar histórico SSH');
      setSshHistory(null);
    } finally {
      setSshHistoryLoading(false);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      setAdminUsersLoading(true);
      setAdminUsersError(null);
      const resp = await api.post<string[]>(
        `/api/admin/users/list/`,
        {},
        { params: { only_admin: true } }
      );
      setAdminUsers(resp.data || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      setAdminUsersError('Erro ao carregar usuários administradores');
      setAdminUsers([]);
    } finally {
      setAdminUsersLoading(false);
    }
  };

  const generateShutdownKeyword = (): string => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let token = '';
    for (let i = 0; i < 6; i++) {
      token += letters[Math.floor(Math.random() * letters.length)];
    }
    return `shutdown-${token}`;
  };

  const performShutdown = async () => {
    try {
      setShutdownLoading(true);
      setShutdownError(null);
      await api.post(`/api/admin/api/shutdown/`);
      setShowShutdownModal(false);
      setShutdownConfirmText('');
    } catch (error) {
      console.error('Error shutting down API:', error);
      setShutdownError('Erro ao desligar a API');
    } finally {
      setShutdownLoading(false);
    }
  };

  // Always scroll SSH history to the end when updated
  useEffect(() => {
    const el = sshHistoryContainerRef.current;
    if (!el) return;
    if (sshHistory && sshHistory.length > 0) {
      el.scrollTop = el.scrollHeight;
    }
  }, [sshHistory]);

  // Load plugins when switching to the Plugins tab for the first time
  useEffect(() => {
    if (activeTab === 'plugins' && plugins.length === 0 && !pluginsLoading) {
      (async () => {
        await fetchPlugins();
      })();
    }
  }, [activeTab, fetchPlugins, plugins.length, pluginsLoading]);

  // Load security info when switching to Segurança tab for the first time
  useEffect(() => {
    if (activeTab === 'seguranca' && !securityConfig && !securityConfigLoading) {
      (async () => {
        await fetchSecurityConfig();
        await fetchSshKeyInfo();
      })();
    }
  }, [activeTab, fetchSecurityConfig, fetchSshKeyInfo, securityConfig, securityConfigLoading]);

  if (!adminChecked || !adminAllowed) {
    return null;
  }

  return (
    <>
      <NavBar session={session} />

      <main style={{ padding: '24px' }}>
        <Flex direction='column' gap='5' style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Box>
            <Heading
              size='7'
              weight='medium'
              style={{ color: 'var(--amber-12)', marginBottom: '4px' }}
            >
              Painel de Administrador
            </Heading>
          </Box>
          <Tabs.Root value={activeTab} onValueChange={setActiveTab} defaultValue='usuarios'>
            <Tabs.List color='orange' className={styles.tabsList}>
              <Tabs.Trigger style={{ cursor: 'pointer' }} value='usuarios'>
                Usuários
              </Tabs.Trigger>
              <Tabs.Trigger style={{ cursor: 'pointer' }} value='dokku'>
                Dokku
              </Tabs.Trigger>
              <Tabs.Trigger style={{ cursor: 'pointer' }} value='plugins'>
                Plugins
              </Tabs.Trigger>
              <Tabs.Trigger style={{ cursor: 'pointer' }} value='seguranca'>
                Segurança
              </Tabs.Trigger>
            </Tabs.List>

            {/* Usuários Tab */}
            <Tabs.Content value='usuarios'>
              {/* Recursos Section */}
              <Card
                style={{
                  border: '1px solid var(--amber-6)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <Flex direction='column' gap='3' style={{ padding: '12px' }}>
                  <Flex justify='between' align='center' className={styles.resourcesHeader}>
                    <Flex align='center' gap='3'>
                      <Heading size='5' weight='medium' style={{ color: 'var(--gray-12)' }}>
                        Recursos
                      </Heading>
                      <Tooltip content='Visualize todos os recursos ativos no sistema'>
                        <InfoCircledIcon style={{ color: 'var(--gray-9)' }} />
                      </Tooltip>
                    </Flex>
                    <Flex align='center' gap='2'>
                      <Text
                        size='2'
                        style={{ color: 'var(--gray-11)' }}
                        className={styles.resourcesLimitLabel}
                      >
                        Limite:
                      </Text>
                      <Select.Root
                        value={String(resourcesLimit)}
                        onValueChange={(value) => {
                          const lim = parseInt(value) || 20;
                          setResourcesLimit(lim);
                          setResourcesOffset(0);
                        }}
                      >
                        <Select.Trigger
                          style={{ width: '70px', cursor: 'pointer' }}
                          className={styles.resourcesLimitSelect}
                        />
                        <Select.Content>
                          <Select.Group>
                            {[10, 20, 30, 50, 100].map((val) => (
                              <Select.Item
                                key={val}
                                value={String(val)}
                                style={{ cursor: 'pointer' }}
                              >
                                {val}
                              </Select.Item>
                            ))}
                          </Select.Group>
                        </Select.Content>
                      </Select.Root>
                      <Button
                        variant='outline'
                        onClick={() =>
                          setResourcesOffset(Math.max(0, resourcesOffset - resourcesLimit))
                        }
                        disabled={resourcesLoading || resourcesOffset === 0}
                        style={{ cursor: 'pointer' }}
                        className={styles.resourcesNavButton}
                      >
                        Back
                      </Button>
                      <Button
                        variant='outline'
                        onClick={() => setResourcesOffset(resourcesOffset + resourcesLimit)}
                        disabled={
                          resourcesLoading ||
                          (resourcesList.length < resourcesLimit &&
                            resourcesOffset !== 0 &&
                            resourcesOffset % resourcesLimit === 0)
                        }
                        style={{ cursor: 'pointer' }}
                        className={styles.resourcesNavButton}
                      >
                        Next
                      </Button>
                    </Flex>
                  </Flex>

                  <Tabs.Root
                    value={resourcesTab}
                    onValueChange={(val) => {
                      setResourcesTab(val as 'apps' | 'services' | 'networks');
                      setResourcesOffset(0);
                    }}
                  >
                    <Tabs.List color='orange' className={styles.tabsList}>
                      <Tabs.Trigger style={{ cursor: 'pointer' }} value='apps'>
                        Aplicativos
                      </Tabs.Trigger>
                      <Tabs.Trigger style={{ cursor: 'pointer' }} value='services'>
                        Serviços
                      </Tabs.Trigger>
                      <Tabs.Trigger style={{ cursor: 'pointer' }} value='networks'>
                        Redes
                      </Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value='apps'>
                      <Box className={styles.resourcesTableWrapper}>
                        {resourcesError && (
                          <Text size='2' style={{ color: 'var(--red-11)' }}>
                            {resourcesError}
                          </Text>
                        )}
                        {resourcesLoading ? (
                          <Flex align='center' gap='2' style={{ padding: '8px' }}>
                            <Box className={styles.pluginsLoadingSpinner} aria-hidden='true' />
                            <Text size='2' style={{ color: 'var(--gray-11)' }}>
                              Carregando recursos...
                            </Text>
                          </Flex>
                        ) : (
                          <table className={styles.pluginsTable}>
                            <thead>
                              <tr>
                                <th>Email</th>
                                <th>Nome</th>
                                <th>Tipo</th>
                                <th>Criado em</th>
                              </tr>
                            </thead>
                            <tbody>
                              {resourcesList.map((r, idx) => (
                                <tr key={`${r.user_email}-${r.name}-${idx}`}>
                                  <td data-label='Email'>{r.user_email}</td>
                                  <td data-label='Nome'>{r.name}</td>
                                  <td data-label='Tipo'>Aplicativo</td>
                                  <td data-label='Criado em'>
                                    {new Date(r.created_at).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                              {resourcesList.length === 0 &&
                                !resourcesLoading &&
                                !resourcesError && (
                                  <tr>
                                    <td colSpan={4}>
                                      <Text size='2' style={{ color: 'var(--gray-11)' }}>
                                        Nenhum recurso encontrado.
                                      </Text>
                                    </td>
                                  </tr>
                                )}
                            </tbody>
                          </table>
                        )}
                      </Box>
                    </Tabs.Content>

                    <Tabs.Content value='services'>
                      <Box className={styles.resourcesTableWrapper}>
                        {resourcesError && (
                          <Text size='2' style={{ color: 'var(--red-11)' }}>
                            {resourcesError}
                          </Text>
                        )}
                        {resourcesLoading ? (
                          <Flex align='center' gap='2' style={{ padding: '8px' }}>
                            <Box className={styles.pluginsLoadingSpinner} aria-hidden='true' />
                            <Text size='2' style={{ color: 'var(--gray-11)' }}>
                              Carregando recursos...
                            </Text>
                          </Flex>
                        ) : (
                          <table className={styles.pluginsTable}>
                            <thead>
                              <tr>
                                <th>Email</th>
                                <th>Nome</th>
                                <th>Tipo</th>
                                <th>Criado em</th>
                              </tr>
                            </thead>
                            <tbody>
                              {resourcesList.map((r, idx) => (
                                <tr key={`${r.user_email}-${r.name}-${idx}`}>
                                  <td data-label='Email'>{r.user_email}</td>
                                  <td data-label='Nome'>{r.name}</td>
                                  <td data-label='Tipo'>Serviço</td>
                                  <td data-label='Criado em'>
                                    {new Date(r.created_at).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                              {resourcesList.length === 0 &&
                                !resourcesLoading &&
                                !resourcesError && (
                                  <tr>
                                    <td colSpan={4}>
                                      <Text size='2' style={{ color: 'var(--gray-11)' }}>
                                        Nenhum recurso encontrado.
                                      </Text>
                                    </td>
                                  </tr>
                                )}
                            </tbody>
                          </table>
                        )}
                      </Box>
                    </Tabs.Content>

                    <Tabs.Content value='networks'>
                      <Box className={styles.resourcesTableWrapper}>
                        {resourcesError && (
                          <Text size='2' style={{ color: 'var(--red-11)' }}>
                            {resourcesError}
                          </Text>
                        )}
                        {resourcesLoading ? (
                          <Flex align='center' gap='2' style={{ padding: '8px' }}>
                            <Box className={styles.pluginsLoadingSpinner} aria-hidden='true' />
                            <Text size='2' style={{ color: 'var(--gray-11)' }}>
                              Carregando recursos...
                            </Text>
                          </Flex>
                        ) : (
                          <table className={styles.pluginsTable}>
                            <thead>
                              <tr>
                                <th>Email</th>
                                <th>Nome</th>
                                <th>Tipo</th>
                                <th>Criado em</th>
                              </tr>
                            </thead>
                            <tbody>
                              {resourcesList.map((r, idx) => (
                                <tr key={`${r.user_email}-${r.name}-${idx}`}>
                                  <td data-label='Email'>{r.user_email}</td>
                                  <td data-label='Nome'>{r.name}</td>
                                  <td data-label='Tipo'>Rede</td>
                                  <td data-label='Criado em'>
                                    {new Date(r.created_at).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                              {resourcesList.length === 0 &&
                                !resourcesLoading &&
                                !resourcesError && (
                                  <tr>
                                    <td colSpan={4}>
                                      <Text size='2' style={{ color: 'var(--gray-11)' }}>
                                        Nenhum recurso encontrado.
                                      </Text>
                                    </td>
                                  </tr>
                                )}
                            </tbody>
                          </table>
                        )}
                      </Box>
                    </Tabs.Content>
                  </Tabs.Root>
                </Flex>
              </Card>

              <Card
                style={{
                  border: '1px solid var(--amber-6)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  marginTop: '12px',
                }}
              >
                <Flex direction='column' gap='4' style={{ padding: '12px' }}>
                  <Flex align='center' gap='3'>
                    <Heading size='5' weight='medium' style={{ color: 'var(--gray-12)' }}>
                      Seleção de Usuário
                    </Heading>
                    <Tooltip content='Selecione o usuário para gerenciar'>
                      <InfoCircledIcon style={{ color: 'var(--gray-9)' }} />
                    </Tooltip>
                  </Flex>

                  <Flex gap='3' align='center'>
                    <Select.Root
                      value={selectedUserEmail}
                      onValueChange={(value) => {
                        setSelectedUserEmail(value);
                        setUserQuota(null);
                        setUserQuotaError(null);
                        setEditMode(false);
                        setSelectedUserIsAdmin(null);
                      }}
                      disabled={usersListLoading}
                    >
                      <Select.Trigger
                        placeholder={
                          usersListLoading ? 'Carregando usuários...' : 'Selecione um usuário'
                        }
                        style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                      />
                      <Select.Content>
                        <Select.Group>
                          {usersList.map((email) => (
                            <Select.Item style={{ cursor: 'pointer' }} key={email} value={email}>
                              <span className={styles.selectItemEmail}>{email}</span>
                            </Select.Item>
                          ))}
                        </Select.Group>
                      </Select.Content>
                    </Select.Root>
                    <Button
                      style={{ cursor: 'pointer' }}
                      onClick={searchUserData}
                      disabled={userQuotaLoading || !selectedUserEmail.trim()}
                    >
                      {userQuotaLoading ? 'Buscando...' : 'Buscar'}
                    </Button>
                  </Flex>

                  {userQuotaError && (
                    <Flex
                      align='center'
                      gap='3'
                      style={{
                        padding: '12px',
                        backgroundColor: 'var(--red-2)',
                        borderRadius: '8px',
                        border: '1px solid var(--red-6)',
                      }}
                    >
                      <Text size='3' style={{ color: 'var(--red-11)' }}>
                        {userQuotaError}
                      </Text>
                    </Flex>
                  )}

                  {userQuota && (
                    <Box
                      style={{
                        padding: '16px',
                        backgroundColor: 'var(--gray-2)',
                        borderRadius: '12px',
                        border: '1px solid var(--gray-6)',
                      }}
                    >
                      <Flex direction='column' gap='4'>
                        <Flex justify='between' align='center' className={styles.userHeader}>
                          <Flex align='center' gap='3'>
                            <Avatar
                              size='3'
                              className={styles.userAvatar}
                              fallback={userQuota.email?.charAt(0).toUpperCase() || 'U'}
                              radius='full'
                            />
                            <Text
                              size='3'
                              weight='bold'
                              style={{ color: 'var(--gray-12)' }}
                              className={styles.userEmailText}
                            >
                              {userQuota.email}
                            </Text>
                          </Flex>
                          <Separator size='4' className={styles.userControlsSeparator} />
                          <Flex className={styles.userControls}>
                            <Flex align='center' gap='3' className={styles.adminSwitchRow}>
                              <Text size='2' style={{ color: 'var(--gray-11)' }}>
                                Admin?
                              </Text>
                              <Switch
                                style={{ cursor: 'pointer' }}
                                checked={!!selectedUserIsAdmin}
                                onCheckedChange={(checked) => {
                                  setPendingAdminValue(!!checked);
                                  setConfirmAdminModalOpen(true);
                                }}
                                disabled={toggleAdminLoading || selectedUserIsAdmin === null}
                              />
                            </Flex>
                            <Button
                              size='2'
                              color='red'
                              onClick={() => setShowTakeoverModal(true)}
                              className={styles.takeoverButton}
                              style={{
                                backgroundColor: 'var(--red-9)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                              }}
                            >
                              <svg
                                width='14'
                                height='14'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                              >
                                <circle
                                  cx='9'
                                  cy='7'
                                  r='4'
                                  stroke='currentColor'
                                  strokeWidth='2'
                                  fill='none'
                                />
                                <path
                                  d='M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2'
                                  stroke='currentColor'
                                  strokeWidth='2'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                />
                                <path
                                  d='M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85'
                                  stroke='currentColor'
                                  strokeWidth='2'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                />
                                <path
                                  d='M17 8h4m0 0l-2-2m2 2l-2 2'
                                  stroke='currentColor'
                                  strokeWidth='2'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                />
                              </svg>
                              Takeover
                            </Button>
                          </Flex>
                        </Flex>

                        <Separator size='4' />

                        <Flex direction='column' gap='3'>
                          {/* Aplicativos */}
                          <Flex
                            justify='between'
                            align='center'
                            style={{
                              padding: '12px',
                              backgroundColor: 'var(--blue-2)',
                              borderRadius: '8px',
                              border: '1px solid var(--blue-6)',
                            }}
                          >
                            <Flex align='center' gap='3'>
                              <Box
                                style={{
                                  color: 'var(--blue-11)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  height: '20px',
                                }}
                              >
                                <AppIcon />
                              </Box>
                              <Text
                                size='3'
                                weight='medium'
                                style={{ color: 'var(--blue-12)' }}
                                className={styles.quotaLabel}
                              >
                                Aplicativos
                              </Text>
                            </Flex>
                            {editMode ? (
                              <TextField.Root
                                type='number'
                                value={editQuota.apps_quota.toString()}
                                onChange={(e) =>
                                  setEditQuota({
                                    ...editQuota,
                                    apps_quota: parseInt(e.target.value) || 0,
                                  })
                                }
                                style={{ width: '50px' }}
                              />
                            ) : (
                              <Badge
                                size='1'
                                className={styles.quotaValue}
                                style={{ backgroundColor: 'var(--blue-9)', color: 'white' }}
                              >
                                {userQuota.apps_quota}
                              </Badge>
                            )}
                          </Flex>

                          {/* Serviços */}
                          <Flex
                            justify='between'
                            align='center'
                            style={{
                              padding: '12px',
                              backgroundColor: 'var(--purple-2)',
                              borderRadius: '8px',
                              border: '1px solid var(--purple-6)',
                            }}
                          >
                            <Flex align='center' gap='3'>
                              <Box
                                style={{
                                  color: 'var(--purple-11)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  height: '20px',
                                }}
                              >
                                <ServiceIcon />
                              </Box>
                              <Text
                                size='3'
                                weight='medium'
                                style={{ color: 'var(--purple-12)' }}
                                className={styles.quotaLabel}
                              >
                                Serviços
                              </Text>
                            </Flex>
                            {editMode ? (
                              <TextField.Root
                                type='number'
                                value={editQuota.services_quota.toString()}
                                onChange={(e) =>
                                  setEditQuota({
                                    ...editQuota,
                                    services_quota: parseInt(e.target.value) || 0,
                                  })
                                }
                                style={{ width: '50px' }}
                              />
                            ) : (
                              <Badge
                                size='1'
                                className={styles.quotaValue}
                                style={{ backgroundColor: 'var(--purple-9)', color: 'white' }}
                              >
                                {userQuota.services_quota}
                              </Badge>
                            )}
                          </Flex>

                          {/* Redes */}
                          <Flex
                            justify='between'
                            align='center'
                            style={{
                              padding: '12px',
                              backgroundColor: 'var(--green-2)',
                              borderRadius: '8px',
                              border: '1px solid var(--green-6)',
                            }}
                          >
                            <Flex align='center' gap='3'>
                              <Box
                                style={{
                                  color: 'var(--green-11)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  height: '20px',
                                }}
                              >
                                <NetworkIcon />
                              </Box>
                              <Text
                                size='3'
                                weight='medium'
                                style={{ color: 'var(--green-12)' }}
                                className={styles.quotaLabel}
                              >
                                Redes
                              </Text>
                            </Flex>
                            {editMode ? (
                              <TextField.Root
                                type='number'
                                value={editQuota.networks_quota.toString()}
                                onChange={(e) =>
                                  setEditQuota({
                                    ...editQuota,
                                    networks_quota: parseInt(e.target.value) || 0,
                                  })
                                }
                                style={{ width: '50px' }}
                              />
                            ) : (
                              <Badge
                                size='1'
                                className={styles.quotaValue}
                                style={{ backgroundColor: 'var(--green-9)', color: 'white' }}
                              >
                                {userQuota.networks_quota}
                              </Badge>
                            )}
                          </Flex>
                        </Flex>

                        <Flex justify='end' gap='2'>
                          {!editMode ? (
                            <Button
                              variant='outline'
                              color='orange'
                              size='2'
                              style={{ cursor: 'pointer' }}
                              onClick={() => setEditMode(true)}
                            >
                              Editar
                            </Button>
                          ) : (
                            <>
                              <Button
                                color='gray'
                                size='2'
                                variant='soft'
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  setEditMode(false);
                                  setEditQuota(userQuota);
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button
                                color='orange'
                                size='2'
                                style={{ cursor: 'pointer' }}
                                onClick={updateUserQuota}
                                disabled={updateLoading}
                              >
                                {updateLoading ? 'Salvando...' : 'Salvar'}
                              </Button>
                            </>
                          )}
                        </Flex>
                      </Flex>
                    </Box>
                  )}
                </Flex>
              </Card>

              {/* Administradores */}
              <Card
                style={{
                  border: '1px solid var(--amber-6)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  marginTop: '12px',
                }}
              >
                <Flex direction='column' gap='3' style={{ padding: '12px' }}>
                  <Flex justify='between' align='center'>
                    <Flex align='center' gap='3'>
                      <Heading size='5' weight='medium' style={{ color: 'var(--gray-12)' }}>
                        Usuários Administradores
                      </Heading>
                      <Tooltip content='Lista de usuários com privilégio de administrador'>
                        <InfoCircledIcon style={{ color: 'var(--gray-9)' }} />
                      </Tooltip>
                    </Flex>
                  </Flex>

                  {adminUsersError && (
                    <Text size='2' style={{ color: 'var(--red-11)' }}>
                      {adminUsersError}
                    </Text>
                  )}

                  {adminUsersLoading ? (
                    <Text size='2' style={{ color: 'var(--gray-11)' }}>
                      Carregando usuários admin...
                    </Text>
                  ) : adminUsers.length === 0 ? (
                    <Text size='2' style={{ color: 'var(--gray-11)' }}>
                      Nenhum administrador encontrado.
                    </Text>
                  ) : (
                    <Flex direction='column' gap='2'>
                      {adminUsers.map((email) => (
                        <Flex
                          key={email}
                          justify='between'
                          align='center'
                          style={{
                            border: '1px solid var(--gray-6)',
                            borderRadius: 8,
                            padding: 8,
                            backgroundColor: 'var(--gray-1)',
                          }}
                        >
                          <Text
                            size='3'
                            style={{ color: 'var(--gray-12)' }}
                            className={styles.adminListItemEmail}
                          >
                            {email}
                          </Text>
                          <Button
                            variant='surface'
                            color='red'
                            size='2'
                            className={styles.adminListItemButton}
                            onClick={() => {
                              setSelectedUserEmail(email);
                              setPendingAdminValue(false);
                              setConfirmAdminModalOpen(true);
                            }}
                          >
                            <TrashIcon />
                          </Button>
                        </Flex>
                      ))}
                    </Flex>
                  )}
                </Flex>
              </Card>
            </Tabs.Content>

            {/* Dokku Tab */}
            <Tabs.Content value='dokku'>
              <Flex direction='column' gap='4' style={{ marginTop: '12px' }}>
                {/* Rodar comandos Dokku */}
                <Card
                  style={{
                    border: '1px solid var(--amber-6)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <Flex direction='column' gap='3' style={{ padding: '12px' }}>
                    <Flex align='center' gap='3'>
                      <Heading size='5' weight='medium' style={{ color: 'var(--gray-12)' }}>
                        Rodar comando no Dokku
                      </Heading>
                      <Tooltip content='Execute qualquer comando Dokku disponível'>
                        <InfoCircledIcon style={{ color: 'var(--gray-9)' }} />
                      </Tooltip>
                    </Flex>
                    <Flex gap='2' align='center'>
                      <TextField.Root
                        color='orange'
                        placeholder='dokku apps'
                        value={commandInput}
                        onChange={(e) => setCommandInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') runDokkuCommand();
                        }}
                        style={{ flex: 1 }}
                      />
                      <Button
                        color='orange'
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                        onClick={runDokkuCommand}
                        disabled={commandLoading || !commandInput.trim()}
                      >
                        {commandLoading ? (
                          'Executando...'
                        ) : (
                          <>
                            <svg
                              width='18'
                              height='18'
                              viewBox='0 0 24 24'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <rect
                                x='3'
                                y='4'
                                width='18'
                                height='14'
                                rx='2'
                                stroke='currentColor'
                                strokeWidth='2'
                                fill='none'
                              />
                              <path
                                d='M7 9l3 3-3 3'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                              <path
                                d='M13 15h4'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                            Executar
                          </>
                        )}
                      </Button>
                    </Flex>
                    {commandError && (
                      <Text size='2' style={{ color: 'var(--red-11)' }}>
                        {commandError}
                      </Text>
                    )}
                    <Box
                      style={{
                        backgroundColor: 'var(--gray-1)',
                        border: '1px solid var(--gray-6)',
                        borderRadius: 8,
                        padding: 12,
                        maxHeight: 280,
                        overflow: 'auto',
                        fontFamily: 'monospace',
                        fontSize: 12,
                      }}
                    >
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{commandOutput}</pre>
                    </Box>
                  </Flex>
                </Card>

                {/* Histórico SSH */}
                <Card
                  style={{
                    border: '1px solid var(--amber-6)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <Flex direction='column' gap='3' style={{ padding: '12px' }}>
                    <Flex justify='between' align='center' className={styles.sshHeader}>
                      <Flex align='center' gap='3'>
                        <Heading size='5' weight='medium' style={{ color: 'var(--gray-12)' }}>
                          Histórico SSH
                        </Heading>
                        <Tooltip content='Últimos comandos executados via SSH'>
                          <InfoCircledIcon style={{ color: 'var(--gray-9)' }} />
                        </Tooltip>
                      </Flex>
                      <Button
                        className={styles.sshUpdateButton}
                        onClick={fetchSshHistory}
                        disabled={sshHistoryLoading}
                        variant='outline'
                      >
                        <ReloadIcon className={sshHistoryLoading ? styles.buttonSpinner : ''} />
                        {sshHistoryLoading ? 'Atualizando...' : 'Atualizar'}
                      </Button>
                    </Flex>
                    {sshHistoryError && (
                      <Text size='2' style={{ color: 'var(--red-11)' }}>
                        {sshHistoryError}
                      </Text>
                    )}
                    <Box
                      ref={sshHistoryContainerRef}
                      style={{
                        backgroundColor: 'var(--gray-1)',
                        border: '1px solid var(--gray-6)',
                        borderRadius: 8,
                        padding: 12,
                        maxHeight: 280,
                        overflow: 'auto',
                        fontFamily: 'monospace',
                        fontSize: 12,
                      }}
                    >
                      {sshHistory && sshHistory.length > 0 ? (
                        <ul style={{ paddingLeft: 16, margin: 0 }}>
                          {sshHistory.map((line, idx) => (
                            <li key={idx} style={{ marginBottom: 4 }}>
                              {line}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Text size='2' style={{ color: 'var(--gray-11)' }}>
                          {sshHistoryLoading
                            ? 'Carregando...'
                            : 'Sem histórico disponível. Clique em Atualizar.'}
                        </Text>
                      )}
                    </Box>
                  </Flex>
                </Card>
              </Flex>
            </Tabs.Content>

            {/* Plugins Tab */}
            <Tabs.Content value='plugins'>
              <Card
                style={{
                  border: '1px solid var(--amber-6)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  marginTop: '12px',
                }}
              >
                <Flex direction='column' gap='3' style={{ padding: '12px' }}>
                  <Flex justify='between' align='center' className={styles.pluginsHeader}>
                    <Flex align='center' gap='3'>
                      <Heading size='5' weight='medium' style={{ color: 'var(--gray-12)' }}>
                        Plugins
                      </Heading>
                      <Tooltip content='Lista de plugins instalados no Dokku'>
                        <InfoCircledIcon style={{ color: 'var(--gray-9)' }} />
                      </Tooltip>
                    </Flex>
                    <Button
                      onClick={() => fetchPlugins()}
                      disabled={pluginsLoading}
                      variant='outline'
                      style={{ cursor: 'pointer' }}
                    >
                      <ReloadIcon className={pluginsLoading ? styles.buttonSpinner : ''} />
                      <span className={styles.refreshLabel}>
                        {pluginsLoading ? 'Atualizando...' : 'Atualizar'}
                      </span>
                    </Button>
                  </Flex>
                  {pluginsError && (
                    <Text size='2' style={{ color: 'var(--red-11)' }}>
                      {pluginsError}
                    </Text>
                  )}
                  {pluginsLoading ? (
                    <Flex align='center' gap='2' style={{ padding: '8px' }}>
                      <Box className={styles.pluginsLoadingSpinner} aria-hidden='true' />
                      <Text size='2' style={{ color: 'var(--gray-11)' }}>
                        Carregando plugins...
                      </Text>
                    </Flex>
                  ) : (
                    <Box className={styles.pluginsTableWrapper}>
                      <table className={styles.pluginsTable}>
                        <thead>
                          <tr>
                            <th>Nome</th>
                            <th>Versão</th>
                            <th>Status</th>
                            <th>Descrição</th>
                          </tr>
                        </thead>
                        <tbody>
                          {plugins.map((p) => (
                            <tr key={p.name}>
                              <td data-label='Nome'>{p.name}</td>
                              <td data-label='Versão'>{p.version}</td>
                              <td data-label='Status'>
                                <Badge
                                  size='1'
                                  className={
                                    p.status === 'enabled'
                                      ? styles.statusEnabled
                                      : styles.statusDisabled
                                  }
                                >
                                  {p.status}
                                </Badge>
                              </td>
                              <td data-label='Descrição'>{p.description}</td>
                            </tr>
                          ))}
                          {plugins.length === 0 && !pluginsLoading && !pluginsError && (
                            <tr>
                              <td colSpan={4}>
                                <Text size='2' style={{ color: 'var(--gray-11)' }}>
                                  Nenhum plugin listado.
                                </Text>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </Box>
                  )}
                </Flex>
              </Card>
            </Tabs.Content>

            {/* Segurança Tab */}
            <Tabs.Content value='seguranca'>
              <Flex direction='column' gap='4' style={{ marginTop: '12px' }}>
                {/* Configurações */}
                <Card
                  style={{
                    border: '1px solid var(--amber-6)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <Flex direction='column' gap='3' style={{ padding: '12px' }}>
                    <Flex justify='between' align='center'>
                      <Flex align='center' gap='3'>
                        <Heading size='5' weight='medium' style={{ color: 'var(--gray-12)' }}>
                          Configurações
                        </Heading>
                        <Tooltip content='Informações de configuração da API e servidor'>
                          <InfoCircledIcon style={{ color: 'var(--gray-9)' }} />
                        </Tooltip>
                      </Flex>
                      <Button
                        onClick={fetchSecurityConfig}
                        disabled={securityConfigLoading}
                        variant='outline'
                        style={{ cursor: 'pointer' }}
                      >
                        <ReloadIcon className={securityConfigLoading ? styles.buttonSpinner : ''} />
                        <span className={styles.refreshLabel}>
                          {securityConfigLoading ? 'Atualizando...' : 'Atualizar'}
                        </span>
                      </Button>
                    </Flex>
                    {securityConfigError && (
                      <Text size='2' style={{ color: 'var(--red-11)' }}>
                        {securityConfigError}
                      </Text>
                    )}
                    {securityConfig && (
                      <Flex direction='column' gap='3'>
                        <Box
                          style={{
                            backgroundColor: 'var(--gray-1)',
                            border: '1px solid var(--gray-6)',
                            borderRadius: 8,
                            padding: 12,
                          }}
                        >
                          <Heading size='4' style={{ color: 'var(--gray-12)', marginBottom: 8 }}>
                            General
                          </Heading>
                          <Flex direction='column' gap='2'>
                            <Text size='2'>
                              <strong>API Version: </strong>
                              {securityConfig.api_version_number ?? '—'}
                            </Text>
                            <Text size='2'>
                              <strong>Workers: </strong>
                              {securityConfig.workers_count}
                            </Text>
                            <Text size='2'>
                              <strong>Max connections per request: </strong>
                              {securityConfig.max_connections_per_request}
                            </Text>
                            <Text size='2'>
                              <strong>Reload: </strong>
                              {securityConfig.reload ? 'true' : 'false'}
                            </Text>
                            <Text size='2'>
                              <strong>Log Level: </strong>
                              {securityConfig.log_level}
                            </Text>
                            {securityConfig.api_key && (
                              <Text size='2'>
                                <strong>API Key: </strong>
                                <code>{securityConfig.api_key}</code>
                              </Text>
                            )}
                            {securityConfig.volume_dir && (
                              <Text size='2'>
                                <strong>Volume Dir: </strong>
                                <code>{securityConfig.volume_dir}</code>
                              </Text>
                            )}
                          </Flex>
                        </Box>
                        <Box
                          style={{
                            backgroundColor: 'var(--gray-1)',
                            border: '1px solid var(--gray-6)',
                            borderRadius: 8,
                            padding: 12,
                          }}
                        >
                          <Heading size='4' style={{ color: 'var(--gray-12)', marginBottom: 8 }}>
                            SSH Server
                          </Heading>
                          {securityConfig.ssh_server ? (
                            <Flex direction='column' gap='2'>
                              <Text size='2'>
                                <strong>Hostname: </strong>
                                {securityConfig.ssh_server.hostname}
                              </Text>
                              <Text size='2'>
                                <strong>Port: </strong>
                                {securityConfig.ssh_server.port}
                              </Text>
                              <Text size='2'>
                                <strong>Key Path: </strong>
                                <code>{securityConfig.ssh_server.key_path}</code>
                              </Text>
                            </Flex>
                          ) : (
                            <Text size='2' style={{ color: 'var(--gray-11)' }}>
                              Sem informação de servidor SSH.
                            </Text>
                          )}
                        </Box>
                        <Box
                          style={{
                            backgroundColor: 'var(--gray-1)',
                            border: '1px solid var(--gray-6)',
                            borderRadius: 8,
                            padding: 12,
                          }}
                        >
                          <Heading size='4' style={{ color: 'var(--gray-12)', marginBottom: 8 }}>
                            Database
                          </Heading>
                          {securityConfig.database ? (
                            <Flex direction='column' gap='2'>
                              <Text size='2'>
                                <strong>Host: </strong>
                                {securityConfig.database.host}
                              </Text>
                              <Text size='2'>
                                <strong>Port: </strong>
                                {securityConfig.database.port}
                              </Text>
                              <Text size='2'>
                                <strong>Name: </strong>
                                {securityConfig.database.db_name}
                              </Text>
                              <Text size='2'>
                                <strong>User: </strong>
                                {securityConfig.database.user}
                              </Text>
                              <Text size='2'>
                                <strong>URI: </strong> <code>{securityConfig.database.url}</code>
                              </Text>
                            </Flex>
                          ) : (
                            <Text size='2' style={{ color: 'var(--gray-11)' }}>
                              Sem informação de banco de dados.
                            </Text>
                          )}
                          {securityConfig.available_databases &&
                            securityConfig.available_databases.length > 0 && (
                              <Box style={{ marginTop: 8 }}>
                                <Text size='2' style={{ color: 'var(--gray-11)' }}>
                                  Available Services:
                                </Text>
                                <Flex wrap='wrap' gap='2' style={{ marginTop: 6 }}>
                                  {securityConfig.available_databases.map((db) => (
                                    <Badge key={db} size='1' variant='soft'>
                                      {db}
                                    </Badge>
                                  ))}
                                </Flex>
                              </Box>
                            )}
                        </Box>
                      </Flex>
                    )}
                  </Flex>
                </Card>

                {/* Chave SSH */}
                <Card
                  style={{
                    border: '1px solid var(--amber-6)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <Flex direction='column' gap='3' style={{ padding: '12px' }}>
                    <Flex justify='between' align='center'>
                      <Flex align='center' gap='3'>
                        <Heading size='5' weight='medium' style={{ color: 'var(--gray-12)' }}>
                          SSH Key
                        </Heading>
                        <Tooltip content='Informações e atualização da chave SSH usada nas operações'>
                          <InfoCircledIcon style={{ color: 'var(--gray-9)' }} />
                        </Tooltip>
                      </Flex>
                      <Button
                        onClick={fetchSshKeyInfo}
                        disabled={sshKeyLoading}
                        variant='outline'
                        style={{ cursor: 'pointer' }}
                      >
                        <ReloadIcon className={sshKeyLoading ? styles.buttonSpinner : ''} />
                        <span className={styles.refreshLabel}>
                          {sshKeyLoading ? 'Atualizando...' : 'Atualizar'}
                        </span>
                      </Button>
                    </Flex>
                    {sshKeyError && (
                      <Text size='2' style={{ color: 'var(--red-11)' }}>
                        {sshKeyError}
                      </Text>
                    )}
                    {sshKeyInfo && (
                      <Box
                        style={{
                          backgroundColor: 'var(--gray-1)',
                          border: '1px solid var(--gray-6)',
                          borderRadius: 8,
                          padding: 12,
                        }}
                      >
                        <Flex direction='column' gap='2'>
                          <Text size='2'>
                            <strong>File: </strong>
                            <code>{sshKeyInfo.file_path}</code>
                          </Text>
                          <Text size='2'>
                            <strong>Path: </strong>
                            <code>{sshKeyInfo.directory}</code>
                          </Text>
                          <Text size='2'>
                            <strong>Name: </strong>
                            {sshKeyInfo.filename}
                          </Text>
                          <Text size='2'>
                            <strong>Size: </strong>
                            {sshKeyInfo.size_bytes} bytes
                          </Text>
                          <Text size='2'>
                            <strong>Permissions: </strong>
                            {sshKeyInfo.permissions}
                          </Text>
                          <Text size='2'>
                            <strong>Owner UID: </strong>
                            {sshKeyInfo.owner_uid}
                          </Text>
                          <Text size='2'>
                            <strong>Group GID: </strong>
                            {sshKeyInfo.group_gid}
                          </Text>
                          <Text size='2'>
                            <strong>Created at: </strong>
                            {new Date(sshKeyInfo.created_at).toLocaleString()}
                          </Text>
                          <Text size='2'>
                            <strong>Modified at: </strong>
                            {new Date(sshKeyInfo.modified_at).toLocaleString()}
                          </Text>
                          <Text size='2'>
                            <strong>Accessed at: </strong>
                            {new Date(sshKeyInfo.accessed_at).toLocaleString()}
                          </Text>
                          <Flex gap='2' style={{ marginTop: 6 }} className={styles.sshKeyBadges}>
                            <Badge
                              size='1'
                              variant='soft'
                              color={sshKeyInfo.is_readable ? 'green' : 'red'}
                            >
                              {sshKeyInfo.is_readable ? 'readable' : 'not readable'}
                            </Badge>
                            <Badge
                              size='1'
                              variant='soft'
                              color={sshKeyInfo.is_writable ? 'green' : 'red'}
                            >
                              {sshKeyInfo.is_writable ? 'writable' : 'not writable'}
                            </Badge>
                            <Badge
                              size='1'
                              variant='soft'
                              color={sshKeyInfo.is_executable ? 'green' : 'red'}
                            >
                              {sshKeyInfo.is_executable ? 'executable' : 'not executable'}
                            </Badge>
                          </Flex>
                        </Flex>
                      </Box>
                    )}

                    {/* Upload de chave SSH removido conforme solicitado */}
                  </Flex>
                </Card>

                {/* Zona de Perigo - Desligar API */}
                <Box style={{ marginTop: '45px' }}>
                  <Heading size='5' style={{ marginBottom: '12px', color: 'var(--red-11)' }}>
                    Zona de Perigo
                  </Heading>
                  <Card
                    style={{
                      border: '1px solid var(--red-6)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      padding: '16px',
                      background: 'var(--red-2)',
                    }}
                  >
                    <Flex
                      align='center'
                      justify='between'
                      gap='4'
                      className={styles.dangerZoneHeader}
                    >
                      <Flex direction='column' gap='1'>
                        <Text
                          size='3'
                          weight='bold'
                          style={{ color: 'var(--gray-12)', display: 'block' }}
                        >
                          Encerrar serviço Dokku-API
                        </Text>
                        <Text size='2' style={{ color: 'var(--gray-11)', display: 'block' }}>
                          Uma vez que você desligar a API, as funcionalidades do website ficarão
                          indisponíveis até reiniciar a API no servidor internamente.
                        </Text>
                      </Flex>
                      <Button
                        size='2'
                        onClick={() => {
                          setShutdownKeyword(generateShutdownKeyword());
                          setShutdownConfirmText('');
                          setShowShutdownModal(true);
                        }}
                        style={{
                          background: 'var(--gray-4)',
                          color: 'var(--red-9)',
                          border: '1px solid var(--gray-7)',
                          cursor: 'pointer',
                        }}
                        className={styles.dangerZoneButton}
                      >
                        <TrashIcon />
                        Desligar API
                      </Button>
                    </Flex>
                    {shutdownError && (
                      <Text size='2' style={{ color: 'var(--red-11)' }}>
                        {shutdownError}
                      </Text>
                    )}
                  </Card>
                </Box>
              </Flex>
            </Tabs.Content>
          </Tabs.Root>
        </Flex>
      </main>

      {/* Modal de confirmação de takeover */}
      <Dialog.Root open={showTakeoverModal} onOpenChange={setShowTakeoverModal}>
        <Dialog.Content maxWidth='450px' style={{ padding: '24px' }}>
          <Dialog.Title style={{ marginBottom: '12px' }}>Confirmar Takeover</Dialog.Title>
          <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
            Tem certeza que deseja assumir o controle da conta <strong>{userQuota?.email}</strong>?
            Esta ação irá substituir sua sessão atual pela sessão da conta selecionada.
            <br />
            <br />
            Quaisquer ações terão <strong>impacto real</strong> na conta desse usuário.
          </Dialog.Description>

          <Flex gap='3' mt='4' justify='end'>
            <Dialog.Close>
              <Button variant='soft' color='gray' style={{ cursor: 'pointer' }}>
                Cancelar
              </Button>
            </Dialog.Close>
            <Button
              color='red'
              onClick={performTakeover}
              disabled={takeoverLoading}
              style={{ backgroundColor: 'var(--red-9)', color: 'white', cursor: 'pointer' }}
            >
              {takeoverLoading ? 'Processando...' : 'Confirmar Takeover'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Modal de confirmação de privilégio de admin */}
      <Dialog.Root open={confirmAdminModalOpen} onOpenChange={setConfirmAdminModalOpen}>
        <Dialog.Content maxWidth='450px' style={{ padding: '24px' }}>
          <Dialog.Title style={{ marginBottom: '12px' }}>
            Confirmar Alteração de Privilégio
          </Dialog.Title>
          <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
            {pendingAdminValue ? (
              <>
                Deseja conceder privilégio de administrador para o usuário{' '}
                <strong>{userQuota?.email || selectedUserEmail}</strong>?
              </>
            ) : (
              <>
                Deseja remover o privilégio de administrador do usuário{' '}
                <strong>{userQuota?.email || selectedUserEmail}</strong>?
              </>
            )}
          </Dialog.Description>

          <Flex gap='3' mt='4' justify='end'>
            <Dialog.Close>
              <Button
                variant='soft'
                color='gray'
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setConfirmAdminModalOpen(false);
                  setPendingAdminValue(null);
                }}
              >
                Cancelar
              </Button>
            </Dialog.Close>
            <Button
              color='red'
              onClick={async () => {
                if (pendingAdminValue === null) return;
                await toggleUserAdmin(pendingAdminValue);
                setConfirmAdminModalOpen(false);
                setPendingAdminValue(null);
                // Refresh admin users list after change
                await fetchAdminUsers();
              }}
              disabled={toggleAdminLoading}
              style={{ backgroundColor: 'var(--red-9)', color: 'white', cursor: 'pointer' }}
            >
              Confirmar
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Modal de confirmação de desligamento da API */}
      <Dialog.Root
        open={showShutdownModal}
        onOpenChange={(open) => {
          setShowShutdownModal(open);
          if (!open) {
            setShutdownConfirmText('');
            setShutdownError(null);
          }
        }}
      >
        <Dialog.Content maxWidth='480px' style={{ padding: '24px' }}>
          <Dialog.Title style={{ marginBottom: '12px' }}>
            Confirmar Desligamento da API
          </Dialog.Title>
          <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
            Esta ação irá desligar a API e interromper as funcionalidades do website.
            <br />
            Para confirmar, digite <strong>{shutdownKeyword}</strong> abaixo.
          </Dialog.Description>

          <Box style={{ marginTop: '8px' }}>
            <TextField.Root
              placeholder={shutdownKeyword || 'shutdown-XXXXXX'}
              value={shutdownConfirmText}
              onChange={(e) => setShutdownConfirmText(e.target.value)}
            />
          </Box>

          <Flex gap='3' mt='4' justify='end'>
            <Dialog.Close>
              <Button
                variant='soft'
                color='gray'
                style={{ cursor: 'pointer' }}
                disabled={shutdownLoading}
              >
                Cancelar
              </Button>
            </Dialog.Close>
            <Button
              onClick={performShutdown}
              disabled={shutdownLoading || shutdownConfirmText.trim() !== shutdownKeyword}
              style={{
                backgroundColor: 'var(--red-9)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {shutdownLoading ? <>Processando...</> : 'Confirmar Desligamento'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
