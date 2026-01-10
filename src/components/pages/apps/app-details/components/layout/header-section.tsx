import { ChevronDownIcon, CodeIcon, GitHubLogoIcon, UploadIcon } from '@radix-ui/react-icons';
import { Avatar, Box, Button, DropdownMenu, Flex, Heading, Text } from '@radix-ui/themes';
import type { Session } from 'next-auth';
import React, { useMemo } from 'react';

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
  onOpenDeployModal: () => void;
  onOpenZipInfoModal: () => void;
  onVisitWebsite: () => void;
}

// Renders the header: title, status badge, and action buttons
export function HeaderSection(props: HeaderSectionProps) {
  const processType = useMemo(() => {
    if (props.appInfo?.info_origin === 'inspect') {
      const containers = props.appInfo.data as AppContainer[];
      return containers?.[0]?.Config?.Labels?.['com.dokku.process-type'];
    }
    return undefined;
  }, [props.appInfo]);

  const showAvatar = !props.session?.user?.name?.toLowerCase().startsWith('takeover');
  const avatarFallback = props.session?.user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <Box className={styles.headerSection}>
      <Flex justify='between' align='center' style={{ width: '100%' }}>
        <Flex className={styles.appTitle}>
          <Flex align='center' gap='3' style={{ alignItems: 'center' }}>
            <Avatar
              size='4'
              src={showAvatar ? props.session?.user?.image || undefined : undefined}
              fallback={avatarFallback}
              radius='full'
              style={{ flexShrink: 0 }}
            />
            <Heading
              size='8'
              weight='bold'
              className={styles.appTitleText}
              style={{ color: 'var(--gray-12)' }}
            >
              {props.displayName}
            </Heading>
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
              variant='outline'
              color={undefined}
              className={`${styles.urlButton} ${styles.purpleOutlineButton}`}
              style={
                {
                  marginRight: '16px',
                  '--accent-9': 'var(--purple-9)',
                  '--accent-2': 'var(--purple-2)',
                  '--accent-3': 'var(--purple-3)',
                } as React.CSSProperties
              }
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' />
                <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' />
              </svg>
              Visitar Website
            </Button>
          )}

          {/* Deploy Button */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant='solid' style={{ cursor: 'pointer' }}>
                <CodeIcon />
                Deploy
                <ChevronDownIcon />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Label>Deploy via:</DropdownMenu.Label>
              <DropdownMenu.Separator />
              <DropdownMenu.Item style={{ cursor: 'pointer' }} onClick={props.onOpenDeployModal}>
                <GitHubLogoIcon />
                Repositório público
              </DropdownMenu.Item>
              <DropdownMenu.Item style={{ cursor: 'pointer' }} onClick={props.onOpenZipInfoModal}>
                <UploadIcon />
                Arquivo .zip
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
            className={`${styles.urlButton} ${styles.purpleOutlineButton}`}
            onClick={props.onVisitWebsite}
            variant='outline'
            color={undefined}
            style={
              {
                marginBottom: '16px',
                '--accent-9': 'var(--purple-9)',
                '--accent-2': 'var(--purple-2)',
                '--accent-3': 'var(--purple-3)',
              } as React.CSSProperties
            }
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' />
              <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' />
            </svg>
            Visitar Website
          </Button>
        )}

        {/* Deploy Button */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant='solid' className={styles.urlButton}>
              <CodeIcon />
              Deploy
              <ChevronDownIcon />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Label>Deploy via:</DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onClick={props.onOpenDeployModal}>
              <GitHubLogoIcon />
              Repositório público
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={props.onOpenZipInfoModal}>
              <UploadIcon />
              Arquivo .zip
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>
    </Box>
  );
}

export default HeaderSection;
