import { EnterIcon, Share2Icon } from '@radix-ui/react-icons';
import { Card, Flex, Separator, Text } from '@radix-ui/themes';
import { Session } from 'next-auth';
import React, { useEffect, useState } from 'react';

import { NavBar } from '@/components';
import { ErrorCard, ListHeader, ServerUpdateIndicator } from '@/components/shared';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { usePageTranslation } from '@/i18n/utils';
import { api } from '@/lib';

import styles from './app-list.module.css';
import { AppsList } from './components';
import { AppListItem } from './types';
import { getAppsListEndpoint, isSharedView, parseSharedName, withSharedByParams } from './utils';

export interface AppListPageProps {
  session: Session;
}

export function AppListPage(props: AppListPageProps) {
  const { t } = usePageTranslation();
  const [appsList, setAppsList] = useState<AppListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isUpdatingFromServer, setIsUpdatingFromServer] = useState(false);
  const [hasInitialList, setHasInitialList] = useState(false);

  const [sharingAppsList, setSharingAppsList] = useState<AppListItem[]>([]);
  const [sharingError, setSharingError] = useState<string | null>(null);
  const [hasSharingInitialList, setHasSharingInitialList] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  useEffect(() => {
    const fetchAppsInfo = async (
      appNames: string[],
      setList: React.Dispatch<React.SetStateAction<AppListItem[]>>,
      useSharedByPrefix = true
    ) => {
      const cachedApps: string[] = [];

      const promises = appNames.map(async (appName) => {
        const { sharedBy, pureName: parsedAppName } = useSharedByPrefix
          ? parseSharedName(appName)
          : { sharedBy: undefined, pureName: appName };
        try {
          const response = await api.post(
            `/api/apps/${parsedAppName}/info/`,
            {},
            { params: withSharedByParams(sharedBy) }
          );

          if (response.status === 200 && response.data.success) {
            const cacheStatus = response.headers['x-cache'];
            if (cacheStatus === 'HIT') {
              cachedApps.push(appName);
            }

            setList((prevList) =>
              prevList.map((app) =>
                app.name === appName ? { ...app, info: response.data.result, loading: false } : app
              )
            );
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          console.error(`Error fetching info for app ${appName}:`, error);
          setList((prevList) =>
            prevList.map((app) =>
              app.name === appName ? { ...app, loading: false, error: t('errors.infoFetch') } : app
            )
          );
        }
      });

      await Promise.allSettled(promises);
      return cachedApps;
    };

    const fetchFreshAppsInfo = async (
      appNames: string[],
      setList: React.Dispatch<React.SetStateAction<AppListItem[]>>,
      useSharedByPrefix = true
    ) => {
      try {
        setIsUpdatingFromServer(true);

        const promises = appNames.map(async (appName) => {
          const { sharedBy, pureName: parsedAppName } = useSharedByPrefix
            ? parseSharedName(appName)
            : { sharedBy: undefined, pureName: appName };
          try {
            const response = await api.post(
              `/api/apps/${parsedAppName}/info/`,
              {},
              {
                headers: { 'x-cache': 'false' },
                params: withSharedByParams(sharedBy),
              }
            );

            if (response.status === 200 && response.data.success) {
              setList((prevList) =>
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
        console.warn('Failed to fetch fresh apps data:', error);
      } finally {
        setIsUpdatingFromServer(false);
      }
    };

    const fetchAppsList = async () => {
      const startTime = Date.now();
      try {
        setLoading(true);
        const listEndpoint = getAppsListEndpoint();

        const response = await api.post(
          listEndpoint,
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

          const cachedApps = await fetchAppsInfo(appNames, setAppsList);
          if (cachedApps.length > 0) {
            fetchFreshAppsInfo(cachedApps, setAppsList);
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching apps list:', error);
        setError(t('errors.listFetch'));
      }

      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);

      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
    };

    const fetchSharingAppsList = async () => {
      try {
        const response = await api.post(
          '/api/apps/list-apps-shared-with/',
          {},
          { headers: { 'x-cache': 'false' } }
        );

        if (response.status === 200 && response.data.success) {
          const appNames = Object.keys(response.data.result);

          const initialAppsList: AppListItem[] = appNames.map((name) => ({
            name,
            info: null,
            loading: true,
            error: null,
          }));

          setSharingAppsList(initialAppsList);
          setHasSharingInitialList(true);

          const cachedApps = await fetchAppsInfo(appNames, setSharingAppsList, false);
          if (cachedApps.length > 0) {
            fetchFreshAppsInfo(cachedApps, setSharingAppsList, false);
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching sharing apps list:', error);
        setSharingError(t('errors.listFetch'));
        setHasSharingInitialList(true);
      }
    };

    fetchAppsList();
    if (isSharedView()) {
      fetchSharingAppsList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isShared = isSharedView();

  return (
    <>
      <NavBar session={props.session} />

      <main className={styles.root}>
        <Flex direction='column' gap='5' className={styles.mainContainer}>
          <ListHeader
            title={t(isShared ? 'list.header.titleShared' : 'list.header.title')}
            subtitle={t(isShared ? 'list.header.subtitleShared' : 'list.header.subtitle')}
            buttonLabel={t('list.header.createButton')}
            onCreate={() => (window.location.href = '/apps/create')}
            containerClassName={styles.headerSection}
            buttonClassName={styles.createButton}
          />

          <Separator size='4' style={{ margin: '10px 0' }} />

          <ServerUpdateIndicator visible={isUpdatingFromServer} />

          {!hasInitialList && loading && (
            <LoadingSpinner
              title={t('list.loading.title')}
              messages={[
                t('list.loading.messages.connecting'),
                t('list.loading.messages.fetchingApps'),
                t('list.loading.messages.preparingList'),
              ]}
            />
          )}

          {error && <ErrorCard error={error} />}

          {isShared && hasSharingInitialList && sharingAppsList.length > 0 && (
            <>
              <Flex align='center' gap='2'>
                <Share2Icon width={20} height={20} />
                <Text size='5' weight='bold'>
                  {t('list.sharing.title')}
                </Text>
              </Flex>
              {sharingError ? (
                <ErrorCard error={sharingError} />
              ) : (
                <AppsList appsList={sharingAppsList} isMobile={isMobile} />
              )}
              {appsList.length > 0 && <Separator size='4' style={{ margin: '10px 0' }} />}
            </>
          )}

          {hasInitialList && !error && (
            <>
              {isShared && appsList.length > 0 && (
                <Flex align='center' gap='2'>
                  <EnterIcon width={20} height={20} />
                  <Text size='5' weight='bold'>
                    {t('list.sharedWithMe.title')}
                  </Text>
                </Flex>
              )}
              {appsList.length === 0 ? (
                isShared && hasSharingInitialList && sharingAppsList.length === 0 ? (
                  <Card
                    style={{
                      border: '1px solid var(--gray-6)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      padding: '40px',
                      textAlign: 'center',
                    }}
                  >
                    <Text size='3' color='gray'>
                      {t('list.empty.noSharedApps')}
                    </Text>
                  </Card>
                ) : !isShared ? (
                  <Card
                    style={{
                      border: '1px solid var(--gray-6)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      padding: '40px',
                      textAlign: 'center',
                    }}
                  >
                    <Text size='3' color='gray'>
                      {t('list.empty.noApps')}
                    </Text>
                  </Card>
                ) : null
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
