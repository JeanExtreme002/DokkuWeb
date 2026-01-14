import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Box, Button, Card, Flex, Heading, Text, TextField, Tooltip } from '@radix-ui/themes';

import { ConsoleIcon } from '@/components/shared/icons';
import { usePageTranslation } from '@/i18n/utils';

interface DokkuCommandCardProps {
  commandInput: string;
  onCommandInputChange: (val: string) => void;
  onRun: () => void;
  commandLoading: boolean;
  commandError: string | null;
  commandOutput: string;
}

export function DokkuCommandCard({
  commandInput,
  onCommandInputChange,
  onRun,
  commandLoading,
  commandError,
  commandOutput,
}: DokkuCommandCardProps) {
  const { t } = usePageTranslation();
  return (
    <Card style={{ border: '1px solid var(--amber-6)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <Flex direction='column' gap='3' style={{ padding: '12px' }}>
        <Flex align='center' gap='3'>
          <Heading size='5' weight='medium' style={{ color: 'var(--gray-12)' }}>
            {t('admin.dokku.command.title')}
          </Heading>
          <Tooltip content={t('admin.dokku.command.tooltip')}>
            <InfoCircledIcon style={{ color: 'var(--gray-9)' }} />
          </Tooltip>
        </Flex>
        <Flex gap='2' align='center'>
          <TextField.Root
            color='orange'
            placeholder={t('admin.dokku.command.input.placeholder')}
            value={commandInput}
            onChange={(e) => onCommandInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onRun();
            }}
            style={{ flex: 1 }}
          />
          <Button
            color='orange'
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={onRun}
            disabled={commandLoading || !commandInput.trim()}
          >
            {commandLoading ? (
              t('admin.dokku.command.run.loading')
            ) : (
              <>
                <ConsoleIcon />
                {t('admin.dokku.command.run.label')}
              </>
            )}
          </Button>
        </Flex>
        {commandError && (
          <Text size='2' style={{ color: 'var(--red-11)' }}>
            {commandError}
          </Text>
        )}
        <Box
          style={{
            backgroundColor: 'var(--gray-1)',
            border: '1px solid var(--gray-6)',
            borderRadius: 8,
            padding: 12,
            maxHeight: 280,
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: 12,
          }}
        >
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{commandOutput}</pre>
        </Box>
      </Flex>
    </Card>
  );
}
