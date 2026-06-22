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
  Grid
} from '@mui/material';
import { Add, Edit, Trash, DocumentText, Gps, Clock, Flash, Lock1, BatteryFull, Activity } from 'iconsax-react';
import { getBatteryColor, timeAgo, getMockBiometrics } from '../utils';
import type { TrackingStore } from '../useTracking';

interface Props {
  store: TrackingStore;
}

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
    setAddDeviceOpen
  } = store;

  return (
    <Stack spacing={1.25}>
      <Button
        fullWidth
        variant="outlined"
        startIcon={<Add size={18} />}
        onClick={() => setAddDeviceOpen(true)}
        sx={{
          borderRadius: '10px',
          fontWeight: 700,
          fontSize: '12.5px',
          py: 1.1,
          borderStyle: 'dashed',
          borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1',
          color: isDark ? '#ffffff' : '#111827',
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'transparent',
          '&:hover': {
            borderColor: primaryColor,
            bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'
          }
        }}
      >
        Thêm thiết bị mới
      </Button>

      {filteredDevices.map((dev) => {
        const isViolating = deviceViolations[dev.id];
        const isSelected = dev.id === selectedDeviceId;

        return (
          <Card
            key={dev.id}
            onClick={() => setSelectedDeviceId(dev.id)}
            sx={{
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.22s ease-in-out',
              border: '1.5px solid',
              borderColor: isSelected ? dev.color : isViolating ? '#ef4444' : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'),
              boxShadow: isSelected ? `0 4px 16px ${dev.color}18` : 'none',
              bgcolor: isViolating
                ? isDark
                  ? 'rgba(239,68,68,0.06)'
                  : '#fef2f2'
                : isSelected
                ? isDark
                  ? `${dev.color}15`
                  : `${dev.color}05`
                : (isDark ? 'rgba(15, 23, 42, 0.25)' : '#ffffff'),
              '&:hover': {
                borderColor: dev.color,
                transform: 'translateY(-1.5px)',
                boxShadow: `0 6px 20px ${dev.color}25`
              }
            }}
          >
            <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
              {/* Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Box
                    className="gs-status-dot"
                    sx={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      bgcolor: isViolating ? '#ef4444' : dev.status.connectionStatus === 'online' ? '#22c55e' : '#94a3b8',
                      boxShadow: `0 0 6px ${isViolating ? '#ef4444' : dev.status.connectionStatus === 'online' ? '#22c55e' : '#94a3b8'}`
                    }}
                  />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: isDark ? '#ffffff' : '#111827', fontSize: '13.5px' }}>
                    {dev.name}
                  </Typography>
                  <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: dev.color }} />
                  {isViolating && (
                    <Chip label="VI PHẠM" color="error" size="small" sx={{ height: 16, fontSize: '0.62rem', fontWeight: 800 }} />
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
                        p: 0.85,
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255,255,255,0.16)' : '#e2e8f0',
                        borderRadius: '9px',
                        bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                        '&:hover': { borderColor: primaryColor, bgcolor: `${primaryColor}14` }
                      }}
                    >
                      <Edit size="20" />
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
                        p: 0.85,
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(239,68,68,0.3)' : '#fecaca',
                        borderRadius: '9px',
                        bgcolor: isDark ? 'rgba(239,68,68,0.06)' : '#fef2f2',
                        '&:hover': { borderColor: '#ef4444', bgcolor: 'rgba(239,68,68,0.12)' }
                      }}
                    >
                      <Trash size="20" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>

              {/* Subject banner */}
              {dev.subject && (
                <Box
                  sx={{
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                    borderRadius: '8px',
                    border: '1.2px solid',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9',
                    p: 1,
                    mb: 0.75
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: dev.color,
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}
                    >
                      {dev.subject?.fullName?.split(' ').slice(-1)[0]?.charAt(0) ?? '?'}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                        {dev.subject.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        CCCD: {dev.subject.idNumber || '—'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600 }}>
                        {dev.subject.crime}
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
                          ml: 'auto',
                          flexShrink: 0,
                          p: 0.85,
                          border: '1px solid',
                          borderColor: isDark ? 'rgba(255,255,255,0.16)' : '#e2e8f0',
                          borderRadius: '9px',
                          bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                          '&:hover': { borderColor: primaryColor, bgcolor: `${primaryColor}14` }
                        }}
                      >
                        <DocumentText size="22" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
              )}

              {/* Expanded (selected) */}
              {isSelected ? (
                <Box sx={{ mt: 1 }}>
                  {(() => {
                    const bio = getMockBiometrics(dev.id);
                    const syncLate = (syncMinutesMap[dev.id] ?? 0) > 30;
                    const voltageLabel = dev.status.batteryVoltage != null
                      ? `${dev.status.batteryVoltage.toFixed(2)}V`
                      : dev.status.externalVoltage != null
                      ? `${dev.status.externalVoltage.toFixed(2)}V`
                      : '—';

                    return (
                      <>
                        {/* ── Row 1: Geofence + Lock status chips ── */}
                        <Stack direction="row" spacing={0.75} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.75 }}>
                          <Chip
                            icon={<Gps size={12} />}
                            label={isViolating ? 'Ngoài Vùng' : dev.assignedGeofenceId ? 'Trong Vùng' : 'Chưa gán vùng'}
                            size="small"
                            sx={{
                              fontWeight: 700, fontSize: '0.68rem', height: 22,
                              bgcolor: isViolating ? 'rgba(239,68,68,0.12)' : dev.assignedGeofenceId ? 'rgba(34,197,94,0.12)' : 'rgba(100,116,139,0.10)',
                              color: isViolating ? '#ef4444' : dev.assignedGeofenceId ? '#22c55e' : '#64748b',
                              border: '1px solid',
                              borderColor: isViolating ? 'rgba(239,68,68,0.3)' : dev.assignedGeofenceId ? 'rgba(34,197,94,0.3)' : 'rgba(100,116,139,0.2)',
                              '& .MuiChip-icon': { color: 'inherit', ml: 0.5 }
                            }}
                          />
                          {dev.subject && (
                            <Chip
                              icon={<Lock1 size={12} />}
                              label={bio.isTampered ? 'Phát hiện tháo' : 'Khóa ổn định'}
                              size="small"
                              className={bio.isTampered ? 'gs-blink' : ''}
                              sx={{
                                fontWeight: 700, fontSize: '0.68rem', height: 22,
                                bgcolor: bio.isTampered ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.10)',
                                color: bio.isTampered ? '#ef4444' : '#22c55e',
                                border: '1px solid',
                                borderColor: bio.isTampered ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)',
                                '& .MuiChip-icon': { color: 'inherit', ml: 0.5 }
                              }}
                            />
                          )}
                        </Stack>

                        {/* ── Section label ── */}
                        <Typography sx={{ fontSize: '10.5px', fontWeight: 800, color: primaryColor, mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                          Tình trạng thiết bị
                        </Typography>

                        {/* ── Stat cards: Pin (full) · GPS · Sync · Điện áp · Sự kiện ── */}
                        <Grid container spacing={1} sx={{ mb: 0.75 }}>
                          {/* Pin — nổi bật full-width */}
                          <Grid item xs={12}>
                            <Box sx={{
                              p: 1, borderRadius: '8px', border: '1px solid',
                              borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <BatteryFull size={22} color={getBatteryColor(dev.status.battery)} variant="Bold" />
                                <Typography sx={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                  Pin thiết bị
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
                                <Typography sx={{ fontSize: '17px', fontWeight: 800, color: getBatteryColor(dev.status.battery), minWidth: 44, textAlign: 'right' }}>
                                  {dev.status.battery}%
                                </Typography>
                              </Stack>
                            </Box>
                          </Grid>

                          {/* GPS · Sync · Điện áp · Sự kiện */}
                          {([
                            {
                              label: 'Định vị GPS',
                              icon: <Gps size={20} color={dev.status.gpsFix ? '#22c55e' : '#f59e0b'} variant="Bold" />,
                              value: dev.status.gpsFix ? 'Đã định vị' : 'Chưa định vị',
                              sub: `${dev.status.satelliteCount} vệ tinh`,
                              color: dev.status.gpsFix ? '#22c55e' : '#f59e0b'
                            },
                            {
                              label: 'Đồng bộ',
                              icon: <Clock size={20} color={syncLate ? '#f59e0b' : '#22c55e'} variant="Bold" />,
                              value: timeAgo(dev.status.lastServerSync),
                              sub: syncLate ? 'Trễ đồng bộ' : 'Bình thường',
                              color: syncLate ? '#f59e0b' : (isDark ? '#f8fafc' : '#0f172a')
                            },
                            {
                              label: 'Điện áp',
                              icon: <Flash size={20} color="#f59e0b" variant="Bold" />,
                              value: voltageLabel,
                              sub: dev.status.batteryVoltage != null ? 'Nguồn pin' : dev.status.externalVoltage != null ? 'Nguồn ngoài' : '—',
                              color: '#f59e0b'
                            },
                            {
                              label: 'Sự kiện',
                              icon: <Activity size={20} color="#10b981" variant="Bold" />,
                              value: dev.status.eventName || 'Normal',
                              sub: 'Trạng thái',
                              color: '#10b981'
                            }
                          ] as Array<{ label: string; icon: React.ReactNode; value: string; sub: string; color: string }>).map((item, i) => (
                            <Grid item xs={6} key={i}>
                              <Box sx={{
                                p: 0.85, borderRadius: '8px', border: '1px solid',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                height: '100%'
                              }}>
                                <Stack direction="row" alignItems="center" spacing={0.6} sx={{ mb: 0.25 }}>
                                  {item.icon}
                                  <Typography sx={{ fontSize: '10.5px', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                                    {item.label}
                                  </Typography>
                                </Stack>
                                <Typography sx={{ fontSize: '14px', fontWeight: 800, color: item.color, lineHeight: 1.15 }}>
                                  {item.value}
                                </Typography>
                                <Typography sx={{ fontSize: '10px', fontWeight: 500, color: isDark ? '#64748b' : '#94a3b8' }}>
                                  {item.sub}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>

                        {/* ── Footer: Model / FW ── */}
                        <Typography sx={{ fontSize: '10px', color: isDark ? '#475569' : '#94a3b8', textAlign: 'center', mb: 1.25 }}>
                          {dev.status.deviceModel}{dev.status.firmwareVersion ? ` · ${dev.status.firmwareVersion}` : ''}
                        </Typography>

                        <Divider sx={{ mb: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }} />

                        <FormControlLabel
                          control={<Switch checked={followDevice} onChange={(e) => setFollowDevice(e.target.checked)} size="small" sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: primaryColor },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: primaryColor }
                          }} />}
                          label={<Typography sx={{ fontSize: '12px', fontWeight: 600 }}>Bám theo thiết bị</Typography>}
                        />
                      </>
                    );
                  })()}
                </Box>
              ) : (
                /* Compact row */
                <Stack direction="row" spacing={1.5} alignItems="center" mt={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    {dev.status.connectionStatus === 'online' ? '● Trực tuyến' : '○ Offline'}
                  </Typography>
                  <Typography variant="caption" color={getBatteryColor(dev.status.battery)} sx={{ fontWeight: 600 }}>
                    {dev.status.battery}%
                  </Typography>
                  {dev.assignedGeofenceId && (
                    <Typography variant="caption" color="text.secondary">
                      → {geofences.find((g) => g.id === dev.assignedGeofenceId)?.name}
                    </Typography>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>
        );
      })}

      {filteredDevices.length === 0 && (
        <Typography align="center" color="text.secondary" variant="body2" sx={{ mt: 4 }}>
          Không tìm thấy thiết bị nào.
        </Typography>
      )}
    </Stack>
  );
}
