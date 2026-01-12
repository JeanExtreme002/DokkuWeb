import { extractPortFromEnv, formatDate } from '@/lib';

import { AppContainer, AppInfo, AppReportData } from './types';

export const formatStartedAt = (startedAt: string) => {
  try {
    return formatDate(startedAt, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Data inválida';
  }
};

export const getUptime = (startedAt: string) => {
  try {
    const start = new Date(startedAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else {
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffMinutes}m`;
    }
  } catch {
    return 'N/A';
  }
};

export const getStatusInfo = (appInfo: AppInfo) => {
  if (appInfo.info_origin === 'report') {
    const reportData = appInfo.data as AppReportData;
    const isDeployed = reportData.deployed === 'true';
    const isRunning = reportData.running === 'true';
    const processCount = parseInt(reportData.processes) || 0;

    if (!isDeployed) {
      return { color: 'var(--gray-9)', text: 'Não implantado', bgColor: 'var(--gray-3)' };
    } else if (!isRunning || processCount === 0) {
      return { color: 'var(--red-9)', text: 'Parado', bgColor: 'var(--red-3)' };
    } else {
      return { color: 'var(--green-9)', text: 'Ativo', bgColor: 'var(--green-3)' };
    }
  } else {
    const containers = appInfo.data as AppContainer[];
    const runningContainers = containers.filter((container) => container.State.Running);

    if (containers.length === 0) {
      return { color: 'var(--red-9)', text: 'Erro', bgColor: 'var(--red-3)' };
    } else if (runningContainers.length === 0) {
      return { color: 'var(--red-9)', text: 'Terminado', bgColor: 'var(--red-3)' };
    } else if (runningContainers.length < containers.length) {
      return { color: 'var(--amber-9)', text: 'Parcial', bgColor: 'var(--amber-3)' };
    } else {
      return { color: 'var(--green-9)', text: 'Ativo', bgColor: 'var(--green-3)' };
    }
  }
};

export const getProcessInfo = (appInfo: AppInfo) => {
  if (appInfo.info_origin === 'report') {
    const reportData = appInfo.data as AppReportData;
    return {
      processType: 'web', // Default for report
      processCount: parseInt(reportData.processes) || 0,
    };
  } else {
    const containers = appInfo.data as AppContainer[];
    const firstContainer = containers[0];
    return {
      processType: firstContainer?.Config.Labels['com.dokku.process-type'] || 'web',
      processCount: containers.length,
    };
  }
};

export const getContainerInfo = (appInfo: AppInfo) => {
  if (appInfo.info_origin === 'inspect' && Array.isArray(appInfo.data)) {
    return appInfo.data[0] as AppContainer;
  }
  return null;
};

export const getPortInfo = (container: AppContainer | null) => {
  if (!container) return null;
  const envVars = container.Config.Env || [];
  return extractPortFromEnv(envVars);
};
