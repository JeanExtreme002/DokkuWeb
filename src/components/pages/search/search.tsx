import { Box, Card, Flex, Separator, Text } from '@radix-ui/themes';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';
import { useEffect, useMemo, useState } from 'react';

import { NavBar } from '@/components';
import { DotIcon } from '@/components/shared/icons';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { usePageTranslation } from '@/i18n/utils';
import { api } from '@/lib';

import { AvailableServicesSection, HeaderSection, ResultsSection } from './components';
import searchStyles from './search.module.css';
import type { SearchResponse, UnifiedItem } from './types';

interface SearchPageProps {
  session: Session;
}

export function SearchPage(props: SearchPageProps) {
  const router = useRouter();
  const qParam = router.query.q;
  const { t } = usePageTranslation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResponse['result'] | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    const fetchSearch = async (q: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.post<SearchResponse>('/api/search/', {}, { params: { q } });
        if (response.status === 200 && response.data.success) {
          setResult(response.data.result);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError(t('search.error.fetch_failed'));
      } finally {
        setLoading(false);
      }
    };

    const q = typeof qParam === 'string' ? qParam.trim() : '';
    fetchSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qParam]);

  const items: UnifiedItem[] = useMemo(() => {
    if (!result) return [];

    const unified: UnifiedItem[] = [];

    // Apps
    for (const appObj of result.apps || []) {
      const [name, value] = Object.entries(appObj)[0] || [];
      if (name && value) unified.push({ kind: 'app', name, value });
    }

    // Services
    for (const svcObj of result.services || []) {
      const [name, value] = Object.entries(svcObj)[0] || [];
      if (name && value) unified.push({ kind: 'service', name, value });
    }

    // Networks
    for (const net of result.networks || []) {
      unified.push({ kind: 'network', name: net });
    }

    // Available databases
    for (const db of result.available_databases || []) {
      unified.push({ kind: 'available_database', name: db });
    }

    return unified;
  }, [result]);

  return (
    <>
      <NavBar session={props.session} />
      <main className={searchStyles.root}>
        <Flex direction='column' gap='5' className={searchStyles.mainContainer}>
          <HeaderSection
            query={typeof qParam === 'string' ? qParam : ''}
            itemsCount={items.length}
            loading={loading}
            error={error}
            hasResult={!!result}
          />

          <Separator size='4' style={{ margin: '10px 0' }} />

          {loading && (
            <LoadingSpinner
              title={t('search.loading.title')}
              messages={[
                t('search.loading.messages.connecting_dokku'),
                t('search.loading.messages.processing_query'),
                t('search.loading.messages.preparing_results'),
              ]}
            />
          )}

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

          {!loading && !error && result && items.length === 0 && (
            <Card
              style={{
                border: '1px solid var(--gray-6)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                padding: '40px',
                textAlign: 'center',
              }}
            >
              <Text size='3' color='gray'>
                {t('search.empty.no_results')}
              </Text>
            </Card>
          )}

          {!loading && !error && items.length > 0 && (
            <ResultsSection items={items} isMobile={isMobile} />
          )}

          {!loading && !error && items.length > 0 && (
            <AvailableServicesSection items={items} isMobile={isMobile} />
          )}
        </Flex>
      </main>
    </>
  );
}
