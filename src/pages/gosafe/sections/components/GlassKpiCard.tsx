import { ReactNode } from 'react';
import { Box, Stack, Typography, Avatar } from '@mui/material';

interface GlassKpiCardProps {
  label: string;
  value: string | number;
  /** Dòng mô tả phụ dưới số liệu */
  sub?: ReactNode;
  /** Màu nhấn (accent) – tô số, icon, nền tint */
  color: string;
  icon: ReactNode;
  isDark?: boolean;
  /** Chấm "live" xanh nhấp nháy cạnh số */
  live?: boolean;
  /** Chấm đỏ cảnh báo nhấp nháy cạnh số (chỉ hiện khi value > 0) */
  blink?: boolean;
  /** Nội dung tuỳ biến chèn dưới cùng (vd: thanh tiến trình) */
  footer?: ReactNode;
}

/**
 * Card KPI dùng chung cho toàn bộ dashboard GoSafe — nền tint nhạt theo accent,
 * số liệu lớn tô màu accent, icon trong avatar tròn tint. Đồng bộ với trang Thiết bị.
 */
export default function GlassKpiCard({ label, value, sub, color, icon, isDark = false, live, blink, footer }: GlassKpiCardProps) {
  const numericValue = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]/g, ''));
  return (
    <Box
      sx={{
        p: 2.5,
        height: '100%',
        borderRadius: '12px',
        border: `1px solid ${isDark ? `${color}22` : `${color}18`}`,
        background: isDark
          ? `linear-gradient(135deg, ${color}18 0%, ${color}06 100%), rgba(9,13,31,0.55)`
          : `linear-gradient(135deg, ${color}0d 0%, ${color}04 100%), rgba(255,255,255,0.75)`,
        boxShadow: `0 4px 24px ${color}20, 0 1px 0 inset rgba(255,255,255,0.12)`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${color}80, transparent)`
        },
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 12px 40px ${color}30, 0 4px 16px rgba(0,0,0,0.1)`
        }
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#64748b' }}
          >
            {label}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.75 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color, lineHeight: 1 }}>
              {value}
            </Typography>
            {live && (
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e', boxShadow: '0 0 10px #22c55e', animation: 'pulse 2s infinite' }} />
            )}
            {blink && numericValue > 0 && (
              <Box className="gs-blink" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
            )}
          </Stack>
          {sub && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, fontSize: '0.7rem' }}>
              {sub}
            </Typography>
          )}
        </Box>
        <Avatar
          sx={{
            bgcolor: `${color}1a`,
            color,
            width: 48,
            height: 48,
            border: `1.5px solid ${color}30`,
            boxShadow: `0 4px 16px ${color}25`,
            flexShrink: 0
          }}
        >
          {icon}
        </Avatar>
      </Stack>
      {footer}
    </Box>
  );
}
