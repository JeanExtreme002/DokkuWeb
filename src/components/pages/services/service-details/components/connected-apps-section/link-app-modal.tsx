import { Link1Icon, ReloadIcon } from '@radix-ui/react-icons';
import { Box, Button, Dialog, Flex, Select, Text } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../service-details.module.css';

interface LinkAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appsListLoading: boolean;
  availableApps: string[];
  selectedApp: string;
  onSelectedAppChange: (value: string) => void;
  linkLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function LinkAppModal({
  open,
  onOpenChange,
  appsListLoading,
  availableApps,
  selectedApp,
  onSelectedAppChange,
  linkLoading,
  onCancel,
  onConfirm,
}: LinkAppModalProps) {
  const { t } = usePageTranslation();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>{t('services.s.linkModal.title')}</Dialog.Title>
        <Dialog.Description style={{ marginTop: '12px', marginBottom: '20px' }}>
          {t('services.s.linkModal.description')}
        </Dialog.Description>

        {appsListLoading ? (
          <Flex align='center' gap='3' style={{ padding: '20px 0' }}>
            <ReloadIcon className={styles.buttonSpinner} />
            <Text>{t('services.s.linkModal.loadingApps')}</Text>
          </Flex>
        ) : availableApps.length === 0 ? (
          <Box style={{ padding: '20px 0' }}>
            <Text size='3' color='gray'>
              {t('services.s.linkModal.noApps')}
            </Text>
          </Box>
        ) : (
          <Box mb='4'>
            <Select.Root value={selectedApp} onValueChange={onSelectedAppChange}>
              <Select.Trigger
                style={{ width: '100%', cursor: 'pointer' }}
                placeholder={t('services.s.linkModal.selectPlaceholder')}
              >
                {selectedApp
                  ? selectedApp.replace(/^\d+-/, '')
                  : t('services.s.linkModal.selectPlaceholder')}
              </Select.Trigger>
              <Select.Content>
                {availableApps.map((appName) => (
                  <Select.Item key={appName} value={appName} style={{ cursor: 'pointer' }}>
                    {appName.replace(/^\d+-/, '')}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>
        )}

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button variant='soft' color='gray' style={{ cursor: 'pointer' }} onClick={onCancel}>
              {t('services.s.linkModal.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            variant='solid'
            color='blue'
            style={{ cursor: 'pointer' }}
            onClick={onConfirm}
            disabled={linkLoading || !selectedApp || availableApps.length === 0}
          >
            {linkLoading ? <ReloadIcon className={styles.buttonSpinner} /> : <Link1Icon />}
            {linkLoading ? t('services.s.linkModal.confirming') : t('services.s.linkModal.confirm')}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
