export type PartnerData = {
  id: number;
  name: string;
  description: string;
  address: string;
  country: string;
  phone_number: string;
  type: 'ads' | 'devices';
  from_date?: string | null;
  expired_date?: string | null;
  site_id: string;
};

export type NewPartner = {
  id: number;
  name: string;
  description: string;
  address: string;
  country: string;
  phoneNumber: string;
  type: 'ads' | 'devices';
  fromDate?: string | Date;
  expiredDate?: string | Date;
  siteId: string;
  partnerAdAccessId?: string
};
