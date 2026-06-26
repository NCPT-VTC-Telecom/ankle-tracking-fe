// Topology Types for Network Visualization
// Hierarchy: Region → Controller → Site → AP → Client

export interface BandwidthUsage {
  upload_mbps: number;
  download_mbps: number;
  total_mbps: number;
}

export interface ChannelInfo {
  frequency: string; // "2.4GHz" or "5GHz"
  channel_number: number;
  channel_width: string; // "20MHz", "40MHz", "80MHz"
}

export interface ConnectionQuality {
  rssi: number; // Signal strength in dBm
  snr: number; // Signal-to-noise ratio
  tx_rate_mbps: number;
  rx_rate_mbps: number;
  retries: number; // Percentage
  packet_loss: number; // Percentage
}

export interface ClientBandwidth extends BandwidthUsage {
  total_bytes_sent: number;
  total_bytes_received: number;
}

export interface ConnectedClient {
  client_id: string;
  device_name: string;
  mac_address: string;
  ip_address: string;
  hostname?: string;
  manufacturer?: string;
  device_type: 'mobile' | 'laptop' | 'tablet' | 'iot' | 'unknown';
  os?: string;
  signal_strength: number; // dBm
  connection_time: string; // ISO 8601 timestamp
  session_duration_seconds: number;
  bandwidth: ClientBandwidth;
  ssid: string;
  connection_quality: ConnectionQuality;
}

export interface SSIDInfo {
  ssid_id: string;
  ssid_name: string;
  client_count: number;
  encryption: string; // "WPA2-Enterprise", "WPA2-PSK", etc.
}

export interface APHealth {
  cpu_usage: number; // Percentage
  memory_usage: number; // Percentage
  uptime_seconds: number;
  temperature_celsius: number;
}

export interface APConnections {
  total_clients: number;
  active_clients: number;
  max_clients: number;
  bandwidth_usage: BandwidthUsage;
  channel: ChannelInfo;
}

export interface AccessPoint {
  id: string;
  name: string;
  mac_address: string;
  ip_address: string;
  model: string;
  status: 'online' | 'offline' | 'pending' | 'hearbeat_missed' | 'isolated';
  floor: string;
  site_id: string;
  controller_id: string;
  location: {
    lat: number;
    lng: number;
  };
  connections: APConnections;
  ssids: SSIDInfo[];
  health: APHealth;
  connected_clients?: ConnectedClient[];
}

export interface TopologySite {
  id: string;
  name: string;
  controller_id: string;
  region_id: string;
  address: string;
  total_aps: number;
  online_aps: number;
  total_clients: number;
  access_points: AccessPoint[];
}

export interface Controller {
  id: string;
  name: string;
  ip_address: string;
  status: 'online' | 'offline' | 'degraded';
  region_id: string;
  connected_sites_count: number;
  total_aps: number;
  total_clients: number;
  sites: TopologySite[];
}

export interface Region {
  id: string;
  name: string;
  controllers: Controller[];
}

export interface TopologySummary {
  total_regions: number;
  total_controllers: number;
  total_sites: number;
  total_aps: number;
  online_aps: number;
  offline_aps: number;
  pending_aps: number;
  isolated_aps: number;
  total_clients: number;
  total_bandwidth_mbps: number;
  average_clients_per_ap: number;
}

export interface TopologyData {
  regions: Region[];
  summary: TopologySummary;
}

export interface TopologyResponse {
  code: number;
  message: string;
  data: {
    topology: TopologyData;
    timestamp: string;
  };
}

// Query Parameters
export interface TopologyQueryParams {
  regionId?: string;
  controllerId?: string;
  siteId?: string;
  includeClients?: boolean;
  realtime?: boolean;
}

// Simplified endpoints responses
export interface RegionSummary {
  id: string;
  name: string;
  controller_count: number;
  site_count: number;
  ap_count: number;
  client_count: number;
}

export interface ControllerSummary {
  id: string;
  name: string;
  region_id: string;
  site_count: number;
  ap_count: number;
  client_count: number;
}

export interface TopologySiteSummary {
  id: string;
  name: string;
  controller_id: string;
  ap_count: number;
  client_count: number;
}

// Pagination for client list
export interface ClientPagination {
  total: number;
  page: number;
  pageSize: number;
}

export interface APClientsResponse {
  code: number;
  data: {
    ap_info: {
      id: string;
      name: string;
      mac_address: string;
    };
    clients: ConnectedClient[];
    pagination: ClientPagination;
  };
}
