import { Box, Typography } from '@mui/material';
import { Marker, Polyline, Popup } from 'react-leaflet';
import type { Device, DeviceHistoryState } from '../../../types';
import { createHistoryMarkerIcon } from '../../../mapIcons';

interface Props {
  devices: Device[];
  historyState: Record<string, DeviceHistoryState>;
  historyVisible: Record<string, boolean>;
}

/** Lịch sử di chuyển: polyline + marker điểm đầu (S) / điểm cuối (E). */
export default function HistoryLayer({ devices, historyState, historyVisible }: Props) {
  return (
    <>
      {/* Polylines */}
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

      {/* S / E markers */}
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
    </>
  );
}
