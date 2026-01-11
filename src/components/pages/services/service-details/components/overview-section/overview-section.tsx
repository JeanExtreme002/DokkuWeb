import { Box, Flex, Heading, Text } from '@radix-ui/themes';

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
  return (
    <Flex direction='column' gap='4'>
      <Heading size='5' style={{ marginBottom: '20px' }}>
        Informações do Serviço
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
              Status
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
              Versão
            </Text>
            <Text
              size='3'
              className={styles.overviewValue}
              style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
            >
              {serviceData && serviceData.version
                ? formatVersion(serviceData.version)
                : 'Indisponível'}
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
              IP Interno
            </Text>
            <Text
              size='3'
              className={styles.overviewValue}
              style={{ fontFamily: 'monospace', color: 'var(--gray-12)' }}
            >
              {serviceData?.internal_ip || 'Indisponível'}
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
              ID do Container
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
                Portas Expostas
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
              Diretório de Dados
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
              Diretório de Configuração
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
              Diretório Raiz
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
