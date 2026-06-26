export interface Log {
  id: number;
  user_id: any;
  action_type: string;
  table_name: string;
  request_content: string;
  action_time: string;
  old_data: any;
  new_data: any;
  ipaddress: string;
  user_agent: string;
  response_content: string;
  created_date: string;
}
