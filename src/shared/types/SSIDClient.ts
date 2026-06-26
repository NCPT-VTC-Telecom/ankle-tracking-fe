
export enum SSIDClientStatus {
  ONLINE = 1,
  OFFLINE = 2,
  BLOCKED = 14,
  UNBLOCK = 15
}

export interface SSIDClientData {
  id: number;
  name: string;
  mac_address: string;
  device_type: string;
  ip_address: string;
  ipv6_list_address: string[];
  connect_type: string;
  connect_dev_type: string;
  connect_to_wireless_router: boolean;
  wireless: boolean;
  ssid: string;
  ssid_information: {
    id: number;
    name: string;
    site_id: string;
  };
  signal_level: string;
  health_score: string;
  signal_rank: number;
  wifi_mode: string;
  ap_name: string;
  ap_mac: string;
  device_information: {
    id: string;
    site_id: string;
    name: string;
    description: string;
    status_id: number;
    region_id: string;
    type: string;
    deleted_date: string | null;
    modified_date: string;
    lat: number;
    lng: number;
  };
  radio_id: number;
  channel: number;
  rx_rate: number;
  tx_rate: number;
  power_save: boolean;
  rssi: number;
  snr: number;
  vid: number;
  dot1x_identity: string;
  activity: number;
  traffic_down: number;
  traffic_up: number;
  uptime: number;
  last_seen: string;
  auth_status: string;
  guest: boolean;
  manager: boolean;
  down_packet: number;
  up_packet: number;
  support5g2: boolean;
  site_information: {
    id: string;
    name: string;
    status_id: number;
    type: number;
    site_id_hardware: string;
    region_id: string;
    modified_date: string | null;
  };
  status_id: SSIDClientStatus;
}