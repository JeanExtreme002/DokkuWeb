import { Box, Flex, Heading, Text } from '@radix-ui/themes';
import Image from 'next/image';

import styles from '../../service-details.module.css';

interface StatusInfo {
  color: string;
  text: string;
  bgColor: string;
}

interface HeaderSectionProps {
  displayName: string;
  serviceType: string;
  statusInfo: StatusInfo;
  serviceImageSrc: string;
  versionText: string | null;
}

export function HeaderSection({
  displayName,
  serviceType,
  statusInfo,
  serviceImageSrc,
  versionText,
}: HeaderSectionProps) {
  return (
    <Box className={styles.headerSection}>
      <Flex align='center' gap='4'>
        <Image
          src={serviceImageSrc}
          alt={`${serviceType} logo`}
          width={64}
          height={64}
          className={styles.serviceImage}
          onError={(e) => {
            e.currentTarget.src = '/images/database-logos/generic.svg';
          }}
        />

        <Flex direction='column' gap='2'>
          <Flex align='center' gap='3'>
            <Heading
              size='8'
              weight='bold'
              className={styles.serviceName}
              style={{ color: 'var(--gray-12)' }}
            >
              {displayName}
            </Heading>
            <Flex
              align='center'
              gap='2'
              className={styles.statusBadge}
              style={{
                padding: '4px 12px',
                borderRadius: '16px',
                backgroundColor: statusInfo.bgColor,
              }}
            >
              <Box
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: statusInfo.color,
                }}
              />
              <Text size='2' weight='medium' style={{ color: statusInfo.color }}>
                {statusInfo.text}
              </Text>
            </Flex>
          </Flex>

          <Text size='4' className={styles.serviceTypeVersion} style={{ color: 'var(--gray-11)' }}>
            {serviceType} {versionText || ''}
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}
