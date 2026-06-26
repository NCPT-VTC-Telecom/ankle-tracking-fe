import { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

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
