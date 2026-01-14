import { EyeOpenIcon } from '@radix-ui/react-icons';
import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';
import { formatDatabaseType, formatServiceName, getServiceImage } from '@/lib';

import searchStyles from '../../search.module.css';
import type { ServiceData } from '../../types';
import { ServiceLogo } from '../shared';

interface ServiceCardProps {
  name: string;
  svc: ServiceData;
  isMobile: boolean;
}

export function ServiceCard({ name, svc, isMobile }: ServiceCardProps) {
  const displayName = formatServiceName(name);
  const pluginLabel = formatDatabaseType(svc.plugin_name);
  const { t } = usePageTranslation();

  const statusMap = (s: string) => {
    switch (s.toLowerCase()) {
      case 'running':
        return {
          color: 'var(--green-9)',
          key: 'search.service.status.active',
          bg: 'var(--green-3)',
        };
      case 'stopped':
      case 'exited':
      case 'missing':
        return { color: 'var(--red-9)', key: 'search.service.status.stopped', bg: 'var(--red-3)' };
      case 'starting':
        return {
          color: 'var(--amber-9)',
          key: 'search.service.status.starting',
          bg: 'var(--amber-3)',
        };
      default:
        return {
          color: 'var(--gray-9)',
          key: 'search.service.status.unknown',
          bg: 'var(--gray-3)',
        };
    }
  };

  const status = statusMap(svc.status || 'unknown');

  return (
    <Card
      key={`svc-${name}`}
      style={{
        border: '1px solid var(--gray-6)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease',
        cursor: isMobile ? 'default' : 'pointer',
      }}
      className={searchStyles.appCard}
      onClick={
        isMobile
          ? undefined
          : () => (window.location.href = `/services/s/${svc.plugin_name}/${name}`)
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
      <Flex className={searchStyles.appCardContent}>
        <ServiceLogo
          src={getServiceImage(svc.plugin_name)}
          alt={`${pluginLabel} logo`}
          imgSize={56}
          className={searchStyles.searchServiceImage}
        />
        <Flex direction='column' className={searchStyles.appInfo}>
          <Flex align='center' gap='2'>
            <Heading size='4' weight='medium' style={{ color: 'var(--gray-12)' }}>
              {displayName}
            </Heading>
          </Flex>
          <Flex align='center' gap='2'>
            <Text size='2' style={{ color: 'var(--gray-9)' }}>
              {pluginLabel}
              {svc.version ? ` · v${svc.version.split(':').pop()}` : ''}
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
              {t(status.key)}
            </Text>
          </Flex>
        </Flex>
        <Flex direction='column' className={searchStyles.appActions}>
          <Text size='2' color='gray' className={searchStyles.dateText}>
            {t('search.service.card.instance_label')}
          </Text>
          <Button
            size='3'
            color='blue'
            variant='outline'
            style={{ cursor: 'pointer' }}
            onClick={() => (window.location.href = `/services/s/${svc.plugin_name}/${name}`)}
          >
            <EyeOpenIcon />
            {t('search.shared.view_details')}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
