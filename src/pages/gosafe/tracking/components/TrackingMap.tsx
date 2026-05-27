import { useEffect } from 'react';
import { Box, Typography, Stack, Divider, Grid, Chip } from '@mui/material';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { createDeviceIcon, createVertexIcon, createCenterMoveIcon, createHistoryMarkerIcon } from '../mapIcons';
import { getPolygonCentroid, getMockBiometrics } from '../utils';
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
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
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
          <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5, lineHeight: 1.7, color: '#f59e0b' }}>
            Kéo ○ (đỉnh) hoặc ✛ (trung tâm) để sửa ranh giới vùng.
          </Typography>
        </Box>
      )}

      {/* ═══ COMMAND CENTER OVERLAY ═══ */}
      <Box
        className="gs-glass-panel"
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000,
          width: 300,
          bgcolor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          borderRadius: 2,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          color: isDark ? '#f8fafc' : '#0f172a'
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            ⚡ BẢNG CHỈ HUY DI ĐỘNG
          </Typography>
          <Chip
            label="LIVE SYNC"
            color="success"
            size="small"
            variant="outlined"
            className="gs-blink"
            sx={{ height: 16, fontSize: '0.6rem', fontWeight: 800 }}
          />
        </Stack>

        <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />

        {/* Quick Stats Grid */}
        <Grid container spacing={1}>
          {[
            { label: 'Trực tuyến', count: devices.filter((d) => d.status.connectionStatus === 'online').length, color: '#22c55e' },
            { label: 'Vi phạm', count: Object.values(deviceViolations).filter(Boolean).length, color: '#ef4444', blink: true },
            { label: 'Pin yếu (<20%)', count: devices.filter((d) => d.status.battery < 20).length, color: '#f59e0b' },
            { label: 'Ngoại tuyến', count: devices.filter((d) => d.status.connectionStatus === 'offline').length, color: '#94a3b8' }
          ].map((item) => (
            <Grid item xs={6} key={item.label}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                  textAlign: 'center'
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
            {Object.values(deviceViolations).filter(Boolean).length + devices.filter((d) => getMockBiometrics(d.id).isTampered).length})
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
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    bgcolor: 'rgba(239, 68, 68, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(239, 68, 68, 0.1)',
                      borderColor: '#ef4444'
                    }
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
                    Tim: {bio.heartRate} bpm · Pin: {dev.status.battery}%
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

      <MapContainer center={mapCenter} zoom={mapZoom} attributionControl={false} style={{ width: '100%', height: '100%' }}>
        {isDark ? (
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        ) : (
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        )}
        <MapViewUpdater center={mapCenter} zoom={mapZoom} follow={followDevice} target={followTarget} />

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
                    Thiết bị: {(geofenceDevicesMap[gf.id] ?? []).map((d) => d.name).join(', ') || 'Chưa có'}
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
          const positions = hd.items.filter((p) => p.lat !== 0 && p.lng !== 0).map((p) => [p.lat, p.lng] as [number, number]);
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
            icon={createDeviceIcon(dev.angle, !!deviceViolations[dev.id], dev.color, dev.id === selectedDeviceId)}
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
                    <Typography variant="caption" display="block" sx={{ color: '#ef4444', fontWeight: 600 }}>
                      {dev.subject.crime}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Mãn hạn: {dev.subject.releaseDate || '—'}
                    </Typography>
                  </Box>
                )}

                {/* Biometrics info inside Map Popup */}
                {dev.subject &&
                  (() => {
                    const bio = getMockBiometrics(dev.id);
                    return (
                      <Box sx={{ mt: 1, borderTop: '1px solid rgba(0,0,0,0.06)', pt: 1, pb: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: '#2b5eaf',
                            textTransform: 'uppercase',
                            display: 'block',
                            mb: 0.5,
                            fontSize: '0.65rem'
                          }}
                        >
                          Sinh trắc học & Sức khỏe
                        </Typography>
                        <Stack spacing={0.25}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">
                              Nhịp tim:
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 0.5 }}
                            >
                              <span className="gs-pulse-heart-icon">❤️</span> {bio.heartRate} bpm
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">
                              Nhiệt độ:
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                              {bio.temp} °C
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">
                              Vận động:
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                              {bio.steps.toLocaleString()} bước
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">
                              Khóa chân:
                            </Typography>
                            <Typography
                              variant="caption"
                              className={bio.isTampered ? 'gs-blink' : ''}
                              sx={{
                                fontWeight: 700,
                                color: bio.isTampered ? '#ef4444' : '#22c55e'
                              }}
                            >
                              {bio.isTampered ? '⚠ CẢNH BÁO THÁO' : '✓ Ổn định'}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    );
                  })()}

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
    </Box>
  );
}
