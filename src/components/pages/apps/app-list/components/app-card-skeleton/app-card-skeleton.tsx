import { EyeOpenIcon } from '@radix-ui/react-icons';
import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes';

import { AppAvatar, SharedAppAvatar } from '@/components/shared';
import { usePageTranslation } from '@/i18n/utils';
import { formatAppName } from '@/lib';

import styles from '../../app-list.module.css';
import { parseSharedName } from '../../utils';

export function AppCardSkeleton({ appName, isMobile }: { appName: string; isMobile: boolean }) {
  const { t } = usePageTranslation();
  const { sharedBy, pureName } = parseSharedName(appName);
  const displayName = formatAppName(pureName);
  const detailsUrl = sharedBy
    ? `/apps/a/${displayName}?shared_by=${encodeURIComponent(sharedBy)}`
    : `/apps/a/${displayName}`;

  return (
    <Card
      style={{
        border: '1px solid var(--gray-6)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease',
        cursor: isMobile ? 'default' : 'pointer',
      }}
      className={`${styles.appCard} ${styles.skeleton}`}
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
        {sharedBy ? <SharedAppAvatar size='6' /> : <AppAvatar size='6' />}

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
          {sharedBy && (
            <Flex align='center'>
              <Text size='1' style={{ color: 'var(--gray-10)' }}>
                {t('status.sharedBy')} {sharedBy}
              </Text>
            </Flex>
          )}

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
              {t('card.loadingStatus')}
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
