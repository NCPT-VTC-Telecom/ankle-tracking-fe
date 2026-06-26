export interface NewRadius {
  id: number;
  name: string;
  ipAuth: string;
  portAuth: number;
  pwdAuth: string;
  isAcct: string; // ['true', 'false']
  isUpdate: string; // ['true', 'false']
  updateIntervalPeriod: number;
  ipAcct: string;
  portAcct: number;
  pwdAcct: string;
  isVlanAssign: string; // ['true', 'false']
  siteId: string;
}

export interface DataRadius {
  id: number;
  name: string;
  ip_auth: string;
  port_auth: number;
  pwd_auth: string;
  is_acct: string; // ['true', 'false']
  is_update: string; // ['true', 'false']
  update_interval_period: number;
  ip_acct: string;
  port_acct: number;
  pwd_acct: string;
  is_vlan_assign: string; // ['true', 'false']
  site_id: string;
}
