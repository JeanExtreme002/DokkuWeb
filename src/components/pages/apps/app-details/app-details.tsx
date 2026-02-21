import { ReloadIcon } from '@radix-ui/react-icons';
import { Box, Button, Card, Flex, Separator, Tabs, Text } from '@radix-ui/themes';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Image as CustomImage } from '@/components';
import { LoadingSpinner, NavBar } from '@/components/shared';
import { usePageTranslation } from '@/i18n/utils';
import { api, config as websiteConfig, downloadFile, formatAppName, processAnsiCodes } from '@/lib';

import styles from './app-details.module.css';
import {
  AppControlButtons,
  BuilderConfigModal,
  DeleteAppModal,
  DeleteEnvModal,
  DeletePortModal,
  DeployRepoModal,
  DeploySection,
  FilesSection,
  HeaderSection,
  LogsSection,
  NetworkSection,
  OverviewSection,
  RebuildAppConfirmModal,
  RestartAppConfirmModal,
  SecuritySection,
  ServicesSection,
  ShareConfirmModal,
  ShellSection,
  StopAppConfirmModal,
  UnshareConfirmModal,
  VariablesSection,
  ZipInfoModal,
} from './components';
import type { DirEntry } from './helpers';
import {
  formatSize,
  getIsDeployed,
  getIsRunning,
  getPrompt,
  getPromptLabel,
  getWorkingDir,
  parseDotEnv,
  parseJsonEnv,
  parseLsOutput,
  parseYmlSimple,
  pathJoin,
  sanitizeEnvKeys,
  useStatusInfo,
} from './helpers';
import type { AppContainer, AppInfo, BuilderData, DeployInfoData } from './types';

interface AppDetailsPageProps {
  appName: string;
}

interface DatabasesData {
  [dbType: string]: string[];
}

interface NetworkData {
  network: string | null;
}

interface PortMapping {
  protocol: string;
  origin: number;
  dest: number;
}

interface ConfigData {
  [key: string]: string;
}

export function AppDetailsPage(props: AppDetailsPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = usePageTranslation();

  const windowSearch = typeof window !== 'undefined' ? window.location.search : undefined;
  const routerSharedBy = router?.query?.shared_by;

  const sharedBy = useMemo(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      return url.searchParams.get('shared_by');
    }
    if (router && router.query && typeof router.query.shared_by === 'string') {
      return router.query.shared_by;
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowSearch, routerSharedBy]);

  const withSharedBy = useCallback(
    (params?: Record<string, any>) => {
      if (sharedBy) {
        return { ...params, shared_by: sharedBy };
      }
      return params || {};
    },
    [sharedBy]
  );

  // Stable session reference to prevent unnecessary re-renders
  const stableSession = useMemo(() => {
    return session?.user?.email ? session : null;
  }, [session]);

  // States
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [databases, setDatabases] = useState<DatabasesData>({});
  const [networkData, setNetworkData] = useState<NetworkData>({ network: null });
  const [portMappings, setPortMappings] = useState<PortMapping[]>([]);
  const [logs, setLogs] = useState<string>('');
  const [config, setConfig] = useState<ConfigData>({});
  const [appUrl, setAppUrl] = useState<string | null>(null);
  const [builderInfo, setBuilderInfo] = useState<BuilderData | null>(null);
  const [logLinesLimit, setLogLinesLimit] = useState<number>(1000);
  const [deployInfo, setDeployInfo] = useState<DeployInfoData | null>(null);

  // Loading states
  const [mainLoading, setMainLoading] = useState(true);
  const [appUrlLoading, setAppUrlLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [networkLoading, setNetworkLoading] = useState(true);
  const [portMappingsLoading, setPortMappingsLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(true);
  const [builderLoading, setBuilderLoading] = useState(true);
  const [deployInfoLoading, setDeployInfoLoading] = useState(true);

  // Sharing states (Security tab)
  const [shareEmail, setShareEmail] = useState('');
  const [sharingList, setSharingList] = useState<string[]>([]);
  const [sharingLoading, setSharingLoading] = useState(false);
  const [sharingError, setSharingError] = useState<string | null>(null);
  const [sharingListLoaded, setSharingListLoaded] = useState(false);
  const [confirmShareOpen, setConfirmShareOpen] = useState(false);
  const [pendingShareEmail, setPendingShareEmail] = useState<string | null>(null);
  const [confirmUnshareOpen, setConfirmUnshareOpen] = useState(false);
  const [pendingUnshareEmail, setPendingUnshareEmail] = useState<string | null>(null);

  // Form states
  const [originPort, setOriginPort] = useState('');
  const [destPort, setDestPort] = useState('');
  const [protocol, setProtocol] = useState('http');
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');
  const [portSubmitting, setPortSubmitting] = useState(false);
  const [envSubmitting, setEnvSubmitting] = useState(false);
  const [envImportLoading, setEnvImportLoading] = useState(false);
  const [deletingPort, setDeletingPort] = useState<string | null>(null);
  const [deletingEnv, setDeletingEnv] = useState<string | null>(null);

  // Environment variable edit states
  const [editingEnvKey, setEditingEnvKey] = useState<string | null>(null);
  const [editingEnvValue, setEditingEnvValue] = useState<string>('');
  const [savingEnv, setSavingEnv] = useState<boolean>(false);

  // Environment variable delete modal states
  const [showDeleteEnvModal, setShowDeleteEnvModal] = useState(false);
  const [envToDelete, setEnvToDelete] = useState<string | null>(null);

  // Port mapping delete modal states
  const [showDeletePortModal, setShowDeletePortModal] = useState(false);
  const [portToDelete, setPortToDelete] = useState<PortMapping | null>(null);

  // Current tab
  const [currentTab, setCurrentTab] = useState('overview');

  // Deploy states
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [zipInfoModalOpen, setZipInfoModalOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [deployLoading, setDeployLoading] = useState(false);
  const [fileDeployLoading, setFileDeployLoading] = useState(false);

  // Deployment token states
  const [deploymentToken, setDeploymentToken] = useState<string | null>(null);
  const [showDeploymentToken, setShowDeploymentToken] = useState(false);

  // Data loaded state to prevent unnecessary re-fetching
  const [dataLoaded, setDataLoaded] = useState(false);

  // App control loading states
  const [startLoading, setStartLoading] = useState(false);
  const [stopLoading, setStopLoading] = useState(false);
  const [restartLoading, setRestartLoading] = useState(false);
  const [rebuildLoading, setRebuildLoading] = useState(false);

  // Builder configuration states
  const [builderModalOpen, setBuilderModalOpen] = useState(false);
  const [selectedBuilder, setSelectedBuilder] = useState('');
  const [builderConfigLoading, setBuilderConfigLoading] = useState(false);

  // Shell terminal states
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalOutputs, setTerminalOutputs] = useState<string[]>([]);
  const [terminalBusy, setTerminalBusy] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const terminalInputRef = useRef<HTMLInputElement | null>(null);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [currentDir, setCurrentDir] = useState<string>('');
  const [dirEntries, setDirEntries] = useState<DirEntry[]>([]);
  const [dirLoading, setDirLoading] = useState<boolean>(false);
  const [dirError, setDirError] = useState<string | null>(null);

  // Tiny screen detection (≤400px) for truncating names
  const [isTinyScreen, setIsTinyScreen] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 400px)');
    const update = () => setIsTinyScreen(mq.matches);
    update();
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    } else if (mq.addListener) {
      mq.addListener(update);
      return () => mq.removeListener(update);
    }
  }, []);

  // Small screen detection (≤550px) for 30-char truncation
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 650px)');
    const update = () => setIsSmallScreen(mq.matches);
    update();
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    } else if (mq.addListener) {
      mq.addListener(update);
      return () => mq.removeListener(update);
    }
  }, []);

  // Confirmation modals for app actions
  const [showStopConfirmModal, setShowStopConfirmModal] = useState(false);
  const [showRestartConfirmModal, setShowRestartConfirmModal] = useState(false);
  const [showRebuildConfirmModal, setShowRebuildConfirmModal] = useState(false);

  // Delete app confirmation modal state
  const [showDeleteAppModal, setShowDeleteAppModal] = useState(false);
  const [deleteAppLoading, setDeleteAppLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Error states
  const [errors, setErrors] = useState({
    main: null as string | null,
    services: null as string | null,
    network: null as string | null,
    portMappings: null as string | null,
    logs: null as string | null,
    config: null as string | null,
    deploy: null as string | null,
    builder: null as string | null,
    deployInfo: null as string | null,
  });

  const statusInfo = useStatusInfo(appInfo);
  const displayName = formatAppName(props.appName);

  // Fetch functions with retry logic
  const fetchWithRetry = useCallback(
    async (
      fetchFn: () => Promise<any>,
      setLoading: (loading: boolean) => void,
      setError: (error: string | null) => void,
      maxRetries = 3
    ) => {
      let retries = 0;

      const attemptFetch = async () => {
        try {
          setLoading(true);
          setError(null);
          return await fetchFn();
        } catch (error) {
          retries++;
          if (retries >= maxRetries) {
            console.error('Max retries reached:', error);
            setError(t('errors.loadData'));
            throw error;
          }
          console.warn(`Retry ${retries}/${maxRetries}:`, error);
          await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
          return attemptFetch();
        } finally {
          setLoading(false);
        }
      };

      return attemptFetch();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // API fetch functions
  const fetchAppInfo = useCallback(async () => {
    try {
      const response = await api.post(
        `/api/apps/${props.appName}/info/`,
        {},
        { params: withSharedBy() }
      );
      if (response.data.success) {
        setAppInfo(response.data.result);
      }
    } catch (error: any) {
      if (error.response?.status === 404 && error.response?.data?.detail === 'App does not exist') {
        router.push('/404');
        return;
      }
      // Re-throw the error for the retry logic to handle
      throw error;
    }
  }, [props.appName, router, withSharedBy]);

  const fetchDatabases = useCallback(async () => {
    const response = await api.post(
      `/api/apps/${props.appName}/databases/`,
      {},
      { params: withSharedBy() }
    );
    if (response.data.success) {
      setDatabases(response.data.result);
    }
  }, [props.appName, withSharedBy]);

  const fetchNetwork = useCallback(async () => {
    const response = await api.post(
      `/api/apps/${props.appName}/network/`,
      {},
      { params: withSharedBy() }
    );
    if (response.data.success) {
      setNetworkData(response.data.result);
    }
  }, [props.appName, withSharedBy]);

  const fetchPortMappings = useCallback(async () => {
    const response = await api.post(
      `/api/apps/${props.appName}/ports/`,
      {},
      { params: withSharedBy({ use_proxy: false }) }
    );
    if (response.data.success) {
      setPortMappings(response.data.result);
    }
  }, [props.appName, withSharedBy]);

  const fetchLogs = useCallback(async () => {
    const response = await api.post(
      `/api/apps/${props.appName}/logs/`,
      {},
      { params: withSharedBy({ n_lines: logLinesLimit }) }
    );
    if (response.data.success) {
      setLogs(response.data.result);
    }
  }, [props.appName, logLinesLimit, withSharedBy]);

  const fetchConfig = useCallback(async () => {
    const response = await api.post(
      `/api/config/${props.appName}/`,
      {},
      { params: withSharedBy() }
    );
    if (response.data.success) {
      setConfig(response.data.result);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.appName]);

  const fetchAppUrl = useCallback(async () => {
    const response = await api.post(
      `/api/apps/${props.appName}/url/`,
      {},
      { params: withSharedBy() }
    );
    if (response.data.success) {
      setAppUrl(response.data.result);
    }
  }, [props.appName, withSharedBy]);

  const fetchDeploymentToken = useCallback(async () => {
    const response = await api.post(
      `/api/apps/${props.appName}/deployment-token/`,
      {},
      { params: withSharedBy() }
    );
    if (response.data.success) {
      setDeploymentToken(response.data.result);
    }
  }, [props.appName, withSharedBy]);

  const fetchBuilderInfo = useCallback(async () => {
    const response = await api.post(
      `/api/apps/${props.appName}/builder/`,
      {},
      { params: withSharedBy() }
    );
    if (response.data.success) {
      setBuilderInfo(response.data.result);
    }
  }, [props.appName, withSharedBy]);

  const fetchDeployInfo = useCallback(async () => {
    const response = await api.post(
      `/api/deploy/${props.appName}/info/`,
      {},
      { params: withSharedBy() }
    );
    if (response.data.success) {
      setDeployInfo(response.data.result);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.appName]);

  const fetchSharingList = useCallback(async () => {
    setSharingLoading(true);
    setSharingError(null);
    try {
      const response = await api.post(
        `/api/apps/${props.appName}/sharing/`,
        {},
        { params: withSharedBy() }
      );
      if (response.data && response.data.success && Array.isArray(response.data.result)) {
        setSharingList(response.data.result);
      } else {
        setSharingError('Failed to load sharing list');
      }
    } catch (err: any) {
      setSharingError(err?.message || 'Failed to load sharing list');
    } finally {
      setSharingLoading(false);
      setSharingListLoaded(true);
    }
  }, [props.appName, withSharedBy]);

  // Silent refresh for overview data only - updates app info and URL every 10 seconds
  // This keeps the overview tab current without affecting loading states or other tabs
  const silentRefreshOverview = useCallback(async () => {
    try {
      // Fetch fresh app info without cache
      const appInfoResponse = await api.post(
        `/api/apps/${props.appName}/info/`,
        {},
        {
          headers: { 'x-cache': 'false' },
          params: withSharedBy(),
        }
      );
      if (appInfoResponse.data.success) {
        setAppInfo(appInfoResponse.data.result);
      }

      // Fetch fresh app URL without cache
      const appUrlResponse = await api.post(
        `/api/apps/${props.appName}/url/`,
        {},
        {
          headers: { 'x-cache': 'false' },
          params: withSharedBy(),
        }
      );
      if (appUrlResponse.data.success) {
        setAppUrl(appUrlResponse.data.result);
      }
      // Fetch fresh app builder without cache
      const appBuilderResponse = await api.post(
        `/api/apps/${props.appName}/builder/`,
        {},
        {
          headers: { 'x-cache': 'false' },
          params: withSharedBy(),
        }
      );
      if (appBuilderResponse.data.success) {
        setBuilderInfo(appBuilderResponse.data.result);
      }

      // Fetch fresh deploy info without cache
      const appDeployInfoResponse = await api.post(
        `/api/deploy/${props.appName}/info/`,
        {},
        {
          headers: { 'x-cache': 'false' },
          params: withSharedBy(),
        }
      );
      if (appDeployInfoResponse.data.success) {
        setDeployInfo(appDeployInfoResponse.data.result);
      }
    } catch (error) {
      console.warn('Silent overview refresh error (ignored):', error);
    }
  }, [props.appName, withSharedBy]);

  // Refresh logs function that activates loading state
  const refreshLogs = useCallback(async () => {
    await fetchWithRetry(fetchLogs, setLogsLoading, (error) =>
      setErrors((prev) => ({ ...prev, logs: error }))
    );
  }, [fetchLogs, fetchWithRetry]);

  // Initialize all data fetching
  useEffect(() => {
    if (!stableSession || !props.appName || dataLoaded) return;

    const loadAllData = async () => {
      try {
        // Critical data (required for page load) - fetch in parallel
        const criticalPromises: Promise<any>[] = [
          fetchWithRetry(fetchAppInfo, setMainLoading, (error) =>
            setErrors((prev) => ({ ...prev, main: error }))
          ),
          fetchWithRetry(fetchBuilderInfo, setBuilderLoading, (error) =>
            setErrors((prev) => ({ ...prev, builder: error }))
          ),
          fetchWithRetry(fetchDeployInfo, setDeployInfoLoading, (error) =>
            setErrors((prev) => ({ ...prev, deployInfo: error }))
          ),
          fetchWithRetry(
            fetchAppUrl,
            setAppUrlLoading,
            () => {} // No separate error state needed
          ),
        ];

        // Do not fetch deployment token when page is accessed via shared_by
        if (!sharedBy) {
          criticalPromises.push(
            fetchWithRetry(
              fetchDeploymentToken,
              () => {}, // No separate loading state needed
              () => {} // No separate error state needed
            )
          );
        }

        await Promise.all(criticalPromises);

        // All other data (parallel fetch - non-blocking)
        await Promise.allSettled([
          fetchWithRetry(fetchDatabases, setServicesLoading, (error) =>
            setErrors((prev) => ({ ...prev, services: error }))
          ),
          fetchWithRetry(fetchNetwork, setNetworkLoading, (error) =>
            setErrors((prev) => ({ ...prev, network: error }))
          ),
          fetchWithRetry(fetchPortMappings, setPortMappingsLoading, (error) =>
            setErrors((prev) => ({ ...prev, portMappings: error }))
          ),
          fetchWithRetry(fetchLogs, setLogsLoading, (error) =>
            setErrors((prev) => ({ ...prev, logs: error }))
          ),
          fetchWithRetry(fetchConfig, setConfigLoading, (error) =>
            setErrors((prev) => ({ ...prev, config: error }))
          ),
        ]);

        // Initial sharing list (skip when accessed via shared_by)
        if (!sharedBy) {
          await fetchSharingList();
        }

        // Mark data as loaded to prevent re-fetching on tab change
        setDataLoaded(true);
      } catch (error) {
        console.error('Error loading app data:', error);
      }
    };

    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    stableSession, // Stable session reference
    props.appName,
    dataLoaded,
    fetchWithRetry,
    fetchAppInfo,
    fetchDatabases,
    fetchNetwork,
    fetchPortMappings,
    fetchLogs,
    fetchConfig,
    fetchAppUrl,
    fetchDeploymentToken,
    fetchBuilderInfo,
    fetchDeployInfo,
    sharedBy,
  ]);

  // Reset dataLoaded when appName changes
  useEffect(() => {
    setDataLoaded(false);
  }, [props.appName]);

  // Auto-refresh overview data every 10 seconds without showing loading spinners
  useEffect(() => {
    if (!stableSession || !props.appName || !dataLoaded) return;

    const intervalId = setInterval(() => {
      silentRefreshOverview();
    }, 10000); // 10 seconds

    return () => clearInterval(intervalId);
  }, [stableSession, props.appName, dataLoaded, silentRefreshOverview]);

  const onRequestShare = (email: string) => {
    const trimmed = (email || '').trim();
    if (!trimmed) return;
    setPendingShareEmail(trimmed);
    setConfirmShareOpen(true);
  };

  const onConfirmShare = async () => {
    if (!pendingShareEmail) return;
    setSharingLoading(true);
    setSharingError(null);
    try {
      await api.post(
        `/api/apps/${props.appName}/share/${encodeURIComponent(pendingShareEmail)}/`,
        {},
        { params: withSharedBy() }
      );
      setShareEmail('');
      await fetchSharingList();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.detail || '';
      if (err?.response?.status === 404) {
        setSharingError(t('security.sharing.userNotFound'));
      } else if (
        err?.response?.status === 400 &&
        typeof msg === 'string' &&
        msg.includes('You cannot share the application with yourself')
      ) {
        setSharingError(t('security.sharing.cannotShareWithYourself'));
      } else {
        setSharingError(err?.response?.data?.message || 'Failed to share app');
      }
    } finally {
      setConfirmShareOpen(false);
      setPendingShareEmail(null);
      setSharingLoading(false);
    }
  };

  const onOpenUnshareConfirm = (email: string) => {
    setPendingUnshareEmail(email);
    setConfirmUnshareOpen(true);
  };

  const onConfirmUnshare = async () => {
    if (!pendingUnshareEmail) return;
    // reuse loading state for simplicity
    setSharingLoading(true);
    setSharingError(null);
    try {
      await api.delete(
        `/api/apps/${props.appName}/share/${encodeURIComponent(pendingUnshareEmail)}/`,
        withSharedBy()
      );
      await fetchSharingList();
    } catch (err: any) {
      setSharingError(err?.message || 'Failed to unshare app');
    } finally {
      setConfirmUnshareOpen(false);
      setPendingUnshareEmail(null);
      setSharingLoading(false);
    }
  };

  const isAtRoot = () => {
    const wd = getWorkingDir(appInfo);
    if (wd) return currentDir === wd;
    return !currentDir || currentDir === '/';
  };

  const fetchDirectoryListing = useCallback(
    async (dir: string) => {
      setDirLoading(true);
      setDirError(null);
      try {
        let containerType: string | undefined = undefined;
        if (appInfo && appInfo.info_origin === 'inspect') {
          const containers = appInfo.data as AppContainer[];
          containerType = containers?.[0]?.Config?.Labels?.['com.dokku.process-type'];
        }
        let params: Record<string, any> = { command: `ls ${dir} -a -l` };
        if (containerType) params.container_type = containerType;
        params = withSharedBy(params);
        const response = await api.post(`/api/apps/${props.appName}/exec/`, {}, { params });
        const output = String(response?.data?.result ?? '');
        if (response?.data?.success) {
          setDirEntries(parseLsOutput(output));
        } else {
          setDirError(t('files.errors.listDir'));
        }
      } catch (err: any) {
        setDirError(err?.response?.data?.message || t('files.errors.loadDirInfo'));
      } finally {
        setDirLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appInfo, props.appName, withSharedBy]
  );

  const navigateToParent = () => {
    const wd = getWorkingDir(appInfo);
    if (!currentDir || currentDir === '/' || (wd && currentDir === wd)) return;
    const parts = currentDir.split('/').filter((p) => p.length > 0);
    const parent = '/' + parts.slice(0, -1).join('/');
    if (wd && !parent.startsWith(wd)) {
      setCurrentDir(wd);
      return;
    }
    setCurrentDir(parent || '/');
  };

  const handleEntryClick = (entry: DirEntry) => {
    if (entry.name === '.') return;
    if (entry.name === '..') {
      navigateToParent();
      return;
    }
    if (entry.type === 'dir') {
      setCurrentDir(pathJoin(currentDir, entry.name));
    }
  };

  const downloadLogs = () => {
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${props.appName}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download a file from the container given its full path
  const downloadAppFile = async (fullPath: string, filename?: string) => {
    try {
      const response = await api.post(
        `/api/apps/${props.appName}/download/`,
        {},
        {
          params: withSharedBy({ filename: fullPath }),
          responseType: 'blob',
        }
      );

      const blob = response.data as Blob;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || fullPath.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      setDirError(t('files.errors.downloadFailed'));
      setTimeout(() => setDirError(null), 3000);
    }
  };

  const copyDeploymentToken = async () => {
    if (deploymentToken) {
      try {
        await navigator.clipboard.writeText(deploymentToken);
      } catch (error) {
        console.error('Error copying deployment token:', error);
      }
    }
  };

  // Delete application handler
  const deleteApp = async () => {
    setDeleteAppLoading(true);
    try {
      await api.delete(`/api/apps/${props.appName}`, withSharedBy());
      router.push('/apps');
    } catch (error: any) {
      console.error('Error deleting app:', error);
      setErrors((prev) => ({
        ...prev,
        main: error.response?.data?.message || t('errors.delete'),
      }));
    } finally {
      setDeleteAppLoading(false);
      setShowDeleteAppModal(false);
    }
  };

  // Port mapping functions
  const addPortMapping = async () => {
    if (!originPort || !destPort) return;

    setPortSubmitting(true);
    try {
      await api.post(
        `/api/apps/${props.appName}/ports/${protocol}/${originPort}/${destPort}/`,
        {},
        { params: withSharedBy({ use_proxy: false }) }
      );
      await fetchWithRetry(fetchPortMappings, setPortMappingsLoading, (error) =>
        setErrors((prev) => ({ ...prev, portMappings: error }))
      );
      setOriginPort('');
      setDestPort('');
    } catch (error) {
      console.error('Error adding port mapping:', error);
    } finally {
      setPortSubmitting(false);
    }
  };

  const openDeletePortModal = (mapping: PortMapping) => {
    setPortToDelete(mapping);
    setShowDeletePortModal(true);
  };

  const removePortMapping = async () => {
    if (!portToDelete) return;

    const mappingId = `${portToDelete.protocol}-${portToDelete.origin}-${portToDelete.dest}`;
    setDeletingPort(mappingId);
    setShowDeletePortModal(false);

    try {
      await api.delete(
        `/api/apps/${props.appName}/ports/${portToDelete.protocol}/${portToDelete.origin}/${portToDelete.dest}/`,
        withSharedBy({ use_proxy: false })
      );
      await fetchWithRetry(fetchPortMappings, setPortMappingsLoading, (error) =>
        setErrors((prev) => ({ ...prev, portMappings: error }))
      );
    } catch (error) {
      console.error('Error removing port mapping:', error);
    } finally {
      setDeletingPort(null);
      setPortToDelete(null);
    }
  };

  // App control functions
  const startApp = async () => {
    setStartLoading(true);
    try {
      await api.post(`/api/apps/${props.appName}/start/`, {}, { params: withSharedBy() });
      setDataLoaded(false);
      await fetchAppInfo();
    } catch (error: any) {
      console.error('Error starting app:', error);
      setErrors((prev) => ({
        ...prev,
        main: error.response?.data?.message || t('errors.start'),
      }));
    } finally {
      setStartLoading(false);
    }
  };

  const stopApp = async () => {
    setStopLoading(true);
    try {
      await api.post(`/api/apps/${props.appName}/stop/`, {}, { params: withSharedBy() });
      setDataLoaded(false);
      await fetchAppInfo();
    } catch (error: any) {
      console.error('Error stopping app:', error);
      setErrors((prev) => ({
        ...prev,
        main: error.response?.data?.message || t('errors.stop'),
      }));
    } finally {
      setStopLoading(false);
    }
  };

  const restartApp = async () => {
    setRestartLoading(true);
    try {
      await api.post(`/api/apps/${props.appName}/restart/`, {}, { params: withSharedBy() });
      setDataLoaded(false);
      await fetchAppInfo();
    } catch (error: any) {
      console.error('Error restarting app:', error);
      setErrors((prev) => ({
        ...prev,
        main: error.response?.data?.message || t('errors.restart'),
      }));
    } finally {
      setRestartLoading(false);
    }
  };

  const rebuildApp = async () => {
    setRebuildLoading(true);
    try {
      await api.post(`/api/apps/${props.appName}/rebuild/`, {}, { params: withSharedBy() });
      setDataLoaded(false);
      await fetchAppInfo();
    } catch (error: any) {
      console.error('Error rebuilding app:', error);
      setErrors((prev) => ({
        ...prev,
        main: error.response?.data?.message || t('errors.rebuild'),
      }));
    } finally {
      setRebuildLoading(false);
    }
  };

  // Builder configuration functions
  const openBuilderModal = () => {
    const currentBuilder = builderInfo?.builder_computed_selected || 'herokuish';
    setSelectedBuilder(currentBuilder);
    setBuilderModalOpen(true);
  };

  const configureBuilder = async () => {
    if (!selectedBuilder) return;

    setBuilderConfigLoading(true);
    try {
      await api.post(
        `/api/apps/${props.appName}/builder/${selectedBuilder.toLowerCase()}/`,
        {},
        { params: withSharedBy() }
      );
      await fetchBuilderInfo();
      setBuilderModalOpen(false);
    } catch (error: any) {
      console.error('Error configuring builder:', error);
      setErrors((prev) => ({
        ...prev,
        builder: error.response?.data?.message || t('errors.builderConfig'),
      }));
    } finally {
      setBuilderConfigLoading(false);
    }
  };

  const executeTerminalCommand = async (command: string) => {
    const trimmed = command.trim();
    if (!trimmed) {
      // Echo empty input line and add blank output line
      setTerminalOutputs((prev) => [...prev, `${getPrompt(appInfo, props.appName)} `, '']);
      setTimeout(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        terminalInputRef.current?.focus();
      }, 0);
      return;
    }
    const normalized = command.replace(/\s+/g, '').toLowerCase();
    // Handle clear locally (ignore case/spacing)
    if (normalized === 'clear') {
      setTerminalOutputs([]);
      setTimeout(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        terminalInputRef.current?.focus();
      }, 0);
      return;
    }
    // Save command in terminal stack with prompt
    setTerminalOutputs((prev) => [...prev, `${getPrompt(appInfo, props.appName)} ${command}`]);
    setTimeout(() => terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    setTerminalBusy(true);
    try {
      // Determine container type from inspect data, if available
      let containerType: string | undefined = undefined;
      if (appInfo && appInfo.info_origin === 'inspect') {
        const containers = appInfo.data as AppContainer[];
        containerType = containers?.[0]?.Config?.Labels?.['com.dokku.process-type'];
      }
      let params: Record<string, any> = { command };
      if (containerType) {
        params.container_type = containerType;
      }
      params = withSharedBy(params);
      const response = await api.post(`/api/apps/${props.appName}/exec/`, {}, { params });
      const cleaned = processAnsiCodes(String(response.data.result ?? ''));
      if (response?.data?.success) {
        setTerminalOutputs((prev) => [...prev, cleaned, '']);
      } else {
        const errorTag = t('shell.errorTag');
        setTerminalOutputs((prev) => [
          ...prev,
          `${errorTag} ${t('shell.couldNotExecute')} \n${cleaned}`,
          '',
        ]);
      }
    } catch (err: any) {
      const errorTag = t('shell.errorTag');
      setTerminalOutputs((prev) => [
        ...prev,
        `${errorTag} ${err?.response?.data?.message || t('shell.executeFailed')}`,
        '',
      ]);
    } finally {
      setTerminalBusy(false);
      setTimeout(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        terminalInputRef.current?.focus();
      }, 0);
    }
  };

  const handleTerminalKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter: execute current input
    if (e.key === 'Enter' && !terminalBusy) {
      e.preventDefault();
      const cmd = terminalInput.trim();
      if (!cmd) {
        // Echo empty input line and add blank output line
        setTerminalOutputs((prev) => [...prev, `${getPrompt(appInfo, props.appName)} `, '']);
        setHistoryIndex(-1);
        setTerminalInput('');
        setTimeout(() => terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
        return;
      }
      // push to history and reset index
      setTerminalHistory((prev) => [...prev, cmd]);
      setHistoryIndex(-1);
      setTerminalInput('');
      const normalized = cmd.replace(/\s+/g, '').toLowerCase();
      if (normalized === 'clear') {
        setTerminalOutputs([]);
        setTimeout(() => {
          terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          terminalInputRef.current?.focus();
        }, 0);
        return;
      }
      await executeTerminalCommand(cmd);
      return;
    }

    // ArrowUp: navigate backwards in history
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (terminalHistory.length === 0) return;
      if (historyIndex === -1) {
        const newIndex = terminalHistory.length - 1;
        setHistoryIndex(newIndex);
        setTerminalInput(terminalHistory[newIndex] || '');
      } else if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setTerminalInput(terminalHistory[newIndex] || '');
      }
      return;
    }

    // ArrowDown: navigate forwards in history
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (terminalHistory.length === 0) return;
      if (historyIndex === -1) {
        // At fresh state; keep input as is
        return;
      } else if (historyIndex < terminalHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setTerminalInput(terminalHistory[newIndex] || '');
      } else {
        // Beyond last: reset to fresh input
        setHistoryIndex(-1);
        setTerminalInput('');
      }
      return;
    }
  };

  // Focus input when switching to Shell tab and keep view scrolled
  useEffect(() => {
    if (currentTab === 'shell') {
      setTimeout(() => {
        terminalInputRef.current?.focus();
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    }
  }, [currentTab]);

  // Refresh sharing list when switching to Security tab
  useEffect(() => {
    if (currentTab === 'security' && dataLoaded && !sharedBy) {
      fetchSharingList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab, sharedBy]);

  // Initialize Files tab working directory when tab opens
  useEffect(() => {
    if (currentTab === 'files') {
      const wd = getWorkingDir(appInfo);
      if (!wd) {
        setDirError(t('files.errors.workingDirUnavailable'));
        return;
      }
      if (!currentDir) {
        setCurrentDir(wd);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab, appInfo, currentDir]);

  // Fetch listing when currentDir changes on Files tab
  useEffect(() => {
    if (currentTab === 'files' && currentDir) {
      fetchDirectoryListing(currentDir);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab, currentDir]);

  // Refresh Files tab directory listing
  const refreshDirectory = () => {
    if (currentTab === 'files' && currentDir) {
      fetchDirectoryListing(currentDir);
    }
  };

  // Deploy functions
  const deployFromRepo = async () => {
    if (!repoUrl.trim() || !branch.trim()) return;

    setDeployLoading(true);
    setErrors((prev) => ({ ...prev, deploy: null }));

    try {
      await api.put(
        `/api/deploy/${props.appName}/`,
        {},
        {
          params: withSharedBy({
            repo_url: repoUrl.trim(),
            branch: branch.trim(),
          }),
        }
      );

      // Reset form and close modal
      setRepoUrl('');
      setBranch('main');
      setDeployModalOpen(false);

      // Show success message or refresh app info
      setDataLoaded(false); // Force refresh after deploy
      await fetchAppInfo();
    } catch (error: any) {
      console.error('Error deploying from repository:', error);
      setErrors((prev) => ({
        ...prev,
        deploy: error.response?.data?.message || t('deploy.errors.repo'),
      }));
    } finally {
      setDeployLoading(false);
    }
  };

  const deployFromFile = async (file: File) => {
    setFileDeployLoading(true);
    setErrors((prev) => ({ ...prev, deploy: null }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      await api.put(`/api/deploy/`, formData, {
        params: withSharedBy({
          wait: false,
        }),
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Refresh app info after deployment
      setDataLoaded(false); // Force refresh after deploy
      await fetchAppInfo();
    } catch (error: any) {
      console.error('Error deploying from file:', error);
      setErrors((prev) => ({
        ...prev,
        deploy: error.response?.data?.message || t('deploy.errors.file'),
      }));
    } finally {
      setFileDeployLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/zip') {
      deployFromFile(file);
    } else {
      setErrors((prev) => ({
        ...prev,
        deploy: t('deploy.errors.invalidZip'),
      }));
    }
    // Reset input
    event.target.value = '';
  };

  const handleZipFileSelection = () => {
    setZipInfoModalOpen(false);
    document.getElementById('file-upload')?.click();
  };

  // Environment variables functions
  const addEnvironmentVariable = async () => {
    if (!newEnvKey.trim() || !newEnvValue.trim()) return;

    setEnvSubmitting(true);
    try {
      await api.put(`/api/config/${props.appName}/${newEnvKey.trim()}/`, undefined, {
        params: withSharedBy({ value: newEnvValue.trim() }),
      });
      await fetchConfig();
      setNewEnvKey('');
      setNewEnvValue('');
    } catch (error) {
      console.error('Error adding environment variable:', error);
    } finally {
      setEnvSubmitting(false);
    }
  };

  const openDeleteEnvModal = (key: string) => {
    setEnvToDelete(key);
    setShowDeleteEnvModal(true);
  };

  const removeEnvironmentVariable = async () => {
    if (!envToDelete) return;

    setDeletingEnv(envToDelete);
    setShowDeleteEnvModal(false);

    try {
      await api.delete(`/api/config/${props.appName}/${envToDelete}/`, withSharedBy());
      await fetchConfig();
    } catch (error) {
      console.error('Error removing environment variable:', error);
    } finally {
      setDeletingEnv(null);
      setEnvToDelete(null);
    }
  };

  const exportEnvAsJSON = () => {
    try {
      const jsonContent = JSON.stringify(config, null, 2);
      const filename = `${props.appName}-env.json`;
      downloadFile(filename, jsonContent, 'application/json');
    } catch (error) {
      console.error('Error exporting env as JSON:', error);
    }
  };

  const exportEnvAsENV = () => {
    try {
      const lines = Object.entries(config).map(([key, value]) => {
        const raw = String(value);
        const escaped = raw.replace(/'/g, "\\'");
        return `${key}='${escaped}'`;
      });
      const envContent = lines.join('\n');
      const filename = `${props.appName}.env`;
      downloadFile(filename, envContent, 'text/plain');
    } catch (error) {
      console.error('Error exporting env as .ENV:', error);
    }
  };

  const exportEnvAsYML = () => {
    try {
      const lines = Object.entries(config).map(([key, value]) => {
        const raw = String(value);
        const escaped = raw.replace(/'/g, "''");
        return `${key}: '${escaped}'`;
      });
      const ymlContent = lines.join('\n');
      const filename = `${props.appName}-env.yml`;
      downloadFile(filename, ymlContent, 'text/yaml');
    } catch (error) {
      console.error('Error exporting env as .YML:', error);
    }
  };

  const importEnvVariables = async (vars: Record<string, string>) => {
    const entries = Object.entries(vars);
    if (entries.length === 0) {
      setErrors((prev) => ({ ...prev, config: t('env.errors.noneValid') }));
      return;
    }
    setEnvImportLoading(true);
    setErrors((prev) => ({ ...prev, config: null }));
    for (const [key, value] of entries) {
      try {
        await api.put(`/api/config/${props.appName}/${key}/`, undefined, {
          params: withSharedBy({ value: String(value) }),
        });
      } catch (e) {
        console.error('Failed to import variable:', key, e);
      }
    }
    await fetchConfig();
    setEnvImportLoading(false);
  };

  const handleEnvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const name = file.name.toLowerCase();
      const content = await file.text();
      let parsed: Record<string, string> = {};
      if (name.endsWith('.json')) parsed = parseJsonEnv(content);
      else if (name.endsWith('.yml') || name.endsWith('.yaml')) parsed = parseYmlSimple(content);
      else parsed = parseDotEnv(content);
      const sanitized = sanitizeEnvKeys(parsed);
      await importEnvVariables(sanitized);
    } catch (err) {
      console.error('Error importing variables:', err);
      setErrors((prev) => ({ ...prev, config: t('env.errors.importFailed') }));
    }
  };

  const startEditEnvVar = (key: string, currentValue: string) => {
    setEditingEnvKey(key);
    setEditingEnvValue(currentValue);
  };

  const cancelEditEnvVar = () => {
    setEditingEnvKey(null);
    setEditingEnvValue('');
  };

  const saveEditedEnvironmentVariable = async () => {
    if (!editingEnvKey || !editingEnvValue.trim()) return;
    setSavingEnv(true);
    try {
      await api.put(`/api/config/${props.appName}/${editingEnvKey}/`, undefined, {
        params: withSharedBy({ value: editingEnvValue.trim() }),
      });
      await fetchConfig();
      setEditingEnvKey(null);
      setEditingEnvValue('');
    } catch (error) {
      console.error('Error updating environment variable:', error);
    } finally {
      setSavingEnv(false);
    }
  };

  if (!stableSession) {
    return null;
  }

  return (
    <>
      {/* Hidden file inputs to preserve upload/import behaviors */}
      <input
        id='file-upload'
        type='file'
        accept='.zip'
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
      <input
        id='env-file-upload'
        type='file'
        accept='.env,.json,.yml,.yaml'
        style={{ display: 'none' }}
        onChange={handleEnvImport}
      />
      <NavBar session={stableSession} />

      <main className={styles.root}>
        {mainLoading || appUrlLoading || builderLoading || deployInfoLoading ? (
          <LoadingSpinner
            asCard={false}
            title={t('loading.title')}
            messages={[
              t('loading.connectingDokku'),
              t('loading.fetchingAppInfo'),
              t('loading.loadingBuilderInfo'),
              t('loading.checkingStatus'),
              t('loading.almostThere'),
            ]}
          />
        ) : errors.main || errors.builder || errors.deployInfo ? (
          <Flex
            direction='column'
            align='center'
            gap='5'
            justify='center'
            style={{ minHeight: '50vh' }}
          >
            <CustomImage
              alt={'Error Image'}
              src='/images/dokku/logo-error.png'
              className={styles.errorLogoImage}
            />
            <Text size='5' color='red'>
              {errors.main || errors.builder || errors.deployInfo}
            </Text>
            <Button
              size='3'
              onClick={() => window.location.reload()}
              style={{ marginTop: '16px', cursor: 'pointer' }}
            >
              <ReloadIcon /> {t('errorView.reloadPage')}
            </Button>
          </Flex>
        ) : (
          <Flex direction='column' gap='4' className={styles.mainContainer}>
            {/* Header */}
            <HeaderSection
              session={stableSession}
              appInfo={appInfo}
              appUrl={appUrl}
              statusInfo={statusInfo}
              displayName={displayName}
              onVisitWebsite={() => appUrl && window.open(appUrl, '_blank')}
              onOpenDeployModal={() => setDeployModalOpen(true)}
              onOpenZipInfoModal={() => setZipInfoModalOpen(true)}
              sharedBy={sharedBy || null}
            />

            {/* Deploy Section */}
            <DeploySection
              appInfo={appInfo}
              deployInfo={deployInfo}
              domain={websiteConfig.server.domain}
            />

            <Separator size='4' />

            {/* App Control Buttons */}
            <AppControlButtons
              canStart={!getIsRunning(appInfo) && getIsDeployed(appInfo)}
              canStop={getIsDeployed(appInfo) && getIsRunning(appInfo)}
              canRestart={getIsDeployed(appInfo)}
              isBusy={startLoading || stopLoading || restartLoading || rebuildLoading}
              startLoading={startLoading}
              stopLoading={stopLoading}
              restartLoading={restartLoading}
              rebuildLoading={rebuildLoading}
              builderConfigLoading={builderConfigLoading}
              onStart={startApp}
              onStopConfirm={() => setShowStopConfirmModal(true)}
              onRestartConfirm={() => setShowRestartConfirmModal(true)}
              onRebuildConfirm={() => setShowRebuildConfirmModal(true)}
              onOpenBuilder={openBuilderModal}
            />

            {/* Tabs */}
            <Tabs.Root value={currentTab} onValueChange={setCurrentTab} className={styles.tabsRoot}>
              <Tabs.List className={styles.tabsList}>
                <Tabs.Trigger value='overview' className={styles.tabsTrigger}>
                  {t('tabs.overview')}
                </Tabs.Trigger>
                <Tabs.Trigger value='services' className={styles.tabsTrigger}>
                  {t('tabs.services')}
                </Tabs.Trigger>
                <Tabs.Trigger value='network' className={styles.tabsTrigger}>
                  {t('tabs.network')}
                </Tabs.Trigger>
                <Tabs.Trigger value='logs' className={styles.tabsTrigger}>
                  {t('tabs.logs')}
                </Tabs.Trigger>
                <Tabs.Trigger value='shell' className={styles.tabsTrigger}>
                  {t('tabs.shell')}
                </Tabs.Trigger>
                <Tabs.Trigger value='variables' className={styles.tabsTrigger}>
                  {t('tabs.variables')}
                </Tabs.Trigger>
                <Tabs.Trigger value='files' className={styles.tabsTrigger}>
                  {t('tabs.files')}
                </Tabs.Trigger>
                {!sharedBy && (
                  <Tabs.Trigger value='security' className={styles.tabsTrigger}>
                    {t('tabs.security')}
                  </Tabs.Trigger>
                )}
              </Tabs.List>

              {/* Overview Tab */}
              <Tabs.Content value='overview' className={styles.tabsContent}>
                <OverviewSection
                  appInfo={appInfo}
                  deployInfo={deployInfo}
                  builderInfo={builderInfo}
                />
              </Tabs.Content>

              {/* Files Tab */}
              <Tabs.Content value='files' className={styles.tabsContent}>
                <FilesSection
                  isInspectAvailable={!!appInfo && appInfo.info_origin === 'inspect'}
                  dirLoading={dirLoading}
                  dirError={dirError}
                  dirEntries={dirEntries}
                  currentDir={currentDir}
                  isTinyScreen={isTinyScreen}
                  isSmallScreen={isSmallScreen}
                  onRefresh={refreshDirectory}
                  onNavigateParent={navigateToParent}
                  isAtRoot={isAtRoot}
                  getWorkingDir={() => getWorkingDir(appInfo) || '/'}
                  onSetCurrentDir={setCurrentDir}
                  onEntryClick={handleEntryClick}
                  formatSize={formatSize}
                  pathJoin={pathJoin}
                  onDownloadFile={(fullPath: string, name: string) =>
                    downloadAppFile(fullPath, name)
                  }
                />
              </Tabs.Content>

              {/* Services Tab */}
              <Tabs.Content value='services' className={styles.tabsContent}>
                <ServicesSection
                  servicesLoading={servicesLoading}
                  errorServices={errors.services}
                  databases={databases}
                  onOpenService={(dbType: string, displayName: string) =>
                    router.push(`/services/s/${dbType}/${displayName}`)
                  }
                  onCreateService={() => router.push('/services/create/')}
                />
              </Tabs.Content>

              {/* Network Tab */}
              <Tabs.Content value='network' className={styles.tabsContent}>
                <NetworkSection
                  networkLoading={networkLoading}
                  errorNetwork={errors.network}
                  networkData={networkData}
                  protocol={protocol}
                  onSetProtocol={(val: string) => setProtocol(val)}
                  originPort={originPort}
                  onSetOriginPort={(val: string) => setOriginPort(val)}
                  destPort={destPort}
                  onSetDestPort={(val: string) => setDestPort(val)}
                  portSubmitting={portSubmitting}
                  addPortMapping={addPortMapping}
                  portMappingsLoading={portMappingsLoading}
                  errorPortMappings={errors.portMappings}
                  portMappings={portMappings}
                  openDeletePortModal={openDeletePortModal}
                  deletingPort={deletingPort}
                />
              </Tabs.Content>

              {/* Logs Tab */}
              <Tabs.Content value='logs' className={styles.tabsContent}>
                <LogsSection
                  logs={logs}
                  logsLoading={logsLoading}
                  error={errors.logs}
                  logLinesLimit={logLinesLimit}
                  onSetLinesLimit={(n) => setLogLinesLimit(n)}
                  onRefresh={refreshLogs}
                  onDownload={downloadLogs}
                  processAnsiCodes={processAnsiCodes}
                />
              </Tabs.Content>

              {/* Shell Tab */}
              <Tabs.Content value='shell' className={styles.tabsContent}>
                <ShellSection
                  terminalBusy={terminalBusy}
                  terminalOutputs={terminalOutputs}
                  getPrompt={() => getPrompt(appInfo, props.appName)}
                  getPromptLabel={() => getPromptLabel(appInfo, props.appName)}
                  terminalInputRef={terminalInputRef}
                  terminalEndRef={terminalEndRef}
                  terminalInput={terminalInput}
                  onSetTerminalInput={(val: string) => setTerminalInput(val)}
                  onKeyDown={handleTerminalKeyDown}
                />
              </Tabs.Content>

              {/* Variables Tab */}
              <Tabs.Content value='variables' className={styles.tabsContent}>
                <VariablesSection
                  config={config}
                  configLoading={configLoading}
                  errorsConfig={errors.config}
                  newEnvKey={newEnvKey}
                  newEnvValue={newEnvValue}
                  envSubmitting={envSubmitting}
                  envImportLoading={envImportLoading}
                  editingEnvKey={editingEnvKey}
                  editingEnvValue={editingEnvValue}
                  savingEnv={savingEnv}
                  deletingEnv={deletingEnv}
                  addEnvironmentVariable={addEnvironmentVariable}
                  startEditEnvVar={startEditEnvVar}
                  cancelEditEnvVar={cancelEditEnvVar}
                  saveEditedEnvironmentVariable={saveEditedEnvironmentVariable}
                  openDeleteEnvModal={openDeleteEnvModal}
                  exportEnvAsENV={exportEnvAsENV}
                  exportEnvAsJSON={exportEnvAsJSON}
                  exportEnvAsYML={exportEnvAsYML}
                  onOpenImport={() => document.getElementById('env-file-upload')?.click()}
                  setNewEnvKey={(val) => setNewEnvKey(val)}
                  setNewEnvValue={(val) => setNewEnvValue(val)}
                />
              </Tabs.Content>

              {/* Security Tab */}
              {!sharedBy && (
                <Tabs.Content value='security' className={styles.tabsContent}>
                  <SecuritySection
                    deploymentToken={deploymentToken}
                    showDeploymentToken={showDeploymentToken}
                    onToggleShowToken={() => setShowDeploymentToken(!showDeploymentToken)}
                    onCopyToken={copyDeploymentToken}
                    onOpenDeleteModal={() => setShowDeleteAppModal(true)}
                    shareEmail={shareEmail}
                    onSetShareEmail={(val: string) => setShareEmail(val)}
                    onRequestShare={onRequestShare}
                    sharingList={sharingList}
                    sharingLoading={sharingLoading}
                    sharingError={sharingError}
                    sharingListLoaded={sharingListLoaded}
                    onOpenUnshareConfirm={onOpenUnshareConfirm}
                  />
                </Tabs.Content>
              )}
            </Tabs.Root>
          </Flex>
        )}
      </main>

      {/* Deploy Modal */}
      <DeployRepoModal
        open={deployModalOpen}
        onOpenChange={setDeployModalOpen}
        errorDeploy={errors.deploy}
        repoUrl={repoUrl}
        onSetRepoUrl={(val: string) => setRepoUrl(val)}
        branch={branch}
        onSetBranch={(val: string) => setBranch(val)}
        deployLoading={deployLoading}
        deployFromRepo={deployFromRepo}
      />

      {/* Delete App Confirmation Modal */}
      <DeleteAppModal
        open={showDeleteAppModal}
        onOpenChange={setShowDeleteAppModal}
        displayName={displayName}
        deleteConfirmText={deleteConfirmText}
        onSetDeleteConfirmText={(val: string) => setDeleteConfirmText(val)}
        deleteAppLoading={deleteAppLoading}
        deleteApp={deleteApp}
      />

      {/* Zip Info Modal */}
      <ZipInfoModal
        open={zipInfoModalOpen}
        onOpenChange={setZipInfoModalOpen}
        handleZipFileSelection={handleZipFileSelection}
      />
      {/* Loading overlay for file upload */}
      {fileDeployLoading && (
        <Box
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <Card style={{ padding: '24px', textAlign: 'center' }}>
            <ReloadIcon className={styles.buttonSpinner} style={{ marginBottom: '12px' }} />
            <Text size='3'>{t('deploy.uploadingFile')}</Text>
          </Card>
        </Box>
      )}

      {/* Delete Environment Variable Modal */}
      <DeleteEnvModal
        open={showDeleteEnvModal}
        onOpenChange={setShowDeleteEnvModal}
        envToDelete={envToDelete}
        deletingEnv={deletingEnv}
        removeEnvironmentVariable={removeEnvironmentVariable}
      />

      {/* Delete Port Mapping Modal */}
      <DeletePortModal
        open={showDeletePortModal}
        onOpenChange={setShowDeletePortModal}
        portToDelete={portToDelete}
        deletingPort={deletingPort}
        removePortMapping={removePortMapping}
      />

      {/* Share Confirmation Modal */}
      <ShareConfirmModal
        open={confirmShareOpen}
        onOpenChange={setConfirmShareOpen}
        pendingShareEmail={pendingShareEmail}
        sharingLoading={sharingLoading}
        onConfirm={onConfirmShare}
      />

      {/* Unshare Confirmation Modal */}
      <UnshareConfirmModal
        open={confirmUnshareOpen}
        onOpenChange={setConfirmUnshareOpen}
        pendingUnshareEmail={pendingUnshareEmail}
        unsharingLoading={sharingLoading}
        onConfirm={onConfirmUnshare}
      />

      {/* Stop App Confirmation Modal */}
      <StopAppConfirmModal
        open={showStopConfirmModal}
        onOpenChange={setShowStopConfirmModal}
        stopLoading={stopLoading}
        onConfirm={() => {
          setShowStopConfirmModal(false);
          stopApp();
        }}
      />

      {/* Restart App Confirmation Modal */}
      <RestartAppConfirmModal
        open={showRestartConfirmModal}
        onOpenChange={setShowRestartConfirmModal}
        restartLoading={restartLoading}
        onConfirm={() => {
          setShowRestartConfirmModal(false);
          restartApp();
        }}
      />

      {/* Rebuild App Confirmation Modal */}
      <RebuildAppConfirmModal
        open={showRebuildConfirmModal}
        onOpenChange={setShowRebuildConfirmModal}
        rebuildLoading={rebuildLoading}
        onConfirm={() => {
          setShowRebuildConfirmModal(false);
          rebuildApp();
        }}
      />

      {/* Builder Configuration Modal */}
      <BuilderConfigModal
        open={builderModalOpen}
        onOpenChange={(open) => {
          setBuilderModalOpen(open);
          if (!open) {
            setErrors((prev) => ({ ...prev, builder: null }));
          }
        }}
        selectedBuilder={selectedBuilder}
        onSetSelectedBuilder={setSelectedBuilder}
        builderConfigLoading={builderConfigLoading}
        errorBuilder={errors.builder}
        configureBuilder={configureBuilder}
      />
    </>
  );
}
