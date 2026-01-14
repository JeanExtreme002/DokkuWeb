import { Box, Flex, Heading, Text } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../service-details.module.css';

interface OverviewSectionProps {
  serviceData: {
    internal_ip?: string;
    id?: string;
    exposed_ports?: string;
    data_dir?: string;
    config_dir?: string;
    service_root?: string;
    version?: string;
  } | null;
  statusText: string;
  formatVersion: (version: string) => string;
}

export function OverviewSection({ serviceData, statusText, formatVersion }: OverviewSectionProps) {
  const { t } = usePageTranslation();
  return (
    <Flex direction='column' gap='4'>
      <Heading size='5' style={{ marginBottom: '20px' }}>
        {t('services.s.overview.title')}
      </Heading>

      <Flex direction='column' gap='4'>
        <Box style={{ borderBottom: '1px solid var(--gray-6)', paddingBottom: '8px' }}>
          <Flex
            direction={{ initial: 'column', sm: 'row' }}
            justify={{ sm: 'between' }}
            align={{ sm: 'center' }}
            gap='1'
          >
            <Text
              size='3'
              weight='medium'
              className={styles.overviewLabel}
              style={{ color: 'var(--gray-11)' }}
            >
              {t('services.s.overview.labels.status')}
            </Text>
            <Text size='3' className={styles.overviewValue} style={{ color: 'var(--gray-12)' }}>
              {statusText}
            </Text>
          </Flex>
        </Box>

        <Box style={{ borderBottom: '1px solid var(--gray-6)', paddingBottom: '8px' }}>
          <Flex
            direction={{ initial: 'column', sm: 'row' }}
            justify={{ sm: 'between' }}
            align={{ sm: 'center' }}
            gap='1'
          >
            <Text
              size='3'
              weight='medium'
              className={styles.overviewLabel}
              style={{ color: 'var(--gray-11)' }}
            >
              {t('services.s.overview.labels.version')}
            </Text>
            <Text
              size='3'
              className={styles.overviewValue}
              style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
            >
              {serviceData && serviceData.version
                ? formatVersion(serviceData.version)
                : t('services.s.overview.fallbacks.unavailable')}
            </Text>
          </Flex>
        </Box>

        <Box style={{ borderBottom: '1px solid var(--gray-6)', paddingBottom: '8px' }}>
          <Flex
            direction={{ initial: 'column', sm: 'row' }}
            justify={{ sm: 'between' }}
            align={{ sm: 'center' }}
            gap='1'
          >
            <Text
              size='3'
              weight='medium'
              className={styles.overviewLabel}
              style={{ color: 'var(--gray-11)' }}
            >
              {t('services.s.overview.labels.internalIp')}
            </Text>
            <Text
              size='3'
              className={styles.overviewValue}
              style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
            >
              {serviceData?.internal_ip || t('services.s.overview.fallbacks.unavailable')}
            </Text>
          </Flex>
        </Box>

        <Box style={{ borderBottom: '1px solid var(--gray-6)', paddingBottom: '8px' }}>
          <Flex
            direction={{ initial: 'column', sm: 'row' }}
            justify={{ sm: 'between' }}
            align={{ sm: 'center' }}
            gap='1'
          >
            <Text
              size='3'
              weight='medium'
              className={styles.overviewLabel}
              style={{ color: 'var(--gray-11)' }}
            >
              {t('services.s.overview.labels.containerId')}
            </Text>
            <Text
              size='3'
              className={styles.overviewValue}
              style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
            >
              {serviceData?.id || 'N/A'}
            </Text>
          </Flex>
        </Box>

        {serviceData?.exposed_ports !== '-' && (
          <Box style={{ borderBottom: '1px solid var(--gray-6)', paddingBottom: '8px' }}>
            <Flex
              direction={{ initial: 'column', sm: 'row' }}
              justify={{ sm: 'between' }}
              align={{ sm: 'center' }}
              gap='1'
            >
              <Text
                size='3'
                weight='medium'
                className={styles.overviewLabel}
                style={{ color: 'var(--gray-11)' }}
              >
                {t('services.s.overview.labels.exposedPorts')}
              </Text>
              <Text
                size='3'
                className={styles.overviewValue}
                style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
              >
                {serviceData?.exposed_ports}
              </Text>
            </Flex>
          </Box>
        )}

        <Box style={{ borderBottom: '1px solid var(--gray-6)', paddingBottom: '8px' }}>
          <Flex
            direction={{ initial: 'column', sm: 'row' }}
            justify={{ sm: 'between' }}
            align={{ sm: 'center' }}
            gap='1'
          >
            <Text
              size='3'
              weight='medium'
              className={styles.overviewLabel}
              style={{ color: 'var(--gray-11)' }}
            >
              {t('services.s.overview.labels.dataDir')}
            </Text>
            <Text
              size='3'
              className={styles.overviewValue}
              style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
            >
              {serviceData?.data_dir || '-'}
            </Text>
          </Flex>
        </Box>

        <Box style={{ borderBottom: '1px solid var(--gray-6)', paddingBottom: '8px' }}>
          <Flex
            direction={{ initial: 'column', sm: 'row' }}
            justify={{ sm: 'between' }}
            align={{ sm: 'center' }}
            gap='1'
          >
            <Text
              size='3'
              weight='medium'
              className={styles.overviewLabel}
              style={{ color: 'var(--gray-11)' }}
            >
              {t('services.s.overview.labels.configDir')}
            </Text>
            <Text
              size='3'
              className={styles.overviewValue}
              style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
            >
              {serviceData?.config_dir || '-'}
            </Text>
          </Flex>
        </Box>

        <Box style={{ paddingBottom: '8px' }}>
          <Flex
            direction={{ initial: 'column', sm: 'row' }}
            justify={{ sm: 'between' }}
            align={{ sm: 'center' }}
            gap='1'
          >
            <Text
              size='3'
              weight='medium'
              className={styles.overviewLabel}
              style={{ color: 'var(--gray-11)' }}
            >
              {t('services.s.overview.labels.rootDir')}
            </Text>
            <Text
              size='3'
              className={styles.overviewValue}
              style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
            >
              {serviceData?.service_root || '-'}
            </Text>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
}
