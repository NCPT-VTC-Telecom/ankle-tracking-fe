import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

// Fix icon leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

interface LocationPickerMapProps {
  center?: [number, number];
  zoom?: number;
  value?: [number, number] | null;
  onChange?: (latlng: [number, number], address?: string) => void;
  fullHeight?: boolean;
  loadingText?: string;
}

// Marker khi click
function LocationMarker({
  value,
  onChange,
  setLoading
}: {
  value?: [number, number] | null;
  onChange?: (latlng: [number, number], address?: string) => void;
  setLoading: (loading: boolean) => void;
}) {
  const [position, setPosition] = useState<[number, number] | null>(value || null);

  const fetchAddress = async (latlng: [number, number]) => {
    try {
      setLoading(true);
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng[0]}&lon=${latlng[1]}`);
      const data = await res.json();
      return data.display_name as string;
    } catch (err) {
      console.error('Error fetching address:', err);
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (value) setPosition(value);
  }, [value]);

  useMapEvents({
    async click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      const address = await fetchAddress(newPos);
      onChange?.(newPos, address);
    }
  });

  return position ? <Marker position={position} /> : null;
}

// Search box control
function SearchControl({ onChange }: { onChange?: (latlng: [number, number], address?: string) => void }) {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new (GeoSearchControl as any)({
      provider,
      style: 'bar',
      showMarker: true,
      autoClose: true,
      keepResult: true
    });

    map.addControl(searchControl);

    map.on('geosearch/showlocation', (result: any) => {
      const { x, y, label } = result.location;
      onChange?.([y, x], label);
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, onChange]);

  return null;
}

// Tự recenter map khi có value
function Recenter({ value }: { value: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (value) {
      map.setView(value, map.getZoom(), { animate: true });
    }
  }, [value, map]);
  return null;
}

// Spinner component
function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          border: '3px solid rgba(255,255,255,0.3)',
          borderTop: '3px solid #fff',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          animation: 'spin 1s linear infinite'
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </div>
  );
}

export default function LocationPickerMap({
  center = [10.776889, 106.700897], // default HCM
  zoom = 13,
  value = null,
  onChange,
  fullHeight = false,
  loadingText = 'Đang tải địa chỉ...'
}: LocationPickerMapProps) {
  const defaultCenter = value || center;
  const [loading, setLoading] = useState(false);

  return (
    <div className={fullHeight ? 'h-full' : 'h-[450px]'} style={{ width: '100%', position: 'relative' }}>
      <MapContainer center={defaultCenter} zoom={zoom} className="w-full h-full select-none">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Search control */}
        <SearchControl onChange={onChange} />

        {/* Click chọn marker */}
        <LocationMarker value={value && defaultCenter} onChange={onChange} setLoading={setLoading} />

        <Recenter value={defaultCenter} />
      </MapContainer>

      {/* Loading overlay full map */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            gap: '12px',
            borderRadius: 'inherit'
          }}
        >
          <Spinner />
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>{loadingText}</span>
        </div>
      )}
    </div>
  );
}
