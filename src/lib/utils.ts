export const DATABASE_IMAGES: Record<string, string> = {
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

export const DATABASE_DESCRIPTIONS: Record<string, string> = {
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

export const getServiceImage = (pluginName: string) => {
  return DATABASE_IMAGES[pluginName] || DATABASE_IMAGES.generic;
};

export const getDatabaseDescription = (pluginName: string) => {
  return DATABASE_DESCRIPTIONS[pluginName] || DATABASE_DESCRIPTIONS.generic;
};

/**
 * Detects the user's locale based on browser settings
 * Falls back to 'pt-BR' if locale is not supported or detected
 */
export function getSystemLocale(): string {
  try {
    // Try to get locale from browser
    const browserLocale = navigator.language || navigator.languages?.[0];

    if (!browserLocale) {
      return 'en-US'; // Default fallback
    }

    // Check if it's an English locale (US)
    if (browserLocale.startsWith('en')) {
      return 'en-US';
    }

    // Check if it's a Portuguese locale (Brazil)
    if (browserLocale.startsWith('pt')) {
      return 'pt-BR';
    }

    // For other locales, try to use the detected one or fallback to pt-BR
    const supportedLocales = ['pt-BR', 'en-US'];

    // Check if the detected locale is in our supported list
    if (supportedLocales.includes(browserLocale)) {
      return browserLocale;
    }

    // Extract language part and match with supported locales
    const language = browserLocale.split('-')[0];
    const matchedLocale = supportedLocales.find((locale) => locale.startsWith(language));

    return matchedLocale || 'en-US';
  } catch (error) {
    console.warn('Error detecting system locale:', error);
    return 'en-US'; // Safe fallback
  }
}

/**
 * Formats a date using the detected system locale
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = getSystemLocale();
    return dateObj.toLocaleString(locale, options);
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Formats a timestamp (Unix timestamp in seconds) using the detected system locale
 */
export function formatTimestamp(timestamp: string | number): string {
  try {
    const timestampNum = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    const date = new Date(timestampNum * 1000);
    return formatDate(date);
  } catch (error) {
    console.warn('Error formatting timestamp:', error);
    return 'Invalid Date';
  }
}
