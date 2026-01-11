import { EyeOpenIcon, GlobeIcon } from '@radix-ui/react-icons';
import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes';

import searchStyles from '../../search.module.css';

interface NetworkCardProps {
  name: string;
  isMobile: boolean;
}

export function NetworkCard({ name, isMobile }: NetworkCardProps) {
  return (
    <Card
      key={`net-${name}`}
      style={{
        border: '1px solid var(--gray-6)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease',
        cursor: isMobile ? 'default' : 'pointer',
      }}
      className={searchStyles.appCard}
      onClick={isMobile ? undefined : () => (window.location.href = `/networks`)}
      onMouseEnter={
        isMobile
          ? undefined
          : (e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
            }
      }
      onMouseLeave={
        isMobile
          ? undefined
          : (e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
            }
      }
    >
      <Flex className={searchStyles.appCardContent}>
        <Box
          style={{
            flexShrink: 0,
            width: '80px',
            height: '80px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--green-3) 0%, var(--blue-3) 100%)',
            border: '1px solid var(--green-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GlobeIcon width='48' height='48' style={{ color: 'var(--green-11)' }} />
        </Box>
        <Flex direction='column' className={searchStyles.appInfo}>
          <Heading size='4' weight='medium' style={{ color: 'var(--gray-12)' }}>
            {name}
          </Heading>
          <Text size='2' color='gray'>
            Rede customizada do usuário para conectar aplicações no Dokku
          </Text>
        </Flex>
        <Flex direction='column' className={searchStyles.appActions}>
          <Text size='2' color='gray' className={searchStyles.dateText}>
            Rede customizada
          </Text>
          <Button
            size='3'
            color='blue'
            variant='outline'
            style={{ cursor: 'pointer' }}
            onClick={() => (window.location.href = `/networks`)}
          >
            <EyeOpenIcon />
            Ver detalhes
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
