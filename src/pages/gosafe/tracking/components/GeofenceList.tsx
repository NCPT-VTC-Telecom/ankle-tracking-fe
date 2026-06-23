import { Box, Stack, Typography, Card, CardContent, Chip, Button, Alert } from '@mui/material';
import { Add, Location } from 'iconsax-react';
import type { TrackingStore } from '../useTracking';
import { ZONE_PRESET_MAP } from '../constants';

interface Props {
  store: TrackingStore;
}

export default function GeofenceList({ store }: Props) {
  const {
    isDark,
    geofences,
    editingGeofenceId,
    editGfId,
    setMapCenter,
    setMapZoom,
    setEditGfId,
    setEditGfForm,
    setAddGfOpen
  } = store;

  return (
    <Stack spacing={1.5}>
      <Button
        fullWidth
        variant="outlined"
        startIcon={<Add size={22} />}
        onClick={() => setAddGfOpen(true)}
        sx={{ borderRadius: '16px', fontWeight: 700, fontSize: '14px', py: 1.25, borderStyle: 'dashed' }}
      >
        Thêm vùng mới
      </Button>

      <Alert severity="info" sx={{ borderRadius: '12px', fontSize: '0.85rem' }}>
        Chọn vùng để xem chi tiết, phân quyền thiết bị, định vị, hoặc chỉnh sửa ranh giới.
      </Alert>

      {geofences.map((gf) => {
        const isEditingBoundary = editingGeofenceId === gf.id;
        const isSelected = editGfId === gf.id;

        return (
          <Card
            key={gf.id}
            onClick={() => {
              setEditGfForm({
                name: gf.name,
                address: gf.address,
                color: gf.color,
                zoneType: gf.zoneType,
                schedule: gf.schedule,
                coordinates: gf.coordinates
              });
              setEditGfId(gf.id);
              if (gf.coordinates.length > 0) {
                setMapCenter(gf.coordinates[0]);
                setMapZoom(16);
              }
            }}
            sx={{
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: '2px solid',
              borderColor: isEditingBoundary
                ? '#f59e0b'
                : isSelected
                ? gf.color
                : isDark
                ? 'rgba(255,255,255,0.08)'
                : '#cbd5e1',
              bgcolor: isSelected
                ? isDark
                  ? `${gf.color}14`
                  : `${gf.color}08`
                : isDark
                ? 'rgba(15, 23, 42, 0.25)'
                : '#ffffff',
              '&:hover': {
                borderColor: gf.color,
                transform: 'translateY(-2px)'
              }
            }}
          >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                  <Box 
                    className="gs-gf-swatch" 
                    style={{ 
                      backgroundColor: gf.color, 
                      width: 14, 
                      height: 14, 
                      borderRadius: '4px',
                      boxShadow: `0 0 6px ${gf.color}40`,
                      flexShrink: 0 
                    }} 
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.925rem', color: isDark ? '#ffffff' : '#0f172a' }}>
                      {gf.name}
                    </Typography>
                    {gf.address && (
                      <Typography
                        noWrap
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.25, fontSize: '0.78rem' }}
                      >
                        <Location size="12" /> {gf.address}
                      </Typography>
                    )}
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                  <Chip
                    label={ZONE_PRESET_MAP[gf.zoneType].label}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      color: gf.color,
                      bgcolor: `${gf.color}14`,
                      border: `1px solid ${gf.color}33`
                    }}
                  />
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: gf.active ? '#22c55e' : '#94a3b8',
                      boxShadow: gf.active ? '0 0 6px #22c55e' : 'none'
                    }}
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
