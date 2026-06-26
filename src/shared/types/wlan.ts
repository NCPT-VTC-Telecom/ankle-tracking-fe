import { DataSites } from './sites';

export interface WLANData {
  id: number;
  wlan_hardware_id: string;
  name: string;
  wlan_primary: string;
  status_id: number;
  site_id: string;
  site: DataSites;
}

export interface NewWLAN {
  id: number;
  name: string;
  siteId: string;
}
