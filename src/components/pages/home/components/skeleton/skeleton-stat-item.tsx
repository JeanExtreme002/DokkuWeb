import { Box, Flex } from '@radix-ui/themes';

import styles from '../../home.module.css';

export function SkeletonStatItem() {
  return (
    <Box className={`${styles.statItem} ${styles.skeleton}`} data-loading='true'>
      <Flex align='center' gap='3' mb='3'>
        <div className={styles.iconContainer} style={{ backgroundColor: 'var(--gray-3)' }}>
          <div
            className={styles.skeletonElement}
            style={{ width: '16px', height: '16px', borderRadius: '2px' }}
          />
        </div>
        <Box>
          <div
            className={styles.skeletonElement}
            style={{ width: '60px', height: '12px', borderRadius: '4px', marginBottom: '4px' }}
          />
          <div
            className={styles.skeletonElement}
            style={{ width: '24px', height: '20px', borderRadius: '6px' }}
          />
        </Box>
      </Flex>
      <div
        className={styles.skeletonElement}
        style={{ width: '100%', height: '4px', borderRadius: '2px' }}
      />
    </Box>
  );
}
