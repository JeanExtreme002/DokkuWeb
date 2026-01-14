import { DownloadIcon, ReloadIcon } from '@radix-ui/react-icons';
import { Box, Button, Flex, Heading, Select, Text } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../service-details.module.css';

interface LogsSectionProps {
  logs: string;
  errorMessage: string | null;
  logsLoading: boolean;
  logLinesLimit: number;
  setLogLinesLimit: (value: number) => void;
  refreshLogs: () => Promise<void> | void;
  downloadLogs: () => void;
  processAnsiCodes: (text: string) => string;
}

export function LogsSection({
  logs,
  errorMessage,
  logsLoading,
  logLinesLimit,
  setLogLinesLimit,
  refreshLogs,
  downloadLogs,
  processAnsiCodes,
}: LogsSectionProps) {
  const { t } = usePageTranslation();
  return (
    <>
      {/* Desktop Layout - Inline (> 720px) */}
      <Flex
        justify='between'
        align='center'
        className={styles.logsHeader}
        style={{ marginBottom: '16px' }}
      >
        <Flex align='center' gap='3'>
          <Heading size='5'>{t('services.s.logs.title')}</Heading>
          <Flex align='center' gap='2'>
            <Text size='2' style={{ color: 'var(--gray-11)' }}>
              {t('services.s.logs.linesLabel')}
            </Text>
            <Select.Root
              value={logLinesLimit.toString()}
              onValueChange={(value) => setLogLinesLimit(Number(value))}
            >
              <Select.Trigger style={{ minWidth: '70px', cursor: 'pointer' }} />
              <Select.Content>
                <Select.Item style={{ cursor: 'pointer' }} value='500'>
                  500
                </Select.Item>
                <Select.Item style={{ cursor: 'pointer' }} value='1000'>
                  1000
                </Select.Item>
                <Select.Item style={{ cursor: 'pointer' }} value='2000'>
                  2000
                </Select.Item>
                <Select.Item style={{ cursor: 'pointer' }} value='5000'>
                  5000
                </Select.Item>
                <Select.Item style={{ cursor: 'pointer' }} value='7000'>
                  7000
                </Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
        </Flex>
        <Flex gap='2' align='center' className={styles.logsButtons}>
          <Button
            onClick={refreshLogs}
            disabled={logsLoading}
            variant='outline'
            style={{ cursor: 'pointer' }}
          >
            <ReloadIcon className={logsLoading ? styles.buttonSpinner : ''} />
            {logsLoading ? t('services.s.logs.refreshing') : t('services.s.logs.refresh')}
          </Button>

          {!logsLoading && !errorMessage && logs && (
            <Button
              onClick={downloadLogs}
              style={{
                background: 'linear-gradient(135deg, var(--green-9) 0%, var(--green-10) 100%)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              <DownloadIcon />
              {t('services.s.logs.downloadButton')}
            </Button>
          )}
        </Flex>
      </Flex>

      {/* Mobile Layout - Stacked (≤ 720px) */}
      <Box style={{ marginBottom: '16px' }} className={styles.mobileLogsHeader}>
        <Heading size='5' style={{ marginBottom: '12px' }}>
          {t('services.s.logs.title')}
        </Heading>
        <Flex direction='column' gap='3'>
          <Flex align='center' gap='2'>
            <Text size='2' style={{ color: 'var(--gray-11)' }}>
              {t('services.s.logs.linesLabel')}
            </Text>
            <Select.Root
              value={logLinesLimit.toString()}
              onValueChange={(value) => setLogLinesLimit(Number(value))}
            >
              <Select.Trigger style={{ minWidth: '70px' }} />
              <Select.Content>
                <Select.Item value='500'>500</Select.Item>
                <Select.Item value='1000'>1000</Select.Item>
                <Select.Item value='2000'>2000</Select.Item>
                <Select.Item value='5000'>5000</Select.Item>
                <Select.Item value='7000'>7000</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
          <Flex gap='2' align='center' direction='column' style={{ width: '100%' }}>
            <Button
              onClick={refreshLogs}
              disabled={logsLoading}
              variant='outline'
              style={{ width: '100%' }}
            >
              <ReloadIcon className={logsLoading ? styles.buttonSpinner : ''} />
              {logsLoading ? t('services.s.logs.refreshing') : t('services.s.logs.refresh')}
            </Button>

            {!logsLoading && !errorMessage && logs && (
              <Button
                onClick={downloadLogs}
                style={{
                  background: 'linear-gradient(135deg, var(--green-9) 0%, var(--green-10) 100%)',
                  border: 'none',
                  color: 'white',
                  width: '100%',
                }}
              >
                <DownloadIcon />
                {t('services.s.logs.downloadButton')}
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>

      {logsLoading ? (
        <Box className={styles.loadingSpinner}>
          <Box className={styles.spinner}></Box>
          <Text style={{ marginLeft: '12px' }}>{t('services.s.logs.loading')}</Text>
        </Box>
      ) : errorMessage ? (
        <Box className={styles.errorMessage}>
          <Text>{errorMessage}</Text>
        </Box>
      ) : (
        <Box className={styles.logsContainer}>
          {logs ? processAnsiCodes(logs) : t('services.s.logs.empty')}
        </Box>
      )}
    </>
  );
}
