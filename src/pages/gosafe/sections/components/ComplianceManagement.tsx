import { useEffect, useState, useCallback } from 'react';
import {
  Box, Stack, Typography, Button, IconButton, Tooltip, TextField, MenuItem, Chip, CircularProgress,
  Table, TableHead, TableBody, TableRow, TableCell
} from '@mui/material';
import { Add, Edit, Trash, Calendar, Refresh, Clock, Health, Location } from 'iconsax-react';
import { complianceApi, extractList } from 'api/gosafe.management.api';
import SideDrawer from '../../components/SideDrawer';

interface Props {
  isDark: boolean;
}

const EVENT_TYPES = [
  { value: 'CHECK_IN', label: 'Điểm danh', icon: <Calendar size={16} variant="Bold" color="#1e6fd9" />, color: '#1e6fd9' },
  { value: 'CURFEW', label: 'Giới nghiêm', icon: <Clock size={16} variant="Bold" color="#ea580c" />, color: '#ea580c' },
  { value: 'DRUG_TEST', label: 'Xét nghiệm', icon: <Health size={16} variant="Bold" color="#9333ea" />, color: '#9333ea' }
];
function eventMeta(t: unknown) {
  const key = String(t ?? '').toUpperCase();
  return EVENT_TYPES.find((e) => e.value === key) ?? { label: key || '—', icon: <Location size={16} />, color: '#64748b' };
}

interface RuleRow {
  id: string;
  name: string;
  eventType: string;
  targetType: string;
  recurrence: string;
  offenderId?: string;
  isActive: boolean;
}

export default function ComplianceManagement({ isDark }: Props) {
  const [rows, setRows] = useState<RuleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ mode: 'add' | 'edit'; row?: RuleRow } | null>(null);

  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#fff';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await complianceApi.list({ pageSize: 100 });
      setRows(extractList(res.data).map((r: any): RuleRow => ({
        id: String(r.id),
        name: r.name ?? '—',
        eventType: r.eventType ?? r.event_type ?? '',
        targetType: r.targetType ?? r.target_type ?? 'ALL',
        recurrence: [r.recurrencePattern ?? r.recurrence ?? r.schedule, r.scheduledTime].filter(Boolean).join(' · ') || '—',
        offenderId: r.offenderId,
        isActive: r.isActive ?? true
      })));
    } catch {
      setRows([]);
      setError('Chưa kết nối được API lịch trình (cần đăng nhập tài khoản GoSafe thật).');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const removeRow = (row: RuleRow) => {
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    complianceApi.delete(row.id).catch(() => {});
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Quy tắc tuân thủ & lịch bắt buộc</Typography>
        <Tooltip title="Tải lại"><IconButton size="small" onClick={load} sx={{ border: '1px solid', borderColor: cardBorder, borderRadius: '9px' }}><Refresh size={16} /></IconButton></Tooltip>
        <Button variant="contained" startIcon={<Add size={18} />} onClick={() => setDialog({ mode: 'add' })} sx={{ borderRadius: '9px', fontWeight: 700, ml: 'auto' }}>Thêm quy tắc</Button>
      </Stack>

      {/* Type legend */}
      <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
        {EVENT_TYPES.map((e) => (
          <Chip key={e.value} icon={e.icon as any} label={e.label} size="small" sx={{ fontWeight: 600, bgcolor: `${e.color}14`, color: e.color, '& .MuiChip-icon': { ml: 0.75 } }} />
        ))}
      </Stack>

      <Box sx={{ borderRadius: '12px', border: '1px solid', borderColor: cardBorder, bgcolor: cardBg, overflow: 'hidden' }}>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress size={24} /></Stack>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', borderColor: cardBorder } }}>
                <TableCell>Tên quy tắc</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Áp dụng</TableCell>
                <TableCell>Lịch lặp</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => {
                const em = eventMeta(r.eventType);
                return (
                  <TableRow key={r.id} hover sx={{ '& td': { borderColor: cardBorder, fontSize: '0.8rem' } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{r.name}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: em.color, fontWeight: 600 }}>
                        {em.icon} {em.label}
                      </Stack>
                    </TableCell>
                    <TableCell>{r.targetType === 'OFFENDER' ? `Đối tượng ${r.offenderId ?? ''}` : 'Toàn bộ'}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{r.recurrence || '—'}</TableCell>
                    <TableCell>
                      <Chip label={r.isActive ? 'Hoạt động' : 'Tạm dừng'} size="small" color={r.isActive ? 'success' : 'default'} sx={{ height: 20, fontWeight: 700, fontSize: '0.65rem' }} />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton size="small" onClick={() => setDialog({ mode: 'edit', row: r })} sx={{ color: '#1e6fd9', border: '1px solid', borderColor: cardBorder, borderRadius: '8px' }}><Edit size={15} /></IconButton>
                        <IconButton size="small" onClick={() => removeRow(r)} sx={{ color: '#ef4444', border: '1px solid', borderColor: cardBorder, borderRadius: '8px' }}><Trash size={15} /></IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', py: 5, color: isDark ? '#64748b' : '#94a3b8', borderColor: cardBorder }}>{error ?? 'Chưa có quy tắc nào.'}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Box>

      {dialog && <RuleDialog isDark={isDark} mode={dialog.mode} row={dialog.row} onClose={() => setDialog(null)} onSaved={load} />}
    </Box>
  );
}

function RuleDialog({ isDark, mode, row, onClose, onSaved }: { isDark: boolean; mode: 'add' | 'edit'; row?: RuleRow; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: row?.name ?? '',
    eventType: row?.eventType || 'CHECK_IN',
    targetType: row?.targetType || 'ALL',
    recurrence: row?.recurrence ?? 'DAILY 08:00',
    offenderId: row?.offenderId ?? ''
  });
  const set = (p: Partial<typeof form>) => setForm((f) => ({ ...f, ...p }));

  const save = () => {
    if (!form.name) return;
    const body = { ...form, offenderId: form.targetType === 'OFFENDER' ? form.offenderId : undefined };
    if (mode === 'edit' && row) complianceApi.update(row.id, body).catch(() => {});
    else complianceApi.create(body).catch(() => {});
    onClose();
    setTimeout(onSaved, 300);
  };

  return (
    <SideDrawer
      open
      onClose={onClose}
      isDark={isDark}
      title={mode === 'edit' ? 'Sửa quy tắc' : 'Thêm quy tắc tuân thủ'}
      subtitle="Điểm danh · Giới nghiêm · Xét nghiệm"
      footer={
        <>
          <Button onClick={onClose} sx={{ borderRadius: 2.5, fontWeight: 600, color: 'text.secondary' }}>Hủy</Button>
          <Button variant="contained" onClick={save} disabled={!form.name} sx={{ borderRadius: 2.5, fontWeight: 700, px: 3 }}>Lưu</Button>
        </>
      }
    >
      <Stack spacing={2.5}>
        <TextField label="Tên quy tắc *" fullWidth value={form.name} onChange={(e) => set({ name: e.target.value })} />
        <TextField select label="Loại sự kiện" fullWidth value={form.eventType} onChange={(e) => set({ eventType: e.target.value })}>
          {EVENT_TYPES.map((e) => <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>)}
        </TextField>
        <TextField select label="Áp dụng cho" fullWidth value={form.targetType} onChange={(e) => set({ targetType: e.target.value })}>
          <MenuItem value="ALL">Toàn bộ đối tượng</MenuItem>
          <MenuItem value="OFFENDER">Một đối tượng cụ thể</MenuItem>
        </TextField>
        {form.targetType === 'OFFENDER' && (
          <TextField label="ID đối tượng" fullWidth value={form.offenderId} onChange={(e) => set({ offenderId: e.target.value })} />
        )}
        <TextField label="Lịch lặp (recurrence)" fullWidth value={form.recurrence} onChange={(e) => set({ recurrence: e.target.value })} placeholder="VD: DAILY 08:00 · WEEKLY MON 20:00" />
      </Stack>
    </SideDrawer>
  );
}
