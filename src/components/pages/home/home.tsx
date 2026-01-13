import { Flex, Separator } from '@radix-ui/themes';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';
import { useEffect, useState } from 'react';

import { NavBar } from '@/components';
import { usePageTranslation } from '@/i18n/utils';
import { api } from '@/lib';

import {
  ErrorBanner,
  StatsOverviewSection,
  SystemStatusSection,
  WelcomeSection,
} from './components';
import styles from './home.module.css';
import type { DetailedResourcesData, QuotaInfo, SystemInfo } from './types';

interface HomePageProps {
  session: Session;
}

interface UsedResourcesData {
  apps_used: number;
  services_used: number;
  networks_used: number;
}

interface DashboardStats {
  apps: {
    total: number | undefined;
  };
  networks: {
    total: number | undefined;
  };
  services: {
    total: number | undefined;
  };
  quota: QuotaInfo | null;
}

export function HomePage(props: HomePageProps) {
  const router = useRouter();
  const { t } = usePageTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    apps: { total: undefined },
    networks: { total: undefined },
    services: { total: undefined },
    quota: null,
  });
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [detailedResources, setDetailedResources] = useState<DetailedResourcesData>({
    apps: [],
    services: [],
    networks: [],
  });
  const [loadingState, setLoadingState] = useState({
    apps: true,
    networks: true,
    services: true,
    quota: true,
    system: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    setError(null);

    fetchQuotaData();
    fetchUsedResourcesData();
    fetchSystemInfo();
    fetchDetailedResources();
  };

  const fetchSystemInfo = async () => {
    try {
      const response = await api.get('/api/');
      if (response.status === 200) {
        setSystemInfo({
          version: response.data.version,
          dokkuVersion: response.data.dokku_version,
          dokkuStatus: response.data.dokku_status,
        });
      }
    } catch (error) {
      console.error('Error fetching system info:', error);
    } finally {
      setLoadingState((prev) => ({ ...prev, system: false }));
    }
  };

  const fetchDetailedResources = async () => {
    try {
      const [appsResponse, servicesResponse, networksResponse] = await Promise.all([
        api
          .post('/api/apps/list/', {}, { params: { return_info: false } })
          .catch(() => ({ status: 500, data: { success: false, result: {} } })),
        api
          .post('/api/databases/list/', {}, { params: { return_info: false } })
          .catch(() => ({ status: 500, data: { success: false, result: {} } })),
        api
          .post('/api/networks/list/', {}, { params: { return_info: false } })
          .catch(() => ({ status: 500, data: { success: false, result: {} } })),
      ]);

      let appsData: any[] = [];
      if (appsResponse.status === 200 && appsResponse.data.success) {
        const appsResult = appsResponse.data.result;
        appsData = Object.keys(appsResult).map((appName) => ({
          name: appName.replace(/^\d+-/, ''),
        }));
      }

      let servicesData: any[] = [];
      if (servicesResponse.status === 200 && servicesResponse.data.success) {
        const servicesResult = servicesResponse.data.result;
        servicesData = Object.entries(servicesResult).flatMap(
          ([pluginType, services]: [string, any]) =>
            Object.keys(services).map((serviceName) => ({
              name: serviceName.replace(/^\d+_/, ''),
              type: pluginType,
            }))
        );
      }

      let networksData: any[] = [];
      if (networksResponse.status === 200 && networksResponse.data.success) {
        const networksResult = networksResponse.data.result;
        networksData = Object.keys(networksResult).map((networkName) => ({
          name: networkName,
        }));
      }

      const detailedData = {
        apps: appsData,
        services: servicesData,
        networks: networksData,
      };

      setDetailedResources(detailedData);
    } catch (error) {
      console.error('Error fetching detailed resources:', error);
    }
  };

  const fetchQuotaData = async () => {
    try {
      const response = await api.post('/api/quota/');
      if (response.status === 200) {
        setStats((prev) => ({ ...prev, quota: response.data }));
      }
    } catch (error) {
      console.error('Error fetching quota:', error);
    } finally {
      setLoadingState((prev) => ({ ...prev, quota: false }));
    }
  };

  const fetchUsedResourcesData = async () => {
    try {
      const response = await api.post('/api/quota/used/');
      if (response.status === 200) {
        const usedData: UsedResourcesData = response.data;

        const newStats = {
          apps: { total: usedData.apps_used || 0 },
          networks: { total: usedData.networks_used || 0 },
          services: { total: usedData.services_used || 0 },
        };

        setStats((prev) => {
          const updatedStats = { ...prev, ...newStats };
          return updatedStats;
        });
      }
    } catch (error) {
      console.error('Error fetching used resources:', error);
    } finally {
      // Mark all loading states as complete since we get all data in one request
      setLoadingState((prev) => ({
        ...prev,
        apps: false,
        networks: false,
        services: false,
      }));
    }
  };

  const userName = props.session?.user?.name || t('user.fallbackName');
  const userImage = !userName.toLowerCase().startsWith('takeover')
    ? (props.session?.user?.image ?? undefined)
    : undefined;

  return (
    <>
      <NavBar session={props.session} />

      <main className={styles.root}>
        <ErrorBanner error={error} />

        <Flex direction='column' gap='4' className={styles.mainContainer}>
          {/* Welcome Header with Quick Actions */}
          <WelcomeSection
            userName={userName}
            userImage={userImage}
            onCreateApp={() => router.push('/apps/create')}
            onCreateService={() => router.push('/services/create/')}
            onCreateNetwork={() => router.push('/networks')}
          />

          <Separator size='4' style={{ margin: '16px 0', opacity: 0.2 }} />

          {/* Stats Overview */}
          <StatsOverviewSection
            appsTotal={stats.apps.total}
            servicesTotal={stats.services.total}
            networksTotal={stats.networks.total}
            quota={stats.quota}
            loading={{
              apps: loadingState.apps,
              services: loadingState.services,
              networks: loadingState.networks,
            }}
            onAppsClick={() => router.push('/apps')}
            onServicesClick={() => router.push('/services')}
            onNetworksClick={() => router.push('/networks')}
          />

          {/* System Status & Activity */}
          <SystemStatusSection
            systemInfo={systemInfo}
            loading={loadingState}
            appsTotal={stats.apps.total}
            servicesTotal={stats.services.total}
            networksTotal={stats.networks.total}
            detailed={detailedResources}
            onAppsClick={() => router.push('/apps')}
            onServicesClick={() => router.push('/services')}
            onNetworksClick={() => router.push('/networks')}
          />
        </Flex>
      </main>
    </>
  );
}
