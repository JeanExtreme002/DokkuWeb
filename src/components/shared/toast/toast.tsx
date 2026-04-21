import { Cross2Icon } from '@radix-ui/react-icons';
import { Box, Flex, Text } from '@radix-ui/themes';
import React, { useEffect } from 'react';

import styles from './toast.module.css';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
  color?: string;
  progressAnimation?: boolean;
  icon?: React.ReactNode;
}

export function Toast({
  message,
  visible,
  onHide,
  duration = 5000,
  color = 'amber',
  progressAnimation = false,
  icon,
}: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onHide, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onHide]);

  if (!visible) return null;

  return (
    <Box
      className={styles.toast}
      style={
        {
          '--toast-duration': `${duration}ms`,
          background: `var(--${color}-3)`,
          borderColor: `var(--${color}-7)`,
        } as React.CSSProperties
      }
    >
      {progressAnimation && <div className={styles.overlay} />}
      <Flex align='center' gap='3' style={{ position: 'relative', zIndex: 1 }}>
        {icon && (
          <Box style={{ color: `var(--${color}-11)`, flexShrink: 0, marginTop: '5px' }}>{icon}</Box>
        )}
        <Text size='2' style={{ color: `var(--${color}-12)`, lineHeight: '1.4', flex: 1 }}>
          {message}
        </Text>
        <button
          className={styles.closeButton}
          onClick={onHide}
          aria-label='Close'
          style={{ color: `var(--${color}-11)` }}
        >
          <Cross2Icon width={18} height={18} />
        </button>
      </Flex>
    </Box>
  );
}
