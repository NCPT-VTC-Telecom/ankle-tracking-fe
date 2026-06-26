import dayjs from 'dayjs';

export function formatDateTime(timestamp: number) {
  return dayjs(timestamp).format('HH:mm, DD/MM/YYYY');
}
export function formatFullDateTime(timestamp: number) {
  return dayjs(timestamp).format('HH:mm:ss, DD/MM/YYYY');
}
