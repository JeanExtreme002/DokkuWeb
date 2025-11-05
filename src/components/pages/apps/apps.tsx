import { Avatar, Box, Button, Card, Flex, Heading, Separator, Text } from '@radix-ui/themes';
import { Session } from 'next-auth';
import { useEffect, useState } from 'react';

import { NavBar } from '@/components';
import { DotIcon } from '@/components/shared/icons';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { api } from '@/lib';

import styles from './apps.module.css';

interface AppsPageProps {
  session: Session;
}

interface AppContainer {
  Id: string;
  Name: string;
  Image: string;
  State: {
    Running: boolean;
    Status: string;
    StartedAt: string;
  };
  Config: {
    Labels: {
      'com.dokku.app-name': string;
      'com.dokku.process-type': string;
    };
    Env: string[];
  };
  NetworkSettings: {
    IPAddress: string;
    Ports: Record<string, any>;
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
}

interface AppListItem {
  name: string;
  info: AppInfo | null;
  loading: boolean;
  error: string | null;
}

export function AppsPage(props: AppsPageProps) {
  const [appsList, setAppsList] = useState<AppListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  useEffect(() => {
    const fetchAppsList = async () => {
      const startTime = Date.now();
      try {
        setLoading(true);
        const response = await api.post('/api/apps/list/', {}, { params: { return_info: false } });

        if (response.status === 200 && response.data.success) {
          const appNames = Object.keys(response.data.result);

          const initialAppsList: AppListItem[] = appNames.map((name) => ({
            name,
            info: null,
            loading: true,
            error: null,
          }));

          setAppsList(initialAppsList);

          fetchAppsInfo(appNames);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching apps list:', error);
        setError('Erro ao carregar lista de aplicativos');
      }

      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);

      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
    };

    const fetchAppsInfo = async (appNames: string[]) => {
      // Carrega informações de cada app de forma assíncrona
      const promises = appNames.map(async (appName) => {
        try {
          const response = await api.post(`/api/apps/${appName}/info/`);

          if (response.status === 200 && response.data.success) {
            // Atualiza o estado do app específico
            setAppsList((prevList) =>
              prevList.map((app) =>
                app.name === appName ? { ...app, info: response.data.result, loading: false } : app
              )
            );
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          console.error(`Error fetching info for app ${appName}:`, error);
          // Atualiza o estado com erro para este app específico
          setAppsList((prevList) =>
            prevList.map((app) =>
              app.name === appName
                ? { ...app, loading: false, error: 'Erro ao carregar informações' }
                : app
            )
          );
        }
      });

      // Aguarda todas as requisições terminarem
      await Promise.allSettled(promises);
    };

    fetchAppsList();
  }, []);

  const getStatusInfo = (appInfo: AppInfo) => {
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
        return { color: 'var(--red-9)', text: 'Terminado', bgColor: 'var(--red-3)' };
      } else if (runningContainers.length < containers.length) {
        return { color: 'var(--amber-9)', text: 'Parcial', bgColor: 'var(--amber-3)' };
      } else {
        return { color: 'var(--green-9)', text: 'Ativo', bgColor: 'var(--green-3)' };
      }
    }
  };

  const getProcessInfo = (appInfo: AppInfo) => {
    if (appInfo.info_origin === 'report') {
      const reportData = appInfo.data as AppReportData;
      return {
        processType: 'web', // Padrão para report
        processCount: parseInt(reportData.processes) || 0,
      };
    } else {
      const containers = appInfo.data as AppContainer[];
      const firstContainer = containers[0];
      return {
        processType: firstContainer?.Config.Labels['com.dokku.process-type'] || 'web',
        processCount: containers.length,
      };
    }
  };

  const getContainerInfo = (appInfo: AppInfo) => {
    if (appInfo.info_origin === 'inspect' && Array.isArray(appInfo.data)) {
      return appInfo.data[0] as AppContainer;
    }
    return null;
  };

  const getUptime = (startedAt: string) => {
    try {
      const start = new Date(startedAt);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (diffDays > 0) {
        return `${diffDays}d ${diffHours}h`;
      } else if (diffHours > 0) {
        return `${diffHours}h`;
      } else {
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${diffMinutes}m`;
      }
    } catch {
      return 'N/A';
    }
  };

  const formatAppName = (appName: string) => {
    // Remove prefixos numéricos como "1-" se existirem
    return appName.replace(/^\d+-/, '');
  };

  const formatStartedAt = (startedAt: string) => {
    try {
      const date = new Date(startedAt);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Data inválida';
    }
  };

  const AppCardSkeleton = ({ appName }: { appName: string }) => {
    const displayName = formatAppName(appName);

    return (
      <Card
        style={{
          border: '1px solid var(--gray-6)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.2s ease',
          cursor: isMobile ? 'default' : 'pointer',
        }}
        className={`${styles.appCard} ${styles.skeleton}`}
        onClick={isMobile ? undefined : () => (window.location.href = `/apps/a/${displayName}`)}
        onMouseEnter={
          isMobile
            ? undefined
            : (e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
              }
        }
        onMouseLeave={
          isMobile
            ? undefined
            : (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
              }
        }
      >
        <Flex className={styles.appCardContent} style={{ alignItems: 'flex-start' }}>
          {/* Ícone do app */}
          <Avatar
            size='6'
            fallback={
              <svg
                width='48'
                height='48'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <rect
                  x='6'
                  y='6'
                  width='12'
                  height='12'
                  rx='2'
                  stroke='#4fa8d8'
                  strokeWidth='1.5'
                  fill='none'
                  filter='drop-shadow(0 0 4px #4fa8d8) drop-shadow(0 0 8px #4fa8d8)'
                />
                <rect
                  x='9'
                  y='9'
                  width='6'
                  height='6'
                  rx='1'
                  stroke='#87ceeb'
                  strokeWidth='1.2'
                  fill='currentColor'
                  fillOpacity='0.2'
                />
              </svg>
            }
            style={{
              background:
                'linear-gradient(135deg, #ff1744 0%, #e91e63 25%, #f06292 50%, #ba68c8 75%, #9c27b0 100%)',
              color: 'white',
              marginRight: '10px',
              border: '2px solid rgba(255, 255, 255, 0.25)',
              boxShadow:
                '0 8px 32px rgba(233, 30, 99, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            }}
          />

          {/* Informações principais */}
          <Flex direction='column' className={styles.appInfo}>
            <Flex align='center' gap='2'>
              <Heading size='4' weight='medium' style={{ color: 'var(--gray-12)' }}>
                {displayName}
              </Heading>
              <Text size='2' style={{ color: 'var(--gray-9)', opacity: 0.7 }}>
                • carregando...
              </Text>
            </Flex>

            {/* Status skeleton */}
            <Flex align='center' gap='2'>
              <Box
                className={styles.skeletonElement}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                }}
              />
              <Text size='2' weight='medium' style={{ color: 'var(--gray-9)', opacity: 0.7 }}>
                Carregando status...
              </Text>
            </Flex>

            {/* Info skeleton */}
            <Flex align='center' gap='2'>
              <div
                className={styles.skeletonElement}
                style={{
                  width: '160px',
                  height: '12px',
                  borderRadius: '4px',
                }}
              />
              <div
                className={styles.skeletonElement}
                style={{
                  width: '80px',
                  height: '12px',
                  borderRadius: '4px',
                }}
              />
            </Flex>
          </Flex>

          {/* Data e botão skeleton */}
          <Flex direction='column' className={styles.appActions}>
            <div
              className={styles.skeletonElement}
              style={{
                width: '190px',
                height: '12px',
                borderRadius: '4px',
                marginBottom: '12px',
              }}
            />
            <Button
              size='3'
              onClick={() => (window.location.href = `/apps/a/${displayName}`)}
              style={{
                background: 'linear-gradient(135deg, var(--blue-9) 0%, var(--blue-10) 100%)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '500',
                padding: '12px 20px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s ease',
                minWidth: '120px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
              }}
            >
              Ver detalhes
            </Button>
          </Flex>
        </Flex>
      </Card>
    );
  };

  const getPortInfo = (container: AppContainer) => {
    const envVars = container.Config.Env || [];
    const portEnv = envVars.find((env) => env.startsWith('PORT='));
    const proxyPortEnv = envVars.find((env) => env.startsWith('DOKKU_PROXY_PORT='));

    if (portEnv) {
      return portEnv.split('=')[1];
    } else if (proxyPortEnv) {
      return proxyPortEnv.split('=')[1];
    }
    return null; // Retorna null se não encontrar porta
  };

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
                Meus Aplicativos
              </Heading>
              <Text size='3' color='gray'>
                Gerencie seus aplicativos Dokku implantados
              </Text>
            </Box>

            <Button
              size='3'
              onClick={() => (window.location.href = '/apps/create')}
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
              + Nova Aplicação
            </Button>
          </Flex>

          {/* Separador */}
          <Separator size='4' style={{ margin: '10px 0' }} />

          {/* Estado de carregamento */}
          {loading && (
            <LoadingSpinner
              title='Carregando Aplicativos'
              messages={[
                'Conectando ao Dokku...',
                'Buscando aplicativos...',
                'Verificando status dos containers...',
                'Organizando informações...',
                'Quase pronto...',
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

          {/* Lista de aplicativos */}
          {!loading && !error && (
            <>
              {appsList.length === 0 ? (
                <Card
                  style={{
                    border: '1px solid var(--gray-6)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    padding: '40px',
                    textAlign: 'center',
                  }}
                >
                  <Text size='3' color='gray'>
                    Nenhum aplicativo criado ainda.
                  </Text>
                </Card>
              ) : (
                <Flex direction='column' gap='4'>
                  {appsList.map((appItem) => {
                    // Se ainda está carregando ou houve erro, mostra skeleton
                    if (appItem.loading || appItem.error || !appItem.info) {
                      return <AppCardSkeleton key={appItem.name} appName={appItem.name} />;
                    }

                    const statusInfo = getStatusInfo(appItem.info);
                    const displayName = formatAppName(appItem.name);
                    const processInfo = getProcessInfo(appItem.info);
                    const containerInfo = getContainerInfo(appItem.info);

                    return (
                      <Card
                        key={appItem.name}
                        style={{
                          border: '1px solid var(--gray-6)',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                          transition: 'all 0.2s ease',
                          cursor: isMobile ? 'default' : 'pointer',
                        }}
                        className={styles.appCard}
                        onClick={
                          isMobile
                            ? undefined
                            : () => (window.location.href = `/apps/a/${displayName}`)
                        }
                        onMouseEnter={
                          isMobile
                            ? undefined
                            : (e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                              }
                        }
                        onMouseLeave={
                          isMobile
                            ? undefined
                            : (e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
                              }
                        }
                      >
                        <Flex
                          className={styles.appCardContent}
                          style={{ alignItems: 'flex-start' }}
                        >
                          {/* Ícone do app */}
                          <Avatar
                            size='6'
                            fallback={
                              <svg
                                width='48'
                                height='48'
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
                                  stroke='#4fa8d8'
                                  strokeWidth='1.5'
                                  fill='none'
                                  filter='drop-shadow(0 0 4px #4fa8d8) drop-shadow(0 0 8px #4fa8d8)'
                                />
                                {/* CPU Core */}
                                <rect
                                  x='9'
                                  y='9'
                                  width='6'
                                  height='6'
                                  rx='1'
                                  stroke='#87ceeb'
                                  strokeWidth='1.2'
                                  fill='currentColor'
                                  fillOpacity='0.2'
                                />
                                {/* CPU Pins - Top */}
                                <line
                                  x1='8'
                                  y1='6'
                                  x2='8'
                                  y2='3'
                                  stroke='#87ceeb'
                                  strokeWidth='1.5'
                                  strokeLinecap='round'
                                />
                                <line
                                  x1='12'
                                  y1='6'
                                  x2='12'
                                  y2='3'
                                  stroke='#87ceeb'
                                  strokeWidth='1.5'
                                  strokeLinecap='round'
                                />
                                <line
                                  x1='16'
                                  y1='6'
                                  x2='16'
                                  y2='3'
                                  stroke='#87ceeb'
                                  strokeWidth='1.5'
                                  strokeLinecap='round'
                                />
                                {/* CPU Pins - Bottom */}
                                <line
                                  x1='8'
                                  y1='18'
                                  x2='8'
                                  y2='21'
                                  stroke='#87ceeb'
                                  strokeWidth='1.5'
                                  strokeLinecap='round'
                                />
                                <line
                                  x1='12'
                                  y1='18'
                                  x2='12'
                                  y2='21'
                                  stroke='#87ceeb'
                                  strokeWidth='1.5'
                                  strokeLinecap='round'
                                />
                                <line
                                  x1='16'
                                  y1='18'
                                  x2='16'
                                  y2='21'
                                  stroke='#87ceeb'
                                  strokeWidth='1.5'
                                  strokeLinecap='round'
                                />
                                {/* CPU Pins - Left */}
                                <line
                                  x1='6'
                                  y1='8'
                                  x2='3'
                                  y2='8'
                                  stroke='#87ceeb'
                                  strokeWidth='1.5'
                                  strokeLinecap='round'
                                />
                                <line
                                  x1='6'
                                  y1='12'
                                  x2='3'
                                  y2='12'
                                  stroke='#87ceeb'
                                  strokeWidth='1.5'
                                  strokeLinecap='round'
                                />
                                <line
                                  x1='6'
                                  y1='16'
                                  x2='3'
                                  y2='16'
                                  stroke='#87ceeb'
                                  strokeWidth='1.5'
                                  strokeLinecap='round'
                                />
                                {/* CPU Pins - Right */}
                                <line
                                  x1='18'
                                  y1='8'
                                  x2='21'
                                  y2='8'
                                  stroke='#87ceeb'
                                  strokeWidth='1.5'
                                  strokeLinecap='round'
                                />
                                <line
                                  x1='18'
                                  y1='12'
                                  x2='21'
                                  y2='12'
                                  stroke='#87ceeb'
                                  strokeWidth='1.5'
                                  strokeLinecap='round'
                                />
                                <line
                                  x1='18'
                                  y1='16'
                                  x2='21'
                                  y2='16'
                                  stroke='#87ceeb'
                                  strokeWidth='1.5'
                                  strokeLinecap='round'
                                />
                              </svg>
                            }
                            style={{
                              background:
                                'linear-gradient(135deg, #ff1744 0%, #e91e63 25%, #f06292 50%, #ba68c8 75%, #9c27b0 100%)',
                              color: 'white',
                              marginRight: '10px',
                              border: '2px solid rgba(255, 255, 255, 0.25)',
                              boxShadow:
                                '0 8px 32px rgba(233, 30, 99, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                            }}
                          />

                          {/* Informações principais */}
                          <Flex direction='column' className={styles.appInfo}>
                            <Flex align='center' gap='2'>
                              <Heading size='4' weight='medium' style={{ color: 'var(--gray-12)' }}>
                                {displayName}
                              </Heading>
                              <Text size='2' style={{ color: 'var(--gray-9)' }}>
                                • {processInfo.processType}
                              </Text>
                              {processInfo.processCount > 1 && (
                                <Text size='2' style={{ color: 'var(--gray-9)' }}>
                                  ({processInfo.processCount} processos)
                                </Text>
                              )}
                            </Flex>

                            {/* Status com círculo colorido */}
                            <Flex align='center' gap='2'>
                              <Box
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: statusInfo.color,
                                }}
                              />
                              <Text size='2' weight='medium' style={{ color: 'var(--gray-11)' }}>
                                {statusInfo.text}
                              </Text>

                              {/* Uptime - só mostra para apps inspecionados e ativos */}
                              {containerInfo?.State.StartedAt && statusInfo.text === 'Ativo' && (
                                <Text size='2' style={{ color: 'var(--gray-9)' }}>
                                  • {getUptime(containerInfo.State.StartedAt)}
                                </Text>
                              )}
                            </Flex>

                            {/* Informações técnicas - só para apps inspecionados */}
                            {containerInfo?.NetworkSettings.IPAddress && (
                              <Flex align='center' gap='2'>
                                <Text
                                  size='2'
                                  style={{ color: 'var(--gray-9)', fontWeight: '500' }}
                                >
                                  IP:
                                </Text>
                                <Text
                                  size='2'
                                  style={{ color: 'var(--gray-10)', fontFamily: 'monospace' }}
                                >
                                  {containerInfo.NetworkSettings.IPAddress}
                                </Text>
                                {getPortInfo(containerInfo) && (
                                  <>
                                    <Text
                                      size='2'
                                      style={{ color: 'var(--gray-9)', fontWeight: '500' }}
                                    >
                                      •
                                    </Text>
                                    <Text
                                      size='2'
                                      style={{ color: 'var(--gray-9)', fontWeight: '500' }}
                                    >
                                      Porta:
                                    </Text>
                                    <Text
                                      size='2'
                                      style={{ color: 'var(--gray-10)', fontFamily: 'monospace' }}
                                    >
                                      {getPortInfo(containerInfo)}
                                    </Text>
                                  </>
                                )}
                              </Flex>
                            )}
                          </Flex>

                          {/* Data de inicialização e botão */}
                          <Flex direction='column' className={styles.appActions}>
                            <Text
                              size='2'
                              style={{
                                color: 'var(--gray-9)',
                                textAlign: 'right',
                                whiteSpace: 'nowrap',
                              }}
                              className={styles.dateText}
                            >
                              {containerInfo?.State.StartedAt
                                ? `Iniciado em ${formatStartedAt(containerInfo.State.StartedAt)}`
                                : 'Não inicializado ainda'}
                            </Text>

                            <Button
                              size='3'
                              onClick={() => (window.location.href = `/apps/a/${displayName}`)}
                              style={{
                                background:
                                  'linear-gradient(135deg, var(--blue-9) 0%, var(--blue-10) 100%)',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '500',
                                padding: '12px 20px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                                transition: 'all 0.2s ease',
                                minWidth: '120px',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow =
                                  '0 4px 12px rgba(59, 130, 246, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow =
                                  '0 2px 8px rgba(59, 130, 246, 0.3)';
                              }}
                            >
                              Ver detalhes
                            </Button>
                          </Flex>
                        </Flex>
                      </Card>
                    );
                  })}
                </Flex>
              )}
            </>
          )}
        </Flex>
      </main>
    </>
  );
}
