import { Card, Flex, Separator, Text } from '@radix-ui/themes';
import { Session } from 'next-auth';
import { useEffect, useState } from 'react';

import { NavBar } from '@/components';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { api } from '@/lib';

import styles from './app-list.module.css';
import { AppsList, ErrorCard, HeaderSection, ServerUpdateIndicator } from './components';
import { AppListItem } from './types';

export interface AppListPageProps {
  session: Session;
}

export function AppListPage(props: AppListPageProps) {
  const [appsList, setAppsList] = useState<AppListItem[]>([]);
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
    const fetchAppsList = async () => {
      const startTime = Date.now();
      try {
        setLoading(true);
        const response = await api.post(
          '/api/apps/list/',
          {},
          {
            headers: { 'x-cache': 'false' },
            params: { return_info: false },
          }
        );

        if (response.status === 200 && response.data.success) {
          const appNames = Object.keys(response.data.result);

          const initialAppsList: AppListItem[] = appNames.map((name) => ({
            name,
            info: null,
            loading: true,
            error: null,
          }));

          setAppsList(initialAppsList);
          setHasInitialList(true);

          await fetchAppsInfo(appNames);
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
      const cachedApps: string[] = [];

      // Load each app's information asynchronously
      const promises = appNames.map(async (appName) => {
        try {
          const response = await api.post(`/api/apps/${appName}/info/`);

          if (response.status === 200 && response.data.success) {
            const cacheStatus = response.headers['x-cache'];
            if (cacheStatus === 'HIT') {
              cachedApps.push(appName);
            }

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
          // Update error state for this specific app
          setAppsList((prevList) =>
            prevList.map((app) =>
              app.name === appName
                ? { ...app, loading: false, error: 'Erro ao carregar informações' }
                : app
            )
          );
        }
      });

      await Promise.allSettled(promises);

      if (cachedApps.length > 0) {
        fetchFreshAppsInfo(cachedApps);
      }
    };

    const fetchFreshAppsInfo = async (appNames: string[]) => {
      try {
        setIsUpdatingFromServer(true);

        // Load each app's information asynchronously without cache
        const promises = appNames.map(async (appName) => {
          try {
            const response = await api.post(
              `/api/apps/${appName}/info/`,
              {},
              {
                headers: { 'x-cache': 'false' },
              }
            );

            if (response.status === 200 && response.data.success) {
              // Update state for this specific app
              setAppsList((prevList) =>
                prevList.map((app) =>
                  app.name === appName
                    ? { ...app, info: response.data.result, loading: false }
                    : app
                )
              );
            }
          } catch (error) {
            console.error(`Error fetching fresh info for app ${appName}:`, error);
          }
        });

        await Promise.allSettled(promises);
      } catch (error) {
        // Ignore errors during background refresh
        console.warn('Failed to fetch fresh apps data:', error);
      } finally {
        setIsUpdatingFromServer(false);
      }
    };

    fetchAppsList();
  }, []);

  return (
    <>
      <NavBar session={props.session} />

      <main className={styles.root}>
        <Flex direction='column' gap='5' className={styles.mainContainer}>
          <HeaderSection />

          <Separator size='4' style={{ margin: '10px 0' }} />

          <ServerUpdateIndicator visible={isUpdatingFromServer} />

          {!hasInitialList && loading && (
            <LoadingSpinner
              title='Carregando Aplicativos'
              messages={[
                'Conectando ao Dokku...',
                'Buscando aplicativos...',
                'Preparando listagem...',
              ]}
            />
          )}

          {error && <ErrorCard error={error} />}

          {hasInitialList && !error && (
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
                <AppsList appsList={appsList} isMobile={isMobile} />
              )}
            </>
          )}
        </Flex>
      </main>
    </>
  );
}
