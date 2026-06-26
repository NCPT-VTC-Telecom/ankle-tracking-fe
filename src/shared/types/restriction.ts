export interface BlackListDomainData {
  id: number;
  name: string;
  url: string;
  ip_address: string;
  ipv6_address: string;
  dns_address: string;
  reason: string;
  category: Category;
  created_date: string | Date | null;
}

interface Category {
  id: number;
  name: string;
  code: string;
  description: string;
  status_id: number;
  deleted_date: string | Date | null;
  created_date: string | Date | null;
  modified_date: string | Date | null;
}

export interface NewBlackListDomain {
  id: number;
  name: string;
  url: string;
  ipAddress: string;
  ipv6Address: string;
  dnsAddress: string;
  reason: string;
  categoryId: number;
}

export interface BlackListDeviceData {
  id: number;
  device_name: string;
  ip_address: string;
  ipv6_address: string;
  mac_address: string;
  reason: string;
  status_id: number;
}

export interface NewBlackListDevice {
  id: number;
  name: string;
  filterMode: string;
  type: number;
  macAddresses: string[];
  macGroupIds: string[];
  siteId: string;
  regionId: string;
}
