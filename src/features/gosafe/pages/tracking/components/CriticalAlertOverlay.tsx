import { Box, Typography, IconButton, Button, Stack, Chip, Avatar, useTheme } from '@mui/material';
import { CloseCircle, Danger, Scissor, Location, TickCircle } from 'iconsax-react';
import type { CriticalAlert, Device } from '../types';

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(d: Date): string {
  return d.toTimeString().slice(0, 8);
}

function fmtCoords(coords: [number, number]): string {
  return `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`;
}

// ─── Single alert toast ───────────────────────────────────────────────────────

interface CardProps {
  alert: CriticalAlert;
  device: Device | undefined;
  onDismiss: () => void;
  onAcknowledge: () => void;
  onFocus: () => void;
}

function AlertCard({ alert, device, onDismiss, onAcknowledge, onFocus }: CardProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const isSOS = alert.type === 'sos';
  const resolved = device
    ? isSOS
      ? !/\bsos\b/i.test(device.status.eventName)
      : !/fiber[\s_]*(optical[\s_]*)?cut/i.test(device.status.eventName)
    : false;

  const accentColor = isSOS ? '#ef4444' : '#f59e0b';

  // Custom CSS variables for the pulse animation (defined in gosafe.css)
  const alertPulse0 = isDarkMode
    ? `0 12px 32px rgba(0,0,0,0.6), 0 0 0 0 ${accentColor}b3`
    : `0 12px 28px rgba(15,23,42,0.12), 0 0 0 0 ${accentColor}33`;
  const alertPulse50 = isDarkMode
    ? `0 12px 32px rgba(0,0,0,0.6), 0 0 0 10px ${accentColor}00`
    : `0 12px 28px rgba(15,23,42,0.12), 0 0 0 10px ${accentColor}00`;
  const ringStart = `${accentColor}8c`;
  const ringEnd = `${accentColor}00`;

  const borderColor = isDarkMode ? `${accentColor}73` : `${accentColor}33`;
  const cardBg = isDarkMode ? 'linear-gradient(160deg, #14100c 0%, #0f172a 100%)' : '#ffffff';
  const fontFamily = '"Inter", "Inter var", sans-serif';
  const subColor = isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)';

  const desc = isSOS ? 'Yêu cầu hỗ trợ khẩn cấp' : 'Phát hiện tháo / cắt đứt dây thiết bị';

  return (
    <Box
      className={isSOS ? 'gs-critical-sos' : 'gs-critical-fiber'}
      style={{ '--gs-alert-pulse-0': alertPulse0, '--gs-alert-pulse-50': alertPulse50 } as React.CSSProperties}
      sx={{
        width: '100%',
        borderRadius: '14px',
        background: cardBg,
        border: `1px solid ${borderColor}`,
        borderLeft: `4px solid ${accentColor}`,
        overflow: 'hidden',
        boxShadow: isDarkMode ? '0 12px 32px rgba(0,0,0,0.55)' : '0 12px 28px rgba(15,23,42,0.1)'
      }}
    >
      {/* Top row: icon · title/subject · close */}
      <Stack direction="row" spacing={1.25} sx={{ p: 1.5, alignItems: 'flex-start' }}>
        {/* Pulsing icon */}
        <Box
          className="gs-critical-icon-sos"
          style={{ '--gs-icon-ring-start': ringStart, '--gs-icon-ring-end': ringEnd } as React.CSSProperties}
          sx={{
            width: 34,
            height: 34,
            flexShrink: 0,
            borderRadius: '10px',
            display: 'grid',
            placeItems: 'center',
            bgcolor: isDarkMode ? `${accentColor}26` : `${accentColor}12`,
            border: `1.5px solid ${accentColor}`
          }}
        >
          {isSOS ? <Danger size={18} color={accentColor} variant="Bold" /> : <Scissor size={18} color={accentColor} variant="Bold" />}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
            <Typography
              noWrap
              sx={{ fontFamily, fontWeight: 800, fontSize: '0.82rem', color: accentColor, letterSpacing: '0.03em', textTransform: 'uppercase' }}
            >
              {isSOS ? 'SOS Khẩn cấp' : 'Thiết bị tháo dây'}
            </Typography>
            {!resolved && (
              <Box className="gs-live-dot" sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: accentColor, flexShrink: 0 }} />
            )}
          </Stack>

          <Typography sx={{ fontFamily, fontSize: '0.78rem', color: isDarkMode ? '#e2e8f0' : '#334155', fontWeight: 600, mt: 0.25, lineHeight: 1.35 }}>
            {desc}
          </Typography>

          {/* Subject + IMEI/coords — gọn trong 1 khối nhỏ */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            {device?.subject?.fullName && (
              <Avatar
                sx={{
                  width: 26,
                  height: 26,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#fff',
                  fontFamily,
                  bgcolor: accentColor,
                  flexShrink: 0
                }}
              >
                {device.subject.fullName.trim().split(' ').pop()?.charAt(0).toUpperCase() || '?'}
              </Avatar>
            )}
            <Box sx={{ minWidth: 0 }}>
              {device?.subject?.fullName && (
                <Typography noWrap sx={{ fontFamily, fontSize: '0.8rem', fontWeight: 700, color: isDarkMode ? '#f8fafc' : '#0f172a', lineHeight: 1.2 }}>
                  {device.subject.fullName}
                  {device.subject.idNumber ? <Box component="span" sx={{ color: subColor, fontWeight: 500 }}> · {device.subject.idNumber}</Box> : null}
                </Typography>
              )}
              <Typography noWrap sx={{ fontFamily: 'Courier New, monospace', fontSize: '0.68rem', color: subColor, fontWeight: 600, lineHeight: 1.3 }}>
                {(device?.name ?? alert.imei)} · {fmtCoords(alert.coords)}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Right column: resolved chip / time / close */}
        <Stack alignItems="flex-end" spacing={0.5} sx={{ flexShrink: 0 }}>
          <IconButton
            size="small"
            onClick={onDismiss}
            aria-label="Đóng cảnh báo"
            sx={{ color: subColor, p: 0.25, '&:hover': { color: isDarkMode ? '#fff' : '#0f172a' } }}
          >
            <CloseCircle size={18} />
          </IconButton>
          {resolved ? (
            <Chip
              label="Đã giải quyết"
              size="small"
              sx={{ fontFamily, height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}
            />
          ) : (
            <Typography sx={{ fontFamily, fontSize: '0.65rem', color: subColor, fontWeight: 600, whiteSpace: 'nowrap' }}>
              {fmt(alert.timestamp)}
            </Typography>
          )}
        </Stack>
      </Stack>

      {/* Footer actions — gọn */}
      <Stack direction="row" spacing={1} sx={{ px: 1.5, pb: 1.5 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Location size={14} />}
          onClick={onFocus}
          sx={{
            flex: 1,
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily,
            color: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
            borderColor: isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(15,23,42,0.22)',
            textTransform: 'none',
            py: 0.6,
            '&:hover': { borderColor: accentColor, color: accentColor, bgcolor: `${accentColor}12` }
          }}
        >
          Xem bản đồ
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<TickCircle size={14} variant="Bold" />}
          onClick={onAcknowledge}
          sx={{
            flex: 1,
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 800,
            fontFamily,
            textTransform: 'none',
            bgcolor: accentColor,
            color: '#fff',
            py: 0.6,
            boxShadow: `0 4px 12px ${accentColor}33`,
            '&:hover': { bgcolor: accentColor, filter: 'brightness(1.08)' }
          }}
        >
          Tiếp nhận
        </Button>
      </Stack>
    </Box>
  );
}

// ─── Overlay (toast stack) ─────────────────────────────────────────────────────

interface Props {
  alerts: CriticalAlert[];
  devices: Device[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  onAcknowledge: (alert: CriticalAlert) => void;
  onFocusDevice: (imei: string) => void;
}

export default function CriticalAlertOverlay({
  alerts,
  devices,
  onDismiss,
  onDismissAll,
  onAcknowledge,
  onFocusDevice,
}: Props) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  if (alerts.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        // Điện thoại: nằm trên thanh điều hướng (64px) và trải hết bề ngang trừ lề.
        bottom: { xs: 80, sm: 24 },
        right: { xs: 16, sm: 24 },
        left: { xs: 16, sm: 'auto' },
        width: { xs: 'auto', sm: 380 },
        maxWidth: 'calc(100vw - 32px)',
        zIndex: 9500,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 1,
        maxHeight: { xs: 'calc(100vh - 160px)', sm: 'calc(100vh - 80px)' },
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(148,163,184,0.35)', borderRadius: 2 }
      }}
    >
      {/* Dismiss-all — chỉ hiện khi có từ 2 cảnh báo */}
      {alerts.length >= 2 && (
        <Button
          size="small"
          variant="outlined"
          onClick={onDismissAll}
          sx={{
            width: '100%',
            borderRadius: 2,
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: '"Inter", sans-serif',
            color: isDarkMode ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.2)',
            bgcolor: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(8px)',
            textTransform: 'none',
            py: 0.6,
            '&:hover': {
              bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.04)',
              borderColor: isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.35)'
            }
          }}
        >
          Xác nhận tất cả ({alerts.length})
        </Button>
      )}

      {alerts.map((alert) => (
        <AlertCard
          key={alert.id}
          alert={alert}
          device={devices.find((d) => d.uniqueId === alert.imei)}
          onDismiss={() => onDismiss(alert.id)}
          onAcknowledge={() => onAcknowledge(alert)}
          onFocus={() => onFocusDevice(alert.imei)}
        />
      ))}
    </Box>
  );
}
