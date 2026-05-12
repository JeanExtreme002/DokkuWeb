import { Box, Flex, Heading, Text } from '@radix-ui/themes';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { NavBar } from '@/components';
import { usePageTranslation } from '@/i18n/utils';
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
  const { t } = usePageTranslation();
  const { data: sessionData } = useSession();
  const router = useRouter();
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [showToken, setShowToken] = useState(false);

  const [isSSHKeySaving, setIsSSHKeySaving] = useState(false);
  const [isSSHKeyRegistered, setIsSSHKeyRegistered] = useState(false);

  // Error states
  const [errors, setErrors] = useState({
    ssh: null as string | null,
    sshDetail: null as string | null,
  });

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
        setError(t('errors.quotaFetch'));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const registerSSHKey = async (rawSSHKey: string) => {
    setIsSSHKeySaving(true);
    setIsSSHKeyRegistered(false);
    setErrors((prev) => ({ ...prev, ssh: null, sshDetail: null }));

    try {
      const encoded = btoa(rawSSHKey);
      const response = await api.post(`/api/ssh/key`, undefined, {
        params: { public_ssh_key: encoded },
      });
      if (response.status === 200) {
        if (!response?.data?.success) {
          throw new Error(response?.data?.message);
        }
        setIsSSHKeyRegistered(true);
      }
    } catch (error: any) {
      const detail =
        typeof error?.response?.data?.message === 'string'
          ? error.response.data.message
          : typeof error?.message === 'string'
            ? error.message
            : null;
      if (error?.response?.status === 403) {
        setErrors((prev) => ({
          ...prev,
          ssh: t('profile.ssh.registerNotAllowed'),
          sshDetail: detail,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          ssh: t('profile.ssh.registerFailed'),
          sshDetail: detail,
        }));
      }
      console.error('Failed to register SSH key:', error);
    } finally {
      setIsSSHKeySaving(false);
    }
  };

  const handleRegisterSSHKeyFromFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      await registerSSHKey(await file.text());
    } catch (err) {
      console.error('Error registering ssh key:', err);
      setErrors((prev) => ({
        ...prev,
        ssh: t('profile.ssh.registerFailed'),
        sshDetail: null,
      }));
    }
  };

  const session = sessionData || props.session;

  return (
    <>
      <input
        id='ssh-file-upload'
        type='file'
        accept='.pub'
        style={{ display: 'none' }}
        onChange={handleRegisterSSHKeyFromFile}
      />
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
              {t('header.title')}
            </Heading>
            <Text size='3' color='gray'>
              {t('header.subtitle')}
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
            onSelectSSHKeyFile={() => document.getElementById('ssh-file-upload')?.click()}
            onSubmitSSHKey={registerSSHKey}
            isSSHKeySaving={isSSHKeySaving}
            isSSHKeyRegistered={isSSHKeyRegistered}
            sshErrorMessage={errors.ssh}
            sshErrorDetail={errors.sshDetail}
          />
          <ResourcesCard quota={quota} loading={loading} error={error} />
        </Flex>
      </main>
    </>
  );
}
