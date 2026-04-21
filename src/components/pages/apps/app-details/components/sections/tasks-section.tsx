import { CheckIcon, CopyIcon, PlayIcon, ReloadIcon } from '@radix-ui/react-icons';
import {
  Box,
  Button,
  Code,
  Flex,
  Heading,
  IconButton,
  Separator,
  Text,
  TextField,
} from '@radix-ui/themes';
import React, { useState } from 'react';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../app-details.module.css';

export interface CronTask {
  id: string;
  command: string;
  schedule: string;
  maintenance: boolean;
}

interface TasksSectionProps {
  tasks: CronTask[];
  tasksLoading: boolean;
  error: string | null;
  runId: string;
  runLoading: boolean;
  runOutput: string | null;
  runSuccess: boolean | null;
  onSetRunId: (id: string) => void;
  onRunTask: () => void;
  onRefresh: () => void;
}

export function TasksSection(props: TasksSectionProps) {
  const { t } = usePageTranslation();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <>
      {/* Desktop layout (> 720px) */}
      <Flex
        justify='between'
        align='center'
        className={styles.tasksHeader}
        style={{ marginBottom: '16px' }}
      >
        <Heading size='5'>{t('tasks.title')}</Heading>
        <Button
          onClick={props.onRefresh}
          disabled={props.tasksLoading}
          variant='outline'
          style={{ cursor: 'pointer' }}
        >
          <ReloadIcon className={props.tasksLoading ? styles.buttonSpinner : ''} />
          {props.tasksLoading ? t('tasks.refreshing') : t('tasks.refresh')}
        </Button>
      </Flex>

      {/* Mobile layout (≤ 720px) */}
      <Box className={styles.mobileTasksHeader} style={{ marginBottom: '16px' }}>
        <Heading size='5' style={{ marginBottom: '12px' }}>
          {t('tasks.title')}
        </Heading>
        <Button
          onClick={props.onRefresh}
          disabled={props.tasksLoading}
          variant='outline'
          style={{ width: '100%', cursor: 'pointer' }}
        >
          <ReloadIcon className={props.tasksLoading ? styles.buttonSpinner : ''} />
          {props.tasksLoading ? t('tasks.refreshing') : t('tasks.refresh')}
        </Button>
      </Box>

      {props.tasksLoading ? (
        <Box className={styles.loadingSpinner}>
          <Box className={styles.spinner}></Box>
          <Text style={{ marginLeft: '12px' }}>{t('tasks.loading')}</Text>
        </Box>
      ) : props.error ? (
        <Box className={styles.errorMessage}>
          <Text>{props.error}</Text>
        </Box>
      ) : props.tasks.length === 0 ? (
        <Box
          style={{
            border: '1px solid var(--gray-6)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <Box
            style={{
              padding: '32px 24px 20px',
              textAlign: 'center',
              borderBottom: '1px solid var(--gray-6)',
              background: 'var(--gray-2)',
            }}
          >
            <Text size='3' weight='medium' style={{ color: 'var(--gray-11)' }}>
              {t('tasks.empty')}
            </Text>
          </Box>
          <Box style={{ padding: '20px 24px' }}>
            <Text
              size='2'
              style={{ color: 'var(--gray-11)', display: 'block', marginBottom: '12px' }}
            >
              {t('tasks.emptyHintPrefix')}
              <Code size='2'>app.json</Code>
              {t('tasks.emptyHintSuffix')}
            </Text>
            <pre className={styles.codeBlock}>{`{
  "cron": [
    {
      "command": "python manage.py cleanup_sessions",
      "schedule": "0 3 * * *"
    },
    {
      "command": "node scripts/send-digest.js",
      "schedule": "*/15 * * * *"
    }
  ]
}`}</pre>
          </Box>
        </Box>
      ) : (
        <Box className={styles.tasksTableWrapper}>
          <table className={styles.tasksTable}>
            <colgroup>
              <col className={styles.tasksColCommand} />
              <col className={styles.tasksColSchedule} />
              <col className={styles.tasksColId} />
              <col className={styles.tasksColMaintenance} />
            </colgroup>
            <thead>
              <tr className={styles.tasksHeaderRow}>
                <th className={styles.tasksHeaderCell}>{t('tasks.columns.command')}</th>
                <th className={styles.tasksHeaderCell}>{t('tasks.columns.schedule')}</th>
                <th className={styles.tasksHeaderCell}>{t('tasks.columns.id')}</th>
                <th className={styles.tasksHeaderCell}>{t('tasks.columns.maintenance')}</th>
              </tr>
            </thead>
            <tbody>
              {props.tasks.map((task) => (
                <tr key={task.id} className={styles.tasksRow}>
                  <td className={styles.tasksCell} data-label={t('tasks.columns.command')}>
                    <div className={`${styles.tasksCellScroll} ${styles.tasksCellMonospace}`}>
                      {task.command}
                    </div>
                  </td>
                  <td className={styles.tasksCell} data-label={t('tasks.columns.schedule')}>
                    <div className={`${styles.tasksCellScroll} ${styles.tasksCellMonospace}`}>
                      {task.schedule}
                    </div>
                  </td>
                  <td className={styles.tasksCell} data-label={t('tasks.columns.id')}>
                    <Flex align='center' gap='1' style={{ minWidth: 0 }}>
                      <div className={styles.tasksCellScroll}>{task.id}</div>
                      <IconButton
                        size='1'
                        variant='ghost'
                        color={copiedId === task.id ? 'green' : 'gray'}
                        onClick={() => copyId(task.id)}
                        className={styles.tasksCopyButton}
                        style={{ cursor: 'pointer', flexShrink: 0 }}
                      >
                        {copiedId === task.id ? <CheckIcon /> : <CopyIcon />}
                      </IconButton>
                    </Flex>
                  </td>
                  <td className={styles.tasksCell} data-label={t('tasks.columns.maintenance')}>
                    {String(task.maintenance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}

      {!props.tasksLoading && !props.error && props.tasks.length > 0 && (
        <>
          <Separator size='4' style={{ margin: '24px 0' }} />

          <Heading size='4' style={{ marginBottom: '12px' }}>
            {t('tasks.run.title')}
          </Heading>
          <Flex gap='2' align='center' style={{ marginBottom: '16px' }}>
            <TextField.Root
              placeholder={t('tasks.run.idPlaceholder')}
              color='orange'
              value={props.runId}
              onChange={(e) => props.onSetRunId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !props.runLoading && props.onRunTask()}
              disabled={props.runLoading}
              style={{ flex: 1 }}
            />
            <Button
              onClick={props.onRunTask}
              disabled={props.runLoading || !props.runId.trim()}
              color='orange'
              variant='outline'
              style={{ cursor: 'pointer' }}
            >
              {props.runLoading ? <ReloadIcon className={styles.buttonSpinner} /> : <PlayIcon />}
              {props.runLoading ? t('tasks.run.running') : t('tasks.run.button')}
            </Button>
          </Flex>

          <Box
            className={`${styles.logsContainer} ${styles.tasksOutputContainer}`}
            style={{
              borderColor: props.runSuccess === false ? 'var(--red-6)' : 'var(--gray-6)',
            }}
          >
            {props.runOutput}
          </Box>
        </>
      )}
    </>
  );
}

export default TasksSection;
