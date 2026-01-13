import { ArrowRightIcon, CubeIcon, GlobeIcon, RocketIcon } from '@radix-ui/react-icons';
import { Box, Flex, Grid, Heading, Progress, Text } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../home.module.css';
import type { LoadingStateSubset, QuotaInfo } from '../../types';
import { getResourceUsagePercentage, getUsageColor } from '../../utils';
import { SkeletonStatItem } from '../skeleton';

interface StatsOverviewSectionProps {
  appsTotal?: number;
  networksTotal?: number;
  servicesTotal?: number;
  quota: QuotaInfo | null;
  loading: LoadingStateSubset;
  onAppsClick: () => void;
  onServicesClick: () => void;
  onNetworksClick: () => void;
}

export function StatsOverviewSection(props: StatsOverviewSectionProps) {
  const { appsTotal, networksTotal, servicesTotal, quota, loading } = props;
  const { t } = usePageTranslation();

  return (
    <Box>
      <Heading size='5' weight='medium' mb='3' style={{ color: 'var(--gray-12)' }}>
        {t('stats.overview.title')}
      </Heading>
      <Grid columns={{ initial: '1', sm: '3' }} gap='4' className={styles.statsGrid}>
        {/* Apps Stats */}
        {loading.apps ? (
          <SkeletonStatItem />
        ) : (
          <Box className={styles.statItem} onClick={props.onAppsClick}>
            <Flex align='center' gap='3' mb='3'>
              <div className={styles.iconContainer} style={{ backgroundColor: 'var(--blue-3)' }}>
                <RocketIcon color='var(--blue-11)' />
              </div>
              <Box>
                <Text size='3' weight='medium' color='gray'>
                  {t('stats.apps.title')}
                </Text>
                <Heading size='6' weight='bold'>
                  {appsTotal}
                </Heading>
              </Box>
              <ArrowRightIcon className={styles.arrowIcon} />
            </Flex>
            <Text size='2' color='gray' mb='2'>
              {t('stats.apps.subtitle')}
            </Text>
            {quota && (
              <Box>
                <Flex justify='between' mb='1'>
                  <Text size='1' color='gray'>
                    {t('stats.quota.usage')}
                  </Text>
                  <Text size='1' color='gray'>
                    {appsTotal}/{quota.apps_quota}
                  </Text>
                </Flex>
                <Progress
                  value={getResourceUsagePercentage(appsTotal, quota.apps_quota)}
                  color={getUsageColor(getResourceUsagePercentage(appsTotal, quota.apps_quota))}
                />
              </Box>
            )}
          </Box>
        )}

        {/* Services Stats */}
        {loading.services ? (
          <SkeletonStatItem />
        ) : (
          <Box className={styles.statItem} onClick={props.onServicesClick}>
            <Flex align='center' gap='3' mb='3'>
              <div className={styles.iconContainer} style={{ backgroundColor: 'var(--purple-3)' }}>
                <CubeIcon color='var(--purple-11)' />
              </div>
              <Box>
                <Text size='3' weight='medium' color='gray'>
                  {t('stats.services.title')}
                </Text>
                <Heading size='6' weight='bold'>
                  {servicesTotal}
                </Heading>
              </Box>
              <ArrowRightIcon className={styles.arrowIcon} />
            </Flex>
            <Text size='2' color='gray' mb='2'>
              {t('stats.services.subtitle')}
            </Text>
            {quota && (
              <Box>
                <Flex justify='between' mb='1'>
                  <Text size='1' color='gray'>
                    {t('stats.quota.usage')}
                  </Text>
                  <Text size='1' color='gray'>
                    {servicesTotal}/{quota.services_quota}
                  </Text>
                </Flex>
                <Progress
                  value={getResourceUsagePercentage(servicesTotal, quota.services_quota)}
                  color={getUsageColor(
                    getResourceUsagePercentage(servicesTotal, quota.services_quota)
                  )}
                />
              </Box>
            )}
          </Box>
        )}

        {/* Networks Stats */}
        {loading.networks ? (
          <SkeletonStatItem />
        ) : (
          <Box className={styles.statItem} onClick={props.onNetworksClick}>
            <Flex align='center' gap='3' mb='3'>
              <div className={styles.iconContainer} style={{ backgroundColor: 'var(--green-3)' }}>
                <GlobeIcon color='var(--green-11)' />
              </div>
              <Box>
                <Text size='3' weight='medium' color='gray'>
                  {t('stats.networks.title')}
                </Text>
                <Heading size='6' weight='bold'>
                  {networksTotal}
                </Heading>
              </Box>
              <ArrowRightIcon className={styles.arrowIcon} />
            </Flex>
            <Text size='2' color='gray' mb='2'>
              {t('stats.networks.subtitle')}
            </Text>
            {quota && (
              <Box>
                <Flex justify='between' mb='1'>
                  <Text size='1' color='gray'>
                    {t('stats.quota.usage')}
                  </Text>
                  <Text size='1' color='gray'>
                    {networksTotal}/{quota.networks_quota}
                  </Text>
                </Flex>
                <Progress
                  value={getResourceUsagePercentage(networksTotal, quota.networks_quota)}
                  color={getUsageColor(
                    getResourceUsagePercentage(networksTotal, quota.networks_quota)
                  )}
                />
              </Box>
            )}
          </Box>
        )}
      </Grid>
    </Box>
  );
}
