import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Box, Button, Card, Flex, Heading, Text, TextField, Tooltip } from '@radix-ui/themes';

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
  return (
    <Card style={{ border: '1px solid var(--amber-6)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <Flex direction='column' gap='3' style={{ padding: '12px' }}>
        <Flex align='center' gap='3'>
          <Heading size='5' weight='medium' style={{ color: 'var(--gray-12)' }}>
            Rodar comando no Dokku
          </Heading>
          <Tooltip content='Execute qualquer comando Dokku disponível'>
            <InfoCircledIcon style={{ color: 'var(--gray-9)' }} />
          </Tooltip>
        </Flex>
        <Flex gap='2' align='center'>
          <TextField.Root
            color='orange'
            placeholder='dokku apps'
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
              'Executando...'
            ) : (
              <>
                <svg
                  width='18'
                  height='18'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <rect
                    x='3'
                    y='4'
                    width='18'
                    height='14'
                    rx='2'
                    stroke='currentColor'
                    strokeWidth='2'
                    fill='none'
                  />
                  <path
                    d='M7 9l3 3-3 3'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M13 15h4'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                Executar
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
