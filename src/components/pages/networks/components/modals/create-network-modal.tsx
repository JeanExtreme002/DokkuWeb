import { InfoCircledIcon } from '@radix-ui/react-icons';
import { AlertDialog, Box, Button, Flex, Spinner, Text, Tooltip } from '@radix-ui/themes';
import React from 'react';

import { usePageTranslation } from '@/i18n/utils';

import { useNetworkNameValidation } from '../../utils';

interface CreateNetworkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newNetworkName: string;
  setNewNetworkName: (value: string) => void;
  creatingNetwork: boolean;
  createNetworkError: string | null;
  createNetworkErrorHint?: React.ReactNode;
  onSubmit: () => void;
}

export function CreateNetworkModal({
  open,
  onOpenChange,
  newNetworkName,
  setNewNetworkName,
  creatingNetwork,
  createNetworkError,
  createNetworkErrorHint,
  onSubmit,
}: CreateNetworkModalProps) {
  const { t } = usePageTranslation();
  const validation = useNetworkNameValidation(newNetworkName);
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Content style={{ maxWidth: '450px' }}>
        <AlertDialog.Title>{t('modals.create.title')}</AlertDialog.Title>
        <Flex align='center' gap='2'>
          <AlertDialog.Description size='2'>
            {t('modals.create.description')}
          </AlertDialog.Description>
          <Tooltip content={t('modals.create.tooltip')}>
            <InfoCircledIcon
              style={{ color: 'var(--gray-9)', cursor: 'help', width: '14px', height: '14px' }}
            />
          </Tooltip>
        </Flex>

        <Box mt='4'>
          <input
            type='text'
            placeholder={t('modals.create.placeholder')}
            value={newNetworkName}
            onChange={(e) => setNewNetworkName(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newNetworkName.trim() && !creatingNetwork) {
                onSubmit();
              }
            }}
            disabled={creatingNetwork}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--gray-6)',
              borderRadius: '8px',
              background: creatingNetwork ? 'var(--gray-3)' : 'var(--color-surface)',
              color: creatingNetwork ? 'var(--gray-9)' : 'var(--gray-12)',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
              cursor: creatingNetwork ? 'not-allowed' : 'text',
            }}
          />

          <Text
            size='2'
            color={!validation.isValid && newNetworkName.length > 0 ? 'red' : 'gray'}
            style={{ marginTop: '6px', display: 'block' }}
          >
            {t('modals.create.counter', { count: newNetworkName.length })} {validation.message}
          </Text>

          {createNetworkError && (
            <Flex direction='column' gap='1' style={{ marginTop: '8px' }}>
              <Text size='2' color='red'>
                {createNetworkError}
              </Text>
              {createNetworkErrorHint && (
                <Text size='1' style={{ color: 'var(--gray-11)' }}>
                  {createNetworkErrorHint}
                </Text>
              )}
            </Flex>
          )}
        </Box>

        <Flex gap='3' mt='4' justify='end'>
          <AlertDialog.Cancel>
            <Button variant='soft' color='gray' style={{ cursor: 'pointer' }}>
              {t('modals.common.cancel')}
            </Button>
          </AlertDialog.Cancel>
          <Button
            variant='solid'
            color='green'
            style={{ cursor: 'pointer' }}
            onClick={onSubmit}
            disabled={!validation.isValid || creatingNetwork}
          >
            {creatingNetwork ? <Spinner size='2' /> : t('modals.create.confirm')}
          </Button>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
