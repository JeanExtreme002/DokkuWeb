import { Box, Button, Flex, Text } from '@radix-ui/themes';
import React from 'react';

import { usePageTranslation } from '@/i18n/utils';

interface ActionButtonsProps {
  canSubmit: boolean;
  creating: boolean;
  onCancel: () => void;
  onCreate: () => void;
  spinnerClassName: string;
  buttonsContainerClassName: string;
}

export function ActionButtons(props: ActionButtonsProps) {
  const { canSubmit, creating, onCancel, onCreate, spinnerClassName, buttonsContainerClassName } =
    props;
  const { t } = usePageTranslation();

  return (
    <Flex justify='end' gap='3' className={buttonsContainerClassName}>
      <Button
        size='3'
        color='gray'
        variant='outline'
        style={{ cursor: 'pointer' }}
        onClick={onCancel}
        disabled={creating}
      >
        {t('services.create.actions.cancel')}
      </Button>
      <Button
        size='3'
        onClick={onCreate}
        disabled={!canSubmit}
        style={{
          background: canSubmit
            ? 'linear-gradient(135deg, var(--green-9) 0%, var(--green-10) 100%)'
            : 'var(--gray-5)',
          border: 'none',
          color: 'white',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          fontWeight: '500',
          padding: '12px 24px',
          minWidth: '180px',
        }}
      >
        {creating ? (
          <Flex align='center' gap='2'>
            <Box
              className={spinnerClassName}
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid white',
                borderRadius: '50%',
              }}
            />
            <Text>{t('services.create.actions.creating')}</Text>
          </Flex>
        ) : (
          t('services.create.actions.create')
        )}
      </Button>
    </Flex>
  );
}
