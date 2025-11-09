import * as Accordion from '@radix-ui/react-accordion';
import {
  ActivityLogIcon,
  ArrowRightIcon,
  CheckCircledIcon,
  ChevronDownIcon,
  ComponentInstanceIcon,
  CrossCircledIcon,
  CubeIcon,
  DashboardIcon,
  ExclamationTriangleIcon,
  GearIcon,
  GlobeIcon,
  InfoCircledIcon,
  LayersIcon,
  LightningBoltIcon,
  PlusIcon,
  RocketIcon,
} from '@radix-ui/react-icons';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Progress,
  Separator,
  Text,
} from '@radix-ui/themes';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';
import { useEffect, useState } from 'react';

import { NavBar } from '@/components';
import { api } from '@/lib';

import styles from './home.module.css';

interface HomePageProps {
  session: Session;
}

interface UsedResourcesData {
  apps_used: number;
  services_used: number;
  networks_used: number;
}

interface DetailedResourcesData {
  apps: Array<{
    name: string;
  }>;
  services: Array<{
    name: string;
    type?: string;
  }>;
  networks: Array<{
    name: string;
  }>;
}

interface QuotaInfo {
  apps_quota: number;
  networks_quota: number;
  services_quota: number;
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

interface SystemInfo {
  version: string;
  dokkuVersion: string;
  dokkuStatus: boolean;
}

export function HomePage(props: HomePageProps) {
  const router = useRouter();
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

    // Fetch all data in parallel
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
      // Fetch detailed information for each resource type
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

      // Process apps data
      let appsData: any[] = [];
      if (appsResponse.status === 200 && appsResponse.data.success) {
        const appsResult = appsResponse.data.result;
        appsData = Object.keys(appsResult).map((appName) => ({
          name: appName.replace(/^\d+-/, ''),
        }));
      }

      // Process services data
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

      // Process networks data
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

  const getResourceUsagePercentage = (used: number | undefined, quota: number) => {
    return quota > 0 ? Math.min(((used || 0) / quota) * 100, 100) : 0;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'red';
    if (percentage >= 70) return 'orange';
    return 'green';
  };

  const userName = props.session?.user?.name || 'Usuário';
  const userImage = !userName.toLowerCase().startsWith('takeover')
    ? props.session?.user?.image
    : undefined;

  // Component for skeleton loading state
  const SkeletonStatItem = () => (
    <Box className={`${styles.statItem} ${styles.skeleton}`} data-loading='true'>
      <Flex align='center' gap='3' mb='3'>
        <div className={styles.iconContainer} style={{ backgroundColor: 'var(--gray-3)' }}>
          <div
            className={styles.skeletonElement}
            style={{ width: '16px', height: '16px', borderRadius: '2px' }}
          />
        </div>
        <Box>
          <div
            className={styles.skeletonElement}
            style={{ width: '60px', height: '12px', borderRadius: '4px', marginBottom: '4px' }}
          />
          <div
            className={styles.skeletonElement}
            style={{ width: '24px', height: '20px', borderRadius: '6px' }}
          />
        </Box>
      </Flex>
      <div
        className={styles.skeletonElement}
        style={{ width: '100%', height: '4px', borderRadius: '2px' }}
      />
    </Box>
  );

  // Component for resource card skeleton loading
  const SkeletonResourceCard = ({ type }: { type: 'apps' | 'services' | 'networks' }) => (
    <Box className={`${styles.resourceCard} ${styles.skeleton}`} data-loading='true'>
      <Flex align='center' justify='between' mb='3'>
        <Flex align='center' gap='3'>
          <div
            className={styles.resourceIcon}
            data-type={type}
            style={{ background: 'var(--gray-3)', border: '1px solid var(--gray-4)' }}
          >
            <div
              className={styles.skeletonElement}
              style={{ width: '18px', height: '18px', borderRadius: '3px' }}
            />
          </div>
          <Box>
            <div
              className={styles.skeletonElement}
              style={{ width: '80px', height: '16px', borderRadius: '4px', marginBottom: '6px' }}
            />
            <div
              className={styles.skeletonElement}
              style={{ width: '60px', height: '12px', borderRadius: '4px' }}
            />
          </Box>
        </Flex>
        <div
          className={styles.skeletonElement}
          style={{ width: '16px', height: '16px', borderRadius: '2px' }}
        />
      </Flex>

      <Box className={styles.resourceList}>
        {[1, 2, 3].map((item) => (
          <Flex key={item} align='center' gap='2' className={styles.resourceListItem}>
            <div
              className={styles.skeletonElement}
              style={{ width: '6px', height: '6px', borderRadius: '50%' }}
            />
            <div
              className={styles.skeletonElement}
              style={{ width: '80px', height: '12px', borderRadius: '4px' }}
            />
          </Flex>
        ))}
      </Box>
    </Box>
  );

  return (
    <>
      <NavBar session={props.session} />

      <main className={styles.root}>
        {error && (
          <Card className={styles.errorCard} style={{ marginBottom: '24px' }}>
            <Flex align='center' gap='3'>
              <ExclamationTriangleIcon color='red' />
              <Text size='3' color='red'>
                {error}
              </Text>
            </Flex>
          </Card>
        )}

        <Flex direction='column' gap='4' className={styles.mainContainer}>
          {/* Welcome Header with Quick Actions */}
          <Box className={styles.welcomeSection}>
            <Flex align='center' justify='between' className={styles.welcomeHeader}>
              <Flex align='center' gap='4'>
                <Avatar
                  size='6'
                  src={userImage || undefined}
                  fallback={userName.charAt(0).toUpperCase()}
                  radius='full'
                  className={styles.userAvatar}
                />
                <Box>
                  <Heading size='8' weight='bold' className={styles.welcomeTitle}>
                    Bem-vindo de volta, {userName.split(' ')[0]}!
                  </Heading>
                  <Text size='4' className={styles.welcomeSubtitle}>
                    Aqui está um resumo dos seus recursos no Dokku
                  </Text>
                </Box>
              </Flex>

              {/* Quick Actions moved to welcome section */}
              <Flex gap='2' className={styles.quickActionsInline}>
                <Button
                  size='3'
                  className={styles.quickActionButtonGreen}
                  onClick={() => router.push('/apps/create')}
                >
                  <PlusIcon />
                  Novo App
                </Button>
                <Button
                  size='3'
                  variant='soft'
                  className={styles.quickActionButton}
                  onClick={() => router.push('/services/create/')}
                >
                  <CubeIcon />
                  Novo Serviço
                </Button>
                <Button
                  size='3'
                  variant='soft'
                  className={styles.quickActionButton}
                  onClick={() => router.push('/networks')}
                >
                  <GlobeIcon />
                  Criar Rede
                </Button>
              </Flex>
            </Flex>
          </Box>

          <Separator size='4' style={{ margin: '16px 0', opacity: 0.2 }} />

          {/* Stats Overview */}
          <Box>
            <Heading size='5' weight='medium' mb='3' style={{ color: 'var(--gray-12)' }}>
              Visão Geral dos Recursos
            </Heading>
            <Grid columns={{ initial: '1', sm: '3' }} gap='4' className={styles.statsGrid}>
              {/* Apps Stats */}
              {loadingState.apps ? (
                <SkeletonStatItem />
              ) : (
                <Box className={styles.statItem} onClick={() => router.push('/apps')}>
                  <Flex align='center' gap='3' mb='3'>
                    <div
                      className={styles.iconContainer}
                      style={{ backgroundColor: 'var(--blue-3)' }}
                    >
                      <RocketIcon color='var(--blue-11)' />
                    </div>
                    <Box>
                      <Text size='3' weight='medium' color='gray'>
                        Aplicativos
                      </Text>
                      <Heading size='6' weight='bold'>
                        {stats.apps.total}
                      </Heading>
                    </Box>
                    <ArrowRightIcon className={styles.arrowIcon} />
                  </Flex>
                  <Text size='2' color='gray' mb='2'>
                    Aplicativos criados
                  </Text>
                  {stats.quota && (
                    <Box>
                      <Flex justify='between' mb='1'>
                        <Text size='1' color='gray'>
                          Uso da cota
                        </Text>
                        <Text size='1' color='gray'>
                          {stats.apps.total}/{stats.quota.apps_quota}
                        </Text>
                      </Flex>
                      <Progress
                        value={getResourceUsagePercentage(stats.apps.total, stats.quota.apps_quota)}
                        color={getUsageColor(
                          getResourceUsagePercentage(stats.apps.total, stats.quota.apps_quota)
                        )}
                      />
                    </Box>
                  )}
                </Box>
              )}

              {/* Services Stats */}
              {loadingState.services ? (
                <SkeletonStatItem />
              ) : (
                <Box className={styles.statItem} onClick={() => router.push('/services')}>
                  <Flex align='center' gap='3' mb='3'>
                    <div
                      className={styles.iconContainer}
                      style={{ backgroundColor: 'var(--purple-3)' }}
                    >
                      <CubeIcon color='var(--purple-11)' />
                    </div>
                    <Box>
                      <Text size='3' weight='medium' color='gray'>
                        Serviços
                      </Text>
                      <Heading size='6' weight='bold'>
                        {stats.services.total}
                      </Heading>
                    </Box>
                    <ArrowRightIcon className={styles.arrowIcon} />
                  </Flex>
                  <Text size='2' color='gray' mb='2'>
                    Serviços ativos
                  </Text>
                  {stats.quota && (
                    <Box>
                      <Flex justify='between' mb='1'>
                        <Text size='1' color='gray'>
                          Uso da cota
                        </Text>
                        <Text size='1' color='gray'>
                          {stats.services.total}/{stats.quota.services_quota}
                        </Text>
                      </Flex>
                      <Progress
                        value={getResourceUsagePercentage(
                          stats.services.total,
                          stats.quota.services_quota
                        )}
                        color={getUsageColor(
                          getResourceUsagePercentage(
                            stats.services.total,
                            stats.quota.services_quota
                          )
                        )}
                      />
                    </Box>
                  )}
                </Box>
              )}

              {/* Networks Stats */}
              {loadingState.networks ? (
                <SkeletonStatItem />
              ) : (
                <Box className={styles.statItem} onClick={() => router.push('/networks')}>
                  <Flex align='center' gap='3' mb='3'>
                    <div
                      className={styles.iconContainer}
                      style={{ backgroundColor: 'var(--green-3)' }}
                    >
                      <GlobeIcon color='var(--green-11)' />
                    </div>
                    <Box>
                      <Text size='3' weight='medium' color='gray'>
                        Redes
                      </Text>
                      <Heading size='6' weight='bold'>
                        {stats.networks.total}
                      </Heading>
                    </Box>
                    <ArrowRightIcon className={styles.arrowIcon} />
                  </Flex>
                  <Text size='2' color='gray' mb='2'>
                    Redes configuradas
                  </Text>
                  {stats.quota && (
                    <Box>
                      <Flex justify='between' mb='1'>
                        <Text size='1' color='gray'>
                          Uso da cota
                        </Text>
                        <Text size='1' color='gray'>
                          {stats.networks.total}/{stats.quota.networks_quota}
                        </Text>
                      </Flex>
                      <Progress
                        value={getResourceUsagePercentage(
                          stats.networks.total,
                          stats.quota.networks_quota
                        )}
                        color={getUsageColor(
                          getResourceUsagePercentage(
                            stats.networks.total,
                            stats.quota.networks_quota
                          )
                        )}
                      />
                    </Box>
                  )}
                </Box>
              )}
            </Grid>
          </Box>

          {/* System Status & Activity */}
          {(loadingState.system || systemInfo) && (
            <>
              <Separator size='4' style={{ margin: '20px 0', opacity: 0.2 }} />
              <Box>
                <Flex align='center' justify='between' mb='5'>
                  <Heading
                    size='5'
                    weight='medium'
                    style={{ color: 'var(--gray-12)' }}
                    className={styles.mainSystemTitle}
                  >
                    <DashboardIcon style={{ marginRight: '8px' }} /> Status do Sistema
                  </Heading>
                  <Badge
                    color={
                      systemInfo && systemInfo.dokkuStatus
                        ? 'green'
                        : loadingState.system
                          ? 'gray'
                          : 'orange'
                    }
                    variant='soft'
                    size='2'
                    className={styles.systemStatusBadge}
                  >
                    {loadingState.system
                      ? 'Verificando...'
                      : systemInfo && systemInfo.dokkuStatus
                        ? 'Sistema Operacional'
                        : 'Sistema Indisponível'}
                  </Badge>
                </Flex>

                {loadingState.apps ||
                loadingState.networks ||
                loadingState.services ||
                loadingState.system ? (
                  <Box className={styles.modernStatusLoading}>
                    <Flex align='center' justify='center' direction='column' gap='4'>
                      <div className={styles.modernSpinner} />
                      <Text size='3' weight='medium' color='gray'>
                        Sincronizando dados do sistema...
                      </Text>
                    </Flex>
                  </Box>
                ) : (
                  <Box className={styles.modernStatusContainer}>
                    {/* System Status Header */}
                    {systemInfo && (
                      <Flex align='center' justify='between' mb='4'>
                        <Flex align='center' gap='3'>
                          <div
                            className={styles.healthIcon}
                            data-status={systemInfo.dokkuStatus ? 'healthy' : 'error'}
                          >
                            {systemInfo.dokkuStatus ? (
                              <CheckCircledIcon width='20' height='20' />
                            ) : (
                              <CrossCircledIcon width='20' height='20' />
                            )}
                          </div>
                          <Box>
                            <Flex align='center' gap='2' mb='1'>
                              <DashboardIcon
                                width='16'
                                height='16'
                                style={{ color: 'var(--gray-11)' }}
                                className={styles.systemTitleIcon}
                              />
                              <Text size='5' weight='bold' className={styles.systemTitle}>
                                Status do Sistema
                              </Text>
                            </Flex>
                            <Flex align='center' gap='2'>
                              <InfoCircledIcon
                                width='14'
                                height='14'
                                style={{ color: 'var(--gray-9)' }}
                                className={styles.systemSubtitleIcon}
                              />
                              <Text size='2' className={styles.systemSubtitle}>
                                {systemInfo.dokkuVersion} • API v{systemInfo.version}
                              </Text>
                            </Flex>
                          </Box>
                        </Flex>
                        <Badge
                          color={systemInfo.dokkuStatus ? 'green' : 'red'}
                          variant='solid'
                          size='3'
                          className={styles.statusBadge}
                        >
                          <Flex align='center' gap='1'>
                            {systemInfo.dokkuStatus ? (
                              <LightningBoltIcon width='12' height='12' />
                            ) : (
                              <CrossCircledIcon width='12' height='12' />
                            )}
                            {systemInfo.dokkuStatus ? 'Operacional' : 'Offline'}
                          </Flex>
                        </Badge>
                      </Flex>
                    )}

                    <Separator size='4' mb='4' />

                    {/* Resources Overview Accordion */}
                    <Accordion.Root type='single' collapsible defaultValue='resources'>
                      <Accordion.Item value='resources'>
                        <Accordion.Header>
                          <Accordion.Trigger className={styles.accordionTrigger}>
                            <Flex align='center' gap='3'>
                              <LayersIcon
                                width='18'
                                height='18'
                                style={{ color: 'var(--blue-9)' }}
                                className={styles.accordionHeaderIcon}
                              />
                              <Text size='4' weight='bold' className={styles.accordionHeaderText}>
                                Recursos da Plataforma
                              </Text>
                            </Flex>
                            <ChevronDownIcon
                              width='18'
                              height='18'
                              style={{ color: 'var(--gray-9)' }}
                              className={styles.accordionChevronIcon}
                            />
                          </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content className={styles.accordionContent}>
                          <Grid
                            columns={{ initial: '1', sm: '3' }}
                            gap='4'
                            className={styles.resourcesGrid}
                          >
                            {/* Apps Card */}
                            {loadingState.apps ||
                            stats.apps.total === undefined ||
                            detailedResources.apps.length < stats.apps.total ? (
                              <SkeletonResourceCard type='apps' />
                            ) : (
                              <Box
                                className={styles.resourceCard}
                                onClick={() => router.push('/apps')}
                              >
                                <Flex align='center' justify='between' mb='3'>
                                  <Flex align='center' gap='3'>
                                    <div className={styles.resourceIcon} data-type='apps'>
                                      <RocketIcon width='18' height='18' />
                                    </div>
                                    <Box>
                                      <Flex align='center' gap='2' mb='1'>
                                        <Text
                                          size='3'
                                          weight='bold'
                                          className={styles.resourceTitle}
                                        >
                                          Aplicativos
                                        </Text>
                                      </Flex>
                                      <Flex align='center' gap='2'>
                                        <LayersIcon
                                          width='12'
                                          height='12'
                                          style={{ color: 'var(--gray-9)' }}
                                        />
                                        <Text size='1' className={styles.resourceCount}>
                                          {detailedResources.apps.length} total
                                        </Text>
                                      </Flex>
                                    </Box>
                                  </Flex>
                                  <ArrowRightIcon
                                    width='16'
                                    height='16'
                                    style={{ color: 'var(--gray-9)' }}
                                  />
                                </Flex>

                                <Box className={styles.resourceList}>
                                  {detailedResources.apps.length > 0 ? (
                                    <>
                                      {detailedResources.apps.slice(0, 3).map((app, idx) => (
                                        <Flex
                                          key={idx}
                                          align='center'
                                          gap='2'
                                          className={styles.resourceListItem}
                                        >
                                          <div
                                            className={styles.statusIndicator}
                                            data-status='active'
                                          />
                                          <Text size='2' className={styles.resourceName}>
                                            {app.name}
                                          </Text>
                                        </Flex>
                                      ))}
                                      {detailedResources.apps.length > 3 && (
                                        <Text size='1' className={styles.moreItems}>
                                          +{detailedResources.apps.length - 3} mais
                                        </Text>
                                      )}
                                    </>
                                  ) : (
                                    <Flex
                                      direction='column'
                                      align='center'
                                      justify='center'
                                      gap='2'
                                      py='4'
                                      style={{ opacity: 0.6 }}
                                    >
                                      <Box
                                        style={{
                                          width: '48px',
                                          height: '48px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          borderRadius: '50%',
                                          backgroundColor: 'var(--gray-3)',
                                        }}
                                      >
                                        <CrossCircledIcon
                                          width='24'
                                          height='24'
                                          style={{ color: 'var(--gray-8)' }}
                                        />
                                      </Box>
                                      <Text
                                        size='2'
                                        weight='medium'
                                        style={{ color: 'var(--gray-10)', textAlign: 'center' }}
                                      >
                                        Nenhum aplicativo criado ainda
                                      </Text>
                                    </Flex>
                                  )}
                                </Box>
                              </Box>
                            )}

                            {/* Services Card */}
                            {loadingState.services ||
                            stats.services.total === undefined ||
                            detailedResources.services.length < stats.services.total ? (
                              <SkeletonResourceCard type='services' />
                            ) : (
                              <Box
                                className={styles.resourceCard}
                                onClick={() => router.push('/services')}
                              >
                                <Flex align='center' justify='between' mb='3'>
                                  <Flex align='center' gap='3'>
                                    <div className={styles.resourceIcon} data-type='services'>
                                      <GearIcon width='18' height='18' />
                                    </div>
                                    <Box>
                                      <Flex align='center' gap='2' mb='1'>
                                        <Text
                                          size='3'
                                          weight='bold'
                                          className={styles.resourceTitle}
                                        >
                                          Serviços
                                        </Text>
                                      </Flex>
                                      <Flex align='center' gap='2'>
                                        <ComponentInstanceIcon
                                          width='12'
                                          height='12'
                                          style={{ color: 'var(--gray-9)' }}
                                        />
                                        <Text size='1' className={styles.resourceCount}>
                                          {detailedResources.services.length} total
                                        </Text>
                                      </Flex>
                                    </Box>
                                  </Flex>
                                  <ArrowRightIcon
                                    width='16'
                                    height='16'
                                    style={{ color: 'var(--gray-9)' }}
                                  />
                                </Flex>

                                <Box className={styles.resourceList}>
                                  {detailedResources.services.length > 0 ? (
                                    <>
                                      {detailedResources.services
                                        .slice(0, 3)
                                        .map((service, idx) => (
                                          <Flex
                                            key={idx}
                                            align='center'
                                            gap='2'
                                            className={styles.resourceListItem}
                                          >
                                            <div
                                              className={styles.statusIndicator}
                                              data-status='active'
                                            />
                                            <Text size='2' className={styles.resourceName}>
                                              {service.name}
                                            </Text>
                                            <Badge
                                              color='purple'
                                              variant='soft'
                                              size='1'
                                              className={styles.serviceTypeBadge}
                                            >
                                              {service.type}
                                            </Badge>
                                          </Flex>
                                        ))}
                                      {detailedResources.services.length > 3 && (
                                        <Text size='1' className={styles.moreItems}>
                                          +{detailedResources.services.length - 3} mais
                                        </Text>
                                      )}
                                    </>
                                  ) : (
                                    <Flex
                                      direction='column'
                                      align='center'
                                      justify='center'
                                      gap='2'
                                      py='4'
                                      style={{ opacity: 0.6 }}
                                    >
                                      <Box
                                        style={{
                                          width: '48px',
                                          height: '48px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          borderRadius: '50%',
                                          backgroundColor: 'var(--gray-3)',
                                        }}
                                      >
                                        <CrossCircledIcon
                                          width='24'
                                          height='24'
                                          style={{ color: 'var(--gray-8)' }}
                                        />
                                      </Box>
                                      <Text
                                        size='2'
                                        weight='medium'
                                        style={{ color: 'var(--gray-10)', textAlign: 'center' }}
                                      >
                                        Nenhum serviço criado ainda
                                      </Text>
                                    </Flex>
                                  )}
                                </Box>
                              </Box>
                            )}

                            {/* Networks Card */}
                            {loadingState.networks ||
                            stats.networks.total === undefined ||
                            detailedResources.networks.length < stats.networks.total ? (
                              <SkeletonResourceCard type='networks' />
                            ) : (
                              <Box
                                className={styles.resourceCard}
                                onClick={() => router.push('/networks')}
                              >
                                <Flex align='center' justify='between' mb='3'>
                                  <Flex align='center' gap='3'>
                                    <div className={styles.resourceIcon} data-type='networks'>
                                      <GlobeIcon width='18' height='18' />
                                    </div>
                                    <Box>
                                      <Flex align='center' gap='2' mb='1'>
                                        <Text
                                          size='3'
                                          weight='bold'
                                          className={styles.resourceTitle}
                                        >
                                          Redes
                                        </Text>
                                      </Flex>
                                      <Flex align='center' gap='2'>
                                        <ActivityLogIcon
                                          width='12'
                                          height='12'
                                          style={{ color: 'var(--gray-9)' }}
                                        />
                                        <Text size='1' className={styles.resourceCount}>
                                          {detailedResources.networks.length} total
                                        </Text>
                                      </Flex>
                                    </Box>
                                  </Flex>
                                  <ArrowRightIcon
                                    width='16'
                                    height='16'
                                    style={{ color: 'var(--gray-9)' }}
                                  />
                                </Flex>

                                <Box className={styles.resourceList}>
                                  {detailedResources.networks.length > 0 ? (
                                    <>
                                      {detailedResources.networks
                                        .slice(0, 3)
                                        .map((network, idx) => (
                                          <Flex
                                            key={idx}
                                            align='center'
                                            gap='2'
                                            className={styles.resourceListItem}
                                          >
                                            <div
                                              className={styles.statusIndicator}
                                              data-status='active'
                                            />
                                            <Text size='2' className={styles.resourceName}>
                                              {network.name}
                                            </Text>
                                          </Flex>
                                        ))}
                                      {detailedResources.networks.length > 3 && (
                                        <Text size='1' className={styles.moreItems}>
                                          +{detailedResources.networks.length - 3} mais
                                        </Text>
                                      )}
                                    </>
                                  ) : (
                                    <Flex
                                      direction='column'
                                      align='center'
                                      justify='center'
                                      gap='2'
                                      py='4'
                                      style={{ opacity: 0.6 }}
                                    >
                                      <Box
                                        style={{
                                          width: '48px',
                                          height: '48px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          borderRadius: '50%',
                                          backgroundColor: 'var(--gray-3)',
                                        }}
                                      >
                                        <CrossCircledIcon
                                          width='24'
                                          height='24'
                                          style={{ color: 'var(--gray-8)' }}
                                        />
                                      </Box>
                                      <Text
                                        size='2'
                                        weight='medium'
                                        style={{ color: 'var(--gray-10)', textAlign: 'center' }}
                                      >
                                        Nenhuma rede criada ainda
                                      </Text>
                                    </Flex>
                                  )}
                                </Box>
                              </Box>
                            )}
                          </Grid>
                        </Accordion.Content>
                      </Accordion.Item>
                    </Accordion.Root>

                    <Separator size='4' my='4' />

                    {/* Platform Information Accordion */}
                    {systemInfo && (
                      <Accordion.Root type='single' collapsible>
                        <Accordion.Item value='platform-info'>
                          <Accordion.Header>
                            <Accordion.Trigger className={styles.accordionTrigger}>
                              <Flex align='center' gap='3'>
                                <InfoCircledIcon
                                  width='18'
                                  height='18'
                                  style={{ color: 'var(--blue-9)' }}
                                  className={styles.accordionHeaderIcon}
                                />
                                <Text size='4' weight='bold' className={styles.accordionHeaderText}>
                                  Informações da Plataforma
                                </Text>
                              </Flex>
                              <ChevronDownIcon
                                width='18'
                                height='18'
                                style={{ color: 'var(--gray-9)' }}
                                className={styles.accordionChevronIcon}
                              />
                            </Accordion.Trigger>
                          </Accordion.Header>
                          <Accordion.Content className={styles.accordionContent}>
                            <Flex direction='column' gap='3'>
                              <Flex
                                align='center'
                                justify='between'
                                p='3'
                                className={styles.platformInfoCard}
                              >
                                <Flex align='center' gap='3'>
                                  <Box
                                    className={styles.platformIcon}
                                    style={{
                                      background:
                                        'linear-gradient(135deg, var(--blue-4), var(--purple-4))',
                                      color: 'var(--blue-11)',
                                    }}
                                  >
                                    <DashboardIcon width='18' height='18' />
                                  </Box>
                                  <Flex direction={'column'}>
                                    <Text
                                      size='3'
                                      weight='bold'
                                      style={{ color: 'var(--gray-12)' }}
                                    >
                                      Dokku Platform
                                    </Text>
                                    <Text size='2' style={{ color: 'var(--gray-10)' }}>
                                      {systemInfo.dokkuVersion}
                                    </Text>
                                  </Flex>
                                </Flex>
                                <Badge
                                  color='blue'
                                  variant='soft'
                                  size='2'
                                  className={styles.platformBadge}
                                >
                                  Platform as a Service
                                </Badge>
                              </Flex>

                              <Flex
                                align='center'
                                justify='between'
                                p='3'
                                className={styles.platformInfoCard}
                              >
                                <Flex align='center' gap='3'>
                                  <Box
                                    className={styles.platformIcon}
                                    style={{
                                      background:
                                        'linear-gradient(135deg, var(--green-4), var(--blue-4))',
                                      color: 'var(--green-11)',
                                    }}
                                  >
                                    <GearIcon width='18' height='18' />
                                  </Box>
                                  <Flex direction={'column'}>
                                    <Text
                                      size='3'
                                      weight='bold'
                                      style={{ color: 'var(--gray-12)' }}
                                    >
                                      Dokku API
                                    </Text>
                                    <Text size='2' style={{ color: 'var(--gray-10)' }}>
                                      {systemInfo.version}
                                    </Text>
                                  </Flex>
                                </Flex>
                                <Badge
                                  color='green'
                                  variant='soft'
                                  size='2'
                                  className={styles.platformBadge}
                                >
                                  Server-side
                                </Badge>
                              </Flex>
                            </Flex>
                          </Accordion.Content>
                        </Accordion.Item>
                      </Accordion.Root>
                    )}
                  </Box>
                )}
              </Box>
            </>
          )}
        </Flex>
      </main>
    </>
  );
}
