export type ProviderData = {
  id: string;
  name: string;
  description: string;
  address: string;
  contact: string;
  type: string;
  status_id: number;
  created_date: string | Date | null;
};

export type NewProvider = {
  id: string;
  name: string;
  description: string;
  address: string;
  contact: string;
  type: string;
  status: string | number;
};
