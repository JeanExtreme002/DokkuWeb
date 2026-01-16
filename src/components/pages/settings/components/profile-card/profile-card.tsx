import { CheckIcon, InfoCircledIcon, ReloadIcon, UploadIcon } from '@radix-ui/react-icons';
import {
  Avatar,
  Button,
  Card,
  Flex,
  Heading,
  Select,
  Separator,
  Text,
  TextField,
  Tooltip,
} from '@radix-ui/themes';
import { Session } from 'next-auth';
import * as React from 'react';

import { PadLockIcon } from '@/components/shared';
import i18n from '@/i18n';
import { usePageTranslation } from '@/i18n/utils';
import { LANGUAGE_NAMES } from '@/lib/utils';

import styles from '../../settings.module.css';

interface ProfileCardProps {
  session?: Session;
  isAdmin: boolean;
  adminLoading: boolean;
  onAdminClick: () => void;
  showToken: boolean;
  onToggleShowToken: () => void;
  onCopyToken: () => void | Promise<void>;
  onOpenSaveSSHKey: () => void;
  isSSHKeySaving: boolean;
  isSSHKeyRegistered: boolean;
  sshErrorMessage?: string | null;
}

export function ProfileCard({
  session,
  isAdmin,
  adminLoading,
  onAdminClick,
  showToken,
  onToggleShowToken,
  onCopyToken,
  onOpenSaveSSHKey,
  isSSHKeySaving,
  isSSHKeyRegistered,
  sshErrorMessage,
}: ProfileCardProps) {
  const { t } = usePageTranslation();
  const userName = session?.user?.name || t('user.fallbackName');
  const userImage = !userName.toLowerCase().startsWith('takeover')
    ? session?.user?.image
    : undefined;
  const userEmail = session?.user?.email || '';
  const [language, setLanguage] = React.useState<string>(
    i18n.resolvedLanguage || i18n.language || 'en'
  );

  React.useEffect(() => {
    const handler = (lng: string) => setLanguage(lng);
    i18n.on('languageChanged', handler);
    return () => {
      i18n.off('languageChanged', handler);
    };
  }, []);

  return (
    <Card
      style={{
        border: '1px solid var(--gray-6)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <Flex direction='column' gap='3' style={{ padding: '4px' }}>
        <Flex justify='between' align='center'>
          <Heading size='5' weight='medium' style={{ color: 'var(--gray-12)' }}>
            {t('profile.title')}
          </Heading>
          {!adminLoading && isAdmin && (
            <Tooltip content={t('profile.admin.tooltip')}>
              <Button
                size='2'
                color='orange'
                variant='outline'
                onClick={onAdminClick}
                className={styles.adminButton}
                aria-label={t('profile.admin.ariaLabel')}
                title={t('profile.admin.titleAttr')}
              >
                <PadLockIcon />
                <span className={styles.adminButtonLabel}>{t('profile.admin.button')}</span>
              </Button>
            </Tooltip>
          )}
        </Flex>

        <Separator size='4' />

        <Flex align='center' gap='3'>
          <Avatar
            size='5'
            src={userImage || undefined}
            fallback={userName.charAt(0).toUpperCase()}
            radius='full'
          />

          <Flex direction='column' gap='1' style={{ flex: 1 }}>
            <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
              {userName}
            </Text>
            <Text
              size='2'
              style={{
                color: 'var(--gray-10)',
                fontFamily: 'monospace',
              }}
            >
              {userEmail}
            </Text>
          </Flex>
        </Flex>

        <Separator size='4' style={{ margin: '8px 0' }} />

        <Flex className={styles.userSettingsContainer}>
          <Flex direction='column' gap='2'>
            <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
              {t('profile.language.label')}
              <Tooltip content={t('profile.language.tooltip')}>
                <InfoCircledIcon
                  style={{
                    color: 'var(--gray-9)',
                    cursor: 'help',
                    width: '14px',
                    height: '14px',
                    marginLeft: '8px',
                  }}
                />
              </Tooltip>
            </Text>
            <Select.Root
              value={language}
              onValueChange={(code: string) => i18n.changeLanguage(code)}
            >
              <Select.Trigger
                placeholder={t('profile.language.placeholder')}
                style={{ maxWidth: '200px' }}
              />
              <Select.Content>
                {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                  <Select.Item key={code} value={code}>
                    {name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>
          <Flex direction='column' gap='2'>
            <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
              {t('profile.ssh.label')}
              <Tooltip content={t('profile.ssh.tooltip')}>
                <InfoCircledIcon
                  style={{
                    color: 'var(--gray-9)',
                    cursor: 'help',
                    width: '14px',
                    height: '14px',
                    marginLeft: '8px',
                  }}
                />
              </Tooltip>
            </Text>
            <Button
              className={styles.sshButton}
              color='orange'
              variant='outline'
              style={{ cursor: 'pointer' }}
              onClick={onOpenSaveSSHKey}
              disabled={isSSHKeySaving || isSSHKeyRegistered}
            >
              {isSSHKeyRegistered ? (
                <>
                  <CheckIcon />
                  {t('profile.ssh.registered')}
                </>
              ) : isSSHKeySaving ? (
                <>
                  <ReloadIcon className={styles.buttonSpinner} />
                  {t('profile.ssh.registering')}
                </>
              ) : (
                <>
                  <UploadIcon />
                  {t('profile.ssh.button')}
                </>
              )}
            </Button>
            {sshErrorMessage && <Text className={styles.sshErrorMessage}>{sshErrorMessage}</Text>}
          </Flex>
        </Flex>

        <Flex direction='column' gap='2'>
          <Flex align='center' gap='2'>
            <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
              {t('profile.token.label')}
            </Text>
            <Tooltip content={t('profile.token.tooltip')}>
              <InfoCircledIcon
                style={{
                  color: 'var(--gray-9)',
                  cursor: 'help',
                  width: '14px',
                  height: '14px',
                }}
              />
            </Tooltip>
          </Flex>
          <Flex gap='2' align='center'>
            <TextField.Root
              value={session?.accessToken || ''}
              readOnly
              style={{
                flex: 1,
                fontFamily: 'monospace',
                fontSize: '12px',
                filter: showToken ? 'none' : 'blur(4px)',
                transition: 'filter 0.2s ease',
              }}
              placeholder={t('profile.token.placeholder')}
            />
            <Button
              size='2'
              variant='soft'
              onClick={onToggleShowToken}
              style={{
                minWidth: '34px',
                width: '34px',
                height: '34px',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title={showToken ? t('profile.token.toggle.hide') : t('profile.token.toggle.show')}
            >
              <PadLockIcon isUnlocked={showToken} />
            </Button>
            <Button
              size='2'
              onClick={onCopyToken}
              disabled={!session?.accessToken}
              style={{ minWidth: '70px', cursor: 'pointer' }}
            >
              {t('profile.token.copy')}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
