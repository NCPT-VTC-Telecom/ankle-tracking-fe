import { Box, Typography, IconButton, Button, Stack, Chip } from '@mui/material';
import { CloseCircle, Danger, Scissor, Location } from 'iconsax-react';
import type { CriticalAlert, Device } from '../types';

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(d: Date): string {
  return d.toTimeString().slice(0, 8);
}

function fmtCoords(coords: [number, number]): string {
  return `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`;
}

// ─── Single alert card ────────────────────────────────────────────────────────

interface CardProps {
  alert: CriticalAlert;
  device: Device | undefined;
  onDismiss: () => void;
  onFocus: () => void;
}

function AlertCard({ alert, device, onDismiss, onFocus }: CardProps) {
  const isSOS = alert.type === 'sos';
  const resolved = device
    ? isSOS
      ? !/\bsos\b/i.test(device.status.eventName)
      : !/fiber[\s_]*(optical[\s_]*)?cut/i.test(device.status.eventName)
    : false;

  const accentColor = isSOS ? '#ef4444' : '#f59e0b';
  const bgColor     = isSOS ? '#1c0707' : '#1c1007';
  const borderColor = isSOS ? 'rgba(239,68,68,0.55)' : 'rgba(245,158,11,0.55)';

  return (
    <Box
      className={isSOS ? 'gs-critical-sos' : 'gs-critical-fiber'}
      sx={{
        width: 380,
        borderRadius: 2.5,
        bgcolor: bgColor,
        border: `1.5px solid ${borderColor}`,
        overflow: 'hidden',
        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${borderColor}`,
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          px: 2,
          py: 1.25,
          bgcolor: isSOS ? 'rgba(239,68,68,0.18)' : 'rgba(245,158,11,0.15)',
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        {isSOS
          ? <Danger size={20} color={accentColor} variant="Bold" />
          : <Scissor size={20} color={accentColor} variant="Bold" />
        }
        <Typography sx={{ flex: 1, fontWeight: 800, fontSize: '0.82rem', color: accentColor, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          {isSOS ? 'SOS Khẩn cấp' : 'Thiết bị bị tháo dây'}
        </Typography>
        <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', mr: 0.5 }}>
          {fmt(alert.timestamp)}
        </Typography>
        {resolved && (
          <Chip
            label="Đã giải quyết"
            size="small"
            sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}
          />
        )}
        <IconButton size="small" onClick={onDismiss} sx={{ color: 'rgba(255,255,255,0.4)', p: 0.25, '&:hover': { color: '#fff' } }}>
          <CloseCircle size={18} />
        </IconButton>
      </Stack>

      {/* Body */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography sx={{ fontSize: '0.85rem', color: '#f1f5f9', fontWeight: 600, mb: 1.25 }}>
          {isSOS
            ? 'Phạm nhân yêu cầu hỗ trợ khẩn cấp'
            : 'Phát hiện cắt đứt dây cáp quang thiết bị'}
        </Typography>

        <Stack spacing={0.6}>
          <Row label="Thiết bị"   value={device?.name    ?? alert.imei} />
          <Row label="IMEI"       value={alert.imei} mono />
          {device?.subject?.fullName && (
            <Row label="Phạm nhân" value={device.subject.fullName} highlight={isSOS} />
          )}
          {device?.subject?.idNumber && (
            <Row label="CCCD/TC"   value={device.subject.idNumber} />
          )}
          <Row label="Toạ độ"     value={fmtCoords(alert.coords)} mono />
        </Stack>
      </Box>

      {/* Footer */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ px: 2, py: 1.25, borderTop: `1px solid ${borderColor}` }}
      >
        <Button
          size="small"
          variant="outlined"
          startIcon={<Location size={14} />}
          onClick={onFocus}
          sx={{
            flex: 1,
            borderRadius: 1.5,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.75)',
            borderColor: 'rgba(255,255,255,0.2)',
            textTransform: 'none',
            '&:hover': { borderColor: 'rgba(255,255,255,0.5)', bgcolor: 'rgba(255,255,255,0.06)' }
          }}
        >
          Xem bản đồ
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={onDismiss}
          sx={{
            flex: 1,
            borderRadius: 1.5,
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'none',
            bgcolor: accentColor,
            '&:hover': { filter: 'brightness(1.15)' }
          }}
        >
          Xác nhận
        </Button>
      </Stack>
    </Box>
  );
}

// Small helper for body rows
function Row({ label, value, mono = false, highlight = false }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <Stack direction="row" spacing={1} alignItems="baseline">
      <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.38)', minWidth: 76, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography sx={{
        fontSize: '0.75rem',
        fontFamily: mono ? 'monospace' : undefined,
        color: highlight ? '#fca5a5' : 'rgba(255,255,255,0.82)',
        fontWeight: highlight ? 700 : 400,
        wordBreak: 'break-all',
      }}>
        {value}
      </Typography>
    </Stack>
  );
}

// ─── Overlay ─────────────────────────────────────────────────────────────────

interface Props {
  alerts: CriticalAlert[];
  devices: Device[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  onFocusDevice: (imei: string) => void;
}

export default function CriticalAlertOverlay({ alerts, devices, onDismiss, onDismissAll, onFocusDevice }: Props) {
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
          size="small"
          variant="outlined"
          onClick={onDismissAll}
          sx={{
            width: 380,
            borderRadius: 2,
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.6)',
            borderColor: 'rgba(255,255,255,0.15)',
            bgcolor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            textTransform: 'none',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.3)' }
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
          onFocus={() => onFocusDevice(alert.imei)}
        />
      ))}
    </Box>
  );
}
