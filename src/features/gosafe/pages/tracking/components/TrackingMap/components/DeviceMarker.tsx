import { memo, useMemo } from 'react';
import { Box, Typography, Stack, Divider, Chip } from '@mui/material';
import { Marker, Popup } from 'react-leaflet';
import { Location } from 'iconsax-react';
import type { Device } from '../../../types';
import { createDeviceIcon } from '../../../mapIcons';
import { formatDateVN } from '../../../utils';

export interface DeviceMarkerProps {
  dev: Device;
  selected: boolean;
  violating: boolean;
  isDark: boolean;
  onSelect: (id: string) => void;
}

/**
 * Marker thiết bị memo-hoá — chỉ re-render khi field ẢNH HƯỞNG hiển thị đổi (vị trí, góc,
 * màu, chọn, vi phạm, hồ sơ). Các gói SSE chỉ đổi pin/đồng bộ → KHÔNG re-render marker.
 */
export const DeviceMarker = memo(
  function DeviceMarker({ dev, selected, violating, isDark, onSelect }: DeviceMarkerProps) {
    const icon = useMemo(
      () => createDeviceIcon(dev.angle, violating, dev.color, selected),
      [dev.angle, violating, dev.color, selected]
    );
    return (
      <Marker
        position={dev.coords}
        icon={icon}
        eventHandlers={{ click: () => onSelect(dev.id) }}
      >
        <Popup>
          <Box sx={{ minWidth: 220, p: 0.5 }}>
            {dev.subject ? (
              <Stack spacing={1}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Location size="16" variant="Bold" color={dev.color} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a' }}>
                    {dev.subject.fullName}
                  </Typography>
                </Stack>
                <Chip
                  label={dev.subject.crime || dev.subject.sentence || 'Chưa phân loại'}
                  size="small"
                  sx={{ alignSelf: 'flex-start', height: 20, fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', bgcolor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '6px' }}
                />
                <Divider sx={{ my: 0.25, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
                <Stack spacing={0.25}>
                  {dev.subject.startDate && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>Bắt đầu:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem' }}>{formatDateVN(dev.subject.startDate)}</Typography>
                    </Stack>
                  )}
                  {dev.subject.releaseDate && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>Mãn hạn:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem' }}>{formatDateVN(dev.subject.releaseDate)}</Typography>
                    </Stack>
                  )}
                </Stack>
                <Divider sx={{ my: 0.25, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
                <Box sx={{ p: 0.75, borderRadius: '6px', textAlign: 'center', bgcolor: violating ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', border: `1.5px solid ${violating ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)'}` }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.72rem', color: violating ? '#ef4444' : '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    {violating ? '⚠ VI PHẠM VÙNG CẤM' : '✓ Trong vùng giám sát'}
                  </Typography>
                </Box>
              </Stack>
            ) : (
              <Stack spacing={1}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Location size="16" variant="Bold" color={dev.color} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{dev.name}</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">Thiết bị chưa gán hồ sơ</Typography>
              </Stack>
            )}
          </Box>
        </Popup>
      </Marker>
    );
  },
  // Bỏ qua re-render khi chỉ pin/điện áp/đồng bộ đổi (không ảnh hưởng marker).
  (p, n) =>
    p.selected === n.selected &&
    p.violating === n.violating &&
    p.isDark === n.isDark &&
    p.onSelect === n.onSelect &&
    p.dev.coords[0] === n.dev.coords[0] &&
    p.dev.coords[1] === n.dev.coords[1] &&
    p.dev.angle === n.dev.angle &&
    p.dev.color === n.dev.color &&
    p.dev.name === n.dev.name &&
    p.dev.subject === n.dev.subject
);
