import { ChevronRightIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes';
import Image from 'next/image';
import React from 'react';

import { usePageTranslation } from '@/i18n/utils';
import { formatDatabaseType, formatServiceName, getServiceImage } from '@/lib';

import styles from '../../app-details.module.css';

interface ServicesSectionProps {
  servicesLoading: boolean;
  errorServices: string | null | undefined;
  databases: Record<string, string[]>;
  isXsScreen: boolean;
  isSmScreen: boolean;
  isMdScreen: boolean;
  onOpenService: (dbType: string, displayName: string) => void;
  onCreateService: () => void;
  onUnlinkService: (dbType: string, dbName: string) => void;
}

export default function ServicesSection(props: ServicesSectionProps) {
  const {
    servicesLoading,
    errorServices,
    databases,
    isXsScreen,
    isSmScreen,
    isMdScreen,
    onOpenService,
    onCreateService,
    onUnlinkService,
  } = props;
  const { t } = usePageTranslation();

  return (
    <Flex direction='column' gap='4'>
      <Flex className={styles.servicesHeader}>
        <Heading size='5' style={{ color: 'var(--gray-12)' }}>
          {t('servicesSection.title')}
        </Heading>
        <Button
          onClick={onCreateService}
          style={{
            background: 'linear-gradient(135deg, var(--green-9) 0%, var(--green-10) 100%)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          <PlusIcon />
          {t('servicesSection.addService')}
        </Button>
      </Flex>

      {servicesLoading ? (
        <Box className={styles.loadingSpinner}>
          <Box className={styles.spinner}></Box>
          <Text style={{ marginLeft: '12px' }}>{t('servicesSection.loading')}</Text>
        </Box>
      ) : errorServices ? (
        <Card
          style={{
            border: '1px solid var(--red-6)',
            backgroundColor: 'var(--red-2)',
            padding: '20px',
          }}
        >
          <Text style={{ color: 'var(--red-11)' }}>{errorServices}</Text>
        </Card>
      ) : (
        <Box>
          {Object.keys(databases).length === 0 ? (
            <Card
              style={{
                border: '1px solid var(--gray-6)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                padding: '40px',
                textAlign: 'center',
              }}
            >
              <Text size='3' color='gray'>
                {t('servicesSection.empty')}
              </Text>
            </Card>
          ) : (
            <Flex direction='column' gap='4'>
              {Object.entries(databases).map(([dbType, dbList]) =>
                dbList.map((dbName) => {
                  const displayName = formatServiceName(dbName);
                  const serviceType = formatDatabaseType(dbType);

                  return (
                    <Card
                      key={dbName}
                      className={styles.serviceLinkedCard}
                      style={{
                        border: '1px solid var(--gray-6)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                        transition: 'all 0.2s ease',
                        width: '100%',
                      }}
                    >
                      <Flex direction='column' style={{ padding: '16px 20px', width: '100%' }}>
                        {/* Main content row */}
                        <Flex
                          align='center'
                          justify='between'
                          style={{ width: '100%', cursor: 'pointer' }}
                          onClick={() => onOpenService(dbType, displayName)}
                        >
                          <Flex align='center' gap='4'>
                            <Box style={{ flexShrink: 0 }}>
                              <Image
                                src={getServiceImage(dbType)}
                                alt={`${serviceType} logo`}
                                width={65}
                                height={65}
                                style={{ borderRadius: '8px' }}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src =
                                    '/images/database-logos/generic.svg';
                                }}
                              />
                            </Box>

                            <Flex direction='column' gap='1'>
                              <Heading size='4' weight='medium' style={{ color: 'var(--gray-12)' }}>
                                {displayName}
                              </Heading>
                              <Text size='2' style={{ color: 'var(--gray-9)' }}>
                                {serviceType}
                              </Text>
                              <Flex align='center' gap='2' style={{ marginTop: '4px' }}>
                                <Box
                                  style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--green-9)',
                                  }}
                                />
                                <Text size='2' weight='medium' style={{ color: 'var(--gray-11)' }}>
                                  {t('servicesSection.linked')}
                                </Text>
                              </Flex>
                            </Flex>
                          </Flex>

                          {/* Desktop: Show buttons on the right */}
                          {!isXsScreen && !isSmScreen && (
                            <Flex align='center' gap='2'>
                              <Button
                                size='1'
                                variant='surface'
                                color='red'
                                className={styles.serviceUnlinkButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUnlinkService(dbType, dbName);
                                }}
                                style={{ position: 'relative', zIndex: 2 }}
                              >
                                <TrashIcon />
                                {!isMdScreen && (
                                  <span style={{ marginLeft: '4px' }}>
                                    {t('servicesSection.unlink')}
                                  </span>
                                )}
                              </Button>

                              <ChevronRightIcon
                                className={styles.serviceCardChevron}
                                style={{
                                  color: 'var(--gray-9)',
                                  width: '20px',
                                  height: '20px',
                                  transition: 'all 0.2s ease',
                                }}
                              />
                            </Flex>
                          )}

                          {/* Mobile: Show only chevron */}
                          {(isXsScreen || isSmScreen) && (
                            <ChevronRightIcon
                              className={styles.serviceCardChevron}
                              style={{
                                color: 'var(--gray-9)',
                                width: '20px',
                                height: '20px',
                                transition: 'all 0.2s ease',
                              }}
                            />
                          )}
                        </Flex>

                        {/* Mobile: Show unlink button below */}
                        {(isXsScreen || isSmScreen) && (
                          <Button
                            size='2'
                            variant='surface'
                            color='red'
                            className={`${styles.serviceUnlinkButton} ${styles.serviceUnlinkButtonMobile}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onUnlinkService(dbType, dbName);
                            }}
                            style={{ width: '100%', marginTop: '25px', justifyContent: 'center' }}
                          >
                            <TrashIcon />
                            <span style={{ marginLeft: '6px' }}>{t('servicesSection.unlink')}</span>
                          </Button>
                        )}
                      </Flex>
                    </Card>
                  );
                })
              )}
            </Flex>
          )}
        </Box>
      )}
    </Flex>
  );
}
