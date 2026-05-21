import {
  Stack, Typography, Button, Alert, Divider, Switch,
  FormControlLabel, List, ListItem, ListItemText, Chip,
} from '@mui/material';
import { VolumeHigh, VolumeCross } from 'iconsax-react';
import type { TrackingStore } from '../useTracking';

interface Props { store: TrackingStore }

export default function NotificationList({ store }: Props) {
  const {
    isDark, devices, logs, setLogs,
    soundEnabled, setSoundEnabled,
    syncMinutesMap,
  } = store;

  const lowBattery  = devices.filter((d) => d.status.battery < 20);
  const offline     = devices.filter((d) => d.status.connectionStatus === 'offline');
  const longNoSync  = devices.filter((d) => (syncMinutesMap[d.id] ?? 0) > 30);
  const hasAlerts   = lowBattery.length > 0 || offline.length > 0 || longNoSync.length > 0;

  return (
    <Stack spacing={2}>
      {/* System alerts */}
      {hasAlerts && (
        <Stack spacing={1}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Cảnh báo hệ thống:</Typography>
          {lowBattery.map((d) => (
            <Alert key={d.id} severity="error" sx={{ borderRadius: 2.5, py: 0.4 }}>
              <b>{d.name}</b>: Pin còn {d.status.battery}% — Cần sạc gấp!
            </Alert>
          ))}
          {offline.map((d) => (
            <Alert key={d.id} severity="error" sx={{ borderRadius: 2.5, py: 0.4 }}>
              <b>{d.name}</b>: Mất kết nối máy chủ!
            </Alert>
          ))}
          {longNoSync.map((d) => (
            <Alert key={d.id} severity="warning" sx={{ borderRadius: 2.5, py: 0.4 }}>
              <b>{d.name}</b>: Không đồng bộ trong {syncMinutesMap[d.id]} phút!
            </Alert>
          ))}
          <Divider />
        </Stack>
      )}

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Nhật ký sự kiện</Typography>
        <Button variant="text" size="small" color="error" onClick={() => setLogs([])} sx={{ fontWeight: 700 }}>
          Xóa tất cả
        </Button>
      </Stack>

      <FormControlLabel
        control={<Switch checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} size="small" />}
        label={
          <Stack direction="row" spacing={0.8} alignItems="center">
            {soundEnabled ? <VolumeHigh size="15" /> : <VolumeCross size="15" />}
            <Typography variant="body2">Phát còi cảnh báo</Typography>
          </Stack>
        }
      />

      <List disablePadding>
        {logs.map((log) => (
          <ListItem key={log.id} disableGutters sx={{
            p: 1.5, mb: 1, borderRadius: 2.5,
            bgcolor:
              log.type === 'warning' ? (isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2')
              : log.type === 'success' ? (isDark ? 'rgba(34,197,94,0.1)' : '#f0fdf4')
              : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
            borderLeft: '4px solid',
            borderColor: log.type === 'warning' ? '#ef4444' : log.type === 'success' ? '#22c55e' : '#64748b',
          }}>
            <ListItemText
              primary={
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>🕒 {log.time}</Typography>
                  {log.type === 'warning' && (
                    <Chip label="Báo động" color="error" size="small" sx={{ height: 16, fontSize: '0.65rem', fontWeight: 700 }} />
                  )}
                </Stack>
              }
              secondary={
                <Typography variant="body2" sx={{
                  color: isDark ? '#e2e8f0' : '#1e293b',
                  fontWeight: log.type === 'warning' ? 600 : 400,
                }}>
                  {log.message}
                </Typography>
              }
            />
          </ListItem>
        ))}
        {logs.length === 0 && (
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 4 }}>
            Nhật ký trống.
          </Typography>
        )}
      </List>
    </Stack>
  );
}
