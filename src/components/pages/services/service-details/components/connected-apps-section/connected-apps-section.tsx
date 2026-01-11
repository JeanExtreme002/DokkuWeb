import { ChevronRightIcon, TrashIcon } from '@radix-ui/react-icons';
import { Avatar, Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes';

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
                    <Avatar
                      size='5'
                      fallback={
                        <svg
                          width='40'
                          height='40'
                          viewBox='0 0 24 24'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          {/* CPU Body */}
                          <rect
                            x='6'
                            y='6'
                            width='12'
                            height='12'
                            rx='2'
                            stroke='#e1bee7'
                            strokeWidth='2'
                            fill='rgba(225, 190, 231, 0.1)'
                          />
                          {/* CPU Corner Details */}
                          <circle cx='8' cy='8' r='0.5' fill='#ce93d8' />
                          <circle cx='16' cy='8' r='0.5' fill='#ce93d8' />
                          <circle cx='8' cy='16' r='0.5' fill='#ce93d8' />
                          <circle cx='16' cy='16' r='0.5' fill='#ce93d8' />
                          {/* CPU Core */}
                          <rect
                            x='9'
                            y='9'
                            width='6'
                            height='6'
                            rx='1'
                            stroke='#f3e5f5'
                            strokeWidth='1.5'
                            fill='rgba(243, 229, 245, 0.2)'
                          />
                          {/* Internal Circuits */}
                          <line
                            x1='10'
                            y1='11'
                            x2='14'
                            y2='11'
                            stroke='#ce93d8'
                            strokeWidth='0.5'
                          />
                          <line
                            x1='10'
                            y1='12.5'
                            x2='14'
                            y2='12.5'
                            stroke='#ce93d8'
                            strokeWidth='0.5'
                          />
                          <line
                            x1='10'
                            y1='14'
                            x2='14'
                            y2='14'
                            stroke='#ce93d8'
                            strokeWidth='0.5'
                          />
                          <line
                            x1='11'
                            y1='10'
                            x2='11'
                            y2='14'
                            stroke='#ce93d8'
                            strokeWidth='0.5'
                          />
                          <line
                            x1='13'
                            y1='10'
                            x2='13'
                            y2='14'
                            stroke='#ce93d8'
                            strokeWidth='0.5'
                          />
                          {/* Core Activity Indicators */}
                          <circle cx='11.5' cy='11.5' r='0.3' fill='#ba68c8' />
                          <circle cx='12.5' cy='12.5' r='0.3' fill='#ba68c8' />
                          <circle cx='11.5' cy='13.5' r='0.3' fill='#ba68c8' />
                          <circle cx='12.5' cy='11.5' r='0.3' fill='#ba68c8' />
                          {/* CPU Pins - Top */}
                          <line
                            x1='8'
                            y1='6'
                            x2='8'
                            y2='3'
                            stroke='#ce93d8'
                            strokeWidth='2'
                            strokeLinecap='round'
                          />
                          <circle cx='8' cy='4.5' r='0.4' fill='#ba68c8' />
                          <line
                            x1='12'
                            y1='6'
                            x2='12'
                            y2='3'
                            stroke='#ce93d8'
                            strokeWidth='2'
                            strokeLinecap='round'
                          />
                          <circle cx='12' cy='4.5' r='0.4' fill='#ba68c8' />
                          <line
                            x1='16'
                            y1='6'
                            x2='16'
                            y2='3'
                            stroke='#ce93d8'
                            strokeWidth='2'
                            strokeLinecap='round'
                          />
                          <circle cx='16' cy='4.5' r='0.4' fill='#ba68c8' />
                          {/* CPU Pins - Bottom */}
                          <line
                            x1='8'
                            y1='18'
                            x2='8'
                            y2='21'
                            stroke='#ce93d8'
                            strokeWidth='2'
                            strokeLinecap='round'
                          />
                          <circle cx='8' cy='19.5' r='0.4' fill='#ba68c8' />
                          <line
                            x1='12'
                            y1='18'
                            x2='12'
                            y2='21'
                            stroke='#ce93d8'
                            strokeWidth='2'
                            strokeLinecap='round'
                          />
                          <circle cx='12' cy='19.5' r='0.4' fill='#ba68c8' />
                          <line
                            x1='16'
                            y1='18'
                            x2='16'
                            y2='21'
                            stroke='#ce93d8'
                            strokeWidth='2'
                            strokeLinecap='round'
                          />
                          <circle cx='16' cy='19.5' r='0.4' fill='#ba68c8' />
                          {/* CPU Pins - Left */}
                          <line
                            x1='6'
                            y1='8'
                            x2='3'
                            y2='8'
                            stroke='#ce93d8'
                            strokeWidth='2'
                            strokeLinecap='round'
                          />
                          <circle cx='4.5' cy='8' r='0.4' fill='#ba68c8' />
                          <line
                            x1='6'
                            y1='12'
                            x2='3'
                            y2='12'
                            stroke='#ce93d8'
                            strokeWidth='2'
                            strokeLinecap='round'
                          />
                          <circle cx='4.5' cy='12' r='0.4' fill='#ba68c8' />
                          <line
                            x1='6'
                            y1='16'
                            x2='3'
                            y2='16'
                            stroke='#ce93d8'
                            strokeWidth='2'
                            strokeLinecap='round'
                          />
                          <circle cx='4.5' cy='16' r='0.4' fill='#ba68c8' />
                          {/* CPU Pins - Right */}
                          <line
                            x1='18'
                            y1='8'
                            x2='21'
                            y2='8'
                            stroke='#ce93d8'
                            strokeWidth='2'
                            strokeLinecap='round'
                          />
                          <circle cx='19.5' cy='8' r='0.4' fill='#ba68c8' />
                          <line
                            x1='18'
                            y1='12'
                            x2='21'
                            y2='12'
                            stroke='#ce93d8'
                            strokeWidth='2'
                            strokeLinecap='round'
                          />
                          <circle cx='19.5' cy='12' r='0.4' fill='#ba68c8' />
                          <line
                            x1='18'
                            y1='16'
                            x2='21'
                            y2='16'
                            stroke='#ce93d8'
                            strokeWidth='2'
                            strokeLinecap='round'
                          />
                          <circle cx='19.5' cy='16' r='0.4' fill='#ba68c8' />
                        </svg>
                      }
                      style={{
                        background:
                          'linear-gradient(135deg, #6a1b9a 0%, #8e24aa 25%, #ab47bc 50%, #9c5cb5 75%, #7b1fa2 100%)',
                        color: 'white',
                        border: '2px solid rgba(255, 255, 255, 0.25)',
                        boxShadow:
                          '0 4px 16px rgba(142, 36, 170, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                      }}
                    />

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
