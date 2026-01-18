import { EyeOpenIcon } from '@radix-ui/react-icons';
import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes';

import { AppAvatar } from '@/components/shared';
import { usePageTranslation } from '@/i18n/utils';
import { formatAppName } from '@/lib';

import styles from '../../app-list.module.css';
import { AppListItem } from '../../types';
import {
  formatStartedAt,
  getContainerInfo,
  getPortInfo,
  getProcessInfo,
  getUptime,
  parseSharedName,
  useStatusInfo,
} from '../../utils';

export function AppCard({ appItem, isMobile }: { appItem: AppListItem; isMobile: boolean }) {
  const { t } = usePageTranslation();
  const statusInfo = useStatusInfo(appItem?.info);
  const displayName = formatAppName(appItem.name);
  const processInfo = appItem.info
    ? getProcessInfo(appItem.info)
    : { processType: 'web', processCount: 0 };
  const containerInfo = appItem.info ? getContainerInfo(appItem.info) : null;

  const { sharedBy, pureName } = parseSharedName(appItem.name);
  const appName = formatAppName(pureName);
  const detailsUrl = sharedBy
    ? `/apps/a/${appName}?shared_by=${encodeURIComponent(sharedBy)}`
    : `/apps/a/${appName}`;

  return (
    <Card
      key={appItem.name}
      style={{
        border: '1px solid var(--gray-6)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease',
        cursor: isMobile ? 'default' : 'pointer',
      }}
      className={styles.appCard}
      onClick={isMobile ? undefined : () => (window.location.href = detailsUrl)}
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
      <Flex className={styles.appCardContent} style={{ alignItems: 'flex-start' }}>
        {/* App icon */}
        <AppAvatar size='6' />

        {/* Main information */}
        <Flex direction='column' className={styles.appInfo}>
          <Flex align='center' gap='2'>
            <Heading size='4' weight='medium' style={{ color: 'var(--gray-12)' }}>
              {displayName}
            </Heading>
            <Text size='2' style={{ color: 'var(--gray-9)' }}>
              • {processInfo.processType}
            </Text>
          </Flex>

          {/* Status with colored circle */}
          {statusInfo && (
            <Flex align='center' gap='2'>
              <Box
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: statusInfo.color,
                }}
              />
              <Text size='2' weight='medium' style={{ color: 'var(--gray-11)' }}>
                {statusInfo.text}
              </Text>

              {/* Uptime — only shows for inspected and active apps */}
              {containerInfo?.State.StartedAt && statusInfo.text === t('status.active') && (
                <Text size='2' style={{ color: 'var(--gray-9)' }}>
                  {(() => {
                    const uptime = getUptime(containerInfo.State.StartedAt);
                    const text = uptime === 'N/A' ? t('card.na') : uptime;
                    return `• ${text}`;
                  })()}
                </Text>
              )}
            </Flex>
          )}

          {/* Technical information — only for inspected apps */}
          {containerInfo?.NetworkSettings?.Networks?.bridge?.IPAddress && (
            <Flex align='center' gap='2'>
              <Text size='2' style={{ color: 'var(--gray-9)', fontWeight: '500' }}>
                {t('card.ipLabel')}
              </Text>
              <Text size='2' style={{ color: 'var(--gray-10)', fontFamily: 'monospace' }}>
                {containerInfo.NetworkSettings?.Networks?.bridge?.IPAddress}
              </Text>
              {getPortInfo(containerInfo) && (
                <>
                  <Text size='2' style={{ color: 'var(--gray-9)', fontWeight: '500' }}>
                    •
                  </Text>
                  <Text size='2' style={{ color: 'var(--gray-9)', fontWeight: '500' }}>
                    {t('card.portLabel')}
                  </Text>
                  <Text size='2' style={{ color: 'var(--gray-10)', fontFamily: 'monospace' }}>
                    {getPortInfo(containerInfo)}
                  </Text>
                </>
              )}
            </Flex>
          )}
        </Flex>

        {/* Startup date and button */}
        <Flex direction='column' className={styles.appActions}>
          <Text
            size='2'
            style={{
              color: 'var(--gray-9)',
              textAlign: 'right',
              whiteSpace: 'nowrap',
            }}
            className={styles.dateText}
          >
            {containerInfo?.State.StartedAt
              ? (() => {
                  const formatted = formatStartedAt(containerInfo.State.StartedAt);
                  return t('card.startedAt', { date: formatted });
                })()
              : t('card.notStarted')}
          </Text>

          <Button
            size='3'
            color='blue'
            variant='outline'
            style={{ cursor: 'pointer' }}
            onClick={() => (window.location.href = detailsUrl)}
          >
            <EyeOpenIcon />
            {t('card.viewDetails')}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
