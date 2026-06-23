import { useEffect, useState, useCallback } from 'react';
import {
  Box, Stack, Typography, Button, IconButton, Tooltip, TextField, Chip, CircularProgress, Avatar,
  Table, TableHead, TableBody, TableRow, TableCell, MenuItem, ListItemText,
  Checkbox, FormControlLabel, Divider, Select, OutlinedInput, InputLabel, FormControl
} from '@mui/material';
import {
  Add, Edit, Trash, Lock1, Unlock, Key, ShieldTick, Profile2User, SecuritySafe, Refresh, SearchNormal1
} from 'iconsax-react';
import { usersApi, rolesApi, permissionsApi, regionsApi, extractList } from 'api/gosafe.management.api';
import SideDrawer from '../../components/SideDrawer';
import { useFeedback } from '../../components/FeedbackProvider';

interface Props {
  isDark: boolean;
}

interface UserRow {
  id: string;
  fullname: string;
  username: string;
  email?: string;
  roleNames: string;
  status: string;
  raw: any;
}
interface RoleRow {
  id: string;
  name: string;
  description?: string;
  permCount: number;
  raw: any;
}

export default function UserManagement({ isDark }: Props) {
  const [tab, setTab] = useState<'users' | 'roles'>('users');
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';

  return (
    <Box>
      {/* Sub tabs */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {([
          { id: 'users' as const, label: 'Người dùng', icon: <Profile2User size={16} variant="Bold" /> },
          { id: 'roles' as const, label: 'Vai trò & quyền', icon: <SecuritySafe size={16} variant="Bold" /> }
        ]).map((t) => (
          <Button
            key={t.id} startIcon={t.icon} onClick={() => setTab(t.id)}
            variant={tab === t.id ? 'contained' : 'outlined'}
            sx={{ borderRadius: '10px', fontWeight: 700, borderColor: cardBorder }}
          >
            {t.label}
          </Button>
        ))}
      </Stack>
      {tab === 'users' ? <UsersTab isDark={isDark} /> : <RolesTab isDark={isDark} />}
    </Box>
  );
}

// ════════════════════════════ USERS TAB ════════════════════════════
function UsersTab({ isDark }: { isDark: boolean }) {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [formDialog, setFormDialog] = useState<{ mode: 'add' | 'edit'; row?: UserRow } | null>(null);
  const [assignDialog, setAssignDialog] = useState<{ kind: 'roles' | 'regions'; row: UserRow } | null>(null);
  const [resetRow, setResetRow] = useState<UserRow | null>(null);

  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#fff';
  const { confirm, notify } = useFeedback();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersApi.list({ pageSize: 100 });
      setRows(extractList(res.data).map((u: any): UserRow => ({
        id: String(u.id),
        fullname: u.fullname ?? u.fullName ?? u.name ?? '—',
        username: u.username ?? '—',
        email: u.email,
        roleNames: (u.roles ?? u.user_roles ?? []).map((r: any) => r.name ?? r.roleName ?? r).join(', ') || (u.roleName ?? '—'),
        status: u.status ?? (u.isActive === false ? 'INACTIVE' : 'ACTIVE'),
        raw: u
      })));
    } catch {
      setRows([]);
      setError('Chưa kết nối được API người dùng (cần đăng nhập tài khoản GoSafe thật).');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    rolesApi.list({ pageSize: 100 }).then((res) => setRoles(extractList(res.data).map((r: any) => ({ id: String(r.id), name: r.name, description: r.description, permCount: 0, raw: r })))).catch(() => {});
  }, [load]);

  const toggleLock = async (row: UserRow) => {
    const locking = row.status === 'ACTIVE';
    const ok = await confirm({
      title: locking ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
      message: <>{locking ? 'Khóa' : 'Mở khóa'} tài khoản <b>{row.fullname}</b> ({row.username})?</>,
      confirmText: locking ? 'Khóa' : 'Mở khóa',
      tone: locking ? 'danger' : 'primary'
    });
    if (!ok) return;
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: locking ? 'INACTIVE' : 'ACTIVE' } : r)));
    try {
      await (locking ? usersApi.lock(row.id) : usersApi.unlock(row.id));
      notify(locking ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản', 'success');
    } catch {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: locking ? 'ACTIVE' : 'INACTIVE' } : r)));
      notify('Thao tác thất bại', 'error');
    }
  };
  const removeRow = async (row: UserRow) => {
    const ok = await confirm({
      title: 'Xóa người dùng',
      message: <>Xóa tài khoản <b>{row.fullname}</b> ({row.username})? Hành động không thể hoàn tác.</>,
      confirmText: 'Xóa',
      tone: 'danger'
    });
    if (!ok) return;
    try {
      await usersApi.delete(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      notify('Đã xóa người dùng', 'success');
    } catch {
      notify('Xóa người dùng thất bại', 'error');
    }
  };

  const filtered = rows.filter((r) => !search || r.fullname.toLowerCase().includes(search.toLowerCase()) || r.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
        <TextField size="small" placeholder="Tìm tên / username..." value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchNormal1 size={16} style={{ marginRight: 6, color: '#94a3b8' }} /> }} sx={{ minWidth: 240 }} />
        <Tooltip title="Tải lại"><IconButton size="small" onClick={load} sx={{ border: '1px solid', borderColor: cardBorder, borderRadius: '10px' }}><Refresh size={16} /></IconButton></Tooltip>
        <Button variant="contained" startIcon={<Add size={18} />} onClick={() => setFormDialog({ mode: 'add' })} sx={{ borderRadius: '10px', fontWeight: 700, ml: 'auto' }}>Thêm người dùng</Button>
      </Stack>

      <Box sx={{ borderRadius: '12px', border: '1px solid', borderColor: cardBorder, bgcolor: cardBg, overflow: 'hidden' }}>
        {loading ? <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress size={24} /></Stack> : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', borderColor: cardBorder } }}>
                <TableCell>Họ tên</TableCell><TableCell>Tài khoản</TableCell><TableCell>Vai trò</TableCell><TableCell>Trạng thái</TableCell><TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} hover sx={{ '& td': { borderColor: cardBorder, fontSize: '0.8rem' } }}>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 30, height: 30, fontSize: '0.7rem', bgcolor: '#1e6fd9', fontWeight: 700 }}>{r.fullname.slice(0, 2).toUpperCase()}</Avatar>
                      <Box><Typography sx={{ fontWeight: 600, fontSize: '0.82rem' }}>{r.fullname}</Typography>{r.email && <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>{r.email}</Typography>}</Box>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.74rem' }}>{r.username}</TableCell>
                  <TableCell>{r.roleNames}</TableCell>
                  <TableCell><Chip label={r.status === 'ACTIVE' ? 'Hoạt động' : 'Khoá'} size="small" color={r.status === 'ACTIVE' ? 'success' : 'default'} sx={{ height: 20, fontWeight: 700, fontSize: '0.65rem' }} /></TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="Gán vai trò"><IconButton size="small" onClick={() => setAssignDialog({ kind: 'roles', row: r })} sx={iconBtn(cardBorder, '#1e6fd9')}><ShieldTick size={15} /></IconButton></Tooltip>
                      <Tooltip title="Gán địa bàn"><IconButton size="small" onClick={() => setAssignDialog({ kind: 'regions', row: r })} sx={iconBtn(cardBorder, '#0891b2')}><SecuritySafe size={15} /></IconButton></Tooltip>
                      <Tooltip title="Đặt lại mật khẩu"><IconButton size="small" onClick={() => setResetRow(r)} sx={iconBtn(cardBorder, '#ca8a04')}><Key size={15} /></IconButton></Tooltip>
                      <Tooltip title={r.status === 'ACTIVE' ? 'Khoá' : 'Mở khoá'}><IconButton size="small" onClick={() => toggleLock(r)} sx={iconBtn(cardBorder, r.status === 'ACTIVE' ? '#ea580c' : '#16a34a')}>{r.status === 'ACTIVE' ? <Lock1 size={15} /> : <Unlock size={15} />}</IconButton></Tooltip>
                      <Tooltip title="Sửa"><IconButton size="small" onClick={() => setFormDialog({ mode: 'edit', row: r })} sx={iconBtn(cardBorder, '#1e6fd9')}><Edit size={15} /></IconButton></Tooltip>
                      <Tooltip title="Xoá"><IconButton size="small" onClick={() => removeRow(r)} sx={iconBtn(cardBorder, '#ef4444')}><Trash size={15} /></IconButton></Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 5, color: isDark ? '#64748b' : '#94a3b8', borderColor: cardBorder }}>{error ?? 'Không có người dùng nào.'}</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </Box>

      {formDialog && <UserFormDialog isDark={isDark} mode={formDialog.mode} row={formDialog.row} onClose={() => setFormDialog(null)} onSaved={load} />}
      {assignDialog && <AssignDialog isDark={isDark} kind={assignDialog.kind} row={assignDialog.row} roles={roles} onClose={() => setAssignDialog(null)} />}
      {resetRow && <ResetPwDialog isDark={isDark} row={resetRow} onClose={() => setResetRow(null)} />}
    </Box>
  );
}

const iconBtn = (border: string, color: string) => ({ color, border: '1px solid', borderColor: border, borderRadius: '8px', p: 0.6 });

const GENDERS = [
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'OTHER', label: 'Khác' }
];

function UserFormDialog({ isDark, mode, row, onClose, onSaved }: { isDark: boolean; mode: 'add' | 'edit'; row?: UserRow; onClose: () => void; onSaved: () => void }) {
  const raw = row?.raw ?? {};
  const [form, setForm] = useState({
    // Tài khoản
    fullname: row?.fullname ?? '',
    username: row?.username ?? '',
    email: row?.email ?? '',
    password: '',
    // Cá nhân
    phoneNumber: raw.phoneNumber ?? raw.phone ?? '',
    citizenId: raw.citizenId ?? raw.cmnd ?? '',
    gender: raw.gender ?? '',
    // Cán bộ
    officerCode: raw.officerCode ?? '',
    rank: raw.rank ?? '',
    // Địa chỉ
    address: raw.address ?? '',
    province: raw.province ?? '',
    district: raw.district ?? '',
    ward: raw.ward ?? '',
    // Phân quyền & phạm vi
    roleIds: Array.isArray(raw.roles) ? raw.roles.map((r: any) => String(r?.id ?? r)) : [],
    regionIds: Array.isArray(raw.regions) ? raw.regions.map((r: any) => String(r?.id ?? r)) : []
  });
  const set = (p: Partial<typeof form>) => setForm((f) => ({ ...f, ...p }));

  const [roleOpts, setRoleOpts] = useState<{ id: string; name: string }[]>([]);
  const [regionOpts, setRegionOpts] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    rolesApi.list({ pageSize: 200 }).then((res) => setRoleOpts(extractList(res.data).map((r: any) => ({ id: String(r.id), name: r.name ?? r.code ?? r.id })))).catch(() => {});
    regionsApi.list({ pageSize: 300 }).then((res) => setRegionOpts(extractList(res.data).map((r: any) => ({ id: String(r.id), name: r.name ?? r.code ?? r.id })))).catch(() => {});
  }, []);

  const { notify } = useFeedback();
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!form.fullname || !form.username) return;
    // Chỉ gửi field có giá trị (khớp AddUserManagementDto)
    const body: any = { fullname: form.fullname, username: form.username };
    const opt: Record<string, any> = {
      email: form.email, phoneNumber: form.phoneNumber, citizenId: form.citizenId, gender: form.gender,
      officerCode: form.officerCode, rank: form.rank, address: form.address,
      province: form.province, district: form.district, ward: form.ward
    };
    Object.entries(opt).forEach(([k, v]) => { if (v) body[k] = v; });
    if (form.password) body.password = form.password;
    if (form.roleIds.length) body.roleIds = form.roleIds;
    if (form.regionIds.length) body.regionIds = form.regionIds;
    setSaving(true);
    try {
      if (mode === 'edit' && row) await usersApi.update(row.id, body);
      else await usersApi.create(body);
      notify(mode === 'edit' ? 'Đã cập nhật người dùng' : 'Đã thêm người dùng', 'success');
      onClose();
      setTimeout(onSaved, 300);
    } catch {
      notify('Lưu người dùng thất bại — kiểm tra lại thông tin', 'error');
      setSaving(false);
    }
  };

  const multiRender = (opts: { id: string; name: string }[]) => (selected: unknown) => {
    const ids = selected as string[];
    if (!ids.length) return <Typography sx={{ color: 'text.disabled', fontSize: '0.9rem' }}>Chưa chọn</Typography>;
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {ids.map((id) => <Chip key={id} size="small" label={opts.find((o) => o.id === id)?.name ?? id} sx={{ height: 22, fontWeight: 600, borderRadius: '6px' }} />)}
      </Box>
    );
  };

  const sectionLabel = (t: string) => (
    <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>{t}</Typography>
    </Divider>
  );

  return (
    <SideDrawer
      open
      onClose={onClose}
      isDark={isDark}
      width={540}
      title={mode === 'edit' ? 'Sửa người dùng' : 'Thêm người dùng'}
      subtitle="Thông tin tài khoản cán bộ"
      footer={
        <>
          <Button onClick={onClose} sx={{ borderRadius: 2, fontWeight: 600, color: 'text.secondary' }}>Hủy</Button>
          <Button variant="contained" onClick={save} disabled={!form.fullname || !form.username || saving} sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}>{saving ? 'Đang lưu…' : 'Lưu'}</Button>
        </>
      }
    >
      <Stack spacing={2.5}>
        {sectionLabel('Tài khoản')}
        <TextField label="Họ và tên *" fullWidth value={form.fullname} onChange={(e) => set({ fullname: e.target.value })} />
        <TextField label="Tên đăng nhập *" fullWidth value={form.username} onChange={(e) => set({ username: e.target.value })} disabled={mode === 'edit'} />
        <TextField label="Email" type="email" fullWidth value={form.email} onChange={(e) => set({ email: e.target.value })} />
        <TextField label={mode === 'edit' ? 'Mật khẩu mới (để trống nếu giữ)' : 'Mật khẩu *'} type="password" fullWidth value={form.password} onChange={(e) => set({ password: e.target.value })} />

        {sectionLabel('Thông tin cá nhân')}
        <Stack direction="row" spacing={2}>
          <TextField label="Số điện thoại" fullWidth value={form.phoneNumber} onChange={(e) => set({ phoneNumber: e.target.value })} />
          <TextField label="Số CCCD/CMND" fullWidth value={form.citizenId} onChange={(e) => set({ citizenId: e.target.value })} />
        </Stack>
        <TextField select label="Giới tính" fullWidth value={form.gender} onChange={(e) => set({ gender: e.target.value })}>
          <MenuItem value=""><em>Không xác định</em></MenuItem>
          {GENDERS.map((g) => <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>)}
        </TextField>

        {sectionLabel('Thông tin cán bộ')}
        <Stack direction="row" spacing={2}>
          <TextField label="Mã hiệu cán bộ" fullWidth value={form.officerCode} onChange={(e) => set({ officerCode: e.target.value })} />
          <TextField label="Cấp bậc" fullWidth value={form.rank} onChange={(e) => set({ rank: e.target.value })} placeholder="VD: Đại úy" />
        </Stack>

        {sectionLabel('Phân quyền & phạm vi')}
        <FormControl fullWidth>
          <InputLabel>Vai trò</InputLabel>
          <Select
            multiple value={form.roleIds} input={<OutlinedInput label="Vai trò" />}
            onChange={(e) => set({ roleIds: typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as string[]) })}
            renderValue={multiRender(roleOpts)}
          >
            {roleOpts.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                <Checkbox checked={form.roleIds.includes(o.id)} />
                <ListItemText primary={o.name} />
              </MenuItem>
            ))}
            {roleOpts.length === 0 && <MenuItem disabled>Chưa có vai trò</MenuItem>}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Địa bàn truy cập</InputLabel>
          <Select
            multiple value={form.regionIds} input={<OutlinedInput label="Địa bàn truy cập" />}
            onChange={(e) => set({ regionIds: typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as string[]) })}
            renderValue={multiRender(regionOpts)}
          >
            {regionOpts.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                <Checkbox checked={form.regionIds.includes(o.id)} />
                <ListItemText primary={o.name} />
              </MenuItem>
            ))}
            {regionOpts.length === 0 && <MenuItem disabled>Chưa có địa bàn</MenuItem>}
          </Select>
        </FormControl>

        {sectionLabel('Địa chỉ')}
        <TextField label="Địa chỉ" fullWidth value={form.address} onChange={(e) => set({ address: e.target.value })} />
        <Stack direction="row" spacing={2}>
          <TextField label="Tỉnh/Thành" fullWidth value={form.province} onChange={(e) => set({ province: e.target.value })} />
          <TextField label="Quận/Huyện" fullWidth value={form.district} onChange={(e) => set({ district: e.target.value })} />
          <TextField label="Phường/Xã" fullWidth value={form.ward} onChange={(e) => set({ ward: e.target.value })} />
        </Stack>
      </Stack>
    </SideDrawer>
  );
}

function ResetPwDialog({ isDark, row, onClose }: { isDark: boolean; row: UserRow; onClose: () => void }) {
  const [pw, setPw] = useState('');
  const { notify } = useFeedback();
  const save = async () => {
    if (!pw) return;
    try {
      await usersApi.resetPassword({ userId: row.id, newPassword: pw });
      notify('Đã đặt lại mật khẩu', 'success');
    } catch {
      notify('Đặt lại mật khẩu thất bại', 'error');
    }
    onClose();
  };
  return (
    <SideDrawer
      open
      onClose={onClose}
      isDark={isDark}
      width={400}
      title="Đặt lại mật khẩu"
      subtitle={row.fullname}
      footer={
        <>
          <Button onClick={onClose} sx={{ borderRadius: 2.5, fontWeight: 600, color: 'text.secondary' }}>Hủy</Button>
          <Button variant="contained" color="warning" onClick={save} disabled={!pw} sx={{ borderRadius: 2.5, fontWeight: 700, px: 3 }}>Đặt lại</Button>
        </>
      }
    >
      <TextField label="Mật khẩu mới *" type="password" fullWidth value={pw} onChange={(e) => setPw(e.target.value)} />
    </SideDrawer>
  );
}

function AssignDialog({ isDark, kind, row, roles, onClose }: { isDark: boolean; kind: 'roles' | 'regions'; row: UserRow; roles: RoleRow[]; onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (kind === 'regions') {
      import('api/gosafe.management.api').then(({ regionsApi, extractList }) => {
        regionsApi.list({ pageSize: 200 }).then((res) => setRegions(extractList(res.data).map((r: any) => ({ id: String(r.id), name: r.name ?? r.code ?? r.id })))).catch(() => {});
      });
    }
  }, [kind]);

  const items = kind === 'roles' ? roles.map((r) => ({ id: r.id, name: r.name })) : regions;
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const { notify } = useFeedback();
  const save = async () => {
    try {
      if (kind === 'roles') await usersApi.assignRoles({ userId: row.id, roleIds: selected });
      else await usersApi.assignRegions({ userId: row.id, regionIds: selected });
      notify(kind === 'roles' ? 'Đã gán vai trò' : 'Đã gán địa bàn', 'success');
    } catch {
      notify('Gán thất bại', 'error');
    }
    onClose();
  };
  return (
    <SideDrawer
      open
      onClose={onClose}
      isDark={isDark}
      width={420}
      title={kind === 'roles' ? 'Gán vai trò' : 'Gán địa bàn'}
      subtitle={row.fullname}
      footer={
        <>
          <Button onClick={onClose} sx={{ borderRadius: 2.5, fontWeight: 600, color: 'text.secondary' }}>Hủy</Button>
          <Button variant="contained" onClick={save} sx={{ borderRadius: 2.5, fontWeight: 700, px: 3 }}>Lưu</Button>
        </>
      }
    >
      <Stack>
        {items.map((it) => (
          <FormControlLabel key={it.id} control={<Checkbox checked={selected.includes(it.id)} onChange={() => toggle(it.id)} />} label={it.name} />
        ))}
        {items.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>Không có {kind === 'roles' ? 'vai trò' : 'địa bàn'} nào.</Typography>}
      </Stack>
    </SideDrawer>
  );
}

// ════════════════════════════ ROLES TAB ════════════════════════════
function RolesTab({ isDark }: { isDark: boolean }) {
  const [rows, setRows] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formDialog, setFormDialog] = useState<{ mode: 'add' | 'edit'; row?: RoleRow } | null>(null);
  const [permRow, setPermRow] = useState<RoleRow | null>(null);
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#fff';
  const { confirm, notify } = useFeedback();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await rolesApi.list({ pageSize: 100 });
      setRows(extractList(res.data).map((r: any): RoleRow => ({
        id: String(r.id), name: r.name ?? '—', description: r.description, permCount: r.permissionCount ?? (r.permissions ?? r.permissionIds ?? []).length, raw: r
      })));
    } catch {
      setRows([]);
      setError('Chưa kết nối được API vai trò (cần đăng nhập tài khoản GoSafe thật).');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const removeRow = async (row: RoleRow) => {
    const ok = await confirm({ title: 'Xóa vai trò', message: <>Xóa vai trò <b>{row.name}</b>? Người dùng đang gán vai trò này sẽ mất quyền tương ứng.</>, confirmText: 'Xóa', tone: 'danger' });
    if (!ok) return;
    try {
      await rolesApi.delete(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      notify('Đã xóa vai trò', 'success');
    } catch {
      notify('Xóa vai trò thất bại', 'error');
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" sx={{ mb: 1.5 }}>
        <Tooltip title="Tải lại"><IconButton size="small" onClick={load} sx={{ border: '1px solid', borderColor: cardBorder, borderRadius: '10px', mr: 1 }}><Refresh size={16} /></IconButton></Tooltip>
        <Button variant="contained" startIcon={<Add size={18} />} onClick={() => setFormDialog({ mode: 'add' })} sx={{ borderRadius: '10px', fontWeight: 700, ml: 'auto' }}>Thêm vai trò</Button>
      </Stack>
      <Box sx={{ borderRadius: '12px', border: '1px solid', borderColor: cardBorder, bgcolor: cardBg, overflow: 'hidden' }}>
        {loading ? <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress size={24} /></Stack> : (
          <Table size="small">
            <TableHead><TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', borderColor: cardBorder } }}>
              <TableCell>Vai trò</TableCell><TableCell>Mô tả</TableCell><TableCell>Số quyền</TableCell><TableCell align="right">Hành động</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} hover sx={{ '& td': { borderColor: cardBorder, fontSize: '0.8rem' } }}>
                  <TableCell sx={{ fontWeight: 700 }}><Stack direction="row" spacing={0.75} alignItems="center"><SecuritySafe size={16} color="#1e6fd9" variant="Bold" />{r.name}</Stack></TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{r.description || '—'}</TableCell>
                  <TableCell><Chip label={`${r.permCount} quyền`} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} /></TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="Phân quyền"><IconButton size="small" onClick={() => setPermRow(r)} sx={iconBtn(cardBorder, '#0891b2')}><ShieldTick size={15} /></IconButton></Tooltip>
                      <Tooltip title="Sửa"><IconButton size="small" onClick={() => setFormDialog({ mode: 'edit', row: r })} sx={iconBtn(cardBorder, '#1e6fd9')}><Edit size={15} /></IconButton></Tooltip>
                      <Tooltip title="Xoá"><IconButton size="small" onClick={() => removeRow(r)} sx={iconBtn(cardBorder, '#ef4444')}><Trash size={15} /></IconButton></Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', py: 5, color: isDark ? '#64748b' : '#94a3b8', borderColor: cardBorder }}>{error ?? 'Chưa có vai trò nào.'}</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </Box>
      {formDialog && <RoleFormDialog isDark={isDark} mode={formDialog.mode} row={formDialog.row} onClose={() => setFormDialog(null)} onSaved={load} />}
      {permRow && <PermMatrixDialog isDark={isDark} role={permRow} onClose={() => setPermRow(null)} />}
    </Box>
  );
}

function RoleFormDialog({ isDark, mode, row, onClose, onSaved }: { isDark: boolean; mode: 'add' | 'edit'; row?: RoleRow; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(row?.name ?? '');
  const [desc, setDesc] = useState(row?.description ?? '');
  const [saving, setSaving] = useState(false);
  const { notify } = useFeedback();
  const save = async () => {
    if (!name) return;
    setSaving(true);
    try {
      if (mode === 'edit' && row) await rolesApi.update(row.id, { name, description: desc });
      else await rolesApi.create({ name, description: desc });
      notify(mode === 'edit' ? 'Đã cập nhật vai trò' : 'Đã thêm vai trò', 'success');
      onClose(); setTimeout(onSaved, 300);
    } catch {
      notify('Lưu vai trò thất bại', 'error');
      setSaving(false);
    }
  };
  return (
    <SideDrawer
      open
      onClose={onClose}
      isDark={isDark}
      title={mode === 'edit' ? 'Sửa vai trò' : 'Thêm vai trò'}
      subtitle="Định nghĩa vai trò trong hệ thống"
      footer={
        <>
          <Button onClick={onClose} sx={{ borderRadius: 2.5, fontWeight: 600, color: 'text.secondary' }}>Hủy</Button>
          <Button variant="contained" onClick={save} disabled={!name || saving} sx={{ borderRadius: 2.5, fontWeight: 700, px: 3 }}>{saving ? 'Đang lưu…' : 'Lưu'}</Button>
        </>
      }
    >
      <Stack spacing={2.5}>
        <TextField label="Tên vai trò *" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="Mô tả" fullWidth multiline rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
      </Stack>
    </SideDrawer>
  );
}

function PermMatrixDialog({ isDark, role, onClose }: { isDark: boolean; role: RoleRow; onClose: () => void }) {
  const [grouped, setGrouped] = useState<Record<string, any[]>>({});
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    permissionsApi.list()
      .then((res) => {
        const g = (res.data as any)?.data?.grouped ?? (res.data as any)?.grouped ?? {};
        setGrouped(g);
        const rolePerms = (role.raw?.permissions ?? role.raw?.permissionIds ?? []).map((p: any) => p.id ?? p);
        setSelected(rolePerms);
      })
      .catch(() => setGrouped({}))
      .finally(() => setLoading(false));
  }, [role]);

  const toggle = (id: string | number) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const { notify } = useFeedback();
  const save = async () => {
    try {
      await rolesApi.setPermissions({ roleId: role.id, permissionIds: selected });
      notify('Đã cập nhật phân quyền', 'success');
    } catch {
      notify('Cập nhật phân quyền thất bại', 'error');
    }
    onClose();
  };

  return (
    <SideDrawer
      open
      onClose={onClose}
      isDark={isDark}
      width={520}
      title={`Phân quyền — ${role.name}`}
      subtitle="Chọn quyền theo nhóm tài nguyên"
      footer={
        <>
          <Button onClick={onClose} sx={{ borderRadius: 2.5, fontWeight: 600, color: 'text.secondary' }}>Hủy</Button>
          <Button variant="contained" onClick={save} sx={{ borderRadius: 2.5, fontWeight: 700, px: 3 }}>Lưu quyền</Button>
        </>
      }
    >
      <Box>
        {loading ? <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={20} /></Stack> : (
          Object.keys(grouped).length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 3 }} align="center">Chưa tải được danh sách quyền (cần API thật).</Typography>
          ) : (
            Object.entries(grouped).map(([resource, perms]) => (
              <Box key={resource} sx={{ mb: 1.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', color: '#1e6fd9', mb: 0.5 }}>{resource}</Typography>
                <Divider sx={{ mb: 0.5 }} />
                <Stack direction="row" sx={{ flexWrap: 'wrap' }}>
                  {(perms as any[]).map((p) => (
                    <FormControlLabel key={p.id ?? p.code} sx={{ width: '50%', m: 0 }}
                      control={<Checkbox size="small" checked={selected.includes(p.id ?? p.code)} onChange={() => toggle(p.id ?? p.code)} />}
                      label={<Typography sx={{ fontSize: '0.78rem' }}>{p.action ?? p.name ?? p.code}</Typography>} />
                  ))}
                </Stack>
              </Box>
            ))
          )
        )}
      </Box>
    </SideDrawer>
  );
}
