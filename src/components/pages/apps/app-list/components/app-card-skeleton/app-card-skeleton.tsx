import { EyeOpenIcon } from '@radix-ui/react-icons';
import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes';

import { AppAvatar } from '@/components/shared';
import { formatAppName } from '@/lib';

import styles from '../../app-list.module.css';

export function AppCardSkeleton({ appName, isMobile }: { appName: string; isMobile: boolean }) {
  const displayName = formatAppName(appName);

  return (
    <Card
      style={{
        border: '1px solid var(--gray-6)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease',
        cursor: isMobile ? 'default' : 'pointer',
      }}
      className={`${styles.appCard} ${styles.skeleton}`}
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
        <AppAvatar size='6' />

        {/* Main information */}
        <Flex direction='column' className={styles.appInfo}>
          <Flex align='center' gap='2'>
            <Heading size='4' weight='medium' style={{ color: 'var(--gray-12)' }}>
              {displayName}
            </Heading>
            <Text size='2' style={{ color: 'var(--gray-9)' }}>
              •
            </Text>
            <div
              className={styles.skeletonElement}
              style={{
                width: '60px',
                height: '12px',
                borderRadius: '4px',
              }}
            />
          </Flex>

          {/* Status skeleton */}
          <Flex align='center' gap='2'>
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

          {/* Info skeleton */}
          <Flex align='center' gap='2'>
            <div
              className={styles.skeletonElement}
              style={{
                width: '160px',
                height: '12px',
                borderRadius: '4px',
              }}
            />
            <div
              className={styles.skeletonElement}
              style={{
                width: '80px',
                height: '12px',
                borderRadius: '4px',
              }}
            />
          </Flex>
        </Flex>

        {/* Date and button skeleton */}
        <Flex direction='column' className={styles.appActions}>
          <div
            className={styles.skeletonElement}
            style={{
              width: '190px',
              height: '12px',
              borderRadius: '4px',
              marginBottom: '12px',
            }}
          />
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
