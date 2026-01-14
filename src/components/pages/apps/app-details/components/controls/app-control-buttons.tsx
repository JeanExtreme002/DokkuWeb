import { GearIcon, PlayIcon, ReloadIcon, RocketIcon } from '@radix-ui/react-icons';
import { Button, Flex } from '@radix-ui/themes';
import React from 'react';

import { StopIcon } from '@/components/shared/icons';
import { usePageTranslation } from '@/i18n/utils';

import styles from '../../app-details.module.css';

interface AppControlButtonsProps {
  canStart: boolean;
  canStop: boolean;
  canRestart: boolean;
  isBusy: boolean;
  startLoading: boolean;
  stopLoading: boolean;
  restartLoading: boolean;
  rebuildLoading: boolean;
  builderConfigLoading: boolean;
  onStart: () => void;
  onStopConfirm: () => void;
  onRestartConfirm: () => void;
  onRebuildConfirm: () => void;
  onOpenBuilder: () => void;
}

export function AppControlButtons(props: AppControlButtonsProps) {
  const { t } = usePageTranslation();
  return (
    <Flex direction='column' gap='3'>
      <Flex
        direction='column'
        gap='3'
        className={styles.appControlButtons}
        style={{ width: '100%' }}
      >
        {/* First row: Start, Stop, Restart */}
        <Flex gap='3' className={styles.buttonRow} style={{ width: '100%' }}>
          <Button
            size='3'
            variant='outline'
            color='green'
            onClick={props.onStart}
            disabled={
              !props.canStart ||
              props.isBusy ||
              props.startLoading ||
              props.stopLoading ||
              props.restartLoading ||
              props.rebuildLoading
            }
          >
            {props.startLoading ? <ReloadIcon className={styles.buttonSpinner} /> : <PlayIcon />}
            {t('controls.start')}
          </Button>

          <Button
            size='3'
            variant='outline'
            color='red'
            onClick={props.onStopConfirm}
            disabled={
              !props.canStop ||
              props.isBusy ||
              props.startLoading ||
              props.stopLoading ||
              props.restartLoading ||
              props.rebuildLoading
            }
          >
            {props.stopLoading ? <ReloadIcon className={styles.buttonSpinner} /> : <StopIcon />}
            {t('controls.stop')}
          </Button>

          <Button
            size='3'
            variant='outline'
            color='orange'
            onClick={props.onRestartConfirm}
            disabled={
              !props.canRestart ||
              props.isBusy ||
              props.startLoading ||
              props.stopLoading ||
              props.restartLoading ||
              props.rebuildLoading
            }
          >
            {props.restartLoading ? (
              <ReloadIcon className={styles.buttonSpinner} />
            ) : (
              <ReloadIcon />
            )}
            {t('controls.restart')}
          </Button>
        </Flex>

        {/* Second row: Rebuild, Configure Builder */}
        <Flex gap='3' className={styles.buttonRow} style={{ width: '100%' }}>
          <Button
            size='3'
            variant='soft'
            color='violet'
            onClick={props.onRebuildConfirm}
            disabled={
              props.isBusy ||
              props.startLoading ||
              props.stopLoading ||
              props.restartLoading ||
              props.rebuildLoading
            }
          >
            {props.rebuildLoading ? (
              <ReloadIcon className={styles.buttonSpinner} />
            ) : (
              <RocketIcon />
            )}
            {t('controls.rebuild')}
          </Button>

          <Button
            size='3'
            variant='soft'
            color='blue'
            style={{ cursor: 'pointer' }}
            onClick={props.onOpenBuilder}
            disabled={
              props.isBusy ||
              props.startLoading ||
              props.stopLoading ||
              props.restartLoading ||
              props.rebuildLoading ||
              props.builderConfigLoading
            }
          >
            <GearIcon />
            {t('controls.builderConfig')}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default AppControlButtons;
