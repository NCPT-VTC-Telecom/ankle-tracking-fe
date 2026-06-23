import { useEffect, useState, useCallback } from 'react';
import {
  Box, Stack, Typography, Button, IconButton, Tooltip, TextField, MenuItem, Chip, CircularProgress,
  Table, TableHead, TableBody, TableRow, TableCell, Switch, FormControlLabel, Divider
} from '@mui/material';
import { Add, Edit, Trash, Calendar, Refresh, Clock, Health, Location } from 'iconsax-react';
import { complianceApi, offendersApi, regionsApi, extractList } from 'api/gosafe.management.api';
import SideDrawer from '../../components/SideDrawer';
import { useFeedback } from '../../components/FeedbackProvider';

interface Props {
  isDark: boolean;
  /** Chỉ super_admin mới được tạo/sửa/xoá lịch điểm danh */
  isSuperAdmin?: boolean;
  refreshKey?: number;
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
  recurrence: string; // chuỗi hiển thị
  recurrencePattern?: string;
  scheduledTime?: string;
  verificationMethod?: string;
  offenderId?: string;
  isActive: boolean;
  raw?: any;
}

export default function ComplianceManagement({ isDark, isSuperAdmin = false, refreshKey }: Props) {
  const [rows, setRows] = useState<RuleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ mode: 'add' | 'edit'; row?: RuleRow } | null>(null);

  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#fff';
  const { confirm, notify } = useFeedback();

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
        recurrencePattern: r.recurrencePattern ?? r.recurrence,
        scheduledTime: r.scheduledTime,
        verificationMethod: r.verificationMethod,
        offenderId: r.offenderId,
        isActive: r.isActive ?? true,
        raw: r
      })));
    } catch {
      setRows([]);
      setError('Chưa kết nối được API lịch trình (cần đăng nhập tài khoản GoSafe thật).');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const removeRow = async (row: RuleRow) => {
    const ok = await confirm({
      title: 'Xóa quy tắc',
      message: <>Xóa quy tắc <b>{row.name}</b>? Hành động này không thể hoàn tác.</>,
      confirmText: 'Xóa',
      tone: 'danger'
    });
    if (!ok) return;
    try {
      await complianceApi.delete(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      notify('Đã xóa quy tắc', 'success');
    } catch {
      notify('Xóa quy tắc thất bại', 'error');
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: isDark ? '#f8fafc' : '#0f172a' }}>Quy tắc tuân thủ & lịch điểm danh</Typography>
        <Tooltip title="Tải lại">
          <IconButton onClick={load} sx={{ border: '1px solid', borderColor: cardBorder, borderRadius: '12px', width: 44, height: 44 }}><Refresh size={20} /></IconButton>
        </Tooltip>
        {isSuperAdmin ? (
          <Button variant="contained" startIcon={<Add size={18} />} onClick={() => setDialog({ mode: 'add' })} sx={{ borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', py: 1.2, px: 2.5, ml: 'auto' }}>Tạo điểm danh / quy tắc</Button>
        ) : (
          <Chip label="Chỉ super admin được tạo điểm danh" sx={{ ml: 'auto', fontWeight: 600, fontSize: '0.82rem', height: 32, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', color: isDark ? '#94a3b8' : '#64748b', borderRadius: '12px' }} />
        )}
      </Stack>

      {/* Type legend */}
      <Stack direction="row" spacing={1.25} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        {EVENT_TYPES.map((e) => (
          <Chip key={e.value} icon={e.icon as any} label={e.label} sx={{ fontWeight: 600, fontSize: '0.85rem', height: 32, bgcolor: `${e.color}14`, color: e.color, borderRadius: '12px', '& .MuiChip-icon': { ml: 1 } }} />
        ))}
      </Stack>

      <Box sx={{ borderRadius: '16px', border: '1px solid', borderColor: cardBorder, bgcolor: cardBg, overflow: 'hidden' }}>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress size={24} /></Stack>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: 0.4, borderColor: cardBorder, py: 2, px: 2.5 } }}>
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
                  <TableRow key={r.id} hover sx={{ '& td': { borderColor: cardBorder, fontSize: '0.95rem', py: 2, px: 2.5 } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{r.name}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: em.color, fontWeight: 600 }}>
                        {em.icon} {em.label}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{r.targetType === 'INDIVIDUAL' || r.targetType === 'OFFENDER' ? `Đối tượng ${r.offenderId ?? ''}` : r.targetType === 'GROUP' ? 'Theo nhóm' : 'Toàn bộ'}</TableCell>
                    <TableCell sx={{ fontSize: '0.88rem' }}>{r.recurrence || '—'}</TableCell>
                    <TableCell>
                      <Chip label={r.isActive ? 'Hoạt động' : 'Tạm dừng'} size="small" color={r.isActive ? 'success' : 'default'} sx={{ height: 26, fontWeight: 700, fontSize: '0.78rem', borderRadius: '12px' }} />
                    </TableCell>
                    <TableCell align="right">
                      {isSuperAdmin ? (
                        <Stack direction="row" spacing={0.75} justifyContent="flex-end">
                          <IconButton onClick={() => setDialog({ mode: 'edit', row: r })} sx={{ color: '#1e6fd9', border: '1px solid', borderColor: cardBorder, borderRadius: '12px', width: 38, height: 38 }}><Edit size={18} /></IconButton>
                          <IconButton onClick={() => removeRow(r)} sx={{ color: '#ef4444', border: '1px solid', borderColor: cardBorder, borderRadius: '12px', width: 38, height: 38 }}><Trash size={18} /></IconButton>
                        </Stack>
                      ) : (
                        <Typography sx={{ fontSize: '0.88rem', color: isDark ? '#64748b' : '#94a3b8' }}>Chỉ xem</Typography>
                      )}
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

// Thứ trong tuần theo ISO (1=T2 … 7=CN) — recurrenceDays gửi dạng "1,3,5"
const WEEKDAYS = [
  { v: '1', label: 'T2' }, { v: '2', label: 'T3' }, { v: '3', label: 'T4' },
  { v: '4', label: 'T5' }, { v: '5', label: 'T6' }, { v: '6', label: 'T7' }, { v: '7', label: 'CN' }
];

function RuleDialog({ isDark, mode, row, onClose, onSaved }: { isDark: boolean; mode: 'add' | 'edit'; row?: RuleRow; onClose: () => void; onSaved: () => void }) {
  const raw: any = (row as any)?.raw ?? {};
  const [form, setForm] = useState({
    name: row?.name ?? '',
    eventType: row?.eventType || 'CHECK_IN',
    description: raw.description ?? '',
    location: raw.location ?? '',
    // Backend chỉ hỗ trợ GROUP | INDIVIDUAL
    targetType: row?.targetType === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'GROUP',
    targetSubjectType: raw.targetSubjectType ?? 'DRUG_ADDICT',
    offenderId: row?.offenderId ?? '',
    targetRegionId: raw.targetRegionId ?? '',
    recurrencePattern: row?.recurrencePattern || 'DAILY',
    recurrenceDays: raw.recurrenceDays ? String(raw.recurrenceDays).split(',').filter(Boolean) : ([] as string[]),
    scheduledTime: (row?.scheduledTime || '08:00').slice(0, 5),
    scheduledAt: raw.scheduledAt ? String(raw.scheduledAt).slice(0, 16) : '',
    curfewStart: (raw.curfewStart ?? '22:00').slice(0, 5),
    curfewEnd: (raw.curfewEnd ?? '05:00').slice(0, 5),
    dueInHours: raw.dueInHours ?? 2,
    verificationMethod: row?.verificationMethod || 'FACE_PHOTO',
    meritPointsReward: raw.meritPointsReward ?? 5,
    escalationThreshold: raw.escalationThreshold ?? 3,
    autoApprove: raw.autoApprove ?? false
  });
  const set = (p: Partial<typeof form>) => setForm((f) => ({ ...f, ...p }));
  const isCurfew = form.eventType === 'CURFEW';
  const isOnce = form.recurrencePattern === 'ONCE';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
  const { notify } = useFeedback();
  const [saving, setSaving] = useState(false);

  // Nạp danh sách đối tượng (INDIVIDUAL) + địa bàn (lọc phạm vi)
  const [offenders, setOffenders] = useState<{ id: string; name: string }[]>([]);
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    offendersApi.list({ pageSize: 300 }).then((res) => setOffenders(extractList(res.data).map((o: any) => ({ id: String(o.id), name: `${o.fullname ?? o.name ?? o.id}${o.citizenId ? ' · ' + o.citizenId : ''}` })))).catch(() => {});
    regionsApi.list({ pageSize: 300 }).then((res) => setRegions(extractList(res.data).map((r: any) => ({ id: String(r.id), name: r.name ?? r.code ?? r.id })))).catch(() => {});
  }, []);

  const invalid = !form.name || (form.targetType === 'INDIVIDUAL' && !form.offenderId);

  const save = async () => {
    if (invalid) return;
    // Khớp CreateComplianceRuleDto (đã đối chiếu swagger thật)
    const body: any = {
      name: form.name,
      eventType: form.eventType,
      description: form.description || undefined,
      location: form.location || undefined,
      targetType: form.targetType,
      targetSubjectType: form.targetType === 'GROUP' ? form.targetSubjectType : undefined,
      offenderId: form.targetType === 'INDIVIDUAL' ? form.offenderId : undefined,
      targetRegionId: form.targetRegionId || undefined,
      isMandatory: true,
      isRecurring: !isOnce,
      recurrencePattern: isOnce ? undefined : form.recurrencePattern,
      recurrenceDays: !isOnce && form.recurrencePattern === 'WEEKLY' && form.recurrenceDays.length ? form.recurrenceDays.join(',') : undefined,
      scheduledTime: isOnce || isCurfew ? undefined : form.scheduledTime,
      scheduledAt: isOnce ? (form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined) : undefined,
      curfewStart: isCurfew ? form.curfewStart : undefined,
      curfewEnd: isCurfew ? form.curfewEnd : undefined,
      dueInHours: Number(form.dueInHours) || undefined,
      verificationMethod: form.verificationMethod,
      autoApprove: form.autoApprove,
      meritPointsReward: Number(form.meritPointsReward) || undefined,
      escalationThreshold: Number(form.escalationThreshold) || undefined,
      isActive: true
    };
    setSaving(true);
    try {
      if (mode === 'edit' && row) await complianceApi.update(row.id, body);
      else await complianceApi.create(body);
      notify(mode === 'edit' ? 'Đã cập nhật quy tắc' : 'Đã tạo quy tắc điểm danh', 'success');
      onClose();
      setTimeout(onSaved, 300);
    } catch {
      notify('Lưu quy tắc thất bại — kiểm tra lại thông tin', 'error');
      setSaving(false);
    }
  };

  const sectionLabel = (t: string) => (
    <Divider sx={{ borderColor: cardBorder }}><Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>{t}</Typography></Divider>
  );

  return (
    <SideDrawer
      open
      onClose={onClose}
      isDark={isDark}
      width={560}
      title={mode === 'edit' ? 'Sửa quy tắc' : 'Tạo điểm danh / quy tắc'}
      subtitle="Điểm danh · Giới nghiêm · Xét nghiệm"
      footer={
        <>
          <Button onClick={onClose} sx={{ borderRadius: 2, fontWeight: 600, color: 'text.secondary' }}>Hủy</Button>
          <Button variant="contained" onClick={save} disabled={invalid || saving} sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}>{saving ? 'Đang lưu…' : 'Lưu'}</Button>
        </>
      }
    >
      <Stack spacing={2.5}>
        {/* Thông tin chung */}
        {sectionLabel('Thông tin chung')}
        <TextField label="Tên quy tắc *" fullWidth value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="VD: Điểm danh hằng ngày" />
        <TextField label="Mô tả" fullWidth multiline rows={2} value={form.description} onChange={(e) => set({ description: e.target.value })} placeholder="Ghi chú / hướng dẫn cho đối tượng" />
        <Stack direction="row" spacing={2}>
          <TextField select label="Loại sự kiện" fullWidth value={form.eventType} onChange={(e) => set({ eventType: e.target.value })}>
            {EVENT_TYPES.map((e) => <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>)}
          </TextField>
          <TextField label="Địa điểm" fullWidth value={form.location} onChange={(e) => set({ location: e.target.value })} placeholder="VD: UBND phường" />
        </Stack>

        {sectionLabel('Đối tượng áp dụng')}
        <TextField select label="Áp dụng cho" fullWidth value={form.targetType} onChange={(e) => set({ targetType: e.target.value })} helperText="Hệ thống hiện hỗ trợ áp dụng theo nhóm hoặc 1 đối tượng">
          <MenuItem value="GROUP">Theo nhóm</MenuItem>
          <MenuItem value="INDIVIDUAL">Một đối tượng cụ thể</MenuItem>
        </TextField>
        {form.targetType === 'GROUP' && (
          <TextField select label="Nhóm đối tượng" fullWidth value={form.targetSubjectType} onChange={(e) => set({ targetSubjectType: e.target.value })}>
            <MenuItem value="DRUG_ADDICT">Người nghiện</MenuItem>
            <MenuItem value="POST_REHAB">Sau cai nghiện</MenuItem>
            <MenuItem value="COMMUNITY_SENTENCE">Thi hành án cộng đồng</MenuItem>
          </TextField>
        )}
        {form.targetType === 'INDIVIDUAL' && (
          <TextField select label="Chọn đối tượng *" fullWidth value={form.offenderId} onChange={(e) => set({ offenderId: e.target.value })}
            error={!form.offenderId} helperText={!form.offenderId ? 'Bắt buộc chọn đối tượng' : ''}>
            {offenders.map((o) => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}
            {offenders.length === 0 && <MenuItem disabled>Chưa tải được danh sách đối tượng</MenuItem>}
          </TextField>
        )}
        <TextField select label="Địa bàn áp dụng (tùy chọn)" fullWidth value={form.targetRegionId} onChange={(e) => set({ targetRegionId: e.target.value })}>
          <MenuItem value=""><em>Không giới hạn địa bàn</em></MenuItem>
          {regions.map((r) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
        </TextField>

        {sectionLabel('Lịch & thời gian')}
        <Stack direction="row" spacing={2}>
          <TextField select label="Lịch lặp" fullWidth value={form.recurrencePattern} onChange={(e) => set({ recurrencePattern: e.target.value })}>
            <MenuItem value="ONCE">Một lần</MenuItem>
            <MenuItem value="DAILY">Hằng ngày</MenuItem>
            <MenuItem value="WEEKLY">Hằng tuần</MenuItem>
            <MenuItem value="MONTHLY">Hằng tháng</MenuItem>
          </TextField>
          {isOnce ? (
            <TextField label="Thời điểm thực hiện" type="datetime-local" fullWidth value={form.scheduledAt} onChange={(e) => set({ scheduledAt: e.target.value })} InputLabelProps={{ shrink: true }} />
          ) : isCurfew ? (
            <TextField label="Hạn (giờ)" type="number" fullWidth value={form.dueInHours} onChange={(e) => set({ dueInHours: Number(e.target.value) })} />
          ) : (
            <TextField label="Giờ điểm danh" type="time" fullWidth value={form.scheduledTime} onChange={(e) => set({ scheduledTime: e.target.value })} InputLabelProps={{ shrink: true }} />
          )}
        </Stack>
        {!isOnce && form.recurrencePattern === 'WEEKLY' && (
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.75 }}>Ngày trong tuần</Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {WEEKDAYS.map((d) => {
                const on = form.recurrenceDays.includes(d.v);
                return (
                  <Chip key={d.v} label={d.label} clickable color={on ? 'primary' : 'default'} variant={on ? 'filled' : 'outlined'}
                    onClick={() => set({ recurrenceDays: on ? form.recurrenceDays.filter((x) => x !== d.v) : [...form.recurrenceDays, d.v] })}
                    sx={{ fontWeight: 700, borderRadius: '8px' }} />
                );
              })}
            </Stack>
          </Box>
        )}
        {isCurfew && (
          <Stack direction="row" spacing={2}>
            <TextField label="Bắt đầu giới nghiêm" type="time" fullWidth value={form.curfewStart} onChange={(e) => set({ curfewStart: e.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField label="Kết thúc" type="time" fullWidth value={form.curfewEnd} onChange={(e) => set({ curfewEnd: e.target.value })} InputLabelProps={{ shrink: true }} />
          </Stack>
        )}

        {sectionLabel('Xác minh & điểm')}
        <Stack direction="row" spacing={2}>
          <TextField select label="Hình thức xác minh" fullWidth value={form.verificationMethod} onChange={(e) => set({ verificationMethod: e.target.value })}>
            <MenuItem value="FACE_PHOTO">Ảnh khuôn mặt</MenuItem>
            <MenuItem value="GPS">Vị trí GPS</MenuItem>
            <MenuItem value="LAB_RESULT">Kết quả xét nghiệm</MenuItem>
            <MenuItem value="NONE">Không yêu cầu</MenuItem>
          </TextField>
          <TextField label="Hạn hoàn thành (giờ)" type="number" fullWidth value={form.dueInHours} onChange={(e) => set({ dueInHours: Number(e.target.value) })} />
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField label="Điểm thưởng" type="number" fullWidth value={form.meritPointsReward} onChange={(e) => set({ meritPointsReward: Number(e.target.value) })} />
          <TextField label="Ngưỡng leo thang (lần bỏ lỡ/7 ngày)" type="number" fullWidth value={form.escalationThreshold} onChange={(e) => set({ escalationThreshold: Number(e.target.value) })} />
        </Stack>
        <FormControlLabel
          control={<Switch checked={form.autoApprove} onChange={(e) => set({ autoApprove: e.target.checked })} />}
          label="Tự động duyệt khi đối tượng nộp đủ bằng chứng"
        />
      </Stack>
    </SideDrawer>
  );
}
