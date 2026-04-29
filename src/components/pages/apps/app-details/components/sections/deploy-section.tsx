import { CheckIcon, CopyIcon } from '@radix-ui/react-icons';
import { Box, IconButton, Text } from '@radix-ui/themes';
import Link from 'next/link';
import React, { useState } from 'react';

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
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const branch = deployInfo ? deployInfo['Git deploy branch'] || '<branch>' : '<branch>';
  const remoteAddLine = `git remote add dokku dokku@${domain}:${appInfo?.raw_name}`;
  const sshConfigLine =
    sshPort != null && sshPort !== 22
      ? `git config --local core.sshCommand "ssh -p ${sshPort}"`
      : null;
  const block1Text = sshConfigLine ? `${remoteAddLine}\n${sshConfigLine}` : remoteAddLine;
  const block2Text = `git push dokku ${branch}`;

  return (
    <div className={styles.deploySection}>
      <Box className={styles.deployHeader}>
        <Text className={styles.deployTitle}>{t('deploySection.title')}</Text>
        <Text className={styles.deploySubtitle}>{t('deploySection.subtitle')}</Text>
      </Box>
      <Box className={styles.codeBlock}>
        <div className={styles.codeBlockContent}>
          <div>
            <span className={styles.command}>$ git remote add</span> dokku dokku@
            {domain}:{appInfo?.raw_name}
          </div>
          {sshPort != null && sshPort !== 22 && (
            <div>
              <span className={styles.command}>$ git config --local</span> core.sshCommand &quot;ssh
              -p {sshPort}&quot;
            </div>
          )}
        </div>
        <IconButton
          size='1'
          variant='ghost'
          className={styles.codeBlockCopyButton}
          onClick={() => copy('block1', block1Text)}
          aria-label='Copy'
        >
          {copied === 'block1' ? <CheckIcon /> : <CopyIcon />}
        </IconButton>
      </Box>
      <Box className={styles.deployHeader}>
        <Text className={styles.deploySubtitle}>
          {t('deploySection.sshKey')} —{' '}
          <Link href='/settings' className={styles.deploySubtitleLink}>
            {t('deploySection.sshKeyLink')}
          </Link>
        </Text>
      </Box>
      <Box className={styles.codeBlock}>
        <div className={styles.codeBlockContent}>
          <div>
            <span className={styles.command}>$ git push</span> dokku{' '}
            {deployInfo ? deployInfo['Git deploy branch'] || '<branch>' : '<branch>'}
          </div>
        </div>
        <IconButton
          size='1'
          variant='ghost'
          className={styles.codeBlockCopyButton}
          onClick={() => copy('block2', block2Text)}
          aria-label='Copy'
        >
          {copied === 'block2' ? <CheckIcon /> : <CopyIcon />}
        </IconButton>
      </Box>
    </div>
  );
}

export default DeploySection;
