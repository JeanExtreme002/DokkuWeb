import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon, DashboardIcon, GearIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { Badge, Box, Flex, Text } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../home.module.css';

interface SystemInfo {
  version: string;
  dokkuVersion: string;
  dokkuStatus: boolean;
}

interface PlatformInfoAccordionProps {
  systemInfo: SystemInfo | null;
}

export function PlatformInfoAccordion(props: PlatformInfoAccordionProps) {
  const { systemInfo } = props;
  const { t } = usePageTranslation();
  if (!systemInfo) return null;

  return (
    <Accordion.Root type='single' collapsible>
      <Accordion.Item value='platform-info'>
        <Accordion.Header>
          <Accordion.Trigger className={styles.accordionTrigger}>
            <Flex align='center' gap='3'>
              <InfoCircledIcon
                width='18'
                height='18'
                style={{ color: 'var(--blue-9)' }}
                className={styles.accordionHeaderIcon}
              />
              <Text size='4' weight='bold' className={styles.accordionHeaderText}>
                {t('platform.info.title')}
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
          <Flex direction='column' gap='3'>
            <Flex align='center' justify='between' p='3' className={styles.platformInfoCard}>
              <Flex align='center' gap='3'>
                <Box
                  className={styles.platformIcon}
                  style={{
                    background: 'linear-gradient(135deg, var(--blue-4), var(--purple-4))',
                    color: 'var(--blue-11)',
                  }}
                >
                  <DashboardIcon width='18' height='18' />
                </Box>
                <Flex direction={'column'}>
                  <Text size='3' weight='bold' style={{ color: 'var(--gray-12)' }}>
                    Dokku Platform
                  </Text>
                  <Text size='2' style={{ color: 'var(--gray-10)' }}>
                    {systemInfo.dokkuVersion}
                  </Text>
                </Flex>
              </Flex>
              <Badge color='blue' variant='soft' size='2' className={styles.platformBadge}>
                Platform as a Service
              </Badge>
            </Flex>

            <Flex align='center' justify='between' p='3' className={styles.platformInfoCard}>
              <Flex align='center' gap='3'>
                <Box
                  className={styles.platformIcon}
                  style={{
                    background: 'linear-gradient(135deg, var(--green-4), var(--blue-4))',
                    color: 'var(--green-11)',
                  }}
                >
                  <GearIcon width='18' height='18' />
                </Box>
                <Flex direction={'column'}>
                  <Text size='3' weight='bold' style={{ color: 'var(--gray-12)' }}>
                    Dokku API
                  </Text>
                  <Text size='2' style={{ color: 'var(--gray-10)' }}>
                    {systemInfo.version}
                  </Text>
                </Flex>
              </Flex>
              <Badge color='green' variant='soft' size='2' className={styles.platformBadge}>
                Server-side
              </Badge>
            </Flex>
          </Flex>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
