import { useState, useMemo } from 'react';
import {
  Box,
  Stack,
  Typography,
  TextField,
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
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [datePreset, setDatePreset] = useState<'today' | 'yesterday' | 'week' | 'custom'>('week');

  const setPreset = (preset: 'today' | 'yesterday' | 'week' | 'custom') => {
    setDatePreset(preset);
    if (preset === 'custom') return;

    const toDate = new Date();
    let fromDate = new Date();

    if (preset === 'today') {
      // today
    } else if (preset === 'yesterday') {
      fromDate.setDate(fromDate.getDate() - 1);
      toDate.setDate(toDate.getDate() - 1);
    } else if (preset === 'week') {
      fromDate.setDate(fromDate.getDate() - 7);
    }

    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setHistoryFilters((f) => ({
      ...f,
      from: formatLocalDate(fromDate),
      to: formatLocalDate(toDate)
    }));
  };

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

      <Box
        sx={{
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          borderRadius: '8px',
          p: 1.25,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.25,
          boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.02)',
          transition: 'all 0.3s ease-in-out'
        }}
      >
        {/* Collapsible Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          sx={{
            cursor: 'pointer',
            '&:hover': { opacity: 0.85 }
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <ReceiptSearch size="22" color={primaryColor} variant="Bold" />
            <Typography
              variant="body1"
              sx={{
                fontWeight: 800,
                color: isDark ? '#f8fafc' : '#0f172a',
                fontSize: '0.975rem',
                letterSpacing: 0.3,
                textTransform: 'uppercase'
              }}
            >
              Cấu hình thời gian
            </Typography>
          </Stack>
          <IconButton size="small" sx={{ color: primaryColor, p: 0.5 }}>
            {isFilterExpanded ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </IconButton>
        </Stack>

        {/* Collapsed view summary (displays fully with largest text!) */}
        {!isFilterExpanded && (
          <Stack spacing={0.75} sx={{ mt: -0.5 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                color: primaryColor,
                fontSize: '1.25rem',
                lineHeight: 1.2
              }}
            >
              {datePreset === 'today' && 'Hôm nay'}
              {datePreset === 'yesterday' && 'Hôm qua'}
              {datePreset === 'week' && '7 ngày qua'}
              {datePreset === 'custom' && 'Tùy chọn thời gian'}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: isDark ? '#e2e8f0' : '#1e293b',
                fontSize: '0.95rem'
              }}
            >
              {`${new Date(historyFilters.from).toLocaleDateString('vi-VN')} - ${new Date(historyFilters.to).toLocaleDateString('vi-VN')}`}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 600, fontSize: '0.825rem' }}
            >
              Tải tối đa:{' '}
              <span style={{ color: isDark ? '#38bdf8' : '#0284c7', fontWeight: 800, fontSize: '0.95rem' }}>
                {historyFilters.limit} bản ghi
              </span>
            </Typography>
          </Stack>
        )}

        {/* Expanded view inputs */}
        {isFilterExpanded && (
          <Stack spacing={1.25}>
            {/* Time Preset Selector */}
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Chọn nhanh thời gian
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[
                  { preset: 'today' as const, label: 'Hôm nay' },
                  { preset: 'yesterday' as const, label: 'Hôm qua' },
                  { preset: 'week' as const, label: '7 ngày' },
                  { preset: 'custom' as const, label: 'Tùy chọn' }
                ].map((p) => {
                  const active = datePreset === p.preset;
                  return (
                    <Chip
                      key={p.preset}
                      label={p.label}
                      onClick={() => setPreset(p.preset)}
                      color={active ? 'primary' : 'default'}
                      variant={active ? 'filled' : 'outlined'}
                      sx={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        height: 28,
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        bgcolor: active ? primaryColor : 'transparent',
                        borderColor: active ? primaryColor : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'),
                        '&:hover': {
                          bgcolor: active ? undefined : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)')
                        }
                      }}
                    />
                  );
                })}
              </Box>
            </Stack>

            {/* Custom dates fields (displayed if preset is custom) */}
            {datePreset === 'custom' && (
              <Stack direction="row" spacing={1}>
                <TextField
                  label="Từ ngày"
                  type="date"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={historyFilters.from}
                  onChange={(e) => {
                    setDatePreset('custom');
                    setHistoryFilters((f) => ({ ...f, from: e.target.value }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                  sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }}
                />
                <TextField
                  label="Đến ngày"
                  type="date"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={historyFilters.to}
                  onChange={(e) => {
                    setDatePreset('custom');
                    setHistoryFilters((f) => ({ ...f, to: e.target.value }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                  sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }}
                />
              </Stack>
            )}

            {/* Limit Selector */}
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Số lượng bản ghi
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[20, 50, 150, 500, 1000].map((preset) => {
                  const active = historyFilters.limit === preset;
                  return (
                    <Chip
                      key={preset}
                      label={preset}
                      onClick={() => setHistoryFilters((f) => ({ ...f, limit: preset }))}
                      color={active ? 'primary' : 'default'}
                      variant={active ? 'filled' : 'outlined'}
                      sx={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        height: 28,
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        bgcolor: active ? primaryColor : 'transparent',
                        borderColor: active ? primaryColor : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'),
                        '&:hover': {
                          bgcolor: active ? undefined : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)')
                        }
                      }}
                    />
                  );
                })}
              </Box>
            </Stack>

            {/* Submit button */}
            <Button
              variant="contained"
              fullWidth
              size="medium"
              startIcon={hs?.loading ? <CircularProgress size={16} color="inherit" /> : <Clock size="20" variant="Bold" />}
              disabled={hs?.loading}
              onClick={(e) => {
                e.stopPropagation();
                loadDeviceHistory(dev);
                setIsFilterExpanded(false);
              }}
              sx={{
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.925rem',
                py: 0.75,
                textTransform: 'none',
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
                boxShadow: `0 4px 14px ${primaryColor}40`,
                '&:hover': {
                  boxShadow: `0 6px 20px ${primaryColor}60`
                }
              }}
            >
              {hs?.loading ? 'Đang tải...' : 'Tải lịch sử'}
            </Button>
          </Stack>
        )}
      </Box>

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
                <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: 1.5, p: 1 }}>
                  <Stack spacing={0.6}>
                    {[
                      ['Điểm đầu', first.timestamp ? new Date(first.timestamp).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false }) : '—'],
                      ['Điểm cuối', last.timestamp ? new Date(last.timestamp).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false }) : '—'],
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
                          {first.batteryVoltage != null ? `${first.batteryVoltage.toFixed(2)}V` : first.externalVoltage != null ? `${first.externalVoltage.toFixed(2)}V` : '—'}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              );
            })()}

          {/* Local Search and Filter Chips */}
          <Stack spacing={0.75} sx={{ mt: 1 }}>
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
                  maxHeight: 480,
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
