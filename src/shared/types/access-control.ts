import { Site } from './sites';

export enum AccessControlType {
  IpRange = 1,
  Url = 2,
  ClientIp = 3,
  ClientMac = 4
}

export interface AccessControlData {
  id: number;
  pre_auth_access_enable: string;
  pre_auth_client_enable: string;
  site_id: string;
  modified_date: any;
  site: Site;
  access_policies: AccessPolicy[];
  access_clients: AccessPolicy[];
}

export interface AccessPolicy {
  id: number;
  access_control_id: number;
  id_int: number;
  type: AccessControlType;
  ip: string;
  subnet_mask: number;
  url: any;
  client_ip: string;
  client_mac: string;
}
