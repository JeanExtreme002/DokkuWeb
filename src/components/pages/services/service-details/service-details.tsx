import {
  ChevronRightIcon,
  CopyIcon,
  DownloadIcon,
  EyeClosedIcon,
  EyeOpenIcon,
  Link1Icon,
  PlayIcon,
  ReloadIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import {
  Avatar,
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  Select,
  Separator,
  Tabs,
  Text,
  TextArea,
} from '@radix-ui/themes';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { NavBar } from '@/components';
import { DotIcon } from '@/components/shared/icons';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { api } from '@/lib';

import styles from './service-details.module.css';

interface ServiceDetailsPageProps {
  pluginType: string;
  serviceName: string;
}

interface ServiceData {
  config_dir: string;
  config_options: string;
  data_dir: string;
  dsn: string;
  exposed_ports: string;
  id: string;
  internal_ip: string;
  links: string;
  service_root: string;
  status: string;
  version: string;
  plugin_name: string;
  initial_network?: string;
  post_create_network?: string;
  post_start_network?: string;
}

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

export function ServiceDetailsPage(props: ServiceDetailsPageProps) {
  const { data: session } = useSession();
  const router = useRouter();

  // Stable session reference to prevent unnecessary re-renders
  const stableSession = useMemo(() => {
    return session?.user?.email ? session : null;
  }, [session]);

  // States
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [serviceUri, setServiceUri] = useState<string | null>(null);
  const [linkedApps, setLinkedApps] = useState<string[]>([]);
  const [logs, setLogs] = useState<string>('');
  const [logLinesLimit, setLogLinesLimit] = useState<number>(1000);

  // Loading states
  const [mainLoading, setMainLoading] = useState(true);
  const [uriLoading, setUriLoading] = useState(true);
  const [linkedAppsLoading, setLinkedAppsLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);

  // Error states
  const [errors, setErrors] = useState({
    main: null as string | null,
    uri: null as string | null,
    linkedApps: null as string | null,
    logs: null as string | null,
  });

  // Current tab
  const [currentTab, setCurrentTab] = useState('overview');

  // URI visibility
  const [showUri, setShowUri] = useState(false);

  // Screen size detection for responsive dots
  const [isXsScreen, setIsXsScreen] = useState(false);
  const [isSmScreen, setIsSmScreen] = useState(false);
  const [isMdScreen, setIsMdScreen] = useState(false);

  // Data loaded state to prevent unnecessary re-fetching
  const [dataLoaded, setDataLoaded] = useState(false);

  // Service control loading states
  const [startLoading, setStartLoading] = useState(false);
  const [stopLoading, setStopLoading] = useState(false);
  const [restartLoading, setRestartLoading] = useState(false);

  // Unlink app modal states
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [appToUnlink, setAppToUnlink] = useState<string | null>(null);
  const [unlinkLoading, setUnlinkLoading] = useState(false);

  // Link app modal states
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [availableApps, setAvailableApps] = useState<string[]>([]);
  const [selectedApp, setSelectedApp] = useState<string>('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [appsListLoading, setAppsListLoading] = useState(false);

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
  const fetchServiceInfo = useCallback(async () => {
    try {
      const response = await api.post(
        `/api/databases/${props.pluginType}/${props.serviceName}/info/`
      );
      if (response.data.success) {
        setServiceData({
          ...response.data.result,
          plugin_name: props.pluginType,
        });
      }
    } catch (error: any) {
      // Check if it's a 404 error with "Service does not exist" message
      if (error.response?.status === 404) {
        // Redirect to 404 page
        router.push('/404');
        return;
      }
      // Re-throw the error for the retry logic to handle
      throw error;
    }
  }, [props.pluginType, props.serviceName, router]);

  const fetchServiceUri = useCallback(async () => {
    const response = await api.post(`/api/databases/${props.pluginType}/${props.serviceName}/uri/`);
    if (response.data.success) {
      setServiceUri(response.data.result);
    }
  }, [props.pluginType, props.serviceName]);

  const fetchLinkedApps = useCallback(async () => {
    const response = await api.post(
      `/api/databases/${props.pluginType}/${props.serviceName}/linked-apps/`
    );
    if (response.data.success) {
      setLinkedApps(response.data.result);
    }
  }, [props.pluginType, props.serviceName]);

  const fetchLogs = useCallback(async () => {
    const response = await api.post(
      `/api/databases/${props.pluginType}/${props.serviceName}/logs/`,
      {},
      {
        params: { n_lines: logLinesLimit },
      }
    );
    if (response.data.success) {
      setLogs(response.data.result);
    }
  }, [props.pluginType, props.serviceName, logLinesLimit]);

  // Silent refresh for overview data only - updates service info every 10 seconds
  const silentRefreshOverview = useCallback(async () => {
    try {
      // Fetch fresh service info without cache
      const serviceInfoResponse = await api.post(
        `/api/databases/${props.pluginType}/${props.serviceName}/info/`,
        {},
        {
          headers: { 'x-cache': 'false' },
        }
      );
      if (serviceInfoResponse.data.success) {
        setServiceData({
          ...serviceInfoResponse.data.result,
          plugin_name: props.pluginType,
        });
      }
    } catch (error) {
      console.warn('Silent overview refresh error (ignored):', error);
    }
  }, [props.pluginType, props.serviceName]);

  // Refresh logs function that activates loading state
  const refreshLogs = useCallback(async () => {
    await fetchWithRetry(fetchLogs, setLogsLoading, (error) =>
      setErrors((prev) => ({ ...prev, logs: error }))
    );
  }, [fetchLogs, fetchWithRetry]);

  // Initialize all data fetching
  useEffect(() => {
    if (!stableSession || !props.pluginType || !props.serviceName || dataLoaded) return;

    const loadAllData = async () => {
      try {
        // Critical data (required for page load) - fetch in parallel
        await Promise.all([
          fetchWithRetry(fetchServiceInfo, setMainLoading, (error) =>
            setErrors((prev) => ({ ...prev, main: error }))
          ),
          fetchWithRetry(fetchServiceUri, setUriLoading, (error) =>
            setErrors((prev) => ({ ...prev, uri: error }))
          ),
          fetchWithRetry(fetchLinkedApps, setLinkedAppsLoading, (error) =>
            setErrors((prev) => ({ ...prev, linkedApps: error }))
          ),
        ]);

        // Load logs separately (non-blocking)
        fetchWithRetry(fetchLogs, setLogsLoading, (error) =>
          setErrors((prev) => ({ ...prev, logs: error }))
        );

        // Mark data as loaded to prevent re-fetching on tab change
        setDataLoaded(true);
      } catch (error) {
        console.error('Error loading service data:', error);
      }
    };

    loadAllData();
  }, [
    stableSession,
    props.pluginType,
    props.serviceName,
    dataLoaded,
    fetchWithRetry,
    fetchServiceInfo,
    fetchServiceUri,
    fetchLinkedApps,
    fetchLogs,
  ]);

  // Reset dataLoaded when service changes
  useEffect(() => {
    setDataLoaded(false);
  }, [props.pluginType, props.serviceName]);

  // Screen size detection for responsive dots
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsXsScreen(width <= 360);
      setIsSmScreen(width <= 480 && width > 360);
      setIsMdScreen(width <= 768 && width > 480);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-refresh overview data every 10 seconds without showing loading spinners
  useEffect(() => {
    if (!stableSession || !props.pluginType || !props.serviceName || !dataLoaded) return;

    const intervalId = setInterval(() => {
      silentRefreshOverview();
    }, 10000); // 10 seconds

    return () => clearInterval(intervalId);
  }, [stableSession, props.pluginType, props.serviceName, dataLoaded, silentRefreshOverview]);

  // Helper functions
  const getStatusInfo = () => {
    if (!serviceData)
      return { color: 'var(--gray-9)', text: 'Carregando...', bgColor: 'var(--gray-3)' };

    switch (serviceData.status.toLowerCase()) {
      case 'running':
        return { color: 'var(--green-9)', text: 'Ativo', bgColor: 'var(--green-3)' };
      case 'stopped':
      case 'exited':
      case 'missing':
        return { color: 'var(--red-9)', text: 'Parado', bgColor: 'var(--red-3)' };
      case 'starting':
        return { color: 'var(--amber-9)', text: 'Iniciando', bgColor: 'var(--amber-3)' };
      default:
        return { color: 'var(--gray-9)', text: 'Desconhecido', bgColor: 'var(--gray-3)' };
    }
  };

  const formatServiceName = (name: string) => {
    // Remove prefixos numéricos como "1_" se existirem
    return name.replace(/^\d+_/, '');
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

  const getServiceImage = (pluginName: string) => {
    return DATABASE_IMAGES[pluginName] || DATABASE_IMAGES.generic;
  };

  const formatVersion = (version: string) => {
    // Extrai apenas a versão do formato "mysql:8.1.0"
    const versionMatch = version.match(/:(.+)$/);
    return versionMatch ? `v${versionMatch[1]}` : version;
  };

  const copyUri = async () => {
    if (serviceUri) {
      try {
        await navigator.clipboard.writeText(serviceUri);
        // Aqui você pode adicionar uma notificação de sucesso se tiver um sistema de toast
      } catch (error) {
        console.error('Erro ao copiar URI:', error);
      }
    }
  };

  const processAnsiCodes = (text: string) => {
    // Remove ANSI escape codes for cleaner display
    return text.replace(/\u001b\[[0-9;]*m/g, '');
  };

  const downloadLogs = () => {
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${props.serviceName}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Service control functions
  const startService = async () => {
    setStartLoading(true);
    try {
      await api.post(`/api/databases/${props.pluginType}/${props.serviceName}/start/`);
      // Refresh service info after action
      setDataLoaded(false);
      await fetchServiceInfo();
    } catch (error: any) {
      console.error('Error starting service:', error);
      setErrors((prev) => ({
        ...prev,
        main: error.response?.data?.message || 'Erro ao iniciar serviço',
      }));
    } finally {
      setStartLoading(false);
    }
  };

  const stopService = async () => {
    setStopLoading(true);
    try {
      await api.post(`/api/databases/${props.pluginType}/${props.serviceName}/stop/`);
      // Refresh service info after action
      setDataLoaded(false);
      await fetchServiceInfo();
    } catch (error: any) {
      console.error('Error stopping service:', error);
      setErrors((prev) => ({
        ...prev,
        main: error.response?.data?.message || 'Erro ao parar serviço',
      }));
    } finally {
      setStopLoading(false);
    }
  };

  const restartService = async () => {
    setRestartLoading(true);
    try {
      await api.post(`/api/databases/${props.pluginType}/${props.serviceName}/restart/`);
      // Refresh service info after action
      setDataLoaded(false);
      await fetchServiceInfo();
    } catch (error: any) {
      console.error('Error restarting service:', error);
      setErrors((prev) => ({
        ...prev,
        main: error.response?.data?.message || 'Erro ao reiniciar serviço',
      }));
    } finally {
      setRestartLoading(false);
    }
  };

  // Unlink app functions
  const handleUnlinkApp = (appName: string) => {
    setAppToUnlink(appName);
    setShowUnlinkModal(true);
  };

  const confirmUnlinkApp = async () => {
    if (!appToUnlink) return;

    setUnlinkLoading(true);
    try {
      await api.delete(
        `/api/databases/${props.pluginType}/${props.serviceName}/link/${appToUnlink}/`
      );

      // Remove app from the list locally
      setLinkedApps((prev) => prev.filter((app) => app !== appToUnlink));

      // Close modal
      setShowUnlinkModal(false);
      setAppToUnlink(null);
    } catch (error: any) {
      console.error('Error unlinking app:', error);
      setErrors((prev) => ({
        ...prev,
        linkedApps: error.response?.data?.message || 'Erro ao desvincular aplicação',
      }));
    } finally {
      setUnlinkLoading(false);
    }
  };

  const cancelUnlinkApp = () => {
    setShowUnlinkModal(false);
    setAppToUnlink(null);
  };

  // Link app functions
  const handleLinkApp = async () => {
    setAppsListLoading(true);
    setShowLinkModal(true);

    try {
      const response = await api.post(
        '/api/apps/list/',
        {},
        {
          headers: { 'x-cache': 'false' },
          params: { return_info: false },
        }
      );

      if (response.data.success) {
        const appNames = Object.keys(response.data.result);
        // Filter out already linked apps
        const unlinkedApps = appNames.filter((app) => !linkedApps.includes(app));
        setAvailableApps(unlinkedApps);

        if (unlinkedApps.length > 0) {
          setSelectedApp(unlinkedApps[0]);
        }
      }
    } catch (error: any) {
      console.error('Error fetching apps list:', error);
      setErrors((prev) => ({
        ...prev,
        linkedApps: 'Erro ao carregar lista de aplicações',
      }));
      setShowLinkModal(false);
    } finally {
      setAppsListLoading(false);
    }
  };

  const confirmLinkApp = async () => {
    if (!selectedApp) return;

    setLinkLoading(true);
    try {
      await api.post(
        `/api/databases/${props.pluginType}/${props.serviceName}/link/${selectedApp}/`
      );

      // Add app to the list locally
      setLinkedApps((prev) => [...prev, selectedApp]);

      // Close modal
      setShowLinkModal(false);
      setSelectedApp('');
      setAvailableApps([]);
    } catch (error: any) {
      console.error('Error linking app:', error);
      setErrors((prev) => ({
        ...prev,
        linkedApps: error.response?.data?.message || 'Erro ao vincular aplicação',
      }));
    } finally {
      setLinkLoading(false);
    }
  };

  const cancelLinkApp = () => {
    setShowLinkModal(false);
    setSelectedApp('');
    setAvailableApps([]);
  };

  if (!stableSession) {
    return null;
  }

  const statusInfo = getStatusInfo();
  const displayName = formatServiceName(props.serviceName);
  const serviceType = formatDatabaseType(props.pluginType);

  return (
    <>
      <NavBar session={stableSession} />

      <main className={styles.root}>
        {mainLoading || uriLoading || linkedAppsLoading ? (
          <LoadingSpinner
            asCard={false}
            title='Carregando Serviço'
            messages={[
              'Conectando ao Dokku...',
              'Obtendo informações do serviço...',
              'Carregando aplicações conectadas...',
              'Verificando status...',
              'Quase pronto...',
            ]}
          />
        ) : errors.main ? (
          <Flex direction='column' align='center' justify='center' style={{ minHeight: '50vh' }}>
            <Text size='5' color='red'>
              {errors.main}
            </Text>
            <Button size='3' onClick={() => window.location.reload()} style={{ marginTop: '16px' }}>
              <ReloadIcon /> Recarregar
            </Button>
          </Flex>
        ) : (
          <Flex direction='column' gap='4' className={styles.mainContainer}>
            {/* Header */}
            <Box className={styles.headerSection}>
              <Flex align='center' gap='4'>
                <Image
                  src={getServiceImage(props.pluginType)}
                  alt={`${serviceType} logo`}
                  width={64}
                  height={64}
                  className={styles.serviceImage}
                  onError={(e) => {
                    e.currentTarget.src = '/images/database-logos/generic.svg';
                  }}
                />

                <Flex direction='column' gap='2'>
                  <Flex align='center' gap='3'>
                    <Heading
                      size='8'
                      weight='bold'
                      className={styles.serviceName}
                      style={{ color: 'var(--gray-12)' }}
                    >
                      {displayName}
                    </Heading>
                    <Flex
                      align='center'
                      gap='2'
                      className={styles.statusBadge}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        backgroundColor: statusInfo.bgColor,
                      }}
                    >
                      <Box
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: statusInfo.color,
                        }}
                      />
                      <Text size='2' weight='medium' style={{ color: statusInfo.color }}>
                        {statusInfo.text}
                      </Text>
                    </Flex>
                  </Flex>

                  <Text
                    size='4'
                    className={styles.serviceTypeVersion}
                    style={{ color: 'var(--gray-11)' }}
                  >
                    {serviceType} {serviceData && formatVersion(serviceData.version)}
                  </Text>
                </Flex>
              </Flex>
            </Box>

            <Separator size='4' />

            {/* Service Control Buttons */}
            <Flex direction='column' gap='3'>
              <Flex
                direction='column'
                gap='3'
                className={styles.serviceControlButtons}
                style={{ width: '100%' }}
              >
                {/* Desktop Layout - Side by side */}
                <Flex
                  justify='between'
                  align='center'
                  style={{ width: '100%' }}
                  className={styles.desktopButtonLayout}
                >
                  <Flex gap='3' className={styles.buttonRow}>
                    <Button
                      size='3'
                      variant='outline'
                      color='green'
                      onClick={startService}
                      disabled={
                        startLoading ||
                        stopLoading ||
                        restartLoading ||
                        serviceData?.status === 'running'
                      }
                    >
                      {startLoading ? (
                        <ReloadIcon className={styles.buttonSpinner} />
                      ) : (
                        <PlayIcon />
                      )}
                      Iniciar
                    </Button>

                    <Button
                      size='3'
                      variant='outline'
                      color='red'
                      onClick={stopService}
                      disabled={
                        startLoading ||
                        stopLoading ||
                        restartLoading ||
                        (serviceData?.status !== 'running' && serviceData?.status !== 'starting')
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
                      onClick={restartService}
                      disabled={startLoading || stopLoading || restartLoading}
                    >
                      {restartLoading ? (
                        <ReloadIcon className={styles.buttonSpinner} />
                      ) : (
                        <ReloadIcon />
                      )}
                      Reiniciar
                    </Button>
                  </Flex>

                  {/* Link App Button - aligned to the right (desktop) */}
                  <Button
                    size='3'
                    variant='outline'
                    color='blue'
                    onClick={handleLinkApp}
                    disabled={startLoading || stopLoading || restartLoading || appsListLoading}
                  >
                    {appsListLoading ? (
                      <ReloadIcon className={styles.buttonSpinner} />
                    ) : (
                      <Link1Icon />
                    )}
                    Vincular Aplicativo
                  </Button>
                </Flex>

                {/* Mobile/Tablet Layout - Stacked */}
                <Flex direction='column' gap='3' className={styles.mobileButtonLayout}>
                  <Flex gap='3' className={styles.buttonRow} style={{ width: '100%' }}>
                    <Button
                      size='3'
                      variant='outline'
                      color='green'
                      onClick={startService}
                      disabled={
                        startLoading ||
                        stopLoading ||
                        restartLoading ||
                        serviceData?.status === 'running'
                      }
                    >
                      {startLoading ? (
                        <ReloadIcon className={styles.buttonSpinner} />
                      ) : (
                        <PlayIcon />
                      )}
                      Iniciar
                    </Button>

                    <Button
                      size='3'
                      variant='outline'
                      color='red'
                      onClick={stopService}
                      disabled={
                        startLoading ||
                        stopLoading ||
                        restartLoading ||
                        (serviceData?.status !== 'running' && serviceData?.status !== 'starting')
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
                      onClick={restartService}
                      disabled={startLoading || stopLoading || restartLoading}
                    >
                      {restartLoading ? (
                        <ReloadIcon className={styles.buttonSpinner} />
                      ) : (
                        <ReloadIcon />
                      )}
                      Reiniciar
                    </Button>
                  </Flex>

                  {/* Link App Button - below other buttons (mobile/tablet) */}
                  <Button
                    size='3'
                    variant='outline'
                    color='blue'
                    onClick={handleLinkApp}
                    disabled={startLoading || stopLoading || restartLoading || appsListLoading}
                    style={{ width: '100%' }}
                  >
                    {appsListLoading ? (
                      <ReloadIcon className={styles.buttonSpinner} />
                    ) : (
                      <Link1Icon />
                    )}
                    Vincular Aplicativo
                  </Button>
                </Flex>
              </Flex>
            </Flex>

            {/* Tabs */}
            <Tabs.Root value={currentTab} onValueChange={setCurrentTab} className={styles.tabsRoot}>
              <Tabs.List size='2' className={styles.tabsList}>
                <Tabs.Trigger value='overview' className={styles.tabsTrigger}>
                  Visão Geral
                </Tabs.Trigger>
                <Tabs.Trigger value='connected-apps' className={styles.tabsTrigger}>
                  Aplicações
                </Tabs.Trigger>
                <Tabs.Trigger value='logs' className={styles.tabsTrigger}>
                  Logs
                </Tabs.Trigger>
                <Tabs.Trigger value='security' className={styles.tabsTrigger}>
                  Segurança
                </Tabs.Trigger>
              </Tabs.List>

              {/* Overview Tab */}
              <Tabs.Content value='overview' className={styles.tabsContent}>
                <Flex direction='column' gap='4'>
                  <Heading size='5' style={{ marginBottom: '20px' }}>
                    Informações do Serviço
                  </Heading>

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
                          className={styles.overviewLabel}
                          style={{ color: 'var(--gray-11)' }}
                        >
                          Status
                        </Text>
                        <Text
                          size='3'
                          className={styles.overviewValue}
                          style={{ color: 'var(--gray-12)' }}
                        >
                          {statusInfo.text}
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
                          className={styles.overviewLabel}
                          style={{ color: 'var(--gray-11)' }}
                        >
                          Versão
                        </Text>
                        <Text
                          size='3'
                          className={styles.overviewValue}
                          style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
                        >
                          {serviceData && serviceData.version
                            ? formatVersion(serviceData.version)
                            : 'Indisponível'}
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
                          className={styles.overviewLabel}
                          style={{ color: 'var(--gray-11)' }}
                        >
                          IP Interno
                        </Text>
                        <Text
                          size='3'
                          className={styles.overviewValue}
                          style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
                        >
                          {serviceData?.internal_ip || 'Indisponível'}
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
                          className={styles.overviewLabel}
                          style={{ color: 'var(--gray-11)' }}
                        >
                          ID do Container
                        </Text>
                        <Text
                          size='3'
                          className={styles.overviewValue}
                          style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
                        >
                          {serviceData?.id || 'N/A'}
                        </Text>
                      </Flex>
                    </Box>

                    {serviceData?.exposed_ports !== '-' && (
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
                            className={styles.overviewLabel}
                            style={{ color: 'var(--gray-11)' }}
                          >
                            Portas Expostas
                          </Text>
                          <Text
                            size='3'
                            className={styles.overviewValue}
                            style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
                          >
                            {serviceData?.exposed_ports}
                          </Text>
                        </Flex>
                      </Box>
                    )}

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
                          className={styles.overviewLabel}
                          style={{ color: 'var(--gray-11)' }}
                        >
                          Diretório de Dados
                        </Text>
                        <Text
                          size='3'
                          className={styles.overviewValue}
                          style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
                        >
                          {serviceData?.data_dir || '-'}
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
                          className={styles.overviewLabel}
                          style={{ color: 'var(--gray-11)' }}
                        >
                          Diretório de Configuração
                        </Text>
                        <Text
                          size='3'
                          className={styles.overviewValue}
                          style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
                        >
                          {serviceData?.config_dir || '-'}
                        </Text>
                      </Flex>
                    </Box>

                    <Box style={{ paddingBottom: '8px' }}>
                      <Flex
                        direction={{ initial: 'column', sm: 'row' }}
                        justify={{ sm: 'between' }}
                        align={{ sm: 'center' }}
                        gap='1'
                      >
                        <Text
                          size='3'
                          weight='medium'
                          className={styles.overviewLabel}
                          style={{ color: 'var(--gray-11)' }}
                        >
                          Diretório Raiz
                        </Text>
                        <Text
                          size='3'
                          className={styles.overviewValue}
                          style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
                        >
                          {serviceData?.service_root || '-'}
                        </Text>
                      </Flex>
                    </Box>
                  </Flex>
                </Flex>
              </Tabs.Content>

              {/* Connected Apps Tab */}
              <Tabs.Content value='connected-apps' className={styles.tabsContent}>
                <Flex direction='column' gap='4'>
                  <Heading size='5' style={{ marginBottom: '20px' }}>
                    Aplicações Conectadas
                  </Heading>

                  {errors.linkedApps ? (
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
                          {errors.linkedApps}
                        </Text>
                      </Flex>
                    </Card>
                  ) : linkedApps.length === 0 ? (
                    <Card
                      style={{
                        border: '1px solid var(--gray-6)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        padding: '40px',
                        textAlign: 'center',
                      }}
                    >
                      <Text size='3' color='gray'>
                        Nenhuma aplicação vinculada a este serviço.
                      </Text>
                    </Card>
                  ) : (
                    <Flex direction='column' gap='3'>
                      {linkedApps.map((appName) => (
                        <Card
                          key={appName}
                          className={styles.connectedAppCard}
                          style={{
                            border: '1px solid var(--gray-6)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                            transition: 'all 0.2s ease',
                            width: '100%',
                          }}
                        >
                          <Flex
                            direction='column'
                            style={{
                              padding: '16px 20px',
                              width: '100%',
                            }}
                          >
                            {/* Main content row */}
                            <Flex
                              align='center'
                              justify='between'
                              style={{
                                width: '100%',
                                cursor: 'pointer',
                              }}
                              onClick={() => (window.location.href = `/apps/a/${appName}`)}
                              onMouseEnter={(e) => {
                                const card = e.currentTarget.closest(
                                  '.connectedAppCard'
                                ) as HTMLElement;
                                if (card) {
                                  card.style.transform = 'translateY(-1px)';
                                  card.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                                  card.style.borderColor = 'var(--blue-7)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                const card = e.currentTarget.closest(
                                  '.connectedAppCard'
                                ) as HTMLElement;
                                if (card) {
                                  card.style.transform = 'translateY(0)';
                                  card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
                                  card.style.borderColor = 'var(--gray-6)';
                                }
                              }}
                            >
                              <Flex align='center' gap='4'>
                                <Avatar
                                  size='5'
                                  fallback={
                                    <svg
                                      width='40'
                                      height='40'
                                      viewBox='0 0 24 24'
                                      fill='none'
                                      xmlns='http://www.w3.org/2000/svg'
                                    >
                                      {/* CPU Body */}
                                      <rect
                                        x='6'
                                        y='6'
                                        width='12'
                                        height='12'
                                        rx='2'
                                        stroke='#e1bee7'
                                        strokeWidth='2'
                                        fill='rgba(225, 190, 231, 0.1)'
                                      />
                                      {/* CPU Corner Details */}
                                      <circle cx='8' cy='8' r='0.5' fill='#ce93d8' />
                                      <circle cx='16' cy='8' r='0.5' fill='#ce93d8' />
                                      <circle cx='8' cy='16' r='0.5' fill='#ce93d8' />
                                      <circle cx='16' cy='16' r='0.5' fill='#ce93d8' />
                                      {/* CPU Core */}
                                      <rect
                                        x='9'
                                        y='9'
                                        width='6'
                                        height='6'
                                        rx='1'
                                        stroke='#f3e5f5'
                                        strokeWidth='1.5'
                                        fill='rgba(243, 229, 245, 0.2)'
                                      />
                                      {/* Internal Circuits */}
                                      <line
                                        x1='10'
                                        y1='11'
                                        x2='14'
                                        y2='11'
                                        stroke='#ce93d8'
                                        strokeWidth='0.5'
                                      />
                                      <line
                                        x1='10'
                                        y1='12.5'
                                        x2='14'
                                        y2='12.5'
                                        stroke='#ce93d8'
                                        strokeWidth='0.5'
                                      />
                                      <line
                                        x1='10'
                                        y1='14'
                                        x2='14'
                                        y2='14'
                                        stroke='#ce93d8'
                                        strokeWidth='0.5'
                                      />
                                      <line
                                        x1='11'
                                        y1='10'
                                        x2='11'
                                        y2='14'
                                        stroke='#ce93d8'
                                        strokeWidth='0.5'
                                      />
                                      <line
                                        x1='13'
                                        y1='10'
                                        x2='13'
                                        y2='14'
                                        stroke='#ce93d8'
                                        strokeWidth='0.5'
                                      />
                                      {/* Core Activity Indicators */}
                                      <circle cx='11.5' cy='11.5' r='0.3' fill='#ba68c8' />
                                      <circle cx='12.5' cy='12.5' r='0.3' fill='#ba68c8' />
                                      <circle cx='11.5' cy='13.5' r='0.3' fill='#ba68c8' />
                                      <circle cx='12.5' cy='11.5' r='0.3' fill='#ba68c8' />
                                      {/* CPU Pins - Top */}
                                      <line
                                        x1='8'
                                        y1='6'
                                        x2='8'
                                        y2='3'
                                        stroke='#ce93d8'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                      />
                                      <circle cx='8' cy='4.5' r='0.4' fill='#ba68c8' />
                                      <line
                                        x1='12'
                                        y1='6'
                                        x2='12'
                                        y2='3'
                                        stroke='#ce93d8'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                      />
                                      <circle cx='12' cy='4.5' r='0.4' fill='#ba68c8' />
                                      <line
                                        x1='16'
                                        y1='6'
                                        x2='16'
                                        y2='3'
                                        stroke='#ce93d8'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                      />
                                      <circle cx='16' cy='4.5' r='0.4' fill='#ba68c8' />
                                      {/* CPU Pins - Bottom */}
                                      <line
                                        x1='8'
                                        y1='18'
                                        x2='8'
                                        y2='21'
                                        stroke='#ce93d8'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                      />
                                      <circle cx='8' cy='19.5' r='0.4' fill='#ba68c8' />
                                      <line
                                        x1='12'
                                        y1='18'
                                        x2='12'
                                        y2='21'
                                        stroke='#ce93d8'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                      />
                                      <circle cx='12' cy='19.5' r='0.4' fill='#ba68c8' />
                                      <line
                                        x1='16'
                                        y1='18'
                                        x2='16'
                                        y2='21'
                                        stroke='#ce93d8'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                      />
                                      <circle cx='16' cy='19.5' r='0.4' fill='#ba68c8' />
                                      {/* CPU Pins - Left */}
                                      <line
                                        x1='6'
                                        y1='8'
                                        x2='3'
                                        y2='8'
                                        stroke='#ce93d8'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                      />
                                      <circle cx='4.5' cy='8' r='0.4' fill='#ba68c8' />
                                      <line
                                        x1='6'
                                        y1='12'
                                        x2='3'
                                        y2='12'
                                        stroke='#ce93d8'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                      />
                                      <circle cx='4.5' cy='12' r='0.4' fill='#ba68c8' />
                                      <line
                                        x1='6'
                                        y1='16'
                                        x2='3'
                                        y2='16'
                                        stroke='#ce93d8'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                      />
                                      <circle cx='4.5' cy='16' r='0.4' fill='#ba68c8' />
                                      {/* CPU Pins - Right */}
                                      <line
                                        x1='18'
                                        y1='8'
                                        x2='21'
                                        y2='8'
                                        stroke='#ce93d8'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                      />
                                      <circle cx='19.5' cy='8' r='0.4' fill='#ba68c8' />
                                      <line
                                        x1='18'
                                        y1='12'
                                        x2='21'
                                        y2='12'
                                        stroke='#ce93d8'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                      />
                                      <circle cx='19.5' cy='12' r='0.4' fill='#ba68c8' />
                                      <line
                                        x1='18'
                                        y1='16'
                                        x2='21'
                                        y2='16'
                                        stroke='#ce93d8'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                      />
                                      <circle cx='19.5' cy='16' r='0.4' fill='#ba68c8' />
                                    </svg>
                                  }
                                  style={{
                                    background:
                                      'linear-gradient(135deg, #6a1b9a 0%, #8e24aa 25%, #ab47bc 50%, #9c5cb5 75%, #7b1fa2 100%)',
                                    color: 'white',
                                    border: '2px solid rgba(255, 255, 255, 0.25)',
                                    boxShadow:
                                      '0 4px 16px rgba(142, 36, 170, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                                  }}
                                />

                                <Flex direction='column' gap='1'>
                                  <Heading
                                    size='4'
                                    weight='medium'
                                    className={styles.appTitle}
                                    style={{ color: 'var(--gray-12)' }}
                                  >
                                    {appName.replace(/^\d+-/, '')}
                                  </Heading>
                                  <Text
                                    size='2'
                                    className={styles.appDescription}
                                    style={{ color: 'var(--gray-9)' }}
                                  >
                                    Aplicação vinculada
                                  </Text>
                                </Flex>
                              </Flex>

                              {/* Desktop: Show buttons on the right */}
                              {!isXsScreen && !isSmScreen && (
                                <Flex align='center' gap='2'>
                                  <Button
                                    size='1'
                                    variant='soft'
                                    color='red'
                                    className={styles.unlinkButton}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUnlinkApp(appName);
                                    }}
                                    style={{
                                      position: 'relative',
                                      zIndex: 2,
                                    }}
                                  >
                                    <TrashIcon />
                                    {/* Show text only on screens larger than MD (>768px) */}
                                    {!isMdScreen && (
                                      <Text size='1' style={{ marginLeft: '4px' }}>
                                        Desvincular
                                      </Text>
                                    )}
                                  </Button>

                                  <ChevronRightIcon
                                    className={styles.chevronIcon}
                                    style={{
                                      color: 'var(--gray-9)',
                                      width: '20px',
                                      height: '20px',
                                      transition: 'all 0.2s ease',
                                    }}
                                  />
                                </Flex>
                              )}

                              {/* Mobile: Show only chevron */}
                              {(isXsScreen || isSmScreen) && (
                                <ChevronRightIcon
                                  className={styles.chevronIcon}
                                  style={{
                                    color: 'var(--gray-9)',
                                    width: '20px',
                                    height: '20px',
                                    transition: 'all 0.2s ease',
                                  }}
                                />
                              )}
                            </Flex>

                            {/* Mobile: Show unlink button below */}
                            {(isXsScreen || isSmScreen) && (
                              <Button
                                size='2'
                                variant='soft'
                                color='red'
                                className={`${styles.unlinkButton} ${styles.unlinkButtonMobile}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnlinkApp(appName);
                                }}
                                style={{
                                  width: '100%',
                                  marginTop: '12px',
                                  justifyContent: 'center',
                                }}
                              >
                                <TrashIcon />
                                <Text size='2' style={{ marginLeft: '6px' }}>
                                  Desvincular
                                </Text>
                              </Button>
                            )}
                          </Flex>
                        </Card>
                      ))}
                    </Flex>
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
                  style={{ marginBottom: '16px' }}
                >
                  <Flex align='center' gap='3'>
                    <Heading size='5'>Logs do Serviço</Heading>
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

                {/* Mobile Layout - Stacked (≤ 720px) */}
                <Box
                  style={{
                    marginBottom: '16px',
                  }}
                  className={styles.mobileLogsHeader}
                >
                  <Heading size='5' style={{ marginBottom: '12px' }}>
                    Logs do Serviço
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

              {/* Security Tab */}
              <Tabs.Content value='security' className={styles.tabsContent}>
                <Flex direction='column' gap='4'>
                  <Heading size='5' style={{ marginBottom: '20px' }}>
                    URI de Conexão
                  </Heading>

                  {errors.uri ? (
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
                          {errors.uri}
                        </Text>
                      </Flex>
                    </Card>
                  ) : (
                    <Card
                      style={{
                        border: '1px solid var(--amber-6)',
                        backgroundColor: 'var(--amber-2)',
                        padding: '20px',
                      }}
                    >
                      <Flex direction='column' gap='4'>
                        <Text
                          size='2'
                          className={styles.uriWarningText}
                          style={{ color: 'var(--amber-11)' }}
                        >
                          Esta URI contém informações sensíveis como usuário e senha. Mantenha-a
                          segura e não a compartilhe.
                        </Text>

                        <Flex gap='3' align='center'>
                          <TextArea
                            value={
                              showUri
                                ? serviceUri || ''
                                : isXsScreen
                                  ? '••••••••••••••••••••••••••' // 26 dots (40% reduction)
                                  : isSmScreen
                                    ? '•••••••••••••••••••••••••••••••••••••' // 35 dots (20% reduction)
                                    : '••••••••••••••••••••••••••••••••••••••••••••' // 44 dots (default)
                            }
                            readOnly
                            className={styles.uriTextArea}
                            style={{
                              flex: 1,
                              fontFamily: 'monospace',
                              fontSize: '14px',
                              minHeight: '60px',
                              backgroundColor: 'var(--gray-1)',
                              border: 'none',
                              resize: 'none',
                            }}
                          />

                          <Flex direction='column' gap='2' className={styles.uriButtons}>
                            <Button
                              size='2'
                              variant='soft'
                              className={styles.uriButton}
                              onClick={() => setShowUri(!showUri)}
                            >
                              {showUri ? <EyeClosedIcon /> : <EyeOpenIcon />}
                            </Button>

                            <Button
                              size='2'
                              variant='soft'
                              className={styles.uriButton}
                              onClick={copyUri}
                              disabled={!serviceUri}
                            >
                              <CopyIcon />
                            </Button>
                          </Flex>
                        </Flex>
                      </Flex>
                    </Card>
                  )}
                </Flex>
              </Tabs.Content>
            </Tabs.Root>
          </Flex>
        )}
      </main>

      {/* Unlink App Confirmation Modal */}
      <Dialog.Root open={showUnlinkModal} onOpenChange={setShowUnlinkModal}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Confirmar Desvinculação</Dialog.Title>
          <Dialog.Description style={{ marginTop: '12px', marginBottom: '20px' }}>
            Tem certeza que deseja desvincular a aplicação{' '}
            <Text weight='medium' style={{ color: 'var(--gray-12)' }}>
              {appToUnlink?.replace(/^\d+-/, '')}
            </Text>{' '}
            deste serviço? Esta ação não pode ser desfeita.
          </Dialog.Description>

          <Flex gap='3' mt='4' justify='end'>
            <Dialog.Close>
              <Button variant='soft' color='gray' onClick={cancelUnlinkApp}>
                Cancelar
              </Button>
            </Dialog.Close>
            <Button variant='solid' color='red' onClick={confirmUnlinkApp} disabled={unlinkLoading}>
              {unlinkLoading ? <ReloadIcon className={styles.buttonSpinner} /> : <TrashIcon />}
              {unlinkLoading ? 'Desvinculando...' : 'Desvincular'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Link App Selection Modal */}
      <Dialog.Root open={showLinkModal} onOpenChange={setShowLinkModal}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Vincular Aplicativo</Dialog.Title>
          <Dialog.Description style={{ marginTop: '12px', marginBottom: '20px' }}>
            Selecione uma aplicação para vincular a este serviço.
          </Dialog.Description>

          {appsListLoading ? (
            <Flex align='center' gap='3' style={{ padding: '20px 0' }}>
              <ReloadIcon className={styles.buttonSpinner} />
              <Text>Carregando aplicações disponíveis...</Text>
            </Flex>
          ) : availableApps.length === 0 ? (
            <Box style={{ padding: '20px 0' }}>
              <Text size='3' color='gray'>
                Não há aplicações disponíveis para vincular ou todas já estão vinculadas.
              </Text>
            </Box>
          ) : (
            <Box mb='4'>
              <Select.Root value={selectedApp} onValueChange={setSelectedApp}>
                <Select.Trigger style={{ width: '100%' }} placeholder='Selecione uma aplicação'>
                  {selectedApp ? selectedApp.replace(/^\d+-/, '') : 'Selecione uma aplicação'}
                </Select.Trigger>
                <Select.Content>
                  {availableApps.map((appName) => (
                    <Select.Item key={appName} value={appName}>
                      {appName.replace(/^\d+-/, '')}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>
          )}

          <Flex gap='3' mt='4' justify='end'>
            <Dialog.Close>
              <Button variant='soft' color='gray' onClick={cancelLinkApp}>
                Cancelar
              </Button>
            </Dialog.Close>
            <Button
              variant='solid'
              color='blue'
              onClick={confirmLinkApp}
              disabled={linkLoading || !selectedApp || availableApps.length === 0}
            >
              {linkLoading ? <ReloadIcon className={styles.buttonSpinner} /> : <Link1Icon />}
              {linkLoading ? 'Vinculando...' : 'Vincular'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
