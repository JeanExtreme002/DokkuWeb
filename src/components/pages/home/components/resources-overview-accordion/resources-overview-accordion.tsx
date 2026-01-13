import * as Accordion from '@radix-ui/react-accordion';
import {
  ActivityLogIcon,
  ChevronDownIcon,
  ComponentInstanceIcon,
  GearIcon,
  GlobeIcon,
  LayersIcon,
  RocketIcon,
} from '@radix-ui/react-icons';
import { Flex, Grid, Text } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../home.module.css';
import type { DetailedResourcesData, LoadingStateSubset } from '../../types';
import { SkeletonResourceCard } from '../skeleton';
import { ResourceCard } from './resource-card';

interface ResourcesOverviewAccordionProps {
  loading: LoadingStateSubset;
  appsTotal?: number;
  servicesTotal?: number;
  networksTotal?: number;
  detailed: DetailedResourcesData;
  onAppsClick: () => void;
  onServicesClick: () => void;
  onNetworksClick: () => void;
}

export function ResourcesOverviewAccordion(props: ResourcesOverviewAccordionProps) {
  const { loading, appsTotal, servicesTotal, networksTotal, detailed } = props;
  const { t } = usePageTranslation();

  return (
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
                {t('resources.overview.title')}
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
          <Grid columns={{ initial: '1', sm: '3' }} gap='4' className={styles.resourcesGrid}>
            {/* Apps Card */}
            {loading.apps || appsTotal === undefined || detailed.apps.length < (appsTotal || 0) ? (
              <SkeletonResourceCard type='apps' />
            ) : (
              <ResourceCard
                type='apps'
                title={t('resources.apps.title')}
                count={detailed.apps.length}
                icon={<RocketIcon width='18' height='18' />}
                detailIcon={
                  <LayersIcon width='12' height='12' style={{ color: 'var(--gray-9)' }} />
                }
                items={detailed.apps}
                onClick={props.onAppsClick}
              />
            )}

            {/* Services Card */}
            {loading.services ||
            servicesTotal === undefined ||
            detailed.services.length < (servicesTotal || 0) ? (
              <SkeletonResourceCard type='services' />
            ) : (
              <ResourceCard
                type='services'
                title={t('resources.services.title')}
                count={detailed.services.length}
                icon={<GearIcon width='18' height='18' />}
                detailIcon={
                  <ComponentInstanceIcon
                    width='12'
                    height='12'
                    style={{ color: 'var(--gray-9)' }}
                  />
                }
                items={detailed.services}
                onClick={props.onServicesClick}
              />
            )}

            {/* Networks Card */}
            {loading.networks ||
            networksTotal === undefined ||
            detailed.networks.length < (networksTotal || 0) ? (
              <SkeletonResourceCard type='networks' />
            ) : (
              <ResourceCard
                type='networks'
                title={t('resources.networks.title')}
                count={detailed.networks.length}
                icon={<GlobeIcon width='18' height='18' />}
                detailIcon={
                  <ActivityLogIcon width='12' height='12' style={{ color: 'var(--gray-9)' }} />
                }
                items={detailed.networks}
                onClick={props.onNetworksClick}
              />
            )}
          </Grid>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
