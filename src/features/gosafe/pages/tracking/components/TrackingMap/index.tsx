import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import { Box } from '@mui/material';
import { MapContainer, TileLayer, ScaleControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { TrackingStore } from '../../useTracking';
import { getPolygonArea, getPolygonPerimeter, fmtArea, fmtPerimeter } from '../../utils';

import { TILE_URLS, HYBRID_LABELS_URL, type MapLayer } from './components/tileConfig';
import { MapViewUpdater, MapRefCapture } from './components/MapControllers';
import { DeviceMarker } from './components/DeviceMarker';
import DeviceClusterGroup from './components/DeviceClusterGroup';
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
 * Container bản đồ theo dõi — chỉ chứa state UI + các hàm xử lý, rồi truyền xuống
 * các component con (presentational) trong ./components.
 *
 * Kiến trúc DATA vs RENDER:
 *  - DATA: store giữ ĐỦ thiết bị (REST seed + SSE coalesced) → không bỏ sót → không bug.
 *  - RENDER: marker được GOM CỤM (DeviceClusterGroup) để nhẹ khi có nhiều thiết bị;
 *    thiết bị đang chọn / vi phạm được render RỜI để luôn nổi (không bị nuốt vào cụm).
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

  // ── Chia thiết bị: gom cụm vs render rời ──────────────────────────────────────
  // Selected / vi phạm → render rời (luôn thấy). Còn lại → gom cụm.
  const standaloneDevices = useMemo(
    () => devices.filter((d) => d.id === selectedDeviceId || !!deviceViolations[d.id]),
    [devices, selectedDeviceId, deviceViolations]
  );
  const clusteredDevices = useMemo(
    () => devices.filter((d) => d.id !== selectedDeviceId && !deviceViolations[d.id]),
    [devices, selectedDeviceId, deviceViolations]
  );
  // Vùng cấm vẽ được: đang bật + đủ 3 đỉnh.
  const drawableGeofences = useMemo(
    () => geofences.filter((g) => g.active && g.coordinates.length >= 3),
    [geofences]
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
    if (pts.length === 0) return;
    mapRef.current.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 18 });
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
      {/* CSS cho nhãn vùng + tooltip đỉnh + bong bóng cụm */}
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
        .gs-cluster-wrap { background: transparent !important; border: none !important; }
        .gs-cluster {
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; color: #fff; font-weight: 800; font-size: 13px;
          font-family: 'Inter var', Inter, sans-serif;
          border: 3px solid rgba(255,255,255,0.85);
          box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        }
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

      {/* ═══ MAP ═══ */}
      <MapContainer center={mapCenter} zoom={mapZoom} attributionControl={false} zoomControl={false} style={{ width: '100%', height: '100%' }}>
        <MapRefCapture mapRef={mapRef} />
        <ScaleControl position="bottomright" metric imperial={false} />

        <TileLayer key={mapLayer === 'hybrid' ? 'satellite' : mapLayer} url={TILE_URLS[mapLayer]} />
        {mapLayer === 'hybrid' && <TileLayer url={HYBRID_LABELS_URL} opacity={0.88} />}

        <MapViewUpdater center={mapCenter} zoom={mapZoom} follow={followDevice} target={followTarget} />

        {showGeofences && (
          <GeofenceLayer
            geofences={drawableGeofences}
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
          devices={devices}
          showTrails={showTrails}
          showAccuracyCircles={showAccuracyCircles}
          deviceViolations={deviceViolations}
        />

        {/* Thiết bị bình thường → gom cụm (nhẹ) */}
        <DeviceClusterGroup
          devices={clusteredDevices}
          selectedDeviceId={selectedDeviceId}
          deviceViolations={deviceViolations}
          isDark={isDark}
          primaryColor={store.primaryColor}
          onSelect={handleSelectDevice}
        />

        {/* Thiết bị chọn / vi phạm → render rời, luôn nổi */}
        {standaloneDevices.map((dev) => (
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
