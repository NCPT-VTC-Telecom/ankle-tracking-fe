export interface NewSites {
  id: string;
  name: string;
  address: string;
  country: string;
  latLocation: string | number;
  longLocation: string | number;
  location?: number[] | string[] | null

}

export interface DataSites {
  id: string;
  name: string;
  address: string;
  country: string;
  lat_location: string;
  long_location: string;
  status_id: number;
  time_zone: string;
  scenario: string;
  region: any
}

export interface Site {
  id: string;
  name: string;
  status_id: number;
  type: number;
  site_id_hardware: string;
  region_id: string;
  modified_date: any;
}
