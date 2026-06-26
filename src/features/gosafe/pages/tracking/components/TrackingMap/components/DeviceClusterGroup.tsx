import { useCallback } from 'react';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import type { Device } from '../../../types';
import { DeviceMarker } from './DeviceMarker';

interface Props {
  /** Thiết bị "bình thường" để gom cụm (selected/vi phạm render rời ở index). */
  devices: Device[];
  selectedDeviceId: string | null;
  deviceViolations: Record<string, boolean>;
  isDark: boolean;
  primaryColor: string;
  onSelect: (id: string) => void;
}

/**
 * Gom cụm marker thiết bị (leaflet.markercluster):
 *  - Zoom xa, nhiều thiết bị trong khung → 1 bong bóng "số lượng" thay vì N marker DOM.
 *  - Zoom gần (>= disableClusteringAtZoom) → tách thành marker rời đầy đủ icon.
 * Tầng DATA vẫn giữ đủ thiết bị; đây chỉ là tầng RENDER nhẹ hoá.
 */
const DeviceClusterGroup = ({
  devices,
  selectedDeviceId,
  deviceViolations,
  isDark,
  primaryColor,
  onSelect,
}: Props) => {
  // Icon cụm: bong bóng tròn, to dần theo số lượng, màu theo hệ thống.
  const createClusterIcon = useCallback(
    (cluster: any): L.DivIcon => {
      const count = cluster.getChildCount();
      const size = count < 10 ? 38 : count < 50 ? 46 : 54;
      const html = `<div class="gs-cluster" style="width:${size}px;height:${size}px;background:${primaryColor};">${count}</div>`;
      return L.divIcon({ html, className: 'gs-cluster-wrap', iconSize: L.point(size, size) });
    },
    [primaryColor]
  );

  return (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={60}
      disableClusteringAtZoom={16}
      showCoverageOnHover={false}
      spiderfyOnMaxZoom
      iconCreateFunction={createClusterIcon}
    >
      {devices.map((dev) => (
        <DeviceMarker
          key={dev.id}
          dev={dev}
          selected={dev.id === selectedDeviceId}
          violating={!!deviceViolations[dev.id]}
          isDark={isDark}
          onSelect={onSelect}
        />
      ))}
    </MarkerClusterGroup>
  );
};

export default DeviceClusterGroup;
