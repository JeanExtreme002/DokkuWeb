import {
  CheckIcon,
  ChevronDownIcon,
  CodeIcon,
  CopyIcon,
  DownloadIcon,
  GitHubLogoIcon,
  UploadIcon,
} from '@radix-ui/react-icons';
import {
  Avatar,
  Box,
  Button,
  DropdownMenu,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Text,
} from '@radix-ui/themes';
import type { Session } from 'next-auth';
import React, { useMemo, useState } from 'react';

import { ConsoleIcon, LinkIcon } from '@/components/shared';
import { usePageTranslation } from '@/i18n/utils';

import styles from '../../app-details.module.css';
import type { AppContainer, AppInfo } from '../../types';

interface StatusInfo {
  color: string;
  text: string;
  bgColor: string;
}

interface HeaderSectionProps {
  session: Session | null;
  appInfo: AppInfo | null;
  appUrl: string | null;
  statusInfo: StatusInfo;
  displayName: string;
  domain: string;
  sshPort?: number | null;
  onOpenDeployModal: () => void;
  onOpenZipInfoModal: () => void;
  onDownloadZip: () => Promise<void>;
  onVisitWebsite: () => void;
  sharedBy?: string | null;
}

export function HeaderSection(props: HeaderSectionProps) {
  const { t } = usePageTranslation();
  const [copied, setCopied] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const cloneCommand = props.sshPort
    ? `GIT_SSH_COMMAND="ssh -p ${props.sshPort}" git clone dokku@${props.domain}:${props.appInfo?.raw_name}`
    : `git clone dokku@${props.domain}:${props.appInfo?.raw_name}`;

  const handleDownloadZip = async () => {
    if (downloadingZip) return;
    setDownloadingZip(true);
    try {
      await props.onDownloadZip();
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cloneCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const processType = useMemo(() => {
    if (props.appInfo?.info_origin === 'inspect') {
      const containers = props.appInfo.data as AppContainer[];
      return containers?.[0]?.Config?.Labels?.['com.dokku.process-type'];
    }
    return undefined;
  }, [props.appInfo]);

  const isSharedBy = !!props.sharedBy;
  const showAvatar =
    !isSharedBy && !props.session?.user?.name?.toLowerCase().startsWith('takeover');
  const avatarFallback = isSharedBy
    ? props.sharedBy!.charAt(0).toUpperCase()
    : props.session?.user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <Box className={styles.headerSection}>
      <Flex justify='between' align='center' style={{ width: '100%' }}>
        <Flex className={styles.appTitle}>
          <Flex gap='4'>
            {isSharedBy && (
              <Avatar
                size='5'
                src={showAvatar ? props.session?.user?.image || undefined : undefined}
                fallback={avatarFallback}
                radius='full'
                style={{ flexShrink: 0 }}
              />
            )}
            <Flex direction={'column'}>
              <Flex align='center' gap='3' style={{ alignItems: 'center' }}>
                {!isSharedBy && (
                  <Avatar
                    size='5'
                    src={showAvatar ? props.session?.user?.image || undefined : undefined}
                    fallback={avatarFallback}
                    radius='full'
                    style={{ flexShrink: 0 }}
                  />
                )}
                <Heading
                  size='8'
                  weight='bold'
                  className={styles.appHeaderText}
                  style={{ color: 'var(--gray-12)' }}
                >
                  {props.displayName}
                </Heading>
              </Flex>
              {isSharedBy && (
                <Text size='1' style={{ color: 'var(--gray-11)' }}>
                  {t('header.sharedBy')} {props.sharedBy}
                </Text>
              )}
            </Flex>
          </Flex>
          <Box style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Box
              className={styles.statusBadge}
              style={{ backgroundColor: props.statusInfo.bgColor, color: props.statusInfo.color }}
            >
              {props.statusInfo.text}
            </Box>
            <Text size='2' style={{ color: 'var(--gray-11)' }}>
              {props.appInfo?.info_origin === 'inspect' && ' · ' + processType}
            </Text>
          </Box>
        </Flex>

        {/* Desktop Buttons */}
        <Flex className={styles.desktopOnly} gap='4' align='center'>
          {/* App URL Button */}
          {props.appUrl && (
            <Button
              onClick={props.onVisitWebsite}
              variant='surface'
              size='2'
              color='purple'
              style={{
                cursor: 'pointer',
                backgroundColor: 'var(--purple-3)',
                marginRight: '12px',
              }}
            >
              <LinkIcon />
              {t('header.visitWebsite')}
            </Button>
          )}

          {/* Deploy Button */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button
                variant='solid'
                style={{ cursor: 'pointer', backgroundColor: 'var(--green-8)' }}
              >
                <CodeIcon />
                {t('header.code')}
                <ChevronDownIcon />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Label>
                <Flex align='center' gap='1'>
                  <ConsoleIcon />
                  {t('header.clone')}
                </Flex>
              </DropdownMenu.Label>
              <Flex align='center' gap='2' style={{ padding: '4px 8px 8px' }}>
                <Box
                  style={{
                    backgroundColor: 'var(--gray-3)',
                    border: '1px solid var(--gray-6)',
                    borderRadius: '6px',
                    padding: '6px 0 6px 8px',
                    maxWidth: '300px',
                    overflowX: 'auto',
                  }}
                >
                  <code
                    style={{
                      fontSize: '11px',
                      whiteSpace: 'nowrap',
                      color: 'var(--gray-12)',
                      display: 'block',
                    }}
                  >
                    {cloneCommand}
                    <span style={{ display: 'inline-block', width: '8px' }} />
                  </code>
                </Box>
                <IconButton
                  size='1'
                  variant='ghost'
                  color='gray'
                  onClick={handleCopy}
                  aria-label='Copy'
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </IconButton>
              </Flex>
              <Text
                size='1'
                style={{ padding: '0 8px 8px', color: 'var(--gray-11)', display: 'block' }}
              >
                {t('header.cloneHint')}
              </Text>
              <DropdownMenu.Separator />
              <DropdownMenu.Item
                style={{ cursor: 'pointer' }}
                onClick={handleDownloadZip}
                disabled={downloadingZip}
              >
                {downloadingZip ? <Spinner /> : <DownloadIcon />}
                {downloadingZip ? t('header.downloadingZip') : t('header.downloadZip')}
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Label>{t('header.deployVia')}</DropdownMenu.Label>
              <DropdownMenu.Item style={{ cursor: 'pointer' }} onClick={props.onOpenZipInfoModal}>
                <UploadIcon />
                {t('header.zipFile')}
              </DropdownMenu.Item>
              <DropdownMenu.Item style={{ cursor: 'pointer' }} onClick={props.onOpenDeployModal}>
                <GitHubLogoIcon />
                {t('header.publicRepo')}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      </Flex>

      {/* Mobile Buttons */}
      <Flex className={styles.mobileOnly} direction='column' gap='4' style={{ marginTop: '16px' }}>
        {/* App URL Button */}
        {props.appUrl && (
          <Button
            className={styles.urlButton}
            onClick={props.onVisitWebsite}
            variant='surface'
            size='2'
            color='purple'
            style={{
              cursor: 'pointer',
              backgroundColor: 'var(--purple-3)',
              marginRight: '12px',
            }}
          >
            <LinkIcon />
            {t('header.visitWebsite')}
          </Button>
        )}

        {/* Deploy Button */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant='solid' className={styles.urlButton}>
              <CodeIcon />
              {t('header.code')}
              <ChevronDownIcon />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Label>
              <Flex align='center' gap='1'>
                <ConsoleIcon />
                {t('header.clone')}
              </Flex>
            </DropdownMenu.Label>
            <Flex align='center' gap='2' style={{ padding: '4px 8px 8px' }}>
              <Box
                style={{
                  backgroundColor: 'var(--gray-3)',
                  border: '1px solid var(--gray-6)',
                  borderRadius: '6px',
                  padding: '6px 0 6px 8px',
                  maxWidth: '260px',
                  overflowX: 'auto',
                }}
              >
                <code
                  style={{
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                    color: 'var(--gray-12)',
                    display: 'block',
                  }}
                >
                  {cloneCommand}
                  <span style={{ display: 'inline-block', width: '8px' }} />
                </code>
              </Box>
              <IconButton
                size='1'
                variant='ghost'
                color='gray'
                onClick={handleCopy}
                aria-label='Copy'
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </IconButton>
            </Flex>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              style={{ cursor: 'pointer' }}
              onClick={handleDownloadZip}
              disabled={downloadingZip}
            >
              {downloadingZip ? <Spinner /> : <DownloadIcon />}
              {downloadingZip ? t('header.downloadingZip') : t('header.downloadZip')}
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Label>{t('header.deployVia')}</DropdownMenu.Label>
            <DropdownMenu.Item onClick={props.onOpenDeployModal}>
              <GitHubLogoIcon />
              {t('header.publicRepo')}
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={props.onOpenZipInfoModal}>
              <UploadIcon />
              {t('header.zipFile')}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>
    </Box>
  );
}

export default HeaderSection;
