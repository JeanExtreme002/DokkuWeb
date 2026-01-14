import { EyeOpenIcon } from '@radix-ui/react-icons';
import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes';

import { AppAvatar } from '@/components/shared';
import { usePageTranslation } from '@/i18n/utils';
import { formatAppName } from '@/lib';

import searchStyles from '../../search.module.css';
import type { SearchAppItem } from '../../types';
import { getAppIPAddress, getAppPort, getAppProcessInfo, getAppStatusInfo } from '../../utils';

interface AppCardProps {
  name: string;
  app: SearchAppItem;
  isMobile: boolean;
}

export function AppCard({ name, app, isMobile }: AppCardProps) {
  const displayName = formatAppName(name);
  const status = getAppStatusInfo(app);
  const proc = getAppProcessInfo(app);
  const ipAddress = getAppIPAddress(app);
  const port = getAppPort(app);
  const { t } = usePageTranslation();

  return (
    <Card
      key={`app-${name}`}
      style={{
        border: '1px solid var(--gray-6)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease',
        cursor: isMobile ? 'default' : 'pointer',
      }}
      className={searchStyles.appCard}
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
      <Flex className={searchStyles.appCardContent} style={{ alignItems: 'flex-start' }}>
        <AppAvatar size='6' />
        <Flex direction='column' className={searchStyles.appInfo}>
          <Flex align='center' gap='2'>
            <Heading size='4' weight='medium' style={{ color: 'var(--gray-12)' }}>
              {displayName}
            </Heading>
            <Text size='2' style={{ color: 'var(--gray-9)' }}>
              {proc.type ? ` · ${proc.type}` : ''}
            </Text>
          </Flex>
          <Flex align='center' gap='2'>
            <Text size='2' style={{ color: 'var(--gray-9)' }}>
              {ipAddress
                ? `${t('search.app.card.ip_label')}: ${ipAddress}`
                : `${t('search.app.card.ip_label')}: ${t('search.app.card.ip_unavailable')}`}
            </Text>
            <Text size='2' style={{ color: 'var(--gray-9)' }}>
              {port ? ` · ${t('search.app.card.port_label')} ${port}` : ''}
            </Text>
          </Flex>
          <Flex align='center' gap='2'>
            <Box
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: status.color,
              }}
            />
            <Text size='2' weight='medium' style={{ color: 'var(--gray-11)' }}>
              {t(status.key || 'search.app.status.active')}
            </Text>
          </Flex>
        </Flex>
        <Flex direction='column' className={searchStyles.appActions}>
          <Text size='2' color='gray' className={searchStyles.dateText}>
            {t('search.app.card.instance_label')}
          </Text>
          <Button
            size='3'
            color='blue'
            variant='outline'
            style={{ cursor: 'pointer' }}
            onClick={() => (window.location.href = `/apps/a/${displayName}`)}
          >
            <EyeOpenIcon />
            {t('search.shared.view_details')}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
