import { ReloadIcon } from '@radix-ui/react-icons';
import { Box, Button, Dialog, Flex, Select, Text } from '@radix-ui/themes';
import React from 'react';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../app-details.module.css';

interface BuilderConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBuilder: string;
  onSetSelectedBuilder: (val: string) => void;
  builderConfigLoading: boolean;
  errorBuilder: string | null | undefined;
  configureBuilder: () => void;
}

export default function BuilderConfigModal(props: BuilderConfigModalProps) {
  const {
    open,
    onOpenChange,
    selectedBuilder,
    onSetSelectedBuilder,
    builderConfigLoading,
    errorBuilder,
    configureBuilder,
  } = props;

  const { t } = usePageTranslation();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: '450px' }}>
        <Dialog.Title>{t('modals.builderConfig.title')}</Dialog.Title>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          {t('modals.builderConfig.description')}
        </Dialog.Description>

        {errorBuilder && (
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
              {errorBuilder}
            </Text>
          </Box>
        )}

        <Flex direction='column' gap='4' style={{ marginTop: '20px' }}>
          <Box>
            <Select.Root value={selectedBuilder} onValueChange={onSetSelectedBuilder}>
              <Select.Trigger style={{ width: '100%', cursor: 'pointer' }} />
              <Select.Content>
                <Select.Item style={{ cursor: 'pointer' }} value='herokuish'>
                  Herokuish
                </Select.Item>
                <Select.Item style={{ cursor: 'pointer' }} value='dockerfile'>
                  Dockerfile
                </Select.Item>
                <Select.Item style={{ cursor: 'pointer' }} value='lambda'>
                  Lambda
                </Select.Item>
                <Select.Item style={{ cursor: 'pointer' }} value='pack'>
                  Pack
                </Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>
        </Flex>

        <Flex gap='3' mt='6' justify='end'>
          <Dialog.Close>
            <Button
              variant='soft'
              color='gray'
              style={{ cursor: 'pointer' }}
              disabled={builderConfigLoading}
            >
              {t('modals.common.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            onClick={configureBuilder}
            disabled={!selectedBuilder || builderConfigLoading}
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {builderConfigLoading ? (
              <>
                <ReloadIcon className={styles.buttonSpinner} />
                {t('modals.builderConfig.configuring')}
              </>
            ) : (
              t('modals.builderConfig.confirm')
            )}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
