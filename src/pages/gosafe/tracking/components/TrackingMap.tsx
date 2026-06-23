import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Box, Typography, Stack, Divider, Grid, Button, Switch, FormControlLabel } from '@mui/material';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup, Tooltip, Circle, ScaleControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Map, Eye, Location } from 'iconsax-react';
import { createDeviceIcon, createVertexIcon, createCenterMoveIcon, createHistoryMarkerIcon, createMidpointIcon } from '../mapIcons';
import { getPolygonCentroid, getMockBiometrics, getPolygonArea, getPolygonPerimeter, fmtArea, fmtPerimeter } from '../utils';
import type { TrackingStore } from '../useTracking';

// ── Tile layer config ─────────────────────────────────────────────────────────

type MapLayer = 'light' | 'dark' | 'satellite' | 'hybrid' | 'terrain' | 'osm';

const TILE_URLS: Record<MapLayer, string> = {
  light:     'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  dark:      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  hybrid:    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  terrain:   'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  osm:       'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
};

const HYBRID_LABELS_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';

const LAYER_PREVIEWS: Record<MapLayer, { label: string; bg: string; pattern?: React.ReactNode }> = {
  light: {
    label: 'Sáng',
    bg: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
    pattern: (
      <svg width="100%" height="100%" style={{ opacity: 0.15, position: 'absolute', inset: 0 }}>
        <line x1="10" y1="0" x2="10" y2="50" stroke="#000" strokeWidth="2" />
        <line x1="35" y1="0" x2="35" y2="50" stroke="#000" strokeWidth="1" />
        <line x1="0" y1="15" x2="100" y2="15" stroke="#000" strokeWidth="2.5" />
        <line x1="0" y1="35" x2="100" y2="35" stroke="#000" strokeWidth="1" />
      </svg>
    )
  },
  dark: {
    label: 'Tối',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    pattern: (
      <svg width="100%" height="100%" style={{ opacity: 0.2, position: 'absolute', inset: 0 }}>
        <line x1="15" y1="0" x2="15" y2="50" stroke="#0ea5e9" strokeWidth="1.5" />
        <line x1="50" y1="0" x2="50" y2="50" stroke="#0ea5e9" strokeWidth="0.8" />
        <line x1="0" y1="20" x2="100" y2="20" stroke="#0ea5e9" strokeWidth="2" />
        <line x1="0" y1="40" x2="100" y2="40" stroke="#0ea5e9" strokeWidth="0.8" />
      </svg>
    )
  },
  satellite: {
    label: 'Vệ tinh',
    bg: 'linear-gradient(135deg, #15803d 0%, #1e3a8a 100%)',
    pattern: (
      <svg width="100%" height="100%" style={{ opacity: 0.3, position: 'absolute', inset: 0 }}>
        <circle cx="20" cy="15" r="10" fill="#166534" />
        <circle cx="70" cy="35" r="18" fill="#14532d" />
        <circle cx="50" cy="10" r="12" fill="#1e40af" />
      </svg>
    )
  },
  hybrid: {
    label: 'Hỗn hợp',
    bg: 'linear-gradient(135deg, #15803d 0%, #1e3a8a 100%)',
    pattern: (
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <g opacity="0.3">
          <circle cx="25" cy="20" r="15" fill="#166534" />
          <circle cx="65" cy="30" r="12" fill="#1e40af" />
        </g>
        <g opacity="0.4">
          <line x1="30" y1="0" x2="30" y2="50" stroke="#eab308" strokeWidth="1.2" />
          <line x1="0" y1="25" x2="100" y2="25" stroke="#eab308" strokeWidth="1.5" />
        </g>
      </svg>
    )
  },
  terrain: {
    label: 'Địa hình',
    bg: 'linear-gradient(135deg, #78350f 0%, #15803d 100%)',
    pattern: (
      <svg width="100%" height="100%" style={{ opacity: 0.25, position: 'absolute', inset: 0 }}>
        <path d="M 0,10 Q 25,25 50,15 T 100,35" fill="none" stroke="#f59e0b" strokeWidth="1.2" />
        <path d="M 0,25 Q 35,40 70,30 T 100,45" fill="none" stroke="#f59e0b" strokeWidth="1" />
        <path d="M 0,5 Q 15,10 30,5 T 100,15" fill="none" stroke="#f59e0b" strokeWidth="0.8" />
      </svg>
    )
  },
  osm: {
    label: 'OSM',
    bg: 'linear-gradient(135deg, #bae6fd 0%, #fef08a 100%)',
    pattern: (
      <svg width="100%" height="100%" style={{ opacity: 0.35, position: 'absolute', inset: 0 }}>
        <line x1="20" y1="0" x2="20" y2="50" stroke="#ffffff" strokeWidth="3" />
        <line x1="20" y1="0" x2="20" y2="50" stroke="#f97316" strokeWidth="1.2" />
        <line x1="0" y1="15" x2="100" y2="15" stroke="#ffffff" strokeWidth="4" />
        <line x1="0" y1="15" x2="100" y2="15" stroke="#f97316" strokeWidth="1.5" />
      </svg>
    )
  }
};

// ── Map sub-components ────────────────────────────────────────────────────────

function MapViewUpdater({
  center,
  zoom,
  follow,
  target,
}: {
  center: [number, number];
  zoom: number;
  follow: boolean;
  target: [number, number];
}) {
  const map = useMap();
  useEffect(() => {
    if (follow) map.setView(target, map.getZoom());
  }, [target, follow, map]);
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function MapRefCapture({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => { mapRef.current = map; }, [map, mapRef]);
  return null;
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  store: TrackingStore;
  hideOverlays?: boolean;
}

export default function TrackingMap({ store, hideOverlays = false }: Props) {
  const {
    isDark,
    devices,
    geofences,
    selectedDeviceId,
    deviceViolations,
    historyState,
    historyVisible,
    editingGeofenceId,
    mapCenter,
    mapZoom,
    followDevice,
    followTarget,
    geofenceDevicesMap,
    gfMetrics,
    handleDragVertexEnd,
    handleCenterDragStart,
    handleCenterDragEnd,
    handleAddVertex,
    handleDeleteVertex,
    setSelectedDeviceId,
    setActiveTab,
    finishEditingGeofence,
    cancelEditingGeofence
  } = store;

  const [mapLayer, setMapLayer] = useState<MapLayer>(isDark ? 'dark' : 'light');
  const [showGeofences, setShowGeofences] = useState(true);
  const [showGfLabels, setShowGfLabels] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [showAccuracyCircles, setShowAccuracyCircles] = useState(false);

  const mapRef = useRef<L.Map | null>(null);
  // Ref tới polygon đang sửa + điểm bắt đầu kéo tâm — để cập nhật biên realtime
  // (setLatLngs trực tiếp trên layer Leaflet, không qua React state → không giật).
  const editPolygonRef = useRef<L.Polygon | null>(null);
  const centerStartRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    setMapLayer(isDark ? 'dark' : 'light');
  }, [isDark]);

  const fitAll = () => {
    if (!mapRef.current) return;
    const pts: L.LatLng[] = [
      ...devices.map((d) => L.latLng(d.coords[0], d.coords[1])),
      ...geofences.filter((g) => g.active).flatMap((g) => g.coordinates.map((c) => L.latLng(c[0], c[1]))),
    ];
    if (pts.length > 0) mapRef.current.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 18 });
  };

  // Glass styling tokens
  const glassBg   = isDark ? 'rgba(9,13,31,0.84)' : 'rgba(255,255,255,0.84)';
  const glassBdr  = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)';
  const glassBlur = 'blur(24px) saturate(1.6)';
  const txtColor  = isDark ? '#f8fafc' : '#0f172a';

  // Live edit metrics
  const editGf        = editingGeofenceId ? geofences.find((g) => g.id === editingGeofenceId) : null;
  const editArea      = editGf ? fmtArea(getPolygonArea(editGf.coordinates)) : null;
  const editPerimeter = editGf ? fmtPerimeter(getPolygonPerimeter(editGf.coordinates)) : null;

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* CSS for geofence labels and vertex tooltips */}
      <style>{`
        .gs-gf-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 2px 4px !important;
        }
        .gs-gf-label::before { display: none !important; }
        .gs-vtx-tip {
          background: rgba(9,13,31,0.88) !important;
          border: 1px solid rgba(255,255,255,0.15) !important;
          color: #e2e8f0 !important;
          font-size: 10px !important;
          font-family: 'Inter var', Inter, sans-serif !important;
          padding: 2px 7px !important;
          border-radius: 5px !important;
          white-space: nowrap !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.35) !important;
        }
        .gs-vtx-tip::before { display: none !important; }
      `}</style>

      {/* ── Floating edit hint ── */}
      {editingGeofenceId && (
        <Box
          className="gs-map-hint"
          sx={{
            bgcolor: isDark ? 'rgba(9,13,31,0.90)' : 'rgba(255,255,255,0.90)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            backdropFilter: glassBlur,
            WebkitBackdropFilter: glassBlur,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700 }} color="text.secondary">
            ✏ Chế độ chỉnh sửa vùng cấm
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5, lineHeight: 1.75, color: '#f59e0b' }}>
            Kéo ○ đỉnh để di chuyển · Nhấp ◇ trung điểm để thêm đỉnh · Chuột phải ○ để xoá đỉnh
          </Typography>
        </Box>
      )}

      {/* ── Edit-mode live metrics & action buttons ── */}
      {editingGeofenceId && editGf && (
        <Box
          sx={{
            position: 'absolute',
            top: 70,
            right: 16,
            zIndex: 1001,
            bgcolor: glassBg,
            backdropFilter: glassBlur,
            WebkitBackdropFilter: glassBlur,
            border: `1px solid ${glassBdr}`,
            borderLeft: `3px solid ${editGf.color}`,
            borderRadius: 3,
            px: 2,
            py: 1.75,
            width: 280,
            color: txtColor,
            boxShadow: `0 8px 32px ${editGf.color}25, 0 2px 10px rgba(0,0,0,0.15)`,
            transition: 'all 0.3s ease-in-out'
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: editGf.color, display: 'block', mb: 0.75, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            Đang chỉnh sửa ranh giới
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, fontSize: '1rem', mb: 1.5, color: txtColor }}
          >
            {editGf.name}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            {[
              { label: 'Diện tích', value: editArea },
              { label: 'Chu vi',    value: editPerimeter },
              { label: 'Số đỉnh',   value: String(editGf.coordinates.length) },
            ].map((m) => (
              <Box key={m.label} sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.62rem', fontWeight: 600 }}>
                  {m.label}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
                  {m.value}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Divider sx={{ my: 1.5, opacity: 0.6 }} />

          <Stack spacing={1}>
            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={() => {
                finishEditingGeofence();
              }}
              sx={{
                bgcolor: editGf.color,
                color: '#fff',
                fontWeight: 700,
                borderRadius: '10px',
                py: 0.75,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: editGf.color,
                  opacity: 0.9
                }
              }}
            >
              Lưu ranh giới
            </Button>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              color="error"
              onClick={() => {
                cancelEditingGeofence();
              }}
              sx={{
                fontWeight: 700,
                borderRadius: '10px',
                py: 0.75,
                textTransform: 'none'
              }}
            >
              Hủy chỉnh sửa
            </Button>
          </Stack>
        </Box>
      )}

      {/* ═══ MAP CONTROL PANEL (Moved to bottom-right, made larger with normal weight) ═══ */}
      {!hideOverlays && (
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
          {/* ── Tile layer selector ── */}
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Map size="16" variant="Bold" color={store.primaryColor} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 500,
                fontSize: '0.8rem',
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                
              }}
            >
              Lớp bản đồ
            </Typography>
          </Stack>

          <Grid container spacing={1}>
            {Object.entries(LAYER_PREVIEWS).map(([layerId, config]) => {
              const id = layerId as MapLayer;
              const sel = mapLayer === id;
              return (
                <Grid item xs={4} key={id}>
                  <Box
                    onClick={() => setMapLayer(id)}
                    sx={{
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    {/* Visual Thumbnail Card */}
                    <Box
                      sx={{
                        width: '100%',
                        height: 48,
                        borderRadius: 1.5,
                        position: 'relative',
                        overflow: 'hidden',
                        background: config.bg,
                        border: '2px solid',
                        borderColor: sel ? store.primaryColor : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                        boxShadow: sel ? `0 0 10px ${store.primaryColor}50` : 'none',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: sel ? 'scale(1.03)' : 'none',
                        '&:hover': {
                          borderColor: sel ? store.primaryColor : (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'),
                          transform: 'scale(1.03)',
                        },
                      }}
                    >
                      {/* SVG Pattern */}
                      {config.pattern}

                      {/* Checkmark badge if selected */}
                      {sel && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            bgcolor: store.primaryColor,
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

                    {/* Label */}
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        color: sel ? store.primaryColor : 'text.secondary',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        
                      }}
                    >
                      {config.label}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          <Divider sx={{ borderColor: glassBdr }} />

          {/* ── Display toggles ── */}
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Eye size="16" variant="Bold" color={store.primaryColor} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 500,
                fontSize: '0.8rem',
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                
              }}
            >
              Hiển thị
            </Typography>
          </Stack>

          <Stack spacing={0.25}>
            {([
              { label: 'Vùng cấm (Geofences)', value: showGeofences,        setter: setShowGeofences },
              { label: 'Nhãn tên vùng',         value: showGfLabels,          setter: setShowGfLabels },
              { label: 'Vệt di chuyển',          value: showTrails,            setter: setShowTrails },
              { label: 'Vòng tròn độ chính xác GPS', value: showAccuracyCircles, setter: setShowAccuracyCircles },
            ] as Array<{ label: string; value: boolean; setter: (v: boolean) => void }>).map((item) => (
              <FormControlLabel
                key={item.label}
                control={
                  <Switch
                    checked={item.value}
                    onChange={(e) => item.setter(e.target.checked)}
                    size="medium"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: store.primaryColor },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: store.primaryColor },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                    {item.label}
                  </Typography>
                }
                sx={{ mx: 0, my: 0.2 }}
              />
            ))}
          </Stack>

          <Divider sx={{ borderColor: glassBdr }} />

          {/* ── Fit all button ── */}
          <Button
            size="medium"
            variant="outlined"
            onClick={fitAll}
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
              '&:hover': {
                borderColor: store.primaryColor,
                color: store.primaryColor,
                bgcolor: `${store.primaryColor}12`,
              },
            }}
          >
            Khớp tất cả vùng &amp; thiết bị
          </Button>
        </Box>
      )}

      {/* ═══ MAP ═══ */}
      <MapContainer center={mapCenter} zoom={mapZoom} attributionControl={false} zoomControl={false} style={{ width: '100%', height: '100%' }}>
        <MapRefCapture mapRef={mapRef} />
        <ScaleControl position="bottomright" metric imperial={false} />

        {/* Base tile layer — hybrid shares key with satellite so no remount on switch */}
        <TileLayer
          key={mapLayer === 'hybrid' ? 'satellite' : mapLayer}
          url={TILE_URLS[mapLayer]}
        />
        {/* Hybrid labels overlay */}
        {mapLayer === 'hybrid' && <TileLayer url={HYBRID_LABELS_URL} opacity={0.88} />}

        <MapViewUpdater center={mapCenter} zoom={mapZoom} follow={followDevice} target={followTarget} />

        {/* ── Geofence polygons ── */}
        {showGeofences &&
          geofences.map((gf) => {
            if (!gf.active) return null;
            const isEditing = editingGeofenceId === gf.id;
            return (
              <Polygon
                key={gf.id}
                ref={isEditing ? editPolygonRef : undefined}
                positions={gf.coordinates}
                pathOptions={{
                  color: gf.color,
                  fillColor: gf.color,
                  fillOpacity: isEditing ? 0.1 : 0.18,
                  weight: isEditing ? 3 : 2,
                  dashArray: isEditing ? '7,6' : undefined,
                }}
              >
                {showGfLabels && (
                  <Tooltip permanent direction="center" className="gs-gf-label" opacity={1}>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '11px',
                        color: gf.color,
                        textShadow: isDark
                          ? '0 0 5px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.8)'
                          : '0 1px 3px rgba(255,255,255,0.95)',
                        whiteSpace: 'nowrap',
                        letterSpacing: 0.3,
                      }}
                    >
                      {gf.name}
                    </span>
                  </Tooltip>
                )}
                <Popup>
                  <Box sx={{ minWidth: 200, p: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {gf.name}
                    </Typography>
                    {gf.address && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {gf.address}
                      </Typography>
                    )}
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      Diện tích: {gfMetrics[gf.id]?.area} · Chu vi: {gfMetrics[gf.id]?.perimeter}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Thiết bị: {(geofenceDevicesMap[gf.id] ?? []).map((d) => d.name).join(', ') || 'Chưa có'}
                    </Typography>
                  </Box>
                </Popup>
              </Polygon>
            );
          })}

        {/* ── Geofence edit handles ── */}
        {showGeofences &&
          editingGeofenceId &&
          (() => {
            const gf = geofences.find((g) => g.id === editingGeofenceId);
            if (!gf?.active) return null;
            return (
              <>
                {/* Vertex markers — drag to move, right-click to delete */}
                {gf.coordinates.map((coord, idx) => (
                  <Marker
                    key={`${gf.id}-v${idx}`}
                    position={coord}
                    draggable
                    icon={createVertexIcon(gf.color)}
                    eventHandlers={{
                      drag: (e) => {
                        // Cập nhật biên polygon theo con trỏ ngay lập tức (không qua state).
                        const pos = (e.target as L.Marker).getLatLng();
                        const next = gf.coordinates.map((c, i) => (i === idx ? [pos.lat, pos.lng] : c)) as [number, number][];
                        editPolygonRef.current?.setLatLngs(next);
                      },
                      dragend: (e) => handleDragVertexEnd(gf.id, idx, e),
                      contextmenu: () => handleDeleteVertex(gf.id, idx),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -12]} className="gs-vtx-tip">
                      {coord[0].toFixed(5)}, {coord[1].toFixed(5)}
                    </Tooltip>
                  </Marker>
                ))}

                {/* Midpoint insert markers — click to add a new vertex */}
                {gf.coordinates.map((coord, idx) => {
                  const nextIdx = (idx + 1) % gf.coordinates.length;
                  const next = gf.coordinates[nextIdx];
                  const midLat = (coord[0] + next[0]) / 2;
                  const midLng = (coord[1] + next[1]) / 2;
                  return (
                    <Marker
                      key={`${gf.id}-mid${idx}`}
                      position={[midLat, midLng]}
                      icon={createMidpointIcon(gf.color)}
                      eventHandlers={{ click: () => handleAddVertex(gf.id, idx, [midLat, midLng]) }}
                    >
                      <Tooltip direction="top" offset={[0, -9]} className="gs-vtx-tip">
                        + Thêm đỉnh tại đây
                      </Tooltip>
                    </Marker>
                  );
                })}

                {/* Center drag marker */}
                <Marker
                  key={`${gf.id}-center`}
                  position={getPolygonCentroid(gf.coordinates)}
                  draggable
                  icon={createCenterMoveIcon(gf.color)}
                  eventHandlers={{
                    dragstart: (e) => {
                      const pos = (e.target as L.Marker).getLatLng();
                      centerStartRef.current = { lat: pos.lat, lng: pos.lng };
                      handleCenterDragStart(e);
                    },
                    drag: (e) => {
                      // Dời cả vùng theo con trỏ realtime.
                      if (!centerStartRef.current) return;
                      const pos = (e.target as L.Marker).getLatLng();
                      const dLat = pos.lat - centerStartRef.current.lat;
                      const dLng = pos.lng - centerStartRef.current.lng;
                      const next = gf.coordinates.map((c) => [c[0] + dLat, c[1] + dLng]) as [number, number][];
                      editPolygonRef.current?.setLatLngs(next);
                    },
                    dragend: (e) => {
                      centerStartRef.current = null;
                      handleCenterDragEnd(gf.id, e);
                    },
                  }}
                />
              </>
            );
          })()}

        {/* ── GPS History polylines ── */}
        {devices.map((dev) => {
          const hd = historyState[dev.id]?.data;
          if (!historyVisible[dev.id] || !hd?.items.length) return null;
          const positions = hd.items
            .filter((p) => p.lat !== 0 && p.lng !== 0)
            .map((p) => [p.lat, p.lng] as [number, number]);
          if (positions.length < 2) return null;
          return (
            <Polyline key={`history-${dev.id}`} positions={positions} pathOptions={{ color: dev.color, weight: 4, opacity: 0.55 }}>
              <Popup>
                <Box sx={{ minWidth: 190, p: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Lịch sử — {dev.name}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {hd.items.length} điểm · Trang {hd.page}/{hd.totalPages}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Từ: {hd.items[0]?.timestamp ? new Date(hd.items[0].timestamp).toLocaleString('vi-VN') : '—'}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Đến: {hd.items[hd.items.length - 1]?.timestamp ? new Date(hd.items[hd.items.length - 1].timestamp).toLocaleString('vi-VN') : '—'}
                  </Typography>
                </Box>
              </Popup>
            </Polyline>
          );
        })}

        {/* ── History S/E markers ── */}
        {devices.flatMap((dev) => {
          const hd = historyState[dev.id]?.data;
          if (!historyVisible[dev.id] || !hd?.items.length) return [];
          const pts = hd.items.filter((p) => p.lat !== 0 && p.lng !== 0);
          if (!pts.length) return [];
          const first = pts[0];
          const last = pts[pts.length - 1];
          const markers = [];
          if (first !== last)
            markers.push(
              <Marker key={`hs-${dev.id}`} position={[first.lat, first.lng]} icon={createHistoryMarkerIcon('S', dev.color)}>
                <Popup>
                  <Typography variant="caption">
                    Bắt đầu: {first.timestamp ? new Date(first.timestamp).toLocaleString('vi-VN') : '—'}
                    {(first.batteryVoltage != null || first.externalVoltage != null) &&
                      ` · ${((first.batteryVoltage ?? first.externalVoltage) as number)?.toFixed(2) ?? '—'}V`}
                  </Typography>
                </Popup>
              </Marker>
            );
          markers.push(
            <Marker key={`he-${dev.id}`} position={[last.lat, last.lng]} icon={createHistoryMarkerIcon('E', '#ef4444')}>
              <Popup>
                <Typography variant="caption">
                  Kết thúc: {last.timestamp ? new Date(last.timestamp).toLocaleString('vi-VN') : '—'}
                  {(last.batteryVoltage != null || last.externalVoltage != null) &&
                    ` · ${((last.batteryVoltage ?? last.externalVoltage) as number)?.toFixed(2) ?? '—'}V`}
                </Typography>
              </Popup>
            </Marker>
          );
          return markers;
        })}

        {/* ── Live path trails ── */}
        {showTrails &&
          devices.map((dev) =>
            dev.pathHistory.length > 1 ? (
              <Polyline
                key={`trail-${dev.id}`}
                positions={dev.pathHistory}
                pathOptions={{
                  color: deviceViolations[dev.id] ? '#ef4444' : dev.color,
                  weight: 2,
                  dashArray: '5,10',
                  opacity: 0.7,
                }}
              />
            ) : null
          )}

        {/* ── GPS accuracy circles ── */}
        {showAccuracyCircles &&
          devices.map((dev) => (
            <Circle
              key={`acc-${dev.id}`}
              center={dev.coords}
              radius={dev.status.gpsAccuracy}
              pathOptions={{
                color: dev.color,
                fillColor: dev.color,
                fillOpacity: 0.08,
                weight: 1,
                dashArray: '4,3',
              }}
            />
          ))}

        {/* ── Device markers ── */}
        {devices.map((dev) => (
          <Marker
            key={dev.id}
            position={dev.coords}
            icon={createDeviceIcon(dev.angle, !!deviceViolations[dev.id], dev.color, dev.id === selectedDeviceId)}
            eventHandlers={{
              click: () => {
                setSelectedDeviceId(dev.id);
                setActiveTab(0);
              },
            }}
          >
            <Popup>
              <Box sx={{ minWidth: 210, p: 0.5 }}>
                <Stack direction="row" spacing={0.5} alignItems="center" mb={0.5}>
                  <Location size="16" variant="Bold" color={dev.color} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {dev.name}
                  </Typography>
                </Stack>
                {dev.subject && (
                  <Box sx={{ bgcolor: 'rgba(0,0,0,0.04)', borderRadius: 1.5, p: 1, mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {dev.subject.fullName}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ color: '#ef4444', fontWeight: 600 }}>
                      {dev.subject.crime}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Mãn hạn: {dev.subject.releaseDate || '—'}
                    </Typography>
                  </Box>
                )}

                {dev.subject &&
                  (() => {
                    const bio = getMockBiometrics(dev.id);
                    return (
                      <Box sx={{ mt: 1, borderTop: '1px solid rgba(0,0,0,0.06)', pt: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#2b5eaf', textTransform: 'uppercase', display: 'block', mb: 0.5, fontSize: '0.65rem' }}>
                          Cảm biến &amp; Phần cứng
                        </Typography>
                        <Stack spacing={0.25}>
                          {[
                            { k: 'Khóa vòng chân', v: bio.isTampered ? '⚠ PHÁT HIỆN THÁO' : '✓ Ổn định', c: bio.isTampered ? '#ef4444' : '#22c55e', blink: bio.isTampered },
                            { k: 'Điện áp Pin',    v: dev.status.batteryVoltage != null ? `${dev.status.batteryVoltage.toFixed(2)}V` : '—' },
                            { k: 'Số vệ tinh',     v: `${dev.status.satelliteCount} vệ tinh` },
                            { k: 'Trạng thái GPS', v: dev.status.gpsFix ? 'Đã định vị (Fix)' : 'Chưa định vị', c: dev.status.gpsFix ? '#22c55e' : '#f59e0b' },
                          ].map((row) => (
                            <Stack key={row.k} direction="row" justifyContent="space-between">
                              <Typography variant="caption" color="text.secondary">{row.k}:</Typography>
                              <Typography variant="caption" className={row.blink ? 'gs-blink' : ''} sx={{ fontWeight: 700, color: row.c }}>
                                {row.v}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    );
                  })()}

                <Typography variant="caption" display="block" sx={{ mt: 0.75 }}>
                  IMEI: {dev.uniqueId}
                </Typography>
                <Typography variant="caption" display="block" sx={{ fontSize: '0.68rem' }}>
                  {dev.coords[0].toFixed(6)}, {dev.coords[1].toFixed(6)}
                </Typography>
                <Typography variant="caption" display="block">
                  Pin: {dev.status.battery}% · GPS ±{dev.status.gpsAccuracy}m
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ color: deviceViolations[dev.id] ? '#ef4444' : '#22c55e', fontWeight: 700, mt: 0.5 }}
                >
                  {deviceViolations[dev.id] ? '⚠ VI PHẠM VÙNG CẤM' : '✓ Trong vùng giám sát'}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
}
