import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  createDeviceIcon,
  createVertexIcon,
  createCenterMoveIcon,
  createHistoryMarkerIcon
} from '../mapIcons';
import { getPolygonCentroid } from '../utils';
import type { TrackingStore } from '../useTracking';

// ── Map sub-components ────────────────────────────────────────────────────────

function MapViewUpdater({
  center,
  zoom,
  follow,
  target
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

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  store: TrackingStore;
}

export default function TrackingMap({ store }: Props) {
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
    setSelectedDeviceId,
    setActiveTab
  } = store;

  return (
    <>
      {/* Floating hint — chỉ hiện khi đang chỉnh sửa geofence */}
      {editingGeofenceId && (
        <Box
          className="gs-map-hint"
          sx={{
            bgcolor: isDark ? 'rgba(9,13,31,0.88)' : 'rgba(255,255,255,0.88)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700 }} color="text.secondary">
            614 Điện Biên Phủ, P.Vườn Lài, Q.Phú Nhuận, TP.HCM
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, mt: 0.5, lineHeight: 1.7, color: '#f59e0b' }}
          >
            Kéo ○ (đỉnh) hoặc ✛ (trung tâm) để sửa ranh giới vùng.
          </Typography>
        </Box>
      )}

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        {isDark ? (
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        ) : (
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        )}
        <MapViewUpdater
          center={mapCenter}
          zoom={mapZoom}
          follow={followDevice}
          target={followTarget}
        />

        {/* Geofence polygons */}
        {geofences.map((gf) => {
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
                dashArray: isEditing ? '7,6' : undefined
              }}
            >
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
                    Thiết bị:{' '}
                    {(geofenceDevicesMap[gf.id] ?? []).map((d) => d.name).join(', ') || 'Chưa có'}
                  </Typography>
                </Box>
              </Popup>
            </Polygon>
          );
        })}

        {/* Geofence edit handles */}
        {editingGeofenceId &&
          (() => {
            const gf = geofences.find((g) => g.id === editingGeofenceId);
            if (!gf?.active) return null;
            return (
              <>
                {gf.coordinates.map((coord, idx) => (
                  <Marker
                    key={`${gf.id}-v${idx}`}
                    position={coord}
                    draggable
                    icon={createVertexIcon(gf.color)}
                    eventHandlers={{ dragend: (e) => handleDragVertexEnd(gf.id, idx, e) }}
                  />
                ))}
                <Marker
                  key={`${gf.id}-center`}
                  position={getPolygonCentroid(gf.coordinates)}
                  draggable
                  icon={createCenterMoveIcon(gf.color)}
                  eventHandlers={{
                    dragstart: handleCenterDragStart,
                    dragend: (e) => handleCenterDragEnd(gf.id, e)
                  }}
                />
              </>
            );
          })()}

        {/* GPS History polylines */}
        {devices.map((dev) => {
          const hd = historyState[dev.id]?.data;
          if (!historyVisible[dev.id] || !hd?.items.length) return null;
          const positions = hd.items
            .filter((p) => p.lat !== 0 && p.lng !== 0)
            .map((p) => [p.lat, p.lng] as [number, number]);
          if (positions.length < 2) return null;
          return (
            <Polyline
              key={`history-${dev.id}`}
              positions={positions}
              pathOptions={{ color: dev.color, weight: 4, opacity: 0.55 }}
            >
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

        {/* History S/E markers */}
        {devices.flatMap((dev) => {
          const hd = historyState[dev.id]?.data;
          if (!historyVisible[dev.id] || !hd?.items.length) return [];
          const pts = hd.items.filter((p) => p.lat !== 0 && p.lng !== 0);
          if (!pts.length) return [];
          const first = pts[0],
            last = pts[pts.length - 1];
          const markers = [];
          if (first !== last)
            markers.push(
              <Marker
                key={`hs-${dev.id}`}
                position={[first.lat, first.lng]}
                icon={createHistoryMarkerIcon('S', dev.color)}
              >
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
            <Marker
              key={`he-${dev.id}`}
              position={[last.lat, last.lng]}
              icon={createHistoryMarkerIcon('E', '#ef4444')}
            >
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

        {/* Live path trails */}
        {devices.map((dev) =>
          dev.pathHistory.length > 1 ? (
            <Polyline
              key={`trail-${dev.id}`}
              positions={dev.pathHistory}
              pathOptions={{
                color: deviceViolations[dev.id] ? '#ef4444' : dev.color,
                weight: 2,
                dashArray: '5,10',
                opacity: 0.7
              }}
            />
          ) : null
        )}

        {/* Device markers */}
        {devices.map((dev) => (
          <Marker
            key={dev.id}
            position={dev.coords}
            icon={createDeviceIcon(
              dev.angle,
              !!deviceViolations[dev.id],
              dev.color,
              dev.id === selectedDeviceId
            )}
            eventHandlers={{
              click: () => {
                setSelectedDeviceId(dev.id);
                setActiveTab(0);
              }
            }}
          >
            <Popup>
              <Box sx={{ minWidth: 210, p: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                  📍 {dev.name}
                </Typography>
                {dev.subject && (
                  <Box sx={{ bgcolor: 'rgba(0,0,0,0.04)', borderRadius: 1.5, p: 1, mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {dev.subject.fullName}
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ color: '#ef4444', fontWeight: 600 }}
                    >
                      {dev.subject.crime}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Mãn hạn: {dev.subject.releaseDate || '—'}
                    </Typography>
                  </Box>
                )}
                <Typography variant="caption" display="block">
                  IMEI: {dev.uniqueId}
                </Typography>
                <Typography variant="caption" display="block">
                  Tọa độ: {dev.coords[0].toFixed(5)}, {dev.coords[1].toFixed(5)}
                </Typography>
                <Typography variant="caption" display="block">
                  Pin: {dev.status.battery}% · GPS: {dev.status.gpsAccuracy}m
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  sx={{
                    color: deviceViolations[dev.id] ? '#ef4444' : '#22c55e',
                    fontWeight: 700,
                    mt: 0.5
                  }}
                >
                  {deviceViolations[dev.id] ? '⚠ VI PHẠM VÙNG CẤM' : '✓ Trong vùng giám sát'}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
}
