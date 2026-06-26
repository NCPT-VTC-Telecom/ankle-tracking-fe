export type NotificationType = 'error' | 'warning' | 'info';

export interface NotificationDataInterface {
  id: number
  is_read: boolean
  read_at: any
  created_date: string
  title: string
  type: NotificationType
  content: string
  navigate_url: string
}
