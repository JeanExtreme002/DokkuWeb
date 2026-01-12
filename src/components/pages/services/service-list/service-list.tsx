import { EyeOpenIcon } from '@radix-ui/react-icons';
import { Box, Button, Card, Flex, Heading, Separator, Text } from '@radix-ui/themes';
import Image from 'next/image';
import { Session } from 'next-auth';
import { useEffect, useState } from 'react';

import { NavBar } from '@/components';
import { DotIcon } from '@/components/shared/icons';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { api, getServiceImage } from '@/lib';

import styles from './service-list.module.css';

interface ServiceListPageProps {
  session: Session;
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

interface ServiceListItem {
  pluginType: string;
  serviceName: string;
  serviceData: ServiceData | null;
  loading: boolean;
  error: string | null;
}

export function ServiceListPage(props: ServiceListPageProps) {
  const [servicesList, setServicesList] = useState<ServiceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isUpdatingFromServer, setIsUpdatingFromServer] = useState(false);
  const [hasInitialList, setHasInitialList] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    const fetchServicesList = async () => {
      const startTime = Date.now();
      try {
        setLoading(true);
        const response = await api.post(
          '/api/databases/list/',
          {},
          {
            headers: { 'x-cache': 'false' },
            params: { return_info: false },
          }
        );

        if (response.status === 200 && response.data.success) {
          const servicesData = response.data.result;

          const initialServicesList: ServiceListItem[] = [];

          Object.entries(servicesData).forEach(([pluginType, servicesByType]) => {
            Object.keys(servicesByType as Record<string, any>).forEach((serviceName) => {
              initialServicesList.push({
                pluginType,
                serviceName,
                serviceData: null,
                loading: true,
                error: null,
              });
            });
          });

          setServicesList(initialServicesList);
          setHasInitialList(true); // Mark that we already have the initial list

          // Load services information
          // Synchronization will be done automatically for items that came from cache
          await fetchServicesInfo(initialServicesList);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching services list:', error);
        setError('Erro ao carregar lista de serviços');
      }

      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);

      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
    };

    const fetchServicesInfo = async (servicesList: ServiceListItem[]) => {
      const cachedServices: ServiceListItem[] = [];

      // Load each service's information asynchronously
      const promises = servicesList.map(async (serviceItem) => {
        try {
          const response = await api.post(
            `/api/databases/${serviceItem.pluginType}/${serviceItem.serviceName}/info/`
          );

          if (response.status === 200 && response.data.success) {
            // Check if this individual request came from the cache
            const cacheStatus = response.headers['x-cache'];
            if (cacheStatus === 'HIT') {
              cachedServices.push(serviceItem);
            }

            // Update state for this specific service
            setServicesList((prevList) =>
              prevList.map((service) =>
                service.pluginType === serviceItem.pluginType &&
                service.serviceName === serviceItem.serviceName
                  ? {
                      ...service,
                      serviceData: { ...response.data.result, plugin_name: serviceItem.pluginType },
                      loading: false,
                    }
                  : service
              )
            );
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          console.error(
            `Error fetching info for service ${serviceItem.pluginType}/${serviceItem.serviceName}:`,
            error
          );
          // Update error state for this specific service
          setServicesList((prevList) =>
            prevList.map((service) =>
              service.pluginType === serviceItem.pluginType &&
              service.serviceName === serviceItem.serviceName
                ? { ...service, loading: false, error: 'Erro ao carregar informações' }
                : service
            )
          );
        }
      });

      // Wait for all requests to finish
      await Promise.allSettled(promises);

      // If there are services that came from cache, refresh them in the background
      if (cachedServices.length > 0) {
        fetchFreshServicesInfo(cachedServices);
      }
    };

    const fetchFreshServicesInfo = async (servicesList: ServiceListItem[]) => {
      try {
        setIsUpdatingFromServer(true);

        // Load each service's information asynchronously without cache
        const promises = servicesList.map(async (serviceItem) => {
          try {
            const response = await api.post(
              `/api/databases/${serviceItem.pluginType}/${serviceItem.serviceName}/info/`,
              {},
              {
                headers: { 'x-cache': 'false' },
              }
            );

            if (response.status === 200 && response.data.success) {
              // Update state for this specific service
              setServicesList((prevList) =>
                prevList.map((service) =>
                  service.pluginType === serviceItem.pluginType &&
                  service.serviceName === serviceItem.serviceName
                    ? {
                        ...service,
                        serviceData: {
                          ...response.data.result,
                          plugin_name: serviceItem.pluginType,
                        },
                        loading: false,
                      }
                    : service
                )
              );
            }
          } catch (error) {
            console.error(
              `Error fetching fresh info for service ${serviceItem.pluginType}/${serviceItem.serviceName}:`,
              error
            );
          }
        });

        // Wait for all requests to finish
        await Promise.allSettled(promises);
      } catch (error) {
        // Ignore errors during background refresh
        console.warn('Failed to fetch fresh services data:', error);
      } finally {
        setIsUpdatingFromServer(false);
      }
    };

    fetchServicesList();
  }, []);

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
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

  const formatServiceName = (serviceName: string) => {
    // Remove numeric prefixes like "1_" if present
    return serviceName.replace(/^\d+_/, '');
  };

  const formatVersion = (version: string) => {
    if (!version) return '';
    // Extract only the version from the format "mysql:8.1.0"
    const versionMatch = version.match(/:(.+)$/);
    return versionMatch ? versionMatch[1] : version;
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

  // Skeleton component for service cards
  const ServiceCardSkeleton = ({
    pluginType,
    serviceName,
  }: {
    pluginType: string;
    serviceName: string;
  }) => {
    const displayName = formatServiceName(serviceName);
    const serviceType = formatDatabaseType(pluginType);

    return (
      <Card
        style={{
          border: '1px solid var(--gray-6)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.2s ease',
          cursor: isMobile ? 'default' : 'pointer',
        }}
        className={`${styles.serviceCard} ${styles.skeleton}`}
        onClick={
          isMobile
            ? undefined
            : () => (window.location.href = `/services/s/${pluginType}/${serviceName}`)
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
        <Flex className={styles.serviceCardContent}>
          {/* Header with image and main info */}
          <Flex className={styles.serviceHeader}>
            <Image
              src={getServiceImage(pluginType)}
              alt={`${serviceType} logo`}
              width={48}
              height={48}
              className={styles.serviceImage}
              onError={(e) => {
                e.currentTarget.src = '/images/database-logos/generic.svg';
              }}
            />

            {/* Main information */}
            <Flex direction='column' className={styles.serviceInfo}>
              <Heading size='4' weight='medium' style={{ color: 'var(--gray-12)' }}>
                {displayName}
              </Heading>
              <Flex align='center' gap='2'>
                <Text size='2' style={{ color: 'var(--gray-9)', opacity: 0.7 }}>
                  {serviceType}
                </Text>
                <div
                  className={styles.skeletonElement}
                  style={{
                    width: '40px',
                    height: '12px',
                    borderRadius: '4px',
                  }}
                />
              </Flex>

              {/* Status skeleton */}
              <Flex align='center' gap='2' style={{ marginTop: '4px' }}>
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
            </Flex>
          </Flex>

          {/* Technical information skeleton */}
          <Flex direction='column' gap='1' style={{ marginTop: '8px' }}>
            <Flex align='center' gap='2'>
              <Text size='2' style={{ color: 'var(--gray-9)', fontWeight: '500' }}>
                IP:
              </Text>
              <div
                className={styles.skeletonElement}
                style={{
                  width: '150px',
                  height: '12px',
                  borderRadius: '4px',
                }}
              />
            </Flex>
          </Flex>

          {/* Action button */}
          <Flex className={styles.serviceActions}>
            <Button
              size='3'
              color='blue'
              variant='outline'
              style={{ cursor: 'pointer' }}
              onClick={() => (window.location.href = `/services/s/${pluginType}/${serviceName}`)}
            >
              <EyeOpenIcon />
              Ver detalhes
            </Button>
          </Flex>
        </Flex>
      </Card>
    );
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
                Meus Serviços
              </Heading>
              <Text size='3' color='gray'>
                Gerencie seus serviços de banco de dados no Dokku
              </Text>
            </Box>

            <Button
              size='3'
              onClick={() => (window.location.href = './create')}
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
              + Novo Serviço
            </Button>
          </Flex>

          {/* Separator */}
          <Separator size='4' style={{ margin: '10px 0' }} />

          {/* Server update indicator */}
          {isUpdatingFromServer && (
            <Flex align='center' gap='3'>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid var(--gray-6)',
                  borderTop: '2px solid var(--gray-9)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <Text size='3' style={{ color: 'var(--gray-11)', fontWeight: '500' }}>
                Sincronizando informações com o servidor...
              </Text>
            </Flex>
          )}

          {/* Initial loading state — only shows if we don't have the list yet */}
          {!hasInitialList && loading && (
            <LoadingSpinner
              title='Carregando Serviços'
              messages={[
                'Conectando ao Dokku...',
                'Listando serviços de banco de dados...',
                'Preparando listagem...',
              ]}
            />
          )}

          {/* Error state */}
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

          {/* Services list — shows as soon as we have the initial list */}
          {hasInitialList && !error && (
            <>
              {servicesList.length === 0 ? (
                <Card
                  style={{
                    border: '1px solid var(--gray-6)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    padding: '40px',
                    textAlign: 'center',
                  }}
                >
                  <Text size='3' color='gray'>
                    Nenhum serviço criado ainda.
                  </Text>
                </Card>
              ) : (
                <div className={styles.servicesGrid}>
                  {servicesList.map((serviceItem) => {
                    // If still loading or errored, show skeleton
                    if (serviceItem.loading || serviceItem.error || !serviceItem.serviceData) {
                      return (
                        <ServiceCardSkeleton
                          key={`${serviceItem.pluginType}-${serviceItem.serviceName}`}
                          pluginType={serviceItem.pluginType}
                          serviceName={serviceItem.serviceName}
                        />
                      );
                    }

                    const statusInfo = getStatusInfo(serviceItem.serviceData.status);
                    const displayName = formatServiceName(serviceItem.serviceName);
                    const serviceType = formatDatabaseType(serviceItem.pluginType);

                    return (
                      <Card
                        key={`${serviceItem.pluginType}-${serviceItem.serviceName}`}
                        style={{
                          border: '1px solid var(--gray-6)',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                          transition: 'all 0.2s ease',
                          cursor: isMobile ? 'default' : 'pointer',
                        }}
                        className={styles.serviceCard}
                        onClick={
                          isMobile
                            ? undefined
                            : () =>
                                (window.location.href = `/services/s/${serviceItem.pluginType}/${serviceItem.serviceName}`)
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
                        <Flex className={styles.serviceCardContent}>
                          {/* Header with image and main info */}
                          <Flex className={styles.serviceHeader}>
                            <Image
                              src={getServiceImage(serviceItem.pluginType)}
                              alt={`${serviceType} logo`}
                              width={48}
                              height={48}
                              className={styles.serviceImage}
                              onError={(e) => {
                                // Fallback to a generic database icon if the image fails
                                e.currentTarget.src = '/images/database-logos/generic.svg';
                              }}
                            />

                            {/* Main information */}
                            <Flex direction='column' className={styles.serviceInfo}>
                              <Heading size='4' weight='medium' style={{ color: 'var(--gray-12)' }}>
                                {displayName}
                              </Heading>
                              <Text size='2' style={{ color: 'var(--gray-9)' }}>
                                {serviceType}{' '}
                                {formatVersion(serviceItem.serviceData.version) &&
                                  `v${formatVersion(serviceItem.serviceData.version)}`}
                              </Text>

                              {/* Status with colored circle */}
                              <Flex align='center' gap='2' style={{ marginTop: '4px' }}>
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
                              </Flex>
                            </Flex>
                          </Flex>

                          {/* Technical information */}
                          <Flex direction='column' gap='1' style={{ marginTop: '8px' }}>
                            <Flex align='center' gap='2'>
                              <Text size='2' style={{ color: 'var(--gray-9)', fontWeight: '500' }}>
                                IP:
                              </Text>
                              <Text
                                size='2'
                                style={{ color: 'var(--gray-10)', fontFamily: 'monospace' }}
                              >
                                {serviceItem.serviceData.internal_ip || 'Indisponível'}
                              </Text>
                            </Flex>
                            {serviceItem.serviceData.exposed_ports !== '-' && (
                              <Flex align='center' gap='2'>
                                <Text
                                  size='2'
                                  style={{ color: 'var(--gray-9)', fontWeight: '500' }}
                                >
                                  Portas:
                                </Text>
                                <Text
                                  size='2'
                                  style={{ color: 'var(--gray-10)', fontFamily: 'monospace' }}
                                >
                                  {serviceItem.serviceData.exposed_ports}
                                </Text>
                              </Flex>
                            )}
                          </Flex>

                          {/* Action button */}
                          <Flex className={styles.serviceActions}>
                            <Button
                              size='3'
                              color='blue'
                              variant='outline'
                              style={{ cursor: 'pointer' }}
                              onClick={() =>
                                (window.location.href = `/services/s/${serviceItem.pluginType}/${serviceItem.serviceName}`)
                              }
                            >
                              <EyeOpenIcon />
                              Ver detalhes
                            </Button>
                          </Flex>
                        </Flex>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </Flex>
      </main>
    </>
  );
}
