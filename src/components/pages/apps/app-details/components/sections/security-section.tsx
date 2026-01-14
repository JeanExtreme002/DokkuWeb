import { InfoCircledIcon, TrashIcon } from '@radix-ui/react-icons';
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
}

export default function SecuritySection(props: SecuritySectionProps) {
  const { t } = usePageTranslation();
  const {
    deploymentToken,
    showDeploymentToken,
    onToggleShowToken,
    onCopyToken,
    onOpenDeleteModal,
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
