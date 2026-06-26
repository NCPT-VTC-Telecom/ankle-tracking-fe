export interface EndUserData {
  id: string;
  fullname: string;
  email: string;
  phone_number: string;
  gender: string | null;
  citizen_id: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  country: string;
  postcode: string;
  username: string;
  password: string;
  user_group: number[];
  user_group_lv2: number[];
  user_group_lv3: number[];
  status_id: number;
  total_spending: number;
  sites: string[];
  ssids: string[];
  modified_date: string;
  deleted_date: string | null;
  wlans: number[]
  ads: number[]
}

export interface NewUser extends EditUser {
  username: string;
  password: string;
  //required: fullname, email, phoneNumber, username,password
}

export interface EditUser {
  id: string;
  fullname: string;
  email: string;
  phoneNumber: string;
  citizenId: string;
  gender: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  country: string;
  postcode: string;
  userGroupId: number[];
  userGroupIdLv2: number[];
  userGroupIdLv3: number[];
}

//Role
export interface RoleData {
  id: number;
  title: string;
  description: string;
  permission: any;
  permission_level2: number[];
  permission_level3: number[];
  status_id?: number;
  access?: string;
}

export interface NewRole {
  id: number;
  title: string;
  description: string;
  permission: any;
  permission_level2: number[];
  permission_level3: number[];
  //required: all field
}

//Session
export interface SessionDetails {
  id: string;
  start_time: string;
  stop_time: string;
  duration_time: number;
  user_ip_address: string;
  user_mac_address: string;
  data_usage_mb: number;
  average_speed_mbps: number;
  bytes_transferred: number;
  bytes_received: number;
  url: string;
  destination_ip: string;
  connection_quality: string;
  domain: string;
  port: string;
  user_agent: string;
  referrer: string;
  response_time_ms: number;
  ssl_version: string;
  protocol: string;
  status_id: number;
  session_id: string;
  total_data_usage: number;
  total_data_upload: number;
  total_data_download: number;
  total_time_usage_hour: number;
}

export interface Device {
  id: string;
  type_id: number;
  aircraft_id: number;
  name: string;
  description: string;
  date_of_manufacture: string;
  placement_location: string;
  activation_date: string;
  deactivation_date: string;
  maintenance_schedule_start: string | null;
  maintenance_schedule_end: string | null;
  status_id: number;
  deleted_date: string | null;
  modified_date: string | null;
}

export interface Product {
  id: number;
  price_id: number;
  image_link: string;
  title: string;
  description: string;
  type: string;
  total_time: number;
  bandwidth_upload: number;
  bandwidth_download: number;
  data_total: number;
  data_upload: number;
  data_download: number;
  status_id: number;
  deleted_date: string | null;
  modified_date: string;
  created_date: string;
}

//Auth
export interface ChangePasswordUser {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export interface SessionGeneral {
  id: string;
  flight_id: number;
  total_data_usage: number;
  total_data_upload: number;
  total_data_download: number;
  total_time_usage_hour: number;
  acct_session_id: string;
  acct_multisession_id: string;
  session_status: string;
  terminate_reason: string | null;
  user_mac_address: string;
  user_ip_address: string | null;
  user_device: string;
  modified_date: string;
  created_date: string;
  user: EndUserData;
  device: Device;
  product: Product;
}

export interface ActivitiesWiFi {
  id: number;
  mac_address: string;
  ip_address: string;
  device_id: string;
  login_status: string;
  login_failed_reason: null;
  browser: string;
  os: string;
  device: string;
  created_date: string | Date;
  site_id: string;
  click_number: number;
  login_type: string;
}


