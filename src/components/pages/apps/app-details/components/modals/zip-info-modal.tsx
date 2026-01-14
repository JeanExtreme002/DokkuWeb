import { Box, Button, Dialog, Flex, Text } from '@radix-ui/themes';
import React from 'react';
import { Trans } from 'react-i18next';

import { usePageTranslation } from '@/i18n/utils';

interface ZipInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleZipFileSelection: () => void;
}

export default function ZipInfoModal(props: ZipInfoModalProps) {
  const { open, onOpenChange, handleZipFileSelection } = props;
  const { t } = usePageTranslation();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: '500px' }}>
        <Dialog.Title>{t('modals.zipInfo.title')}</Dialog.Title>
        <Dialog.Description style={{ marginBottom: '16px' }}>
          {t('modals.zipInfo.description')}
        </Dialog.Description>

        <Box
          style={{
            padding: '16px',
            background: 'var(--blue-2)',
            border: '1px solid var(--blue-6)',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          <Flex direction='column' gap='3'>
            <Text size='3' weight='medium' style={{ color: 'var(--blue-12)' }}>
              {t('modals.zipInfo.structure.title')}
            </Text>
            <Box style={{ fontFamily: 'monospace', fontSize: '14px' }}>
              <div>{t('modals.zipInfo.structure.root')}</div>
              <div>{t('modals.zipInfo.structure.deploymentToken')}</div>
              <div>{t('modals.zipInfo.structure.appPy')}</div>
              <div>{t('modals.zipInfo.structure.requirements')}</div>
              <div>{t('modals.zipInfo.structure.other')}</div>
            </Box>
          </Flex>
        </Box>

        <Box
          style={{
            padding: '12px',
            background: 'var(--amber-2)',
            border: '1px solid var(--amber-6)',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          <Flex align='start' gap='2'>
            <Text style={{ fontSize: '16px' }}>⚠️</Text>
            <Box>
              <Text size='3' weight='medium' style={{ color: 'var(--amber-11)' }}>
                {t('modals.zipInfo.important.title')}{' '}
              </Text>
              <Text size='2' style={{ color: 'var(--amber-11)', marginTop: '4px' }}>
                <Trans
                  t={t}
                  i18nKey='modals.zipInfo.important.body'
                  components={{ strong: <strong /> }}
                />
              </Text>
            </Box>
          </Flex>
        </Box>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button variant='soft' color='gray' style={{ cursor: 'pointer' }}>
              {t('modals.common.cancel')}
            </Button>
          </Dialog.Close>
          <Button style={{ cursor: 'pointer' }} onClick={handleZipFileSelection}>
            {t('modals.zipInfo.chooseZip')}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
