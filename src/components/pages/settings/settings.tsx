import { Link } from '@mui/material';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Separator,
  Text,
  TextField,
  Tooltip,
} from '@radix-ui/themes';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { AppIcon, DotIcon, NavBar, NetworkIcon, ServiceIcon } from '@/components';
import { api, config } from '@/lib';

import styles from './settings.module.css';

interface SettingsPageProps {
  session: Session;
}

interface QuotaInfo {
  apps_quota: number;
  networks_quota: number;
  services_quota: number;
}

interface AdminCheckResponse {
  result: boolean;
}

export function SettingsPage(props: SettingsPageProps) {
  const { data: sessionData } = useSession();
  const router = useRouter();
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin states
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [showToken, setShowToken] = useState(false);

  // Removed admin panel states from Settings; moved to Admin page

  useEffect(() => {
    const fetchQuota = async () => {
      try {
        setLoading(true);
        const response = await api.post('/api/quota/');

        if (response.status === 200) {
          setQuota(response.data);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching quota:', error);
        setError('Erro ao carregar informações de quota');
      } finally {
        setLoading(false);
      }
    };

    const checkAdminStatus = async () => {
      try {
        setAdminLoading(true);
        const userEmail = props.session?.user?.email;
        if (userEmail) {
          const response = await api.post<AdminCheckResponse>(
            `/api/admin/users/${userEmail}/admin/`
          );
          setIsAdmin(response.data.result);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setAdminLoading(false);
      }
    };

    fetchQuota();
    checkAdminStatus();
  }, [props.session?.user?.email]);

  const copyToken = async () => {
    const currentSession = sessionData || props.session;
    if (currentSession?.accessToken) {
      try {
        await navigator.clipboard.writeText(currentSession.accessToken);
        // Aqui você pode adicionar uma notificação de sucesso se tiver um sistema de toast
      } catch (error) {
        console.error('Erro ao copiar token:', error);
      }
    }
  };

  const session = sessionData || props.session;
  const userName = session?.user?.name || 'Usuário';
  const userImage = !userName.toLowerCase().startsWith('takeover')
    ? props.session?.user?.image
    : undefined;
  const userEmail = session?.user?.email || '';

  return (
    <>
      <NavBar session={session} />

      <main className={styles.root}>
        <Flex direction='column' gap='5' style={{ maxWidth: '700px', margin: '0 auto' }}>
          <Box>
            <Heading
              size='7'
              weight='medium'
              style={{
                color: 'var(--gray-12)',
                marginBottom: '4px',
              }}
            >
              Configurações
            </Heading>
            <Text size='3' color='gray'>
              Gerencie suas informações pessoais e limites de recursos
            </Text>
          </Box>

          {/* Informações do Usuário */}
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
                      onClick={() => router.push('/admin')}
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

              {/* Access Token Section */}
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
                    onClick={() => setShowToken(!showToken)}
                    style={{
                      minWidth: '34px',
                      width: '34px',
                      height: '34px',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
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
                        // Cadeado aberto (destrancado)
                        <path
                          d='M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8M6 10H18M6 10V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V10'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      ) : (
                        // Cadeado fechado (trancado)
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
                    onClick={copyToken}
                    disabled={!session?.accessToken}
                    style={{ minWidth: '70px' }}
                  >
                    Copiar
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </Card>

          {/* Informações de Quota */}
          <Card
            style={{
              background: 'linear-gradient(135deg, var(--gray-1) 0%, var(--gray-2) 100%)',
              border: '1px solid var(--gray-6)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            }}
          >
            <Flex direction='column' gap='4' style={{ padding: '8px' }}>
              <Flex align='center' gap='3'>
                <Heading size='5' weight='bold' style={{ color: 'var(--gray-12)' }}>
                  Limites de Recursos
                </Heading>
              </Flex>

              <Separator size='4' style={{ margin: '0' }} />

              {loading && (
                <Flex align='center' gap='3' style={{ padding: '20px 0' }}>
                  <Text
                    size='3'
                    style={{
                      color: 'var(--gray-11)',
                      fontStyle: 'italic',
                    }}
                  >
                    Carregando informações de recursos...
                  </Text>
                </Flex>
              )}

              {error && (
                <Flex
                  align='center'
                  gap='3'
                  style={{
                    padding: '16px',
                    backgroundColor: 'var(--red-2)',
                    borderRadius: '8px',
                    border: '1px solid var(--red-6)',
                  }}
                >
                  <Box
                    style={{
                      color: 'var(--red-11)',
                      display: 'flex',
                      alignItems: 'center',
                      height: '24px',
                    }}
                  >
                    <DotIcon />
                  </Box>
                  <Text size='3' style={{ color: 'var(--red-11)' }}>
                    {error}
                  </Text>
                </Flex>
              )}

              {quota && !loading && !error && (
                <Flex direction='column' gap='4'>
                  <Box
                    style={{
                      padding: '16px',
                      backgroundColor: 'var(--blue-2)',
                      borderRadius: '12px',
                      border: '1px solid var(--blue-6)',
                    }}
                  >
                    <Flex justify='between' align='center'>
                      <Flex align='center' gap='3'>
                        <Box
                          style={{
                            color: 'var(--blue-11)',
                            display: 'flex',
                            alignItems: 'center',
                            height: '24px',
                          }}
                        >
                          <AppIcon />
                        </Box>
                        <Text size='4' weight='medium' style={{ color: 'var(--blue-12)' }}>
                          Aplicativos
                        </Text>
                      </Flex>
                      <Badge
                        size='2'
                        style={{
                          backgroundColor: 'var(--blue-9)',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          padding: '6px 12px',
                        }}
                      >
                        {quota.apps_quota}
                      </Badge>
                    </Flex>
                  </Box>

                  <Box
                    style={{
                      padding: '16px',
                      backgroundColor: 'var(--purple-2)',
                      borderRadius: '12px',
                      border: '1px solid var(--purple-6)',
                    }}
                  >
                    <Flex justify='between' align='center'>
                      <Flex align='center' gap='3'>
                        <Box
                          style={{
                            color: 'var(--purple-11)',
                            display: 'flex',
                            alignItems: 'center',
                            height: '24px',
                          }}
                        >
                          <ServiceIcon />
                        </Box>
                        <Text size='4' weight='medium' style={{ color: 'var(--purple-12)' }}>
                          Serviços
                        </Text>
                      </Flex>
                      <Badge
                        size='2'
                        style={{
                          backgroundColor: 'var(--purple-9)',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          padding: '6px 12px',
                        }}
                      >
                        {quota.services_quota}
                      </Badge>
                    </Flex>
                  </Box>

                  <Box
                    style={{
                      padding: '16px',
                      backgroundColor: 'var(--green-2)',
                      borderRadius: '12px',
                      border: '1px solid var(--green-6)',
                    }}
                  >
                    <Flex justify='between' align='center'>
                      <Flex align='center' gap='3'>
                        <Box
                          style={{
                            color: 'var(--green-11)',
                            display: 'flex',
                            alignItems: 'center',
                            height: '24px',
                          }}
                        >
                          <NetworkIcon />
                        </Box>
                        <Text size='4' weight='medium' style={{ color: 'var(--green-12)' }}>
                          Redes
                        </Text>
                      </Flex>
                      <Badge
                        size='2'
                        style={{
                          backgroundColor: 'var(--green-9)',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          padding: '6px 12px',
                        }}
                      >
                        {quota.networks_quota}
                      </Badge>
                    </Flex>
                  </Box>
                </Flex>
              )}

              {/* Link de suporte */}
              <Box style={{ marginTop: '8px' }}>
                <Link
                  href={config.support.url}
                  underline='hover'
                  sx={{ fontSize: '14px', color: 'var(--gray-11)' }}
                >
                  Precisa aumentar o limite? Acesse o {config.support.name}.
                </Link>
              </Box>
            </Flex>
          </Card>

          {/* Painel de administrador movido para página dedicada (/admin) */}
        </Flex>
      </main>
    </>
  );
}
