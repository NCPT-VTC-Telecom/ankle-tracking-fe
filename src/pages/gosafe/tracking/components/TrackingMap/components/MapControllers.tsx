import { useEffect } from 'react';
import L from 'leaflet';
import { useMap, useMapEvents } from 'react-leaflet';

/** Đưa map về center/zoom; nếu đang bám thiết bị thì set theo target. */
export function MapViewUpdater({
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

/** Bắt tham chiếu instance Leaflet ra ngoài (cho fitBounds…). */
export function MapRefCapture({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => { mapRef.current = map; }, [map, mapRef]);
  return null;
}

/**
 * Streaming kiểu GTA: báo khung nhìn hiện tại mỗi khi pan/zoom để culling — chỉ render
 * thành phần trong khu vực đang focus.
 */
export function MapCullController({ onView }: { onView: (b: L.LatLngBounds) => void }) {
  const map = useMapEvents({
    moveend: () => onView(map.getBounds()),
    zoomend: () => onView(map.getBounds()),
  });
  useEffect(() => { onView(map.getBounds()); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
