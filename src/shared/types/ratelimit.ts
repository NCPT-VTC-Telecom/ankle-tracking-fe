export interface NewRatelimit {
  id: number;
  name: string;
  downLimitEnable: 'false' | 'true';
  downLimit: number;
  upLimitEnable: 'false' | 'true';
  upLimit: number;
  siteId: string;
}

export interface DataRatelimit {
  id: number;
  name: string;
  down_limit_enable: 'false' | 'true';
  down_limit: number;
  up_limit_enable: 'false' | 'true';
  up_limit: number;
  site_id: string;
}
