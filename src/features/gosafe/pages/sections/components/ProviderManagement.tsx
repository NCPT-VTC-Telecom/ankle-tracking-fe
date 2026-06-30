import { useEffect, useState, useCallback } from 'react';
import {
  Box, Stack, Typography, Button, IconButton, Tooltip, TextField, MenuItem, Chip, CircularProgress,
  Table, TableHead, TableBody, TableRow, TableCell
} from '@mui/material';
import { Add, Edit, Trash, Refresh, Buildings2 } from 'iconsax-react';
import { providersApi, extractList } from 'shared/api/gosafe.management.api';
import SideDrawer from '../../components/SideDrawer';
import { useFeedback } from '../../components/FeedbackProvider';
import PaginationBar, { usePagination } from '../../components/PaginationBar';

interface Props {
  isDark: boolean;
  isSuperAdmin?: boolean;
  refreshKey?: number;
}

interface ProviderRow {
  id: string;
  name: string;
  type: string;
  contactInfo: string;
  description: string;
}

// provider.type là chuỗi tự do (BE đang lưu "telecom") → map sang nhãn dễ đọc.
const typeLabel = (t: string) => {
  if (!t) return '—';
  if (t === 'telecom') return 'Nhà mạng / viễn thông';
  if (t === 'device') return 'Nhà cung cấp thiết bị';
  return t;
};

const ProviderManagement = ({ isDark, isSuperAdmin = false, refreshKey }: Props) => {
  const [rows, setRows] = useState<ProviderRow[]>([]);
  const { page, setPage, total, totalPages, paged } = usePagination(rows, 12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ mode: 'add' | 'edit'; row?: ProviderRow } | null>(null);

  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#fff';
  const { confirm, notify } = useFeedback();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await providersApi.list({ pageSize: 200 });
      setRows(
        extractList(res.data).map((r: any): ProviderRow => ({
          id: String(r.id),
          name: r.name ?? '—',
          type: r.type ?? '',
          contactInfo: r.contactInfo ?? r.contact ?? '',
          description: r.description ?? ''
        }))
      );
    } catch {
      setRows([]);
      setError('Chưa kết nối được API nhà cung cấp (cần đăng nhập tài khoản GoSafe thật).');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const removeRow = async (row: ProviderRow) => {
    const ok = await confirm({
      title: 'Xóa nhà cung cấp',
      message: <>Xóa <b>{row.name}</b>? Sẽ bị chặn nếu còn thiết bị/SIM tham chiếu.</>,
      confirmText: 'Xóa',
      tone: 'danger'
    });
    if (!ok) return;
    try {
      await providersApi.delete(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      notify('Đã xóa nhà cung cấp', 'success');
    } catch {
      notify('Xóa thất bại — có thể còn thiết bị/SIM đang dùng', 'error');
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: isDark ? '#f8fafc' : '#0f172a' }}>Nhà cung cấp / nhà mạng</Typography>
        <Tooltip title="Tải lại">
          <IconButton onClick={load} sx={{ border: '1px solid', borderColor: cardBorder, borderRadius: '12px', width: 44, height: 44 }}><Refresh size={20} /></IconButton>
        </Tooltip>
        {isSuperAdmin ? (
          <Button variant="contained" startIcon={<Add size={18} />} onClick={() => setDialog({ mode: 'add' })} sx={{ borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', py: 1.2, px: 2.5, ml: 'auto' }}>Thêm nhà cung cấp</Button>
        ) : (
          <Chip label="Chỉ super admin được chỉnh sửa" sx={{ ml: 'auto', fontWeight: 600, fontSize: '0.82rem', height: 32, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', color: isDark ? '#94a3b8' : '#64748b', borderRadius: '12px' }} />
        )}
      </Stack>

      <Box sx={{ borderRadius: '16px', border: '1px solid', borderColor: cardBorder, bgcolor: cardBg, overflow: 'hidden' }}>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress size={24} /></Stack>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: 0.4, borderColor: cardBorder, py: 2, px: 2.5 } }}>
                <TableCell>Tên</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Liên hệ</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((r) => (
                <TableRow key={r.id} hover sx={{ '& td': { borderColor: cardBorder, fontSize: '0.95rem', py: 2, px: 2.5 } }}>
                  <TableCell sx={{ fontWeight: 600 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Buildings2 size={18} variant="Bold" color="#1e6fd9" /> {r.name}
                    </Stack>
                  </TableCell>
                  <TableCell>{typeLabel(r.type)}</TableCell>
                  <TableCell sx={{ fontSize: '0.9rem' }}>{r.contactInfo || '—'}</TableCell>
                  <TableCell sx={{ fontSize: '0.88rem', color: 'text.secondary', maxWidth: 320 }}>{r.description || '—'}</TableCell>
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
                <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 5, color: isDark ? '#64748b' : '#94a3b8', borderColor: cardBorder }}>{error ?? 'Chưa có nhà cung cấp nào.'}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Box>

      <PaginationBar page={page} totalPages={totalPages} total={total} shownCount={paged.length} onChange={setPage} label="nhà cung cấp" />

      {dialog && <ProviderDialog isDark={isDark} mode={dialog.mode} row={dialog.row} onClose={() => setDialog(null)} onSaved={load} />}
    </Box>
  );
};

const ProviderDialog = ({ isDark, mode, row, onClose, onSaved }: { isDark: boolean; mode: 'add' | 'edit'; row?: ProviderRow; onClose: () => void; onSaved: () => void }) => {
  const [form, setForm] = useState({
    name: row?.name ?? '',
    type: row?.type || 'telecom',
    contactInfo: row?.contactInfo ?? '',
    description: row?.description ?? ''
  });
  const set = (p: Partial<typeof form>) => setForm((f) => ({ ...f, ...p }));
  const { notify } = useFeedback();
  const [saving, setSaving] = useState(false);

  const invalid = !form.name.trim();

  const save = async () => {
    if (invalid) return;
    const body = {
      name: form.name.trim(),
      type: form.type.trim() || 'telecom',
      contactInfo: form.contactInfo.trim() || undefined,
      description: form.description.trim() || undefined
    };
    setSaving(true);
    try {
      if (mode === 'edit' && row) await providersApi.update(row.id, body);
      else await providersApi.create(body);
      notify(mode === 'edit' ? 'Đã cập nhật nhà cung cấp' : 'Đã thêm nhà cung cấp', 'success');
      onClose();
      setTimeout(onSaved, 300);
    } catch {
      notify('Lưu thất bại — kiểm tra lại thông tin', 'error');
      setSaving(false);
    }
  };

  return (
    <SideDrawer
      open
      onClose={onClose}
      isDark={isDark}
      width={480}
      title={mode === 'edit' ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}
      subtitle="Nhà mạng / nhà cung cấp thiết bị"
      footer={
        <>
          <Button onClick={onClose} sx={{ borderRadius: 2, fontWeight: 600, color: 'text.secondary' }}>Hủy</Button>
          <Button variant="contained" onClick={save} disabled={invalid || saving} sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}>{saving ? 'Đang lưu…' : 'Lưu'}</Button>
        </>
      }
    >
      <Stack spacing={2.5}>
        <TextField label="Tên nhà cung cấp *" fullWidth value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="VD: Viettel" error={invalid} helperText={invalid ? 'Bắt buộc nhập tên' : ''} />
        <TextField select label="Loại" fullWidth value={form.type} onChange={(e) => set({ type: e.target.value })}>
          <MenuItem value="telecom">Nhà mạng / viễn thông</MenuItem>
          <MenuItem value="device">Nhà cung cấp thiết bị</MenuItem>
          <MenuItem value="other">Khác</MenuItem>
        </TextField>
        <TextField label="Thông tin liên hệ" fullWidth value={form.contactInfo} onChange={(e) => set({ contactInfo: e.target.value })} placeholder="Hotline / email / địa chỉ" />
        <TextField label="Mô tả" fullWidth multiline rows={3} value={form.description} onChange={(e) => set({ description: e.target.value })} />
      </Stack>
    </SideDrawer>
  );
};

export default ProviderManagement;
