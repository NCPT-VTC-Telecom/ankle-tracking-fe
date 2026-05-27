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
  Box
} from '@mui/material';
import { Cpu, VolumeHigh, Map, Sms } from 'iconsax-react';
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
  const { soundEnabled, setSoundEnabled, followDevice, setFollowDevice, syncInterval, setSyncInterval } = store;

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
                <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Chu kỳ đồng bộ:
                  </Typography>
                  <RadioGroup row value={syncInterval} onChange={(e) => setSyncInterval(Number(e.target.value))}>
                    <FormControlLabel value={10} control={<Radio size="small" />} label={<Typography variant="caption">10s</Typography>} />
                    <FormControlLabel value={30} control={<Radio size="small" />} label={<Typography variant="caption">30s</Typography>} />
                    <FormControlLabel value={60} control={<Radio size="small" />} label={<Typography variant="caption">60s</Typography>} />
                  </RadioGroup>
                </Stack>
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
