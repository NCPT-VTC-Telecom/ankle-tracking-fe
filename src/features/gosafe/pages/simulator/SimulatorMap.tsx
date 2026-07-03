import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Polyline, Polygon, ScaleControl, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import type { Device, Geofence } from '../tracking/types';
import { createDeviceIcon, createHistoryMarkerIcon } from '../tracking/mapIcons';
import { TILE_URLS } from '../tracking/components/TrackingMap/components/tileConfig';

export type SimMode = 'position' | 'route';

interface Props {
  isDark: boolean;
  primaryColor: string;
  devices: Device[];
  selectedDeviceId: string;
  onSelectDevice: (id: string) => void;
  mapCenter: [number, number];
  mapZoom: number;
  geofences: Geofence[];
  mode: SimMode;
  /** Vị trí "nháp" của thiết bị đang chọn khi kéo marker (chưa gửi API). */
  pendingCoords: [number, number] | null;
  onDeviceDragged: (device: Device, lat: number, lng: number) => void;
  /** Route mode: click bản đồ để thêm waypoint. */
  waypoints: [number, number][];
  onAddWaypoint: (lat: number, lng: number) => void;
  onMoveWaypoint: (idx: number, lat: number, lng: number) => void;
}

/** Bắt click trên bản đồ để thêm waypoint (chỉ ở chế độ route). */
function MapClickHandler({ enabled, onClick }: { enabled: boolean; onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (enabled) onClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

/** Giữ view đồng bộ khi center/zoom đổi (vd chọn thiết bị khác). */
function ViewUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1], zoom]);
  return null;
}

export default function SimulatorMap({
  isDark,
  primaryColor,
  devices,
  selectedDeviceId,
  onSelectDevice,
  mapCenter,
  mapZoom,
  geofences,
  mode,
  pendingCoords,
  onDeviceDragged,
  waypoints,
  onAddWaypoint,
  onMoveWaypoint
}: Props) {
  const tileUrl = isDark ? TILE_URLS.dark : TILE_URLS.light;
  const drawableGeofences = useMemo(
    () => geofences.filter((g) => g.active && g.coordinates.length >= 3),
    [geofences]
  );

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      attributionControl={false}
      zoomControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      <ScaleControl position="bottomright" metric imperial={false} />
      <TileLayer key={isDark ? 'dark' : 'light'} url={tileUrl} />
      <ViewUpdater center={mapCenter} zoom={mapZoom} />
      <MapClickHandler enabled={mode === 'route'} onClick={onAddWaypoint} />

      {/* Vùng giám sát (chỉ để tham chiếu ngữ cảnh) */}
      {drawableGeofences.map((g) => (
        <Polygon
          key={g.id}
          positions={g.coordinates as L.LatLngExpression[]}
          pathOptions={{ color: g.color, weight: 1.5, fillColor: g.color, fillOpacity: 0.08, dashArray: '4 4' }}
        />
      ))}

      {/* Lộ trình nháp (route mode) */}
      {mode === 'route' && waypoints.length >= 2 && (
        <Polyline
          positions={waypoints as L.LatLngExpression[]}
          pathOptions={{ color: primaryColor, weight: 3, opacity: 0.9, dashArray: '6 6' }}
        />
      )}
      {mode === 'route' &&
        waypoints.map((wp, idx) => (
          <Marker
            key={`wp-${idx}`}
            position={wp}
            draggable
            icon={createHistoryMarkerIcon(String(idx + 1), primaryColor)}
            eventHandlers={{
              dragend: (e) => {
                const p = (e.target as L.Marker).getLatLng();
                onMoveWaypoint(idx, p.lat, p.lng);
              }
            }}
          />
        ))}

      {/* Marker thiết bị — kéo được ở chế độ position */}
      {devices.map((dev) => {
        const selected = dev.id === selectedDeviceId;
        // Thiết bị đang chọn hiển thị ở vị trí nháp (nếu đang kéo dở) để phản hồi tức thì.
        const coords: [number, number] = selected && pendingCoords ? pendingCoords : dev.coords;
        return (
          <Marker
            key={dev.id}
            position={coords}
            draggable={mode === 'position' && selected}
            icon={createDeviceIcon(dev.angle, false, dev.color, selected)}
            eventHandlers={{
              click: () => onSelectDevice(dev.id),
              dragend: (e) => {
                const p = (e.target as L.Marker).getLatLng();
                onDeviceDragged(dev, p.lat, p.lng);
              }
            }}
          />
        );
      })}
    </MapContainer>
  );
}
