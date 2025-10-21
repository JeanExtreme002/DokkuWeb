import { Box, Card, Flex, Text } from '@radix-ui/themes';
import { useEffect, useState } from 'react';

import styles from './loading-spinner.module.css';

interface LoadingSpinnerProps {
  messages?: string[];
  title?: string;
}

const defaultMessages = [
  'Carregando dados...',
  'Conectando ao servidor...',
  'Processando informações...',
  'Quase pronto...',
  'Finalizando...',
];

export function LoadingSpinner({
  messages = defaultMessages,
  title = 'Carregando',
}: LoadingSpinnerProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <Card
      style={{
        border: '1px solid var(--gray-6)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        padding: '48px',
        paddingBlock: '130px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--gray-1) 0%, var(--gray-2) 100%)',
      }}
    >
      <Flex direction='column' align='center' gap='6'>
        {/* Spinner principal */}
        <div className={styles.spinnerContainer}>
          <div className={styles.spinner}>
            <div className={styles.spinnerRing}></div>
            <div className={styles.spinnerRing}></div>
            <div className={styles.spinnerRing}></div>
          </div>

          {/* Pontos orbitais */}
          <div className={styles.orbitalDots}>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
          </div>
        </div>

        {/* Título */}
        <Box>
          <Text
            size='5'
            weight='medium'
            style={{
              color: 'var(--gray-12)',
              marginBottom: '8px',
              background: 'linear-gradient(135deg, var(--blue-11) 0%, var(--purple-11) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {title}
          </Text>
        </Box>

        {/* Mensagem animada */}
        <Box className={styles.messageContainer}>
          <Text
            size='3'
            className={styles.loadingMessage}
            style={{
              color: 'var(--gray-11)',
              minHeight: '20px',
            }}
          >
            {messages[currentMessageIndex]}
          </Text>
        </Box>

        {/* Barra de progresso animada */}
        <Box className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill}></div>
          </div>
        </Box>

        {/* Pulsos de fundo */}
        <div className={styles.backgroundPulses}>
          <div className={styles.pulse}></div>
          <div className={styles.pulse}></div>
          <div className={styles.pulse}></div>
        </div>
      </Flex>
    </Card>
  );
}
