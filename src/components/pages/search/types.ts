export interface AppContainer {
  Id: string;
  Name: string;
  Image: string;
  State: {
    Running: boolean;
    Status: string;
    StartedAt: string;
  };
  Config: {
    Labels: {
      'com.dokku.app-name': string;
      'com.dokku.process-type': string;
    };
    Env: string[];
  };
  NetworkSettings: {
    Networks: {
      bridge: {
        IPAddress: string;
      };
    };
    Ports: Record<string, any>;
  };
}

export interface AppReportData {
  deployed: string;
  processes: string;
  running: string;
}

export interface SearchAppItem {
  data: AppContainer[] | AppReportData;
  info_origin: 'inspect' | 'report';
  raw_name: string;
}

export interface ServiceData {
  config_dir: string;
  config_options: string;
  data_dir: string;
  dsn: string;
  exposed_ports: string;
  id: string;
  internal_ip: string;
  links: string;
  service_root: string;
  status: string;
  version: string;
  plugin_name: string;
}

export interface SearchResponse {
  success: boolean;
  result: {
    apps: Array<Record<string, SearchAppItem>>;
    services: Array<Record<string, ServiceData>>;
    networks: string[];
    available_databases: string[];
  };
}

export type UnifiedItem =
  | { kind: 'app'; name: string; value: SearchAppItem }
  | { kind: 'service'; name: string; value: ServiceData }
  | { kind: 'network'; name: string }
  | { kind: 'available_database'; name: string };
