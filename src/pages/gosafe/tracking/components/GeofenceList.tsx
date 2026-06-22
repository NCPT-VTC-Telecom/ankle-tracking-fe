import { Box, Stack, Typography, Card, CardContent, IconButton, Tooltip, Switch, Chip, Button, Alert } from '@mui/material';
import { Add, Edit, Location, Trash } from 'iconsax-react';
import type { TrackingStore } from '../useTracking';

interface Props {
  store: TrackingStore;
}

export default function GeofenceList({ store }: Props) {
  const {
    isDark,
    primaryColor,
    geofences,
    editingGeofenceId,
    setEditingGeofenceId,
    geofenceDevicesMap,
    deviceViolations,
    gfMetrics,
    setMapCenter,
    setMapZoom,
    setEditGfId,
    setEditGfForm,
    setAssignGeofenceId,
    setAddGfOpen,
    setRemoveGfId,
    finishEditingGeofence,
    handleToggleGeofenceActive
  } = store;

  return (
    <Stack spacing={1.25}>
      <Button
        fullWidth
        variant="outlined"
        startIcon={<Add size="22" />}
        onClick={() => setAddGfOpen(true)}
        sx={{ borderRadius: 2, fontWeight: 700, py: 1, borderStyle: 'dashed' }}
      >
        Thêm vùng mới
      </Button>

      <Alert severity="info" sx={{ borderRadius: 2 }}>
        <b>Sửa vùng:</b> kéo đỉnh ○ để chỉnh biên giới, kéo ✛ để dời cả vùng.
      </Alert>

      {geofences.map((gf) => {
        const assigned = geofenceDevicesMap[gf.id] ?? [];
        const isEditing = editingGeofenceId === gf.id;

        return (
          <Card
            key={gf.id}
            variant="outlined"
            sx={{
              borderRadius: 2,
              border: isEditing ? `2px solid ${gf.color}` : undefined
            }}
          >
            <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
              {/* Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box className="gs-gf-swatch" style={{ backgroundColor: gf.color }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {gf.name}
                    </Typography>
                    {gf.address && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.3 }}
                      >
                        <Location size="14" /> {gf.address}
                      </Typography>
                    )}
                  </Box>
                </Stack>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Tooltip title="Sửa thông tin vùng">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditGfForm({ name: gf.name, address: gf.address, color: gf.color });
                        setEditGfId(gf.id);
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
                  <Tooltip title="Xoá vùng">
                    <IconButton
                      size="small"
                      onClick={() => setRemoveGfId(gf.id)}
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
                  <Switch checked={gf.active} onChange={() => handleToggleGeofenceActive(gf.id)} size="small" />
                </Stack>
              </Stack>

              {gf.active && (
                <>
                  {/* Metrics */}
                  <Stack spacing={0.6} mb={1} sx={{ pl: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Diện tích: <b>{gfMetrics[gf.id]?.area}</b> · Chu vi: <b>{gfMetrics[gf.id]?.perimeter}</b>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Số đỉnh: <b>{gf.coordinates.length}</b>
                    </Typography>
                  </Stack>

                  {/* Assigned devices */}
                  <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: 1.5, p: 1, mb: 0.75 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: primaryColor }}>
                        THIẾT BỊ ĐƯỢC GÁN ({assigned.length})
                      </Typography>
                      <Button
                        size="small"
                        variant="text"
                        sx={{ fontSize: '0.72rem', fontWeight: 700, py: 0.2 }}
                        onClick={() => setAssignGeofenceId(gf.id)}
                      >
                        + Gán thiết bị
                      </Button>
                    </Stack>
                    {assigned.length === 0 ? (
                      <Typography variant="caption" color="text.secondary">
                        Chưa có thiết bị nào.
                      </Typography>
                    ) : (
                      <Stack spacing={0.6}>
                        {assigned.map((dev) => (
                          <Stack key={dev.id} direction="row" spacing={1} alignItems="center">
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                flexShrink: 0,
                                bgcolor: deviceViolations[dev.id] ? '#ef4444' : dev.color
                              }}
                            />
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                {dev.name}
                              </Typography>
                              {dev.subject && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.68rem' }}>
                                  {dev.subject.fullName}
                                </Typography>
                              )}
                            </Box>
                            <Chip
                              label={deviceViolations[dev.id] ? 'Ngoài' : 'Trong'}
                              size="small"
                              color={deviceViolations[dev.id] ? 'error' : 'success'}
                              sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                            />
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Box>

                  {/* Actions */}
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    {isEditing ? (
                      <Button
                        variant="contained"
                        color="success"
                        onClick={finishEditingGeofence}
                        sx={{ borderRadius: 2, fontWeight: 700, py: 0.8, px: 2.5 }}
                      >
                        Hoàn tất
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        startIcon={<Edit size="18" />}
                        onClick={() => {
                          setEditingGeofenceId(gf.id);
                          setMapCenter(gf.coordinates[0]);
                          setMapZoom(16);
                        }}
                        sx={{ borderRadius: 2, fontWeight: 700, py: 0.8 }}
                      >
                        Sửa ranh giới
                      </Button>
                    )}
                    <Button
                      variant="text"
                      onClick={() => {
                        setMapCenter(gf.coordinates[0]);
                        setMapZoom(16);
                      }}
                      sx={{ fontWeight: 700, py: 0.8, borderRadius: 2 }}
                    >
                      Định vị
                    </Button>
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
