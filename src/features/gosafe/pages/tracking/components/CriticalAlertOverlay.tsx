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

// ─── Grid row detail helper ──────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  isDarkMode,
  mono = false,
  fontFamily,
}: {
  label: string;
  value: string;
  isDarkMode: boolean;
  mono?: boolean;
  fontFamily: string;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={2.5}>
      <Typography
        sx={{
          fontFamily,
          fontSize: '0.78rem',
          color: isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.5)',
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: mono ? 'Courier New, Courier, monospace' : fontFamily,
          fontSize: '0.8rem',
          fontWeight: 700,
          color: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
          letterSpacing: mono ? 0.3 : undefined,
          wordBreak: 'break-all',
          textAlign: 'right',
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

// ─── Single alert card ────────────────────────────────────────────────────────

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

  // Custom CSS variables for animations
  const alertPulse0 = isDarkMode
    ? `0 16px 48px rgba(0,0,0,0.7), 0 0 0 0 ${accentColor}b3`
    : `0 16px 40px rgba(15,23,42,0.1), 0 0 0 0 ${accentColor}33`;

  const alertPulse50 = isDarkMode
    ? `0 16px 48px rgba(0,0,0,0.7), 0 0 0 12px ${accentColor}00`
    : `0 16px 40px rgba(15,23,42,0.1), 0 0 0 12px ${accentColor}00`;

  const ringStart = `${accentColor}8c`;
  const ringEnd = `${accentColor}00`;

  const borderColor = isSOS
    ? isDarkMode ? 'rgba(239,68,68,0.45)' : 'rgba(239,68,68,0.2)'
    : isDarkMode ? 'rgba(245,158,11,0.45)' : 'rgba(245,158,11,0.2)';

  const cardBg = isDarkMode
    ? isSOS
      ? 'linear-gradient(160deg, #1a0a0a 0%, #0f172a 100%)'
      : 'linear-gradient(160deg, #1c1308 0%, #0f172a 100%)'
    : isSOS
      ? 'linear-gradient(180deg, #ffffff 60%, #fff6f6 100%)'
      : 'linear-gradient(180deg, #ffffff 60%, #fffcf5 100%)';

  const headerBg = isDarkMode
    ? isSOS ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)'
    : isSOS ? 'rgba(239,68,68,0.04)' : 'rgba(245,158,11,0.04)';

  const shadow = isDarkMode
    ? `0 20px 50px rgba(0, 0, 0, 0.65), 0 0 0 1px ${borderColor}`
    : `0 20px 40px rgba(15, 23, 42, 0.08), 0 0 0 1px ${borderColor}`;

  const fontFamily = '"Inter", "Inter var", sans-serif';

  return (
    <Box
      className={isSOS ? 'gs-critical-sos' : 'gs-critical-fiber'}
      style={{
        '--gs-alert-pulse-0': alertPulse0,
        '--gs-alert-pulse-50': alertPulse50,
      } as React.CSSProperties}
      sx={{
        width: 420,
        borderRadius: '16px',
        background: cardBg,
        border: `1px solid ${borderColor}`,
        overflow: 'hidden',
        boxShadow: shadow,
        transition: 'background 0.3s, border 0.3s, box-shadow 0.3s',
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        className={isSOS ? 'gs-critical-sheen' : undefined}
        sx={{
          position: 'relative',
          px: 3,
          py: 2,
          background: headerBg,
          borderBottom: `1px solid ${borderColor}`,
          overflow: 'hidden',
        }}
      >
        {/* Pulsing icon circle */}
        <Box
          className="gs-critical-icon-sos"
          style={{
            '--gs-icon-ring-start': ringStart,
            '--gs-icon-ring-end': ringEnd,
          } as React.CSSProperties}
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: isDarkMode ? `${accentColor}26` : `${accentColor}12`,
            border: `1.5px solid ${accentColor}`,
          }}
        >
          {isSOS ? (
            <Danger size={22} color={accentColor} variant="Bold" />
          ) : (
            <Scissor size={22} color={accentColor} variant="Bold" />
          )}
        </Box>

        {/* Title and live status */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily,
              fontWeight: 800,
              fontSize: '0.95rem',
              color: accentColor,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              lineHeight: 1.2,
            }}
          >
            {isSOS ? 'SOS Khấn cấp' : 'Thiết bị tháo dây'}
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.5 }}>
            {!resolved && (
              <Box
                className="gs-live-dot"
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: accentColor,
                  flexShrink: 0,
                }}
              />
            )}
            <Typography
              sx={{
                fontFamily,
                fontSize: '0.75rem',
                color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)',
                fontWeight: 600,
              }}
            >
              {resolved ? 'Đã kết thúc' : 'Đang hoạt động'} · {fmt(alert.timestamp)}
            </Typography>
          </Stack>
        </Box>

        {/* Resolved status or close button */}
        {resolved && (
          <Chip
            label="Đã giải quyết"
            size="small"
            sx={{
              fontFamily,
              height: 22,
              fontSize: '0.7rem',
              fontWeight: 700,
              bgcolor: 'rgba(34,197,94,0.15)',
              color: '#22c55e',
              border: '1px solid rgba(34,197,94,0.3)',
            }}
          />
        )}
        <IconButton
          size="small"
          onClick={onDismiss}
          sx={{
            color: isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.45)',
            p: 0.5,
            '&:hover': {
              color: isDarkMode ? '#fff' : '#0f172a',
              bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            },
          }}
        >
          <CloseCircle size={20} />
        </IconButton>
      </Stack>

      {/* Body */}
      <Box sx={{ px: 3, py: 2.5 }}>
        {/* Descriptive text */}
        <Typography
          sx={{
            fontFamily,
            fontSize: '0.98rem',
            color: isDarkMode ? '#f8fafc' : '#0f172a',
            fontWeight: 800,
            mb: 2,
            lineHeight: 1.4,
          }}
        >
          {isSOS
            ? 'Phạm nhân yêu cầu hỗ trợ khẩn cấp'
            : 'Phát hiện tháo hoặc cắt đứt dây thiết bị'}
        </Typography>

        {/* Subject Information Sub-Card */}
        {device?.subject?.fullName && (
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{
              px: 2,
              py: 1.75,
              borderRadius: '10px',
              bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.25)' : 'rgba(15, 23, 42, 0.02)',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)'}`,
              mb: 2,
            }}
          >
            {/* Letter Avatar */}
            <Avatar
              sx={{
                width: 44,
                height: 44,
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#fff',
                fontFamily,
                background: isSOS
                  ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                boxShadow: isDarkMode
                  ? `0 4px 14px ${accentColor}33`
                  : `0 4px 12px ${accentColor}24`,
              }}
            >
              {device.subject.fullName.trim().split(' ').pop()?.charAt(0).toUpperCase() || '?'}
            </Avatar>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontFamily,
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: isSOS
                    ? isDarkMode ? '#fca5a5' : '#b91c1c'
                    : isDarkMode ? '#fdba74' : '#d97706',
                  lineHeight: 1.25,
                }}
              >
                {device.subject.fullName}
              </Typography>
              {device.subject.idNumber && (
                <Typography
                  sx={{
                    fontFamily,
                    fontSize: '0.78rem',
                    color: isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.5)',
                    mt: 0.5,
                    fontWeight: 600,
                  }}
                >
                  CCCD/TC: {device.subject.idNumber}
                </Typography>
              )}
            </Box>
          </Stack>
        )}

        {/* Device & Location details grid */}
        <Stack
          spacing={1.25}
          sx={{
            px: 2,
            py: 1.75,
            borderRadius: '10px',
            bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'}`,
          }}
        >
          <DetailRow
            label="Thiết bị"
            value={device?.name ?? alert.imei}
            isDarkMode={isDarkMode}
            fontFamily={fontFamily}
          />
          <DetailRow
            label="IMEI"
            value={alert.imei}
            isDarkMode={isDarkMode}
            mono
            fontFamily={fontFamily}
          />
          <DetailRow
            label="Tọa độ"
            value={fmtCoords(alert.coords)}
            isDarkMode={isDarkMode}
            mono
            fontFamily={fontFamily}
          />
        </Stack>
      </Box>

      {/* Footer */}
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          px: 3,
          pt: 2.25,
          pb: 3, // Thêm padding dưới để đẩy nút lên không bị clip góc tròn
          borderTop: `1px solid ${borderColor}`,
          bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.015)',
        }}
      >
        <Button
          size="medium"
          variant="outlined"
          startIcon={<Location size={16} />}
          onClick={onFocus}
          sx={{
            flex: 1,
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 700,
            fontFamily,
            color: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
            borderColor: isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(15,23,42,0.25)',
            textTransform: 'none',
            py: 1,
            '&:hover': {
              borderColor: isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.45)',
              bgcolor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            },
          }}
        >
          Xem bản đồ
        </Button>
        <Button
          size="medium"
          variant="contained"
          startIcon={<TickCircle size={16} variant="Bold" />}
          onClick={onAcknowledge}
          sx={{
            flex: 1,
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 800,
            fontFamily,
            textTransform: 'none',
            bgcolor: accentColor,
            color: '#ffffff',
            py: 1,
            boxShadow: `0 6px 16px ${accentColor}33`,
            '&:hover': {
              bgcolor: accentColor,
              filter: 'brightness(1.1)',
              boxShadow: `0 8px 20px ${accentColor}4d`,
            },
          }}
        >
          Tiếp nhận
        </Button>
      </Stack>
    </Box>
  );
}

// ─── Overlay ─────────────────────────────────────────────────────────────────

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
        bottom: 24,
        right: 24,
        zIndex: 9500,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 1.5,
        maxHeight: 'calc(100vh - 80px)',
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2 },
      }}
    >
      {/* Dismiss-all button — shown when 2+ alerts */}
      {alerts.length >= 2 && (
        <Button
          size="medium"
          variant="outlined"
          onClick={onDismissAll}
          sx={{
            width: 420,
            borderRadius: 2,
            fontSize: '0.82rem',
            fontWeight: 700,
            fontFamily: '"Inter", sans-serif',
            color: isDarkMode ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.2)',
            bgcolor: isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            textTransform: 'none',
            py: 1,
            boxShadow: isDarkMode ? 'none' : '0 4px 16px rgba(0, 0, 0, 0.06)',
            '&:hover': {
              bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.04)',
              borderColor: isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.35)',
            },
          }}
        >
          Xác nhận tất cả ({alerts.length} cảnh báo)
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
