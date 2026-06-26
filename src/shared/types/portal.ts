export interface NewPortal {
  id: string;
  name: string;
  enable: string;
  ssidList: string[];
  networkList: any[]; // Specify more detailed type if available
  authType: number;
  customTimeout?: number;
  customTimeoutUnit?: number;
  httpsRedirectEnable?: string;
  landingPage?: number;
  landingUrlScheme?: string;
  landingUrl?: string;
  enabledTypes?: number[];
  password?: string;
  hostType?: number;
  serverIp?: string[];
  serverPort?: number;
  serverUrlScheme?: string;
  serverUrl?: string;
  radiusProfileId?: string;
  externalRadiusAuthMode?: number;
  nasId?: string;
  portalCustom?: number;
  externalUrlScheme?: string;
  externalUrl?: string;
  disconnectReq?: string;
  receiverPort?: number;
  dailyLimitEnable?: string;
  siteId: string;
}

export interface DataPortal {
  id: string;
  name: string;
  enable: string;
  ssid_list: string[];
  network_list: any[]; // Specify more detailed type if available
  auth_type: number;
  custom_timeout?: number;
  custom_timeout_unit?: number;
  https_redirect_enable?: string;
  landing_page?: number;
  landing_url_scheme?: string;
  landing_url?: string;
  enabled_types?: number[];
  password?: string;
  external_portal_host_type?: number;
  external_portal_server_ip?: string[];
  external_portal_server_port?: number;
  external_portal_server_url_scheme?: string;
  external_portal_server_url?: string;
  external_radius_radius_profile_id?: string;
  external_radius_auth_mode?: number;
  external_radius_nas_id?: string;
  no_auth_daily_limit_enable?: string;
  external_radius_external_url_scheme?: string;
  external_radius_external_url?: string[];
  external_radius_disconnect_req?: string;
  external_radius_portal_custom?: number;
  external_radius_receiver_port?: number;
  site_id: string;
}

// enum AuthType {
//   NoAuthentication = 0,
//   SimplePassword = 1,
//   ExternalRadiusServer = 2,
//   ExternalPortalServer = 3,
//   Hotspot = 4
// }

// enum CustomTimeoutUnit {
//   Minute = 1,
//   Hour = 2,
//   Day = 3
// }

// enum HostType {
//   IP = 1,
//   URL = 2
// }

// enum ExternalRadiusAuthMode {
//   PAP = 1,
//   CHAP = 2
// }

// enum PortalCustom {
//   LocalWebPortal = 1,
//   ExternalWebPortal = 2
// }

// enum LandingPage {
//   OriginalURL = 1,
//   PromotionalURL = 2
// }
