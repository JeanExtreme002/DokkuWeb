import { Box, Text } from '@radix-ui/themes';
import Link from 'next/link';
import React from 'react';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../app-details.module.css';
import type { AppInfo, DeployInfoData } from '../../types';

interface DeploySectionProps {
  appInfo: AppInfo | null;
  deployInfo: DeployInfoData | null;
  domain: string;
  sshPort?: number | null;
}

export function DeploySection({ appInfo, deployInfo, domain, sshPort }: DeploySectionProps) {
  const { t } = usePageTranslation();
  return (
    <div className={styles.deploySection}>
      <Box className={styles.deployHeader}>
        <Text className={styles.deployTitle}>{t('deploySection.title')}</Text>
        <Text className={styles.deploySubtitle}>
          {t('deploySection.subtitle')} —{' '}
          <Link href='/settings' className={styles.deploySubtitleLink}>
            {t('deploySection.subtitleLink')}
          </Link>
        </Text>
      </Box>
      <Box className={styles.codeBlock}>
        <div>
          <span className={styles.command}>$ git remote add</span> dokku dokku@
          {domain}:{appInfo?.raw_name}
        </div>
        {sshPort != null && sshPort !== 22 && (
          <div>
            <span className={styles.command}>$ git config --local </span>
            core.sshCommand &quot;ssh -p {sshPort}&quot;
          </div>
        )}
        <div>
          <span className={styles.command}>$ git push</span> dokku{' '}
          {deployInfo ? deployInfo['Git deploy branch'] || '<branch>' : '<branch>'}
        </div>
      </Box>
    </div>
  );
}

export default DeploySection;
