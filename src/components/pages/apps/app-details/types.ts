export interface AppContainer {
  Id: string;
  Name: string;
  Image: string;
  Created: string;
  State: {
    Running: boolean;
    Status: string;
    StartedAt: string;
    FinishedAt: string;
    Pid: number;
  };
  Config: {
    Labels: Record<string, string>;
    Env: string[];
    Image: string;
    Hostname: string;
    WorkingDir: string;
  };
  NetworkSettings: {
    Networks: {
      bridge: {
        IPAddress: string;
        Gateway: string;
        MacAddress: string;
      };
    };
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
  raw_name: string;
}

export interface DeployInfoData {
  'Git deploy branch'?: string;
  'Git global deploy branch'?: string;
  'Git keep git dir'?: string;
  'Git rev env var'?: string;
  'Git sha'?: string;
  'Git last updated at'?: string;
}

export interface BuilderData {
  builder_build_dir: string;
  builder_computed_build_dir: string;
  builder_computed_selected: string;
  builder_global_build_dir: string;
  builder_global_selected: string;
  builder_selected: string;
}
