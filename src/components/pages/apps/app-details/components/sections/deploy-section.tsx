import { Box, Text } from '@radix-ui/themes';
import React from 'react';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../app-details.module.css';
import type { AppInfo, DeployInfoData } from '../../types';

interface DeploySectionProps {
  appInfo: AppInfo | null;
  deployInfo: DeployInfoData | null;
  domain: string;
}

export function DeploySection({ appInfo, deployInfo, domain }: DeploySectionProps) {
  const { t } = usePageTranslation();
  return (
    <div className={styles.deploySection}>
      <Box className={styles.deployHeader}>
        <Text className={styles.deployTitle}>{t('deploySection.title')}</Text>
        <Text className={styles.deploySubtitle}>{t('deploySection.subtitle')}</Text>
      </Box>
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
