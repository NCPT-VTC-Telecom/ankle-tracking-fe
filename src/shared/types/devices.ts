export enum DeviceStatus {
  Offline = 7,
  Online = 8,
  Pending = 9,
  HeartbeatMissed = 10,
  Isolated = 11
}

export interface NewDevice {
  id: string;
  name: string;
  description: string;
  ipAddress: string;
  macAddress: string;
  firmware: string;
  wifiStandard: string;
  model: string;
  manufacturerDate: string;
  url: string;
  username: string;
  password: string;
  clientId: string;
  Id: string;
  clientSecret: string;
  partnerId: number;
  regionId: string;
  lat?: number | string;
  lng?: number | string;
  location?: number[] | string[] | null
}




export interface DeviceConfig {
  id: number;
  key_conf: string;
  region_id: string;
  partner_id: number;
  status_id: number;
  deleted_date: string | null;
  modified_date: string | null;
  username: string | null;
  password: string | null;
  client_id: string | null;
  client_secret: string | null;
  url: string | null;
}
export interface DeviceDetail {
  ip_address: string;
  mac_address: string;
  firmware: string;
  wifi_standard: string;
  manufacturer_date: string | null;
  model: string;
  cpu_util: number | null;
  mem_util: number | null;
  up_time: number | null;
}

export interface DataDevice {
  id: string;
  name: string;
  description: string;
  ip_address: string;
  mac_address: string;
  firmware: string;
  wifi_standard: string;
  model: string;
  manufacturer_date: string | Date | null;
  site_id: string;
  site_address: string;
  site_country: string;
  site_lat: string;
  site_long: string;
  site_name: string;
  status_id: number;
  type: string;
  device_lat: number;
  device_lng: number;
  floorId: string;
  detail: DeviceDetail;
  partner_id?: number
}


export interface DeviceLog {
  id: number;
  device_name: string;
  device_type: 'AP' | 'SW';
  ip_address: string;
  location: string;
  disconnected_at: string; // ISO string or formatted date
  reconnected_at: string | null;
  downtime_duration: string; // e.g. "5m 30s"
  status: 'online' | 'offline';
}

export interface DataDeviceDiagram {
  id: number
  total_gateway_num: number
  connected_gateway_num: number
  disconnected_gateway_num: number
  total_switch_num: number
  connected_switch_num: number
  disconnected_switch_num: number
  total_ports: number
  available_ports: number
  power_consumption: number
  total_ap_num: number
  connected_ap_num: number
  isolated_ap_num: number
  disconnected_ap_num: number
  total_client_num: number
  wired_client_num: number
  wireless_client_num: number
  guest_num: number
  site_id: string
  region_id: string
}


export interface TrafficActivity {
  time: string;
  txData: number;
  dxData: number;
}

export interface DataDeviceTraffic {
  apTrafficActivities: TrafficActivity[];
  switchTrafficActivities: TrafficActivity[];
}