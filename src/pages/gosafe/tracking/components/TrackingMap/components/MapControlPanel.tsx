import { Box, Typography, Stack, Divider, Grid, Button, Switch, FormControlLabel } from '@mui/material';
import { Map, Eye, Location } from 'iconsax-react';
import { LAYER_PREVIEWS, type MapLayer } from './tileConfig';

interface Props {
  mapLayer: MapLayer;
  setMapLayer: (l: MapLayer) => void;
  showGeofences: boolean;
  setShowGeofences: (v: boolean) => void;
  showGfLabels: boolean;
  setShowGfLabels: (v: boolean) => void;
  showTrails: boolean;
  setShowTrails: (v: boolean) => void;
  showAccuracyCircles: boolean;
  setShowAccuracyCircles: (v: boolean) => void;
  onFitAll: () => void;
  primaryColor: string;
  isDark: boolean;
  glassBg: string;
  glassBdr: string;
  glassBlur: string;
  txtColor: string;
}

/** Bảng điều khiển bản đồ (góc dưới phải): chọn lớp nền, bật/tắt hiển thị, khớp tất cả. */
export default function MapControlPanel({
  mapLayer,
  setMapLayer,
  showGeofences,
  setShowGeofences,
  showGfLabels,
  setShowGfLabels,
  showTrails,
  setShowTrails,
  showAccuracyCircles,
  setShowAccuracyCircles,
  onFitAll,
  primaryColor,
  isDark,
  glassBg,
  glassBdr,
  glassBlur,
  txtColor,
}: Props) {
  const toggles: Array<{ label: string; value: boolean; setter: (v: boolean) => void }> = [
    { label: 'Vùng cấm (Geofences)', value: showGeofences, setter: setShowGeofences },
    { label: 'Nhãn tên vùng', value: showGfLabels, setter: setShowGfLabels },
    { label: 'Vệt di chuyển', value: showTrails, setter: setShowTrails },
    { label: 'Vòng tròn độ chính xác GPS', value: showAccuracyCircles, setter: setShowAccuracyCircles },
  ];

  return (
    <Box
      className="gs-glass-panel"
      sx={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        zIndex: 1000,
        width: 320,
        bgcolor: glassBg,
        backdropFilter: glassBlur,
        WebkitBackdropFilter: glassBlur,
        boxShadow: `0 8px 32px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.12)`,
        borderRadius: 3,
        border: `1px solid ${glassBdr}`,
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.75,
        color: txtColor,
      }}
    >
      {/* Tile layer selector */}
      <Stack direction="row" spacing={0.75} alignItems="center">
        <Map size="16" variant="Bold" color={primaryColor} />
        <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.8rem', letterSpacing: 0.8, textTransform: 'uppercase' }}>
          Lớp bản đồ
        </Typography>
      </Stack>

      <Grid container spacing={1}>
        {Object.entries(LAYER_PREVIEWS).map(([layerId, config]) => {
          const id = layerId as MapLayer;
          const sel = mapLayer === id;
          return (
            <Grid item xs={6} key={id}>
              <Box onClick={() => setMapLayer(id)} sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: '100%',
                    height: 48,
                    borderRadius: 1.5,
                    position: 'relative',
                    overflow: 'hidden',
                    background: config.bg,
                    border: '2px solid',
                    borderColor: sel ? primaryColor : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                    boxShadow: sel ? `0 0 10px ${primaryColor}50` : 'none',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: sel ? 'scale(1.03)' : 'none',
                    '&:hover': {
                      borderColor: sel ? primaryColor : (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'),
                      transform: 'scale(1.03)',
                    },
                  }}
                >
                  {config.pattern}
                  {sel && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        bgcolor: primaryColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      }}
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="4">
                        <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Box>
                  )}
                </Box>
                <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 500, color: sel ? primaryColor : 'text.secondary', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {config.label}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      <Divider sx={{ borderColor: glassBdr }} />

      {/* Display toggles */}
      <Stack direction="row" spacing={0.75} alignItems="center">
        <Eye size="16" variant="Bold" color={primaryColor} />
        <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.8rem', letterSpacing: 0.8, textTransform: 'uppercase' }}>
          Hiển thị
        </Typography>
      </Stack>

      <Stack spacing={0.25}>
        {toggles.map((item) => (
          <FormControlLabel
            key={item.label}
            control={
              <Switch
                checked={item.value}
                onChange={(e) => item.setter(e.target.checked)}
                size="medium"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: primaryColor },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: primaryColor },
                }}
              />
            }
            label={<Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{item.label}</Typography>}
            sx={{ mx: 0, my: 0.2 }}
          />
        ))}
      </Stack>

      <Divider sx={{ borderColor: glassBdr }} />

      <Button
        size="medium"
        variant="outlined"
        onClick={onFitAll}
        fullWidth
        startIcon={<Location size="16" />}
        sx={{
          borderRadius: 2,
          fontSize: '0.85rem',
          fontWeight: 500,
          textTransform: 'none',
          py: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)',
          color: isDark ? '#cbd5e1' : '#475569',
          '&:hover': { borderColor: primaryColor, color: primaryColor, bgcolor: `${primaryColor}12` },
        }}
      >
        Khớp tất cả vùng &amp; thiết bị
      </Button>
    </Box>
  );
}
