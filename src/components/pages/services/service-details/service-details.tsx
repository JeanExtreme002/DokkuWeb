import { ReloadIcon } from '@radix-ui/react-icons';
import { Button, Flex, Separator, Tabs, Text } from '@radix-ui/themes';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Image as CustomImage, NavBar } from '@/components';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { usePageTranslation } from '@/i18n/utils';
import {
  api,
  copyToClipboard,
  downloadTextFile,
  formatDatabaseType,
  formatServiceName,
  getServiceImage,
  processAnsiCodes,
} from '@/lib';

import {
  ConnectedAppsSection,
  DeleteServiceModal,
  ExportDatabaseModal,
  HeaderSection,
  LinkAppModal,
  LogsSection,
  OverviewSection,
  RestartConfirmModal,
  SecuritySection,
  ServiceControlsSection,
  StopConfirmModal,
  UnlinkAppModal,
} from './components';
import { formatVersion, useStatusInfo } from './helpers';
import styles from './service-details.module.css';
import { ServiceData } from './types';

export interface ServiceDetailsPageProps {
  pluginType: string;
  serviceName: string;
}

export function ServiceDetailsPage(props: ServiceDetailsPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = usePageTranslation();

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

  // Confirmation modals for service actions
  const [showStopConfirmModal, setShowStopConfirmModal] = useState(false);
  const [showRestartConfirmModal, setShowRestartConfirmModal] = useState(false);

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

  // Delete service modal states
  const [showDeleteServiceModal, setShowDeleteServiceModal] = useState(false);
  const [deleteServiceLoading, setDeleteServiceLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Export database modal states
  const [showExportDatabaseModal, setShowExportDatabaseModal] = useState(false);
  const [exportDatabaseLoading, setExportDatabaseLoading] = useState(false);
  const [exportConfirmText, setExportConfirmText] = useState('');

  const statusInfo = useStatusInfo(serviceData);
  const displayName = formatServiceName(props.serviceName);
  const serviceType = formatDatabaseType(props.pluginType);

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
            setError(t('services.s.errors.loadData'));
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
        router.push('/404');
        return;
      }
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

  const copyUri = async () => {
    if (serviceUri) {
      await copyToClipboard(serviceUri);
    }
  };

  const downloadLogs = () => {
    downloadTextFile(logs, `${props.serviceName}-logs.txt`);
  };

  const exportDatabase = async () => {
    setExportDatabaseLoading(true);
    try {
      const response = await api.post(
        `/api/databases/${props.pluginType}/${props.serviceName}/export/`
      );
      if (response.data?.success && response.data.result) {
        downloadTextFile(response.data.result, `${props.pluginType}-${props.serviceName}.sql`);
        setShowExportDatabaseModal(false);
        setExportConfirmText('');
      }
    } catch (error) {
      console.error('Error exporting database:', error);
    } finally {
      setExportDatabaseLoading(false);
    }
  };

  // Service control functions
  const startService = async () => {
    setStartLoading(true);
    try {
      await api.post(`/api/databases/${props.pluginType}/${props.serviceName}/start/`);
      setDataLoaded(false);
      await fetchServiceInfo();
    } catch (error: any) {
      console.error('Error starting service:', error);
      setErrors((prev) => ({
        ...prev,
        main: error.response?.data?.message || t('services.s.errors.startService'),
      }));
    } finally {
      setStartLoading(false);
    }
  };

  const stopService = async () => {
    setStopLoading(true);
    try {
      await api.post(`/api/databases/${props.pluginType}/${props.serviceName}/stop/`);
      setDataLoaded(false);
      await fetchServiceInfo();
      setShowStopConfirmModal(false);
    } catch (error: any) {
      console.error('Error stopping service:', error);
      setErrors((prev) => ({
        ...prev,
        main: error.response?.data?.message || t('services.s.errors.stopService'),
      }));
    } finally {
      setStopLoading(false);
    }
  };

  const restartService = async () => {
    setRestartLoading(true);
    try {
      await api.post(`/api/databases/${props.pluginType}/${props.serviceName}/restart/`);
      setDataLoaded(false);
      await fetchServiceInfo();
      setShowRestartConfirmModal(false);
    } catch (error: any) {
      console.error('Error restarting service:', error);
      setErrors((prev) => ({
        ...prev,
        main: error.response?.data?.message || t('services.s.errors.restartService'),
      }));
    } finally {
      setRestartLoading(false);
    }
  };

  // Delete service handler
  const deleteService = async () => {
    setDeleteServiceLoading(true);
    try {
      await api.delete(`/api/databases/${props.pluginType}/${props.serviceName}/`);
      router.push('/services');
    } catch (error: any) {
      console.error('Error deleting service:', error);
      setErrors((prev) => ({
        ...prev,
        main: error.response?.data?.message || t('services.s.errors.deleteService'),
      }));
    } finally {
      setDeleteServiceLoading(false);
      setShowDeleteServiceModal(false);
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

      setLinkedApps((prev) => prev.filter((app) => app !== appToUnlink));

      setShowUnlinkModal(false);
      setAppToUnlink(null);
    } catch (error: any) {
      console.error('Error unlinking app:', error);
      setErrors((prev) => ({
        ...prev,
        linkedApps: error.response?.data?.message || t('services.s.errors.unlinkApp'),
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
        linkedApps: t('services.s.errors.loadAppsList'),
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

      setLinkedApps((prev) => [...prev, selectedApp]);

      setShowLinkModal(false);
      setSelectedApp('');
      setAvailableApps([]);
    } catch (error: any) {
      console.error('Error linking app:', error);
      setErrors((prev) => ({
        ...prev,
        linkedApps: error.response?.data?.message || t('services.s.errors.linkApp'),
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

  return (
    <>
      <NavBar session={stableSession} />

      <main className={styles.root}>
        {mainLoading || uriLoading || linkedAppsLoading ? (
          <LoadingSpinner
            asCard={false}
            title={t('services.s.loading.title')}
            messages={[
              t('services.s.loading.messages.connecting'),
              t('services.s.loading.messages.fetchingServiceInfo'),
              t('services.s.loading.messages.loadingLinkedApps'),
              t('services.s.loading.messages.checkingStatus'),
              t('services.s.loading.messages.almostThere'),
            ]}
          />
        ) : errors.main ? (
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
              {errors.main}
            </Text>
            <Button
              size='3'
              onClick={() => window.location.reload()}
              style={{ marginTop: '16px', cursor: 'pointer' }}
            >
              <ReloadIcon /> {t('services.s.error.reloadButton')}
            </Button>
          </Flex>
        ) : (
          <Flex direction='column' gap='4' className={styles.mainContainer}>
            {/* Header */}
            <HeaderSection
              displayName={displayName}
              serviceType={serviceType}
              statusInfo={statusInfo}
              serviceImageSrc={getServiceImage(props.pluginType)}
              versionText={serviceData && formatVersion(serviceData.version)}
            />

            <Separator size='4' />

            {/* Service Control Buttons */}
            <ServiceControlsSection
              startService={startService}
              onStopClick={() => setShowStopConfirmModal(true)}
              onRestartClick={() => setShowRestartConfirmModal(true)}
              onLinkAppClick={handleLinkApp}
              startLoading={startLoading}
              stopLoading={stopLoading}
              restartLoading={restartLoading}
              serviceStatus={serviceData?.status}
            />

            {/* Tabs */}
            <Tabs.Root value={currentTab} onValueChange={setCurrentTab} className={styles.tabsRoot}>
              <Tabs.List size='2' className={styles.tabsList}>
                <Tabs.Trigger value='overview' className={styles.tabsTrigger}>
                  {t('services.s.tabs.overview')}
                </Tabs.Trigger>
                <Tabs.Trigger value='connected-apps' className={styles.tabsTrigger}>
                  {t('services.s.tabs.connectedApps')}
                </Tabs.Trigger>
                <Tabs.Trigger value='logs' className={styles.tabsTrigger}>
                  {t('services.s.tabs.logs')}
                </Tabs.Trigger>
                <Tabs.Trigger value='security' className={styles.tabsTrigger}>
                  {t('services.s.tabs.security')}
                </Tabs.Trigger>
              </Tabs.List>

              {/* Overview Tab */}
              <Tabs.Content value='overview' className={styles.tabsContent}>
                <OverviewSection
                  serviceData={serviceData}
                  statusText={statusInfo.text}
                  formatVersion={formatVersion}
                />
              </Tabs.Content>

              {/* Connected Apps Tab */}
              <Tabs.Content value='connected-apps' className={styles.tabsContent}>
                <ConnectedAppsSection
                  linkedApps={linkedApps}
                  errorMessage={errors.linkedApps}
                  isXsScreen={isXsScreen}
                  isSmScreen={isSmScreen}
                  isMdScreen={isMdScreen}
                  onUnlinkApp={handleUnlinkApp}
                />
              </Tabs.Content>

              {/* Logs Tab */}
              <Tabs.Content value='logs' className={styles.tabsContent}>
                <LogsSection
                  logs={logs}
                  errorMessage={errors.logs}
                  logsLoading={logsLoading}
                  logLinesLimit={logLinesLimit}
                  setLogLinesLimit={setLogLinesLimit}
                  refreshLogs={refreshLogs}
                  downloadLogs={downloadLogs}
                  processAnsiCodes={processAnsiCodes}
                />
              </Tabs.Content>

              {/* Security Tab */}
              <Tabs.Content value='security' className={styles.tabsContent}>
                <SecuritySection
                  errorMessage={errors.uri}
                  serviceUri={serviceUri}
                  showUri={showUri}
                  toggleShowUri={() => setShowUri(!showUri)}
                  copyUri={copyUri}
                  isXsScreen={isXsScreen}
                  isSmScreen={isSmScreen}
                  openDeleteModal={() => setShowDeleteServiceModal(true)}
                  openExportModal={() => setShowExportDatabaseModal(true)}
                />
              </Tabs.Content>
            </Tabs.Root>
          </Flex>
        )}
      </main>

      {/* Stop Service Confirmation Modal */}
      <StopConfirmModal
        open={showStopConfirmModal}
        onOpenChange={setShowStopConfirmModal}
        stopLoading={stopLoading}
        onCancel={() => setShowStopConfirmModal(false)}
        onConfirm={stopService}
      />

      {/* Restart Service Confirmation Modal */}
      <RestartConfirmModal
        open={showRestartConfirmModal}
        onOpenChange={setShowRestartConfirmModal}
        restartLoading={restartLoading}
        onCancel={() => setShowRestartConfirmModal(false)}
        onConfirm={restartService}
      />

      {/* Unlink App Confirmation Modal */}
      <UnlinkAppModal
        open={showUnlinkModal}
        onOpenChange={setShowUnlinkModal}
        appName={appToUnlink}
        unlinkLoading={unlinkLoading}
        onCancel={cancelUnlinkApp}
        onConfirm={confirmUnlinkApp}
      />

      {/* Link App Selection Modal */}
      <LinkAppModal
        open={showLinkModal}
        onOpenChange={setShowLinkModal}
        appsListLoading={appsListLoading}
        availableApps={availableApps}
        selectedApp={selectedApp}
        onSelectedAppChange={setSelectedApp}
        linkLoading={linkLoading}
        onCancel={cancelLinkApp}
        onConfirm={confirmLinkApp}
      />

      {/* Delete Service Confirmation Modal */}
      <DeleteServiceModal
        open={showDeleteServiceModal}
        onOpenChange={setShowDeleteServiceModal}
        serviceType={serviceType}
        displayName={displayName}
        deleteConfirmText={deleteConfirmText}
        onDeleteConfirmTextChange={setDeleteConfirmText}
        deleteLoading={deleteServiceLoading}
        onCancel={() => setShowDeleteServiceModal(false)}
        onConfirm={deleteService}
      />

      {/* Export Database Confirmation Modal */}
      <ExportDatabaseModal
        open={showExportDatabaseModal}
        onOpenChange={(open) => {
          setShowExportDatabaseModal(open);
          if (!open) {
            setExportConfirmText('');
          }
        }}
        exportConfirmText={exportConfirmText}
        onExportConfirmTextChange={setExportConfirmText}
        exportLoading={exportDatabaseLoading}
        onCancel={() => {
          setShowExportDatabaseModal(false);
          setExportConfirmText('');
        }}
        onConfirm={exportDatabase}
      />
    </>
  );
}
