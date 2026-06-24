import { useCallback, useEffect, useState } from 'react';
import { Stack, Typography, Button, Box, Divider, Switch, FormControlLabel, Chip, CircularProgress, Collapse, TextField } from '@mui/material';
import { VolumeHigh, VolumeCross, Danger, Warning2, BatteryFull, Wifi, Clock, Notification, TickCircle, Send2, CloseCircle } from 'iconsax-react';
import { alertsApi, notificationsApi, extractList } from 'api/gosafe.management.api';
import { timeAgo } from '../utils';
import { useFeedback } from '../../components/FeedbackProvider';
import type { TrackingStore } from '../useTracking';

interface Props {
  store: TrackingStore;
}

type Severity = 'critical' | 'warning' | 'info';

interface FeedItem {
  id: string;
  severity: Severity;
  icon: React.ReactNode;
  title: string;
  desc: string;
  time?: string;
  /** server alert id để xử lý acknowledge/close */
  alertId?: string;
}

const SEV_META: Record<Severity, { color: string; bg: (d: boolean) => string; label: string }> = {
  critical: { color: '#ef4444', bg: (d) => (d ? 'rgba(239,68,68,0.12)' : '#fef2f2'), label: 'Khẩn cấp' },
  warning: { color: '#f59e0b', bg: (d) => (d ? 'rgba(245,158,11,0.12)' : '#fffbeb'), label: 'Cảnh báo' },
  info: { color: '#3b82f6', bg: (d) => (d ? 'rgba(59,130,246,0.1)' : '#eff6ff'), label: 'Thông tin' }
};

function ItemCard({ item, isDark, onAck }: { item: FeedItem; isDark: boolean; onAck?: () => void }) {
  const meta = SEV_META[item.severity];
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.25,
        p: 1.5,
        borderRadius: '12px',
        bgcolor: meta.bg(isDark),
        border: '1px solid',
        borderColor: isDark ? `${meta.color}33` : `${meta.color}22`,
        alignItems: 'flex-start'
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          flexShrink: 0,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: isDark ? `${meta.color}22` : '#fff',
          border: '1px solid',
          borderColor: `${meta.color}40`
        }}
      >
        {item.icon}
      </Box>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: isDark ? '#f8fafc' : '#0f172a', lineHeight: 1.25 }}>
            {item.title}
          </Typography>
          {item.time && (
            <Typography sx={{ fontSize: '0.66rem', color: isDark ? '#64748b' : '#94a3b8', flexShrink: 0, fontWeight: 600 }}>
              {item.time}
            </Typography>
          )}
        </Stack>
        <Typography sx={{ fontSize: '0.74rem', color: isDark ? '#cbd5e1' : '#475569', mt: 0.25, lineHeight: 1.4 }}>
          {item.desc}
        </Typography>
        {onAck && (
          <Button
            size="small"
            startIcon={<TickCircle size={14} />}
            onClick={onAck}
            sx={{ mt: 0.75, fontSize: '0.7rem', fontWeight: 700, py: 0.2, px: 1, borderRadius: 1.5, color: meta.color, border: `1px solid ${meta.color}55` }}
          >
            Đã xử lý
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default function NotificationList({ store }: Props) {
  const { isDark, devices, logs, setLogs, soundEnabled, setSoundEnabled, syncMinutesMap, addLog } = store;
  const { notify } = useFeedback();

  const [serverItems, setServerItems] = useState<FeedItem[]>([]);
  const [loadingServer, setLoadingServer] = useState(false);

  // ── Soạn & gửi cảnh báo hệ thống ──
  const [composeOpen, setComposeOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [composeTitle, setComposeTitle] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeRoles, setComposeRoles] = useState('');

  // ── Cảnh báo dẫn xuất cục bộ (luôn hoạt động) ──
  const localItems: FeedItem[] = [];
  devices.forEach((d) => {
    if (d.status.battery > 0 && d.status.battery < 20)
      localItems.push({ id: `bat-${d.id}`, severity: 'critical', icon: <BatteryFull size={20} color="#f59e0b" variant="Bold" />, title: `${d.name}: Pin yếu (${d.status.battery}%)`, desc: `Pin còn ${d.status.battery}% — cần sạc gấp.` });
    if (d.status.connectionStatus === 'offline')
      localItems.push({ id: `off-${d.id}`, severity: 'critical', icon: <Wifi size={20} color="#ef4444" variant="Bold" />, title: `${d.name}: Mất kết nối`, desc: 'Thiết bị không phản hồi máy chủ.' });
    if ((syncMinutesMap[d.id] ?? 0) > 30)
      localItems.push({ id: `sync-${d.id}`, severity: 'warning', icon: <Clock size={20} color="#f59e0b" variant="Bold" />, title: `${d.name}: Chậm đồng bộ`, desc: `Không đồng bộ trong ${syncMinutesMap[d.id]} phút.` });
  });

  // ── Tải cảnh báo & thông báo từ máy chủ (best-effort) ──
  const loadServer = useCallback(async () => {
      setLoadingServer(true);
      const out: FeedItem[] = [];
      try {
        const res = await alertsApi.list({ pageSize: 20, status: 'PENDING' });
        extractList(res.data).forEach((a: any) => {
          // level có thể là SỐ (1=cao nhất) hoặc CHUỖI
          const lvRaw = a.level ?? a.alertType?.level ?? a.severity;
          const n = typeof lvRaw === 'number' ? lvRaw : Number(lvRaw);
          let sev: Severity;
          if (Number.isFinite(n) && n >= 1) sev = n <= 1 ? 'critical' : n === 2 ? 'warning' : 'info';
          else {
            const l = String(lvRaw ?? '').toUpperCase();
            sev = l.includes('HIGH') || l.includes('CRIT') ? 'critical' : l.includes('MED') || l.includes('WARN') ? 'warning' : 'info';
          }
          const created = a.createdDate ?? a.createdAt ?? a.created_at;
          out.push({
            id: `alert-${a.id}`,
            alertId: String(a.id),
            severity: sev,
            icon: <Danger size={20} color={SEV_META[sev].color} variant="Bold" />,
            title: a.alertType?.name ?? a.alertTypeName ?? a.alertTypeCode ?? a.title ?? 'Cảnh báo',
            desc: a.offender?.fullname ?? a.message ?? a.description ?? a.note ?? '—',
            time: created ? timeAgo(new Date(created)) : undefined
          });
        });
      } catch { /* bỏ qua — fallback cục bộ */ }
      try {
        const res = await notificationsApi.list({ pageSize: 20 });
        extractList(res.data).forEach((n: any) => {
          out.push({
            id: `noti-${n.id}`,
            severity: 'info',
            icon: <Notification size={20} color="#3b82f6" variant="Bold" />,
            title: n.title ?? 'Thông báo',
            desc: n.body ?? n.message ?? n.content ?? '',
            time: (n.createdDate ?? n.createdAt) ? timeAgo(new Date(n.createdDate ?? n.createdAt)) : undefined
          });
        });
      } catch { /* bỏ qua */ }
      setServerItems(out);
      setLoadingServer(false);
  }, []);

  useEffect(() => {
    loadServer();
  }, [loadServer]);

  const handleAck = (alertId: string) => {
    setServerItems((prev) => prev.filter((i) => i.alertId !== alertId));
    alertsApi.acknowledge({ alertId }).catch(() => {});
  };

  const resetCompose = () => {
    setComposeTitle('');
    setComposeBody('');
    setComposeRoles('');
    setComposeOpen(false);
  };

  const handleSendSystemAlert = async () => {
    const title = composeTitle.trim();
    const body = composeBody.trim();
    if (!title || !body) return;
    // roleIds: "1, 2" → [1, 2]; bỏ trống → gửi theo vai trò mặc định của máy chủ.
    const roleIds = composeRoles
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);

    setSending(true);
    try {
      await notificationsApi.send({
        title,
        body,
        ...(roleIds.length ? { roleIds } : {}),
        data: { source: 'gosafe-tracking', kind: 'system' }
      });
      notify('Đã gửi cảnh báo hệ thống', 'success');
      addLog(`Đã gửi cảnh báo hệ thống: "${title}".`, 'info');
      resetCompose();
      loadServer();
    } catch {
      notify('Không gửi được cảnh báo hệ thống', 'error');
    } finally {
      setSending(false);
    }
  };

  const critical = [...localItems.filter((i) => i.severity === 'critical'), ...serverItems.filter((i) => i.severity === 'critical')];
  const warning = [...localItems.filter((i) => i.severity === 'warning'), ...serverItems.filter((i) => i.severity === 'warning')];
  const info = serverItems.filter((i) => i.severity === 'info');
  const totalActive = critical.length + warning.length + info.length;

  return (
    <Stack spacing={2}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={1} alignItems="center">
          <Notification size={20} color={isDark ? '#f8fafc' : '#0f172a'} variant="Bold" />
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Trung tâm thông báo</Typography>
        </Stack>
        <Chip
          label={`${totalActive} hoạt động`}
          size="small"
          color={critical.length ? 'error' : warning.length ? 'warning' : 'default'}
          sx={{ fontWeight: 700, height: 22 }}
        />
      </Stack>

      <FormControlLabel
        control={<Switch checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} size="small" />}
        label={
          <Stack direction="row" spacing={0.8} alignItems="center">
            {soundEnabled ? <VolumeHigh size={18} /> : <VolumeCross size={18} />}
            <Typography variant="body2">Phát còi cảnh báo</Typography>
          </Stack>
        }
      />

      {/* ── Gửi cảnh báo hệ thống (POST /v1/notifications/send) ── */}
      <Box sx={{ border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <Button
          fullWidth
          startIcon={composeOpen ? <CloseCircle size={18} /> : <Send2 size={18} variant="Bold" />}
          onClick={() => setComposeOpen((o) => !o)}
          sx={{ justifyContent: 'flex-start', fontWeight: 700, py: 1.1, px: 1.5, borderRadius: 0, color: isDark ? '#f8fafc' : '#0f172a' }}
        >
          {composeOpen ? 'Đóng soạn cảnh báo' : 'Gửi cảnh báo hệ thống'}
        </Button>
        <Collapse in={composeOpen}>
          <Stack spacing={1.5} sx={{ p: 1.75, pt: 0.5 }}>
            <TextField
              label="Tiêu đề *"
              size="small"
              fullWidth
              value={composeTitle}
              onChange={(e) => setComposeTitle(e.target.value)}
              placeholder="VD: Bảo trì hệ thống định vị"
            />
            <TextField
              label="Nội dung *"
              size="small"
              fullWidth
              multiline
              minRows={2}
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              placeholder="VD: Hệ thống sẽ tạm gián đoạn lúc 22:00 hôm nay."
            />
            <TextField
              label="Role ID nhận (tùy chọn)"
              size="small"
              fullWidth
              value={composeRoles}
              onChange={(e) => setComposeRoles(e.target.value)}
              placeholder="VD: 1, 2 — bỏ trống = gửi theo vai trò mặc định"
              helperText="Phân tách bằng dấu phẩy. Để trống sẽ gửi theo vai trò mặc định của máy chủ."
            />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button onClick={resetCompose} sx={{ fontWeight: 600, color: 'text.secondary', borderRadius: 2 }}>
                Hủy
              </Button>
              <Button
                variant="contained"
                startIcon={sending ? <CircularProgress size={14} color="inherit" /> : <Send2 size={16} variant="Bold" />}
                disabled={sending || !composeTitle.trim() || !composeBody.trim()}
                onClick={handleSendSystemAlert}
                sx={{ fontWeight: 700, borderRadius: 2, px: 2.5 }}
              >
                Gửi
              </Button>
            </Stack>
          </Stack>
        </Collapse>
      </Box>

      {loadingServer && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
          <CircularProgress size={14} />
          <Typography variant="caption">Đang tải cảnh báo từ máy chủ…</Typography>
        </Stack>
      )}

      {/* Grouped sections */}
      {[
        { sev: 'critical' as const, items: critical, icon: <Danger size={16} color="#ef4444" variant="Bold" /> },
        { sev: 'warning' as const, items: warning, icon: <Warning2 size={16} color="#f59e0b" variant="Bold" /> },
        { sev: 'info' as const, items: info, icon: <Notification size={16} color="#3b82f6" variant="Bold" /> }
      ].map(
        (group) =>
          group.items.length > 0 && (
            <Stack key={group.sev} spacing={1}>
              <Stack direction="row" spacing={0.75} alignItems="center">
                {group.icon}
                <Typography sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5, color: SEV_META[group.sev].color }}>
                  {SEV_META[group.sev].label} ({group.items.length})
                </Typography>
              </Stack>
              {group.items.map((item) => (
                <ItemCard key={item.id} item={item} isDark={isDark} onAck={item.alertId ? () => handleAck(item.alertId!) : undefined} />
              ))}
            </Stack>
          )
      )}

      {totalActive === 0 && !loadingServer && (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <TickCircle size={40} color="#22c55e" variant="Bold" />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 600 }}>
            Không có cảnh báo nào. Hệ thống ổn định.
          </Typography>
        </Box>
      )}

      <Divider />

      {/* Event log */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Clock size={16} color={isDark ? '#94a3b8' : '#64748b'} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Nhật ký sự kiện</Typography>
        </Stack>
        <Button variant="text" size="small" color="error" onClick={() => setLogs([])} sx={{ fontWeight: 700, fontSize: '0.72rem' }}>
          Xóa tất cả
        </Button>
      </Stack>

      <Stack spacing={1}>
        {logs.map((log) => {
          const color = log.type === 'warning' ? '#ef4444' : log.type === 'success' ? '#22c55e' : '#64748b';
          return (
            <Box
              key={log.id}
              sx={{
                p: 1.25,
                borderRadius: '10px',
                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                borderLeft: '3px solid',
                borderColor: color
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.25}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'inline-flex', alignItems: 'center', gap: 0.4 }}>
                  <Clock size={13} variant="Bold" /> {log.time}
                </Typography>
                {log.type === 'warning' && (
                  <Chip label="Báo động" color="error" size="small" sx={{ height: 16, fontSize: '0.62rem', fontWeight: 700 }} />
                )}
              </Stack>
              <Typography variant="body2" sx={{ color: isDark ? '#e2e8f0' : '#1e293b', fontWeight: log.type === 'warning' ? 600 : 400, fontSize: '0.8rem' }}>
                {log.message}
              </Typography>
            </Box>
          );
        })}
        {logs.length === 0 && (
          <Typography variant="body2" align="center" color="text.secondary" sx={{ py: 2 }}>
            Nhật ký trống.
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
