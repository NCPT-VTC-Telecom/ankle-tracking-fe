import { WLANData } from "./wlan";

export interface NewSSID {
  id: number;
  name: string;
  type: string;
  partnerId: number;
  siteId: string;
  deviceId: string;
  deviceType: number;
  band: number;
  guestNetEnable: 'true' | 'false';
  security: SSIDSecurityMode;
  broadcast: string;
  vlanEnable: 'true' | 'false';
  vlanId?: number;
  mIoEnable: 'true' | 'false';
  pmfMode: PMFMode;
  enable11r: 'true' | 'false';
  hidePwd: 'true' | 'false';
  greEnable: 'true' | 'false';
  wlanId: string;
}

export enum SSIDSecurityMode {
  None = 0,
  WPAEnterprise = 2,
  WPAPersonal = 3,
  PPSKWithoutRADIUS = 4,
  PPSKWithRADIUS = 5
}

export enum PMFMode {
  Mandatory = 1,
  Capable = 2,
  Disable = 3
}

export enum band {
  Two = 0,
  Five = 1,
  Six = 3,
  TwoFiveSix = 7
}

export interface SSIDData {
  id: number;
  name: string;
  type: string | null;
  partner_id: number | null;
  status_id: number;
  site_id: string;
  device_id: string | null;
  band: number;
  ssid_hardware_id: string | null;
  guest_net_enable: 'true' | 'false';
  security: number;
  broadcast: 'true' | 'false';
  vlan_enable: 'true' | 'false';
  vlan_id: number | null;
  mlo_enable: 'true' | 'false' | null;
  pmf_mode: number | null;
  enable_11r: 'true' | 'false' | null;
  hide_pwd: 'true' | 'false' | null;
  gre_enable: 'true' | 'false' | null;
  device_type: number | null;
  wlan_id: string | null;
  client_rate_limit_profile_id: number | null;
  ssid_rate_limit_profile_id: number | null;
  multi_cast_enable: 'true' | 'false' | null;
  multi_cast_channel_util: number | null;
  multi_cast_arp_cast_enable: 'true' | 'false' | null;
  multi_cast_ipv6_cast_enable: 'true' | 'false' | null;
  multi_cast_filter_enable: 'true' | 'false' | null;
  multi_cast_filter_mode: number | null;
  multi_cast_filter_mac_group_Id: string | null;
  site: Site;
  wlan: WLANData
  // device: Device | null;
  // partner: Partner | null;
}

interface Site {
  id: string;
  name: string;
  status_id: number;
  type: number;
  site_id_hardware: string;
  region_id: string;
  modified_date: string;
}
