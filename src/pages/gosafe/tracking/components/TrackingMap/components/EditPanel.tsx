import { Box, Typography, Stack, Divider, Button } from '@mui/material';
import type { Geofence } from '../../../types';

interface Props {
  editingGeofenceId: string | null;
  editGf: Geofence | null;
  editArea: string | null;
  editPerimeter: string | null;
  onFinish: () => void;
  onCancel: () => void;
  isDark: boolean;
  glassBg: string;
  glassBdr: string;
  glassBlur: string;
  txtColor: string;
}

/** Gợi ý chỉnh sửa + bảng số liệu vùng đang sửa (diện tích/chu vi/đỉnh) + nút lưu/huỷ. */
export default function EditPanel({
  editingGeofenceId,
  editGf,
  editArea,
  editPerimeter,
  onFinish,
  onCancel,
  isDark,
  glassBg,
  glassBdr,
  glassBlur,
  txtColor,
}: Props) {
  if (!editingGeofenceId) return null;
  return (
    <>
      {/* Floating edit hint */}
      <Box
        className="gs-map-hint"
        sx={{
          bgcolor: isDark ? 'rgba(9,13,31,0.90)' : 'rgba(255,255,255,0.90)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          backdropFilter: glassBlur,
          WebkitBackdropFilter: glassBlur,
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700 }} color="text.secondary">
          ✏ Chế độ chỉnh sửa vùng cấm
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5, lineHeight: 1.75, color: '#f59e0b' }}>
          Kéo ○ đỉnh để di chuyển · Nhấp ◇ trung điểm để thêm đỉnh · Chuột phải ○ để xoá đỉnh
        </Typography>
      </Box>

      {/* Live metrics & actions */}
      {editGf && (
        <Box
          sx={{
            position: 'absolute',
            top: 70,
            right: 16,
            zIndex: 1001,
            bgcolor: glassBg,
            backdropFilter: glassBlur,
            WebkitBackdropFilter: glassBlur,
            border: `1px solid ${glassBdr}`,
            borderLeft: `3px solid ${editGf.color}`,
            borderRadius: 3,
            px: 2,
            py: 1.75,
            width: 280,
            color: txtColor,
            boxShadow: `0 8px 32px ${editGf.color}25, 0 2px 10px rgba(0,0,0,0.15)`,
            transition: 'all 0.3s ease-in-out',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: editGf.color, display: 'block', mb: 0.75, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Đang chỉnh sửa ranh giới
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '1rem', mb: 1.5, color: txtColor }}>
            {editGf.name}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            {[
              { label: 'Diện tích', value: editArea },
              { label: 'Chu vi', value: editPerimeter },
              { label: 'Số đỉnh', value: String(editGf.coordinates.length) },
            ].map((m) => (
              <Box key={m.label} sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.62rem', fontWeight: 600 }}>
                  {m.label}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
                  {m.value}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Divider sx={{ my: 1.5, opacity: 0.6 }} />

          <Stack spacing={1}>
            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={onFinish}
              sx={{ bgcolor: editGf.color, color: '#fff', fontWeight: 700, borderRadius: '10px', py: 0.75, textTransform: 'none', '&:hover': { bgcolor: editGf.color, opacity: 0.9 } }}
            >
              Lưu ranh giới
            </Button>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              color="error"
              onClick={onCancel}
              sx={{ fontWeight: 700, borderRadius: '10px', py: 0.75, textTransform: 'none' }}
            >
              Hủy chỉnh sửa
            </Button>
          </Stack>
        </Box>
      )}
    </>
  );
}
