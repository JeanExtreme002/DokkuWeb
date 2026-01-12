import { Flex, Separator } from '@radix-ui/themes';
import { Session } from 'next-auth';
import { useEffect, useState } from 'react';

import { NavBar } from '@/components';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { api } from '@/lib';

import {
  EmptyCard,
  ErrorCard,
  HeaderSection,
  ServerUpdateIndicator,
  ServicesGrid,
} from './components';
import styles from './service-list.module.css';
import { ServiceListItem } from './types';

interface ServiceListPageProps {
  session: Session;
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

  // Presentation components are split for maintainability and SOLID compliance

  return (
    <>
      <NavBar session={props.session} />

      <main className={styles.root}>
        <Flex direction='column' gap='5' className={styles.mainContainer}>
          <HeaderSection onCreate={() => (window.location.href = './create')} />

          {/* Separator */}
          <Separator size='4' style={{ margin: '10px 0' }} />

          {/* Server update indicator */}
          <ServerUpdateIndicator visible={isUpdatingFromServer} />

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
          <ErrorCard error={error} />

          {/* Services list — shows as soon as we have the initial list */}
          {hasInitialList && !error && (
            <>
              {servicesList.length === 0 ? (
                <EmptyCard />
              ) : (
                <ServicesGrid servicesList={servicesList} isMobile={isMobile} />
              )}
            </>
          )}
        </Flex>
      </main>
    </>
  );
}
