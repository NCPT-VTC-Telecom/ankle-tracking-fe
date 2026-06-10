import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Box, Typography, Stack, Divider, Grid, Chip, Button, Switch, FormControlLabel } from '@mui/material';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup, Tooltip, Circle, ScaleControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Map, Eye, Sun1, Moon, Global, Location, Flash } from 'iconsax-react';
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

const LAYER_OPTS: Array<{ id: MapLayer; label: string; icon: React.ReactNode }> = [
  { id: 'light',     label: 'Sáng',     icon: <Sun1 size="14" />     },
  { id: 'dark',      label: 'Tối',      icon: <Moon size="14" />     },
  { id: 'satellite', label: 'Vệ tinh',  icon: <Global size="14" />   },
  { id: 'hybrid',    label: 'Hỗn hợp', icon: <Location size="14" /> },
  { id: 'terrain',   label: 'Địa hình', icon: <Map size="14" />      },
  { id: 'osm',       label: 'OSM',      icon: <Eye size="14" />      },
];

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
  } = store;

  const [mapLayer, setMapLayer] = useState<MapLayer>(isDark ? 'dark' : 'light');
  const [showGeofences, setShowGeofences] = useState(true);
  const [showGfLabels, setShowGfLabels] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [showAccuracyCircles, setShowAccuracyCircles] = useState(false);

  const mapRef = useRef<L.Map | null>(null);

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
          font-family: 'JetBrains Mono', monospace !important;
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

      {/* ── Edit-mode live metrics ── */}
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
            borderRadius: 2,
            px: 2,
            py: 1.25,
            color: txtColor,
            boxShadow: `0 4px 24px ${editGf.color}30, 0 2px 8px rgba(0,0,0,0.2)`,
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 800, color: editGf.color, display: 'block', mb: 0.75, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            {editGf.name}
          </Typography>
          <Stack direction="row" spacing={2.5}>
            {[
              { label: 'Diện tích', value: editArea },
              { label: 'Chu vi',    value: editPerimeter },
              { label: 'Đỉnh',      value: String(editGf.coordinates.length) },
            ].map((m) => (
              <Box key={m.label}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.6rem', fontWeight: 600 }}>
                  {m.label}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.8rem' }}>
                  {m.value}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* ═══ COMMAND CENTER OVERLAY ═══ */}
      {!hideOverlays && (
        <Box
          className="gs-glass-panel"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1000,
            width: 300,
            bgcolor: glassBg,
            backdropFilter: glassBlur,
            WebkitBackdropFilter: glassBlur,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            borderRadius: 2,
            border: `1px solid ${glassBdr}`,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            color: txtColor,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Flash size="16" variant="Bold" color={store.primaryColor} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                BẢNG CHỈ HUY DI ĐỘNG
              </Typography>
            </Stack>
            <Chip
              label="LIVE SYNC"
              color="success"
              size="small"
              variant="outlined"
              className="gs-blink"
              sx={{ height: 16, fontSize: '0.6rem', fontWeight: 800 }}
            />
          </Stack>

          <Divider sx={{ borderColor: glassBdr }} />

          {/* Quick Stats Grid */}
          <Grid container spacing={1}>
            {[
              { label: 'Trực tuyến',   count: devices.filter((d) => d.status.connectionStatus === 'online').length,  color: '#22c55e' },
              { label: 'Vi phạm',      count: Object.values(deviceViolations).filter(Boolean).length,                 color: '#ef4444', blink: true },
              { label: 'Pin yếu (<20%)', count: devices.filter((d) => d.status.battery < 20).length,                 color: '#f59e0b' },
              { label: 'Ngoại tuyến', count: devices.filter((d) => d.status.connectionStatus === 'offline').length,  color: '#94a3b8' },
            ].map((item) => (
              <Grid item xs={6} key={item.label}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    border: '1px solid',
                    borderColor: glassBdr,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', fontWeight: 600 }}>
                    {item.label}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center" sx={{ mt: 0.25 }}>
                    <Box className={item.blink ? 'gs-blink' : ''} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: item.color }} />
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.95rem' }}>
                      {item.count}
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Active Violations List */}
          <Box sx={{ mt: 0.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 1 }}
            >
              🚨 Cảnh báo khẩn cấp (
              {Object.values(deviceViolations).filter(Boolean).length +
                devices.filter((d) => getMockBiometrics(d.id).isTampered).length}
              )
            </Typography>

            <Stack spacing={1} sx={{ maxHeight: 160, overflowY: 'auto', pr: 0.5 }}>
              {devices.map((dev) => {
                const isViolating = deviceViolations[dev.id];
                const bio = getMockBiometrics(dev.id);
                if (!isViolating && !bio.isTampered) return null;
                const alertType = bio.isTampered ? 'Tháo vòng chân' : 'Ra ngoài Vùng';
                return (
                  <Box
                    key={dev.id}
                    onClick={() => {
                      setSelectedDeviceId(dev.id);
                      store.setMapCenter(dev.coords);
                      store.setMapZoom(17);
                    }}
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      border: '1px solid rgba(239,68,68,0.2)',
                      bgcolor: 'rgba(239,68,68,0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: 'rgba(239,68,68,0.1)', borderColor: '#ef4444' },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#ef4444' }}>
                        {dev.subject?.fullName || dev.name}
                      </Typography>
                      <Chip
                        label={alertType.toUpperCase()}
                        color="error"
                        size="small"
                        className="gs-blink"
                        sx={{ height: 16, fontSize: '0.55rem', fontWeight: 800 }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', mt: 0.25 }}>
                      Vận tốc: {dev.status.speed} km/h · Pin: {dev.status.battery}% · Sóng: {dev.status.signalStrength}/4
                    </Typography>
                  </Box>
                );
              })}
              {Object.values(deviceViolations).filter(Boolean).length === 0 &&
                devices.filter((d) => getMockBiometrics(d.id).isTampered).length === 0 && (
                  <Typography align="center" variant="caption" color="text.secondary" sx={{ display: 'block', py: 1, fontStyle: 'italic' }}>
                    ✓ Chưa phát hiện vi phạm
                  </Typography>
                )}
            </Stack>
          </Box>
        </Box>
      )}

      {/* ═══ MAP CONTROL PANEL ═══ */}
      {!hideOverlays && (
        <Box
          className="gs-glass-panel"
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            zIndex: 1000,
            width: 290,
            bgcolor: glassBg,
            backdropFilter: glassBlur,
            WebkitBackdropFilter: glassBlur,
            boxShadow: `0 8px 32px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.12)`,
            borderRadius: 2,
            border: `1px solid ${glassBdr}`,
            p: 1.75,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.25,
            color: txtColor,
          }}
        >
          {/* ── Tile layer selector ── */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Map size="14" variant="Bold" color={store.primaryColor} />
            <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.68rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Lớp bản đồ
            </Typography>
          </Stack>

          <Grid container spacing={0.75}>
            {LAYER_OPTS.map((layer) => {
              const sel = mapLayer === layer.id;
              return (
                <Grid item xs={4} key={layer.id}>
                  <Button
                    size="small"
                    fullWidth
                    onClick={() => setMapLayer(layer.id)}
                    sx={{
                      py: 0.75,
                      px: 0.25,
                      borderRadius: 1.5,
                      minWidth: 0,
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '0.65rem',
                      flexDirection: 'column',
                      gap: 0.25,
                      border: '1.5px solid',
                      borderColor: sel ? store.primaryColor : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                      bgcolor: sel ? `${store.primaryColor}1a` : 'transparent',
                      color: sel ? store.primaryColor : 'text.secondary',
                      '&:hover': {
                        bgcolor: sel
                          ? `${store.primaryColor}2e`
                          : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      },
                    }}
                  >
                    {layer.icon}
                    {layer.label}
                  </Button>
                </Grid>
              );
            })}
          </Grid>

          <Divider sx={{ borderColor: glassBdr }} />

          {/* ── Display toggles ── */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Eye size="14" variant="Bold" color={store.primaryColor} />
            <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.68rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Hiển thị
            </Typography>
          </Stack>

          <Stack spacing={0.15}>
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
                    size="small"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: store.primaryColor },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: store.primaryColor },
                    }}
                  />
                }
                label={
                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.71rem' }}>
                    {item.label}
                  </Typography>
                }
                sx={{ mx: 0, my: 0 }}
              />
            ))}
          </Stack>

          <Divider sx={{ borderColor: glassBdr }} />

          {/* ── Fit all button ── */}
          <Button
            size="small"
            variant="outlined"
            onClick={fitAll}
            fullWidth
            startIcon={<Location size="14" />}
            sx={{
              borderRadius: 1.5,
              fontSize: '0.73rem',
              fontWeight: 700,
              textTransform: 'none',
              py: 0.75,
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
      <MapContainer center={mapCenter} zoom={mapZoom} attributionControl={false} style={{ width: '100%', height: '100%' }}>
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
                        fontWeight: 800,
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
                    dragstart: handleCenterDragStart,
                    dragend: (e) => handleCenterDragEnd(gf.id, e),
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
                    Từ: {new Date(hd.items[0].timestamp).toLocaleString('vi-VN')}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Đến: {new Date(hd.items[hd.items.length - 1].timestamp).toLocaleString('vi-VN')}
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
                    Bắt đầu: {new Date(first.timestamp).toLocaleString('vi-VN')}
                    {(first.batteryVoltage != null || first.externalVoltage != null) &&
                      ` · ${(first.batteryVoltage ?? first.externalVoltage)?.toFixed(2)}V`}
                  </Typography>
                </Popup>
              </Marker>
            );
          markers.push(
            <Marker key={`he-${dev.id}`} position={[last.lat, last.lng]} icon={createHistoryMarkerIcon('E', '#ef4444')}>
              <Popup>
                <Typography variant="caption">
                  Kết thúc: {new Date(last.timestamp).toLocaleString('vi-VN')}
                  {(last.batteryVoltage != null || last.externalVoltage != null) &&
                    ` · ${(last.batteryVoltage ?? last.externalVoltage)?.toFixed(2)}V`}
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
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
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
                    const dbmVal =
                      dev.status.signalStrength === 4 ? '-65 dBm' :
                      dev.status.signalStrength === 3 ? '-80 dBm' :
                      dev.status.signalStrength === 2 ? '-95 dBm' :
                      dev.status.signalStrength === 1 ? '-108 dBm' : 'Mất sóng';
                    return (
                      <Box sx={{ mt: 1, borderTop: '1px solid rgba(0,0,0,0.06)', pt: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#2b5eaf', textTransform: 'uppercase', display: 'block', mb: 0.5, fontSize: '0.65rem' }}>
                          Cảm biến &amp; Phần cứng
                        </Typography>
                        <Stack spacing={0.25}>
                          {[
                            { k: 'Khóa vòng chân', v: bio.isTampered ? '⚠ PHÁT HIỆN THÁO' : '✓ Ổn định', c: bio.isTampered ? '#ef4444' : '#22c55e', blink: bio.isTampered },
                            { k: 'Điện áp Pin',    v: dev.status.batteryVoltage != null ? `${dev.status.batteryVoltage.toFixed(2)}V` : '—' },
                            { k: 'Vận tốc',        v: `${dev.status.speed || 0} km/h` },
                            { k: 'Độ cao',         v: `${dev.status.altitude || 0} m` },
                            { k: 'GSM / Vệ tinh',  v: `${dbmVal} · ${dev.status.satelliteCount} vệ tinh` },
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
                <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace', fontSize: '0.68rem' }}>
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
