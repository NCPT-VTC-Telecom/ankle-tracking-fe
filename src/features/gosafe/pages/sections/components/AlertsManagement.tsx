import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box, Stack, Typography, Chip, Button, IconButton, Tooltip, TextField, MenuItem,
  Table, TableHead, TableBody, TableRow, TableCell, CircularProgress, Grid,
  useTheme, useMediaQuery
} from '@mui/material';
import { Danger, TickCircle, CloseCircle, Refresh, SearchNormal1, Setting2, Add, Notification, Clock } from 'iconsax-react';
import { alertsApi, alertTypesApi, extractList } from 'shared/api/gosafe.management.api';
import SideDrawer from '../../components/SideDrawer';
import GlassKpiCard from './GlassKpiCard';
import { useFeedback } from '../../components/FeedbackProvider';
import PaginationBar, { usePagination } from '../../components/PaginationBar';

interface Props {
  isDark: boolean;
  scopeRegionId?: string | null;
  refreshKey?: number;
}

interface AlertRow {
  id: string;
  title: string;
  offender: string;
  level: number | string;
  status: string;
  createdAt: string;
  raw: any;
}

const LEVELS = [
  { value: '', label: 'Tất cả mức' },
  { value: '1', label: 'P1 · Khẩn cấp' },
  { value: '2', label: 'P2 · Cảnh báo' },
  { value: '3', label: 'P3 · Thông tin' }
];
const STATUSES = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'PROCESSING', label: 'Đang xử lý' },
  { value: 'CLOSED', label: 'Đã đóng' }
];

/** level có thể là SỐ (1=cao nhất) hoặc CHUỖI (HIGH/MEDIUM/LOW). */
function levelMeta(level: number | string | null | undefined): { label: string; color: string; bg: string } {
  const n = typeof level === 'number' ? level : Number(level);
  let key: 'P1' | 'P2' | 'P3';
  if (Number.isFinite(n) && n >= 1) {
    key = n <= 1 ? 'P1' : n === 2 ? 'P2' : 'P3';
  } else {
    const l = String(level ?? '').toUpperCase();
    key = l.includes('HIGH') || l.includes('CRIT') || l.includes('P1') ? 'P1' : l.includes('MED') || l.includes('WARN') || l.includes('P2') ? 'P2' : 'P3';
  }
  if (key === 'P1') return { label: 'P1', color: '#dc2626', bg: 'rgba(220,38,38,0.1)' };
  if (key === 'P2') return { label: 'P2', color: '#ea580c', bg: 'rgba(234,88,12,0.1)' };
  return { label: 'P3', color: '#ca8a04', bg: 'rgba(202,138,4,0.12)' };
}
function statusMeta(status: unknown): { label: string; color: string } {
  const s = String(status ?? '').toUpperCase();
  if (s.includes('PEND') || s.includes('NEW') || s.includes('OPEN')) return { label: 'Chờ xử lý', color: '#dc2626' };
  if (s.includes('PROCESS') || s.includes('ACK')) return { label: 'Đang xử lý', color: '#ea580c' };
  if (s.includes('CLOSE') || s.includes('RESOLV') || s.includes('DONE')) return { label: 'Đã đóng', color: '#16a34a' };
  return { label: s ? String(status) : '—', color: '#64748b' };
}

export default function AlertsManagement({ isDark, scopeRegionId, refreshKey }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [rows, setRows] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [typesOpen, setTypesOpen] = useState(false);

  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
  const { confirm, notify } = useFeedback();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await alertsApi.list({ pageSize: 100, level: level || undefined, status: status || undefined, regionId: scopeRegionId || undefined });
      const items = extractList(res.data).map((a: any): AlertRow => ({
        id: String(a.id),
        title: a.alertType?.name ?? a.alertTypeName ?? a.alertTypeCode ?? a.title ?? a.type ?? 'Cảnh báo',
        offender: a.offender?.fullname ?? a.offenderName ?? a.offenderId ?? '—',
        level: a.level ?? a.alertType?.level ?? a.severity ?? '',
        status: a.status ?? 'PENDING',
        createdAt: a.createdDate ?? a.createdAt ?? a.created_at ?? '',
        raw: a
      }));
      setRows(items);
    } catch {
      setRows([]);
      setError('Chưa kết nối được API cảnh báo (cần đăng nhập tài khoản GoSafe thật).');
    } finally {
      setLoading(false);
    }
  }, [level, status, scopeRegionId]);

  useEffect(() => { load(); }, [load, refreshKey]);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => r.title.toLowerCase().includes(q) || r.offender.toLowerCase().includes(q));
  }, [rows, search]);

  const { page, setPage, total, totalPages, paged } = usePagination(filtered, 12);

  const kpis = useMemo(() => {
    const p1 = rows.filter((r) => levelMeta(r.level).label === 'P1').length;
    const processing = rows.filter((r) => statusMeta(r.status).label === 'Đang xử lý').length;
    const closed = rows.filter((r) => statusMeta(r.status).label === 'Đã đóng').length;
    return { total: rows.length, p1, processing, closed };
  }, [rows]);

  const handleAck = async (row: AlertRow) => {
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: 'PROCESSING' } : r)));
    try { await alertsApi.acknowledge({ alertId: row.id }); notify('Đã nhận xử lý cảnh báo', 'success'); }
    catch { notify('Thao tác thất bại', 'error'); }
  };
  const handleClose = async (row: AlertRow) => {
    const ok = await confirm({ title: 'Đóng cảnh báo', message: <>Đóng cảnh báo <b>{row.title}</b>?</>, confirmText: 'Đóng', tone: 'primary' });
    if (!ok) return;
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: 'CLOSED' } : r)));
    try { await alertsApi.close({ alertId: row.id }); notify('Đã đóng cảnh báo', 'success'); }
    catch { notify('Thao tác thất bại', 'error'); }
  };

  return (
    <Box>
      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {[
          { label: 'Tổng cảnh báo', value: kpis.total, color: '#1e6fd9', icon: <Notification size={22} variant="Bold" />, sub: 'Tất cả mức độ' },
          { label: 'P1 khẩn cấp', value: kpis.p1, color: '#dc2626', icon: <Danger size={22} variant="Bold" />, sub: kpis.p1 > 0 ? 'Cần xử lý ngay' : 'Không có', blink: true },
          { label: 'Đang xử lý', value: kpis.processing, color: '#ea580c', icon: <Clock size={22} variant="Bold" />, sub: 'Đang tiếp nhận' },
          { label: 'Đã đóng', value: kpis.closed, color: '#16a34a', icon: <TickCircle size={22} variant="Bold" />, sub: 'Đã hoàn tất' }
        ].map((k) => (
          <Grid item xs={6} md={3} key={k.label}>
            <GlassKpiCard isDark={isDark} label={k.label} value={k.value} color={k.color} icon={k.icon} sub={k.sub} blink={k.blink} />
          </Grid>
        ))}
      </Grid>

      {/* Toolbar */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2, flexWrap: 'wrap', gap: 1.25 }}>
        <TextField
          placeholder="Tìm theo đối tượng / loại cảnh báo..." value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchNormal1 size={18} style={{ marginRight: 8, color: '#94a3b8' }} /> }}
          sx={{ minWidth: 300, flexGrow: 1, maxWidth: 420 }}
        />
        <TextField select label="Mức độ" value={level} onChange={(e) => setLevel(e.target.value)} sx={{ minWidth: 170 }}>
          {LEVELS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
        <TextField select label="Trạng thái" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 180 }}>
          {STATUSES.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
        <Tooltip title="Tải lại">
          <IconButton onClick={load} sx={{ border: '1px solid', borderColor: cardBorder, borderRadius: '12px', width: 44, height: 44 }}><Refresh size={20} /></IconButton>
        </Tooltip>
        <Button
          variant="outlined" startIcon={<Setting2 size={18} />} onClick={() => setTypesOpen(true)}
          sx={{ borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem', py: 1, px: 2, ml: 'auto' }}
        >
          Loại cảnh báo
        </Button>
      </Stack>

      {/* Table / Mobile List */}
      <Box sx={{
        borderRadius: '16px',
        border: isMobile ? 'none' : '1px solid',
        borderColor: cardBorder,
        bgcolor: isMobile ? 'transparent' : cardBg,
        overflowX: isMobile ? 'visible' : 'auto'
      }}>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress size={24} /></Stack>
        ) : isMobile ? (
          <Stack spacing={1.75}>
            {paged.map((r) => {
              const lm = levelMeta(r.level);
              const sm = statusMeta(r.status);
              const closed = sm.label === 'Đã đóng';
              return (
                <Box
                  key={r.id}
                  sx={{
                    p: 2,
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: r.level === '1' || r.level === 1 || String(r.level).includes('P1') ? `${lm.color}35` : cardBorder,
                    bgcolor: r.level === '1' || r.level === 1 || String(r.level).includes('P1') 
                      ? (isDark ? `${lm.color}15` : `${lm.color}08`)
                      : cardBg,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5
                  }}
                >
                  {/* Top Line: Time & Severity Badge */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                      <Clock size={16} />
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                        {r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : '—'}
                      </Typography>
                    </Stack>
                    <Chip label={lm.label} size="small" sx={{ height: 22, fontWeight: 800, fontSize: '0.72rem', color: lm.color, bgcolor: lm.bg, borderRadius: '8px' }} />
                  </Stack>

                  {/* Mid Line: Title & Status */}
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                      <Danger size={22} color={lm.color} variant="Bold" style={{ flexShrink: 0 }} />
                      <Typography sx={{ fontWeight: 700, fontSize: '0.925rem', color: isDark ? '#ffffff' : '#0f172a' }}>
                        {r.title}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: sm.color, flexShrink: 0 }}>
                      {sm.label}
                    </Typography>
                  </Stack>

                  {/* Subject Details */}
                  <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)', p: 1.25, borderRadius: '10px' }}>
                    <Typography sx={{ fontSize: '0.82rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 500 }}>
                      Đối tượng đeo: <span style={{ color: isDark ? '#ffffff' : '#0f172a', fontWeight: 700 }}>{r.offender}</span>
                    </Typography>
                  </Box>

                  {/* Bottom Line: Actions */}
                  {!closed && (
                    <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 0.5 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleAck(r)}
                        startIcon={<TickCircle size={16} />}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          borderColor: '#ea580c',
                          color: '#ea580c',
                          '&:hover': { borderColor: '#d97706', bgcolor: 'rgba(234,88,12,0.05)' }
                        }}
                      >
                        Nhận xử lý
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleClose(r)}
                        startIcon={<CloseCircle size={16} />}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          bgcolor: '#16a34a',
                          boxShadow: 'none',
                          '&:hover': { bgcolor: '#15803d', boxShadow: 'none' }
                        }}
                      >
                        Đóng cảnh báo
                      </Button>
                    </Stack>
                  )}
                </Box>
              );
            })}
            {filtered.length === 0 && (
              <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                {error ?? 'Không có cảnh báo nào.'}
              </Typography>
            )}
          </Stack>
        ) : (
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: 0.4, borderColor: cardBorder, py: 2, px: 2.5 } }}>
                <TableCell>Thời gian</TableCell>
                <TableCell>Loại cảnh báo</TableCell>
                <TableCell>Đối tượng</TableCell>
                <TableCell>Mức</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((r) => {
                const lm = levelMeta(r.level);
                const sm = statusMeta(r.status);
                const closed = sm.label === 'Đã đóng';
                return (
                  <TableRow key={r.id} hover sx={{ '& td': { borderColor: cardBorder, fontSize: '0.95rem', py: 2, px: 2.5 } }}>
                    <TableCell sx={{ fontSize: '0.88rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : '—'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Danger size={20} color={lm.color} variant="Bold" /> {r.title}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{r.offender}</TableCell>
                    <TableCell><Chip label={lm.label} size="small" sx={{ height: 26, fontWeight: 700, fontSize: '0.78rem', color: lm.color, bgcolor: lm.bg, borderRadius: '12px' }} /></TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: sm.color }}>{sm.label}</Typography></TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.75} justifyContent="flex-end">
                        <Tooltip title="Nhận xử lý">
                          <span>
                            <IconButton disabled={closed} onClick={() => handleAck(r)} sx={{ color: '#ea580c', border: '1px solid', borderColor: cardBorder, borderRadius: '12px', width: 38, height: 38 }}>
                              <TickCircle size={18} />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Đóng cảnh báo">
                          <span>
                            <IconButton disabled={closed} onClick={() => handleClose(r)} sx={{ color: '#16a34a', border: '1px solid', borderColor: cardBorder, borderRadius: '12px', width: 38, height: 38 }}>
                              <CloseCircle size={18} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, fontSize: '0.9rem', color: isDark ? '#64748b' : '#94a3b8', borderColor: cardBorder }}>
                    {error ?? 'Không có cảnh báo nào.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Box>

      <PaginationBar page={page} totalPages={totalPages} total={total} shownCount={paged.length} onChange={setPage} label="cảnh báo" />

      <AlertTypesDialog open={typesOpen} onClose={() => setTypesOpen(false)} isDark={isDark} />
    </Box>
  );
}

// ── Alert types config dialog ──────────────────────────────────────────────────
function AlertTypesDialog({ open, onClose, isDark }: { open: boolean; onClose: () => void; isDark: boolean }) {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', level: 'MEDIUM', penaltyPoints: 0 });
  const { notify } = useFeedback();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    alertTypesApi.list({ pageSize: 100 })
      .then((res) => setTypes(extractList(res.data)))
      .catch(() => setTypes([]))
      .finally(() => setLoading(false));
  }, [open]);

  const handleAdd = async () => {
    if (!form.code || !form.name) return;
    const optimistic = { ...form, id: `tmp-${form.code}` };
    setTypes((prev) => [...prev, optimistic]);
    const payload = { ...form };
    setForm({ code: '', name: '', level: 'MEDIUM', penaltyPoints: 0 });
    try { await alertTypesApi.create({ ...payload, isActive: true }); notify('Đã thêm loại cảnh báo', 'success'); }
    catch { notify('Thêm loại cảnh báo thất bại', 'error'); }
  };

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      isDark={isDark}
      width={500}
      title="Loại cảnh báo"
      subtitle="Cấu hình mức độ & điểm phạt"
      footer={<Button onClick={onClose} variant="contained" sx={{ borderRadius: 2, fontWeight: 700 }}>Đóng</Button>}
    >
      <Box>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 3 }}><CircularProgress size={20} /></Stack>
        ) : (
          <Stack spacing={1} sx={{ mb: 2 }}>
            {types.map((t, i) => (
              <Stack key={t.id ?? i} direction="row" alignItems="center" spacing={1} sx={{ p: 1, borderRadius: 1.5, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }}>
                <Chip label={levelMeta(t.level).label} size="small" sx={{ height: 20, fontWeight: 700, color: levelMeta(t.level).color, bgcolor: levelMeta(t.level).bg }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.82rem' }}>{t.name}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{t.code} · phạt {t.penaltyPoints ?? 0}đ</Typography>
                </Box>
              </Stack>
            ))}
            {types.length === 0 && <Typography variant="body2" color="text.secondary" align="center">Chưa có loại cảnh báo.</Typography>}
          </Stack>
        )}
        <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', mb: 1 }}>Thêm loại mới</Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <TextField size="small" label="Mã" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} sx={{ width: 110 }} />
          <TextField size="small" label="Tên" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} fullWidth />
        </Stack>
        <Stack direction="row" spacing={1}>
          <TextField size="small" select label="Mức" value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))} sx={{ width: 130 }}>
            <MenuItem value="HIGH">P1</MenuItem>
            <MenuItem value="MEDIUM">P2</MenuItem>
            <MenuItem value="LOW">P3</MenuItem>
          </TextField>
          <TextField size="small" type="number" label="Điểm phạt" value={form.penaltyPoints} onChange={(e) => setForm((f) => ({ ...f, penaltyPoints: Number(e.target.value) }))} sx={{ width: 120 }} />
          <Button variant="contained" startIcon={<Add size={16} />} onClick={handleAdd} sx={{ borderRadius: 2, fontWeight: 700 }}>Thêm</Button>
        </Stack>
      </Box>
    </SideDrawer>
  );
}
