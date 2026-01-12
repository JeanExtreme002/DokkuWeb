import { Box, Flex } from '@radix-ui/themes';

import styles from '../../home.module.css';

type ResourceType = 'apps' | 'services' | 'networks';

export function SkeletonResourceCard({ type }: { type: ResourceType }) {
  return (
    <Box className={`${styles.resourceCard} ${styles.skeleton}`} data-loading='true'>
      <Flex align='center' justify='between' mb='3'>
        <Flex align='center' gap='3'>
          <div
            className={styles.resourceIcon}
            data-type={type}
            style={{ background: 'var(--gray-3)', border: '1px solid var(--gray-4)' }}
          >
            <div
              className={styles.skeletonElement}
              style={{ width: '18px', height: '18px', borderRadius: '3px' }}
            />
          </div>
          <Box>
            <div
              className={styles.skeletonElement}
              style={{ width: '80px', height: '16px', borderRadius: '4px', marginBottom: '6px' }}
            />
            <div
              className={styles.skeletonElement}
              style={{ width: '60px', height: '12px', borderRadius: '4px' }}
            />
          </Box>
        </Flex>
        <div
          className={styles.skeletonElement}
          style={{ width: '16px', height: '16px', borderRadius: '2px' }}
        />
      </Flex>

      <Box className={styles.resourceList}>
        {[1, 2, 3].map((item) => (
          <Flex key={item} align='center' gap='2' className={styles.resourceListItem}>
            <div
              className={styles.skeletonElement}
              style={{ width: '6px', height: '6px', borderRadius: '50%' }}
            />
            <div
              className={styles.skeletonElement}
              style={{ width: '80px', height: '12px', borderRadius: '4px' }}
            />
          </Flex>
        ))}
      </Box>
    </Box>
  );
}
