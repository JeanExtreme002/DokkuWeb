import { ChevronRightIcon, TrashIcon } from '@radix-ui/react-icons';
import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes';

import { AppAvatar } from '@/components/shared';
import { DotIcon } from '@/components/shared/icons';

import styles from '../../service-details.module.css';

interface ConnectedAppsSectionProps {
  linkedApps: string[];
  errorMessage: string | null;
  isXsScreen: boolean;
  isSmScreen: boolean;
  isMdScreen: boolean;
  onUnlinkApp: (appName: string) => void;
}

export function ConnectedAppsSection({
  linkedApps,
  errorMessage,
  isXsScreen,
  isSmScreen,
  isMdScreen,
  onUnlinkApp,
}: ConnectedAppsSectionProps) {
  return (
    <Flex direction='column' gap='4'>
      <Heading size='5' style={{ marginBottom: '20px' }}>
        Aplicações Conectadas
      </Heading>

      {errorMessage ? (
        <Card
          style={{
            border: '1px solid var(--red-6)',
            backgroundColor: 'var(--red-2)',
            padding: '20px',
          }}
        >
          <Flex align='center' gap='3'>
            <Box style={{ color: 'var(--red-11)' }}>
              <DotIcon />
            </Box>
            <Text size='3' style={{ color: 'var(--red-11)' }}>
              {errorMessage}
            </Text>
          </Flex>
        </Card>
      ) : linkedApps.length === 0 ? (
        <Card
          style={{
            border: '1px solid var(--gray-6)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <Text size='3' color='gray'>
            Nenhuma aplicação vinculada a este serviço.
          </Text>
        </Card>
      ) : (
        <Flex direction='column' gap='3'>
          {linkedApps.map((appName) => (
            <Card
              key={appName}
              className={styles.connectedAppCard}
              style={{
                border: '1px solid var(--gray-6)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.2s ease',
                width: '100%',
              }}
            >
              <Flex direction='column' style={{ padding: '16px 20px', width: '100%' }}>
                {/* Main content row */}
                <Flex
                  align='center'
                  justify='between'
                  style={{ width: '100%', cursor: 'pointer' }}
                  onClick={() => (window.location.href = `/apps/a/${appName}`)}
                  onMouseEnter={(e) => {
                    const card = e.currentTarget.closest('.connectedAppCard') as HTMLElement;
                    if (card) {
                      card.style.transform = 'translateY(-1px)';
                      card.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                      card.style.borderColor = 'var(--blue-7)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    const card = e.currentTarget.closest('.connectedAppCard') as HTMLElement;
                    if (card) {
                      card.style.transform = 'translateY(0)';
                      card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
                      card.style.borderColor = 'var(--gray-6)';
                    }
                  }}
                >
                  <Flex align='center' gap='4'>
                    <AppAvatar size='5' cpuSize='40' />

                    <Flex direction='column' gap='1'>
                      <Heading
                        size='4'
                        weight='medium'
                        className={styles.appTitle}
                        style={{ color: 'var(--gray-12)' }}
                      >
                        {appName.replace(/^\d+-/, '')}
                      </Heading>
                      <Text
                        size='2'
                        className={styles.appDescription}
                        style={{ color: 'var(--gray-9)' }}
                      >
                        Aplicação vinculada
                      </Text>
                    </Flex>
                  </Flex>

                  {/* Desktop: Show buttons on the right */}
                  {!isXsScreen && !isSmScreen && (
                    <Flex align='center' gap='2'>
                      <Button
                        size='1'
                        variant='surface'
                        color='red'
                        className={styles.unlinkButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnlinkApp(appName);
                        }}
                        style={{ position: 'relative', zIndex: 2 }}
                      >
                        <TrashIcon />
                        {/* Show text only on screens larger than MD (>768px) */}
                        {!isMdScreen && (
                          <Text size='1' style={{ marginLeft: '4px' }}>
                            Desvincular
                          </Text>
                        )}
                      </Button>

                      <ChevronRightIcon
                        className={styles.chevronIcon}
                        style={{
                          color: 'var(--gray-9)',
                          width: '20px',
                          height: '20px',
                          transition: 'all 0.2s ease',
                        }}
                      />
                    </Flex>
                  )}

                  {/* Mobile: Show only chevron */}
                  {(isXsScreen || isSmScreen) && (
                    <ChevronRightIcon
                      className={styles.chevronIcon}
                      style={{
                        color: 'var(--gray-9)',
                        width: '20px',
                        height: '20px',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  )}
                </Flex>

                {/* Mobile: Show unlink button below */}
                {(isXsScreen || isSmScreen) && (
                  <Button
                    size='2'
                    variant='surface'
                    color='red'
                    className={`${styles.unlinkButton} ${styles.unlinkButtonMobile}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnlinkApp(appName);
                    }}
                    style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}
                  >
                    <TrashIcon />
                    <Text size='2' style={{ marginLeft: '6px' }}>
                      Desvincular
                    </Text>
                  </Button>
                )}
              </Flex>
            </Card>
          ))}
        </Flex>
      )}
    </Flex>
  );
}
