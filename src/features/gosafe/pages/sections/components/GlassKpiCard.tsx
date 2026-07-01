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
  const fontFamily = '"Inter", sans-serif';
  return (
    <Box
      sx={{
        p: { xs: 1.75, sm: 3 },
        pl: { xs: 2.25, sm: 3.5 },
        height: '100%',
        borderRadius: '16px',
        border: `1px solid ${isDark ? `${color}33` : `${color}33`}`,
        background: isDark
          ? `linear-gradient(135deg, ${color}26 0%, ${color}0a 60%), rgba(9,13,31,0.55)`
          : `linear-gradient(135deg, ${color}24 0%, ${color}0a 60%), #ffffff`,
        boxShadow: `0 6px 22px ${color}22, 0 1px 0 inset rgba(255,255,255,0.12)`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        // Dải màu nhấn bên trái cho rõ phân loại
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: '4px',
          background: `linear-gradient(180deg, ${color}, ${color}80)`
        },
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 14px 42px ${color}3a, 0 4px 16px rgba(0,0,0,0.1)`
        }
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, fontFamily, textTransform: 'uppercase', letterSpacing: 0.6, fontSize: { xs: '0.7rem', sm: '0.78rem' }, color: isDark ? '#94a3b8' : '#64748b' }}
          >
            {label}
          </Typography>
          <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} alignItems="center" sx={{ mt: 0.75 }}>
            <Typography sx={{ fontWeight: 700, fontFamily, color, lineHeight: 1, fontSize: { xs: '24px', sm: '32px' } }}>
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
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: { xs: 0.5, sm: 0.75 }, fontSize: { xs: '0.74rem', sm: '0.8rem' }, fontFamily }}>
              {sub}
            </Typography>
          )}
        </Box>
        <Avatar
          sx={{
            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
            color: '#fff',
            fontFamily,
            width: { xs: 38, sm: 52 },
            height: { xs: 38, sm: 52 },
            boxShadow: `0 6px 18px ${color}55`,
            flexShrink: 0,
            '& svg': {
              width: { xs: 18, sm: 24 },
              height: { xs: 18, sm: 24 }
            }
          }}
        >
          {icon}
        </Avatar>
      </Stack>
      {footer}
    </Box>
  );
}
