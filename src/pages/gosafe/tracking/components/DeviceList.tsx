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
import { Add, Edit, Trash, DocumentText, Gps, Clock, Flash, Lock1 } from 'iconsax-react';
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
    <Stack spacing={2}>
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
              borderRadius: '12px',
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
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              {/* Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.2}>
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
                <Stack direction="row" spacing={0.25}>
                  <Tooltip title="Sửa thiết bị">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDevice(dev);
                      }}
                      sx={{ color: primaryColor, p: 0.5 }}
                    >
                      <Edit size="16" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xoá thiết bị">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRemoveConfirmId(dev.id);
                      }}
                      sx={{ color: '#ef4444', p: 0.5 }}
                    >
                      <Trash size="16" />
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
                    p: 1.25,
                    mb: 1.25
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
                      {dev.subject.fullName.split(' ').slice(-1)[0]?.charAt(0) ?? '?'}
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
                        sx={{ color: primaryColor, ml: 'auto', flexShrink: 0 }}
                      >
                        <DocumentText size="18" />
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
                    const dbmVal =
                      dev.status.signalStrength === 4 ? '-65'
                      : dev.status.signalStrength === 3 ? '-80'
                      : dev.status.signalStrength === 2 ? '-95'
                      : dev.status.signalStrength === 1 ? '-108'
                      : '—';
                    const syncLate = (syncMinutesMap[dev.id] ?? 0) > 30;
                    const voltageLabel = dev.status.batteryVoltage != null
                      ? `${dev.status.batteryVoltage.toFixed(2)}V`
                      : dev.status.externalVoltage != null
                      ? `${dev.status.externalVoltage.toFixed(2)}V`
                      : '—';

                    return (
                      <>
                        {/* ── Row 1: Geofence + Lock status chips ── */}
                        <Stack direction="row" spacing={0.75} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.75 }}>
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

                        {/* ── Row 2: 2×2 Primary stat cards ── */}
                        <Grid container spacing={0.75} sx={{ mb: 0.75 }}>
                          {/* Pin */}
                          <Grid item xs={6}>
                            <Box sx={{
                              p: 1, borderRadius: '8px', border: '1px solid',
                              borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#f1f5f9',
                              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc'
                            }}>
                              <Typography sx={{ fontSize: '9.5px', fontWeight: 600, color: isDark ? '#64748b' : '#94a3b8', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                Pin
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={0.75}>
                                <Box
                                  className="gs-battery"
                                  style={{ '--battery-color': getBatteryColor(dev.status.battery) } as React.CSSProperties}
                                >
                                  <Box className="gs-battery__shell">
                                    <Box className="gs-battery__fill" style={{ width: `${dev.status.battery}%` }} />
                                  </Box>
                                </Box>
                                <Typography sx={{ fontSize: '13px', fontWeight: 800, color: getBatteryColor(dev.status.battery) }}>
                                  {dev.status.battery}%
                                </Typography>
                              </Stack>
                            </Box>
                          </Grid>

                          {/* GSM */}
                          <Grid item xs={6}>
                            <Box sx={{
                              p: 1, borderRadius: '8px', border: '1px solid',
                              borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#f1f5f9',
                              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc'
                            }}>
                              <Typography sx={{ fontSize: '9.5px', fontWeight: 600, color: isDark ? '#64748b' : '#94a3b8', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                GSM
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={0.75}>
                                <Box className="gs-signal">
                                  {[1,2,3,4].map((b) => (
                                    <Box key={b} className="gs-signal__bar" style={{
                                      height: b * 3.5,
                                      backgroundColor: b <= dev.status.signalStrength ? '#22c55e' : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
                                    }} />
                                  ))}
                                </Box>
                                <Typography sx={{ fontSize: '12px', fontWeight: 800, color: dev.status.signalStrength <= 1 ? '#ef4444' : (isDark ? '#f8fafc' : '#111827') }}>
                                  {dbmVal} <Typography component="span" sx={{ fontSize: '9px', fontWeight: 500, color: isDark ? '#64748b' : '#94a3b8' }}>dBm</Typography>
                                </Typography>
                              </Stack>
                            </Box>
                          </Grid>

                          {/* GPS */}
                          <Grid item xs={6}>
                            <Box sx={{
                              p: 1, borderRadius: '8px', border: '1px solid',
                              borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#f1f5f9',
                              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc'
                            }}>
                              <Typography sx={{ fontSize: '9.5px', fontWeight: 600, color: isDark ? '#64748b' : '#94a3b8', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                GPS
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Gps size={13} color={dev.status.gpsFix ? '#22c55e' : '#f59e0b'} variant="Bold" />
                                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: dev.status.gpsFix ? '#22c55e' : '#f59e0b' }}>
                                  {dev.status.gpsFix ? 'Fix' : 'No Fix'}
                                </Typography>
                                <Typography sx={{ fontSize: '10px', color: isDark ? '#64748b' : '#94a3b8' }}>
                                  · {dev.status.satelliteCount}s
                                </Typography>
                              </Stack>
                            </Box>
                          </Grid>

                          {/* Sync */}
                          <Grid item xs={6}>
                            <Box sx={{
                              p: 1, borderRadius: '8px', border: '1px solid',
                              borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#f1f5f9',
                              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc'
                            }}>
                              <Typography sx={{ fontSize: '9.5px', fontWeight: 600, color: isDark ? '#64748b' : '#94a3b8', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                Sync
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Clock size={13} color={syncLate ? '#f59e0b' : '#22c55e'} variant="Bold" />
                                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: syncLate ? '#f59e0b' : (isDark ? '#f8fafc' : '#111827') }}>
                                  {timeAgo(dev.status.lastServerSync)}
                                </Typography>
                              </Stack>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* ── Row 3: 2×2 Telemetry cards ── */}
                        <Grid container spacing={0.75} sx={{ mb: 1.25 }}>
                          {[
                            { label: 'Vận tốc', value: `${dev.status.speed || 0}`, unit: 'km/h', color: '#3b82f6' },
                            { label: 'Độ cao', value: `${dev.status.altitude || 0}`, unit: 'm', color: '#8b5cf6' },
                            { label: 'Điện áp', value: voltageLabel, unit: dev.status.batteryVoltage != null ? 'pin' : dev.status.externalVoltage != null ? 'ext' : '', color: '#f59e0b', icon: <Flash size={11} variant="Bold" /> },
                            { label: 'Sự kiện', value: dev.status.eventName || '—', unit: '', color: '#10b981' }
                          ].map((item, i) => (
                            <Grid item xs={6} key={i}>
                              <Box sx={{
                                p: 1, borderRadius: '8px', border: '1px solid',
                                borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#f1f5f9',
                                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc'
                              }}>
                                <Stack direction="row" alignItems="center" spacing={0.4} sx={{ mb: 0.3 }}>
                                  {item.icon && <Box sx={{ color: item.color, display: 'flex' }}>{item.icon}</Box>}
                                  <Typography sx={{ fontSize: '9.5px', fontWeight: 600, color: isDark ? '#64748b' : '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                    {item.label}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" alignItems="baseline" spacing={0.4}>
                                  <Typography sx={{ fontSize: '13px', fontWeight: 800, color: item.color, lineHeight: 1 }}>
                                    {item.value}
                                  </Typography>
                                  {item.unit && (
                                    <Typography sx={{ fontSize: '9px', fontWeight: 500, color: isDark ? '#64748b' : '#94a3b8' }}>
                                      {item.unit}
                                    </Typography>
                                  )}
                                </Stack>
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
