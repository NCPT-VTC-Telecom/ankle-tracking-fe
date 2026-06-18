import { ReactNode } from 'react';
import { Drawer, Box, Stack, Typography, IconButton } from '@mui/material';
import { CloseCircle } from 'iconsax-react';

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** Bề rộng panel (px) trên màn hình ≥ sm */
  width?: number;
  isDark?: boolean;
  primaryColor?: string;
  /** Hàng nút hành động cố định dưới chân panel */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Side menu phải dùng chung cho mọi form thêm/sửa/chi tiết trong GoSafe dashboard.
 * Thay cho <Dialog> để giao diện nhất quán & trực quan hơn (header gradient,
 * thân cuộn được, chân cố định cho nút hành động).
 */
export default function SideDrawer({
  open,
  onClose,
  title,
  subtitle,
  width = 460,
  isDark = false,
  primaryColor = '#2563eb',
  footer,
  children
}: SideDrawerProps) {
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: width },
          bgcolor: isDark ? '#0d1224' : '#f8fafc',
          borderLeft: `1px solid ${border}`,
          boxShadow: '-8px 0 40px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          background: isDark
            ? `linear-gradient(135deg, ${primaryColor}22, ${primaryColor}08)`
            : `linear-gradient(135deg, ${primaryColor}12, ${primaryColor}04)`,
          borderBottom: `1px solid ${border}`,
          flexShrink: 0
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: isDark ? '#f1f5f9' : '#0f172a', lineHeight: 1.25 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'text.secondary', flexShrink: 0, '&:hover': { color: '#ef4444' } }}>
            <CloseCircle size={22} />
          </IconButton>
        </Stack>
      </Box>

      {/* Scrollable body */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3 }}>{children}</Box>

      {/* Sticky footer */}
      {footer && (
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${border}`,
            flexShrink: 0,
            display: 'flex',
            gap: 1,
            justifyContent: 'flex-end',
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff'
          }}
        >
          {footer}
        </Box>
      )}
    </Drawer>
  );
}
