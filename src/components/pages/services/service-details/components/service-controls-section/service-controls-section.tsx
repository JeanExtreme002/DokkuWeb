import { Link1Icon, PlayIcon, ReloadIcon } from '@radix-ui/react-icons';
import { Button, Flex } from '@radix-ui/themes';

import { StopIcon } from '@/components/shared';
import { usePageTranslation } from '@/i18n/utils';

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
  const { t } = usePageTranslation();
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
              {t('services.s.controls.start')}
            </Button>

            <Button
              size='3'
              variant='outline'
              color='red'
              onClick={onStopClick}
              disabled={stopDisabled}
            >
              {stopLoading ? <ReloadIcon className={styles.buttonSpinner} /> : <StopIcon />}
              {t('services.s.controls.stop')}
            </Button>

            <Button
              size='3'
              variant='outline'
              color='orange'
              onClick={onRestartClick}
              disabled={restartDisabled}
            >
              {restartLoading ? <ReloadIcon className={styles.buttonSpinner} /> : <ReloadIcon />}
              {t('services.s.controls.restart')}
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
            {t('services.s.controls.linkApp')}
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
              {t('services.s.controls.start')}
            </Button>

            <Button
              size='3'
              variant='outline'
              color='red'
              onClick={onStopClick}
              disabled={stopDisabled}
            >
              {stopLoading ? <ReloadIcon className={styles.buttonSpinner} /> : <StopIcon />}
              {t('services.s.controls.stop')}
            </Button>

            <Button
              size='3'
              variant='outline'
              color='orange'
              onClick={onRestartClick}
              disabled={restartDisabled}
            >
              {restartLoading ? <ReloadIcon className={styles.buttonSpinner} /> : <ReloadIcon />}
              {t('services.s.controls.restart')}
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
            {t('services.s.controls.linkApp')}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
