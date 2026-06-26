import accessPointImg from 'assets/images/icons/access-point.png';
import useConfig from 'shared/hooks/useConfig';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

//third-party
import { format } from 'date-fns';
import vn from 'date-fns/locale/vi';
import L, { Marker as LeafletMarker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AttributionControl, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

//project-import
import { Link } from '@mui/material';
import ChipStatus from 'shared/components/atoms/ChipStatus';

//assets

//types
import { Box } from '@mui/material';
import { DataDevice } from 'shared/types';

interface MapProps {
  devices: DataDevice[];
  selectedDevice?: DataDevice | null;
  popupVisibility?: Record<string, boolean>;
  showClock?: boolean;
  fullHeight?: boolean;
  center?: [number, number];
  zoom?: number;
}

const Clock = ({ locale }: { locale: string }) => {
  const [dateTime, setDateTime] = useState('');
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formatted =
        locale === 'vi' ? format(now, 'EEEE, dd MMMM yyyy HH:mm:ss', { locale: vn }) : format(now, 'EEEE, dd MMMM yyyy HH:mm:ss');
      setDateTime(formatted);
    }, 1000);
    return () => clearInterval(interval);
  }, [locale]);

  return <h2 className="py-6 font-medium text-xl">{dateTime}</h2>;
};

// Component để invalidate size của map
function MapController() {
  const map = useMap();

  useEffect(() => {
    // Invalidate size sau khi component mount
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

function MarkerWithPopup({
  device,
  selectedDevice,
  popupVisible
}: {
  device: DataDevice;
  selectedDevice?: DataDevice | null;
  popupVisible: boolean;
}) {
  const map = useMap();
  const markerRef = useRef<LeafletMarker | null>(null);

  useEffect(() => {
    if (selectedDevice && selectedDevice.id === device.id) {
      map.flyTo([Number(device.device_lat), Number(device.device_lng)], map.getZoom());
      if (markerRef.current) {
        popupVisible ? markerRef.current.openPopup() : markerRef.current.closePopup();
      }
    }
  }, [selectedDevice, map, device, popupVisible]);

  return (
    <Marker
      ref={markerRef}
      position={[Number(device.device_lat), Number(device.device_lng)]}
      icon={L.icon({ iconUrl: accessPointImg, iconSize: [32, 32], iconAnchor: [16, 32] })}
    >
      <Popup className="!m-0" minWidth={300}>
        <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white font-sans">
          {/* Header */}
          <header className="w-full py-2 bg-blue-700 text-white font-semibold text-center text-lg">
            <Link component="button" className="text-white hover:underline transition-colors" variant="h5">
              {device.name}
            </Link>
          </header>

          {/* Body */}
          <div className="p-4 flex flex-col gap-3">
            {/* Device Name & Model */}
            <div className="flex justify-between items-center font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              <label className="text-gray-600">
                <FormattedMessage id="device-name" />:
              </label>
              <span>
                <Link component="button" className="text-blue-600 hover:underline transition-colors" variant="body1">
                  {device.name} - {device.model}
                </Link>
              </span>
            </div>

            {/* IP Address */}
            <div className="flex justify-between items-center font-medium">
              <label className="text-gray-600">
                <FormattedMessage id="ip-address" />:
              </label>
              <span className="text-gray-800">{device.ip_address}</span>
            </div>

            {/* Site Name */}
            <div className="flex justify-between items-center font-medium">
              <label className="text-gray-600">
                <FormattedMessage id="site" />:
              </label>
              <span className="text-gray-800">{device.site_name}</span>
            </div>

            {/* Status */}
            <div className="flex justify-between items-center font-medium">
              <label className="text-gray-600">
                <FormattedMessage id="status" />:
              </label>
              <span>
                <ChipStatus
                  id={device.status_id}
                  successLabel="connected"
                  errorLabel="disconnected"
                  warningLabel="pending"
                  dangerLabel="hearbeat_missed"
                  isolatedLabel="isolated"
                />
              </span>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

function Map({
  devices,
  selectedDevice,
  popupVisibility,
  showClock = false,
  fullHeight = false,
  center = [10.811692, 106.653379],
  zoom = 15
}: MapProps) {
  const { i18n } = useConfig();
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Effect để handle resize
  useEffect(() => {
    const handleResize = () => {
      // Trigger re-render của map container khi window resize
      if (mapContainerRef.current) {
        // Force reflow
        mapContainerRef.current.style.display = 'none';
        void mapContainerRef.current.offsetHeight; // trigger reflow
        mapContainerRef.current.style.display = '';
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Box
        ref={mapContainerRef}
        className={fullHeight ? 'h-full' : 'h-[400px]'}
        sx={{
          width: '100%',
          position: 'relative' // Đảm bảo container có position để Leaflet tính toán đúng
        }}
      >
        {showClock && <Clock locale={i18n} />}
        <MapContainer
          className="select-none w-full min-h-[300px] h-full"
          center={center}
          zoom={zoom}
          attributionControl={false}
          style={{ height: '100%', width: '100%' }} // Explicit styling
        >
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}?apikey=ca52cae166e440f18779607cdbf9221b" />
          <AttributionControl prefix="VTC Telecom" />
          <MapController /> {/* Component để invalidate size */}
          {devices?.map((device) => {
            if (!device.device_lat || !device.device_lng) return null;
            return (
              <MarkerWithPopup
                key={device.id}
                device={device}
                selectedDevice={selectedDevice}
                popupVisible={!!popupVisibility?.[device.id]}
              />
            );
          })}
        </MapContainer>
      </Box>
    </>
  );
}

export default Map;
