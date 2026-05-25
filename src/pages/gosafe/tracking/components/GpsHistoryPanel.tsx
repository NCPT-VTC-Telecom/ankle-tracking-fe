import { useState, useMemo } from 'react';
import {
  Box,
  Stack,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Switch,
  FormControlLabel,
  LinearProgress,
  IconButton,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Chip
} from '@mui/material';
import { Clock, ArrowLeft2, ArrowRight2, ReceiptSearch, Location, Danger, SearchNormal1, Gps } from 'iconsax-react';
import { CircularProgress } from '@mui/material';
import type { TrackingStore } from '../useTracking';

interface Props {
  store: TrackingStore;
}

export default function GpsHistoryPanel({ store }: Props) {
  const {
    isDark,
    primaryColor,
    historyState,
    historyVisible,
    setHistoryVisible,
    historyFilters,
    setHistoryFilters,
    loadDeviceHistory,
    selectedDevice: dev,
    setMapCenter,
    setMapZoom
  } = store;

  const [localSearch, setLocalSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'moving' | 'stationary' | 'events' | 'nogps'>('all');
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  const hs = dev ? historyState[dev.id] : null;
  const hd = hs?.data;

  const filteredPoints = useMemo(() => {
    if (!hd?.items) return [];
    return hd.items.filter((pt) => {
      // 1. Text Search Filter
      if (localSearch) {
        const query = localSearch.toLowerCase();
        const ptDate = new Date(pt.timestamp)
          .toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            hour12: false
          })
          .toLowerCase();
        const latLngStr = `${pt.lat.toFixed(6)}, ${pt.lng.toFixed(6)}`;
        const speedStr = `${pt.speed ?? 0} km/h`;
        const eventStr = pt.eventName?.toLowerCase() ?? '';

        if (!ptDate.includes(query) && !latLngStr.includes(query) && !speedStr.includes(query) && !eventStr.includes(query)) {
          return false;
        }
      }

      // 2. Tab/Type Filter
      const speed = pt.speed ?? 0;
      if (filterType === 'moving') return speed > 2;
      if (filterType === 'stationary') return speed <= 2;
      if (filterType === 'events') return !!pt.eventName || pt.gpsFix === false;
      if (filterType === 'nogps') return pt.gpsFix === false;

      return true;
    });
  }, [hd?.items, localSearch, filterType]);

  if (!dev) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Vui lòng chọn một thiết bị để xem lịch sử GPS.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5}>
      <Divider sx={{ my: 0.5 }} />

      <Stack direction="row" alignItems="center" spacing={1}>
        <ReceiptSearch size="18" color={primaryColor} />
        <Typography variant="caption" sx={{ fontWeight: 700, color: primaryColor, textTransform: 'uppercase', letterSpacing: 0.4 }}>
          Lịch sử GPS
        </Typography>
      </Stack>

      {/* Date range */}
      <Stack direction="row" spacing={1}>
        <TextField
          label="Từ ngày"
          type="date"
          size="small"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={historyFilters.from}
          onChange={(e) => setHistoryFilters((f) => ({ ...f, from: e.target.value }))}
          onClick={(e) => e.stopPropagation()}
          sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
        />
        <TextField
          label="Đến ngày"
          type="date"
          size="small"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={historyFilters.to}
          onChange={(e) => setHistoryFilters((f) => ({ ...f, to: e.target.value }))}
          onClick={(e) => e.stopPropagation()}
          sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
        />
      </Stack>

      {/* Limit + Load */}
      <Stack direction="row" spacing={1} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Số bản ghi</InputLabel>
          <Select
            value={historyFilters.limit}
            label="Số bản ghi"
            onChange={(e) => setHistoryFilters((f) => ({ ...f, limit: Number(e.target.value) }))}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
            <MenuItem value={200}>200</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          fullWidth
          size="small"
          startIcon={hs?.loading ? <CircularProgress size={13} color="inherit" /> : <Clock size="18" />}
          disabled={hs?.loading}
          onClick={(e) => {
            e.stopPropagation();
            loadDeviceHistory(dev);
          }}
          sx={{ borderRadius: 2, fontWeight: 700, py: 0.9 }}
        >
          {hs?.loading ? 'Đang tải...' : 'Tải lịch sử'}
        </Button>
      </Stack>

      {hs?.loading && <LinearProgress sx={{ borderRadius: 0.5 }} />}

      {hs?.error && (
        <Alert severity="error" sx={{ borderRadius: 1.5, py: 0.3, fontSize: '0.78rem' }}>
          {hs.error}
        </Alert>
      )}

      {hd && !hs?.loading && (
        <Stack spacing={1}>
          <Alert severity="success" sx={{ borderRadius: 1.5, py: 0.3, fontSize: '0.78rem' }}>
            Đã tải <b>{hd.items.length}</b> điểm / tổng <b>{hd.total}</b>
            {hd.totalPages > 1 && ` — trang ${hd.page}/${hd.totalPages}`}
          </Alert>

          <FormControlLabel
            sx={{ my: 0 }}
            control={
              <Switch
                size="small"
                color="warning"
                checked={historyVisible[dev.id] ?? false}
                onChange={(e) => {
                  e.stopPropagation();
                  setHistoryVisible((prev) => ({ ...prev, [dev.id]: e.target.checked }));
                }}
              />
            }
            label={<Typography variant="body2">Hiển thị trên bản đồ</Typography>}
          />

          {/* Quick stats */}
          {hd.items.length > 0 &&
            (() => {
              const first = hd.items[0];
              const last = hd.items[hd.items.length - 1];
              const maxSpd = Math.max(...hd.items.map((p) => p.speed ?? 0));
              return (
                <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: 1.5, p: 1.5 }}>
                  <Stack spacing={0.6}>
                    {[
                      ['Điểm đầu', new Date(first.timestamp).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false })],
                      ['Điểm cuối', new Date(last.timestamp).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false })],
                      ...(maxSpd > 0 ? [['Tốc độ max', `${maxSpd.toFixed(1)} km/h`]] : [])
                    ].map(([label, value]) => (
                      <Stack key={label} direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          {label}:
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {value}
                        </Typography>
                      </Stack>
                    ))}
                    {(first.batteryVoltage != null || first.externalVoltage != null) && (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          Điện áp (đầu):
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {first.batteryVoltage != null ? `${first.batteryVoltage.toFixed(2)}V` : `${first.externalVoltage?.toFixed(2)}V`}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              );
            })()}

          {/* Local Search and Filter Chips */}
          <Stack spacing={1.2} sx={{ mt: 1 }}>
            <TextField
              size="small"
              placeholder="Lọc nhanh (giờ, tốc độ, sự kiện...)"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchNormal1 size="16" style={{ marginRight: 6, color: '#94a3b8' }} />,
                sx: { borderRadius: 1.5, fontSize: '0.8rem' }
              }}
              fullWidth
            />

            <Box
              sx={{
                display: 'flex',
                gap: 0.8,
                flexWrap: 'wrap',
                mb: 0.5
              }}
            >
              {[
                { label: 'Tất cả', value: 'all' as const },
                { label: 'Di chuyển', value: 'moving' as const },
                { label: 'Đứng yên', value: 'stationary' as const },
                { label: 'Sự kiện', value: 'events' as const },
                { label: 'Mất GPS', value: 'nogps' as const }
              ].map((chip) => {
                const active = filterType === chip.value;
                return (
                  <Chip
                    key={chip.value}
                    label={chip.label}
                    size="small"
                    onClick={() => setFilterType(chip.value)}
                    color={active ? 'primary' : 'default'}
                    variant={active ? 'filled' : 'outlined'}
                    sx={{
                      fontSize: '0.72rem',
                      height: 24,
                      fontWeight: active ? 700 : 500,
                      cursor: 'pointer',
                      borderRadius: 1.5,
                      '&:hover': {
                        bgcolor: active ? undefined : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
                      }
                    }}
                  />
                );
              })}
            </Box>
          </Stack>

          {/* Scrollable list of tracking points */}
          {hd.items.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                Đang hiển thị {filteredPoints.length} / {hd.items.length} điểm
              </Typography>
              <Box
                sx={{
                  maxHeight: 250,
                  overflowY: 'auto',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'
                }}
              >
                {filteredPoints.length > 0 ? (
                  <List disablePadding>
                    {filteredPoints.map((pt, index) => {
                      const ptDate = new Date(pt.timestamp).toLocaleString('vi-VN', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                        hour12: false
                      });
                      const pointId = pt.id || `${pt.timestamp}-${index}`;
                      const isSelected = selectedPointId === pointId;

                      return (
                        <Box key={pointId}>
                          <ListItemButton
                            onClick={() => {
                              setSelectedPointId(pointId);
                              setMapCenter([pt.lat, pt.lng]);
                              setMapZoom(18);
                            }}
                            sx={{
                              py: 1,
                              px: 1.5,
                              gap: 1.5,
                              borderLeft: '4px solid',
                              borderColor: isSelected ? primaryColor : 'transparent',
                              bgcolor: isSelected ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)') : 'transparent',
                              '&:hover': {
                                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
                              },
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {pt.gpsFix === false ? (
                                <Danger size="18" color="#ef4444" variant="Bold" />
                              ) : pt.speed && pt.speed > 10 ? (
                                <Gps size="18" color="#22c55e" variant="Bold" />
                              ) : pt.speed && pt.speed > 2 ? (
                                <Gps size="18" color="#3b82f6" variant="Linear" />
                              ) : (
                                <Location size="18" color="#94a3b8" variant="Bulk" />
                              )}
                            </Box>

                            <ListItemText
                              primary={
                                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 700, fontSize: '0.8rem', color: isDark ? '#f8fafc' : '#0f172a' }}
                                  >
                                    {ptDate}
                                  </Typography>
                                  {pt.eventName && (
                                    <Chip
                                      label={pt.eventName}
                                      color="error"
                                      size="small"
                                      sx={{
                                        height: 16,
                                        fontSize: '0.6rem',
                                        fontWeight: 700,
                                        borderRadius: 1
                                      }}
                                    />
                                  )}
                                  {pt.gpsFix === false && (
                                    <Chip
                                      label="Mất GPS"
                                      color="warning"
                                      size="small"
                                      sx={{
                                        height: 16,
                                        fontSize: '0.6rem',
                                        fontWeight: 700,
                                        borderRadius: 1
                                      }}
                                    />
                                  )}
                                </Stack>
                              }
                              secondary={
                                <Stack spacing={0.3} sx={{ mt: 0.5 }}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: '0.72rem', fontFamily: 'monospace' }}
                                  >
                                    {pt.lat.toFixed(6)}, {pt.lng.toFixed(6)}
                                  </Typography>
                                  <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Typography
                                      variant="caption"
                                      sx={{ fontWeight: 600, color: pt.speed && pt.speed > 10 ? '#22c55e' : 'text.secondary' }}
                                    >
                                      Tốc độ: {pt.speed != null ? `${pt.speed.toFixed(1)} km/h` : '0 km/h'}
                                    </Typography>
                                    {pt.batteryVoltage != null && (
                                      <Typography variant="caption" color="text.secondary">
                                        Pin: {pt.batteryVoltage.toFixed(2)}V
                                      </Typography>
                                    )}
                                    {pt.altitude != null && pt.altitude > 0 && (
                                      <Typography variant="caption" color="text.secondary">
                                        Cao: {pt.altitude.toFixed(0)}m
                                      </Typography>
                                    )}
                                  </Stack>
                                </Stack>
                              }
                            />
                          </ListItemButton>
                          {index < filteredPoints.length - 1 && <Divider />}
                        </Box>
                      );
                    })}
                  </List>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Không tìm thấy điểm phù hợp bộ lọc.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Pagination */}
          {hd.totalPages > 1 && (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
              <IconButton
                size="small"
                disabled={hd.page <= 1 || hs?.loading}
                onClick={(e) => {
                  e.stopPropagation();
                  loadDeviceHistory(dev, hd.page - 1);
                }}
              >
                <ArrowLeft2 size="18" />
              </IconButton>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {hd.page} / {hd.totalPages}
              </Typography>
              <IconButton
                size="small"
                disabled={hd.page >= hd.totalPages || hs?.loading}
                onClick={(e) => {
                  e.stopPropagation();
                  loadDeviceHistory(dev, hd.page + 1);
                }}
              >
                <ArrowRight2 size="18" />
              </IconButton>
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  );
}
