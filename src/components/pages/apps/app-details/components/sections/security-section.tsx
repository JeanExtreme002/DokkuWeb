import { InfoCircledIcon, Share1Icon, TrashIcon } from '@radix-ui/react-icons';
import { Box, Button, Card, Flex, Heading, Text, TextField, Tooltip } from '@radix-ui/themes';
import React from 'react';

import { PadLockIcon } from '@/components/shared';
import { usePageTranslation } from '@/i18n/utils';

import styles from '../../app-details.module.css';

interface SecuritySectionProps {
  deploymentToken: string | null;
  showDeploymentToken: boolean;
  onToggleShowToken: () => void;
  onCopyToken: () => void;
  onOpenDeleteModal: () => void;
  shareEmail: string;
  onSetShareEmail: (val: string) => void;
  onRequestShare: (email: string) => void;
  sharingList: string[];
  sharingLoading: boolean;
  sharingError: string | null;
  sharingListLoaded: boolean;
  onOpenUnshareConfirm: (email: string) => void;
}

export default function SecuritySection(props: SecuritySectionProps) {
  const { t } = usePageTranslation();
  const {
    deploymentToken,
    showDeploymentToken,
    onToggleShowToken,
    onCopyToken,
    onOpenDeleteModal,
    shareEmail,
    onSetShareEmail,
    onRequestShare,
    sharingList,
    sharingLoading,
    sharingError,
    sharingListLoaded,
    onOpenUnshareConfirm,
  } = props;

  return (
    <>
      <Heading size='5' style={{ marginBottom: '20px' }}>
        {t('security.title')}
      </Heading>

      {/* Deployment Token Section */}
      <Card
        style={{
          border: '1px solid var(--gray-6)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          padding: '16px',
        }}
      >
        <Flex direction='column' gap='1'>
          <Flex align='center' gap='2'>
            <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
              {t('security.deploymentToken.label')}
            </Text>
            <Tooltip content={t('security.deploymentToken.tooltip')}>
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

          <Flex gap='2' align='center' mt='1'>
            <TextField.Root
              value={deploymentToken || ''}
              readOnly
              style={{
                flex: 1,
                fontFamily: 'monospace',
                fontSize: '12px',
                filter: showDeploymentToken ? 'none' : 'blur(4px)',
                transition: 'filter 0.2s ease',
              }}
              placeholder={
                deploymentToken
                  ? t('security.deploymentToken.placeholder')
                  : t('security.deploymentToken.loading')
              }
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
                background: 'var(--purple-3)',
                border: '1px solid var(--purple-6)',
                color: 'var(--purple-11)',
                cursor: 'pointer',
              }}
              title={
                showDeploymentToken
                  ? t('security.deploymentToken.hide')
                  : t('security.deploymentToken.show')
              }
            >
              <PadLockIcon isUnlocked={showDeploymentToken} />
            </Button>
            <Button
              size='2'
              onClick={onCopyToken}
              disabled={!deploymentToken}
              style={{
                minWidth: '70px',
                background: 'var(--purple-9)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              {t('security.deploymentToken.copy')}
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Sharing Section */}
      <Box style={{ marginTop: '24px' }}>
        <Heading size='5' style={{ marginBottom: '12px' }}>
          {t('security.sharing.title')}
        </Heading>
        <Card
          style={{
            border: '1px solid var(--gray-6)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            padding: '16px',
          }}
        >
          <Flex direction='column' gap='3'>
            <Flex direction='column' gap='1'>
              <Text size='3' weight='bold' style={{ color: 'var(--gray-12)', display: 'block' }}>
                {t('security.sharing.addCollaboratorTitle')}
              </Text>
              <Text size='2' style={{ color: 'var(--gray-11)', display: 'block' }}>
                {t('security.sharing.addCollaboratorDescription')}
              </Text>
            </Flex>
            <Flex gap='2' align='center'>
              <TextField.Root
                placeholder={t('security.sharing.emailPlaceholder')}
                value={shareEmail}
                onChange={(e) => onSetShareEmail((e.target as HTMLInputElement).value)}
                style={{ flex: 1 }}
                type='email'
              />
              <Button
                size='2'
                onClick={() => onRequestShare(shareEmail)}
                disabled={!shareEmail.trim() || sharingLoading}
                color='orange'
                variant='surface'
                className={styles.shareButton}
                style={{
                  minWidth: '90px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Share1Icon />
                <span className={styles.shareButtonText}>{t('security.sharing.shareButton')}</span>
              </Button>
            </Flex>

            {sharingError && (
              <Text size='2' style={{ color: 'var(--red-10)' }}>
                {sharingError}
              </Text>
            )}

            <Box>
              <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
                {t('security.sharing.sharedWith')}
              </Text>
              <Box style={{ marginTop: '8px' }}>
                {sharingLoading || !sharingListLoaded ? (
                  <Text size='2' style={{ color: 'var(--gray-11)' }}>
                    {t('security.sharing.loading')}
                  </Text>
                ) : sharingList.length === 0 ? (
                  <Text size='2' style={{ color: 'var(--gray-11)' }}>
                    {t('security.sharing.none')}
                  </Text>
                ) : (
                  <Flex direction='column' gap='2'>
                    {sharingList.map((email) => (
                      <Card
                        key={email}
                        style={{
                          border: '1px solid var(--gray-6)',
                          padding: '8px 12px',
                          background: 'var(--gray-2)',
                        }}
                      >
                        <Flex align='center' justify='between' className={styles.sharedUserRow}>
                          <Text size='2' style={{ color: 'var(--gray-12)' }}>
                            {email}
                          </Text>
                          <Button
                            size='2'
                            variant='soft'
                            onClick={() => onOpenUnshareConfirm(email)}
                            title={t('security.sharing.unshare')}
                            className={styles.sharedUserRowButton}
                            style={{
                              background: 'var(--red-3)',
                              border: '1px solid var(--red-6)',
                              color: 'var(--red-11)',
                              cursor: 'pointer',
                              minWidth: '34px',
                              width: '34px',
                              height: '34px',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <TrashIcon />
                            <span className={styles.unshareButtonText}>
                              {t('security.sharing.unshare')}
                            </span>
                          </Button>
                        </Flex>
                      </Card>
                    ))}
                  </Flex>
                )}
              </Box>
            </Box>
          </Flex>
        </Card>
      </Box>

      {/* Delete Application Section */}
      <Box style={{ marginTop: '45px' }}>
        <Heading size='5' style={{ marginBottom: '12px', color: 'var(--red-11)' }}>
          {t('security.danger.title')}
        </Heading>
        <Card
          style={{
            border: '1px solid var(--red-6)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            padding: '16px',
            background: 'var(--red-2)',
          }}
        >
          <Flex align='center' justify='between' gap='4' className={styles.dangerRow}>
            <Flex direction='column' gap='1'>
              <Text size='3' weight='bold' style={{ color: 'var(--gray-12)', display: 'block' }}>
                {t('security.danger.deleteTitle')}
              </Text>
              <Text size='2' style={{ color: 'var(--gray-11)', display: 'block' }}>
                {t('security.danger.deleteDescription')}
              </Text>
            </Flex>
            <Button
              className={styles.dangerRowButton}
              size='2'
              onClick={onOpenDeleteModal}
              style={{
                background: 'var(--gray-4)',
                color: 'var(--red-9)',
                border: '1px solid var(--gray-7)',
                cursor: 'pointer',
              }}
            >
              <TrashIcon />
              {t('security.danger.deleteButton')}
            </Button>
          </Flex>
        </Card>
      </Box>
    </>
  );
}
