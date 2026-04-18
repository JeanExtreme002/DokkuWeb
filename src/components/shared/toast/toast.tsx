import { Cross2Icon, InfoCircledIcon } from '@radix-ui/react-icons';
import { Box, Flex, Text } from '@radix-ui/themes';
import React, { useEffect } from 'react';

import styles from './toast.module.css';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export function Toast({ message, visible, onHide, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onHide, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onHide]);

  if (!visible) return null;

  return (
    <Box
      className={styles.toast}
      style={{ '--toast-duration': `${duration}ms` } as React.CSSProperties}
    >
      <div className={styles.overlay} />
      <Flex align='start' gap='3' style={{ position: 'relative', zIndex: 1 }}>
        <Box style={{ color: 'var(--amber-11)', flexShrink: 0, marginTop: '1px' }}>
          <InfoCircledIcon width={18} height={18} />
        </Box>
        <Text size='2' style={{ color: 'var(--amber-12)', lineHeight: '1.4', flex: 1 }}>
          {message}
        </Text>
        <button className={styles.closeButton} onClick={onHide} aria-label='Close'>
          <Cross2Icon width={14} height={14} />
        </button>
      </Flex>
    </Box>
  );
}
