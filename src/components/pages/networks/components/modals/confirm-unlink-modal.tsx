import { AlertDialog, Button, Flex, Spinner } from '@radix-ui/themes';
import { Trans } from 'react-i18next';

import { TrashIcon } from '@/components/shared/icons';
import { usePageTranslation } from '@/i18n/utils';

interface UnlinkModalState {
  networkName: string;
  appName: string;
}

interface ConfirmUnlinkModalProps {
  state: UnlinkModalState | null;
  onClose: () => void;
  onConfirm: () => void;
  isUnlinking: boolean;
}

export function ConfirmUnlinkModal({
  state,
  onClose,
  onConfirm,
  isUnlinking,
}: ConfirmUnlinkModalProps) {
  const { t } = usePageTranslation();
  if (!state) return null;

  return (
    <AlertDialog.Root open={!!state} onOpenChange={onClose}>
      <AlertDialog.Content style={{ maxWidth: '450px' }}>
        <AlertDialog.Title>{t('modals.unlink.title')}</AlertDialog.Title>
        <AlertDialog.Description size='2'>
          <Trans
            t={t}
            i18nKey='modals.unlink.description'
            values={{ app: state.appName, network: state.networkName }}
            components={{ strong: <strong /> }}
          />
        </AlertDialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <AlertDialog.Cancel>
            <Button variant='soft' color='gray' style={{ cursor: 'pointer' }}>
              {t('modals.common.cancel')}
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button
              variant='solid'
              color='red'
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
            >
              {isUnlinking ? (
                <>
                  <Spinner size='2' />
                  {t('modals.unlink.unlinking')}
                </>
              ) : (
                <>
                  <TrashIcon />
                  {t('modals.unlink.confirm')}
                </>
              )}
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
