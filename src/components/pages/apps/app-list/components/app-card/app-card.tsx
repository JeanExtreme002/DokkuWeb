import { EyeOpenIcon } from '@radix-ui/react-icons';
import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes';

import styles from '../../app-list.module.css';
import { AppListItem } from '../../types';
import {
  formatAppName,
  formatStartedAt,
  getContainerInfo,
  getPortInfo,
  getProcessInfo,
  getStatusInfo,
  getUptime,
} from '../../utils';
import { AppAvatar } from '../app-avatar';

export function AppCard({ appItem, isMobile }: { appItem: AppListItem; isMobile: boolean }) {
  const statusInfo = appItem.info ? getStatusInfo(appItem.info) : null;
  const displayName = formatAppName(appItem.name);
  const processInfo = appItem.info
    ? getProcessInfo(appItem.info)
    : { processType: 'web', processCount: 0 };
  const containerInfo = appItem.info ? getContainerInfo(appItem.info) : null;

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
      onClick={isMobile ? undefined : () => (window.location.href = `/apps/a/${displayName}`)}
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
        <AppAvatar />

        {/* Main information */}
        <Flex direction='column' className={styles.appInfo}>
          <Flex align='center' gap='2'>
            <Heading size='4' weight='medium' style={{ color: 'var(--gray-12)' }}>
              {displayName}
            </Heading>
            <Text size='2' style={{ color: 'var(--gray-9)' }}>
              • {processInfo.processType}
            </Text>
            {processInfo.processCount > 1 && (
              <Text size='2' style={{ color: 'var(--gray-9)' }}>
                ({processInfo.processCount} processos)
              </Text>
            )}
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
              {containerInfo?.State.StartedAt && statusInfo.text === 'Ativo' && (
                <Text size='2' style={{ color: 'var(--gray-9)' }}>
                  • {getUptime(containerInfo.State.StartedAt)}
                </Text>
              )}
            </Flex>
          )}

          {/* Technical information — only for inspected apps */}
          {containerInfo?.NetworkSettings?.Networks?.bridge?.IPAddress && (
            <Flex align='center' gap='2'>
              <Text size='2' style={{ color: 'var(--gray-9)', fontWeight: '500' }}>
                IP:
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
                    Porta:
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
              ? `Iniciado em ${formatStartedAt(containerInfo.State.StartedAt)}`
              : 'Não inicializado'}
          </Text>

          <Button
            size='3'
            color='blue'
            variant='outline'
            style={{ cursor: 'pointer' }}
            onClick={() => (window.location.href = `/apps/a/${displayName}`)}
          >
            <EyeOpenIcon />
            Ver detalhes
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
