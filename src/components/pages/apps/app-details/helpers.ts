import { usePageTranslation } from '@/i18n/utils';
import { processAnsiCodes } from '@/lib';

import type { AppContainer, AppInfo } from './types';

// Directory listing parsing
export type DirEntry = {
  name: string;
  type: 'file' | 'dir' | 'symlink' | 'other';
  permissions: string;
  owner: string;
  group: string;
  size: number;
  date: string;
  target?: string;
};

export const parseLsOutput = (text: string): DirEntry[] => {
  const clean = processAnsiCodes(text);
  const lines = clean.split(/\r?\n/).filter((l: string) => l.trim().length > 0);
  const out: DirEntry[] = [];
  for (const line of lines) {
    if (/^total\s+\d+/.test(line)) continue;
    const parts = line.trim().split(/\s+/);
    if (parts.length < 9) continue;
    const permissions = parts[0];
    const owner = parts[2] || '';
    const group = parts[3] || '';
    const size = parseInt(parts[4] || '0', 10) || 0;
    const date = `${parts[5]} ${parts[6]} ${parts[7]}`;
    const nameAndRest = parts.slice(8).join(' ');
    let name = nameAndRest;
    let target: string | undefined = undefined;
    const arrowIdx = nameAndRest.indexOf(' -> ');
    if (arrowIdx > -1) {
      name = nameAndRest.slice(0, arrowIdx);
      target = nameAndRest.slice(arrowIdx + 4);
    }
    const typeChar = permissions.charAt(0);
    let type: DirEntry['type'] = 'other';
    if (typeChar === 'd') type = 'dir';
    else if (typeChar === '-') type = 'file';
    else if (typeChar === 'l') type = 'symlink';
    out.push({ name, type, permissions, owner, group, size, date, target });
  }
  out.sort((a, b) => {
    const special = (n: string) => (n === '.' ? -2 : n === '..' ? -1 : 0);
    const sa = special(a.name);
    const sb = special(b.name);
    if (sa !== sb) return sa - sb;
    const order = (t: DirEntry['type']) => (t === 'dir' ? 0 : t === 'file' ? 1 : 2);
    const oa = order(a.type);
    const ob = order(b.type);
    if (oa !== ob) return oa - ob;
    return a.name.localeCompare(b.name);
  });
  return out;
};

// Size formatting
export const formatSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes < 0) return '-';
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let value = bytes;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  if (i === 0) return `${bytes} bytes`;
  const formatted = value.toFixed(value < 10 ? 1 : 0);
  return `${formatted} ${units[i]}`;
};

// Path helpers
export const pathJoin = (base: string, sub: string) => {
  if (!base) return sub || '/';
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const s = sub.startsWith('/') ? sub.slice(1) : sub;
  const joined = `${b}/${s}`;
  return joined.replace(/\/+/g, '/');
};

// Env file parsers
export const parseDotEnv = (content: string): Record<string, string> => {
  const result: Record<string, string> = {};
  const lines = content.split(/\r?\n/);
  for (let line of lines) {
    if (!line) continue;
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    line = line.replace(/^export\s+/, '');
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_\.-]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2] ?? '';
    const isQuoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (!isQuoted) {
      const hashIndex = value.indexOf('#');
      if (hashIndex > -1) value = value.slice(0, hashIndex).trim();
    }
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value
        .slice(1, -1)
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1).replace(/''/g, "'");
    } else {
      value = value.trim();
    }
    result[key] = value;
  }
  return result;
};

export const parseYmlSimple = (content: string): Record<string, string> => {
  const result: Record<string, string> = {};
  const lines = content.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith('- ')) continue;
    const match = line.match(/^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2] ?? '';
    const isQuoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (!isQuoted) {
      const hashIndex = value.indexOf('#');
      if (hashIndex > -1) value = value.slice(0, hashIndex).trim();
    }
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value
        .slice(1, -1)
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1).replace(/''/g, "'");
    } else {
      value = value.trim();
    }
    if (key) result[key] = value;
  }
  return result;
};

export const parseJsonEnv = (content: string): Record<string, string> => {
  try {
    const obj = JSON.parse(content);
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (!k) continue;
      const key = k as string;
      const val = typeof v === 'string' ? v : JSON.stringify(v);
      out[key] = val;
    }
    return out;
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    return {};
  }
};

export const sanitizeEnvKeys = (vars: Record<string, string>): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(vars)) {
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(k)) out[k] = String(v);
  }
  return out;
};

export const getWorkingDir = (appInfo: AppInfo | null): string => {
  if (appInfo && appInfo.info_origin === 'inspect') {
    const containers = appInfo.data as AppContainer[];
    return containers?.[0]?.Config?.WorkingDir || '';
  }
  return '';
};

export const getPrompt = (appInfo: AppInfo | null, appName: string): string => {
  const workingDir = getWorkingDir(appInfo) || '';
  return `${appName} - ${workingDir} %`;
};

export const getPromptLabel = (appInfo: AppInfo | null, appName: string): string => {
  const workingDir = getWorkingDir(appInfo) || '';
  return `${appName} - ${workingDir}`.trim();
};

export const getIsDeployed = (appInfo: AppInfo | null): boolean => {
  if (!appInfo) return false;
  if (appInfo.info_origin === 'report') {
    const reportData = appInfo.data as any;
    return reportData.deployed === 'true';
  }
  const containers = appInfo.data as AppContainer[];
  return (containers?.length || 0) > 0;
};

export const getIsRunning = (appInfo: AppInfo | null): boolean => {
  if (!appInfo) return false;
  if (appInfo.info_origin === 'report') {
    const reportData = appInfo.data as any;
    const isDeployed = reportData.deployed === 'true';
    const isRunning = reportData.running === 'true';
    const processCount = parseInt(reportData.processes) || 0;
    return isDeployed && isRunning && processCount > 0;
  }
  const containers = appInfo.data as AppContainer[];
  const runningContainers = containers.filter((c) => c.State?.Running);
  return runningContainers.length > 0;
};

export const useStatusInfo = (
  appInfo: AppInfo | null
): { color: string; text: string; bgColor: string } => {
  const { t } = usePageTranslation();
  if (!appInfo)
    return {
      color: 'var(--gray-9)',
      text: t('card.loadingStatus'),
      bgColor: 'var(--gray-3)',
    };

  if (appInfo.info_origin === 'report') {
    const reportData = appInfo.data as any;
    const isDeployed = reportData.deployed === 'true';
    const isRunning = reportData.running === 'true';
    const processCount = parseInt(reportData.processes) || 0;

    if (!isDeployed) {
      return {
        color: 'var(--gray-9)',
        text: t('status.notDeployed'),
        bgColor: 'var(--gray-3)',
      };
    } else if (!isRunning || processCount === 0) {
      return {
        color: 'var(--red-9)',
        text: t('status.stopped'),
        bgColor: 'var(--red-3)',
      };
    } else {
      return {
        color: 'var(--green-9)',
        text: t('status.active'),
        bgColor: 'var(--green-3)',
      };
    }
  } else {
    const containers = appInfo.data as AppContainer[];
    const runningContainers = containers.filter((container) => container.State.Running);

    if (containers.length === 0) {
      return {
        color: 'var(--red-9)',
        text: t('status.error'),
        bgColor: 'var(--red-3)',
      };
    } else if (runningContainers.length === 0) {
      return {
        color: 'var(--red-9)',
        text: t('status.stopped'),
        bgColor: 'var(--red-3)',
      };
    } else if (runningContainers.length < containers.length) {
      return {
        color: 'var(--amber-9)',
        text: t('status.partial'),
        bgColor: 'var(--amber-3)',
      };
    } else {
      return {
        color: 'var(--green-9)',
        text: t('status.active'),
        bgColor: 'var(--green-3)',
      };
    }
  }
};
