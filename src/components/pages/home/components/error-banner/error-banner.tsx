import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Card, Flex, Text } from '@radix-ui/themes';

import styles from '../../home.module.css';

interface ErrorBannerProps {
  error: string | null;
}

export function ErrorBanner({ error }: ErrorBannerProps) {
  if (!error) return null;

  return (
    <Card className={styles.errorCard} style={{ marginBottom: '24px' }}>
      <Flex align='center' gap='3'>
        <ExclamationTriangleIcon color='red' />
        <Text size='3' color='red'>
          {error}
        </Text>
      </Flex>
    </Card>
  );
}
