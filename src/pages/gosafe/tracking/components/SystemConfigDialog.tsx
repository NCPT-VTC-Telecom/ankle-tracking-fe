import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Grid,
  RadioGroup,
  Radio,
  Checkbox,
  Divider,
  Box,
  Chip,
  alpha,
  Tooltip,
} from '@mui/material';
import { Cpu, VolumeHigh, Map, Sms, Wifi, WifiSquare } from 'iconsax-react';
import { enqueueSnackbar } from 'notistack';
import type { TrackingStore } from '../useTracking';

interface SystemConfigDialogProps {
  open: boolean;
  onClose: () => void;
  store: TrackingStore;
  primaryColor: string;
  isDark: boolean;
}

export default function SystemConfigDialog({ open, onClose, store, primaryColor, isDark }: SystemConfigDialogProps) {
  const { soundEnabled, setSoundEnabled, followDevice, setFollowDevice, syncInterval, setSyncInterval, sseStatus, sseLastUpdate } = store;

  const sseConnected = sseStatus === 'connected';
  const sseLabel: Record<typeof sseStatus, string> = {
    idle:        'Chưa kết nối',
    connecting:  'Đang kết nối...',
    connected:   'Đang kết nối',
    disconnected:'Mất kết nối — đang thử lại',
    unsupported: 'Trình duyệt không hỗ trợ',
  };
  const sseColor: Record<typeof sseStatus, string> = {
    idle:        '#64748b',
    connecting:  '#f59e0b',
    connected:   '#22c55e',
    disconnected:'#ef4444',
    unsupported: '#ef4444',
  };

  // Local settings states (can be backed by local storage or just state-driven mockup for visual mapping)
  const [alarmVolume, setAlarmVolume] = useState<number>(80);
  const [mapStyle, setMapStyle] = useState<string>('vector');
  const [emailAlert, setEmailAlert] = useState<boolean>(true);
  const [smsAlert, setSmsAlert] = useState<boolean>(false);
  const [showBorderFlash, setShowBorderFlash] = useState<boolean>(true);

  const handleSave = () => {
    enqueueSnackbar('Cập nhật cấu hình hệ thống thành công!', { variant: 'success' });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: isDark ? '#0f172a' : '#ffffff',
          backgroundImage: 'none',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }
      }}
    >
      <DialogTitle sx={{ p: 2.5, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Cpu size={22} color={primaryColor} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', fontSize: '1rem' }}>
            Cấu hình hệ thống
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, py: 1 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Section 1: Alerts & Sound */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <VolumeHigh size={18} color={primaryColor} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                Cảnh báo & Âm thanh
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} size="small" color="primary" />
                  }
                  label={<Typography variant="body2">Phát còi cảnh báo vi phạm</Typography>}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch checked={showBorderFlash} onChange={(e) => setShowBorderFlash(e.target.checked)} size="small" color="primary" />
                  }
                  label={<Typography variant="body2">Chớp viền đỏ khi vi phạm</Typography>}
                />
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={0.5} sx={{ px: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Âm lượng còi cảnh báo ({alarmVolume}%)
                  </Typography>
                  <Slider
                    value={alarmVolume}
                    onChange={(_, val) => setAlarmVolume(val as number)}
                    size="small"
                    min={10}
                    max={100}
                    valueLabelDisplay="auto"
                  />
                </Stack>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Section 2: Monitoring & Map */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <Map size={18} color={primaryColor} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                Giám sát & Bản đồ
              </Typography>
            </Stack>

            {/* SSE Status Card */}
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: 1.5,
                border: `1px solid ${alpha(sseColor[sseStatus], 0.3)}`,
                bgcolor: alpha(sseColor[sseStatus], 0.06),
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  {sseConnected
                    ? <Wifi size={16} color={sseColor[sseStatus]} />
                    : <WifiSquare size={16} color={sseColor[sseStatus]} />
                  }
                  <Typography variant="body2" sx={{ fontWeight: 600, color: sseColor[sseStatus] }}>
                    Kết nối SSE real-time
                  </Typography>
                  <Chip
                    label={sseLabel[sseStatus]}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      bgcolor: alpha(sseColor[sseStatus], 0.15),
                      color: sseColor[sseStatus],
                      border: `1px solid ${alpha(sseColor[sseStatus], 0.3)}`,
                    }}
                  />
                </Stack>
                {sseLastUpdate && (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Cập nhật: {sseLastUpdate.toLocaleTimeString('vi-VN')}
                  </Typography>
                )}
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                {sseConnected
                  ? 'Dữ liệu GPS được đẩy từ server ngay khi có — không cần polling.'
                  : 'Đang dùng polling làm fallback. Hệ thống sẽ tự chuyển sang SSE khi kết nối lại.'}
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch checked={followDevice} onChange={(e) => setFollowDevice(e.target.checked)} size="small" color="primary" />
                  }
                  label={<Typography variant="body2">Bám theo thiết bị đang chọn</Typography>}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Tooltip
                  title={sseConnected ? 'SSE đang hoạt động — polling tạm ngưng' : 'Chu kỳ polling khi SSE không khả dụng'}
                  placement="top"
                  arrow
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%', opacity: sseConnected ? 0.45 : 1 }}>
                    <Typography variant="body2" sx={{ mr: 1, whiteSpace: 'nowrap' }}>
                      Chu kỳ fallback:
                    </Typography>
                    <RadioGroup
                      row
                      value={syncInterval}
                      onChange={(e) => setSyncInterval(Number(e.target.value))}
                    >
                      <FormControlLabel value={10} control={<Radio size="small" disabled={sseConnected} />} label={<Typography variant="caption">10s</Typography>} />
                      <FormControlLabel value={30} control={<Radio size="small" disabled={sseConnected} />} label={<Typography variant="caption">30s</Typography>} />
                      <FormControlLabel value={60} control={<Radio size="small" disabled={sseConnected} />} label={<Typography variant="caption">60s</Typography>} />
                    </RadioGroup>
                  </Stack>
                </Tooltip>
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Kiểu bản đồ mặc định:
                  </Typography>
                  <RadioGroup row value={mapStyle} onChange={(e) => setMapStyle(e.target.value)}>
                    <FormControlLabel
                      value="vector"
                      control={<Radio size="small" />}
                      label={<Typography variant="body2">Đường bộ</Typography>}
                    />
                    <FormControlLabel
                      value="satellite"
                      control={<Radio size="small" />}
                      label={<Typography variant="body2">Vệ tinh</Typography>}
                    />
                    <FormControlLabel
                      value="terrain"
                      control={<Radio size="small" />}
                      label={<Typography variant="body2">Địa hình</Typography>}
                    />
                  </RadioGroup>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Section 3: Notification Channels */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <Sms size={18} color={primaryColor} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                Kênh liên lạc sự kiện khẩn cấp
              </Typography>
            </Stack>

            <Stack direction="row" spacing={3}>
              <FormControlLabel
                control={<Checkbox checked={emailAlert} onChange={(e) => setEmailAlert(e.target.checked)} size="small" />}
                label={<Typography variant="body2">Gửi Email khi có vi phạm</Typography>}
              />
              <FormControlLabel
                control={<Checkbox checked={smsAlert} onChange={(e) => setSmsAlert(e.target.checked)} size="small" />}
                label={<Typography variant="body2">Gửi SMS khẩn cấp tới Admin</Typography>}
              />
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1.5, gap: 1 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={onClose}
          sx={{ borderRadius: 1.5, fontWeight: 700, px: 3, textTransform: 'none' }}
        >
          Hủy
        </Button>
        <Button variant="contained" onClick={handleSave} sx={{ borderRadius: 1.5, fontWeight: 700, px: 3, textTransform: 'none' }}>
          Lưu cấu hình
        </Button>
      </DialogActions>
    </Dialog>
  );
}
