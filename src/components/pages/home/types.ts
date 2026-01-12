export interface SystemInfo {
  version: string;
  dokkuVersion: string;
  dokkuStatus: boolean;
}

export interface DetailedResourcesData {
  apps: Array<{ name: string }>;
  services: Array<{ name: string; type?: string }>;
  networks: Array<{ name: string }>;
}

export interface LoadingState {
  apps: boolean;
  networks: boolean;
  services: boolean;
  system: boolean;
}

export interface LoadingStateSubset {
  apps: boolean;
  networks: boolean;
  services: boolean;
}

export interface QuotaInfo {
  apps_quota: number;
  networks_quota: number;
  services_quota: number;
}
