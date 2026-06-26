export interface Role {
  id: number;
  title: string;
  description: string;
  permission: string;
  level: number;
  access: string;
  status_id: number;
  parent_id: number;
  deleted_date: any;
  modified_date: any;
  created_date: string;
}
