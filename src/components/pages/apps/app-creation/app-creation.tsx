import { Card, Flex, Separator, Text } from '@radix-ui/themes';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';
import React, { useState } from 'react';

import { NavBar } from '@/components/shared';
import { api } from '@/lib';

import styles from './app-creation.module.css';
import { ActionButtons } from './components/actions';
import { AppNameInput } from './components/app-name';
import { EnvInputs, EnvList } from './components/env-variables';
import { ErrorMessage } from './components/feedback';
import { HeaderSection } from './components/header';
import { NetworkSelection } from './components/network';
import { useIsMobile, validateAppName } from './utils';

interface AppCreationPageProps {
  session: Session;
}

interface EnvironmentVariable {
  key: string;
  value: string;
  id: string;
}

export function AppCreationPage(props: AppCreationPageProps) {
  const router = useRouter();
  const [appName, setAppName] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('none');
  const [environmentVariables, setEnvironmentVariables] = useState<EnvironmentVariable[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const addEnvironmentVariable = (key: string, value: string) => {
    const newVariable: EnvironmentVariable = {
      key,
      value,
      id: Date.now().toString(),
    };
    setEnvironmentVariables((prev) => [...prev, newVariable]);
  };

  const removeEnvironmentVariable = (id: string) => {
    setEnvironmentVariables((prev) => prev.filter((variable) => variable.id !== id));
  };

  const canSubmit = () => {
    return validateAppName(appName).isValid && !creating;
  };

  const handleCreateApp = async () => {
    if (!canSubmit()) return;

    setCreating(true);
    setError(null);

    await new Promise((resolve) => setTimeout(resolve, 10));

    try {
      const createAppResponse = await api.post(
        `/api/apps/${appName.trim()}`,
        {},
        { params: { unique_app: 'true' } }
      );

      if (createAppResponse.status !== 200 && createAppResponse.status !== 201) {
        throw new Error(`Failed to create app: ${createAppResponse.status}`);
      }

      const promises: Promise<any>[] = [];

      if (selectedNetwork && selectedNetwork !== 'none') {
        promises.push(
          api.post(`/api/networks/${selectedNetwork}/link/${appName.trim()}/`).catch((error) => {
            console.error('Error linking app to network:', error);
          })
        );
      }

      environmentVariables.forEach((envVar) => {
        promises.push(
          api
            .put(`/api/config/${appName.trim()}/${envVar.key}/`, undefined, {
              params: { value: envVar.value },
            })
            .catch((error) => {
              console.error(`Error setting config ${envVar.key}:`, error);
            })
        );
      });

      await Promise.all(promises);
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push('/apps');
    } catch (error: any) {
      console.error('Error creating app:', error);

      if (error.response?.status === 403) {
        if (error.response?.data?.detail === 'Quota exceeded') {
          setError('Você já utilizou toda sua cota disponível de aplicativos!');
        } else if (error.response?.data?.detail === 'App already exists') {
          setError(`O aplicativo "${appName.trim()}" já existe.`);
        } else if (error.response?.data?.detail == 'App name already in use') {
          setError(`O nome de aplicativo "${appName.trim()}" já está em uso.`);
        } else {
          setError('Acesso negado. Verifique suas permissões.');
        }
      } else {
        setError('Ocorreu um erro ao criar o aplicativo. Tente novamente.');
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
          <HeaderSection />

          <Separator size='4' style={{ margin: '10px 0' }} />

          <Card
            style={{
              border: '1px solid var(--gray-6)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              padding: '20px',
            }}
          >
            <Flex direction='column' gap='5'>
              <AppNameInput value={appName} onChange={setAppName} disabled={creating} />

              <Flex direction='column' gap='2'>
                <NetworkSelection
                  value={selectedNetwork}
                  onChange={setSelectedNetwork}
                  disabled={creating}
                />
              </Flex>

              <Flex direction='column' gap='3'>
                <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
                  Variáveis de Ambiente
                </Text>
                <EnvInputs onAdd={addEnvironmentVariable} disabled={creating} isMobile={isMobile} />
                <EnvList
                  variables={environmentVariables}
                  onRemove={removeEnvironmentVariable}
                  disabled={creating}
                />
              </Flex>

              <ErrorMessage error={error} />

              <ActionButtons
                creating={creating}
                canSubmit={canSubmit()}
                onCancel={() => router.push('/apps')}
                onCreate={handleCreateApp}
              />
            </Flex>
          </Card>
        </Flex>
      </main>
    </>
  );
}
