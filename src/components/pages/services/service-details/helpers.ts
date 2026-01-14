import { usePageTranslation } from '@/i18n/utils';

import type { ServiceData } from './types';

export interface StatusInfo {
  color: string;
  text: string;
  bgColor: string;
}

export const useStatusInfo = (serviceData: ServiceData | null): StatusInfo => {
  const { t } = usePageTranslation();
  if (!serviceData)
    return {
      color: 'var(--gray-9)',
      text: t('services.s.status.loading'),
      bgColor: 'var(--gray-3)',
    };

  switch (serviceData.status.toLowerCase()) {
    case 'running':
      return {
        color: 'var(--green-9)',
        text: t('services.s.status.active'),
        bgColor: 'var(--green-3)',
      };
    case 'stopped':
    case 'exited':
    case 'missing':
      return {
        color: 'var(--red-9)',
        text: t('services.s.status.stopped'),
        bgColor: 'var(--red-3)',
      };
    case 'starting':
      return {
        color: 'var(--amber-9)',
        text: t('services.s.status.starting'),
        bgColor: 'var(--amber-3)',
      };
    default:
      return {
        color: 'var(--gray-9)',
        text: t('services.s.status.unknown'),
        bgColor: 'var(--gray-3)',
      };
  }
};

export const formatVersion = (version: string): string => {
  // Extract the version part from format "mysql:8.1.0"
  const versionMatch = version.match(/:(.+)$/);
  return versionMatch ? `v${versionMatch[1]}` : version;
};
