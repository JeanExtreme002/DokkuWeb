import { api } from '@/lib';

export interface NetworksData {
  [networkName: string]: object;
}

export async function listNetworks(noCache: boolean = false): Promise<NetworksData> {
  const response = await api.post(
    '/api/networks/list/',
    {},
    noCache ? { headers: { 'x-cache': 'false' } } : undefined
  );

  if (response.status === 200 && response.data?.success) {
    return response.data.result as NetworksData;
  }
  throw new Error(`Failed to list networks: status ${response.status}`);
}

export async function getLinkedApps(
  networkName: string,
  noCache: boolean = false
): Promise<{ apps: string[]; cacheHit: boolean }> {
  const response = await api.post(
    `/api/networks/${networkName}/linked-apps/`,
    {},
    noCache ? { headers: { 'x-cache': 'false' } } : undefined
  );

  if (response.status === 200 && response.data?.success) {
    const cacheHeader = response.headers?.['x-cache'];
    return { apps: response.data.result as string[], cacheHit: cacheHeader === 'HIT' };
  }
  return { apps: [], cacheHit: false };
}

export async function linkApp(networkName: string, appName: string): Promise<boolean> {
  const response = await api.post(`/api/networks/${networkName}/link/${appName}/`);
  return response.status === 200;
}

export async function unlinkApp(networkName: string, appName: string): Promise<boolean> {
  const response = await api.delete(`/api/networks/${networkName}/link/${appName}`);
  return response.status === 200;
}

export async function createNetwork(name: string): Promise<number> {
  const response = await api.post(`/api/networks/${name}/`);
  return response.status;
}

export async function deleteNetwork(name: string): Promise<boolean> {
  const response = await api.delete(`/api/networks/${name}`);
  return response.status === 200;
}
