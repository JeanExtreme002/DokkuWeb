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

export const formatVersion = (version: string) => {
  if (!version) return '';
  // Extract only the version from the format "mysql:8.1.0"
  const versionMatch = version.match(/:(.+)$/);
  return versionMatch ? versionMatch[1] : version;
};
