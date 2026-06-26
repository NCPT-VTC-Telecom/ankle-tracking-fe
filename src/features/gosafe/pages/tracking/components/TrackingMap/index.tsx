import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import { Box, Button } from '@mui/material';
import { MapContainer, TileLayer, ScaleControl } from 'react-leaflet';
import { Eye } from 'iconsax-react';
import 'leaflet/dist/leaflet.css';
import type { TrackingStore } from '../../useTracking';
import { getPolygonCentroid, getPolygonArea, getPolygonPerimeter, fmtArea, fmtPerimeter } from '../../utils';

import { TILE_URLS, HYBRID_LABELS_URL, type MapLayer } from './components/tileConfig';
import { MapViewUpdater, MapRefCapture, MapCullController } from './components/MapControllers';
import { DeviceMarker } from './components/DeviceMarker';
import GeofenceLayer from './components/GeofenceLayer';
import GeofenceEditHandles from './components/GeofenceEditHandles';
import HistoryLayer from './components/HistoryLayer';
import TrailLayer from './components/TrailLayer';
import MapControlPanel from './components/MapControlPanel';
import EditPanel from './components/EditPanel';

interface Props {
  store: TrackingStore;
  hideOverlays?: boolean;
}

/**
 * Container bản đồ theo dõi — chứa state UI + các hàm xử lý, rồi truyền xuống các
 * component con (presentational) trong ./components. Dữ liệu đến từ store (list 1 lần
 * khi mount + SSE /stream), bản đồ chỉ render thành phần trong khu vực đang focus.
 */
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
  } = store;

  // ── UI state ────────────────────────────────────────────────────────────────
  const [mapLayer, setMapLayer] = useState<MapLayer>(isDark ? 'dark' : 'light');
  const [showGeofences, setShowGeofences] = useState(true);
  const [showGfLabels, setShowGfLabels] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [showAccuracyCircles, setShowAccuracyCircles] = useState(false);
  useEffect(() => { setMapLayer(isDark ? 'dark' : 'light'); }, [isDark]);

  // ── Viewport culling (streaming GTA) ──────────────────────────────────────────
  const [renderBounds, setRenderBounds] = useState<L.LatLngBounds | null>(null);
  const [viewMoved, setViewMoved] = useState(false);
  const pendingBoundsRef = useRef<L.LatLngBounds | null>(null);
  const renderBoundsRef = useRef<L.LatLngBounds | null>(null);
  useEffect(() => { renderBoundsRef.current = renderBounds; }, [renderBounds]);

  // Vùng render ĐÓNG BĂNG (đổi khi bấm "Xem khu vực này"/lần đầu). Pan/zoom ra ngoài
  // chỉ bật cờ viewMoved (rẻ) — không re-render marker.
  const handleViewportChange = useCallback((b: L.LatLngBounds) => {
    pendingBoundsRef.current = b;
    const rb = renderBoundsRef.current;
    if (!rb) { setRenderBounds(b); return; }
    setViewMoved(!rb.pad(0.3).contains(b));
  }, []);

  const applyPendingView = useCallback(() => {
    if (pendingBoundsRef.current) setRenderBounds(pendingBoundsRef.current);
    setViewMoved(false);
  }, []);

  const inRender = useCallback(
    (latlng: [number, number]) => !renderBounds || renderBounds.pad(0.3).contains(latlng),
    [renderBounds]
  );
  const visibleDevices = useMemo(() => devices.filter((d) => inRender(d.coords)), [devices, inRender]);
  const visibleGeofences = useMemo(
    () => geofences.filter((g) => g.coordinates.length >= 3 && inRender(getPolygonCentroid(g.coordinates))),
    [geofences, inRender]
  );

  const handleSelectDevice = useCallback((id: string) => {
    setSelectedDeviceId(id);
    setActiveTab(0);
  }, [setSelectedDeviceId, setActiveTab]);

  // ── Map refs ──────────────────────────────────────────────────────────────────
  const mapRef = useRef<L.Map | null>(null);
  const editPolygonRef = useRef<L.Polygon | null>(null);
  const centerStartRef = useRef<{ lat: number; lng: number } | null>(null);

  const fitAll = useCallback(() => {
    if (!mapRef.current) return;
    const pts: L.LatLng[] = [
      ...devices.map((d) => L.latLng(d.coords[0], d.coords[1])),
      ...geofences.filter((g) => g.active).flatMap((g) => g.coordinates.map((c) => L.latLng(c[0], c[1]))),
    ];
    if (pts.length > 0) mapRef.current.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 18 });
  }, [devices, geofences]);

  // ── Derived (glass tokens + edit metrics) ─────────────────────────────────────
  const glassBg = isDark ? 'rgba(9,13,31,0.84)' : 'rgba(255,255,255,0.84)';
  const glassBdr = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)';
  const glassBlur = 'blur(24px) saturate(1.6)';
  const txtColor = isDark ? '#f8fafc' : '#0f172a';

  const editGf = editingGeofenceId ? geofences.find((g) => g.id === editingGeofenceId) ?? null : null;
  const editArea = editGf ? fmtArea(getPolygonArea(editGf.coordinates)) : null;
  const editPerimeter = editGf ? fmtPerimeter(getPolygonPerimeter(editGf.coordinates)) : null;

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* CSS cho nhãn vùng + tooltip đỉnh */}
      <style>{`
        .gs-gf-label { background: transparent !important; border: none !important; box-shadow: none !important; padding: 2px 4px !important; }
        .gs-gf-label::before { display: none !important; }
        .gs-vtx-tip {
          background: rgba(9,13,31,0.88) !important; border: 1px solid rgba(255,255,255,0.15) !important;
          color: #e2e8f0 !important; font-size: 10px !important; font-family: 'Inter var', Inter, sans-serif !important;
          padding: 2px 7px !important; border-radius: 5px !important; white-space: nowrap !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.35) !important;
        }
        .gs-vtx-tip::before { display: none !important; }
      `}</style>

      <EditPanel
        editingGeofenceId={editingGeofenceId}
        editGf={editGf}
        editArea={editArea}
        editPerimeter={editPerimeter}
        onFinish={finishEditingGeofence}
        onCancel={cancelEditingGeofence}
        isDark={isDark}
        glassBg={glassBg}
        glassBdr={glassBdr}
        glassBlur={glassBlur}
        txtColor={txtColor}
      />

      {!hideOverlays && (
        <MapControlPanel
          mapLayer={mapLayer}
          setMapLayer={setMapLayer}
          showGeofences={showGeofences}
          setShowGeofences={setShowGeofences}
          showGfLabels={showGfLabels}
          setShowGfLabels={setShowGfLabels}
          showTrails={showTrails}
          setShowTrails={setShowTrails}
          showAccuracyCircles={showAccuracyCircles}
          setShowAccuracyCircles={setShowAccuracyCircles}
          onFitAll={fitAll}
          primaryColor={store.primaryColor}
          isDark={isDark}
          glassBg={glassBg}
          glassBdr={glassBdr}
          glassBlur={glassBlur}
          txtColor={txtColor}
        />
      )}

      {/* Nút "Xem khu vực này" — khi pan ra ngoài vùng đang render (tiết kiệm RAM) */}
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
        <ScaleControl position="bottomright" metric imperial={false} />

        <TileLayer key={mapLayer === 'hybrid' ? 'satellite' : mapLayer} url={TILE_URLS[mapLayer]} />
        {mapLayer === 'hybrid' && <TileLayer url={HYBRID_LABELS_URL} opacity={0.88} />}

        <MapViewUpdater center={mapCenter} zoom={mapZoom} follow={followDevice} target={followTarget} />

        {showGeofences && (
          <GeofenceLayer
            geofences={visibleGeofences}
            showLabels={showGfLabels}
            editingGeofenceId={editingGeofenceId}
            editPolygonRef={editPolygonRef}
            gfMetrics={gfMetrics}
            geofenceDevicesMap={geofenceDevicesMap}
            isDark={isDark}
          />
        )}

        {showGeofences && editGf?.active && (
          <GeofenceEditHandles
            gf={editGf}
            editPolygonRef={editPolygonRef}
            centerStartRef={centerStartRef}
            onDragVertexEnd={handleDragVertexEnd}
            onDeleteVertex={handleDeleteVertex}
            onAddVertex={handleAddVertex}
            onCenterDragStart={handleCenterDragStart}
            onCenterDragEnd={handleCenterDragEnd}
          />
        )}

        <HistoryLayer devices={devices} historyState={historyState} historyVisible={historyVisible} />

        <TrailLayer
          devices={visibleDevices}
          showTrails={showTrails}
          showAccuracyCircles={showAccuracyCircles}
          deviceViolations={deviceViolations}
        />

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
