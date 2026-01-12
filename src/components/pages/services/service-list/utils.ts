export const getStatusInfo = (status: string) => {
  switch (status.toLowerCase()) {
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

export const formatServiceName = (serviceName: string) => {
  // Remove numeric prefixes like "1_" if present
  return serviceName.replace(/^\d+_/, '');
};

export const formatVersion = (version: string) => {
  if (!version) return '';
  // Extract only the version from the format "mysql:8.1.0"
  const versionMatch = version.match(/:(.+)$/);
  return versionMatch ? versionMatch[1] : version;
};

export const formatDatabaseType = (pluginName: string) => {
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
