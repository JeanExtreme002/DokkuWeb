import { Button, Dialog, Flex } from '@radix-ui/themes';
import React from 'react';
import { Trans } from 'react-i18next';

import { usePageTranslation } from '@/i18n/utils';

interface DeleteEnvModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  envToDelete: string | null;
  deletingEnv: string | null | undefined;
  removeEnvironmentVariable: () => void;
}

export default function DeleteEnvModal(props: DeleteEnvModalProps) {
  const { open, onOpenChange, envToDelete, deletingEnv, removeEnvironmentVariable } = props;
  const { t } = usePageTranslation();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth='450px' style={{ padding: '24px' }}>
        <Dialog.Title style={{ marginBottom: '12px' }}>{t('modals.deleteEnv.title')}</Dialog.Title>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          <Trans
            t={t}
            i18nKey='modals.deleteEnv.description'
            values={{ name: envToDelete ?? '' }}
            components={{ strong: <strong /> }}
          />
          <br />
          <br />
          {t('modals.deleteEnv.warning')}
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button variant='soft' color='gray' style={{ cursor: 'pointer' }}>
              {t('modals.common.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            color='red'
            onClick={removeEnvironmentVariable}
            disabled={!!envToDelete && deletingEnv === envToDelete}
            style={{ backgroundColor: 'var(--red-9)', color: 'white', cursor: 'pointer' }}
          >
            {envToDelete && deletingEnv === envToDelete
              ? t('modals.deleteEnv.removing')
              : t('modals.deleteEnv.confirm')}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
