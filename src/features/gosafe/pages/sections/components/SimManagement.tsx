import { useEffect, useState, useCallback } from 'react';
import {
  Box, Stack, Typography, Button, IconButton, Tooltip, TextField, MenuItem, Chip, CircularProgress,
  Table, TableHead, TableBody, TableRow, TableCell
} from '@mui/material';
import { Add, Edit, Trash, Refresh, Simcard } from 'iconsax-react';
import { simsApi, providersApi, extractList } from 'shared/api/gosafe.management.api';
import SideDrawer from '../../components/SideDrawer';
import { useFeedback } from '../../components/FeedbackProvider';
import PaginationBar, { usePagination } from '../../components/PaginationBar';

interface Props {
  isDark: boolean;
  isSuperAdmin?: boolean;
  refreshKey?: number;
}

interface SimRow {
  id: string;
  phoneNumber: string;
  iccid: string;
  providerId: string;
  providerName: string;
  status: string;
}

// status BE lưu chuỗi tiếng Việt ("Hoạt động"). Các trạng thái thường gặp:
const STATUS_OPTIONS = ['Hoạt động', 'Tạm ngưng', 'Đã khóa'];

const statusColor = (s: string) => {
  if (s === 'Hoạt động') return '#16a34a';
  if (s === 'Tạm ngưng') return '#ea580c';
  if (s === 'Đã khóa') return '#ef4444';
  return '#64748b';
};

const SimManagement = ({ isDark, isSuperAdmin = false, refreshKey }: Props) => {
  const [rows, setRows] = useState<SimRow[]>([]);
  const { page, setPage, total, totalPages, paged } = usePagination(rows, 12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ mode: 'add' | 'edit'; row?: SimRow } | null>(null);

  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#fff';
  const { confirm, notify } = useFeedback();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await simsApi.list({ pageSize: 200 });
      setRows(
        extractList(res.data).map((r: any): SimRow => ({
          id: String(r.id),
          phoneNumber: r.phoneNumber ?? '—',
          iccid: r.iccid ?? '',
          providerId: r.providerId != null ? String(r.providerId) : '',
          providerName: r.provider?.name ?? '',
          status: r.status ?? ''
        }))
      );
    } catch {
      setRows([]);
      setError('Chưa kết nối được API SIM (cần đăng nhập tài khoản GoSafe thật).');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const removeRow = async (row: SimRow) => {
    const ok = await confirm({
      title: 'Xóa SIM',
      message: <>Xóa SIM <b>{row.phoneNumber}</b>? Sẽ bị chặn nếu đang gắn trong thiết bị.</>,
      confirmText: 'Xóa',
      tone: 'danger'
    });
    if (!ok) return;
    try {
      await simsApi.delete(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      notify('Đã xóa SIM', 'success');
    } catch {
      notify('Xóa thất bại — SIM có thể đang gắn trong thiết bị', 'error');
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: isDark ? '#f8fafc' : '#0f172a' }}>Quản lý SIM</Typography>
        <Tooltip title="Tải lại">
          <IconButton onClick={load} sx={{ border: '1px solid', borderColor: cardBorder, borderRadius: '12px', width: 44, height: 44 }}><Refresh size={20} /></IconButton>
        </Tooltip>
        {isSuperAdmin ? (
          <Button variant="contained" startIcon={<Add size={18} />} onClick={() => setDialog({ mode: 'add' })} sx={{ borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', py: 1.2, px: 2.5, ml: 'auto' }}>Thêm SIM</Button>
        ) : (
          <Chip label="Chỉ super admin được chỉnh sửa" sx={{ ml: 'auto', fontWeight: 600, fontSize: '0.82rem', height: 32, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', color: isDark ? '#94a3b8' : '#64748b', borderRadius: '12px' }} />
        )}
      </Stack>

      <Box sx={{ borderRadius: '16px', border: '1px solid', borderColor: cardBorder, bgcolor: cardBg, overflowX: 'auto' }}>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress size={24} /></Stack>
        ) : (
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: 0.4, borderColor: cardBorder, py: 2, px: 2.5 } }}>
                <TableCell>Số thuê bao</TableCell>
                <TableCell>ICCID</TableCell>
                <TableCell>Nhà mạng</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((r) => (
                <TableRow key={r.id} hover sx={{ '& td': { borderColor: cardBorder, fontSize: '0.95rem', py: 2, px: 2.5 } }}>
                  <TableCell sx={{ fontWeight: 600 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Simcard size={18} variant="Bold" color="#1e6fd9" /> {r.phoneNumber}
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{r.iccid || '—'}</TableCell>
                  <TableCell>{r.providerName || '—'}</TableCell>
                  <TableCell>
                    <Chip label={r.status || '—'} size="small" sx={{ height: 26, fontWeight: 700, fontSize: '0.78rem', borderRadius: '12px', color: statusColor(r.status), bgcolor: `${statusColor(r.status)}1f`, border: `1px solid ${statusColor(r.status)}3a` }} />
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
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 5, color: isDark ? '#64748b' : '#94a3b8', borderColor: cardBorder }}>{error ?? 'Chưa có SIM nào.'}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Box>

      <PaginationBar page={page} totalPages={totalPages} total={total} shownCount={paged.length} onChange={setPage} label="SIM" />

      {dialog && <SimDialog isDark={isDark} mode={dialog.mode} row={dialog.row} onClose={() => setDialog(null)} onSaved={load} />}
    </Box>
  );
};

const SimDialog = ({ isDark, mode, row, onClose, onSaved }: { isDark: boolean; mode: 'add' | 'edit'; row?: SimRow; onClose: () => void; onSaved: () => void }) => {
  const [form, setForm] = useState({
    phoneNumber: row?.phoneNumber ?? '',
    iccid: row?.iccid ?? '',
    providerId: row?.providerId ?? '',
    status: row?.status || 'Hoạt động'
  });
  const set = (p: Partial<typeof form>) => setForm((f) => ({ ...f, ...p }));
  const { notify } = useFeedback();
  const [saving, setSaving] = useState(false);

  // Nạp danh sách nhà cung cấp cho dropdown.
  const [providers, setProviders] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    providersApi
      .list({ pageSize: 200 })
      .then((res) => setProviders(extractList(res.data).map((p: any) => ({ id: String(p.id), name: p.name ?? p.id }))))
      .catch(() => {});
  }, []);

  const invalid = !form.phoneNumber.trim() || !form.iccid.trim() || !form.providerId;

  const save = async () => {
    if (invalid) return;
    const body = {
      phoneNumber: form.phoneNumber.trim(),
      iccid: form.iccid.trim(),
      providerId: Number(form.providerId),
      status: form.status
    };
    setSaving(true);
    try {
      if (mode === 'edit' && row) await simsApi.update(row.id, body);
      else await simsApi.create(body);
      notify(mode === 'edit' ? 'Đã cập nhật SIM' : 'Đã thêm SIM', 'success');
      onClose();
      setTimeout(onSaved, 300);
    } catch {
      notify('Lưu SIM thất bại — kiểm tra lại thông tin', 'error');
      setSaving(false);
    }
  };

  return (
    <SideDrawer
      open
      onClose={onClose}
      isDark={isDark}
      width={480}
      title={mode === 'edit' ? 'Sửa SIM' : 'Thêm SIM'}
      subtitle="Số thuê bao · ICCID · nhà mạng"
      footer={
        <>
          <Button onClick={onClose} sx={{ borderRadius: 2, fontWeight: 600, color: 'text.secondary' }}>Hủy</Button>
          <Button variant="contained" onClick={save} disabled={invalid || saving} sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}>{saving ? 'Đang lưu…' : 'Lưu'}</Button>
        </>
      }
    >
      <Stack spacing={2.5}>
        <TextField label="Số thuê bao *" fullWidth value={form.phoneNumber} onChange={(e) => set({ phoneNumber: e.target.value })} placeholder="VD: 0900000001" error={!form.phoneNumber.trim()} helperText={!form.phoneNumber.trim() ? 'Bắt buộc nhập số thuê bao' : ''} />
        <TextField label="ICCID *" fullWidth value={form.iccid} onChange={(e) => set({ iccid: e.target.value })} placeholder="Số seri SIM" error={!form.iccid.trim()} helperText={!form.iccid.trim() ? 'Bắt buộc nhập ICCID' : ''} />
        <TextField select label="Nhà mạng *" fullWidth value={form.providerId} onChange={(e) => set({ providerId: e.target.value })} error={!form.providerId} helperText={!form.providerId ? 'Bắt buộc chọn nhà mạng' : ''}>
          {providers.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
          {providers.length === 0 && <MenuItem disabled>Chưa có nhà cung cấp — tạo trước ở mục Nhà cung cấp</MenuItem>}
        </TextField>
        <TextField select label="Trạng thái" fullWidth value={form.status} onChange={(e) => set({ status: e.target.value })}>
          {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>
      </Stack>
    </SideDrawer>
  );
};

export default SimManagement;
