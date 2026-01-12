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

export const formatVersion = (version: string): string => {
  // Extract the version part from format "mysql:8.1.0"
  const versionMatch = version.match(/:(.+)$/);
  return versionMatch ? `v${versionMatch[1]}` : version;
};
