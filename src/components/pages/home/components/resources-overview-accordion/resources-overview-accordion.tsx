import * as Accordion from '@radix-ui/react-accordion';
import {
  ActivityLogIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ComponentInstanceIcon,
  CrossCircledIcon,
  GearIcon,
  GlobeIcon,
  LayersIcon,
  RocketIcon,
} from '@radix-ui/react-icons';
import { Badge, Box, Flex, Grid, Text } from '@radix-ui/themes';

import styles from '../../home.module.css';
import type { DetailedResourcesData, LoadingStateSubset } from '../../types';
import { SkeletonResourceCard } from '../skeleton';

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
          <Grid columns={{ initial: '1', sm: '3' }} gap='4' className={styles.resourcesGrid}>
            {/* Apps Card */}
            {loading.apps || appsTotal === undefined || detailed.apps.length < (appsTotal || 0) ? (
              <SkeletonResourceCard type='apps' />
            ) : (
              <Box className={styles.resourceCard} onClick={props.onAppsClick}>
                <Flex align='center' justify='between' mb='3'>
                  <Flex align='center' gap='3'>
                    <div className={styles.resourceIcon} data-type='apps'>
                      <RocketIcon width='18' height='18' />
                    </div>
                    <Box>
                      <Flex align='center' gap='2' mb='1'>
                        <Text size='3' weight='bold' className={styles.resourceTitle}>
                          Aplicativos
                        </Text>
                      </Flex>
                      <Flex align='center' gap='2'>
                        <LayersIcon width='12' height='12' style={{ color: 'var(--gray-9)' }} />
                        <Text size='1' className={styles.resourceCount}>
                          {detailed.apps.length} total
                        </Text>
                      </Flex>
                    </Box>
                  </Flex>
                  <ArrowRightIcon width='16' height='16' style={{ color: 'var(--gray-9)' }} />
                </Flex>

                <Box className={styles.resourceList}>
                  {detailed.apps.length > 0 ? (
                    <>
                      {detailed.apps.slice(0, 3).map((app, idx) => (
                        <Flex key={idx} align='center' gap='2' className={styles.resourceListItem}>
                          <div className={styles.statusIndicator} data-status='active' />
                          <Text size='2' className={styles.resourceName}>
                            {app.name}
                          </Text>
                        </Flex>
                      ))}
                      {detailed.apps.length > 3 && (
                        <Text size='1' className={styles.moreItems}>
                          +{detailed.apps.length - 3} mais
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
            {loading.services ||
            servicesTotal === undefined ||
            detailed.services.length < (servicesTotal || 0) ? (
              <SkeletonResourceCard type='services' />
            ) : (
              <Box className={styles.resourceCard} onClick={props.onServicesClick}>
                <Flex align='center' justify='between' mb='3'>
                  <Flex align='center' gap='3'>
                    <div className={styles.resourceIcon} data-type='services'>
                      <GearIcon width='18' height='18' />
                    </div>
                    <Box>
                      <Flex align='center' gap='2' mb='1'>
                        <Text size='3' weight='bold' className={styles.resourceTitle}>
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
                          {detailed.services.length} total
                        </Text>
                      </Flex>
                    </Box>
                  </Flex>
                  <ArrowRightIcon width='16' height='16' style={{ color: 'var(--gray-9)' }} />
                </Flex>

                <Box className={styles.resourceList}>
                  {detailed.services.length > 0 ? (
                    <>
                      {detailed.services.slice(0, 3).map((service, idx) => (
                        <Flex key={idx} align='center' gap='2' className={styles.resourceListItem}>
                          <div className={styles.statusIndicator} data-status='active' />
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
                      {detailed.services.length > 3 && (
                        <Text size='1' className={styles.moreItems}>
                          +{detailed.services.length - 3} mais
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
            {loading.networks ||
            networksTotal === undefined ||
            detailed.networks.length < (networksTotal || 0) ? (
              <SkeletonResourceCard type='networks' />
            ) : (
              <Box className={styles.resourceCard} onClick={props.onNetworksClick}>
                <Flex align='center' justify='between' mb='3'>
                  <Flex align='center' gap='3'>
                    <div className={styles.resourceIcon} data-type='networks'>
                      <GlobeIcon width='18' height='18' />
                    </div>
                    <Box>
                      <Flex align='center' gap='2' mb='1'>
                        <Text size='3' weight='bold' className={styles.resourceTitle}>
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
                          {detailed.networks.length} total
                        </Text>
                      </Flex>
                    </Box>
                  </Flex>
                  <ArrowRightIcon width='16' height='16' style={{ color: 'var(--gray-9)' }} />
                </Flex>

                <Box className={styles.resourceList}>
                  {detailed.networks.length > 0 ? (
                    <>
                      {detailed.networks.slice(0, 3).map((network, idx) => (
                        <Flex key={idx} align='center' gap='2' className={styles.resourceListItem}>
                          <div className={styles.statusIndicator} data-status='active' />
                          <Text size='2' className={styles.resourceName}>
                            {network.name}
                          </Text>
                        </Flex>
                      ))}
                      {detailed.networks.length > 3 && (
                        <Text size='1' className={styles.moreItems}>
                          +{detailed.networks.length - 3} mais
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
  );
}
