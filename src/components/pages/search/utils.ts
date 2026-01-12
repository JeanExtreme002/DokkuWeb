import { extractPortFromEnv } from '@/lib';

import type { AppContainer, AppReportData, SearchAppItem } from './types';

export const getAppStatusInfo = (app: SearchAppItem) => {
  if (app.info_origin === 'report') {
    const rd = app.data as AppReportData;
    const isDeployed = rd.deployed === 'true';
    const isRunning = rd.running === 'true';
    const processCount = parseInt(rd.processes) || 0;
    if (!isDeployed) return { color: 'var(--gray-9)', text: 'Não implantado', bg: 'var(--gray-3)' };
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
