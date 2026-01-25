import { Box, Card, Flex, Heading, Tabs } from '@radix-ui/themes';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

import { NavBar } from '@/components';
import { usePageTranslation } from '@/i18n/utils';
import { api } from '@/lib';

import styles from './admin.module.css';
import {
  AdminPrivilegeConfirmModal,
  AdminUsersCard,
  DangerZoneCard,
  DeleteUserModal,
  DokkuCommandCard,
  PluginsCard,
  ResourcesCard,
  SecurityConfigCard,
  ShutdownConfirmModal,
  SshHistoryCard,
  SshKeyCard,
  TakeoverConfirmModal,
  UserSelectionCard,
} from './components';

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
  const { t } = usePageTranslation();

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

  // Plugins tab states
  interface PluginInfo {
    version: string;
    status: string;
    description: string;
  }
  const [plugins, setPlugins] = useState<Array<{ name: string } & PluginInfo>>([]);
  const [pluginsLoading, setPluginsLoading] = useState(false);
  const [pluginsError, setPluginsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('users');

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
  const [resourcesAscCreatedAt, setResourcesAscCreatedAt] = useState<boolean>(true);

  const fetchResources = useCallback(
    async (tab: 'apps' | 'services' | 'networks', offset: number, limit: number, asc: boolean) => {
      try {
        setResourcesLoading(true);
        setResourcesError(null);
        const resp = await api.post<ResourceItem[]>(
          `/api/admin/resources/${tab}/?offset=${offset}&limit=${limit}`,
          {},
          { params: { asc_created_at: !asc } }
        );
        setResourcesList(resp.data || []);
      } catch (error) {
        console.error('Error fetching resources:', error);
        setResourcesError(t('admin.errors.resources.load_failed'));
        setResourcesList([]);
      } finally {
        setResourcesLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    (async () => {
      await fetchResources(resourcesTab, resourcesOffset, resourcesLimit, resourcesAscCreatedAt);
    })();
  }, [fetchResources, resourcesTab, resourcesOffset, resourcesLimit, resourcesAscCreatedAt]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setUserQuotaError(t('admin.errors.user.fetch_failed'));
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
      setUserQuotaError(t('admin.errors.user.quota_update_failed'));
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
      setUserQuotaError(t('admin.errors.user.takeover_failed'));
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
      setCommandError(t('admin.errors.dokku.command_failed'));
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
      setPluginsError(t('admin.errors.plugins.load_failed'));
      setPlugins([]);
    } finally {
      setPluginsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSecurityConfig = useCallback(async () => {
    try {
      setSecurityConfigLoading(true);
      setSecurityConfigError(null);
      const resp = await api.post<SecurityConfig>(`/api/admin/api/config/`);
      setSecurityConfig(resp.data);
    } catch (error) {
      console.error('Error fetching security config:', error);
      setSecurityConfigError(t('admin.errors.security.load_failed'));
      setSecurityConfig(null);
    } finally {
      setSecurityConfigLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSshKeyInfo = useCallback(async () => {
    try {
      setSshKeyLoading(true);
      setSshKeyError(null);
      const resp = await api.post<SshKeyInfo>(`/api/admin/api/ssh-key/`);
      setSshKeyInfo(resp.data);
    } catch (error) {
      console.error('Error fetching SSH key info:', error);
      setSshKeyError(t('admin.errors.security.ssh_key_load_failed'));
      setSshKeyInfo(null);
    } finally {
      setSshKeyLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setSshHistoryError(t('admin.errors.security.ssh_history_load_failed'));
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
      setAdminUsersError(t('admin.errors.users.admin_list_load_failed'));
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
      setShutdownError(t('admin.errors.security.shutdown_failed'));
    } finally {
      setShutdownLoading(false);
    }
  };

  // Load plugins when switching to the Plugins tab for the first time
  useEffect(() => {
    if (activeTab === 'plugins' && plugins.length === 0 && !pluginsLoading) {
      (async () => {
        await fetchPlugins();
      })();
    }
  }, [activeTab, fetchPlugins, plugins.length, pluginsLoading]);

  // Load security info when switching to Security tab for the first time
  useEffect(() => {
    if (activeTab === 'security' && !securityConfig && !securityConfigLoading) {
      (async () => {
        await fetchSecurityConfig();
        await fetchSshKeyInfo();
      })();
    }
  }, [activeTab, fetchSecurityConfig, fetchSshKeyInfo, securityConfig, securityConfigLoading]);

  // Delete user modal state
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);

  const performDeleteUser = async () => {
    const email = userQuota?.email || selectedUserEmail;
    if (!email || !email.trim()) return;

    try {
      setDeleteUserLoading(true);
      setUserQuotaError(null);

      await api.delete(`/api/admin/users/${email}`);

      setShowDeleteUserModal(false);
      setDeleteConfirmText('');

      setSelectedUserEmail('');
      setUserQuota(null);
      setSelectedUserIsAdmin(null);

      window.location.reload();
    } catch (error) {
      console.error('Error deleting user:', error);
      setUserQuotaError(t('admin.errors.user.delete_failed'));
    } finally {
      setDeleteUserLoading(false);
    }
  };

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
              {t('admin.header.title')}
            </Heading>
          </Box>
          <Tabs.Root value={activeTab} onValueChange={setActiveTab} defaultValue='users'>
            <Tabs.List color='orange' className={styles.tabsList}>
              <Tabs.Trigger style={{ cursor: 'pointer' }} value='users'>
                {t('admin.tabs.users')}
              </Tabs.Trigger>
              <Tabs.Trigger style={{ cursor: 'pointer' }} value='dokku'>
                {t('admin.tabs.dokku')}
              </Tabs.Trigger>
              <Tabs.Trigger style={{ cursor: 'pointer' }} value='plugins'>
                {t('admin.tabs.plugins')}
              </Tabs.Trigger>
              <Tabs.Trigger style={{ cursor: 'pointer' }} value='security'>
                {t('admin.tabs.security')}
              </Tabs.Trigger>
            </Tabs.List>

            {/* Users Tab */}
            <Tabs.Content value='users'>
              <ResourcesCard
                resourcesTab={resourcesTab}
                resourcesList={resourcesList}
                resourcesLoading={resourcesLoading}
                resourcesError={resourcesError}
                resourcesLimit={resourcesLimit}
                resourcesOffset={resourcesOffset}
                resourcesAscCreatedAt={resourcesAscCreatedAt}
                onChangeTab={(val) => {
                  setResourcesTab(val);
                  setResourcesOffset(0);
                }}
                onChangeLimit={(lim) => {
                  setResourcesLimit(lim);
                  setResourcesOffset(0);
                }}
                onChangeOrder={(asc) => {
                  setResourcesAscCreatedAt(asc);
                  setResourcesOffset(0);
                }}
                onBack={() => setResourcesOffset(Math.max(0, resourcesOffset - resourcesLimit))}
                onNext={() => setResourcesOffset(resourcesOffset + resourcesLimit)}
                backDisabled={resourcesOffset === 0}
                nextDisabled={
                  resourcesList.length < resourcesLimit &&
                  resourcesOffset !== 0 &&
                  resourcesOffset % resourcesLimit === 0
                }
              />

              <Card
                style={{
                  border: '1px solid var(--amber-6)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  marginTop: '12px',
                }}
              >
                <UserSelectionCard
                  usersList={usersList}
                  usersListLoading={usersListLoading}
                  selectedUserEmail={selectedUserEmail}
                  onSelectUser={(value) => {
                    setSelectedUserEmail(value);
                    setUserQuota(null);
                    setUserQuotaError(null);
                    setEditMode(false);
                    setSelectedUserIsAdmin(null);
                  }}
                  onSearch={searchUserData}
                  userQuota={userQuota}
                  userQuotaError={userQuotaError}
                  userQuotaLoading={userQuotaLoading}
                  editMode={editMode}
                  updateLoading={updateLoading}
                  onStartEdit={() => setEditMode(true)}
                  onCancelEdit={() => {
                    setEditMode(false);
                    if (userQuota) setEditQuota(userQuota);
                  }}
                  onSaveEdit={updateUserQuota}
                  editQuota={editQuota}
                  onEditQuotaChange={(partial) => setEditQuota({ ...editQuota, ...partial })}
                  selectedUserIsAdmin={selectedUserIsAdmin}
                  toggleAdminLoading={toggleAdminLoading}
                  onRequestAdminChange={(val) => {
                    setPendingAdminValue(val);
                    setConfirmAdminModalOpen(true);
                  }}
                  onOpenTakeoverModal={() => setShowTakeoverModal(true)}
                  onOpenDeleteModal={() => {
                    setDeleteConfirmText('');
                    setShowDeleteUserModal(true);
                  }}
                />
              </Card>

              <AdminUsersCard
                adminUsers={adminUsers}
                adminUsersLoading={adminUsersLoading}
                adminUsersError={adminUsersError}
                onRemoveAdmin={(email) => {
                  setSelectedUserEmail(email);
                  setPendingAdminValue(false);
                  setConfirmAdminModalOpen(true);
                }}
              />
            </Tabs.Content>

            {/* Dokku Tab */}
            <Tabs.Content value='dokku'>
              <Flex direction='column' gap='4' style={{ marginTop: '12px' }}>
                <DokkuCommandCard
                  commandInput={commandInput}
                  onCommandInputChange={setCommandInput}
                  onRun={runDokkuCommand}
                  commandLoading={commandLoading}
                  commandError={commandError}
                  commandOutput={commandOutput}
                />

                <SshHistoryCard
                  history={sshHistory}
                  loading={sshHistoryLoading}
                  error={sshHistoryError}
                  onRefresh={fetchSshHistory}
                />
              </Flex>
            </Tabs.Content>

            {/* Plugins Tab */}
            <Tabs.Content value='plugins'>
              <PluginsCard
                plugins={plugins}
                loading={pluginsLoading}
                error={pluginsError}
                onRefresh={fetchPlugins}
              />
            </Tabs.Content>

            {/* Security Tab */}
            <Tabs.Content value='security'>
              <Flex direction='column' gap='4' style={{ marginTop: '12px' }}>
                <SecurityConfigCard
                  config={securityConfig}
                  loading={securityConfigLoading}
                  error={securityConfigError}
                  onRefresh={fetchSecurityConfig}
                />

                <SshKeyCard
                  info={sshKeyInfo}
                  loading={sshKeyLoading}
                  error={sshKeyError}
                  onRefresh={fetchSshKeyInfo}
                />

                <DangerZoneCard
                  shutdownError={shutdownError}
                  onOpenShutdownModal={() => {
                    setShutdownKeyword(generateShutdownKeyword());
                    setShutdownConfirmText('');
                    setShowShutdownModal(true);
                  }}
                />
              </Flex>
            </Tabs.Content>
          </Tabs.Root>
        </Flex>
      </main>

      {/* Takeover confirmation modal */}
      <TakeoverConfirmModal
        open={showTakeoverModal}
        onOpenChange={setShowTakeoverModal}
        targetEmail={userQuota?.email}
        onConfirm={performTakeover}
        loading={takeoverLoading}
      />

      {/* Admin privilege change confirmation modal */}
      <AdminPrivilegeConfirmModal
        open={confirmAdminModalOpen}
        onOpenChange={(open) => {
          setConfirmAdminModalOpen(open);
          if (!open) setPendingAdminValue(null);
        }}
        targetEmail={userQuota?.email || selectedUserEmail}
        pendingAdminValue={pendingAdminValue}
        onConfirm={async () => {
          if (pendingAdminValue === null) return;
          await toggleUserAdmin(pendingAdminValue);
          setConfirmAdminModalOpen(false);
          setPendingAdminValue(null);
          await fetchAdminUsers();
        }}
        loading={toggleAdminLoading}
      />

      {/* Delete user confirmation modal */}
      <DeleteUserModal
        open={showDeleteUserModal}
        onOpenChange={(open) => {
          setShowDeleteUserModal(open);
          if (!open) setDeleteConfirmText('');
        }}
        email={userQuota?.email || selectedUserEmail}
        confirmText={deleteConfirmText}
        onConfirmTextChange={setDeleteConfirmText}
        onConfirm={performDeleteUser}
        loading={deleteUserLoading}
      />

      {/* API shutdown confirmation modal */}
      <ShutdownConfirmModal
        open={showShutdownModal}
        onOpenChange={(open) => {
          setShowShutdownModal(open);
          if (!open) {
            setShutdownConfirmText('');
            setShutdownError(null);
          }
        }}
        keyword={shutdownKeyword}
        confirmText={shutdownConfirmText}
        onConfirmTextChange={setShutdownConfirmText}
        onConfirm={performShutdown}
        loading={shutdownLoading}
      />
    </>
  );
}
