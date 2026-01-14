import { DownloadIcon, ReloadIcon } from '@radix-ui/react-icons';
import { Box, Button, Flex, Heading, Select, Text } from '@radix-ui/themes';
import React from 'react';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../app-details.module.css';

interface LogsSectionProps {
  logs: string;
  logsLoading: boolean;
  error: string | null;
  logLinesLimit: number;
  onSetLinesLimit: (value: number) => void;
  onRefresh: () => void;
  onDownload: () => void;
  processAnsiCodes: (text: string) => string;
}

export function LogsSection(props: LogsSectionProps) {
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
          <Heading size='5'>{t('logs.title')}</Heading>
          <Flex align='center' gap='2'>
            <Text size='2' style={{ color: 'var(--gray-11)' }}>
              {t('logs.linesLabel')}
            </Text>
            <Select.Root
              value={props.logLinesLimit.toString()}
              onValueChange={(value) => props.onSetLinesLimit(Number(value))}
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
            onClick={props.onRefresh}
            disabled={props.logsLoading}
            variant='outline'
            style={{ cursor: 'pointer' }}
          >
            <ReloadIcon className={props.logsLoading ? styles.buttonSpinner : ''} />
            {props.logsLoading ? t('logs.refreshing') : t('logs.refresh')}
          </Button>
          {!props.logsLoading && !props.error && props.logs && (
            <Button
              onClick={props.onDownload}
              style={{
                background: 'linear-gradient(135deg, var(--green-9) 0%, var(--green-10) 100%)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              <DownloadIcon />
              {t('logs.download')}
            </Button>
          )}
        </Flex>
      </Flex>

      {/* Mobile/Tablet Layout - Stacked (≤ 720px) */}
      <Box style={{ marginBottom: '16px' }} className={styles.mobileLogsHeader}>
        <Heading size='5' style={{ marginBottom: '12px' }}>
          {t('logs.title')}
        </Heading>
        <Flex direction='column' gap='3'>
          <Flex align='center' gap='2'>
            <Text size='2' style={{ color: 'var(--gray-11)' }}>
              {t('logs.linesLabel')}
            </Text>
            <Select.Root
              value={props.logLinesLimit.toString()}
              onValueChange={(value) => props.onSetLinesLimit(Number(value))}
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
              onClick={props.onRefresh}
              disabled={props.logsLoading}
              variant='outline'
              style={{ width: '100%' }}
            >
              <ReloadIcon className={props.logsLoading ? styles.buttonSpinner : ''} />
              {props.logsLoading ? t('logs.refreshing') : t('logs.refresh')}
            </Button>
            {!props.logsLoading && !props.error && props.logs && (
              <Button
                onClick={props.onDownload}
                style={{
                  background: 'linear-gradient(135deg, var(--green-9) 0%, var(--green-10) 100%)',
                  border: 'none',
                  color: 'white',
                  width: '100%',
                }}
              >
                <DownloadIcon />
                {t('logs.download')}
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>

      {props.logsLoading ? (
        <Box className={styles.loadingSpinner}>
          <Box className={styles.spinner}></Box>
          <Text style={{ marginLeft: '12px' }}>{t('logs.loading')}</Text>
        </Box>
      ) : props.error ? (
        <Box className={styles.errorMessage}>
          <Text>{props.error}</Text>
        </Box>
      ) : (
        <Box className={styles.logsContainer}>
          {props.logs ? props.processAnsiCodes(props.logs) : t('logs.empty')}
        </Box>
      )}
    </>
  );
}

export default LogsSection;
