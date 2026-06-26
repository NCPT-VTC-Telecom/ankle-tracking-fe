import { Circle, Polyline } from 'react-leaflet';
import type { Device } from '../../../types';

interface Props {
  devices: Device[];
  showTrails: boolean;
  showAccuracyCircles: boolean;
  deviceViolations: Record<string, boolean>;
}

/** Vệt di chuyển realtime + vòng tròn độ chính xác GPS (chỉ thiết bị trong khu vực render). */
export default function TrailLayer({ devices, showTrails, showAccuracyCircles, deviceViolations }: Props) {
  return (
    <>
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
    </>
  );
}
