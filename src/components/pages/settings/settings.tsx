import { Link } from '@mui/material';
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
} from '@radix-ui/themes';
import axios from 'axios';
import { Session } from 'next-auth';
import { useEffect, useState } from 'react';

import { AppIcon, DotIcon, NavBar, NetworkIcon, ServiceIcon } from '@/components';
import { config } from '@/lib';

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

interface UserQuotaInfo extends QuotaInfo {
  email?: string;
}

export function SettingsPage(props: SettingsPageProps) {
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin states
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [userQuota, setUserQuota] = useState<UserQuotaInfo | null>(null);
  const [userQuotaLoading, setUserQuotaLoading] = useState(false);
  const [userQuotaError, setUserQuotaError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editQuota, setEditQuota] = useState<QuotaInfo>({
    apps_quota: 0,
    networks_quota: 0,
    services_quota: 0,
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    const fetchQuota = async () => {
      try {
        setLoading(true);
        const response = await axios.post('/api/proxy/api/quota');

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
          const response = await axios.post<AdminCheckResponse>(
            `/api/proxy/api/admin/users/${userEmail}/admin`
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

  const searchUserQuota = async () => {
    if (!searchEmail.trim()) return;

    try {
      setUserQuotaLoading(true);
      setUserQuotaError(null);
      const response = await axios.post<QuotaInfo>(
        `/api/proxy/api/admin/users/${searchEmail}/quota`
      );
      setUserQuota({ ...response.data, email: searchEmail });
      setEditQuota(response.data);
    } catch (error) {
      console.error('Error fetching user quota:', error);
      setUserQuotaError('Erro ao buscar informações do usuário');
      setUserQuota(null);
    } finally {
      setUserQuotaLoading(false);
    }
  };

  const updateUserQuota = async () => {
    if (!userQuota?.email) return;

    try {
      setUpdateLoading(true);
      const params = new URLSearchParams({
        apps_quota: editQuota.apps_quota.toString(),
        networks_quota: editQuota.networks_quota.toString(),
        services_quota: editQuota.services_quota.toString(),
      });

      await axios.put(`/api/proxy/api/admin/users/${userQuota.email}/quota?${params.toString()}`);
      setUserQuota({ ...editQuota, email: userQuota.email });
      setEditMode(false);
    } catch (error) {
      console.error('Error updating user quota:', error);
      setUserQuotaError('Erro ao atualizar quota do usuário');
    } finally {
      setUpdateLoading(false);
    }
  };

  const copyToken = async () => {
    if (session?.accessToken) {
      try {
        await navigator.clipboard.writeText(session.accessToken);
        // Aqui você pode adicionar uma notificação de sucesso se tiver um sistema de toast
      } catch (error) {
        console.error('Erro ao copiar token:', error);
      }
    }
  };

  const { session } = props;
  const userImage = session?.user?.image;
  const userName = session?.user?.name || 'Usuário';
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
              <Heading size='5' weight='medium' style={{ color: 'var(--gray-12)' }}>
                Perfil do Usuário
              </Heading>

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
                <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
                  Token de Acesso
                </Text>
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

          {/* Card de Administrador */}
          {!adminLoading && isAdmin && (
            <Card
              style={{
                background: 'linear-gradient(135deg, var(--amber-1) 0%, var(--amber-2) 100%)',
                border: '1px solid var(--amber-6)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              }}
            >
              <Flex direction='column' gap='4' style={{ padding: '8px' }}>
                <Flex align='center' gap='3'>
                  <Heading size='5' weight='bold' style={{ color: 'var(--amber-12)' }}>
                    Painel de Administrador
                  </Heading>
                </Flex>

                <Separator size='4' style={{ margin: '0' }} />

                {/* Busca por usuário */}
                <Flex direction='column' gap='3'>
                  <Text size='4' weight='medium' style={{ color: 'var(--amber-12)' }}>
                    Gerenciar limite de recursos de usuário
                  </Text>

                  <Flex gap='3'>
                    <TextField.Root
                      placeholder='Digite o email do usuário'
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      style={{ flex: 1 }}
                      onKeyDown={(e) => e.key === 'Enter' && searchUserQuota()}
                    />
                    <Button
                      onClick={searchUserQuota}
                      disabled={userQuotaLoading || !searchEmail.trim()}
                    >
                      {userQuotaLoading ? 'Buscando...' : 'Buscar'}
                    </Button>
                  </Flex>
                </Flex>

                {/* Erro na busca */}
                {userQuotaError && (
                  <Flex
                    align='center'
                    gap='3'
                    style={{
                      padding: '12px',
                      backgroundColor: 'var(--red-2)',
                      borderRadius: '8px',
                      border: '1px solid var(--red-6)',
                    }}
                  >
                    <Text size='3' style={{ color: 'var(--red-11)' }}>
                      {userQuotaError}
                    </Text>
                  </Flex>
                )}

                {/* Informações do usuário encontrado */}
                {userQuota && (
                  <Box
                    style={{
                      padding: '16px',
                      backgroundColor: 'var(--gray-2)',
                      borderRadius: '12px',
                      border: '1px solid var(--gray-6)',
                    }}
                  >
                    <Flex direction='column' gap='4'>
                      <Flex justify='between' align='center'>
                        <Text size='3' weight='bold' style={{ color: 'var(--gray-12)' }}>
                          Limites de {userQuota.email?.split('@')[0]}
                        </Text>
                        <Flex gap='2'>
                          {!editMode ? (
                            <Button size='2' onClick={() => setEditMode(true)}>
                              Editar
                            </Button>
                          ) : (
                            <>
                              <Button
                                size='2'
                                variant='soft'
                                onClick={() => {
                                  setEditMode(false);
                                  setEditQuota(userQuota);
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button size='2' onClick={updateUserQuota} disabled={updateLoading}>
                                {updateLoading ? 'Salvando...' : 'Salvar'}
                              </Button>
                            </>
                          )}
                        </Flex>
                      </Flex>

                      <Flex direction='column' gap='3'>
                        {/* Aplicativos */}
                        <Flex
                          justify='between'
                          align='center'
                          style={{
                            padding: '12px',
                            backgroundColor: 'var(--blue-2)',
                            borderRadius: '8px',
                            border: '1px solid var(--blue-6)',
                          }}
                        >
                          <Flex align='center' gap='3'>
                            <Box
                              style={{
                                color: 'var(--blue-11)',
                                display: 'flex',
                                alignItems: 'center',
                                height: '20px',
                              }}
                            >
                              <AppIcon />
                            </Box>
                            <Text size='3' weight='medium' style={{ color: 'var(--blue-12)' }}>
                              Aplicativos
                            </Text>
                          </Flex>
                          {editMode ? (
                            <TextField.Root
                              type='number'
                              value={editQuota.apps_quota.toString()}
                              onChange={(e) =>
                                setEditQuota({
                                  ...editQuota,
                                  apps_quota: parseInt(e.target.value) || 0,
                                })
                              }
                              style={{ width: '80px' }}
                            />
                          ) : (
                            <Badge
                              size='1'
                              style={{
                                backgroundColor: 'var(--blue-9)',
                                color: 'white',
                              }}
                            >
                              {userQuota.apps_quota}
                            </Badge>
                          )}
                        </Flex>

                        {/* Serviços */}
                        <Flex
                          justify='between'
                          align='center'
                          style={{
                            padding: '12px',
                            backgroundColor: 'var(--purple-2)',
                            borderRadius: '8px',
                            border: '1px solid var(--purple-6)',
                          }}
                        >
                          <Flex align='center' gap='3'>
                            <Box
                              style={{
                                color: 'var(--purple-11)',
                                display: 'flex',
                                alignItems: 'center',
                                height: '20px',
                              }}
                            >
                              <ServiceIcon />
                            </Box>
                            <Text size='3' weight='medium' style={{ color: 'var(--purple-12)' }}>
                              Serviços
                            </Text>
                          </Flex>
                          {editMode ? (
                            <TextField.Root
                              type='number'
                              value={editQuota.services_quota.toString()}
                              onChange={(e) =>
                                setEditQuota({
                                  ...editQuota,
                                  services_quota: parseInt(e.target.value) || 0,
                                })
                              }
                              style={{ width: '80px' }}
                            />
                          ) : (
                            <Badge
                              size='1'
                              style={{
                                backgroundColor: 'var(--purple-9)',
                                color: 'white',
                              }}
                            >
                              {userQuota.services_quota}
                            </Badge>
                          )}
                        </Flex>

                        {/* Redes */}
                        <Flex
                          justify='between'
                          align='center'
                          style={{
                            padding: '12px',
                            backgroundColor: 'var(--green-2)',
                            borderRadius: '8px',
                            border: '1px solid var(--green-6)',
                          }}
                        >
                          <Flex align='center' gap='3'>
                            <Box
                              style={{
                                color: 'var(--green-11)',
                                display: 'flex',
                                alignItems: 'center',
                                height: '20px',
                              }}
                            >
                              <NetworkIcon />
                            </Box>
                            <Text size='3' weight='medium' style={{ color: 'var(--green-12)' }}>
                              Redes
                            </Text>
                          </Flex>
                          {editMode ? (
                            <TextField.Root
                              type='number'
                              value={editQuota.networks_quota.toString()}
                              onChange={(e) =>
                                setEditQuota({
                                  ...editQuota,
                                  networks_quota: parseInt(e.target.value) || 0,
                                })
                              }
                              style={{ width: '80px' }}
                            />
                          ) : (
                            <Badge
                              size='1'
                              style={{
                                backgroundColor: 'var(--green-9)',
                                color: 'white',
                              }}
                            >
                              {userQuota.networks_quota}
                            </Badge>
                          )}
                        </Flex>
                      </Flex>
                    </Flex>
                  </Box>
                )}
              </Flex>
            </Card>
          )}
        </Flex>
      </main>
    </>
  );
}
