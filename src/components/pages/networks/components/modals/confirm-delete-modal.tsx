import { AlertDialog, Button, Flex, Spinner } from '@radix-ui/themes';
import { Trans } from 'react-i18next';

import { TrashIcon } from '@/components/shared/icons';
import { usePageTranslation } from '@/i18n/utils';

interface ConfirmDeleteModalProps {
  openName: string | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function ConfirmDeleteModal({
  openName,
  onClose,
  onConfirm,
  isDeleting,
}: ConfirmDeleteModalProps) {
  const { t } = usePageTranslation();
  if (!openName) return null;

  return (
    <AlertDialog.Root open={!!openName} onOpenChange={onClose}>
      <AlertDialog.Content style={{ maxWidth: '450px' }}>
        <AlertDialog.Title>{t('modals.delete.title')}</AlertDialog.Title>
        <AlertDialog.Description size='2'>
          <Trans
            t={t}
            i18nKey='modals.delete.description'
            values={{ name: openName }}
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
              {isDeleting ? (
                <>
                  <Spinner size='2' />
                  {t('modals.delete.deleting')}
                </>
              ) : (
                <>
                  <TrashIcon />
                  {t('modals.delete.confirm')}
                </>
              )}
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
