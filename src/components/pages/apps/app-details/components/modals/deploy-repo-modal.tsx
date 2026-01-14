import { ReloadIcon } from '@radix-ui/react-icons';
import { Box, Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes';
import React from 'react';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../app-details.module.css';

interface DeployRepoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorDeploy: string | null | undefined;
  repoUrl: string;
  onSetRepoUrl: (val: string) => void;
  branch: string;
  onSetBranch: (val: string) => void;
  deployLoading: boolean;
  deployFromRepo: () => void;
}

export default function DeployRepoModal(props: DeployRepoModalProps) {
  const {
    open,
    onOpenChange,
    errorDeploy,
    repoUrl,
    onSetRepoUrl,
    branch,
    onSetBranch,
    deployLoading,
    deployFromRepo,
  } = props;

  const { t } = usePageTranslation();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: '500px' }}>
        <Dialog.Title>{t('modals.deployRepo.title')}</Dialog.Title>
        <Dialog.Description>{t('modals.deployRepo.description')}</Dialog.Description>

        {errorDeploy && (
          <Box
            style={{
              padding: '12px',
              background: 'var(--red-2)',
              border: '1px solid var(--red-6)',
              borderRadius: '6px',
              marginBottom: '16px',
            }}
          >
            <Text size='2' color='red'>
              {errorDeploy}
            </Text>
          </Box>
        )}

        <Flex direction='column' gap='4' style={{ marginTop: '20px' }}>
          <Box>
            <Text size='2' weight='medium' style={{ marginBottom: '8px' }}>
              {t('modals.deployRepo.repoUrlLabel')}
            </Text>
            <TextField.Root
              placeholder={t('modals.deployRepo.repoUrlPlaceholder')}
              value={repoUrl}
              onChange={(e) => onSetRepoUrl(e.target.value)}
              disabled={deployLoading}
            />
          </Box>

          <Box>
            <Text size='2' weight='medium' style={{ marginBottom: '8px' }}>
              {t('modals.deployRepo.branchLabel')}
            </Text>
            <TextField.Root
              placeholder={t('modals.deployRepo.branchPlaceholder')}
              value={branch}
              onChange={(e) => onSetBranch(e.target.value)}
              disabled={deployLoading}
            />
          </Box>
        </Flex>

        <Flex gap='3' mt='6' justify='end'>
          <Dialog.Close>
            <Button
              variant='soft'
              color='gray'
              style={{ cursor: 'pointer' }}
              disabled={deployLoading}
            >
              {t('modals.common.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            onClick={deployFromRepo}
            disabled={!repoUrl.trim() || !branch.trim() || deployLoading}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {deployLoading ? (
              <>
                <ReloadIcon className={styles.buttonSpinner} />
                {t('modals.deployRepo.deploying')}
              </>
            ) : (
              t('modals.deployRepo.confirm')
            )}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
