import L from 'leaflet';
import { Box, Typography } from '@mui/material';
import { Polygon, Popup, Tooltip } from 'react-leaflet';
import type { Geofence, Device } from '../../../types';

interface Props {
  geofences: Geofence[];
  showLabels: boolean;
  editingGeofenceId: string | null;
  editPolygonRef: React.MutableRefObject<L.Polygon | null>;
  gfMetrics: Record<string, { area: string; perimeter: string }>;
  geofenceDevicesMap: Record<string, Device[]>;
  isDark: boolean;
}

/** Lớp polygon vùng cấm (chỉ các vùng đang nằm trong khu vực render). */
export default function GeofenceLayer({
  geofences,
  showLabels,
  editingGeofenceId,
  editPolygonRef,
  gfMetrics,
  geofenceDevicesMap,
  isDark,
}: Props) {
  return (
    <>
      {geofences.map((gf) => {
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
            {showLabels && (
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
    </>
  );
}
