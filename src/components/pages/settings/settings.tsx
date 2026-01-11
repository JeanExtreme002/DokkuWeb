import { Box, Flex, Heading, Text } from '@radix-ui/themes';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { NavBar } from '@/components';
import { api } from '@/lib';

import { ProfileCard, ResourcesCard } from './components';
import styles from './settings.module.css';
import { QuotaInfo } from './types';

interface SettingsPageProps {
  session: Session;
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

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [showToken, setShowToken] = useState(false);

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
      } catch (error) {
        console.error('Error copying token:', error);
      }
    }
  };

  const session = sessionData || props.session;

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
          <ProfileCard
            session={session}
            isAdmin={isAdmin}
            adminLoading={adminLoading}
            onAdminClick={() => router.push('/admin')}
            showToken={showToken}
            onToggleShowToken={() => setShowToken(!showToken)}
            onCopyToken={copyToken}
          />
          <ResourcesCard quota={quota} loading={loading} error={error} />
        </Flex>
      </main>
    </>
  );
}
