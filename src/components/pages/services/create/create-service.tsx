import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Select,
  Separator,
  Text,
  TextField,
} from '@radix-ui/themes';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';
import React, { useEffect, useState } from 'react';

import { NavBar } from '@/components/shared';
import { api } from '@/lib';

import styles from './create-service.module.css';

interface CreateServicePageProps {
  session: Session;
}

interface DatabaseType {
  name: string;
  displayName: string;
  icon: string;
}

export function CreateServicePage(props: CreateServicePageProps) {
  const router = useRouter();
  const [serviceName, setServiceName] = useState('');
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [databases, setDatabases] = useState<DatabaseType[]>([]);
  const [databasesLoading, setDatabasesLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const getDatabaseInfo = (dbName: string): DatabaseType => {
    const DATABASE_INFO: Record<string, { displayName: string; icon: string }> = {
      postgres: { displayName: 'PostgreSQL', icon: '/images/database-logos/postgresql.svg' },
      mysql: { displayName: 'MySQL', icon: '/images/database-logos/mysql.svg' },
      mongodb: { displayName: 'MongoDB', icon: '/images/database-logos/mongodb.svg' },
      redis: { displayName: 'Redis', icon: '/images/database-logos/redis.svg' },
      mariadb: { displayName: 'MariaDB', icon: '/images/database-logos/mariadb.svg' },
      couchdb: { displayName: 'CouchDB', icon: '/images/database-logos/couchdb.svg' },
      cassandra: { displayName: 'Cassandra', icon: '/images/database-logos/cassandra.svg' },
      elasticsearch: {
        displayName: 'Elasticsearch',
        icon: '/images/database-logos/elasticsearch.svg',
      },
      influxdb: { displayName: 'InfluxDB', icon: '/images/database-logos/influxdb.svg' },
    };

    return {
      name: dbName,
      displayName:
        DATABASE_INFO[dbName]?.displayName || dbName.charAt(0).toUpperCase() + dbName.slice(1),
      icon: DATABASE_INFO[dbName]?.icon || '/images/database-logos/generic.svg',
    };
  };

  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        setDatabasesLoading(true);
        const response = await api.get('/api/list-databases/');

        if (response.status === 200 && response.data.success) {
          const dbTypes = response.data.result.map((dbName: string) => getDatabaseInfo(dbName));
          setDatabases(dbTypes);
        }
      } catch (error) {
        console.error('Error fetching databases:', error);
        setError('Erro ao carregar tipos de serviços');
      } finally {
        setDatabasesLoading(false);
      }
    };

    fetchDatabases();
  }, []);

  const validateServiceName = (name: string) => {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) return { isValid: false, message: '' };

    const startsWithLetter = /^[a-zA-Z]/.test(trimmedName);
    const endsWithLetterOrNumber = /[a-zA-Z0-9]$/.test(trimmedName);
    const letterCount = (trimmedName.match(/[a-zA-Z]/g) || []).length;

    if (trimmedName.length < 3) {
      return { isValid: false, message: '(mínimo 3 caracteres)' };
    }
    if (!startsWithLetter) {
      return { isValid: false, message: '(deve começar com uma letra)' };
    }
    if (!endsWithLetterOrNumber) {
      return { isValid: false, message: '(deve terminar com letra ou número)' };
    }
    if (letterCount < 3) {
      return { isValid: false, message: '(mínimo 3 letras)' };
    }
    if (trimmedName.length > 50) {
      return { isValid: false, message: '(máximo 50 caracteres)' };
    }

    return { isValid: true, message: '' };
  };

  const canSubmit = () => {
    return validateServiceName(serviceName).isValid && selectedDatabase !== '' && !creating;
  };

  const handleCreateService = async () => {
    if (!canSubmit()) return;

    setCreating(true);
    setError(null);

    await new Promise((resolve) => setTimeout(resolve, 10));

    try {
      const createServiceResponse = await api.post(
        `/api/databases/${selectedDatabase}/${serviceName.trim()}/`
      );

      if (createServiceResponse.status !== 200 && createServiceResponse.status !== 201) {
        throw new Error(`Failed to create service: ${createServiceResponse.status}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      router.push('/services');
    } catch (error: any) {
      console.error('Error creating service:', error);

      if (error.response?.status === 403) {
        if (error.response?.data?.detail === 'Quota exceeded') {
          setError('Você já utilizou toda sua cota disponível de serviços!');
        } else if (error.response?.data?.detail === 'Database already exists') {
          setError(`O serviço "${serviceName.trim()}" já existe.`);
        } else if (error.response?.data?.detail === 'Database name already in use') {
          setError(`O nome de serviço "${serviceName.trim()}" já está em uso.`);
        } else {
          setError('Acesso negado. Verifique suas permissões.');
        }
      } else {
        setError('Ocorreu um erro ao criar o serviço. Tente novamente.');
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <NavBar session={props.session} />

      <main className={styles.root}>
        <Flex direction='column' gap='5' className={styles.mainContainer}>
          {/* Header */}
          <Box>
            <Heading
              size='7'
              weight='medium'
              style={{
                color: 'var(--gray-12)',
                marginBottom: '4px',
              }}
            >
              Criar novo serviço
            </Heading>
            <Text size='3' color='gray'>
              Configure seu novo serviço no Dokku
            </Text>
          </Box>

          <Separator size='4' style={{ margin: '10px 0' }} />

          {/* Form */}
          <Card
            style={{
              border: '1px solid var(--gray-6)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              padding: '20px',
            }}
          >
            <Flex direction='column' gap='5'>
              {/* Service Name */}
              <Flex direction='column' gap='2'>
                <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
                  Nome do Serviço
                </Text>
                <TextField.Root
                  placeholder='Digite o nome do serviço'
                  value={serviceName}
                  onChange={(e) => {
                    // Allow letters (uppercase and lowercase), numbers, and "_"
                    const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                    setServiceName(value);
                  }}
                  disabled={creating}
                  style={{
                    fontSize: '14px',
                    maxWidth: '400px',
                  }}
                />
                <Text
                  size='2'
                  color={
                    !validateServiceName(serviceName).isValid && serviceName.length > 0
                      ? 'red'
                      : 'gray'
                  }
                >
                  {serviceName.length}/50 caracteres {validateServiceName(serviceName).message}
                </Text>
              </Flex>

              {/* Database Type Selection */}
              <Flex direction='column' gap='2'>
                <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
                  Tipo de Serviço
                </Text>
                {databasesLoading ? (
                  <Box style={{ padding: '12px' }}>
                    <Text size='2' color='gray' style={{ fontStyle: 'italic' }}>
                      Carregando serviços...
                    </Text>
                  </Box>
                ) : (
                  <>
                    {/* Grid for desktop */}
                    {!isMobile && (
                      <div className={styles.databaseGrid}>
                        {databases.map((database) => (
                          <Card
                            key={database.name}
                            style={{
                              border: `2px solid ${
                                selectedDatabase === database.name
                                  ? 'var(--green-8)'
                                  : 'var(--gray-6)'
                              }`,
                              backgroundColor:
                                selectedDatabase === database.name
                                  ? 'var(--green-2)'
                                  : 'var(--color-surface)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              padding: '8px',
                            }}
                            className={styles.databaseCard}
                            onClick={() => setSelectedDatabase(database.name)}
                            onMouseEnter={(e) => {
                              if (selectedDatabase !== database.name) {
                                e.currentTarget.style.borderColor = 'var(--gray-8)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedDatabase !== database.name) {
                                e.currentTarget.style.borderColor = 'var(--gray-6)';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }
                            }}
                          >
                            <Flex direction='column' align='center' gap='1'>
                              <Image
                                src={database.icon}
                                alt={`${database.displayName} logo`}
                                width={28}
                                height={28}
                                style={{
                                  filter:
                                    selectedDatabase === database.name ? 'none' : 'grayscale(0.3)',
                                  transition: 'filter 0.2s ease',
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = '/images/database-logos/generic.svg';
                                }}
                              />
                              <Text
                                size='2'
                                weight='medium'
                                style={{
                                  color:
                                    selectedDatabase === database.name
                                      ? 'var(--green-11)'
                                      : 'var(--gray-11)',
                                  textAlign: 'center',
                                }}
                              >
                                {database.displayName}
                              </Text>
                            </Flex>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Select for mobile */}
                    {isMobile && (
                      <Select.Root
                        value={selectedDatabase}
                        onValueChange={setSelectedDatabase}
                        disabled={creating}
                      >
                        <Select.Trigger
                          placeholder='Selecione o tipo de banco de dados'
                          style={{ maxWidth: '100%' }}
                        />
                        <Select.Content>
                          {databases.map((database) => (
                            <Select.Item key={database.name} value={database.name}>
                              <Flex align='center' gap='2'>
                                <Image
                                  src={database.icon}
                                  alt={`${database.displayName} logo`}
                                  width={16}
                                  height={16}
                                  onError={(e) => {
                                    e.currentTarget.src = '/images/database-logos/generic.svg';
                                  }}
                                />
                                {database.displayName}
                              </Flex>
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    )}
                  </>
                )}
              </Flex>

              {/* Error message */}
              {error && (
                <Box
                  style={{
                    padding: '12px',
                    backgroundColor: 'var(--red-2)',
                    borderRadius: '8px',
                    border: '1px solid var(--red-6)',
                  }}
                >
                  <Text size='3' style={{ color: 'var(--red-11)' }}>
                    {error}
                  </Text>
                </Box>
              )}

              {/* Action buttons */}
              <Flex justify='end' gap='3' className={styles.buttonsContainer}>
                <Button
                  size='3'
                  color='gray'
                  variant='outline'
                  style={{ cursor: 'pointer' }}
                  onClick={() => router.push('/services')}
                  disabled={creating}
                >
                  Cancelar
                </Button>
                <Button
                  size='3'
                  onClick={handleCreateService}
                  disabled={!canSubmit()}
                  style={{
                    background: canSubmit()
                      ? 'linear-gradient(135deg, var(--green-9) 0%, var(--green-10) 100%)'
                      : 'var(--gray-5)',
                    border: 'none',
                    color: 'white',
                    cursor: canSubmit() ? 'pointer' : 'not-allowed',
                    fontWeight: '500',
                    padding: '12px 24px',
                    minWidth: '180px',
                  }}
                >
                  {creating ? (
                    <Flex align='center' gap='2'>
                      <Box
                        className={styles.spinner}
                        style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid transparent',
                          borderTop: '2px solid white',
                          borderRadius: '50%',
                        }}
                      />
                      <Text>Criando...</Text>
                    </Flex>
                  ) : (
                    'Criar novo serviço'
                  )}
                </Button>
              </Flex>
            </Flex>
          </Card>
        </Flex>
      </main>
    </>
  );
}
