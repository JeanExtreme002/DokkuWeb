import { TrashIcon } from '@radix-ui/react-icons';
import { Box, Button, Flex, Text } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

interface EnvironmentVariable {
  key: string;
  value: string;
  id: string;
}

interface EnvListProps {
  variables: EnvironmentVariable[];
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export function EnvList({ variables, onRemove, disabled }: EnvListProps) {
  const { t } = usePageTranslation();
  if (variables.length === 0) return null;

  return (
    <Box
      style={{
        border: '1px solid var(--gray-6)',
        borderRadius: '8px',
        padding: '12px',
        backgroundColor: 'var(--gray-1)',
      }}
    >
      <Text size='2' color='gray' weight='medium' style={{ marginBottom: '12px' }}>
        {t('env.list.title')}
      </Text>
      <Flex direction='column' gap='2'>
        {variables.map((envVar) => (
          <Flex
            key={envVar.id}
            align='center'
            justify='between'
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: '6px',
              border: '1px solid var(--gray-5)',
            }}
          >
            <Flex gap='3' align='center' style={{ flex: 1 }}>
              <Text
                size='2'
                weight='medium'
                style={{
                  color: 'var(--blue-11)',
                  fontFamily: 'monospace',
                  minWidth: '120px',
                }}
              >
                {envVar.key}
              </Text>
              <Text size='2' color='gray'>
                =
              </Text>
              <Text
                size='2'
                style={{
                  color: 'var(--gray-11)',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                }}
              >
                {envVar.value}
              </Text>
            </Flex>
            <Button
              size='1'
              variant='ghost'
              onClick={() => onRemove(envVar.id)}
              disabled={disabled}
              style={{ color: 'var(--red-11)', cursor: 'pointer' }}
            >
              <TrashIcon />
            </Button>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}
