import L from 'leaflet';
import { Marker, Tooltip } from 'react-leaflet';
import type { Geofence } from '../../../types';
import { createVertexIcon, createCenterMoveIcon, createMidpointIcon } from '../../../mapIcons';
import { getPolygonCentroid } from '../../../utils';

interface Props {
  gf: Geofence;
  editPolygonRef: React.MutableRefObject<L.Polygon | null>;
  centerStartRef: React.MutableRefObject<{ lat: number; lng: number } | null>;
  onDragVertexEnd: (gfId: string, vidx: number, e: L.LeafletEvent) => void;
  onDeleteVertex: (gfId: string, vidx: number) => void;
  onAddVertex: (gfId: string, afterIdx: number, coord: [number, number]) => void;
  onCenterDragStart: (e: L.LeafletEvent) => void;
  onCenterDragEnd: (gfId: string, e: L.LeafletEvent) => void;
}

/** Tay cầm chỉnh sửa vùng cấm: đỉnh (kéo/xoá), trung điểm (thêm), tâm (dời cả vùng). */
export default function GeofenceEditHandles({
  gf,
  editPolygonRef,
  centerStartRef,
  onDragVertexEnd,
  onDeleteVertex,
  onAddVertex,
  onCenterDragStart,
  onCenterDragEnd,
}: Props) {
  return (
    <>
      {/* Vertex markers — drag to move, right-click to delete */}
      {gf.coordinates.map((coord, idx) => (
        <Marker
          key={`${gf.id}-v${idx}`}
          position={coord}
          draggable
          icon={createVertexIcon(gf.color)}
          eventHandlers={{
            drag: (e) => {
              // Cập nhật biên polygon theo con trỏ ngay lập tức (không qua state).
              const pos = (e.target as L.Marker).getLatLng();
              const next = gf.coordinates.map((c, i) => (i === idx ? [pos.lat, pos.lng] : c)) as [number, number][];
              editPolygonRef.current?.setLatLngs(next);
            },
            dragend: (e) => onDragVertexEnd(gf.id, idx, e),
            contextmenu: () => onDeleteVertex(gf.id, idx),
          }}
        >
          <Tooltip direction="top" offset={[0, -12]} className="gs-vtx-tip">
            {coord[0].toFixed(5)}, {coord[1].toFixed(5)}
          </Tooltip>
        </Marker>
      ))}

      {/* Midpoint insert markers — click to add a new vertex */}
      {gf.coordinates.map((coord, idx) => {
        const nextIdx = (idx + 1) % gf.coordinates.length;
        const next = gf.coordinates[nextIdx];
        const midLat = (coord[0] + next[0]) / 2;
        const midLng = (coord[1] + next[1]) / 2;
        return (
          <Marker
            key={`${gf.id}-mid${idx}`}
            position={[midLat, midLng]}
            icon={createMidpointIcon(gf.color)}
            eventHandlers={{ click: () => onAddVertex(gf.id, idx, [midLat, midLng]) }}
          >
            <Tooltip direction="top" offset={[0, -9]} className="gs-vtx-tip">
              + Thêm đỉnh tại đây
            </Tooltip>
          </Marker>
        );
      })}

      {/* Center drag marker */}
      <Marker
        key={`${gf.id}-center`}
        position={getPolygonCentroid(gf.coordinates)}
        draggable
        icon={createCenterMoveIcon(gf.color)}
        eventHandlers={{
          dragstart: (e) => {
            const pos = (e.target as L.Marker).getLatLng();
            centerStartRef.current = { lat: pos.lat, lng: pos.lng };
            onCenterDragStart(e);
          },
          drag: (e) => {
            // Dời cả vùng theo con trỏ realtime.
            if (!centerStartRef.current) return;
            const pos = (e.target as L.Marker).getLatLng();
            const dLat = pos.lat - centerStartRef.current.lat;
            const dLng = pos.lng - centerStartRef.current.lng;
            const next = gf.coordinates.map((c) => [c[0] + dLat, c[1] + dLng]) as [number, number][];
            editPolygonRef.current?.setLatLngs(next);
          },
          dragend: (e) => {
            centerStartRef.current = null;
            onCenterDragEnd(gf.id, e);
          },
        }}
      />
    </>
  );
}
