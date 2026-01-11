import { Link1Icon, PlayIcon, ReloadIcon } from '@radix-ui/react-icons';
import { Button, Flex } from '@radix-ui/themes';

import styles from '../../service-details.module.css';

interface ServiceControlsSectionProps {
  startService: () => Promise<void> | void;
  onStopClick: () => void;
  onRestartClick: () => void;
  onLinkAppClick: () => void;
  startLoading: boolean;
  stopLoading: boolean;
  restartLoading: boolean;
  serviceStatus?: string;
}

export function ServiceControlsSection({
  startService,
  onStopClick,
  onRestartClick,
  onLinkAppClick,
  startLoading,
  stopLoading,
  restartLoading,
  serviceStatus,
}: ServiceControlsSectionProps) {
  const startDisabled =
    startLoading || stopLoading || restartLoading || serviceStatus === 'running';
  const stopDisabled =
    startLoading ||
    stopLoading ||
    restartLoading ||
    !(serviceStatus === 'running' || serviceStatus === 'starting');
  const restartDisabled = startLoading || stopLoading || restartLoading;

  return (
    <Flex direction='column' gap='3'>
      <Flex
        direction='column'
        gap='3'
        className={styles.serviceControlButtons}
        style={{ width: '100%' }}
      >
        {/* Desktop Layout - Side by side */}
        <Flex
          justify='between'
          align='center'
          style={{ width: '100%' }}
          className={styles.desktopButtonLayout}
        >
          <Flex gap='3' className={styles.buttonRow}>
            <Button
              size='3'
              variant='outline'
              color='green'
              onClick={startService}
              disabled={startDisabled}
            >
              {startLoading ? <ReloadIcon className={styles.buttonSpinner} /> : <PlayIcon />}
              Iniciar
            </Button>

            <Button
              size='3'
              variant='outline'
              color='red'
              onClick={onStopClick}
              disabled={stopDisabled}
            >
              {stopLoading ? (
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
              onClick={onRestartClick}
              disabled={restartDisabled}
            >
              {restartLoading ? <ReloadIcon className={styles.buttonSpinner} /> : <ReloadIcon />}
              Reiniciar
            </Button>
          </Flex>

          {/* Link App Button - aligned to the right (desktop) */}
          <Button
            size='3'
            variant='outline'
            color='blue'
            style={{ cursor: 'pointer' }}
            onClick={onLinkAppClick}
            disabled={restartDisabled}
          >
            <Link1Icon />
            Vincular Aplicativo
          </Button>
        </Flex>

        {/* Mobile/Tablet Layout - Stacked */}
        <Flex direction='column' gap='3' className={styles.mobileButtonLayout}>
          <Flex gap='3' className={styles.buttonRow} style={{ width: '100%' }}>
            <Button
              size='3'
              variant='outline'
              color='green'
              onClick={startService}
              disabled={startDisabled}
            >
              {startLoading ? <ReloadIcon className={styles.buttonSpinner} /> : <PlayIcon />}
              Iniciar
            </Button>

            <Button
              size='3'
              variant='outline'
              color='red'
              onClick={onStopClick}
              disabled={stopDisabled}
            >
              {stopLoading ? (
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
              onClick={onRestartClick}
              disabled={restartDisabled}
            >
              {restartLoading ? <ReloadIcon className={styles.buttonSpinner} /> : <ReloadIcon />}
              Reiniciar
            </Button>
          </Flex>

          {/* Link App Button - below other buttons (mobile/tablet) */}
          <Button
            size='3'
            variant='outline'
            color='blue'
            onClick={onLinkAppClick}
            disabled={restartDisabled}
            style={{ width: '100%', cursor: 'pointer' }}
          >
            <Link1Icon />
            Vincular Aplicativo
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
