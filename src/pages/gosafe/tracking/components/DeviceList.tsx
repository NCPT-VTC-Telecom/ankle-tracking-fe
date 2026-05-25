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
  FormControlLabel
} from '@mui/material';
import { Add, Edit, Trash, DocumentText } from 'iconsax-react';
import { getBatteryColor, timeAgo } from '../utils';
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
        startIcon={<Add size="22" />}
        onClick={() => setAddDeviceOpen(true)}
        sx={{ borderRadius: 2, fontWeight: 700, py: 1, borderStyle: 'dashed' }}
      >
        Thêm thiết bị
      </Button>

      {filteredDevices.map((dev) => {
        const isViolating = deviceViolations[dev.id];
        const isSelected = dev.id === selectedDeviceId;

        return (
          <Card
            key={dev.id}
            variant="outlined"
            onClick={() => setSelectedDeviceId(dev.id)}
            sx={{
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: isSelected ? `2px solid ${dev.color}` : isViolating ? '2px solid #ef4444' : undefined,
              bgcolor: isViolating
                ? isDark
                  ? 'rgba(239,68,68,0.07)'
                  : '#fef2f2'
                : isSelected
                ? isDark
                  ? `${dev.color}11`
                  : `${dev.color}08`
                : 'transparent',
              '&:hover': {
                borderColor: dev.color,
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 16px ${dev.color}22`
              }
            }}
          >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              {/* Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    className="gs-status-dot"
                    sx={{
                      width: 11,
                      height: 11,
                      bgcolor: isViolating ? '#ef4444' : dev.status.connectionStatus === 'online' ? '#22c55e' : '#94a3b8',
                      boxShadow: `0 0 6px ${isViolating ? '#ef4444' : '#22c55e'}`
                    }}
                  />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {dev.name}
                  </Typography>
                  <Box sx={{ width: 14, height: 14, borderRadius: '3px', bgcolor: dev.color }} />
                  {isViolating && (
                    <Chip label="VI PHẠM" color="error" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} />
                  )}
                </Stack>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Sửa thiết bị">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDevice(dev);
                      }}
                      sx={{ color: primaryColor }}
                    >
                      <Edit size="18" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xoá thiết bị">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRemoveConfirmId(dev.id);
                      }}
                      sx={{ color: '#ef4444' }}
                    >
                      <Trash size="18" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>

              {/* Subject banner */}
              {dev.subject && (
                <Box
                  sx={{
                    bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    borderRadius: 1.5,
                    p: 1.5,
                    mb: 1.5
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
                <Stack spacing={0} sx={{ mt: 0.5 }}>
                  {/* Battery */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" py={0.8}>
                    <Typography variant="body2" color="text.secondary">
                      Pin:
                    </Typography>
                    <Box
                      className="gs-battery"
                      style={
                        {
                          '--battery-color': getBatteryColor(dev.status.battery)
                        } as React.CSSProperties
                      }
                    >
                      <Box className="gs-battery__shell">
                        <Box className="gs-battery__fill" style={{ width: `${dev.status.battery}%` }} />
                      </Box>
                      <span className="gs-battery__label">{dev.status.battery}%</span>
                    </Box>
                  </Stack>

                  {/* Signal */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" py={0.8}>
                    <Typography variant="body2" color="text.secondary">
                      GSM:
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Box className="gs-signal">
                        {[1, 2, 3, 4].map((b) => (
                          <Box
                            key={b}
                            className="gs-signal__bar"
                            style={{
                              height: b * 3.5,
                              backgroundColor:
                                b <= dev.status.signalStrength ? '#22c55e' : isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)'
                            }}
                          />
                        ))}
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1 }}>
                        {dev.status.signalStrength}/4
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" py={0.8}>
                    <Typography variant="body2" color="text.secondary">
                      GPS:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {timeAgo(dev.status.lastGpsUpdate)}
                      {' · '}
                      <span style={{ color: dev.status.gpsFix ? '#22c55e' : '#f59e0b' }}>{dev.status.gpsFix ? 'Fix' : 'No Fix'}</span>
                      {' · '}
                      {dev.status.satelliteCount} sats
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" py={0.8}>
                    <Typography variant="body2" color="text.secondary">
                      Server sync:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: (syncMinutesMap[dev.id] ?? 0) > 30 ? '#f59e0b' : 'inherit'
                      }}
                    >
                      {timeAgo(dev.status.lastServerSync)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center" py={0.8}>
                    <Typography variant="body2" color="text.secondary">
                      Vùng:
                    </Typography>
                    <Chip
                      label={isViolating ? 'Ngoài Vùng' : dev.assignedGeofenceId ? 'Trong Vùng' : 'Chưa gán'}
                      color={isViolating ? 'error' : dev.assignedGeofenceId ? 'success' : 'default'}
                      size="small"
                      sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem' }}
                    />
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" py={0.8}>
                    <Typography variant="body2" color="text.secondary">
                      Tốc độ:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {dev.status.speed} km/h
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" py={0.8}>
                    <Typography variant="body2" color="text.secondary">
                      Độ cao:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {dev.status.altitude} m
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" py={0.8}>
                    <Typography variant="body2" color="text.secondary">
                      Điện áp:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {dev.status.batteryVoltage != null
                        ? `${dev.status.batteryVoltage.toFixed(2)}V (pin)`
                        : dev.status.externalVoltage != null
                        ? `${dev.status.externalVoltage.toFixed(2)}V (ngoài)`
                        : '—'}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" py={0.8}>
                    <Typography variant="body2" color="text.secondary">
                      Sự kiện:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {dev.status.eventName || '—'}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" py={0.8}>
                    <Typography variant="body2" color="text.secondary">
                      Model / FW:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
                      {dev.status.deviceModel}
                      {dev.status.firmwareVersion ? ` · ${dev.status.firmwareVersion}` : ''}
                    </Typography>
                  </Stack>

                  <Divider sx={{ my: 1 }} />

                  <FormControlLabel
                    sx={{ mt: 0.5 }}
                    control={<Switch checked={followDevice} onChange={(e) => setFollowDevice(e.target.checked)} size="small" />}
                    label={<Typography variant="body2">Bám theo thiết bị đang chọn</Typography>}
                  />

                  {/* GPS History */}
                </Stack>
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
