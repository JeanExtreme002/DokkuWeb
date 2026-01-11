import type { ServiceData } from './types';

export interface StatusInfo {
  color: string;
  text: string;
  bgColor: string;
}

export const getStatusInfo = (serviceData: ServiceData | null): StatusInfo => {
  if (!serviceData)
    return { color: 'var(--gray-9)', text: 'Carregando...', bgColor: 'var(--gray-3)' };

  switch (serviceData.status.toLowerCase()) {
    case 'running':
      return { color: 'var(--green-9)', text: 'Ativo', bgColor: 'var(--green-3)' };
    case 'stopped':
    case 'exited':
    case 'missing':
      return { color: 'var(--red-9)', text: 'Parado', bgColor: 'var(--red-3)' };
    case 'starting':
      return { color: 'var(--amber-9)', text: 'Iniciando', bgColor: 'var(--amber-3)' };
    default:
      return { color: 'var(--gray-9)', text: 'Desconhecido', bgColor: 'var(--gray-3)' };
  }
};

export const formatServiceName = (name: string): string => {
  // Remove numeric prefixes like "1_" if present
  return name.replace(/^\d+_/, '');
};

export const formatDatabaseType = (pluginName: string): string => {
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

export const formatVersion = (version: string): string => {
  // Extract the version part from format "mysql:8.1.0"
  const versionMatch = version.match(/:(.+)$/);
  return versionMatch ? `v${versionMatch[1]}` : version;
};

export const processAnsiCodes = (text: string): string => {
  // Remove ANSI escape codes for cleaner display
  return text.replace(/\u001b\[[0-9;]*m/g, '');
};

export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Erro ao copiar para a área de transferência:', error);
  }
};

export const downloadTextFile = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
