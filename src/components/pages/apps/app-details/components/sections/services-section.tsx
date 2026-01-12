import { Box, Card, Flex, Heading, Text } from '@radix-ui/themes';
import Image from 'next/image';
import React from 'react';

import { formatDatabaseType, formatServiceName, getServiceImage } from '@/lib';

import styles from '../../app-details.module.css';

interface ServicesSectionProps {
  servicesLoading: boolean;
  errorServices: string | null | undefined;
  databases: Record<string, string[]>;
  onOpenService: (dbType: string, displayName: string) => void;
}

export default function ServicesSection(props: ServicesSectionProps) {
  const { servicesLoading, errorServices, databases, onOpenService } = props;

  return (
    <Flex direction='column' gap='4'>
      <Heading size='5' style={{ color: 'var(--gray-12)' }}>
        Serviços Conectados
      </Heading>

      {servicesLoading ? (
        <Box className={styles.loadingSpinner}>
          <Box className={styles.spinner}></Box>
          <Text style={{ marginLeft: '12px' }}>Carregando serviços...</Text>
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
                Nenhum serviço conectado a este aplicativo.
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
                      style={{
                        border: '1px solid var(--gray-6)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        padding: '20px',
                      }}
                      onClick={() => onOpenService(dbType, displayName)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
                      }}
                    >
                      <Flex align='center' gap='4' style={{ width: '100%' }}>
                        {/* Service Icon */}
                        <Box style={{ flexShrink: 0 }}>
                          <Image
                            src={getServiceImage(dbType)}
                            alt={`${serviceType} logo`}
                            width={48}
                            height={48}
                            style={{ borderRadius: '8px' }}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                '/images/database-logos/generic.svg';
                            }}
                          />
                        </Box>

                        {/* Service Info */}
                        <Flex direction='column' gap='1' style={{ flex: 1 }}>
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
                              Vinculado
                            </Text>
                          </Flex>
                        </Flex>

                        {/* Arrow Icon */}
                        <Box
                          style={{
                            flexShrink: 0,
                            color: 'var(--gray-9)',
                            fontSize: '20px',
                            fontWeight: 'bold',
                          }}
                        >
                          →
                        </Box>
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
