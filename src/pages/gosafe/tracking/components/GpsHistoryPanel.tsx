import {
  Box, Stack, Typography, TextField, FormControl, InputLabel,
  Select, MenuItem, Button, Alert, Switch, FormControlLabel,
  LinearProgress, IconButton, Divider,
} from '@mui/material';
import { Clock, ArrowLeft2, ArrowRight2, ReceiptSearch } from 'iconsax-react';
import { CircularProgress } from '@mui/material';
import { getBatteryColor } from '../utils';
import type { Device } from '../types';
import type { TrackingStore } from '../useTracking';

interface Props {
  dev: Device;
  store: TrackingStore;
}

export default function GpsHistoryPanel({ dev, store }: Props) {
  const {
    isDark, primaryColor,
    historyState, historyVisible, setHistoryVisible,
    historyFilters, setHistoryFilters,
    loadDeviceHistory,
  } = store;

  const hs = historyState[dev.id];
  const hd = hs?.data;

  return (
    <Stack spacing={1.5}>
      <Divider sx={{ my: 0.5 }} />

      <Stack direction="row" alignItems="center" spacing={1}>
        <ReceiptSearch size="16" color={primaryColor} />
        <Typography variant="caption"
          sx={{ fontWeight: 700, color: primaryColor, textTransform: 'uppercase', letterSpacing: 0.4 }}>
          Lịch sử GPS
        </Typography>
      </Stack>

      {/* Date range */}
      <Stack direction="row" spacing={1}>
        <TextField
          label="Từ ngày" type="date" size="small" fullWidth
          InputLabelProps={{ shrink: true }}
          value={historyFilters.from}
          onChange={(e) => setHistoryFilters((f) => ({ ...f, from: e.target.value }))}
          onClick={(e) => e.stopPropagation()}
          sx={{ '& .MuiInputBase-root': { borderRadius: 2.5 } }}
        />
        <TextField
          label="Đến ngày" type="date" size="small" fullWidth
          InputLabelProps={{ shrink: true }}
          value={historyFilters.to}
          onChange={(e) => setHistoryFilters((f) => ({ ...f, to: e.target.value }))}
          onClick={(e) => e.stopPropagation()}
          sx={{ '& .MuiInputBase-root': { borderRadius: 2.5 } }}
        />
      </Stack>

      {/* Limit + Load */}
      <Stack direction="row" spacing={1} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Số bản ghi</InputLabel>
          <Select value={historyFilters.limit} label="Số bản ghi"
            onChange={(e) => setHistoryFilters((f) => ({ ...f, limit: Number(e.target.value) }))}
            sx={{ borderRadius: 2.5 }}>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
            <MenuItem value={200}>200</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" fullWidth size="small"
          startIcon={hs?.loading ? <CircularProgress size={13} color="inherit" /> : <Clock size="15" />}
          disabled={hs?.loading}
          onClick={(e) => { e.stopPropagation(); loadDeviceHistory(dev); }}
          sx={{ borderRadius: 2.5, fontWeight: 700, py: 0.9 }}>
          {hs?.loading ? 'Đang tải...' : 'Tải lịch sử'}
        </Button>
      </Stack>

      {hs?.loading && <LinearProgress sx={{ borderRadius: 1 }} />}

      {hs?.error && (
        <Alert severity="error" sx={{ borderRadius: 2, py: 0.3, fontSize: '0.78rem' }}>
          {hs.error}
        </Alert>
      )}

      {hd && !hs?.loading && (
        <Stack spacing={1}>
          <Alert severity="success" sx={{ borderRadius: 2, py: 0.3, fontSize: '0.78rem' }}>
            Đã tải <b>{hd.items.length}</b> điểm / tổng <b>{hd.total}</b>
            {hd.totalPages > 1 && ` — trang ${hd.page}/${hd.totalPages}`}
          </Alert>

          <FormControlLabel
            sx={{ my: 0 }}
            control={
              <Switch size="small" color="warning"
                checked={historyVisible[dev.id] ?? false}
                onChange={(e) => { e.stopPropagation(); setHistoryVisible((prev) => ({ ...prev, [dev.id]: e.target.checked })); }}
              />
            }
            label={<Typography variant="body2">Hiển thị trên bản đồ</Typography>}
          />

          {/* Quick stats */}
          {hd.items.length > 0 && (() => {
            const first = hd.items[0];
            const last = hd.items[hd.items.length - 1];
            const maxSpd = Math.max(...hd.items.map((p) => p.speed ?? 0));
            return (
              <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: 2, p: 1.5 }}>
                <Stack spacing={0.6}>
                  {[
                    ['Điểm đầu', new Date(first.timestamp).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false })],
                    ['Điểm cuối', new Date(last.timestamp).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false })],
                    ...(maxSpd > 0 ? [['Tốc độ max', `${maxSpd.toFixed(1)} km/h`]] : []),
                  ].map(([label, value]) => (
                    <Stack key={label} direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">{label}:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>{value}</Typography>
                    </Stack>
                  ))}
                  {first.battery != null && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">Pin (đầu):</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: getBatteryColor(first.battery!) }}>
                        {first.battery}%
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Box>
            );
          })()}

          {/* Pagination */}
          {hd.totalPages > 1 && (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
              <IconButton size="small"
                disabled={hd.page <= 1 || hs?.loading}
                onClick={(e) => { e.stopPropagation(); loadDeviceHistory(dev, hd.page - 1); }}>
                <ArrowLeft2 size="16" />
              </IconButton>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {hd.page} / {hd.totalPages}
              </Typography>
              <IconButton size="small"
                disabled={hd.page >= hd.totalPages || hs?.loading}
                onClick={(e) => { e.stopPropagation(); loadDeviceHistory(dev, hd.page + 1); }}>
                <ArrowRight2 size="16" />
              </IconButton>
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  );
}
