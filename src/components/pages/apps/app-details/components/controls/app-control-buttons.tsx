import { GearIcon, PlayIcon, ReloadIcon, RocketIcon } from '@radix-ui/react-icons';
import { Button, Flex } from '@radix-ui/themes';
import React from 'react';

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

// Renders the group of app control buttons, preserving visuals
export function AppControlButtons(props: AppControlButtonsProps) {
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
            Iniciar
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
            {props.stopLoading ? (
              <ReloadIcon className={styles.buttonSpinner} />
            ) : (
              <svg
                width='16'
                height='16'
                viewBox='0 0 16 16'
                fill='currentColor'
                xmlns='http://www.w3.org/2000/svg'
              >
                <rect x='4' y='2' width='2' height='12' rx='1' />
                <rect x='10' y='2' width='2' height='12' rx='1' />
              </svg>
            )}
            Parar
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
            Reiniciar
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
            Reconstruir
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
            Configurar Builder
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default AppControlButtons;
