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
  ps_can_scale: string;
  ps_computed_procfile_path: string;
  ps_global_procfile_path: string;
  ps_procfile_path: string;
  ps_restart_policy: string;
  restore: string;
  running: string;
}

export interface AppInfo {
  data: AppContainer[] | AppReportData;
  info_origin: 'inspect' | 'report';
}

export interface AppListItem {
  name: string;
  info: AppInfo | null;
  loading: boolean;
  error: string | null;
}
