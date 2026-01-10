import { ReloadIcon } from '@radix-ui/react-icons';
import { Box, Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes';
import React from 'react';

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

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: '500px' }}>
        <Dialog.Title>Deploy via Repositório</Dialog.Title>
        <Dialog.Description>
          Insira a URL do repositório público e a branch para fazer o deploy.
        </Dialog.Description>

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
              URL do Repositório
            </Text>
            <TextField.Root
              placeholder='https://github.com/usuario/repositorio'
              value={repoUrl}
              onChange={(e) => onSetRepoUrl(e.target.value)}
              disabled={deployLoading}
            />
          </Box>

          <Box>
            <Text size='2' weight='medium' style={{ marginBottom: '8px' }}>
              Branch
            </Text>
            <TextField.Root
              placeholder='main'
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
              Cancelar
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
                Fazendo Deploy...
              </>
            ) : (
              'Confirmar Deploy'
            )}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
