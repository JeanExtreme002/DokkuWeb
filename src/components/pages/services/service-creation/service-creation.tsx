import { Card, Flex, Separator } from '@radix-ui/themes';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';
import React, { useEffect, useState } from 'react';

import { NavBar } from '@/components/shared';
import { usePageTranslation } from '@/i18n/utils';
import { api } from '@/lib';

import {
  ActionButtons,
  DatabaseSelection,
  DatabaseType,
  ErrorMessage,
  Header,
  ServiceNameField,
} from './components';
import styles from './service-creation.module.css';

interface ServiceCreationPageProps {
  session: Session;
}

export function ServiceCreationPage(props: ServiceCreationPageProps) {
  const router = useRouter();
  const { t } = usePageTranslation();
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
        setError(t('services.create.errors.loadServiceTypes'));
      } finally {
        setDatabasesLoading(false);
      }
    };

    fetchDatabases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateServiceName = (name: string) => {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) return { isValid: false, message: '' };

    const startsWithLetter = /^[a-zA-Z]/.test(trimmedName);
    const endsWithLetterOrNumber = /[a-zA-Z0-9]$/.test(trimmedName);
    const letterCount = (trimmedName.match(/[a-zA-Z]/g) || []).length;

    if (trimmedName.length < 3) {
      return { isValid: false, message: t('services.create.validation.minChars') };
    }
    if (!startsWithLetter) {
      return { isValid: false, message: t('services.create.validation.startsWithLetter') };
    }
    if (!endsWithLetterOrNumber) {
      return { isValid: false, message: t('services.create.validation.endsWithLetterOrNumber') };
    }
    if (letterCount < 3) {
      return { isValid: false, message: t('services.create.validation.minLetters') };
    }
    if (trimmedName.length > 30) {
      return { isValid: false, message: t('services.create.validation.maxChars') };
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
          setError(t('services.create.errors.quotaExceeded'));
        } else if (error.response?.data?.detail === 'Database already exists') {
          setError(t('services.create.errors.serviceExists', { name: serviceName.trim() }));
        } else if (error.response?.data?.detail === 'Database name already in use') {
          setError(t('services.create.errors.serviceNameInUse', { name: serviceName.trim() }));
        } else {
          setError(t('services.create.errors.forbidden'));
        }
      } else {
        setError(t('services.create.errors.createFailed'));
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
          <Header />

          <Separator size='4' style={{ margin: '10px 0' }} />

          <Card
            style={{
              border: '1px solid var(--gray-6)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              padding: '20px',
            }}
          >
            <Flex direction='column' gap='5'>
              <ServiceNameField
                serviceName={serviceName}
                onChange={setServiceName}
                creating={creating}
                validateServiceName={validateServiceName}
              />

              <Flex direction='column' gap='2'>
                <DatabaseSelection
                  databases={databases}
                  databasesLoading={databasesLoading}
                  selectedDatabase={selectedDatabase}
                  creating={creating}
                  isMobile={isMobile}
                  onSelect={setSelectedDatabase}
                  gridClassName={styles.databaseGrid}
                  cardClassName={styles.databaseCard}
                />
              </Flex>

              <ErrorMessage error={error} />

              <ActionButtons
                canSubmit={canSubmit()}
                creating={creating}
                onCancel={() => router.push('/services')}
                onCreate={handleCreateService}
                spinnerClassName={styles.spinner}
                buttonsContainerClassName={styles.buttonsContainer}
              />
            </Flex>
          </Card>
        </Flex>
      </main>
    </>
  );
}
