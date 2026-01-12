import { EyeOpenIcon } from '@radix-ui/react-icons';
import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes';
import Image from 'next/image';
import React from 'react';

import { getServiceImage } from '@/lib';

import styles from '../../service-list.module.css';
import { formatDatabaseType, formatServiceName } from '../../utils';

interface ServiceCardSkeletonProps {
  pluginType: string;
  serviceName: string;
  isMobile: boolean;
}

export function ServiceCardSkeleton({
  pluginType,
  serviceName,
  isMobile,
}: ServiceCardSkeletonProps) {
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
}
