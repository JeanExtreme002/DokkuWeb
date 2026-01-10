import { Box, Text } from '@radix-ui/themes';
import React from 'react';

import styles from '../../app-details.module.css';
import type { AppInfo, DeployInfoData } from '../../types';

interface DeploySectionProps {
  appInfo: AppInfo | null;
  deployInfo: DeployInfoData | null;
  domain: string;
}

// Shows git remote + push instructions exactly as before
export function DeploySection({ appInfo, deployInfo, domain }: DeploySectionProps) {
  return (
    <div className={styles.deploySection}>
      <Text className={styles.deployTitle}>Deploy com Git:</Text>
      <Box className={styles.codeBlock}>
        <div>
          <span className={styles.command}>$ git remote add dokku</span> dokku@
          {domain}:{appInfo?.raw_name}
        </div>
        <div>
          <span className={styles.command}>
            $ git push dokku{' '}
            {deployInfo ? deployInfo['Git deploy branch'] || '<branch>' : '<branch>'}
          </span>
        </div>
      </Box>
    </div>
  );
}

export default DeploySection;
