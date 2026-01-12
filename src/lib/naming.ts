export const formatAppName = (name: string): string => {
  // Remove numeric prefixes like "1-" if present
  return name.replace(/^\d+-/, '');
};

export const formatServiceName = (name: string): string => {
  // Remove numeric prefixes like "1_" if present
  return name.replace(/^\d+_/, '');
};

export const formatDatabaseType = (pluginName: string): string => {
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
