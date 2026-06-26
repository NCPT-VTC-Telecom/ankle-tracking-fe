import { DataSites } from './sites';

export interface VLANData {
  id: number;
  wlan_hardware_id: string;
  name: string;
  wlan_primary: string;
  status_id: number;
  site_id: string;
  site: DataSites;
}

export interface NewVLAN {
  id: number;
  name: string;
  siteId: string;
}
