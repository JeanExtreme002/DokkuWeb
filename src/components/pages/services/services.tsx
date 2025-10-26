import { Box, Button, Card, Flex, Heading, Separator, Text } from '@radix-ui/themes';
import Image from 'next/image';
import { Session } from 'next-auth';
import { useEffect, useState } from 'react';

import { NavBar } from '@/components';
import { DotIcon } from '@/components/shared/icons';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { api } from '@/lib';

import styles from './services.module.css';

interface ServicesPageProps {
  session: Session;
}

interface ServiceData {
  config_dir: string;
  config_options: string;
  data_dir: string;
  dsn: string;
  exposed_ports: string;
  id: string;
  internal_ip: string;
  links: string;
  service_root: string;
  status: string;
  version: string;
  plugin_name: string;
  initial_network?: string;
  post_create_network?: string;
  post_start_network?: string;
}

interface ServicesData {
  [pluginType: string]: {
    [serviceName: string]: ServiceData;
  };
}

const DATABASE_IMAGES: Record<string, string> = {
  postgres: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
  mysql: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
  mongodb: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
  redis: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg',
  mariadb: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mariadb/mariadb-original.svg',
  couchdb: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/couchdb/couchdb-original.svg',
  cassandra: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cassandra/cassandra-original.svg',
  elasticsearch:
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/elasticsearch/elasticsearch-original.svg',
  influxdb: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/influxdb/influxdb-original.svg',
  generic:
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none"><defs><linearGradient id="dbGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%234A90E2;stop-opacity:1" /><stop offset="100%" style="stop-color:%232E5C8A;stop-opacity:1" /></linearGradient><linearGradient id="serverGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23E8F4FD;stop-opacity:1" /><stop offset="100%" style="stop-color:%23B8D9F5;stop-opacity:1" /></linearGradient></defs><rect x="6" y="8" width="36" height="32" rx="3" fill="url(%23serverGradient)" stroke="%23357ABD" stroke-width="1.5"/><ellipse cx="24" cy="13" rx="15" ry="4" fill="url(%23dbGradient)" stroke="%232E5C8A" stroke-width="1.2"/><ellipse cx="24" cy="24" rx="15" ry="4" fill="url(%23dbGradient)" stroke="%232E5C8A" stroke-width="1.2"/><ellipse cx="24" cy="35" rx="15" ry="4" fill="url(%23dbGradient)" stroke="%232E5C8A" stroke-width="1.2"/><line x1="9" y1="13" x2="9" y2="31" stroke="%234A90E2" stroke-width="2" stroke-linecap="round"/><line x1="39" y1="13" x2="39" y2="31" stroke="%234A90E2" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1.5" fill="%23FFFFFF" opacity="0.8"/><circle cx="15" cy="17" r="1.5" fill="%23FFFFFF" opacity="0.8"/><circle cx="18" cy="17" r="1.5" fill="%23FFFFFF" opacity="0.8"/><circle cx="12" cy="28" r="1.5" fill="%23FFFFFF" opacity="0.8"/><circle cx="15" cy="28" r="1.5" fill="%23FFFFFF" opacity="0.8"/><circle cx="18" cy="28" r="1.5" fill="%23FFFFFF" opacity="0.8"/></svg>',
};

export function ServicesPage(props: ServicesPageProps) {
  const [services, setServices] = useState<ServicesData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await api.post('/api/databases/list');

        if (response.status === 200 && response.data.success) {
          setServices(response.data.result);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        setError('Erro ao carregar serviços');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return { color: 'var(--green-9)', text: 'Ativo', bgColor: 'var(--green-3)' };
      case 'stopped':
      case 'exited':
        return { color: 'var(--red-9)', text: 'Parado', bgColor: 'var(--red-3)' };
      case 'starting':
        return { color: 'var(--amber-9)', text: 'Iniciando', bgColor: 'var(--amber-3)' };
      default:
        return { color: 'var(--gray-9)', text: 'Desconhecido', bgColor: 'var(--gray-3)' };
    }
  };

  const formatServiceName = (serviceName: string) => {
    // Remove prefixos numéricos como "1_" se existirem
    return serviceName.replace(/^\d+_/, '');
  };

  const getServiceImage = (pluginName: string) => {
    return DATABASE_IMAGES[pluginName] || DATABASE_IMAGES.generic;
  };

  const formatVersion = (version: string) => {
    // Extrai apenas a versão do formato "mysql:8.1.0"
    const versionMatch = version.match(/:(.+)$/);
    return versionMatch ? versionMatch[1] : version;
  };

  const formatDatabaseType = (pluginName: string) => {
    const typeMap: Record<string, string> = {
      postgres: 'PostgreSQL',
      mysql: 'MySQL',
      mongodb: 'MongoDB',
      redis: 'Redis',
      mariadb: 'MariaDB',
      couchdb: 'CouchDB',
      cassandra: 'Cassandra',
      elasticsearch: 'Elasticsearch',
      influxdb: 'InfluxDB',
    };
    return typeMap[pluginName] || pluginName.charAt(0).toUpperCase() + pluginName.slice(1);
  };

  // Converte os dados em um array plano para facilitar a renderização
  const allServices = Object.entries(services).flatMap(([pluginType, servicesByType]) =>
    Object.entries(servicesByType).map(([serviceName, serviceData]) => ({
      pluginType,
      serviceName,
      ...serviceData,
    }))
  );

  return (
    <>
      <NavBar session={props.session} />

      <main className={styles.root}>
        <Flex direction='column' gap='5' className={styles.mainContainer}>
          <Flex className={styles.headerSection}>
            <Box>
              <Heading
                size='7'
                weight='medium'
                style={{
                  color: 'var(--gray-12)',
                  marginBottom: '4px',
                }}
              >
                Meus Serviços
              </Heading>
              <Text size='3' color='gray'>
                Gerencie seus serviços de banco de dados no Dokku
              </Text>
            </Box>

            <Button
              size='3'
              onClick={() => (window.location.href = './create')}
              className={styles.createButton}
              style={{
                background: 'linear-gradient(135deg, var(--green-9) 0%, var(--green-10) 100%)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '500',
                padding: '12px 20px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(34, 197, 94, 0.3)';
              }}
            >
              + Novo Serviço
            </Button>
          </Flex>

          {/* Separador */}
          <Separator size='4' style={{ margin: '10px 0' }} />

          {/* Estado de carregamento */}
          {loading && (
            <LoadingSpinner
              title='Carregando Serviços'
              messages={[
                'Conectando ao Dokku...',
                'Listando serviços de banco de dados...',
                'Verificando status dos serviços...',
                'Coletando informações de rede...',
                'Preparando visualização...',
              ]}
            />
          )}

          {/* Estado de erro */}
          {error && (
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
                  {error}
                </Text>
              </Flex>
            </Card>
          )}

          {/* Lista de serviços */}
          {!loading && !error && (
            <>
              {allServices.length === 0 ? (
                <Card
                  style={{
                    border: '1px solid var(--gray-6)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    padding: '40px',
                    textAlign: 'center',
                  }}
                >
                  <Text size='3' color='gray'>
                    Nenhum serviço criado ainda.
                  </Text>
                </Card>
              ) : (
                <div className={styles.servicesGrid}>
                  {allServices.map((service) => {
                    const statusInfo = getStatusInfo(service.status);
                    const displayName = formatServiceName(service.serviceName);
                    const serviceType = formatDatabaseType(service.plugin_name);

                    return (
                      <Card
                        key={`${service.pluginType}-${service.serviceName}`}
                        style={{
                          border: '1px solid var(--gray-6)',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                          transition: 'all 0.2s ease',
                          cursor: isMobile ? 'default' : 'pointer',
                        }}
                        className={styles.serviceCard}
                        onClick={
                          isMobile
                            ? undefined
                            : () => (window.location.href = `/services/${displayName}`)
                        }
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
                        <Flex className={styles.serviceCardContent}>
                          {/* Header com imagem e info principal */}
                          <Flex className={styles.serviceHeader}>
                            <Image
                              src={getServiceImage(service.plugin_name)}
                              alt={`${serviceType} logo`}
                              width={48}
                              height={48}
                              className={styles.serviceImage}
                              onError={(e) => {
                                // Fallback para um ícone genérico de banco de dados se a imagem falhar
                                e.currentTarget.src = DATABASE_IMAGES.generic;
                              }}
                            />

                            {/* Informações principais */}
                            <Flex direction='column' className={styles.serviceInfo}>
                              <Heading size='4' weight='medium' style={{ color: 'var(--gray-12)' }}>
                                {displayName}
                              </Heading>
                              <Text size='2' style={{ color: 'var(--gray-9)' }}>
                                {serviceType} v{formatVersion(service.version)}
                              </Text>

                              {/* Status com círculo colorido */}
                              <Flex align='center' gap='2' style={{ marginTop: '4px' }}>
                                <Box
                                  style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: statusInfo.color,
                                  }}
                                />
                                <Text size='2' weight='medium' style={{ color: 'var(--gray-11)' }}>
                                  {statusInfo.text}
                                </Text>
                              </Flex>
                            </Flex>
                          </Flex>

                          {/* Informações técnicas */}
                          <Flex direction='column' gap='1' style={{ marginTop: '8px' }}>
                            <Flex align='center' gap='2'>
                              <Text size='2' style={{ color: 'var(--gray-9)', fontWeight: '500' }}>
                                IP:
                              </Text>
                              <Text
                                size='2'
                                style={{ color: 'var(--gray-10)', fontFamily: 'monospace' }}
                              >
                                {service.internal_ip}
                              </Text>
                            </Flex>
                            {service.exposed_ports !== '-' && (
                              <Flex align='center' gap='2'>
                                <Text
                                  size='2'
                                  style={{ color: 'var(--gray-9)', fontWeight: '500' }}
                                >
                                  Portas:
                                </Text>
                                <Text
                                  size='2'
                                  style={{ color: 'var(--gray-10)', fontFamily: 'monospace' }}
                                >
                                  {service.exposed_ports}
                                </Text>
                              </Flex>
                            )}
                          </Flex>

                          {/* Botão de ação */}
                          <Flex className={styles.serviceActions}>
                            <Button
                              size='3'
                              onClick={() => (window.location.href = `/services/${displayName}`)}
                              style={{
                                background:
                                  'linear-gradient(135deg, var(--blue-9) 0%, var(--blue-10) 100%)',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '500',
                                padding: '12px 20px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                                transition: 'all 0.2s ease',
                                width: '100%',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow =
                                  '0 4px 12px rgba(59, 130, 246, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow =
                                  '0 2px 8px rgba(59, 130, 246, 0.3)';
                              }}
                            >
                              Ver detalhes
                            </Button>
                          </Flex>
                        </Flex>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </Flex>
      </main>
    </>
  );
}
