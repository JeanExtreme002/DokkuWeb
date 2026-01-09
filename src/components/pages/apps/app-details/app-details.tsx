import {
  ChevronDownIcon,
  CodeIcon,
  DownloadIcon,
  GearIcon,
  GitHubLogoIcon,
  GlobeIcon,
  InfoCircledIcon,
  Pencil1Icon,
  PlayIcon,
  PlusIcon,
  ReloadIcon,
  RocketIcon,
  TrashIcon,
  UploadIcon,
} from '@radix-ui/react-icons';
import {
  Avatar,
  Box,
  Button,
  Card,
  Dialog,
  DropdownMenu,
  Flex,
  Heading,
  Select,
  Separator,
  Tabs,
  Text,
  TextField,
  Tooltip,
} from '@radix-ui/themes';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { LoadingSpinner, NavBar } from '@/components/shared';
import { api, config as websiteConfig, formatDate, formatTimestamp } from '@/lib';

import styles from './app-details.module.css';

interface AppDetailsPageProps {
  appName: string;
}

// Types
interface AppContainer {
  Id: string;
  Name: string;
  Image: string;
  Created: string;
  State: {
    Running: boolean;
    Status: string;
    StartedAt: string;
    FinishedAt: string;
    Pid: number;
  };
  Config: {
    Labels: Record<string, string>;
    Env: string[];
    Image: string;
    Hostname: string;
    WorkingDir: string;
  };
  NetworkSettings: {
    Networks: {
      bridge: {
        IPAddress: string;
        Gateway: string;
        MacAddress: string;
      };
    };
  };
}

interface AppReportData {
  deployed: string;
  processes: string;
  ps_can_scale: string;
  ps_computed_procfile_path: string;
  ps_global_procfile_path: string;
  ps_procfile_path: string;
  ps_restart_policy: string;
  restore: string;
  running: string;
}

interface AppInfo {
  data: AppContainer[] | AppReportData;
  info_origin: 'inspect' | 'report';
  raw_name: string;
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

interface BuilderData {
  builder_build_dir: string;
  builder_computed_build_dir: string;
  builder_computed_selected: string;
  builder_global_build_dir: string;
  builder_global_selected: string;
  builder_selected: string;
}

interface DeployInfoData {
  'Git deploy branch'?: string;
  'Git global deploy branch'?: string;
  'Git keep git dir'?: string;
  'Git rev env var'?: string;
  'Git sha'?: string;
  'Git last updated at'?: string;
}

// Database images mapping (same as services page)
const DATABASE_IMAGES: Record<string, string> = {
  postgres: '/images/database-logos/postgresql.svg',
  mysql: '/images/database-logos/mysql.svg',
  mongodb: '/images/database-logos/mongodb.svg',
  redis: '/images/database-logos/redis.svg',
  mariadb: '/images/database-logos/mariadb.svg',
  couchdb: '/images/database-logos/couchdb.svg',
  cassandra: '/images/database-logos/cassandra.svg',
  elasticsearch: '/images/database-logos/elasticsearch.svg',
  influxdb: '/images/database-logos/influxdb.svg',
  generic: '/images/database-logos/generic.svg',
};

// Utility functions moved to module scope for stability
const processAnsiCodes = (text: string) => {
  // Remove ANSI escape codes for cleaner display
  return text.replace(/\u001b\[[0-9;]*m/g, '');
};

type DirEntry = {
  name: string;
  type: 'file' | 'dir' | 'symlink' | 'other';
  permissions: string;
  owner: string;
  group: string;
  size: number;
  date: string;
  target?: string;
};

const parseLsOutput = (text: string): DirEntry[] => {
  const clean = processAnsiCodes(text);
  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const out: DirEntry[] = [];
  for (const line of lines) {
    if (/^total\s+\d+/.test(line)) continue;
    const parts = line.trim().split(/\s+/);
    if (parts.length < 9) continue;
    const permissions = parts[0];
    const owner = parts[2] || '';
    const group = parts[3] || '';
    const size = parseInt(parts[4] || '0', 10) || 0;
    const date = `${parts[5]} ${parts[6]} ${parts[7]}`;
    const nameAndRest = parts.slice(8).join(' ');
    let name = nameAndRest;
    let target: string | undefined = undefined;
    const arrowIdx = nameAndRest.indexOf(' -> ');
    if (arrowIdx > -1) {
      name = nameAndRest.slice(0, arrowIdx);
      target = nameAndRest.slice(arrowIdx + 4);
    }
    const typeChar = permissions.charAt(0);
    let type: DirEntry['type'] = 'other';
    if (typeChar === 'd') type = 'dir';
    else if (typeChar === '-') type = 'file';
    else if (typeChar === 'l') type = 'symlink';
    out.push({ name, type, permissions, owner, group, size, date, target });
  }
  // Sort: directories first, then files, then others; special '.' and '..' first
  out.sort((a, b) => {
    const special = (n: string) => (n === '.' ? -2 : n === '..' ? -1 : 0);
    const sa = special(a.name);
    const sb = special(b.name);
    if (sa !== sb) return sa - sb;
    const order = (t: DirEntry['type']) => (t === 'dir' ? 0 : t === 'file' ? 1 : 2);
    const oa = order(a.type);
    const ob = order(b.type);
    if (oa !== ob) return oa - ob;
    return a.name.localeCompare(b.name);
  });
  return out;
};

export function AppDetailsPage(props: AppDetailsPageProps) {
  const { data: session } = useSession();
  const router = useRouter();

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
            setError('Erro ao carregar dados. Verifique sua conexão.');
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
    []
  );

  // API fetch functions
  const fetchAppInfo = useCallback(async () => {
    try {
      const response = await api.post(`/api/apps/${props.appName}/info/`);
      if (response.data.success) {
        setAppInfo(response.data.result);
      }
    } catch (error: any) {
      // Check if it's a 404 error with "App does not exist" message
      if (error.response?.status === 404 && error.response?.data?.detail === 'App does not exist') {
        // Redirect to 404 page
        router.push('/404');
        return;
      }
      // Re-throw the error for the retry logic to handle
      throw error;
    }
  }, [props.appName, router]);

  const fetchDatabases = useCallback(async () => {
    const response = await api.post(`/api/apps/${props.appName}/databases/`);
    if (response.data.success) {
      setDatabases(response.data.result);
    }
  }, [props.appName]);

  const fetchNetwork = useCallback(async () => {
    const response = await api.post(`/api/apps/${props.appName}/network/`);
    if (response.data.success) {
      setNetworkData(response.data.result);
    }
  }, [props.appName]);

  const fetchPortMappings = useCallback(async () => {
    const response = await api.post(
      `/api/apps/${props.appName}/ports/`,
      {},
      { params: { use_proxy: false } }
    );
    if (response.data.success) {
      setPortMappings(response.data.result);
    }
  }, [props.appName]);

  const fetchLogs = useCallback(async () => {
    const response = await api.post(
      `/api/apps/${props.appName}/logs/`,
      {},
      {
        params: { n_lines: logLinesLimit },
      }
    );
    if (response.data.success) {
      setLogs(response.data.result);
    }
  }, [props.appName, logLinesLimit]);

  const fetchConfig = useCallback(async () => {
    const response = await api.post(`/api/config/${props.appName}/`);
    if (response.data.success) {
      setConfig(response.data.result);
    }
  }, [props.appName]);

  const fetchAppUrl = useCallback(async () => {
    const response = await api.post(`/api/apps/${props.appName}/url/`);
    if (response.data.success) {
      setAppUrl(response.data.result);
    }
  }, [props.appName]);

  const fetchDeploymentToken = useCallback(async () => {
    const response = await api.post(`/api/apps/${props.appName}/deployment-token/`);
    if (response.data.success) {
      setDeploymentToken(response.data.result);
    }
  }, [props.appName]);

  const fetchBuilderInfo = useCallback(async () => {
    const response = await api.post(`/api/apps/${props.appName}/builder/`);
    if (response.data.success) {
      setBuilderInfo(response.data.result);
    }
  }, [props.appName]);

  const fetchDeployInfo = useCallback(async () => {
    const response = await api.post(`/api/deploy/${props.appName}/info/`);
    if (response.data.success) {
      setDeployInfo(response.data.result);
    }
  }, [props.appName]);

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
        }
      );
      if (appDeployInfoResponse.data.success) {
        setDeployInfo(appDeployInfoResponse.data.result);
      }
    } catch (error) {
      console.warn('Silent overview refresh error (ignored):', error);
    }
  }, [props.appName]);

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
        await Promise.all([
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
            () => {} // Não precisa de erro separado
          ),
          fetchWithRetry(
            fetchDeploymentToken,
            () => {}, // Não precisa de loading separado
            () => {} // Não precisa de erro separado
          ),
        ]);

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

        // Mark data as loaded to prevent re-fetching on tab change
        setDataLoaded(true);
      } catch (error) {
        console.error('Error loading app data:', error);
      }
    };

    loadAllData();
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

  // Helper functions
  const getStatusInfo = () => {
    if (!appInfo)
      return { color: 'var(--gray-9)', text: 'Carregando...', bgColor: 'var(--gray-3)' };

    if (appInfo.info_origin === 'report') {
      const reportData = appInfo.data as AppReportData;
      const isDeployed = reportData.deployed === 'true';
      const isRunning = reportData.running === 'true';
      const processCount = parseInt(reportData.processes) || 0;

      if (!isDeployed) {
        return { color: 'var(--gray-9)', text: 'Não implantado', bgColor: 'var(--gray-3)' };
      } else if (!isRunning || processCount === 0) {
        return { color: 'var(--red-9)', text: 'Parado', bgColor: 'var(--red-3)' };
      } else {
        return { color: 'var(--green-9)', text: 'Ativo', bgColor: 'var(--green-3)' };
      }
    } else {
      const containers = appInfo.data as AppContainer[];
      const runningContainers = containers.filter((container) => container.State.Running);

      if (containers.length === 0) {
        return { color: 'var(--red-9)', text: 'Erro', bgColor: 'var(--red-3)' };
      } else if (runningContainers.length === 0) {
        return { color: 'var(--red-9)', text: 'Parado', bgColor: 'var(--red-3)' };
      } else if (runningContainers.length < containers.length) {
        return { color: 'var(--amber-9)', text: 'Parcial', bgColor: 'var(--amber-3)' };
      } else {
        return { color: 'var(--green-9)', text: 'Ativo', bgColor: 'var(--green-3)' };
      }
    }
  };

  const getIsDeployed = () => {
    if (!appInfo) return false;

    if (appInfo.info_origin === 'report') {
      const reportData = appInfo.data as AppReportData;
      return reportData.deployed === 'true';
    } else {
      const containers = appInfo.data as AppContainer[];
      return containers.length > 0;
    }
  };

  const getIsRunning = () => {
    if (!appInfo) return false;

    if (appInfo.info_origin === 'report') {
      const reportData = appInfo.data as AppReportData;
      const isDeployed = reportData.deployed === 'true';
      const isRunning = reportData.running === 'true';
      const processCount = parseInt(reportData.processes) || 0;
      return isDeployed && isRunning && processCount > 0;
    } else {
      const containers = appInfo.data as AppContainer[];
      const runningContainers = containers.filter((container) => container.State.Running);
      return runningContainers.length > 0;
    }
  };

  const formatAppName = (name: string) => {
    return name.replace(/^\d+-/, '');
  };

  const getWorkingDir = useCallback(() => {
    if (appInfo && appInfo.info_origin === 'inspect') {
      const containers = appInfo.data as AppContainer[];
      return containers?.[0]?.Config?.WorkingDir || '/';
    }
    return '';
  }, [appInfo]);

  const isAtRoot = () => {
    const wd = getWorkingDir();
    if (wd) return currentDir === wd;
    return !currentDir || currentDir === '/';
  };

  const pathJoin = (base: string, sub: string) => {
    if (!base) return sub || '/';
    const b = base.endsWith('/') ? base.slice(0, -1) : base;
    const s = sub.startsWith('/') ? sub.slice(1) : sub;
    const joined = `${b}/${s}`;
    return joined.replace(/\/+/g, '/');
  };

  const formatSize = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes < 0) return '-';
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    let value = bytes;
    while (value >= 1024 && i < units.length - 1) {
      value /= 1024;
      i++;
    }
    if (i === 0) return `${bytes} bytes`;
    const formatted = value.toFixed(value < 10 ? 1 : 0);
    return `${formatted} ${units[i]}`;
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
        const params: Record<string, any> = { command: `ls ${dir} -a -l` };
        if (containerType) params.container_type = containerType;
        const response = await api.post(`/api/apps/${props.appName}/exec/`, {}, { params });
        const output = String(response?.data?.result ?? '');
        if (response?.data?.success) {
          setDirEntries(parseLsOutput(output));
        } else {
          setDirError('Falha ao listar diretório.');
        }
      } catch (err: any) {
        setDirError(err?.response?.data?.message || 'Erro ao executar comando ls');
      } finally {
        setDirLoading(false);
      }
    },
    [appInfo, props.appName]
  );

  const navigateToParent = () => {
    const wd = getWorkingDir();
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

  // Terminal prompt builder
  const getPrompt = () => {
    let workingDir = '';
    if (appInfo && appInfo.info_origin === 'inspect') {
      const containers = appInfo.data as AppContainer[];
      workingDir = containers?.[0]?.Config?.WorkingDir || '';
    }
    return `${props.appName} - ${workingDir} %`;
  };

  // Prompt label for compact view (without the trailing symbol)
  const getPromptLabel = () => {
    let workingDir = '';
    if (appInfo && appInfo.info_origin === 'inspect') {
      const containers = appInfo.data as AppContainer[];
      workingDir = containers?.[0]?.Config?.WorkingDir || '';
    }
    return `${props.appName} - ${workingDir}`.trim();
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

  const copyDeploymentToken = async () => {
    if (deploymentToken) {
      try {
        await navigator.clipboard.writeText(deploymentToken);
        // Aqui você pode adicionar uma notificação de sucesso se tiver um sistema de toast
      } catch (error) {
        console.error('Error copying deployment token:', error);
      }
    }
  };

  // Delete application handler
  const deleteApp = async () => {
    setDeleteAppLoading(true);
    try {
      await api.delete(`/api/apps/${props.appName}`);
      router.push('/apps');
    } catch (error: any) {
      console.error('Error deleting app:', error);
      setErrors((prev) => ({
        ...prev,
        main: error.response?.data?.message || 'Erro ao deletar aplicativo',
      }));
    } finally {
      setDeleteAppLoading(false);
      setShowDeleteAppModal(false);
    }
  };

  // Helper functions for services
  const getServiceImage = (pluginName: string) => {
    return DATABASE_IMAGES[pluginName] || DATABASE_IMAGES.generic;
  };

  const formatDatabaseType = (pluginName: string) => {
    const typeMap: Record<string, string> = {
      postgres: 'PostgreSQL',
      mysql: 'MySQL',
      mongodb: 'MongoDB',
      redis: 'Redis',
      mariadb: 'MariaDB',
      couchdb: 'CouchDB',
      cassandra: 'Cassandra',
      elasticsearch: 'Elasticsearch',
      influxdb: 'InfluxDB',
    };
    return typeMap[pluginName] || pluginName.charAt(0).toUpperCase() + pluginName.slice(1);
  };

  const formatServiceName = (serviceName: string) => {
    // Remove prefixos numéricos como "1_" se existirem
    return serviceName.replace(/^\d+_/, '');
  };

  // Port mapping functions
  const addPortMapping = async () => {
    if (!originPort || !destPort) return;

    setPortSubmitting(true);
    try {
      await api.post(
        `/api/apps/${props.appName}/ports/${protocol}/${originPort}/${destPort}/`,
        {},
        { params: { use_proxy: false } }
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
        { use_proxy: false }
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
      await api.post(`/api/apps/${props.appName}/start/`);
      // Refresh app info after action
      setDataLoaded(false);
      await fetchAppInfo();
    } catch (error: any) {
      console.error('Error starting app:', error);
      setErrors((prev) => ({
        ...prev,
        main: error.response?.data?.message || 'Erro ao iniciar aplicativo',
      }));
    } finally {
      setStartLoading(false);
    }
  };

  const stopApp = async () => {
    setStopLoading(true);
    try {
      await api.post(`/api/apps/${props.appName}/stop/`);
      // Refresh app info after action
      setDataLoaded(false);
      await fetchAppInfo();
    } catch (error: any) {
      console.error('Error stopping app:', error);
      setErrors((prev) => ({
        ...prev,
        main: error.response?.data?.message || 'Erro ao parar aplicativo',
      }));
    } finally {
      setStopLoading(false);
    }
  };

  const restartApp = async () => {
    setRestartLoading(true);
    try {
      await api.post(`/api/apps/${props.appName}/restart/`);
      // Refresh app info after action
      setDataLoaded(false);
      await fetchAppInfo();
    } catch (error: any) {
      console.error('Error restarting app:', error);
      setErrors((prev) => ({
        ...prev,
        main: error.response?.data?.message || 'Erro ao reiniciar aplicativo',
      }));
    } finally {
      setRestartLoading(false);
    }
  };

  const rebuildApp = async () => {
    setRebuildLoading(true);
    try {
      await api.post(`/api/apps/${props.appName}/rebuild/`);
      // Refresh app info after action
      setDataLoaded(false);
      await fetchAppInfo();
    } catch (error: any) {
      console.error('Error rebuilding app:', error);
      setErrors((prev) => ({
        ...prev,
        main: error.response?.data?.message || 'Erro ao reconstruir aplicativo',
      }));
    } finally {
      setRebuildLoading(false);
    }
  };

  // Builder configuration functions
  const openBuilderModal = () => {
    // Set the current builder as the default selection
    const currentBuilder = builderInfo?.builder_computed_selected || 'herokuish';
    setSelectedBuilder(currentBuilder);
    setBuilderModalOpen(true);
  };

  const configureBuilder = async () => {
    if (!selectedBuilder) return;

    setBuilderConfigLoading(true);
    try {
      await api.post(`/api/apps/${props.appName}/builder/${selectedBuilder.toLowerCase()}/`);
      // Refresh builder info after configuration
      await fetchBuilderInfo();
      setBuilderModalOpen(false);
    } catch (error: any) {
      console.error('Error configuring builder:', error);
      setErrors((prev) => ({
        ...prev,
        builder: error.response?.data?.message || 'Erro ao configurar builder',
      }));
    } finally {
      setBuilderConfigLoading(false);
    }
  };

  const executeTerminalCommand = async (command: string) => {
    const trimmed = command.trim();
    if (!trimmed) {
      // Echo empty input line and add blank output line
      setTerminalOutputs((prev) => [...prev, `${getPrompt()} `, '']);
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
    setTerminalOutputs((prev) => [...prev, `${getPrompt()} ${command}`]);
    setTimeout(() => terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    setTerminalBusy(true);
    try {
      // Determine container type from inspect data, if available
      let containerType: string | undefined = undefined;
      if (appInfo && appInfo.info_origin === 'inspect') {
        const containers = appInfo.data as AppContainer[];
        containerType = containers?.[0]?.Config?.Labels?.['com.dokku.process-type'];
      }
      const params: Record<string, any> = { command };
      if (containerType) {
        params.container_type = containerType;
      }
      const response = await api.post(`/api/apps/${props.appName}/exec/`, {}, { params });
      const cleaned = processAnsiCodes(String(response.data.result ?? ''));
      if (response?.data?.success) {
        setTerminalOutputs((prev) => [...prev, cleaned, '']);
      } else {
        setTerminalOutputs((prev) => [
          ...prev,
          `[Error] Comando não pôde ser executado. \n${cleaned}`,
          '',
        ]);
      }
    } catch (err: any) {
      setTerminalOutputs((prev) => [
        ...prev,
        `[erro] ${err?.response?.data?.message || 'Falha ao executar comando'}`,
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
        setTerminalOutputs((prev) => [...prev, `${getPrompt()} `, '']);
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

  // Initialize Files tab working directory when tab opens
  useEffect(() => {
    if (currentTab === 'files') {
      const wd = getWorkingDir();
      if (!wd) {
        setDirError('WorkingDir indisponível para este aplicativo.');
        return;
      }
      if (!currentDir) {
        setCurrentDir(wd);
      }
    }
  }, [currentTab, appInfo, currentDir, getWorkingDir]);

  // Fetch listing when currentDir changes on Files tab
  useEffect(() => {
    if (currentTab === 'files' && currentDir) {
      fetchDirectoryListing(currentDir);
    }
  }, [currentTab, currentDir, fetchDirectoryListing]);

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
          params: {
            repo_url: repoUrl.trim(),
            branch: branch.trim(),
          },
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
        deploy: error.response?.data?.message || 'Erro ao fazer deploy do repositório',
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
        params: {
          wait: false,
        },
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
        deploy: error.response?.data?.message || 'Erro ao fazer deploy do arquivo',
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
        deploy: 'Por favor, selecione um arquivo .zip válido',
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
        params: { value: newEnvValue.trim() },
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
      await api.delete(`/api/config/${props.appName}/${envToDelete}/`);
      await fetchConfig();
    } catch (error) {
      console.error('Error removing environment variable:', error);
    } finally {
      setDeletingEnv(null);
      setEnvToDelete(null);
    }
  };

  // Export environment variables helpers
  const downloadFile = (filename: string, content: string, mimeType: string) => {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
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

  // Import environment variables helpers
  const parseDotEnv = (content: string): Record<string, string> => {
    const result: Record<string, string> = {};
    const lines = content.split(/\r?\n/);
    for (let line of lines) {
      if (!line) continue;
      // Trim spaces and ignore comments
      line = line.trim();
      if (!line || line.startsWith('#')) continue;
      // Remove optional export keyword
      line = line.replace(/^export\s+/, '');
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_\.-]*)\s*=\s*(.*)$/);
      if (!match) continue;
      const key = match[1];
      let value = match[2] ?? '';
      // Remove inline comments for unquoted values
      const isQuoted =
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"));
      if (!isQuoted) {
        const hashIndex = value.indexOf('#');
        if (hashIndex > -1) value = value.slice(0, hashIndex).trim();
      }
      // Strip quotes and unescape
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value
          .slice(1, -1)
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1).replace(/''/g, "'");
      } else {
        value = value.trim();
      }
      result[key] = value;
    }
    return result;
  };

  const parseYmlSimple = (content: string): Record<string, string> => {
    const result: Record<string, string> = {};
    const lines = content.split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#') || line.startsWith('- ')) continue;
      const match = line.match(/^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/);
      if (!match) continue;
      const key = match[1];
      let value = match[2] ?? '';
      // handle comments for unquoted
      const isQuoted =
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"));
      if (!isQuoted) {
        const hashIndex = value.indexOf('#');
        if (hashIndex > -1) value = value.slice(0, hashIndex).trim();
      }
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value
          .slice(1, -1)
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1).replace(/''/g, "'");
      } else {
        value = value.trim();
      }
      if (key) result[key] = value;
    }
    return result;
  };

  const parseJsonEnv = (content: string): Record<string, string> => {
    try {
      const obj = JSON.parse(content);
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(obj)) {
        if (!k) continue;
        const key = k as string;
        const val = typeof v === 'string' ? v : JSON.stringify(v);
        out[key] = val;
      }
      return out;
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      return {};
    }
  };

  const sanitizeEnvKeys = (vars: Record<string, string>): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(vars)) {
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(k)) out[k] = String(v);
    }
    return out;
  };

  const importEnvVariables = async (vars: Record<string, string>) => {
    const entries = Object.entries(vars);
    if (entries.length === 0) {
      setErrors((prev) => ({ ...prev, config: 'Nenhuma variável válida encontrada no arquivo.' }));
      return;
    }
    setEnvImportLoading(true);
    setErrors((prev) => ({ ...prev, config: null }));
    for (const [key, value] of entries) {
      try {
        await api.put(`/api/config/${props.appName}/${key}/`, undefined, {
          params: { value: String(value) },
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
      setErrors((prev) => ({ ...prev, config: 'Erro ao importar variáveis do arquivo.' }));
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
        params: { value: editingEnvValue.trim() },
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

  const statusInfo = getStatusInfo();
  const displayName = formatAppName(props.appName);

  return (
    <>
      <NavBar session={stableSession} />

      <main className={styles.root}>
        {mainLoading || appUrlLoading || builderLoading || deployInfoLoading ? (
          <LoadingSpinner
            asCard={false}
            title='Carregando Aplicativo'
            messages={[
              'Conectando ao Dokku...',
              'Obtendo informações do aplicativo...',
              'Carregando informações do builder...',
              'Verificando status...',
              'Quase pronto...',
            ]}
          />
        ) : errors.main || errors.builder || errors.deployInfo ? (
          <Flex direction='column' align='center' justify='center' style={{ minHeight: '50vh' }}>
            <Text size='5' color='red'>
              {errors.main || errors.builder || errors.deployInfo}
            </Text>
            <Button size='3' onClick={() => window.location.reload()} style={{ marginTop: '16px' }}>
              <ReloadIcon /> Recarregar
            </Button>
          </Flex>
        ) : (
          <Flex direction='column' gap='4' className={styles.mainContainer}>
            {/* Header */}
            <Box className={styles.headerSection}>
              <Flex justify='between' align='center' style={{ width: '100%' }}>
                <Flex className={styles.appTitle}>
                  <Flex align='center' gap='3' style={{ alignItems: 'center' }}>
                    <Avatar
                      size='4'
                      src={
                        !stableSession?.user?.name?.toLowerCase().startsWith('takeover')
                          ? stableSession?.user?.image || undefined
                          : undefined
                      }
                      fallback={stableSession?.user?.name?.charAt(0).toUpperCase() || 'U'}
                      radius='full'
                      style={{ flexShrink: 0 }}
                    />
                    <Heading
                      size='8'
                      weight='bold'
                      className={styles.appTitleText}
                      style={{ color: 'var(--gray-12)' }}
                    >
                      {displayName}
                    </Heading>
                  </Flex>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Box
                      className={styles.statusBadge}
                      style={{
                        backgroundColor: statusInfo.bgColor,
                        color: statusInfo.color,
                      }}
                    >
                      {statusInfo.text}
                    </Box>
                    <Text size='2' style={{ color: 'var(--gray-11)' }}>
                      {appInfo?.info_origin === 'inspect' &&
                        ' · ' +
                          (appInfo?.data as AppContainer[])[0]?.Config?.Labels?.[
                            'com.dokku.process-type'
                          ]}
                    </Text>
                  </Box>
                </Flex>

                {/* Desktop Buttons */}
                <Flex className={styles.desktopOnly} gap='4' align='center'>
                  {/* App URL Button */}
                  {appUrl && (
                    <Button
                      onClick={() => window.open(appUrl, '_blank')}
                      variant='outline'
                      color={undefined}
                      className={`${styles.urlButton} ${styles.purpleOutlineButton}`}
                      style={
                        {
                          marginRight: '16px',
                          '--accent-9': 'var(--purple-9)',
                          '--accent-2': 'var(--purple-2)',
                          '--accent-3': 'var(--purple-3)',
                        } as React.CSSProperties
                      }
                    >
                      <svg
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' />
                        <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' />
                      </svg>
                      Visitar Website
                    </Button>
                  )}

                  {/* Deploy Button */}
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <Button variant='solid'>
                        <CodeIcon />
                        Deploy
                        <ChevronDownIcon />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Label>Deploy via:</DropdownMenu.Label>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item onClick={() => setDeployModalOpen(true)}>
                        <GitHubLogoIcon />
                        Repositório público
                      </DropdownMenu.Item>
                      <DropdownMenu.Item onClick={() => setZipInfoModalOpen(true)}>
                        <UploadIcon />
                        Arquivo .zip
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Flex>
              </Flex>

              {/* Mobile Buttons */}
              <Flex
                className={styles.mobileOnly}
                direction='column'
                gap='4'
                style={{ marginTop: '16px' }}
              >
                {/* App URL Button */}
                {appUrl && (
                  <Button
                    className={`${styles.urlButton} ${styles.purpleOutlineButton}`}
                    onClick={() => window.open(appUrl, '_blank')}
                    variant='outline'
                    color={undefined}
                    style={
                      {
                        marginBottom: '16px',
                        '--accent-9': 'var(--purple-9)',
                        '--accent-2': 'var(--purple-2)',
                        '--accent-3': 'var(--purple-3)',
                      } as React.CSSProperties
                    }
                  >
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' />
                      <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' />
                    </svg>
                    Visitar Website
                  </Button>
                )}

                {/* Deploy Button */}
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Button variant='solid' className={styles.urlButton}>
                      <CodeIcon />
                      Deploy
                      <ChevronDownIcon />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Label>Deploy via:</DropdownMenu.Label>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item onClick={() => setDeployModalOpen(true)}>
                      <GitHubLogoIcon />
                      Repositório público
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => setZipInfoModalOpen(true)}>
                      <UploadIcon />
                      Arquivo .zip
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </Flex>
            </Box>

            {/* Deploy Section */}
            <div className={styles.deploySection}>
              <Text className={styles.deployTitle}>Deploy com Git:</Text>
              <Box className={styles.codeBlock}>
                <div>
                  <span className={styles.command}>$ git remote add dokku</span> dokku@
                  {websiteConfig.server.domain}:{appInfo?.raw_name}
                </div>
                <div>
                  <span className={styles.command}>
                    $ git push dokku{' '}
                    {(deployInfo ? deployInfo['Git deploy branch'] : null) || '<branch>'}
                  </span>
                </div>
              </Box>
            </div>

            <Separator size='4' />

            {/* App Control Buttons */}
            <Flex direction='column' gap='3'>
              <Flex
                direction='column'
                gap='3'
                className={styles.appControlButtons}
                style={{ width: '100%' }}
              >
                {/* Primeira linha: Iniciar, Parar, Reiniciar */}
                <Flex gap='3' className={styles.buttonRow} style={{ width: '100%' }}>
                  <Button
                    size='3'
                    variant='outline'
                    color='green'
                    onClick={startApp}
                    disabled={
                      getIsRunning() ||
                      !getIsDeployed() ||
                      startLoading ||
                      stopLoading ||
                      restartLoading ||
                      rebuildLoading
                    }
                  >
                    {startLoading ? <ReloadIcon className={styles.buttonSpinner} /> : <PlayIcon />}
                    Iniciar
                  </Button>

                  <Button
                    size='3'
                    variant='outline'
                    color='red'
                    onClick={() => setShowStopConfirmModal(true)}
                    disabled={
                      !getIsDeployed() ||
                      !getIsRunning() ||
                      startLoading ||
                      stopLoading ||
                      restartLoading ||
                      rebuildLoading
                    }
                  >
                    {stopLoading ? (
                      <ReloadIcon className={styles.buttonSpinner} />
                    ) : (
                      <svg
                        width='16'
                        height='16'
                        viewBox='0 0 16 16'
                        fill='currentColor'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <rect x='4' y='2' width='2' height='12' rx='1' />
                        <rect x='10' y='2' width='2' height='12' rx='1' />
                      </svg>
                    )}
                    Parar
                  </Button>

                  <Button
                    size='3'
                    variant='outline'
                    color='orange'
                    onClick={() => setShowRestartConfirmModal(true)}
                    disabled={
                      !getIsDeployed() ||
                      startLoading ||
                      stopLoading ||
                      restartLoading ||
                      rebuildLoading
                    }
                  >
                    {restartLoading ? (
                      <ReloadIcon className={styles.buttonSpinner} />
                    ) : (
                      <ReloadIcon />
                    )}
                    Reiniciar
                  </Button>
                </Flex>

                {/* Segunda linha: Reconstruir, Configurar Builder */}
                <Flex gap='3' className={styles.buttonRow} style={{ width: '100%' }}>
                  <Button
                    size='3'
                    variant='soft'
                    color='violet'
                    onClick={() => setShowRebuildConfirmModal(true)}
                    disabled={startLoading || stopLoading || restartLoading || rebuildLoading}
                  >
                    {rebuildLoading ? (
                      <ReloadIcon className={styles.buttonSpinner} />
                    ) : (
                      <RocketIcon />
                    )}
                    Reconstruir
                  </Button>

                  <Button
                    size='3'
                    variant='soft'
                    color='blue'
                    onClick={openBuilderModal}
                    disabled={
                      startLoading ||
                      stopLoading ||
                      restartLoading ||
                      rebuildLoading ||
                      builderConfigLoading
                    }
                  >
                    <GearIcon />
                    Configurar Builder
                  </Button>
                </Flex>
              </Flex>
            </Flex>

            {/* Tabs */}
            <Tabs.Root value={currentTab} onValueChange={setCurrentTab} className={styles.tabsRoot}>
              <Tabs.List className={styles.tabsList}>
                <Tabs.Trigger value='overview' className={styles.tabsTrigger}>
                  Visão Geral
                </Tabs.Trigger>
                <Tabs.Trigger value='services' className={styles.tabsTrigger}>
                  Serviços
                </Tabs.Trigger>
                <Tabs.Trigger value='network' className={styles.tabsTrigger}>
                  Rede
                </Tabs.Trigger>
                <Tabs.Trigger value='logs' className={styles.tabsTrigger}>
                  Logs
                </Tabs.Trigger>
                <Tabs.Trigger value='shell' className={styles.tabsTrigger}>
                  Shell
                </Tabs.Trigger>
                <Tabs.Trigger value='variables' className={styles.tabsTrigger}>
                  Variáveis
                </Tabs.Trigger>
                <Tabs.Trigger value='files' className={styles.tabsTrigger}>
                  Arquivos
                </Tabs.Trigger>
                <Tabs.Trigger value='security' className={styles.tabsTrigger}>
                  Segurança
                </Tabs.Trigger>
              </Tabs.List>

              {/* Overview Tab */}
              <Tabs.Content value='overview' className={styles.tabsContent}>
                {appInfo && (
                  <Box>
                    <Heading size='5' style={{ marginBottom: '20px' }}>
                      Informações do Aplicativo
                    </Heading>

                    {appInfo.info_origin === 'inspect'
                      ? (() => {
                          const containers = appInfo.data as AppContainer[];
                          const container = containers[0];

                          return (
                            <Flex direction='column' gap='4'>
                              <Box
                                style={{
                                  borderBottom: '1px solid var(--gray-6)',
                                  paddingBottom: '8px',
                                }}
                              >
                                <Flex
                                  direction={{ initial: 'column', sm: 'row' }}
                                  justify={{ sm: 'between' }}
                                  align={{ sm: 'center' }}
                                  gap='1'
                                >
                                  <Text
                                    size='3'
                                    weight='medium'
                                    style={{ color: 'var(--gray-11)' }}
                                  >
                                    Container ID
                                  </Text>
                                  <Text
                                    size='3'
                                    style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
                                  >
                                    {container?.Id?.substring(0, 12)}
                                  </Text>
                                </Flex>
                              </Box>

                              <Box
                                style={{
                                  borderBottom: '1px solid var(--gray-6)',
                                  paddingBottom: '8px',
                                }}
                              >
                                <Flex
                                  direction={{ initial: 'column', sm: 'row' }}
                                  justify={{ sm: 'between' }}
                                  align={{ sm: 'center' }}
                                  gap='1'
                                >
                                  <Text
                                    size='3'
                                    weight='medium'
                                    style={{ color: 'var(--gray-11)' }}
                                  >
                                    Imagem
                                  </Text>
                                  <Text
                                    size='3'
                                    style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
                                  >
                                    {container?.Config?.Image}
                                  </Text>
                                </Flex>
                              </Box>

                              <Box
                                style={{
                                  borderBottom: '1px solid var(--gray-6)',
                                  paddingBottom: '8px',
                                }}
                              >
                                <Flex
                                  direction={{ initial: 'column', sm: 'row' }}
                                  justify={{ sm: 'between' }}
                                  align={{ sm: 'center' }}
                                  gap='1'
                                >
                                  <Text
                                    size='3'
                                    weight='medium'
                                    style={{ color: 'var(--gray-11)' }}
                                  >
                                    Status
                                  </Text>
                                  <Text size='3' style={{ color: 'var(--gray-12)' }}>
                                    {container?.State?.Status}
                                  </Text>
                                </Flex>
                              </Box>

                              <Box
                                style={{
                                  borderBottom: '1px solid var(--gray-6)',
                                  paddingBottom: '8px',
                                }}
                              >
                                <Flex
                                  direction={{ initial: 'column', sm: 'row' }}
                                  justify={{ sm: 'between' }}
                                  align={{ sm: 'center' }}
                                  gap='1'
                                >
                                  <Text
                                    size='3'
                                    weight='medium'
                                    style={{ color: 'var(--gray-11)' }}
                                  >
                                    IP Address
                                  </Text>
                                  <Text
                                    size='3'
                                    style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
                                  >
                                    {container?.NetworkSettings?.Networks?.bridge?.IPAddress ||
                                      'N/A'}
                                  </Text>
                                </Flex>
                              </Box>

                              <Box
                                style={{
                                  borderBottom: '1px solid var(--gray-6)',
                                  paddingBottom: '8px',
                                }}
                              >
                                <Flex
                                  direction={{ initial: 'column', sm: 'row' }}
                                  justify={{ sm: 'between' }}
                                  align={{ sm: 'center' }}
                                  gap='1'
                                >
                                  <Text
                                    size='3'
                                    weight='medium'
                                    style={{ color: 'var(--gray-11)' }}
                                  >
                                    Gateway
                                  </Text>
                                  <Text
                                    size='3'
                                    style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
                                  >
                                    {container?.NetworkSettings?.Networks?.bridge?.Gateway || 'N/A'}
                                  </Text>
                                </Flex>
                              </Box>

                              <Box
                                style={{
                                  borderBottom: '1px solid var(--gray-6)',
                                  paddingBottom: '8px',
                                }}
                              >
                                <Flex
                                  direction={{ initial: 'column', sm: 'row' }}
                                  justify={{ sm: 'between' }}
                                  align={{ sm: 'center' }}
                                  gap='1'
                                >
                                  <Text
                                    size='3'
                                    weight='medium'
                                    style={{ color: 'var(--gray-11)' }}
                                  >
                                    MAC Address
                                  </Text>
                                  <Text
                                    size='3'
                                    style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
                                  >
                                    {container?.NetworkSettings?.Networks?.bridge?.MacAddress ||
                                      'N/A'}
                                  </Text>
                                </Flex>
                              </Box>

                              <Box
                                style={{
                                  borderBottom: '1px solid var(--gray-6)',
                                  paddingBottom: '8px',
                                }}
                              >
                                <Flex
                                  direction={{ initial: 'column', sm: 'row' }}
                                  justify={{ sm: 'between' }}
                                  align={{ sm: 'center' }}
                                  gap='1'
                                >
                                  <Text
                                    size='3'
                                    weight='medium'
                                    style={{ color: 'var(--gray-11)' }}
                                  >
                                    Iniciado em
                                  </Text>
                                  <Text size='3' style={{ color: 'var(--gray-12)' }}>
                                    {container?.State?.StartedAt
                                      ? formatDate(container.State.StartedAt)
                                      : 'N/A'}
                                  </Text>
                                </Flex>
                              </Box>

                              <Box
                                style={{
                                  borderBottom: '1px solid var(--gray-6)',
                                  paddingBottom: '8px',
                                }}
                              >
                                <Flex
                                  direction={{ initial: 'column', sm: 'row' }}
                                  justify={{ sm: 'between' }}
                                  align={{ sm: 'center' }}
                                  gap='1'
                                >
                                  <Text
                                    size='3'
                                    weight='medium'
                                    style={{ color: 'var(--gray-11)' }}
                                  >
                                    PID
                                  </Text>
                                  <Text
                                    size='3'
                                    style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
                                  >
                                    {container?.State?.Pid || 'N/A'}
                                  </Text>
                                </Flex>
                              </Box>

                              <Box
                                style={{
                                  borderBottom: '1px solid var(--gray-6)',
                                  paddingBottom: '8px',
                                }}
                              >
                                <Flex
                                  direction={{ initial: 'column', sm: 'row' }}
                                  justify={{ sm: 'between' }}
                                  align={{ sm: 'center' }}
                                  gap='1'
                                >
                                  <Text
                                    size='3'
                                    weight='medium'
                                    style={{ color: 'var(--gray-11)' }}
                                  >
                                    Hostname
                                  </Text>
                                  <Text
                                    size='3'
                                    style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
                                  >
                                    {container?.Config?.Hostname}
                                  </Text>
                                </Flex>
                              </Box>

                              <Box
                                style={{
                                  borderBottom: '1px solid var(--gray-6)',
                                  paddingBottom: '8px',
                                }}
                              >
                                <Flex
                                  direction={{ initial: 'column', sm: 'row' }}
                                  justify={{ sm: 'between' }}
                                  align={{ sm: 'center' }}
                                  gap='1'
                                >
                                  <Text
                                    size='3'
                                    weight='medium'
                                    style={{ color: 'var(--gray-11)' }}
                                  >
                                    Criado em
                                  </Text>
                                  <Text size='3' style={{ color: 'var(--gray-12)' }}>
                                    {container?.Created ? formatDate(container.Created) : 'N/A'}
                                  </Text>
                                </Flex>
                              </Box>

                              {/* Deploy Information */}
                              {deployInfo && (
                                <>
                                  <Box
                                    style={{
                                      borderBottom: '1px solid var(--gray-6)',
                                      paddingBottom: '8px',
                                    }}
                                  >
                                    <Flex
                                      direction={{ initial: 'column', sm: 'row' }}
                                      justify={{ sm: 'between' }}
                                      align={{ sm: 'center' }}
                                      gap='1'
                                    >
                                      <Text
                                        size='3'
                                        weight='medium'
                                        style={{ color: 'var(--gray-11)' }}
                                      >
                                        Git Branch
                                      </Text>
                                      <Text
                                        size='3'
                                        style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
                                      >
                                        {deployInfo['Git deploy branch'] || 'N/A'}
                                      </Text>
                                    </Flex>
                                  </Box>

                                  <Box
                                    style={{
                                      borderBottom: '1px solid var(--gray-6)',
                                      paddingBottom: '8px',
                                    }}
                                  >
                                    <Flex
                                      direction={{ initial: 'column', sm: 'row' }}
                                      justify={{ sm: 'between' }}
                                      align={{ sm: 'center' }}
                                      gap='1'
                                    >
                                      <Text
                                        size='3'
                                        weight='medium'
                                        style={{ color: 'var(--gray-11)' }}
                                      >
                                        Git SHA
                                      </Text>
                                      <Text
                                        size='3'
                                        style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
                                      >
                                        {deployInfo['Git sha'] || 'N/A'}
                                      </Text>
                                    </Flex>
                                  </Box>

                                  <Box
                                    style={{
                                      borderBottom: '1px solid var(--gray-6)',
                                      paddingBottom: '8px',
                                    }}
                                  >
                                    <Flex
                                      direction={{ initial: 'column', sm: 'row' }}
                                      justify={{ sm: 'between' }}
                                      align={{ sm: 'center' }}
                                      gap='1'
                                    >
                                      <Text
                                        size='3'
                                        weight='medium'
                                        style={{ color: 'var(--gray-11)' }}
                                      >
                                        Último Deploy
                                      </Text>
                                      <Text size='3' style={{ color: 'var(--gray-12)' }}>
                                        {deployInfo['Git last updated at']
                                          ? formatTimestamp(deployInfo['Git last updated at'])
                                          : 'N/A'}
                                      </Text>
                                    </Flex>
                                  </Box>
                                </>
                              )}

                              {/* Builder Information */}
                              {builderInfo && (
                                <>
                                  <Box
                                    style={{
                                      borderBottom: '1px solid var(--gray-6)',
                                      paddingBottom: '8px',
                                    }}
                                  >
                                    <Flex
                                      direction={{ initial: 'column', sm: 'row' }}
                                      justify={{ sm: 'between' }}
                                      align={{ sm: 'center' }}
                                      gap='1'
                                    >
                                      <Text
                                        size='3'
                                        weight='medium'
                                        style={{ color: 'var(--gray-11)' }}
                                      >
                                        Builder
                                      </Text>
                                      <Text
                                        size='3'
                                        style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
                                      >
                                        {builderInfo.builder_computed_selected || 'Padrão'}
                                      </Text>
                                    </Flex>
                                  </Box>

                                  {builderInfo.builder_computed_build_dir && (
                                    <Box
                                      style={{
                                        borderBottom: '1px solid var(--gray-6)',
                                        paddingBottom: '8px',
                                      }}
                                    >
                                      <Flex
                                        direction={{ initial: 'column', sm: 'row' }}
                                        justify={{ sm: 'between' }}
                                        align={{ sm: 'center' }}
                                        gap='1'
                                      >
                                        <Text
                                          size='3'
                                          weight='medium'
                                          style={{ color: 'var(--gray-11)' }}
                                        >
                                          Build Directory
                                        </Text>
                                        <Text
                                          size='3'
                                          style={{
                                            fontFamily: 'monospace',
                                            color: 'var(--gray-12)',
                                          }}
                                        >
                                          {builderInfo.builder_computed_build_dir}
                                        </Text>
                                      </Flex>
                                    </Box>
                                  )}

                                  {builderInfo.builder_selected &&
                                    builderInfo.builder_selected !==
                                      builderInfo.builder_computed_selected && (
                                      <Box
                                        style={{
                                          borderBottom: '1px solid var(--gray-6)',
                                          paddingBottom: '8px',
                                        }}
                                      >
                                        <Flex
                                          direction={{ initial: 'column', sm: 'row' }}
                                          justify={{ sm: 'between' }}
                                          align={{ sm: 'center' }}
                                          gap='1'
                                        >
                                          <Text
                                            size='3'
                                            weight='medium'
                                            style={{ color: 'var(--gray-11)' }}
                                          >
                                            Builder Configurado
                                          </Text>
                                          <Text
                                            size='3'
                                            style={{
                                              fontFamily: 'monospace',
                                              color: 'var(--gray-12)',
                                            }}
                                          >
                                            {builderInfo.builder_selected}
                                          </Text>
                                        </Flex>
                                      </Box>
                                    )}
                                </>
                              )}
                            </Flex>
                          );
                        })()
                      : (() => {
                          const reportData = appInfo.data as AppReportData;

                          return (
                            <Flex direction='column' gap='4'>
                              <Flex
                                justify='between'
                                align='center'
                                style={{
                                  borderBottom: '1px solid var(--gray-6)',
                                  paddingBottom: '8px',
                                }}
                              >
                                <Text size='3' weight='medium' style={{ color: 'var(--gray-11)' }}>
                                  Implantado
                                </Text>
                                <Text size='3' style={{ color: 'var(--gray-12)' }}>
                                  {reportData.deployed === 'true' ? 'Sim' : 'Não'}
                                </Text>
                              </Flex>

                              <Flex
                                justify='between'
                                align='center'
                                style={{
                                  borderBottom: '1px solid var(--gray-6)',
                                  paddingBottom: '8px',
                                }}
                              >
                                <Text size='3' weight='medium' style={{ color: 'var(--gray-11)' }}>
                                  Processos
                                </Text>
                                <Text size='3' style={{ color: 'var(--gray-12)' }}>
                                  {reportData.processes}
                                </Text>
                              </Flex>

                              <Flex
                                justify='between'
                                align='center'
                                style={{
                                  borderBottom: '1px solid var(--gray-6)',
                                  paddingBottom: '8px',
                                }}
                              >
                                <Text size='3' weight='medium' style={{ color: 'var(--gray-11)' }}>
                                  Em execução
                                </Text>
                                <Text size='3' style={{ color: 'var(--gray-12)' }}>
                                  {reportData.running === 'true' ? 'Sim' : 'Não'}
                                </Text>
                              </Flex>

                              <Flex
                                justify='between'
                                align='center'
                                style={{
                                  borderBottom: '1px solid var(--gray-6)',
                                  paddingBottom: '8px',
                                }}
                              >
                                <Text size='3' weight='medium' style={{ color: 'var(--gray-11)' }}>
                                  Política de Restart
                                </Text>
                                <Text size='3' style={{ color: 'var(--gray-12)' }}>
                                  {reportData.ps_restart_policy}
                                </Text>
                              </Flex>

                              <Flex
                                justify='between'
                                align='center'
                                style={{
                                  borderBottom: '1px solid var(--gray-6)',
                                  paddingBottom: '8px',
                                }}
                              >
                                <Text size='3' weight='medium' style={{ color: 'var(--gray-11)' }}>
                                  Pode Escalar
                                </Text>
                                <Text size='3' style={{ color: 'var(--gray-12)' }}>
                                  {reportData.ps_can_scale === 'true' ? 'Sim' : 'Não'}
                                </Text>
                              </Flex>

                              <Flex
                                justify='between'
                                align='center'
                                style={{
                                  borderBottom: '1px solid var(--gray-6)',
                                  paddingBottom: '8px',
                                }}
                              >
                                <Text size='3' weight='medium' style={{ color: 'var(--gray-11)' }}>
                                  Procfile Path
                                </Text>
                                <Text
                                  size='3'
                                  style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
                                >
                                  {reportData.ps_procfile_path || 'N/A'}
                                </Text>
                              </Flex>

                              {/* Deploy Information */}
                              {deployInfo && (
                                <>
                                  <Flex
                                    justify='between'
                                    align='center'
                                    style={{
                                      borderBottom: '1px solid var(--gray-6)',
                                      paddingBottom: '8px',
                                    }}
                                  >
                                    <Text
                                      size='3'
                                      weight='medium'
                                      style={{ color: 'var(--gray-11)' }}
                                    >
                                      Git Branch
                                    </Text>
                                    <Text
                                      size='3'
                                      style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
                                    >
                                      {deployInfo['Git deploy branch'] || 'N/A'}
                                    </Text>
                                  </Flex>

                                  <Flex
                                    justify='between'
                                    align='center'
                                    style={{
                                      borderBottom: '1px solid var(--gray-6)',
                                      paddingBottom: '8px',
                                    }}
                                  >
                                    <Text
                                      size='3'
                                      weight='medium'
                                      style={{ color: 'var(--gray-11)' }}
                                    >
                                      Git SHA
                                    </Text>
                                    <Text
                                      size='3'
                                      style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
                                    >
                                      {deployInfo['Git sha'] || 'N/A'}
                                    </Text>
                                  </Flex>

                                  <Flex
                                    justify='between'
                                    align='center'
                                    style={{
                                      borderBottom: '1px solid var(--gray-6)',
                                      paddingBottom: '8px',
                                    }}
                                  >
                                    <Text
                                      size='3'
                                      weight='medium'
                                      style={{ color: 'var(--gray-11)' }}
                                    >
                                      Último Deploy
                                    </Text>
                                    <Text size='3' style={{ color: 'var(--gray-12)' }}>
                                      {deployInfo['Git last updated at']
                                        ? formatTimestamp(deployInfo['Git last updated at'])
                                        : 'N/A'}
                                    </Text>
                                  </Flex>
                                </>
                              )}

                              {/* Builder Information */}
                              {builderInfo && (
                                <>
                                  <Flex
                                    justify='between'
                                    align='center'
                                    style={{
                                      borderBottom: '1px solid var(--gray-6)',
                                      paddingBottom: '8px',
                                    }}
                                  >
                                    <Text
                                      size='3'
                                      weight='medium'
                                      style={{ color: 'var(--gray-11)' }}
                                    >
                                      Builder
                                    </Text>
                                    <Text
                                      size='3'
                                      style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
                                    >
                                      {builderInfo.builder_computed_selected || 'Padrão'}
                                    </Text>
                                  </Flex>

                                  {builderInfo.builder_computed_build_dir && (
                                    <Flex
                                      justify='between'
                                      align='center'
                                      style={{
                                        borderBottom: '1px solid var(--gray-6)',
                                        paddingBottom: '8px',
                                      }}
                                    >
                                      <Text
                                        size='3'
                                        weight='medium'
                                        style={{ color: 'var(--gray-11)' }}
                                      >
                                        Build Directory
                                      </Text>
                                      <Text
                                        size='3'
                                        style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
                                      >
                                        {builderInfo.builder_computed_build_dir}
                                      </Text>
                                    </Flex>
                                  )}

                                  {builderInfo.builder_selected &&
                                    builderInfo.builder_selected !==
                                      builderInfo.builder_computed_selected && (
                                      <Flex
                                        justify='between'
                                        align='center'
                                        style={{
                                          borderBottom: '1px solid var(--gray-6)',
                                          paddingBottom: '8px',
                                        }}
                                      >
                                        <Text
                                          size='3'
                                          weight='medium'
                                          style={{ color: 'var(--gray-11)' }}
                                        >
                                          Builder Configurado
                                        </Text>
                                        <Text
                                          size='3'
                                          style={{
                                            fontFamily: 'monospace',
                                            color: 'var(--gray-12)',
                                          }}
                                        >
                                          {builderInfo.builder_selected}
                                        </Text>
                                      </Flex>
                                    )}
                                </>
                              )}
                            </Flex>
                          );
                        })()}
                  </Box>
                )}
              </Tabs.Content>

              {/* Files Tab */}
              <Tabs.Content value='files' className={styles.tabsContent}>
                <Box>
                  <Flex
                    justify='between'
                    align='center'
                    className={styles.filesHeader}
                    style={{ marginBottom: '20px' }}
                  >
                    <Heading size='5' className={styles.filesHeaderTitle}>
                      Árvore de Diretórios
                    </Heading>
                    <Button
                      onClick={refreshDirectory}
                      disabled={dirLoading}
                      variant='outline'
                      className={styles.filesRefreshButton}
                    >
                      <ReloadIcon className={dirLoading ? styles.buttonSpinner : ''} />
                      {dirLoading ? 'Atualizando...' : 'Atualizar'}
                    </Button>
                  </Flex>
                  {!appInfo || appInfo.info_origin !== 'inspect' ? (
                    <Text size='3' style={{ color: 'var(--gray-11)' }}>
                      Árvore de diretórios indisponível no momento.
                    </Text>
                  ) : (
                    <Flex direction='column' gap='3'>
                      <Flex gap='3' align='center'>
                        <Button
                          variant='outline'
                          size='2'
                          color='purple'
                          className={styles.backButton}
                          onClick={navigateToParent}
                          disabled={dirLoading || isAtRoot()}
                        >
                          <svg
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          >
                            <path d='M19 12 H5 M12 19 L5 12 L12 5' />
                          </svg>
                        </Button>
                        {/* Clickable path segments (inline) */}
                        <Flex align='center' gap='2' style={{ flexWrap: 'wrap' }}>
                          <Text size='3' style={{ color: 'var(--gray-9)' }}>
                            /
                          </Text>
                          {(() => {
                            const wd = getWorkingDir();
                            const baseLabel = wd || '.';
                            const rel = currentDir.startsWith(wd)
                              ? currentDir.slice(wd.length)
                              : '';
                            const segments = rel.split('/').filter((s) => s.length > 0);
                            const crumbs = [baseLabel, ...segments];
                            const buildTargetPath = (index: number) => {
                              if (index === 0) return wd || '/';
                              const upTo = segments.slice(0, index).join('/');
                              return pathJoin(wd || '/', upTo);
                            };
                            return crumbs.map((seg, idx) => {
                              const targetPath = buildTargetPath(idx);
                              const displaySeg =
                                idx === 0 ? (wd || '').replace(/^\/+/, '') || '.' : seg;
                              return (
                                <Flex key={`path-inline-${seg}-${idx}`} align='center' gap='2'>
                                  {idx > 0 && (
                                    <Text size='3' style={{ color: 'var(--gray-9)' }}>
                                      /
                                    </Text>
                                  )}
                                  <Button
                                    variant='ghost'
                                    size='2'
                                    className={styles.fileLinkButton}
                                    onClick={() => setCurrentDir(targetPath)}
                                    style={{ padding: '0 6px' }}
                                  >
                                    {displaySeg}
                                  </Button>
                                </Flex>
                              );
                            });
                          })()}
                        </Flex>
                      </Flex>

                      {dirError && (
                        <Text size='3' color='red'>
                          {dirError}
                        </Text>
                      )}

                      {dirLoading ? (
                        <Box className={styles.loadingSpinner}>
                          <Box className={styles.spinner}></Box>
                          <Text style={{ marginLeft: '12px' }}>
                            Carregando informações do diretório...
                          </Text>
                        </Box>
                      ) : (
                        <Box
                          style={{
                            border: '1px solid var(--gray-6)',
                            borderRadius: '8px',
                            padding: '8px',
                          }}
                        >
                          <Flex direction='column' gap='2'>
                            {dirEntries.map((entry) => (
                              <Flex
                                key={`${currentDir}/${entry.name}`}
                                justify='between'
                                align='center'
                                style={{
                                  padding: '6px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: 'var(--gray-2)',
                                }}
                              >
                                <Flex align='center' gap='3' style={{ overflow: 'hidden' }}>
                                  {/* Icon */}
                                  {entry.name === '..' ? (
                                    <svg
                                      width='16'
                                      height='16'
                                      viewBox='0 0 24 24'
                                      fill='none'
                                      stroke='currentColor'
                                      strokeWidth='2'
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                    >
                                      <path d='M19 14l-7-7-7 7' />
                                    </svg>
                                  ) : entry.type === 'dir' ? (
                                    <svg
                                      width='16'
                                      height='16'
                                      viewBox='0 0 24 24'
                                      fill='none'
                                      stroke='currentColor'
                                      strokeWidth='2'
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                    >
                                      <path d='M3 7h5l2 2h11v9a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z' />
                                    </svg>
                                  ) : (
                                    <svg
                                      width='16'
                                      height='16'
                                      viewBox='0 0 24 24'
                                      fill='none'
                                      stroke='currentColor'
                                      strokeWidth='2'
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                    >
                                      <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                                      <path d='M14 2v6h6' />
                                    </svg>
                                  )}
                                  {/* Name */}
                                  {entry.type === 'dir' || entry.name === '..' ? (
                                    <Button
                                      variant='ghost'
                                      size='2'
                                      className={styles.fileLinkButton}
                                      onClick={() => handleEntryClick(entry)}
                                      style={{ padding: '0 8px' }}
                                    >
                                      {isTinyScreen && entry.name.length > 20
                                        ? `${entry.name.slice(0, 17)}...`
                                        : isSmallScreen && entry.name.length > 30
                                          ? `${entry.name.slice(0, 27)}...`
                                          : entry.name}
                                    </Button>
                                  ) : (
                                    <Text
                                      size='2'
                                      className={styles.fileName}
                                      style={{ color: 'var(--gray-12)' }}
                                    >
                                      {isTinyScreen && entry.name.length > 20
                                        ? `${entry.name.slice(0, 17)}...`
                                        : isSmallScreen && entry.name.length > 30
                                          ? `${entry.name.slice(0, 27)}...`
                                          : entry.name}
                                    </Text>
                                  )}
                                </Flex>
                                {/* Details */}
                                <Flex align='center' gap='3' style={{ flexShrink: 0 }}>
                                  <Text
                                    size='2'
                                    className={styles.ownerGroup}
                                    style={{ color: 'var(--gray-11)' }}
                                  >
                                    {entry.owner}:{entry.group}
                                  </Text>
                                  <Text size='2' style={{ color: 'var(--gray-11)' }}>
                                    <span className={styles.permissionsInfo}>
                                      {entry.permissions}
                                    </span>
                                  </Text>
                                  <Text
                                    size='2'
                                    className={styles.fileSize}
                                    style={{
                                      color: 'var(--gray-11)',
                                      minWidth: '80px',
                                      textAlign: 'right',
                                    }}
                                  >
                                    {formatSize(entry.size)}
                                  </Text>
                                  <Text
                                    size='2'
                                    className={styles.dateInfo}
                                    style={{ color: 'var(--gray-11)' }}
                                  >
                                    {entry.date}
                                  </Text>
                                </Flex>
                              </Flex>
                            ))}
                            {dirEntries.length === 0 && !dirError && (
                              <Text size='3' style={{ color: 'var(--gray-11)' }}>
                                Diretório vazio.
                              </Text>
                            )}
                          </Flex>
                        </Box>
                      )}
                    </Flex>
                  )}
                </Box>
              </Tabs.Content>

              {/* Services Tab */}
              <Tabs.Content value='services' className={styles.tabsContent}>
                <Flex direction='column' gap='4'>
                  <Heading size='5' style={{ color: 'var(--gray-12)' }}>
                    Serviços Conectados
                  </Heading>

                  {servicesLoading ? (
                    <Box className={styles.loadingSpinner}>
                      <Box className={styles.spinner}></Box>
                      <Text style={{ marginLeft: '12px' }}>Carregando serviços...</Text>
                    </Box>
                  ) : errors.services ? (
                    <Card
                      style={{
                        border: '1px solid var(--red-6)',
                        backgroundColor: 'var(--red-2)',
                        padding: '20px',
                      }}
                    >
                      <Text style={{ color: 'var(--red-11)' }}>{errors.services}</Text>
                    </Card>
                  ) : (
                    <Box>
                      {Object.keys(databases).length === 0 ? (
                        <Card
                          style={{
                            border: '1px solid var(--gray-6)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                            padding: '40px',
                            textAlign: 'center',
                          }}
                        >
                          <Text size='3' color='gray'>
                            Nenhum serviço conectado a este aplicativo.
                          </Text>
                        </Card>
                      ) : (
                        <Flex direction='column' gap='4'>
                          {Object.entries(databases).map(([dbType, dbList]) =>
                            dbList.map((dbName) => {
                              const displayName = formatServiceName(dbName);
                              const serviceType = formatDatabaseType(dbType);

                              return (
                                <Card
                                  key={dbName}
                                  style={{
                                    border: '1px solid var(--gray-6)',
                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer',
                                    padding: '20px',
                                  }}
                                  onClick={() =>
                                    router.push(`/services/s/${dbType}/${displayName}`)
                                  }
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow =
                                      '0 8px 24px rgba(0, 0, 0, 0.12)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow =
                                      '0 4px 16px rgba(0, 0, 0, 0.08)';
                                  }}
                                >
                                  <Flex align='center' gap='4' style={{ width: '100%' }}>
                                    {/* Service Icon */}
                                    <Box style={{ flexShrink: 0 }}>
                                      <Image
                                        src={getServiceImage(dbType)}
                                        alt={`${serviceType} logo`}
                                        width={48}
                                        height={48}
                                        style={{ borderRadius: '8px' }}
                                        onError={(e) => {
                                          e.currentTarget.src =
                                            '/images/database-logos/generic.svg';
                                        }}
                                      />
                                    </Box>

                                    {/* Service Info */}
                                    <Flex direction='column' gap='1' style={{ flex: 1 }}>
                                      <Heading
                                        size='4'
                                        weight='medium'
                                        style={{ color: 'var(--gray-12)' }}
                                      >
                                        {displayName}
                                      </Heading>
                                      <Text size='2' style={{ color: 'var(--gray-9)' }}>
                                        {serviceType}
                                      </Text>
                                      <Flex align='center' gap='2' style={{ marginTop: '4px' }}>
                                        <Box
                                          style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: 'var(--green-9)',
                                          }}
                                        />
                                        <Text
                                          size='2'
                                          weight='medium'
                                          style={{ color: 'var(--gray-11)' }}
                                        >
                                          Vinculado
                                        </Text>
                                      </Flex>
                                    </Flex>

                                    {/* Arrow Icon */}
                                    <Box
                                      style={{
                                        flexShrink: 0,
                                        color: 'var(--gray-9)',
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      →
                                    </Box>
                                  </Flex>
                                </Card>
                              );
                            })
                          )}
                        </Flex>
                      )}
                    </Box>
                  )}
                </Flex>
              </Tabs.Content>

              {/* Network Tab */}
              <Tabs.Content value='network' className={styles.tabsContent}>
                <Flex direction='column' gap='4'>
                  <Heading size='5' style={{ color: 'var(--gray-12)' }}>
                    Rede
                  </Heading>

                  {networkLoading ? (
                    <Box className={styles.loadingSpinner}>
                      <Box className={styles.spinner}></Box>
                      <Text style={{ marginLeft: '12px' }}>Obtendo dados de rede...</Text>
                    </Box>
                  ) : errors.network ? (
                    <Card
                      style={{
                        border: '1px solid var(--red-6)',
                        backgroundColor: 'var(--red-2)',
                        padding: '10px',
                      }}
                    >
                      <Text style={{ color: 'var(--red-11)' }}>{errors.network}</Text>
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
                              background:
                                'linear-gradient(135deg, var(--green-3) 0%, var(--blue-3) 100%)',
                              border: '1px solid var(--green-6)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <GlobeIcon
                              width='48'
                              height='48'
                              style={{ color: 'var(--green-11)' }}
                            />
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
                                  backgroundColor: networkData.network
                                    ? 'var(--green-9)'
                                    : 'var(--blue-9)',
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
                          <Select.Root value={protocol} onValueChange={setProtocol}>
                            <Select.Trigger style={{ width: '100px' }} />
                            <Select.Content>
                              <Select.Item value='http'>HTTP</Select.Item>
                              <Select.Item value='https'>HTTPS</Select.Item>
                              <Select.Item value='tcp'>TCP</Select.Item>
                              <Select.Item value='udp'>UDP</Select.Item>
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
                              onChange={(e) => setOriginPort(e.target.value)}
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
                              onChange={(e) => setDestPort(e.target.value)}
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
                              background:
                                'linear-gradient(135deg, var(--green-9) 0%, var(--green-10) 100%)',
                              border: 'none',
                              color: 'white',
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
                            <Text style={{ marginLeft: '12px' }}>
                              Carregando mapeamentos de porta...
                            </Text>
                          </Box>
                        ) : errors.portMappings ? (
                          <Card
                            style={{
                              border: '1px solid var(--red-6)',
                              backgroundColor: 'var(--red-2)',
                              padding: '20px',
                            }}
                          >
                            <Text style={{ color: 'var(--red-11)' }}>{errors.portMappings}</Text>
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
                                  {mapping.protocol.toUpperCase()}: {mapping.origin} →{' '}
                                  {mapping.dest}
                                </Text>
                              </Box>
                              <Button
                                size='2'
                                color='red'
                                variant='ghost'
                                onClick={() => openDeletePortModal(mapping)}
                                disabled={
                                  deletingPort ===
                                  `${mapping.protocol}-${mapping.origin}-${mapping.dest}`
                                }
                              >
                                {deletingPort ===
                                `${mapping.protocol}-${mapping.origin}-${mapping.dest}` ? (
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
              </Tabs.Content>

              {/* Logs Tab */}
              <Tabs.Content value='logs' className={styles.tabsContent}>
                {/* Desktop Layout - Inline (> 720px) */}
                <Flex
                  justify='between'
                  align='center'
                  className={styles.logsHeader}
                  style={{
                    marginBottom: '16px',
                  }}
                >
                  <Flex align='center' gap='3'>
                    <Heading size='5'>Logs do Aplicativo</Heading>
                    <Flex align='center' gap='2'>
                      <Text size='2' style={{ color: 'var(--gray-11)' }}>
                        Linhas:
                      </Text>
                      <Select.Root
                        value={logLinesLimit.toString()}
                        onValueChange={(value) => setLogLinesLimit(Number(value))}
                      >
                        <Select.Trigger style={{ minWidth: '70px' }} />
                        <Select.Content>
                          <Select.Item value='500'>500</Select.Item>
                          <Select.Item value='1000'>1000</Select.Item>
                          <Select.Item value='2000'>2000</Select.Item>
                          <Select.Item value='5000'>5000</Select.Item>
                          <Select.Item value='7000'>7000</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </Flex>
                  </Flex>
                  <Flex gap='2' align='center' className={styles.logsButtons}>
                    {/* Refresh Button */}
                    <Button onClick={refreshLogs} disabled={logsLoading} variant='outline'>
                      <ReloadIcon className={logsLoading ? styles.buttonSpinner : ''} />
                      {logsLoading ? 'Atualizando...' : 'Atualizar'}
                    </Button>

                    {/* Download Button - only show when logs are loaded */}
                    {!logsLoading && !errors.logs && logs && (
                      <Button
                        onClick={downloadLogs}
                        style={{
                          background:
                            'linear-gradient(135deg, var(--green-9) 0%, var(--green-10) 100%)',
                          border: 'none',
                          color: 'white',
                        }}
                      >
                        <DownloadIcon />
                        Baixar arquivo de logs
                      </Button>
                    )}
                  </Flex>
                </Flex>

                {/* Mobile/Tablet Layout - Stacked (≤ 720px) */}
                <Box
                  style={{
                    marginBottom: '16px',
                  }}
                  className={styles.mobileLogsHeader}
                >
                  <Heading size='5' style={{ marginBottom: '12px' }}>
                    Logs do Aplicativo
                  </Heading>

                  <Flex direction='column' gap='3'>
                    <Flex align='center' gap='2'>
                      <Text size='2' style={{ color: 'var(--gray-11)' }}>
                        Linhas:
                      </Text>
                      <Select.Root
                        value={logLinesLimit.toString()}
                        onValueChange={(value) => setLogLinesLimit(Number(value))}
                      >
                        <Select.Trigger style={{ minWidth: '70px' }} />
                        <Select.Content>
                          <Select.Item value='500'>500</Select.Item>
                          <Select.Item value='1000'>1000</Select.Item>
                          <Select.Item value='2000'>2000</Select.Item>
                          <Select.Item value='5000'>5000</Select.Item>
                          <Select.Item value='7000'>7000</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </Flex>

                    <Flex gap='2' align='center' direction='column' style={{ width: '100%' }}>
                      {/* Refresh Button */}
                      <Button
                        onClick={refreshLogs}
                        disabled={logsLoading}
                        variant='outline'
                        style={{ width: '100%' }}
                      >
                        <ReloadIcon className={logsLoading ? styles.buttonSpinner : ''} />
                        {logsLoading ? 'Atualizando...' : 'Atualizar'}
                      </Button>

                      {/* Download Button - only show when logs are loaded */}
                      {!logsLoading && !errors.logs && logs && (
                        <Button
                          onClick={downloadLogs}
                          style={{
                            background:
                              'linear-gradient(135deg, var(--green-9) 0%, var(--green-10) 100%)',
                            border: 'none',
                            color: 'white',
                            width: '100%',
                          }}
                        >
                          <DownloadIcon />
                          Baixar arquivo de logs
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                </Box>

                {logsLoading ? (
                  <Box className={styles.loadingSpinner}>
                    <Box className={styles.spinner}></Box>
                    <Text style={{ marginLeft: '12px' }}>Carregando logs...</Text>
                  </Box>
                ) : errors.logs ? (
                  <Box className={styles.errorMessage}>
                    <Text>{errors.logs}</Text>
                  </Box>
                ) : (
                  <Box className={styles.logsContainer}>
                    {logs ? processAnsiCodes(logs) : 'Nenhum log disponível.'}
                  </Box>
                )}
              </Tabs.Content>

              {/* Shell Tab */}
              <Tabs.Content value='shell' className={styles.tabsContent}>
                <Flex align='center' justify='between' style={{ marginBottom: '12px' }}>
                  <Heading size='5' style={{ color: 'var(--gray-12)' }}>
                    Shell
                  </Heading>
                  {terminalBusy && (
                    <ReloadIcon
                      className={styles.buttonSpinner}
                      style={{ color: 'var(--gray-10)' }}
                    />
                  )}
                </Flex>
                <Box
                  onClick={() => {
                    try {
                      const sel =
                        typeof window !== 'undefined' && window.getSelection
                          ? window.getSelection()
                          : null;
                      const hasSelection = !!sel && sel.toString().length > 0;
                      if (!hasSelection) terminalInputRef.current?.focus();
                    } catch {
                      terminalInputRef.current?.focus();
                    }
                  }}
                  style={{
                    background: '#0B1220',
                    color: '#E5E7EB',
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    fontSize: '12.5px',
                    lineHeight: 1.5,
                    border: '1px solid var(--gray-6)',
                    borderRadius: 6,
                    padding: '16px',
                    minHeight: '240px',
                    maxHeight: '420px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    cursor: 'text',
                  }}
                >
                  {terminalOutputs.length === 0 ? (
                    <div style={{ color: 'var(--gray-11)' }}>
                      Digite um comando e pressione Enter.
                    </div>
                  ) : (
                    terminalOutputs.map((line, idx) => {
                      const promptPrefix = `${getPrompt()} `;
                      if (line.startsWith(promptPrefix)) {
                        const cmdText = line.slice(promptPrefix.length);
                        return (
                          <div key={idx} style={{ marginBottom: 6 }}>
                            <span style={{ color: '#93C5FD', marginRight: 8 }}>{getPrompt()}</span>
                            <span>{cmdText}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={idx} style={{ marginBottom: 6 }}>
                          {line}
                        </div>
                      );
                    })
                  )}
                  {/* Active prompt line: only show when not executing */}
                  {!terminalBusy && (
                    <div>
                      {/* Label line for very small screens (<450px) */}
                      <div className={styles.terminalPromptLabel}>
                        <span style={{ color: '#93C5FD' }}>{getPromptLabel()}</span>
                      </div>

                      {/* Single input row: show full prompt on large screens, only % on small screens */}
                      <div className={styles.terminalPromptRow}>
                        <span className={styles.terminalPromptFull}>{getPrompt()}</span>
                        <span className={styles.terminalPromptSymbol}>%</span>
                        <input
                          ref={terminalInputRef}
                          type='text'
                          value={terminalInput}
                          onChange={(e) => setTerminalInput(e.target.value)}
                          onKeyDown={handleTerminalKeyDown}
                          style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: '#E5E7EB',
                            font: 'inherit',
                            padding: 0,
                            margin: 0,
                          }}
                          placeholder=''
                        />
                      </div>
                    </div>
                  )}
                  <div ref={terminalEndRef} />
                </Box>
              </Tabs.Content>

              {/* Variables Tab */}
              <Tabs.Content value='variables' className={styles.tabsContent}>
                <Flex
                  justify='between'
                  align='center'
                  className={styles.envHeader}
                  style={{ marginBottom: '20px' }}
                >
                  <Heading size='5'>Variáveis de Ambiente</Heading>
                  <Flex align='center' gap='2' className={styles.envActions}>
                    <Button
                      className={styles.envExportButton}
                      variant='outline'
                      onClick={() => document.getElementById('env-file-upload')?.click()}
                      disabled={envImportLoading}
                      title='Importar variáveis de um arquivo (.env, .json, .yml)'
                    >
                      <UploadIcon />
                      Importar
                    </Button>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger className={styles.envExportTrigger}>
                        <Button
                          className={`${styles.envExportButton} ${styles.envExportButtonOrange}`}
                          variant='outline'
                          disabled={configLoading}
                          title='Exportar variáveis de ambiente'
                        >
                          <DownloadIcon />
                          Exportar
                          <ChevronDownIcon />
                        </Button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content>
                        <DropdownMenu.Label>Exportar como:</DropdownMenu.Label>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item onClick={exportEnvAsENV}>.ENV</DropdownMenu.Item>
                        <DropdownMenu.Item onClick={exportEnvAsJSON}>.JSON</DropdownMenu.Item>
                        <DropdownMenu.Item onClick={exportEnvAsYML}>.YML</DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  </Flex>
                </Flex>

                {configLoading ? (
                  <Box className={styles.loadingSpinner}>
                    <Box className={styles.spinner}></Box>
                    <Text style={{ marginLeft: '12px' }}>Carregando variáveis...</Text>
                  </Box>
                ) : errors.config ? (
                  <Box className={styles.errorMessage}>
                    <Text>{errors.config}</Text>
                  </Box>
                ) : (
                  <Box>
                    {/* Add Environment Variable Form */}
                    <Box className={styles.envVarForm}>
                      <Box style={{ flex: 1 }}>
                        <Text size='2' style={{ marginBottom: '4px' }}>
                          Chave
                        </Text>
                        <TextField.Root
                          placeholder='NOME_VARIAVEL'
                          value={newEnvKey}
                          onChange={(e) => setNewEnvKey(e.target.value.replace(/\s/g, ''))}
                          disabled={envSubmitting}
                        />
                      </Box>

                      <Box style={{ flex: 1 }}>
                        <Text size='2' style={{ marginBottom: '4px' }}>
                          Valor
                        </Text>
                        <TextField.Root
                          placeholder='valor_da_variavel'
                          value={newEnvValue}
                          onChange={(e) => setNewEnvValue(e.target.value)}
                          disabled={envSubmitting}
                        />
                      </Box>

                      <Box>
                        <div style={{ marginBottom: '20px' }}></div>
                        <Button
                          className={styles.envVarButton}
                          onClick={addEnvironmentVariable}
                          disabled={!newEnvKey.trim() || !newEnvValue.trim() || envSubmitting}
                          style={{
                            background: 'var(--green-9)',
                            border: 'none',
                            color: 'white',
                          }}
                        >
                          <PlusIcon />
                          {envSubmitting ? 'Adicionando...' : 'Adicionar'}
                        </Button>
                      </Box>
                    </Box>

                    {/* Environment Variables List */}
                    <Box>
                      {Object.keys(config).length === 0 ? (
                        <Text color='gray'>Nenhuma variável de ambiente configurada.</Text>
                      ) : (
                        Object.entries(config).map(([key, value]) => (
                          <Card key={key} className={styles.envVarCard}>
                            <Flex
                              align='center'
                              className={styles.envVarContent}
                              style={{ flex: 1 }}
                            >
                              <Flex align='center' gap='2'>
                                <Text className={styles.envVarKey} style={{ marginRight: 0 }}>
                                  {key}
                                </Text>
                                <Button
                                  size='1'
                                  variant='ghost'
                                  style={{
                                    background: 'transparent',
                                    color: 'var(--gray-9)',
                                    border: 'none',
                                    boxShadow: 'none',
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => startEditEnvVar(key, String(value))}
                                  disabled={savingEnv && editingEnvKey === key}
                                  aria-label={`Editar variável ${key}`}
                                >
                                  <Pencil1Icon />
                                  <span className={styles.editText}>editar</span>
                                </Button>
                              </Flex>

                              {editingEnvKey === key ? (
                                <>
                                  <Flex
                                    align='center'
                                    gap='1'
                                    style={{ width: '100%', marginTop: '8px' }}
                                  >
                                    <Text size='2' color='gray'>
                                      =
                                    </Text>
                                    <TextField.Root
                                      value={editingEnvValue}
                                      onChange={(e) => setEditingEnvValue(e.target.value)}
                                      style={{ flex: 1 }}
                                      disabled={savingEnv}
                                    />
                                  </Flex>
                                  <Flex gap='2' style={{ marginTop: '10px' }}>
                                    <Button
                                      variant='soft'
                                      color='gray'
                                      onClick={cancelEditEnvVar}
                                      disabled={savingEnv}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button
                                      onClick={saveEditedEnvironmentVariable}
                                      disabled={!editingEnvValue.trim() || savingEnv}
                                      style={{
                                        background: 'var(--green-9)',
                                        border: 'none',
                                        color: 'white',
                                      }}
                                    >
                                      {savingEnv ? (
                                        <ReloadIcon className={styles.buttonSpinner} />
                                      ) : (
                                        'Salvar'
                                      )}
                                    </Button>
                                  </Flex>
                                </>
                              ) : (
                                <Flex align='center' gap='1'>
                                  <Text size='2' color='gray'>
                                    =
                                  </Text>
                                  <Text className={styles.envVarValue}>{value}</Text>
                                </Flex>
                              )}
                            </Flex>
                            <Button
                              size='2'
                              color='red'
                              variant='ghost'
                              onClick={() => openDeleteEnvModal(key)}
                              disabled={deletingEnv === key}
                            >
                              {deletingEnv === key ? (
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
              </Tabs.Content>

              {/* Security Tab */}
              <Tabs.Content value='security' className={styles.tabsContent}>
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
                        placeholder={
                          deploymentToken ? 'Token de deployment' : 'Carregando token...'
                        }
                      />
                      <Button
                        size='2'
                        variant='soft'
                        onClick={() => setShowDeploymentToken(!showDeploymentToken)}
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
                            // Cadeado aberto (destrancado)
                            <path
                              d='M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8M6 10H18M6 10V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V10'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                          ) : (
                            // Cadeado fechado (trancado)
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
                        onClick={copyDeploymentToken}
                        disabled={!deploymentToken}
                        style={{
                          minWidth: '70px',
                          background: 'var(--purple-9)',
                          border: 'none',
                          color: 'white',
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
                        <Text
                          size='3'
                          weight='bold'
                          style={{ color: 'var(--gray-12)', display: 'block' }}
                        >
                          Deletar essa aplicação
                        </Text>
                        <Text size='2' style={{ color: 'var(--gray-11)', display: 'block' }}>
                          Uma vez que você exclui uma aplicação, não há como voltar atrás.
                        </Text>
                      </Flex>
                      <Button
                        className={styles.dangerRowButton}
                        size='2'
                        onClick={() => setShowDeleteAppModal(true)}
                        style={{
                          background: 'var(--gray-4)',
                          color: 'var(--red-9)',
                          border: '1px solid var(--gray-7)',
                        }}
                      >
                        <TrashIcon />
                        Deletar Aplicação
                      </Button>
                    </Flex>
                  </Card>
                </Box>
              </Tabs.Content>
            </Tabs.Root>
          </Flex>
        )}
      </main>

      {/* Deploy Modal */}
      <Dialog.Root open={deployModalOpen} onOpenChange={setDeployModalOpen}>
        <Dialog.Content style={{ maxWidth: '500px' }}>
          <Dialog.Title>Deploy via Repositório</Dialog.Title>
          <Dialog.Description>
            Insira a URL do repositório público e a branch para fazer o deploy.
          </Dialog.Description>

          {errors.deploy && (
            <Box
              style={{
                padding: '12px',
                background: 'var(--red-2)',
                border: '1px solid var(--red-6)',
                borderRadius: '6px',
                marginBottom: '16px',
              }}
            >
              <Text size='2' color='red'>
                {errors.deploy}
              </Text>
            </Box>
          )}

          <Flex direction='column' gap='4' style={{ marginTop: '20px' }}>
            <Box>
              <Text size='2' weight='medium' style={{ marginBottom: '8px' }}>
                URL do Repositório
              </Text>
              <TextField.Root
                placeholder='https://github.com/usuario/repositorio'
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                disabled={deployLoading}
              />
            </Box>

            <Box>
              <Text size='2' weight='medium' style={{ marginBottom: '8px' }}>
                Branch
              </Text>
              <TextField.Root
                placeholder='main'
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                disabled={deployLoading}
              />
            </Box>
          </Flex>

          <Flex gap='3' mt='6' justify='end'>
            <Dialog.Close>
              <Button variant='soft' color='gray' disabled={deployLoading}>
                Cancelar
              </Button>
            </Dialog.Close>
            <Button
              onClick={deployFromRepo}
              disabled={!repoUrl.trim() || !branch.trim() || deployLoading}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                color: 'white',
              }}
            >
              {deployLoading ? (
                <>
                  <ReloadIcon className={styles.buttonSpinner} />
                  Fazendo Deploy...
                </>
              ) : (
                'Confirmar Deploy'
              )}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Delete App Confirmation Modal */}
      <Dialog.Root open={showDeleteAppModal} onOpenChange={setShowDeleteAppModal}>
        <Dialog.Content style={{ maxWidth: '480px' }}>
          <Dialog.Title>Confirmar Exclusão</Dialog.Title>
          <Dialog.Description style={{ marginBottom: '16px', color: 'var(--gray-11)' }}>
            Tem certeza que deseja prosseguir com a exclusão da aplicação {'"'}
            <strong>{displayName}</strong>
            {'"'}?
            <br />
            <br />
            Esta ação não pode ser desfeita.
          </Dialog.Description>

          <Box style={{ marginTop: '8px' }}>
            <Text
              size='2'
              style={{ color: 'var(--gray-11)', marginBottom: '8px', display: 'block' }}
            >
              Para confirmar, digite <strong>{`deletar-${displayName}`}</strong> abaixo:
            </Text>
            <TextField.Root
              placeholder={`deletar-${displayName}`}
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
          </Box>

          <Flex gap='3' mt='4' justify='end'>
            <Dialog.Close>
              <Button variant='soft' color='gray' disabled={deleteAppLoading}>
                Cancelar
              </Button>
            </Dialog.Close>
            <Button
              onClick={deleteApp}
              disabled={deleteAppLoading || deleteConfirmText.trim() !== `deletar-${displayName}`}
              style={{ backgroundColor: 'var(--red-9)', color: 'white', border: 'none' }}
            >
              {deleteAppLoading ? (
                <>
                  <ReloadIcon className={styles.buttonSpinner} /> Deletando...
                </>
              ) : (
                'Confirmar Exclusão'
              )}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Zip Info Modal */}
      <Dialog.Root open={zipInfoModalOpen} onOpenChange={setZipInfoModalOpen}>
        <Dialog.Content style={{ maxWidth: '500px' }}>
          <Dialog.Title>Deploy via Arquivo ZIP</Dialog.Title>
          <Dialog.Description style={{ marginBottom: '16px' }}>
            Para fazer deploy via arquivo ZIP, o arquivo deve conter:
          </Dialog.Description>

          <Box
            style={{
              padding: '16px',
              background: 'var(--blue-2)',
              border: '1px solid var(--blue-6)',
              borderRadius: '8px',
              marginBottom: '20px',
            }}
          >
            <Flex direction='column' gap='3'>
              <Text size='3' weight='medium' style={{ color: 'var(--blue-12)' }}>
                📁 Estrutura necessária:
              </Text>
              <Box style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                <div>📦 seu-projeto.zip</div>
                <div>├── 📄 .deployment_token</div>
                <div>├── 📄 app.py (ou seus arquivos)</div>
                <div>├── 📄 requirements.txt</div>
                <div>└── 📁 ... (outros arquivos)</div>
              </Box>
            </Flex>
          </Box>

          <Box
            style={{
              padding: '12px',
              background: 'var(--amber-2)',
              border: '1px solid var(--amber-6)',
              borderRadius: '8px',
              marginBottom: '20px',
            }}
          >
            <Flex align='start' gap='2'>
              <Text style={{ fontSize: '16px' }}>⚠️</Text>
              <Box>
                <Text size='3' weight='medium' style={{ color: 'var(--amber-11)' }}>
                  Importante:{' '}
                </Text>
                <Text size='2' style={{ color: 'var(--amber-11)', marginTop: '4px' }}>
                  O arquivo <strong>.deployment_token</strong> deve conter exatamente o token da
                  aplicação mostrado acima, sem espaços ou quebras de linha adicionais.
                </Text>
              </Box>
            </Flex>
          </Box>

          <Flex gap='3' mt='4' justify='end'>
            <Dialog.Close>
              <Button variant='soft' color='gray'>
                Cancelar
              </Button>
            </Dialog.Close>
            <Button
              onClick={handleZipFileSelection}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                color: 'white',
              }}
            >
              <UploadIcon />
              Selecionar Arquivo
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Hidden file input for zip upload */}
      <input
        id='file-upload'
        type='file'
        accept='.zip'
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        disabled={fileDeployLoading}
      />

      {/* Hidden file input for importing env vars */}
      <input
        id='env-file-upload'
        type='file'
        accept='.env,.json,.yml,.yaml,application/json,text/plain,text/yaml'
        style={{ display: 'none' }}
        onChange={handleEnvImport}
        disabled={envImportLoading}
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
            <Text size='3'>Fazendo upload e deploy do arquivo...</Text>
          </Card>
        </Box>
      )}

      {/* Delete Environment Variable Modal */}
      <Dialog.Root open={showDeleteEnvModal} onOpenChange={setShowDeleteEnvModal}>
        <Dialog.Content
          maxWidth='450px'
          style={{
            padding: '24px',
          }}
        >
          <Dialog.Title style={{ marginBottom: '12px' }}>Confirmar Remoção</Dialog.Title>
          <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
            Tem certeza que deseja remover a variável de ambiente{' '}
            <strong>&quot;{envToDelete}&quot;</strong>?
            <br />
            <br />
            Esta ação não pode ser desfeita e pode afetar o funcionamento do aplicativo.
          </Dialog.Description>

          <Flex gap='3' mt='4' justify='end'>
            <Dialog.Close>
              <Button variant='soft' color='gray'>
                Cancelar
              </Button>
            </Dialog.Close>
            <Button
              color='red'
              onClick={removeEnvironmentVariable}
              disabled={deletingEnv === envToDelete}
              style={{
                backgroundColor: 'var(--red-9)',
                color: 'white',
              }}
            >
              {deletingEnv === envToDelete ? 'Removendo...' : 'Confirmar Remoção'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Delete Port Mapping Modal */}
      <Dialog.Root open={showDeletePortModal} onOpenChange={setShowDeletePortModal}>
        <Dialog.Content
          maxWidth='450px'
          style={{
            padding: '24px',
          }}
        >
          <Dialog.Title style={{ marginBottom: '12px' }}>Confirmar Remoção</Dialog.Title>
          <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
            Tem certeza que deseja remover o mapeamento de porta{' '}
            <strong>
              {portToDelete?.protocol.toUpperCase()}: {portToDelete?.origin} → {portToDelete?.dest}
            </strong>
            ?
            <br />
            <br />
            Esta ação não pode ser desfeita e pode afetar o acesso ao aplicativo.
          </Dialog.Description>

          <Flex gap='3' mt='4' justify='end'>
            <Dialog.Close>
              <Button variant='soft' color='gray'>
                Cancelar
              </Button>
            </Dialog.Close>
            <Button
              color='red'
              onClick={removePortMapping}
              disabled={
                !!(
                  portToDelete &&
                  deletingPort ===
                    `${portToDelete.protocol}-${portToDelete.origin}-${portToDelete.dest}`
                )
              }
              style={{
                backgroundColor: 'var(--red-9)',
                color: 'white',
              }}
            >
              {portToDelete &&
              deletingPort ===
                `${portToDelete.protocol}-${portToDelete.origin}-${portToDelete.dest}`
                ? 'Removendo...'
                : 'Confirmar Remoção'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Stop App Confirmation Modal */}
      <Dialog.Root open={showStopConfirmModal} onOpenChange={setShowStopConfirmModal}>
        <Dialog.Content
          maxWidth='450px'
          style={{
            padding: '24px',
          }}
        >
          <Dialog.Title style={{ marginBottom: '12px' }}>Confirmar Ação</Dialog.Title>
          <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
            Tem certeza que deseja parar o aplicativo?
            <br />
            <br />
            Esta ação interromperá todos os processos e conexões ativas desse aplicativo.
          </Dialog.Description>

          <Flex gap='3' mt='4' justify='end'>
            <Dialog.Close>
              <Button variant='soft' color='gray' disabled={stopLoading}>
                Cancelar
              </Button>
            </Dialog.Close>
            <Button
              color='red'
              onClick={() => {
                setShowStopConfirmModal(false);
                stopApp();
              }}
              disabled={stopLoading}
              style={{
                backgroundColor: 'var(--red-9)',
                color: 'white',
              }}
            >
              {stopLoading ? 'Parando...' : 'Parar Aplicativo'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Restart App Confirmation Modal */}
      <Dialog.Root open={showRestartConfirmModal} onOpenChange={setShowRestartConfirmModal}>
        <Dialog.Content
          maxWidth='450px'
          style={{
            padding: '24px',
          }}
        >
          <Dialog.Title style={{ marginBottom: '12px' }}>Confirmar Ação</Dialog.Title>
          <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
            Tem certeza que deseja reiniciar o aplicativo?
            <br />
            <br />
            Esta ação interromperá temporariamente todos os processos e conexões ativas, e
            inicializar novamente o aplicativo.
          </Dialog.Description>

          <Flex gap='3' mt='4' justify='end'>
            <Dialog.Close>
              <Button variant='soft' color='gray' disabled={restartLoading}>
                Cancelar
              </Button>
            </Dialog.Close>
            <Button
              onClick={() => {
                setShowRestartConfirmModal(false);
                restartApp();
              }}
              disabled={restartLoading}
              style={{
                backgroundColor: 'var(--orange-8)',
                color: 'white',
              }}
            >
              {restartLoading ? 'Reiniciando...' : 'Reiniciar Aplicativo'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Rebuild App Confirmation Modal */}
      <Dialog.Root open={showRebuildConfirmModal} onOpenChange={setShowRebuildConfirmModal}>
        <Dialog.Content
          maxWidth='450px'
          style={{
            padding: '24px',
          }}
        >
          <Dialog.Title style={{ marginBottom: '12px' }}>Confirmar Ação</Dialog.Title>
          <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
            Tem certeza que deseja reconstruir o aplicativo?
            <br />
            <br />
            Esta ação irá reconstruir do zero a imagem do aplicativo, podendo levar alguns minutos.
          </Dialog.Description>

          <Flex gap='3' mt='4' justify='end'>
            <Dialog.Close>
              <Button variant='soft' color='gray' disabled={rebuildLoading}>
                Cancelar
              </Button>
            </Dialog.Close>
            <Button
              onClick={() => {
                setShowRebuildConfirmModal(false);
                rebuildApp();
              }}
              disabled={rebuildLoading}
              style={{
                backgroundColor: 'var(--violet-9)',
                color: 'white',
              }}
            >
              {rebuildLoading ? 'Reconstruindo...' : 'Reconstruir Aplicativo'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Builder Configuration Modal */}
      <Dialog.Root
        open={builderModalOpen}
        onOpenChange={(open) => {
          setBuilderModalOpen(open);
          if (!open) {
            setErrors((prev) => ({ ...prev, builder: null }));
          }
        }}
      >
        <Dialog.Content style={{ maxWidth: '450px' }}>
          <Dialog.Title>Configurar Builder</Dialog.Title>
          <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
            Selecione o builder que será usado para construir e implantar seu aplicativo.
          </Dialog.Description>

          {errors.builder && (
            <Box
              style={{
                padding: '12px',
                background: 'var(--red-2)',
                border: '1px solid var(--red-6)',
                borderRadius: '6px',
                marginBottom: '16px',
              }}
            >
              <Text size='2' color='red'>
                {errors.builder}
              </Text>
            </Box>
          )}

          <Flex direction='column' gap='4' style={{ marginTop: '20px' }}>
            <Box>
              <Select.Root value={selectedBuilder} onValueChange={setSelectedBuilder}>
                <Select.Trigger style={{ width: '100%' }} />
                <Select.Content>
                  <Select.Item value='herokuish'>Herokuish</Select.Item>
                  <Select.Item value='dockerfile'>Dockerfile</Select.Item>
                  <Select.Item value='lambda'>Lambda</Select.Item>
                  <Select.Item value='pack'>Pack</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>
          </Flex>

          <Flex gap='3' mt='6' justify='end'>
            <Dialog.Close>
              <Button variant='soft' color='gray' disabled={builderConfigLoading}>
                Cancelar
              </Button>
            </Dialog.Close>
            <Button
              onClick={configureBuilder}
              disabled={!selectedBuilder || builderConfigLoading}
              style={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                border: 'none',
                color: 'white',
              }}
            >
              {builderConfigLoading ? (
                <>
                  <ReloadIcon className={styles.buttonSpinner} />
                  Configurando...
                </>
              ) : (
                'Configurar'
              )}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
