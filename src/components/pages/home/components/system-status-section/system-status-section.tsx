import {
  CheckCircledIcon,
  CrossCircledIcon,
  DashboardIcon,
  InfoCircledIcon,
  LightningBoltIcon,
} from '@radix-ui/react-icons';
import { Badge, Box, Flex, Separator, Text } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../home.module.css';
import type { DetailedResourcesData, LoadingState, SystemInfo } from '../../types';
import { PlatformInfoAccordion } from '../platform-info-accordion';
import { ResourcesOverviewAccordion } from '../resources-overview-accordion';

interface SystemStatusSectionProps {
  systemInfo: SystemInfo | null;
  loading: LoadingState;
  appsTotal?: number;
  servicesTotal?: number;
  networksTotal?: number;
  detailed: DetailedResourcesData;
  onAppsClick: () => void;
  onServicesClick: () => void;
  onNetworksClick: () => void;
}

export function SystemStatusSection(props: SystemStatusSectionProps) {
  const { systemInfo, loading } = props;
  const { t } = usePageTranslation();

  if (!(loading.system || systemInfo)) {
    return null;
  }

  return (
    <>
      <Separator size='4' style={{ margin: '20px 0', opacity: 0.2 }} />
      <Box>
        <Flex align='center' justify='between' mb='5'>
          <Text
            as='div'
            size='5'
            weight='medium'
            style={{ color: 'var(--gray-12)' }}
            className={styles.mainSystemTitle}
          >
            <DashboardIcon style={{ marginRight: '8px' }} /> {t('system.status.sectionTitle')}
          </Text>
          <Badge
            color={
              systemInfo && systemInfo.dokkuStatus ? 'green' : loading.system ? 'gray' : 'orange'
            }
            variant='soft'
            size='2'
            className={styles.systemStatusBadge}
          >
            {loading.system
              ? t('system.status.checking')
              : systemInfo && systemInfo.dokkuStatus
                ? t('system.status.operationalLong')
                : t('system.status.unavailable')}
          </Badge>
        </Flex>

        {loading.apps || loading.networks || loading.services || loading.system ? (
          <Box className={styles.modernStatusLoading}>
            <Flex align='center' justify='center' direction='column' gap='4'>
              <div className={styles.modernSpinner} />
              <Text size='3' weight='medium' color='gray'>
                {t('system.status.syncing')}
              </Text>
            </Flex>
          </Box>
        ) : (
          <Box className={styles.modernStatusContainer}>
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
                        {t('system.status.sectionTitle')}
                      </Text>
                    </Flex>
                    <Flex align='center' gap='2'>
                      <InfoCircledIcon
                        width='14'
                        height='14'
                        style={{ color: 'var(--gray-9)' }}
                        className={styles.systemSubtitleIcon}
                      />
                      <Text as='span' size='2' className={styles.systemSubtitle}>
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
                    {systemInfo.dokkuStatus
                      ? t('system.status.operationalShort')
                      : t('system.status.offline')}
                  </Flex>
                </Badge>
              </Flex>
            )}

            <Separator size='4' mb='4' />

            <ResourcesOverviewAccordion
              loading={{
                apps: loading.apps,
                services: loading.services,
                networks: loading.networks,
              }}
              appsTotal={props.appsTotal}
              servicesTotal={props.servicesTotal}
              networksTotal={props.networksTotal}
              detailed={props.detailed}
              onAppsClick={props.onAppsClick}
              onServicesClick={props.onServicesClick}
              onNetworksClick={props.onNetworksClick}
            />

            <Separator size='4' my='4' />

            {systemInfo && <PlatformInfoAccordion systemInfo={systemInfo} />}
          </Box>
        )}
      </Box>
    </>
  );
}
