import { InfoCircledIcon } from '@radix-ui/react-icons';
import {
  Avatar,
  Button,
  Card,
  Flex,
  Heading,
  Separator,
  Text,
  TextField,
  Tooltip,
} from '@radix-ui/themes';
import { Session } from 'next-auth';

import styles from '../../settings.module.css';

interface ProfileCardProps {
  session?: Session;
  isAdmin: boolean;
  adminLoading: boolean;
  onAdminClick: () => void;
  showToken: boolean;
  onToggleShowToken: () => void;
  onCopyToken: () => void | Promise<void>;
}

export function ProfileCard({
  session,
  isAdmin,
  adminLoading,
  onAdminClick,
  showToken,
  onToggleShowToken,
  onCopyToken,
}: ProfileCardProps) {
  const userName = session?.user?.name || 'Usuário';
  const userImage = !userName.toLowerCase().startsWith('takeover')
    ? session?.user?.image
    : undefined;
  const userEmail = session?.user?.email || '';

  return (
    <Card
      style={{
        border: '1px solid var(--gray-6)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <Flex direction='column' gap='3' style={{ padding: '4px' }}>
        <Flex justify='between' align='center'>
          <Heading size='5' weight='medium' style={{ color: 'var(--gray-12)' }}>
            Perfil do Usuário
          </Heading>
          {!adminLoading && isAdmin && (
            <Tooltip content='Acessar o painel de administrador'>
              <Button
                size='2'
                color='orange'
                variant='outline'
                onClick={onAdminClick}
                className={styles.adminButton}
                aria-label='Acessar o painel de administrador'
                title='Acessar o painel de administrador'
              >
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <rect
                    x='3'
                    y='10'
                    width='18'
                    height='11'
                    rx='2'
                    ry='2'
                    stroke='currentColor'
                    strokeWidth='2'
                    fill='none'
                  />
                  <path
                    d='M7 10V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V10'
                    stroke='currentColor'
                    strokeWidth='2'
                    fill='none'
                  />
                </svg>
                <span className={styles.adminButtonLabel}>Painel do Admin</span>
              </Button>
            </Tooltip>
          )}
        </Flex>

        <Separator size='4' />

        <Flex align='center' gap='3'>
          <Avatar
            size='5'
            src={userImage || undefined}
            fallback={userName.charAt(0).toUpperCase()}
            radius='full'
          />

          <Flex direction='column' gap='1' style={{ flex: 1 }}>
            <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
              {userName}
            </Text>
            <Text
              size='2'
              style={{
                color: 'var(--gray-10)',
                fontFamily: 'monospace',
              }}
            >
              {userEmail}
            </Text>
          </Flex>
        </Flex>

        <Separator size='4' style={{ margin: '8px 0' }} />

        <Flex direction='column' gap='2'>
          <Flex align='center' gap='2'>
            <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
              Token de Acesso
            </Text>
            <Tooltip content='Token de autenticação para requisições via API'>
              <InfoCircledIcon
                style={{
                  color: 'var(--gray-9)',
                  cursor: 'help',
                  width: '14px',
                  height: '14px',
                }}
              />
            </Tooltip>
          </Flex>
          <Flex gap='2' align='center'>
            <TextField.Root
              value={session?.accessToken || ''}
              readOnly
              style={{
                flex: 1,
                fontFamily: 'monospace',
                fontSize: '12px',
                filter: showToken ? 'none' : 'blur(4px)',
                transition: 'filter 0.2s ease',
              }}
              placeholder='Token não disponível'
            />
            <Button
              size='2'
              variant='soft'
              onClick={onToggleShowToken}
              style={{
                minWidth: '34px',
                width: '34px',
                height: '34px',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title={showToken ? 'Ocultar token' : 'Mostrar token'}
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                {showToken ? (
                  <path
                    d='M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8M6 10H18M6 10V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V10'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                ) : (
                  <>
                    <rect
                      x='3'
                      y='11'
                      width='18'
                      height='11'
                      rx='2'
                      ry='2'
                      stroke='currentColor'
                      strokeWidth='2'
                      fill='none'
                    />
                    <path
                      d='M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11'
                      stroke='currentColor'
                      strokeWidth='2'
                      fill='none'
                    />
                  </>
                )}
              </svg>
            </Button>
            <Button
              size='2'
              onClick={onCopyToken}
              disabled={!session?.accessToken}
              style={{ minWidth: '70px', cursor: 'pointer' }}
            >
              Copiar
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
