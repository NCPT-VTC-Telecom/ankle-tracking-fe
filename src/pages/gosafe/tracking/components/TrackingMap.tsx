import { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import type { Device } from '../types';
import L from 'leaflet';
import { Box, Typography, Stack, Divider, Grid, Button, Switch, FormControlLabel, Chip } from '@mui/material';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup, Tooltip, Circle, ScaleControl, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Map, Eye, Location } from 'iconsax-react';
import { createDeviceIcon, createVertexIcon, createCenterMoveIcon, createHistoryMarkerIcon, createMidpointIcon } from '../mapIcons';
import { getPolygonCentroid, getPolygonArea, getPolygonPerimeter, fmtArea, fmtPerimeter, formatDateVN } from '../utils';
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

/** Tải thiết bị trong khung nhìn qua device_management/map mỗi khi pan/zoom. */
function MapBoundsLoader({ onBounds }: { onBounds: (swLat: number, swLng: number, neLat: number, neLng: number) => void }) {
  const fire = (m: L.Map) => {
    const b = m.getBounds();
    onBounds(b.getSouth(), b.getWest(), b.getNorth(), b.getEast());
  };
  const map = useMapEvents({
    moveend: () => fire(map),
    zoomend: () => fire(map)
  });
  useEffect(() => { fire(map); /* nạp lần đầu */ }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/**
 * Streaming kiểu GTA: báo khung nhìn hiện tại mỗi khi pan/zoom để culling — chỉ render
 * thành phần trong khu vực đang focus.
 */
function MapCullController({ onView }: { onView: (b: L.LatLngBounds) => void }) {
  const map = useMapEvents({
    moveend: () => onView(map.getBounds()),
    zoomend: () => onView(map.getBounds())
  });
  useEffect(() => { onView(map.getBounds()); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/**
 * Marker thiết bị memo-hoá — chỉ re-render khi field ẢNH HƯỞNG hiển thị đổi (vị trí, góc,
 * màu, chọn, vi phạm, hồ sơ). Các gói SSE chỉ đổi pin/đồng bộ → KHÔNG re-render marker.
 */
interface DeviceMarkerProps {
  dev: Device;
  selected: boolean;
  violating: boolean;
  isDark: boolean;
  onSelect: (id: string) => void;
}
const DeviceMarker = memo(
  function DeviceMarker({ dev, selected, violating, isDark, onSelect }: DeviceMarkerProps) {
    const icon = useMemo(
      () => createDeviceIcon(dev.angle, violating, dev.color, selected),
      [dev.angle, violating, dev.color, selected]
    );
    return (
      <Marker
        position={dev.coords}
        icon={icon}
        eventHandlers={{ click: () => onSelect(dev.id) }}
      >
        <Popup>
          <Box sx={{ minWidth: 220, p: 0.5 }}>
            {dev.subject ? (
              <Stack spacing={1}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Location size="16" variant="Bold" color={dev.color} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a' }}>
                    {dev.subject.fullName}
                  </Typography>
                </Stack>
                <Chip
                  label={dev.subject.crime || dev.subject.sentence || 'Chưa phân loại'}
                  size="small"
                  sx={{ alignSelf: 'flex-start', height: 20, fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', bgcolor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '6px' }}
                />
                <Divider sx={{ my: 0.25, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
                <Stack spacing={0.25}>
                  {dev.subject.startDate && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>Bắt đầu:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem' }}>{formatDateVN(dev.subject.startDate)}</Typography>
                    </Stack>
                  )}
                  {dev.subject.releaseDate && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>Mãn hạn:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem' }}>{formatDateVN(dev.subject.releaseDate)}</Typography>
                    </Stack>
                  )}
                </Stack>
                <Divider sx={{ my: 0.25, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
                <Box sx={{ p: 0.75, borderRadius: '6px', textAlign: 'center', bgcolor: violating ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', border: `1.5px solid ${violating ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)'}` }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.72rem', color: violating ? '#ef4444' : '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    {violating ? '⚠ VI PHẠM VÙNG CẤM' : '✓ Trong vùng giám sát'}
                  </Typography>
                </Box>
              </Stack>
            ) : (
              <Stack spacing={1}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Location size="16" variant="Bold" color={dev.color} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{dev.name}</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">Thiết bị chưa gán hồ sơ</Typography>
              </Stack>
            )}
          </Box>
        </Popup>
      </Marker>
    );
  },
  // Bỏ qua re-render khi chỉ pin/điện áp/đồng bộ đổi (không ảnh hưởng marker).
  (p, n) =>
    p.selected === n.selected &&
    p.violating === n.violating &&
    p.isDark === n.isDark &&
    p.onSelect === n.onSelect &&
    p.dev.coords[0] === n.dev.coords[0] &&
    p.dev.coords[1] === n.dev.coords[1] &&
    p.dev.angle === n.dev.angle &&
    p.dev.color === n.dev.color &&
    p.dev.name === n.dev.name &&
    p.dev.subject === n.dev.subject
);

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  store: TrackingStore;
  hideOverlays?: boolean;
}

export default function TrackingMap({ store, hideOverlays = false }: Props) {
  const {
    isDark,
    scopedDevices: devices,
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
    cancelEditingGeofence,
    fetchDevicesInBounds,
    mapTruncated
  } = store;

  const [mapLayer, setMapLayer] = useState<MapLayer>(isDark ? 'dark' : 'light');
  const [showGeofences, setShowGeofences] = useState(true);
  const [showGfLabels, setShowGfLabels] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [showAccuracyCircles, setShowAccuracyCircles] = useState(false);

  // ── Viewport culling (streaming GTA) ──────────────────────────────────────────
  // Chỉ render thành phần trong khu vực đang render (renderBounds). Khi BÁM thiết bị →
  // tự stream theo. Khi pan tự do ra ngoài → hiện nút "Xem khu vực này" (không auto render).
  const [renderBounds, setRenderBounds] = useState<L.LatLngBounds | null>(null);
  const [viewMoved, setViewMoved] = useState(false);
  const pendingBoundsRef = useRef<L.LatLngBounds | null>(null);
  const renderBoundsRef = useRef<L.LatLngBounds | null>(null);
  useEffect(() => { renderBoundsRef.current = renderBounds; }, [renderBounds]);

  // Vùng render ĐÓNG BĂNG (chỉ đổi khi bấm "Xem khu vực này" / lần đầu). Pan/zoom KHÔNG
  // re-render marker → hiệu năng cao như Google Maps. Pan/zoom ra ngoài vùng đang render
  // (+ đệm) → chỉ bật cờ viewMoved (rẻ) để hiện nút.
  const handleViewportChange = useCallback((b: L.LatLngBounds) => {
    pendingBoundsRef.current = b;
    const rb = renderBoundsRef.current;
    if (!rb) { setRenderBounds(b); return; }   // lần đầu
    setViewMoved(!rb.pad(0.3).contains(b));      // khung nhìn vượt ra ngoài vùng đã render
  }, []);

  const applyPendingView = () => {
    if (pendingBoundsRef.current) {
      setRenderBounds(pendingBoundsRef.current);
      const b = pendingBoundsRef.current;
      fetchDevicesInBounds?.(b.getSouth(), b.getWest(), b.getNorth(), b.getEast());
    }
    setViewMoved(false);
  };

  // Chỉ giữ thành phần trong vùng render (+ đệm 30% để mép không bị trống).
  const inRender = useCallback(
    (latlng: [number, number]) => !renderBounds || renderBounds.pad(0.3).contains(latlng),
    [renderBounds]
  );
  const visibleDevices = useMemo(() => devices.filter((d) => inRender(d.coords)), [devices, inRender]);
  const handleSelectDevice = useCallback((id: string) => {
    setSelectedDeviceId(id);
    setActiveTab(0);
  }, [setSelectedDeviceId, setActiveTab]);
  const visibleGeofences = useMemo(
    () => geofences.filter((g) => g.coordinates.length >= 3 && inRender(getPolygonCentroid(g.coordinates))),
    [geofences, inRender]
  );

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

      {/* Cảnh báo khi device_management/map cắt còn 500 thiết bị trong khung */}
      {mapTruncated && (
        <Box sx={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 1200, px: 1.75, py: 0.6, borderRadius: '999px', bgcolor: 'rgba(245,158,11,0.95)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, boxShadow: '0 4px 14px rgba(0,0,0,0.25)', pointerEvents: 'none' }}>
          Đang hiển thị tối đa 500 thiết bị — phóng to để xem chi tiết
        </Box>
      )}

      {/* Nút "Xem khu vực này" — khi pan tự do ra ngoài vùng đang render (tiết kiệm RAM) */}
      {viewMoved && (
        <Box sx={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 1200 }}>
          <Button
            onClick={applyPendingView}
            startIcon={<Eye size={16} />}
            variant="contained"
            sx={{ borderRadius: '999px', fontWeight: 700, fontSize: '0.78rem', px: 2.25, py: 0.6, textTransform: 'none', boxShadow: '0 6px 20px rgba(0,0,0,0.28)', bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' } }}
          >
            Xem khu vực này
          </Button>
        </Box>
      )}

      {/* ═══ MAP ═══ */}
      <MapContainer center={mapCenter} zoom={mapZoom} attributionControl={false} zoomControl={false} style={{ width: '100%', height: '100%' }}>
        <MapRefCapture mapRef={mapRef} />
        <MapCullController onView={handleViewportChange} />
        {fetchDevicesInBounds && (
          <MapBoundsLoader onBounds={(s, w, n, e) => fetchDevicesInBounds(s, w, n, e)} />
        )}
        <ScaleControl position="bottomright" metric imperial={false} />

        {/* Base tile layer — hybrid shares key with satellite so no remount on switch */}
        <TileLayer
          key={mapLayer === 'hybrid' ? 'satellite' : mapLayer}
          url={TILE_URLS[mapLayer]}
        />
        {/* Hybrid labels overlay */}
        {mapLayer === 'hybrid' && <TileLayer url={HYBRID_LABELS_URL} opacity={0.88} />}

        <MapViewUpdater center={mapCenter} zoom={mapZoom} follow={followDevice} target={followTarget} />

        {/* ── Geofence polygons (chỉ vùng trong khu vực đang render) ── */}
        {showGeofences &&
          visibleGeofences.map((gf) => {
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
          visibleDevices.map((dev) =>
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
          visibleDevices.map((dev) => (
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

        {/* ── Device markers (memo-hoá + chỉ thiết bị trong khu vực đang render) ── */}
        {visibleDevices.map((dev) => (
          <DeviceMarker
            key={dev.id}
            dev={dev}
            selected={dev.id === selectedDeviceId}
            violating={!!deviceViolations[dev.id]}
            isDark={isDark}
            onSelect={handleSelectDevice}
          />
        ))}
      </MapContainer>
    </Box>
  );
}
