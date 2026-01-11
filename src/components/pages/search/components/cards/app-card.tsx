import { EyeOpenIcon } from '@radix-ui/react-icons';
import { Avatar, Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes';

import searchStyles from '../../search.module.css';
import type { SearchAppItem } from '../../types';
import {
  formatAppName,
  getAppIPAddress,
  getAppPort,
  getAppProcessInfo,
  getAppStatusInfo,
} from '../../utils';

interface AppCardProps {
  name: string;
  app: SearchAppItem;
  isMobile: boolean;
}

export function AppCard({ name, app, isMobile }: AppCardProps) {
  const displayName = formatAppName(name);
  const status = getAppStatusInfo(app);
  const proc = getAppProcessInfo(app);
  const ipAddress = getAppIPAddress(app);
  const port = getAppPort(app);

  return (
    <Card
      key={`app-${name}`}
      style={{
        border: '1px solid var(--gray-6)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease',
        cursor: isMobile ? 'default' : 'pointer',
      }}
      className={searchStyles.appCard}
      onClick={isMobile ? undefined : () => (window.location.href = `/apps/a/${displayName}`)}
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
      <Flex className={searchStyles.appCardContent} style={{ alignItems: 'flex-start' }}>
        <Avatar
          size='6'
          fallback={
            <svg
              width='48'
              height='48'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
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
              <circle cx='8' cy='8' r='0.5' fill='#ce93d8' />
              <circle cx='16' cy='8' r='0.5' fill='#ce93d8' />
              <circle cx='8' cy='16' r='0.5' fill='#ce93d8' />
              <circle cx='16' cy='16' r='0.5' fill='#ce93d8' />
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
              <line x1='10' y1='11' x2='14' y2='11' stroke='#ce93d8' strokeWidth='0.5' />
              <line x1='10' y1='12.5' x2='14' y2='12.5' stroke='#ce93d8' strokeWidth='0.5' />
              <line x1='10' y1='14' x2='14' y2='14' stroke='#ce93d8' strokeWidth='0.5' />
              <line x1='11' y1='10' x2='11' y2='14' stroke='#ce93d8' strokeWidth='0.5' />
              <line x1='13' y1='10' x2='13' y2='14' stroke='#ce93d8' strokeWidth='0.5' />
              <circle cx='11.5' cy='11.5' r='0.3' fill='#ba68c8' />
              <circle cx='12.5' cy='12.5' r='0.3' fill='#ba68c8' />
              <circle cx='11.5' cy='13.5' r='0.3' fill='#ba68c8' />
              <circle cx='12.5' cy='11.5' r='0.3' fill='#ba68c8' />
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
            marginRight: '10px',
            border: '2px solid rgba(255, 255, 255, 0.25)',
          }}
        />
        <Flex direction='column' className={searchStyles.appInfo}>
          <Flex align='center' gap='2'>
            <Heading size='4' weight='medium' style={{ color: 'var(--gray-12)' }}>
              {displayName}
            </Heading>
            <Text size='2' style={{ color: 'var(--gray-9)' }}>
              {proc.type ? ` · ${proc.type}` : ''}
            </Text>
          </Flex>
          <Flex align='center' gap='2'>
            <Text size='2' style={{ color: 'var(--gray-9)' }}>
              {ipAddress ? `IP: ${ipAddress}` : 'IP: Indisponível'}
            </Text>
            <Text size='2' style={{ color: 'var(--gray-9)' }}>
              {port ? ` · Porta ${port}` : ''}
            </Text>
          </Flex>
          <Flex align='center' gap='2'>
            <Box
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: status.color,
              }}
            />
            <Text size='2' weight='medium' style={{ color: 'var(--gray-11)' }}>
              {status.text}
            </Text>
          </Flex>
        </Flex>
        <Flex direction='column' className={searchStyles.appActions}>
          <Text size='2' color='gray' className={searchStyles.dateText}>
            Instância de Aplicativo
          </Text>
          <Button
            size='3'
            color='blue'
            variant='outline'
            style={{ cursor: 'pointer' }}
            onClick={() => (window.location.href = `/apps/a/${displayName}`)}
          >
            <EyeOpenIcon />
            Ver detalhes
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
