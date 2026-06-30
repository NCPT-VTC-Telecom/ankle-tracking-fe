import {
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  IconButton,
  Avatar,
  Tooltip,
  Chip,
  Divider,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  CircularProgress
} from '@mui/material';
import { Add, Edit, Trash, DocumentText, Gps, Clock, Flash, Lock1, BatteryFull, Activity, Refresh, Warning2 } from 'iconsax-react';
import { getBatteryColor, timeAgo, getMockBiometrics, translateCrime } from '../utils';
import type { TrackingStore } from '../useTracking';
import PaginationBar, { usePagination } from '../../components/PaginationBar';
import { useEffect, useState } from 'react';

// Sau ngần này ms vẫn còn "đang kết nối" → coi là quá hạn, hiện cảnh báo + nút thử lại.
const CONNECT_TIMEOUT_MS = 20_000;

interface Props {
  store: TrackingStore;
}

const DEVICE_PAGE_SIZE = 8;

export default function DeviceList({ store }: Props) {
  const {
    isDark,
    primaryColor,
    filteredDevices,
    selectedDeviceId,
    setSelectedDeviceId,
    deviceViolations,
    geofences,
    syncMinutesMap,
    followDevice,
    setFollowDevice,
    openEditDevice,
    setRemoveConfirmId,
    setSubjectDetailId,
    setAddDeviceOpen,
    sseStatus,
    devicesLoaded,
    retryConnection
  } = store;

  const fontFamily = '"Inter", sans-serif';
  // Loading khi: chưa tải xong API lần đầu HOẶC SSE đang kết nối.
  const connecting = !devicesLoaded || sseStatus === 'idle' || sseStatus === 'connecting';
  const disconnected = sseStatus === 'disconnected';

  // Timeout: nếu vẫn "đang kết nối" quá lâu → coi như lỗi, cho người dùng thử lại thủ công
  // thay vì để spinner quay vô hạn.
  const [connectTimedOut, setConnectTimedOut] = useState(false);
  useEffect(() => {
    if (!connecting) {
      setConnectTimedOut(false);
      return;
    }
    const t = setTimeout(() => setConnectTimedOut(true), CONNECT_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [connecting]);

  const handleRetry = () => {
    setConnectTimedOut(false);
    retryConnection?.();
  };

  // Hiển thị trạng thái lỗi (có nút thử lại) khi: mất kết nối HOẶC kết nối quá hạn.
  const showError = disconnected || (connecting && connectTimedOut);

  // Phân trang để gọn khi nhiều thiết bị (scale 100+). Chọn thiết bị → tự nhảy tới trang chứa nó.
  const { page, setPage, total, totalPages, paged } = usePagination(filteredDevices, DEVICE_PAGE_SIZE);
  useEffect(() => {
    const idx = filteredDevices.findIndex((d) => d.id === selectedDeviceId);
    if (idx >= 0) setPage(Math.floor(idx / DEVICE_PAGE_SIZE) + 1);
    // chỉ phản ứng khi đổi thiết bị chọn (không reset trang mỗi gói SSE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeviceId]);

  return (
    <Stack spacing={1.25}>
      <Button
        fullWidth
        variant="outlined"
        startIcon={<Add size={18} />}
        onClick={() => setAddDeviceOpen(true)}
        sx={{
          borderRadius: '16px',
          fontWeight: 700,
          fontFamily,
          fontSize: '14px',
          py: 1.5,
          borderStyle: 'dashed',
          borderWidth: '1.5px',
          borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1',
          color: isDark ? '#ffffff' : '#0f172a',
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'transparent',
          '&:hover': {
            borderColor: primaryColor,
            borderWidth: '1.5px',
            bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'
          }
        }}
      >
        Thêm thiết bị mới
      </Button>

      {/* Chỉ báo kết nối thời gian thực — luôn hiển thị để người dùng biết app đang chạy.
          Khi mất kết nối / kết nối quá hạn → hiện cảnh báo kèm nút "Thử lại" thủ công. */}
      {showError ? (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
          sx={{
            px: 1,
            py: 0.75,
            borderRadius: '12px',
            border: '1px solid',
            borderColor: isDark ? 'rgba(239,68,68,0.3)' : '#fecaca',
            bgcolor: isDark ? 'rgba(239,68,68,0.06)' : '#fef2f2'
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
            <Warning2 size={15} color="#ef4444" variant="Bold" />
            <Typography noWrap sx={{ fontFamily, fontSize: '0.72rem', fontWeight: 700, color: '#ef4444' }}>
              {connecting ? 'Kết nối máy chủ quá lâu' : 'Mất kết nối máy chủ'}
            </Typography>
          </Stack>
          <Button
            size="small"
            onClick={handleRetry}
            startIcon={<Refresh size={14} />}
            sx={{
              flexShrink: 0,
              minWidth: 0,
              px: 1.25,
              py: 0.25,
              fontFamily,
              fontSize: '0.7rem',
              fontWeight: 700,
              borderRadius: '8px',
              color: '#ef4444',
              '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' }
            }}
          >
            Thử lại
          </Button>
        </Stack>
      ) : (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 0.5 }}>
          {connecting ? (
            <CircularProgress size={12} thickness={6} />
          ) : (
            <Box className={sseStatus === 'connected' ? 'gs-live-dot' : undefined} sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: sseStatus === 'connected' ? '#22c55e' : '#94a3b8' }} />
          )}
          <Typography sx={{ fontFamily, fontSize: '0.72rem', fontWeight: 700, color: connecting ? '#3b82f6' : '#22c55e' }}>
            {connecting ? 'Đang kết nối máy chủ…' : 'Trực tuyến · cập nhật thời gian thực'}
          </Typography>
        </Stack>
      )}

      {paged.map((dev) => {
        const isViolating = deviceViolations[dev.id];
        const isSelected = dev.id === selectedDeviceId;

        return (
          <Card
            key={dev.id}
            onClick={() => setSelectedDeviceId(dev.id)}
            sx={{
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '2px solid',
              borderColor: isSelected
                ? dev.color
                : isViolating
                ? '#ef4444'
                : isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : '#cbd5e1',
              boxShadow: isSelected
                ? `0 12px 28px ${dev.color}15, 0 4px 12px ${dev.color}08`
                : '0 2px 8px rgba(0, 0, 0, 0.02)',
              bgcolor: isViolating
                ? isDark
                  ? 'rgba(239,68,68,0.05)'
                  : '#fff5f5'
                : isSelected
                ? isDark
                  ? `${dev.color}12`
                  : `rgba(45, 94, 175, 0.03)`
                : isDark
                ? 'rgba(15, 23, 42, 0.25)'
                : '#ffffff',
              '&:hover': {
                borderColor: dev.color,
                transform: 'translateY(-2px)',
                boxShadow: `0 12px 24px ${dev.color}1e`
              }
            }}
          >
            <CardContent sx={{ p: isSelected ? 2 : 1.5, '&:last-child': { pb: isSelected ? 2 : 1.5 } }}>
              {/* Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={isSelected ? 1.5 : 0.5}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Box
                    className="gs-status-dot"
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: isViolating ? '#ef4444' : dev.status.connectionStatus === 'online' ? '#22c55e' : '#94a3b8',
                      boxShadow: `0 0 8px ${isViolating ? '#ef4444' : dev.status.connectionStatus === 'online' ? '#22c55e' : '#94a3b8'}`
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily,
                      fontWeight: 700,
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontSize: '0.975rem'
                    }}
                  >
                    {dev.name}
                  </Typography>
                  <Box sx={{ width: 12, height: 12, borderRadius: '4px', bgcolor: dev.color }} />
                  {isViolating && (
                    <Chip
                      label="VI PHẠM"
                      color="error"
                      size="small"
                      sx={{
                        fontFamily,
                        height: 20,
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        borderRadius: '6px'
                      }}
                    />
                  )}
                </Stack>
                <Stack direction="row" spacing={0.75}>
                  <Tooltip title="Sửa thiết bị">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDevice(dev);
                      }}
                      sx={{
                        color: primaryColor,
                        p: isSelected ? 0.85 : 0.6,
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255,255,255,0.16)' : '#cbd5e1',
                        borderRadius: '12px',
                        bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                        '&:hover': { borderColor: primaryColor, bgcolor: `${primaryColor}14` }
                      }}
                    >
                      <Edit size={isSelected ? "18" : "16"} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xoá thiết bị">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRemoveConfirmId(dev.id);
                      }}
                      sx={{
                        color: '#ef4444',
                        p: isSelected ? 0.85 : 0.6,
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(239,68,68,0.3)' : '#fecaca',
                        borderRadius: '12px',
                        bgcolor: isDark ? 'rgba(239,68,68,0.06)' : '#fef2f2',
                        '&:hover': { borderColor: '#ef4444', bgcolor: 'rgba(239,68,68,0.12)' }
                      }}
                    >
                      <Trash size={isSelected ? "18" : "16"} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>

              {/* Expanded (selected) */}
              {isSelected ? (
                <Box sx={{ mt: 1.5 }}>
                  {(() => {
                    const bio = getMockBiometrics(dev.id);
                    // Chưa từng đồng bộ (lastServerSync null) = đang chờ dữ liệu live → hiển thị
                    // trạng thái "Đang đồng bộ" (loading) thay vì báo lỗi "Trễ đồng bộ".
                    const notSynced = dev.status.lastServerSync == null;
                    const syncLate = (syncMinutesMap[dev.id] ?? 0) > 30;
                    const voltageLabel = dev.status.batteryVoltage != null
                      ? `${dev.status.batteryVoltage.toFixed(2)}V`
                      : dev.status.externalVoltage != null
                      ? `${dev.status.externalVoltage.toFixed(2)}V`
                      : '—';

                    return (
                      <>
                        {/* Subject banner inside expanded view */}
                        {dev.subject && (
                          <Box
                            sx={{
                              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(45, 94, 175, 0.02)',
                              borderRadius: '16px',
                              border: '1px solid',
                              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(45, 94, 175, 0.06)',
                              p: 1.5,
                              mb: 1.5
                            }}
                          >
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '12px',
                                  bgcolor: dev.color,
                                  fontSize: '0.95rem',
                                  fontWeight: 700,
                                  fontFamily,
                                  flexShrink: 0
                                }}
                              >
                                {dev.subject?.fullName?.split(' ').slice(-1)[0]?.charAt(0) ?? '?'}
                              </Avatar>
                              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                <Typography
                                  sx={{
                                    fontFamily,
                                    fontWeight: 700,
                                    fontSize: '0.95rem',
                                    color: isDark ? '#f8fafc' : '#0f172a',
                                    lineHeight: 1.3
                                  }}
                                >
                                  {dev.subject.fullName}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontFamily,
                                    fontSize: '0.78rem',
                                    color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b',
                                    display: 'block',
                                    mt: 0.2
                                  }}
                                >
                                  CCCD: {dev.subject.idNumber || '—'}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontFamily,
                                    fontSize: '0.78rem',
                                    color: '#ef4444',
                                    fontWeight: 700,
                                    mt: 0.2
                                  }}
                                >
                                  {translateCrime(dev.subject.crime)}
                                </Typography>
                              </Box>
                              <Tooltip title="Xem hồ sơ chi tiết">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSubjectDetailId(dev.id);
                                  }}
                                  sx={{
                                    color: primaryColor,
                                    flexShrink: 0,
                                    p: 0.75,
                                    border: '1px solid',
                                    borderColor: isDark ? 'rgba(255,255,255,0.16)' : '#cbd5e1',
                                    borderRadius: '10px',
                                    bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                                    '&:hover': { borderColor: primaryColor, bgcolor: `${primaryColor}14` }
                                  }}
                                >
                                  <DocumentText size="18" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Box>
                        )}

                        {/* ── Row 1: Geofence + Lock status chips ── */}
                        <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                          <Chip
                            icon={<Gps size={14} />}
                            label={isViolating ? 'Ngoài Vùng' : dev.assignedGeofenceId ? 'Trong Vùng' : 'Chưa gán vùng'}
                            size="small"
                            sx={{
                              fontFamily,
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              height: 28,
                              borderRadius: '10px',
                              bgcolor: isViolating ? 'rgba(239,68,68,0.1)' : dev.assignedGeofenceId ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.08)',
                              color: isViolating ? '#ef4444' : dev.assignedGeofenceId ? '#22c55e' : '#64748b',
                              border: '1px solid',
                              borderColor: isViolating ? 'rgba(239,68,68,0.2)' : dev.assignedGeofenceId ? 'rgba(34,197,94,0.2)' : 'rgba(100,116,139,0.15)',
                              '& .MuiChip-icon': { color: 'inherit', ml: 0.5 }
                            }}
                          />
                          {dev.subject && (
                            <Chip
                              icon={<Lock1 size={14} />}
                              label={bio.isTampered ? 'Phát hiện tháo' : 'Khóa ổn định'}
                              size="small"
                              className={bio.isTampered ? 'gs-blink' : ''}
                              sx={{
                                fontFamily,
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                height: 28,
                                borderRadius: '10px',
                                bgcolor: bio.isTampered ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                                color: bio.isTampered ? '#ef4444' : '#22c55e',
                                border: '1px solid',
                                borderColor: bio.isTampered ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)',
                                '& .MuiChip-icon': { color: 'inherit', ml: 0.5 }
                              }}
                            />
                          )}
                        </Stack>

                        {/* ── Section label ── */}
                        <Typography
                          sx={{
                            fontFamily,
                            fontSize: '12px',
                            fontWeight: 700,
                            color: primaryColor,
                            mb: 1.25,
                            textTransform: 'uppercase',
                            letterSpacing: 0.8
                          }}
                        >
                          Tình trạng thiết bị
                        </Typography>

                        {/* ── Stat cards: Pin (full) · GPS · Sync · Điện áp · Sự kiện ── */}
                        <Grid container spacing={1.25} sx={{ mb: 1.5 }}>
                          {/* Pin — nổi bật full-width */}
                          <Grid item xs={12}>
                            <Box
                              className={dev.status.isCharging ? 'gs-charging' : undefined}
                              sx={{
                                p: 1.75,
                                borderRadius: '16px',
                                border: '1px solid',
                                borderColor: dev.status.isCharging ? 'rgba(34,197,94,0.45)' : isDark ? 'rgba(255,255,255,0.08)' : '#cbd5e1',
                                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                            >
                              <Stack direction="row" alignItems="center" spacing={1}>
                                {dev.status.isCharging ? (
                                  <Flash size={24} color="#22c55e" variant="Bold" className="gs-charging-bolt" />
                                ) : (
                                  <BatteryFull size={24} color={getBatteryColor(dev.status.battery)} variant="Bold" />
                                )}
                                <Typography
                                  sx={{
                                    fontFamily,
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: dev.status.isCharging ? '#22c55e' : isDark ? '#cbd5e1' : '#475569',
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.4
                                  }}
                                >
                                  {dev.status.isCharging ? '⚡ Đang sạc' : 'Pin thiết bị'}
                                </Typography>
                              </Stack>
                              <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1, ml: 2 }}>
                                <Box
                                  className="gs-battery"
                                  style={{ '--battery-color': getBatteryColor(dev.status.battery), flexGrow: 1 } as React.CSSProperties}
                                >
                                  <Box className="gs-battery__shell">
                                    <Box className="gs-battery__fill" style={{ width: `${dev.status.battery}%` }} />
                                  </Box>
                                </Box>
                                <Typography
                                  sx={{
                                    fontFamily,
                                    fontSize: '18px',
                                    fontWeight: 800,
                                    color: getBatteryColor(dev.status.battery),
                                    minWidth: 44,
                                    textAlign: 'right'
                                  }}
                                >
                                  {dev.status.battery}%
                                </Typography>
                              </Stack>
                            </Box>
                          </Grid>

                          {/* Đồng bộ · Điện áp · Sự kiện */}
                          {([
                            {
                              label: 'Đồng bộ',
                              icon: <Clock size={22} color={notSynced ? '#3b82f6' : syncLate ? '#f59e0b' : '#22c55e'} variant="Bold" />,
                              value: notSynced ? 'Đang đồng bộ…' : timeAgo(dev.status.lastServerSync),
                              sub: notSynced ? 'Đang chờ dữ liệu' : syncLate ? 'Trễ đồng bộ' : 'Bình thường',
                              color: notSynced ? '#3b82f6' : syncLate ? '#f59e0b' : (isDark ? '#f8fafc' : '#0f172a')
                            },
                            {
                              label: 'Điện áp',
                              icon: <Flash size={22} color="#f59e0b" variant="Bold" />,
                              value: voltageLabel,
                              sub: dev.status.batteryVoltage != null ? 'Nguồn pin' : dev.status.externalVoltage != null ? 'Nguồn ngoài' : '—',
                              color: '#f59e0b'
                            },
                            {
                              label: 'Sự kiện',
                              icon: <Activity size={22} color="#10b981" variant="Bold" />,
                              value: dev.status.eventName || 'Normal',
                              sub: 'Trạng thái',
                              color: '#10b981'
                            }
                          ] as Array<{ label: string; icon: React.ReactNode; value: string; sub: string; color: string }>).map((item, i) => (
                            <Grid item xs={4} key={i}>
                              <Box
                                sx={{
                                  p: 1.5,
                                  borderRadius: '14px',
                                  border: '1px solid',
                                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#cbd5e1',
                                  bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  textAlign: 'center',
                                  gap: 0.5
                                }}
                              >
                                <Box sx={{ display: 'flex', '& svg': { width: 22, height: 22 } }}>{item.icon}</Box>
                                <Typography
                                  sx={{
                                    fontFamily,
                                    fontSize: '10.5px',
                                    fontWeight: 700,
                                    color: isDark ? '#94a3b8' : '#64748b',
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.3,
                                    lineHeight: 1
                                  }}
                                >
                                  {item.label}
                                </Typography>
                                <Typography
                                  noWrap
                                  sx={{
                                    fontFamily,
                                    fontSize: '13.5px',
                                    fontWeight: 700,
                                    color: item.color,
                                    lineHeight: 1.2,
                                    width: '100%',
                                    mt: 0.25
                                  }}
                                >
                                  {item.value}
                                </Typography>
                                <Typography
                                  noWrap
                                  sx={{
                                    fontFamily,
                                    fontSize: '11px',
                                    fontWeight: 500,
                                    color: isDark ? '#64748b' : '#94a3b8',
                                    width: '100%'
                                  }}
                                >
                                  {item.sub}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>

                        {/* ── Footer: Model / FW ── */}
                        <Typography
                          sx={{
                            fontFamily,
                            fontSize: '11px',
                            color: isDark ? '#475569' : '#94a3b8',
                            textAlign: 'center',
                            mb: 1.5
                          }}
                        >
                          {dev.status.deviceModel}{dev.status.firmwareVersion ? ` · ${dev.status.firmwareVersion}` : ''}
                        </Typography>

                        <Divider sx={{ mb: 1.5, borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }} />

                        <FormControlLabel
                          control={
                            <Switch
                              checked={followDevice}
                              onChange={(e) => setFollowDevice(e.target.checked)}
                              size="small"
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': { color: primaryColor },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: primaryColor }
                              }}
                            />
                          }
                          label={
                            <Typography
                              sx={{
                                fontFamily,
                                fontSize: '13px',
                                fontWeight: 600
                              }}
                            >
                              Bám theo thiết bị
                            </Typography>
                          }
                        />
                      </>
                    );
                  })()}
                </Box>
              ) : (
                /* Compact row */
                <Stack direction="row" spacing={1.5} alignItems="center" mt={0.5} flexWrap="wrap">
                  <Typography
                    variant="caption"
                    color={dev.status.connectionStatus === 'online' ? '#22c55e' : 'text.secondary'}
                    sx={{ fontFamily, fontSize: '0.78rem', fontWeight: 600 }}
                  >
                    {dev.status.connectionStatus === 'online' ? '● Trực tuyến' : '○ Ngoại tuyến'}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={getBatteryColor(dev.status.battery)}
                    sx={{ fontFamily, fontWeight: 700, fontSize: '0.78rem' }}
                  >
                    {dev.status.battery}%
                  </Typography>
                  {dev.assignedGeofenceId && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily, fontSize: '0.78rem' }}
                    >
                      • {geofences.find((g) => g.id === dev.assignedGeofenceId)?.name}
                    </Typography>
                  )}
                  {dev.subject?.crime && (
                    <Typography
                      variant="caption"
                      color="#ef4444"
                      sx={{ fontFamily, fontWeight: 700, fontSize: '0.78rem' }}
                    >
                      • {translateCrime(dev.subject.crime)}
                    </Typography>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>
        );
      })}

      {filteredDevices.length === 0 && (
        connecting && !connectTimedOut ? (
          <Stack alignItems="center" spacing={1.25} sx={{ mt: 4 }}>
            <CircularProgress size={26} />
            <Typography align="center" color="text.secondary" variant="body2" sx={{ fontFamily, fontSize: '0.9rem' }}>
              Đang kết nối & tải thiết bị…
            </Typography>
          </Stack>
        ) : showError ? (
          <Stack alignItems="center" spacing={1.5} sx={{ mt: 4 }}>
            <Warning2 size={28} color="#ef4444" variant="Bold" />
            <Typography align="center" color="text.secondary" variant="body2" sx={{ fontFamily, fontSize: '0.9rem' }}>
              Không tải được danh sách thiết bị.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleRetry}
              startIcon={<Refresh size={16} />}
              sx={{ fontFamily, fontWeight: 700, borderRadius: '12px', textTransform: 'none' }}
            >
              Thử lại
            </Button>
          </Stack>
        ) : (
          <Typography align="center" color="text.secondary" variant="body2" sx={{ fontFamily, mt: 4, fontSize: '0.9rem' }}>
            Không tìm thấy thiết bị nào.
          </Typography>
        )
      )}

      <PaginationBar page={page} totalPages={totalPages} total={total} shownCount={paged.length} onChange={setPage} label="thiết bị" />
    </Stack>
  );
}
