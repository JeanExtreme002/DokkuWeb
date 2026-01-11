import { Button, Card, Flex, Heading, Text } from '@radix-ui/themes';

import { getDatabaseDescription, getServiceImage } from '@/lib';

import searchStyles from '../../search.module.css';
import { formatDatabaseType } from '../../utils';
import { ServiceLogo } from '../shared';

interface AvailableDatabaseCardProps {
  name: string;
  isMobile: boolean;
}

export function AvailableDatabaseCard({ name, isMobile }: AvailableDatabaseCardProps) {
  const label = formatDatabaseType(name);

  return (
    <Card
      key={`db-${name}`}
      style={{
        border: '1px solid var(--gray-6)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease',
        cursor: isMobile ? 'default' : 'pointer',
      }}
      className={searchStyles.appCard}
      onClick={isMobile ? undefined : () => (window.location.href = `/services/create/`)}
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
          src={getServiceImage(name)}
          alt={`${label} logo`}
          imgSize={56}
          className={searchStyles.searchServiceImage}
        />
        <Flex direction='column' className={searchStyles.appInfo}>
          <Heading size='4' weight='medium' style={{ color: 'var(--gray-12)' }}>
            {label} ·{' '}
            <Text size='2' color='gray'>
              Disponível
            </Text>
          </Heading>
          <Text size='2' color='gray' className={searchStyles.dbDescription}>
            {getDatabaseDescription(name)}
          </Text>
        </Flex>
        <Flex direction='column' className={searchStyles.appActions}>
          <Button
            size='3'
            color='green'
            style={{ color: 'white', cursor: 'pointer' }}
            onClick={() => (window.location.href = `/services/create/`)}
          >
            + Criar serviço
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
