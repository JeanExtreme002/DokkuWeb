import { usePageTranslation } from '@/i18n/utils';
import { extractPortFromEnv } from '@/lib';

import type { AppContainer, AppReportData, SearchAppItem } from './types';

export const getAppStatusInfo = (app: SearchAppItem) => {
  if (app.info_origin === 'report') {
    const rd = app.data as AppReportData;
    const isDeployed = rd.deployed === 'true';
    const isRunning = rd.running === 'true';
    const processCount = parseInt(rd.processes) || 0;
    if (!isDeployed)
      return {
        color: 'var(--gray-9)',
        text: 'not deployed',
        key: 'search.app.status.not_deployed',
        bg: 'var(--gray-3)',
      };
    if (!isRunning || processCount === 0)
      return {
        color: 'var(--red-9)',
        text: 'stopped',
        key: 'search.app.status.stopped',
        bg: 'var(--red-3)',
      };
    return {
      color: 'var(--green-9)',
      text: 'ativo',
      key: 'search.app.status.active',
      bg: 'var(--green-3)',
    };
  }
  const containers = app.data as AppContainer[];
  const running = containers.filter((c) => c.State?.Running).length;
  if (containers.length === 0)
    return {
      color: 'var(--red-9)',
      text: 'error',
      key: 'search.app.status.error',
      bg: 'var(--red-3)',
    };
  if (running === 0)
    return {
      color: 'var(--red-9)',
      text: 'exited',
      key: 'search.app.status.exited',
      bg: 'var(--red-3)',
    };
  if (running < containers.length)
    return {
      color: 'var(--amber-9)',
      text: 'partial',
      key: 'search.app.status.partial',
      bg: 'var(--amber-3)',
    };
  return {
    color: 'var(--green-9)',
    text: 'active',
    key: 'search.app.status.active',
    bg: 'var(--green-3)',
  };
};

export const getAppProcessInfo = (app: SearchAppItem) => {
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

export const getAppIPAddress = (app: SearchAppItem) => {
  if (app.info_origin !== 'inspect') return null;
  const container = app.data as AppContainer[];
  return container[0].NetworkSettings?.Networks?.bridge?.IPAddress || null;
};

export const getAppPort = (app: SearchAppItem) => {
  if (app.info_origin !== 'inspect') return null;
  const arr = app.data as AppContainer[];
  const first = arr[0];
  const env = first?.Config?.Env || [];
  return extractPortFromEnv(env);
};

export const useDatabaseDescription = (pluginName: string) => {
  const { t } = usePageTranslation();
  const key = `search.available.descriptions.${pluginName}`;
  const fallbackKey = 'search.available.descriptions.generic';
  const text = t(key, { defaultValue: t(fallbackKey) });
  return text;
};
