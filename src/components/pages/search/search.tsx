import { EyeOpenIcon, GlobeIcon } from '@radix-ui/react-icons';
import { Avatar, Box, Button, Card, Flex, Heading, Separator, Text } from '@radix-ui/themes';
import NextImage from 'next/image';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';
import { useEffect, useMemo, useState } from 'react';

import { NavBar } from '@/components';
import { DotIcon } from '@/components/shared/icons';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { api } from '@/lib';

import searchStyles from './search.module.css';

interface SearchPageProps {
  session: Session;
}

// Types reused from apps/services pages
interface AppContainer {
  Id: string;
  Name: string;
  Image: string;
  State: {
    Running: boolean;
    Status: string;
    StartedAt: string;
  };
  Config: {
    Labels: {
      'com.dokku.app-name': string;
      'com.dokku.process-type': string;
    };
    Env: string[];
  };
  NetworkSettings: {
    Networks: {
      bridge: {
        IPAddress: string;
      };
    };
    Ports: Record<string, any>;
  };
}

interface AppReportData {
  deployed: string;
  processes: string;
  running: string;
}

interface SearchAppItem {
  data: AppContainer[] | AppReportData;
  info_origin: 'inspect' | 'report';
  raw_name: string;
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
}

interface SearchResponse {
  success: boolean;
  result: {
    apps: Array<Record<string, SearchAppItem>>;
    services: Array<Record<string, ServiceData>>;
    networks: string[];
    available_databases: string[];
  };
}

type UnifiedItem =
  | { kind: 'app'; name: string; value: SearchAppItem }
  | { kind: 'service'; name: string; value: ServiceData }
  | { kind: 'network'; name: string }
  | { kind: 'available_database'; name: string };

export function SearchPage(props: SearchPageProps) {
  function ServiceLogo({
    src,
    alt,
    imgSize = 56,
    className,
  }: {
    src: string;
    alt: string;
    imgSize?: number;
    className?: string;
  }) {
    return (
      <div
        className={className}
        style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <NextImage
          src={src}
          alt={alt}
          width={imgSize}
          height={imgSize}
          style={{ objectFit: 'contain' }}
        />
      </div>
    );
  }
  const router = useRouter();
  const qParam = router.query.q;

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
        setError('Erro ao buscar resultados');
      } finally {
        setLoading(false);
      }
    };

    const q = typeof qParam === 'string' ? qParam.trim() : '';
    fetchSearch(q);
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

  const availableDbItems = useMemo(
    () => items.filter((it) => it.kind === 'available_database'),
    [items]
  );
  const mainItems = useMemo(() => items.filter((it) => it.kind !== 'available_database'), [items]);

  const getAppStatusInfo = (app: SearchAppItem) => {
    if (app.info_origin === 'report') {
      const rd = app.data as AppReportData;
      const isDeployed = rd.deployed === 'true';
      const isRunning = rd.running === 'true';
      const processCount = parseInt(rd.processes) || 0;
      if (!isDeployed)
        return { color: 'var(--gray-9)', text: 'Não implantado', bg: 'var(--gray-3)' };
      if (!isRunning || processCount === 0)
        return { color: 'var(--red-9)', text: 'Parado', bg: 'var(--red-3)' };
      return { color: 'var(--green-9)', text: 'Ativo', bg: 'var(--green-3)' };
    }
    const containers = app.data as AppContainer[];
    const running = containers.filter((c) => c.State?.Running).length;
    if (containers.length === 0) return { color: 'var(--red-9)', text: 'Erro', bg: 'var(--red-3)' };
    if (running === 0) return { color: 'var(--red-9)', text: 'Terminado', bg: 'var(--red-3)' };
    if (running < containers.length)
      return { color: 'var(--amber-9)', text: 'Parcial', bg: 'var(--amber-3)' };
    return { color: 'var(--green-9)', text: 'Ativo', bg: 'var(--green-3)' };
  };

  const getAppProcessInfo = (app: SearchAppItem) => {
    if (app.info_origin === 'report') {
      const rd = app.data as AppReportData;
      return { type: 'web', count: parseInt(rd.processes) || 0 };
    }
    const arr = app.data as AppContainer[];
    const first = arr[0];
    return {
      type: first?.Config?.Labels?.['com.dokku.process-type'] || 'web',
      count: arr.length,
    };
  };

  const getAppIPAddress = (app: SearchAppItem) => {
    if (app.info_origin !== 'inspect') return null;
    const container = app.data as AppContainer[];
    return container[0].NetworkSettings?.Networks?.bridge?.IPAddress;
  };

  const getAppPort = (app: SearchAppItem) => {
    if (app.info_origin !== 'inspect') return null;
    const arr = app.data as AppContainer[];
    const first = arr[0];
    const env = first?.Config?.Env || [];
    const portEnv = env.find((e) => e.startsWith('PORT='));
    const proxyPortEnv = env.find((e) => e.startsWith('DOKKU_PROXY_PORT='));
    if (portEnv) return portEnv.split('=')[1];
    if (proxyPortEnv) return proxyPortEnv.split('=')[1];
    return null;
  };

  const formatAppName = (name: string) => name.replace(/^\d+-/, '');
  const formatServiceName = (name: string) => name.replace(/^\d+_/, '');
  const formatDatabaseType = (pluginName: string) => {
    const map: Record<string, string> = {
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
    return map[pluginName] || pluginName.charAt(0).toUpperCase() + pluginName.slice(1);
  };

  const renderAppCard = (name: string, app: SearchAppItem) => {
    const displayName = formatAppName(name);
    const status = getAppStatusInfo(app);
    const proc = getAppProcessInfo(app);
    const ipAddress = getAppIPAddress(app);
    const port = getAppPort(app);

    return (
      <Card
        key={`app-${name}`}
        style={{
          border: '1px solid var(--gray-6)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          transition: 'all 0.2s ease',
          cursor: isMobile ? 'default' : 'pointer',
        }}
        className={searchStyles.appCard}
        onClick={isMobile ? undefined : () => (window.location.href = `/apps/a/${displayName}`)}
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
        <Flex className={searchStyles.appCardContent} style={{ alignItems: 'flex-start' }}>
          <Avatar
            size='6'
            fallback={
              <svg
                width='48'
                height='48'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <rect
                  x='6'
                  y='6'
                  width='12'
                  height='12'
                  rx='2'
                  stroke='#e1bee7'
                  strokeWidth='2'
                  fill='rgba(225, 190, 231, 0.1)'
                />
                <circle cx='8' cy='8' r='0.5' fill='#ce93d8' />
                <circle cx='16' cy='8' r='0.5' fill='#ce93d8' />
                <circle cx='8' cy='16' r='0.5' fill='#ce93d8' />
                <circle cx='16' cy='16' r='0.5' fill='#ce93d8' />
                <rect
                  x='9'
                  y='9'
                  width='6'
                  height='6'
                  rx='1'
                  stroke='#f3e5f5'
                  strokeWidth='1.5'
                  fill='rgba(243, 229, 245, 0.2)'
                />
                <line x1='10' y1='11' x2='14' y2='11' stroke='#ce93d8' strokeWidth='0.5' />
                <line x1='10' y1='12.5' x2='14' y2='12.5' stroke='#ce93d8' strokeWidth='0.5' />
                <line x1='10' y1='14' x2='14' y2='14' stroke='#ce93d8' strokeWidth='0.5' />
                <line x1='11' y1='10' x2='11' y2='14' stroke='#ce93d8' strokeWidth='0.5' />
                <line x1='13' y1='10' x2='13' y2='14' stroke='#ce93d8' strokeWidth='0.5' />
                <circle cx='11.5' cy='11.5' r='0.3' fill='#ba68c8' />
                <circle cx='12.5' cy='12.5' r='0.3' fill='#ba68c8' />
                <circle cx='11.5' cy='13.5' r='0.3' fill='#ba68c8' />
                <circle cx='12.5' cy='11.5' r='0.3' fill='#ba68c8' />
                <line
                  x1='8'
                  y1='6'
                  x2='8'
                  y2='3'
                  stroke='#ce93d8'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <circle cx='8' cy='4.5' r='0.4' fill='#ba68c8' />
                <line
                  x1='12'
                  y1='6'
                  x2='12'
                  y2='3'
                  stroke='#ce93d8'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <circle cx='12' cy='4.5' r='0.4' fill='#ba68c8' />
                <line
                  x1='16'
                  y1='6'
                  x2='16'
                  y2='3'
                  stroke='#ce93d8'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <circle cx='16' cy='4.5' r='0.4' fill='#ba68c8' />
                <line
                  x1='8'
                  y1='18'
                  x2='8'
                  y2='21'
                  stroke='#ce93d8'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <circle cx='8' cy='19.5' r='0.4' fill='#ba68c8' />
                <line
                  x1='12'
                  y1='18'
                  x2='12'
                  y2='21'
                  stroke='#ce93d8'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <circle cx='12' cy='19.5' r='0.4' fill='#ba68c8' />
                <line
                  x1='16'
                  y1='18'
                  x2='16'
                  y2='21'
                  stroke='#ce93d8'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <circle cx='16' cy='19.5' r='0.4' fill='#ba68c8' />
                <line
                  x1='6'
                  y1='8'
                  x2='3'
                  y2='8'
                  stroke='#ce93d8'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <circle cx='4.5' cy='8' r='0.4' fill='#ba68c8' />
                <line
                  x1='6'
                  y1='12'
                  x2='3'
                  y2='12'
                  stroke='#ce93d8'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <circle cx='4.5' cy='12' r='0.4' fill='#ba68c8' />
                <line
                  x1='6'
                  y1='16'
                  x2='3'
                  y2='16'
                  stroke='#ce93d8'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <circle cx='4.5' cy='16' r='0.4' fill='#ba68c8' />
                <line
                  x1='18'
                  y1='8'
                  x2='21'
                  y2='8'
                  stroke='#ce93d8'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <circle cx='19.5' cy='8' r='0.4' fill='#ba68c8' />
                <line
                  x1='18'
                  y1='12'
                  x2='21'
                  y2='12'
                  stroke='#ce93d8'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <circle cx='19.5' cy='12' r='0.4' fill='#ba68c8' />
                <line
                  x1='18'
                  y1='16'
                  x2='21'
                  y2='16'
                  stroke='#ce93d8'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <circle cx='19.5' cy='16' r='0.4' fill='#ba68c8' />
              </svg>
            }
            style={{
              background:
                'linear-gradient(135deg, #6a1b9a 0%, #8e24aa 25%, #ab47bc 50%, #9c5cb5 75%, #7b1fa2 100%)',
              color: 'white',
              marginRight: '10px',
              border: '2px solid rgba(255, 255, 255, 0.25)',
            }}
          />
          <Flex direction='column' className={searchStyles.appInfo}>
            <Flex align='center' gap='2'>
              <Heading size='4' weight='medium' style={{ color: 'var(--gray-12)' }}>
                {displayName}
              </Heading>
              <Text size='2' style={{ color: 'var(--gray-9)' }}>
                {proc.type ? ` · ${proc.type}` : ''}
              </Text>
            </Flex>
            <Flex align='center' gap='2'>
              <Text size='2' style={{ color: 'var(--gray-9)' }}>
                {ipAddress ? `IP: ${ipAddress}` : 'IP: Indisponível'}
              </Text>
              <Text size='2' style={{ color: 'var(--gray-9)' }}>
                {port ? ` · Porta ${port}` : ''}
              </Text>
            </Flex>
            <Flex align='center' gap='2'>
              <Box
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: status.color,
                }}
              />
              <Text size='2' weight='medium' style={{ color: 'var(--gray-11)' }}>
                {status.text}
              </Text>
            </Flex>
          </Flex>
          <Flex direction='column' className={searchStyles.appActions}>
            <Text size='2' color='gray' className={searchStyles.dateText}>
              Instância de Aplicativo
            </Text>
            <Button
              size='3'
              color='blue'
              variant='outline'
              onClick={() => (window.location.href = `/apps/a/${displayName}`)}
            >
              <EyeOpenIcon />
              Ver detalhes
            </Button>
          </Flex>
        </Flex>
      </Card>
    );
  };

  // Service logos mapping as in Services page
  const DATABASE_IMAGES: Record<string, string> = {
    postgres: '/images/database-logos/postgresql.svg',
    mysql: '/images/database-logos/mysql.svg',
    mongodb: '/images/database-logos/mongodb.svg',
    redis: '/images/database-logos/redis.svg',
    mariadb: '/images/database-logos/mariadb.svg',
    couchdb: '/images/database-logos/couchdb.svg',
    cassandra: '/images/database-logos/cassandra.svg',
    elasticsearch: '/images/database-logos/elasticsearch.svg',
    influxdb: '/images/database-logos/influxdb.svg',
    generic: '/images/database-logos/generic.svg',
  };

  const DATABASE_DESCRIPTIONS: Record<string, string> = {
    postgres:
      'SGBD relacional open source com aderência ao ACID, transações robustas, tipos avançados (JSONB, arrays) e extensões como PostGIS; indicado para workloads OLTP/OLAP.',
    mysql:
      'SGBD relacional amplamente utilizado, bom desempenho e replicação, com engine InnoDB por padrão; muito usado em aplicações web.',
    mariadb:
      'Fork do MySQL, compatível e com otimizações de desempenho e recursos extras (motores de armazenamento e funcionalidades avançadas).',
    mongodb:
      'Banco NoSQL orientado a documentos (BSON) com esquema flexível, escalabilidade horizontal e consultas ricas com índices.',
    redis:
      'Armazenamento chave‑valor em memória com estruturas de dados, latência ultra‑baixa, pub/sub e persistência opcional; ideal para cache, filas e rate limiting.',
    couchdb:
      'Banco de documentos com replicação mestre‑mestre e sincronização offline, API HTTP/JSON e controle de conflitos por revisão.',
    cassandra:
      'Banco distribuído de colunas largas, alta disponibilidade e escala linear, consistência eventual e desempenho otimizado para escrita.',
    elasticsearch:
      'Motor de busca e analytics distribuído baseado em Lucene; indexação full‑text, agregações e consultas quase em tempo real.',
    influxdb:
      'Banco de séries temporais otimizado para métricas e logs, com retenção, downsampling e linguagem de consulta (Flux/InfluxQL).',
    generic: 'Categoria genérica de banco; selecione o tipo conforme os requisitos da aplicação.',
  };

  const getServiceImage = (pluginName: string) => {
    return DATABASE_IMAGES[pluginName] || DATABASE_IMAGES.generic;
  };

  const getDatabaseDescription = (pluginName: string) => {
    return DATABASE_DESCRIPTIONS[pluginName] || DATABASE_DESCRIPTIONS.generic;
  };

  const renderServiceCard = (name: string, svc: ServiceData) => {
    const displayName = formatServiceName(name);
    const statusMap = (s: string) => {
      switch (s.toLowerCase()) {
        case 'running':
          return { color: 'var(--green-9)', text: 'Ativo', bg: 'var(--green-3)' };
        case 'stopped':
        case 'exited':
        case 'missing':
          return { color: 'var(--red-9)', text: 'Parado', bg: 'var(--red-3)' };
        case 'starting':
          return { color: 'var(--amber-9)', text: 'Iniciando', bg: 'var(--amber-3)' };
        default:
          return { color: 'var(--gray-9)', text: 'Desconhecido', bg: 'var(--gray-3)' };
      }
    };
    const status = statusMap(svc.status || 'unknown');
    const pluginLabel = formatDatabaseType(svc.plugin_name);

    return (
      <Card
        key={`svc-${name}`}
        style={{
          border: '1px solid var(--gray-6)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          transition: 'all 0.2s ease',
          cursor: isMobile ? 'default' : 'pointer',
        }}
        className={searchStyles.appCard}
        onClick={
          isMobile
            ? undefined
            : () => (window.location.href = `/services/s/${svc.plugin_name}/${name}`)
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
        <Flex className={searchStyles.appCardContent}>
          <ServiceLogo
            src={getServiceImage(svc.plugin_name)}
            alt={`${pluginLabel} logo`}
            imgSize={56}
            className={searchStyles.searchServiceImage}
          />
          <Flex direction='column' className={searchStyles.appInfo}>
            <Flex align='center' gap='2'>
              <Heading size='4' weight='medium' style={{ color: 'var(--gray-12)' }}>
                {displayName}
              </Heading>
            </Flex>
            <Flex align='center' gap='2'>
              <Text size='2' style={{ color: 'var(--gray-9)' }}>
                {pluginLabel}
                {svc.version ? ` · v${svc.version.split(':').pop()}` : ''}
              </Text>
            </Flex>
            <Flex align='center' gap='2'>
              <Box
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: status.color,
                }}
              />
              <Text size='2' weight='medium' style={{ color: 'var(--gray-11)' }}>
                {status.text}
              </Text>
            </Flex>
          </Flex>
          <Flex direction='column' className={searchStyles.appActions}>
            <Text size='2' color='gray' className={searchStyles.dateText}>
              Instância de Serviço
            </Text>
            <Button
              size='3'
              color='blue'
              variant='outline'
              onClick={() => (window.location.href = `/services/s/${svc.plugin_name}/${name}`)}
            >
              <EyeOpenIcon />
              Ver detalhes
            </Button>
          </Flex>
        </Flex>
      </Card>
    );
  };

  const renderNetworkCard = (name: string) => {
    return (
      <Card
        key={`net-${name}`}
        style={{
          border: '1px solid var(--gray-6)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          transition: 'all 0.2s ease',
          cursor: isMobile ? 'default' : 'pointer',
        }}
        className={searchStyles.appCard}
        onClick={isMobile ? undefined : () => (window.location.href = `/networks`)}
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
        <Flex className={searchStyles.appCardContent}>
          <Box
            style={{
              flexShrink: 0,
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--green-3) 0%, var(--blue-3) 100%)',
              border: '1px solid var(--green-6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GlobeIcon width='48' height='48' style={{ color: 'var(--green-11)' }} />
          </Box>
          <Flex direction='column' className={searchStyles.appInfo}>
            <Heading size='4' weight='medium' style={{ color: 'var(--gray-12)' }}>
              {name}
            </Heading>
            <Text size='2' color='gray'>
              Rede customizada do usuário para conectar aplicações no Dokku
            </Text>
          </Flex>
          <Flex direction='column' className={searchStyles.appActions}>
            <Text size='2' color='gray' className={searchStyles.dateText}>
              Rede customizada
            </Text>
            <Button
              size='3'
              color='blue'
              variant='outline'
              onClick={() => (window.location.href = `/networks`)}
            >
              <EyeOpenIcon />
              Ver detalhes
            </Button>
          </Flex>
        </Flex>
      </Card>
    );
  };

  const renderAvailableDbCard = (name: string) => {
    const label = formatDatabaseType(name);
    return (
      <Card
        key={`db-${name}`}
        style={{
          border: '1px solid var(--gray-6)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          transition: 'all 0.2s ease',
          cursor: isMobile ? 'default' : 'pointer',
        }}
        className={searchStyles.appCard}
        onClick={isMobile ? undefined : () => (window.location.href = `/services/create/`)}
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
        <Flex className={searchStyles.appCardContent}>
          <ServiceLogo
            src={getServiceImage(name)}
            alt={`${label} logo`}
            imgSize={56}
            className={searchStyles.searchServiceImage}
          />
          <Flex direction='column' className={searchStyles.appInfo}>
            <Heading size='4' weight='medium' style={{ color: 'var(--gray-12)' }}>
              {label} ·{' '}
              <Text size='2' color='gray'>
                Disponível
              </Text>
            </Heading>
            <Text size='2' color='gray' className={searchStyles.dbDescription}>
              {getDatabaseDescription(name)}
            </Text>
          </Flex>
          <Flex direction='column' className={searchStyles.appActions}>
            <Button
              size='3'
              color='green'
              style={{ color: 'white' }}
              onClick={() => (window.location.href = `/services/create/`)}
            >
              + Criar serviço
            </Button>
          </Flex>
        </Flex>
      </Card>
    );
  };

  return (
    <>
      <NavBar session={props.session} />
      <main className={searchStyles.root}>
        <Flex direction='column' gap='5' className={searchStyles.mainContainer}>
          <Flex className={searchStyles.headerSection}>
            <Box>
              <Heading
                size='7'
                weight='medium'
                style={{ color: 'var(--gray-12)', marginBottom: '4px' }}
              >
                Resultados da Busca
              </Heading>
              <Text size='3' color='gray'>
                {`Buscando por "${typeof qParam === 'string' ? qParam : ''}"${!loading && !error && result ? ` • ${items.length} items encontrados` : ''}`}
              </Text>
            </Box>
          </Flex>

          <Separator size='4' style={{ margin: '10px 0' }} />

          {loading && (
            <LoadingSpinner
              title='Carregando Resultados'
              messages={[
                'Conectando ao Dokku...',
                'Processando consulta...',
                'Preparando resultados...',
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
                Nenhum resultado encontrado.
              </Text>
            </Card>
          )}

          {!loading && !error && mainItems.length > 0 && (
            <Flex direction='column' gap='3'>
              {mainItems.map((it) => {
                if (it.kind === 'app') return renderAppCard(it.name, it.value);
                if (it.kind === 'service') return renderServiceCard(it.name, it.value);
                return renderNetworkCard(it.name);
              })}
            </Flex>
          )}

          {!loading && !error && availableDbItems.length > 0 && (
            <Box className={searchStyles.availableSection}>
              <Heading
                size='5'
                weight='medium'
                style={{ color: 'var(--gray-12)', margin: '12px 0' }}
              >
                Serviços disponíveis para criação
              </Heading>
              <div className={searchStyles.availableGrid}>
                {availableDbItems.map((it) => renderAvailableDbCard(it.name))}
              </div>
            </Box>
          )}
        </Flex>
      </main>
    </>
  );
}
