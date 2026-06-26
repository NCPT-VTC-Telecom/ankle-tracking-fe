import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box, Stack, Typography, Chip, IconButton, Tooltip, TextField, MenuItem,
  Table, TableHead, TableBody, TableRow, TableCell, CircularProgress, Dialog,
  DialogContent, Divider, FormControl, InputLabel, Select, SelectChangeEvent
} from '@mui/material';
import { SearchNormal1, Refresh, Eye, CloseCircle, Activity } from 'iconsax-react';
import { logSystemApi, extractList, extractTotal } from 'shared/api/gosafe.management.api';
import PaginationBar, { useServerPagination } from '../../components/PaginationBar';

interface Props {
  isDark: boolean;
  refreshKey?: number;
}

interface LogRow {
  id: string;
  actionType: string;
  entityName: string;
  entityId: string;
  userName: string;
  ip: string;
  createdDate: string;
  requestContent: string;
  responseContent: string;
  oldValues: any;
  newValues: any;
}

// Phân loại action → nhóm + màu (để dễ nhận diện/lọc).
function classifyAction(raw: string): { label: string; color: string } {
  const a = (raw || '').toLowerCase();
  if (/delete|remove/.test(a)) return { label: 'Xoá', color: '#ef4444' };
  if (/create|register|^add|_add|add_/.test(a)) return { label: 'Tạo mới', color: '#16a34a' };
  if (/update|edit|data_|set_|change/.test(a)) return { label: 'Cập nhật', color: '#2563eb' };
  if (/login|logout|auth/.test(a)) return { label: 'Đăng nhập', color: '#64748b' };
  if (/grant|permission|role|reset_password/.test(a)) return { label: 'Phân quyền', color: '#8b5cf6' };
  if (/assign|device/.test(a)) return { label: 'Thiết bị', color: '#06b6d4' };
  if (/alert/.test(a)) return { label: 'Cảnh báo', color: '#f59e0b' };
  if (/notif|send_/.test(a)) return { label: 'Thông báo', color: '#6366f1' };
  return { label: 'Khác', color: '#94a3b8' };
}

const pretty = (v: any): string => {
  if (v == null) return '—';
  if (typeof v === 'string') {
    try { return JSON.stringify(JSON.parse(v), null, 2); } catch { return v; }
  }
  try { return JSON.stringify(v, null, 2); } catch { return String(v); }
};

const mapLogRow = (r: any): LogRow => ({
  id: String(r.id ?? Math.random()),
  actionType: r.actionType ?? r.action ?? r.category ?? '—',
  entityName: r.entityName ?? r.entity ?? r.resource ?? '',
  entityId: r.entityId ?? r.entity_id ?? '',
  userName: r.user?.fullname ?? r.user?.username ?? r.userName ?? r.userId ?? '—',
  ip: r.ipAddress ?? r.ip ?? '',
  createdDate: r.createdDate ?? r.created_at ?? r.timestamp ?? '',
  requestContent: r.requestContent ?? r.request ?? '',
  responseContent: r.responseContent ?? r.response ?? '',
  oldValues: r.oldValues ?? r.old_values ?? null,
  newValues: r.newValues ?? r.new_values ?? null
});

export default function AuditLogManagement({ isDark, refreshKey }: Props) {
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [entity, setEntity] = useState('all');
  const [detail, setDetail] = useState<LogRow | null>(null);

  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
  const panelBg = isDark ? 'rgba(9,13,31,0.5)' : 'rgba(255,255,255,0.7)';

  // Debounce ô tìm kiếm để không bắn request mỗi lần gõ.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Server-side: chỉ tải đúng 1 trang theo bộ lọc (không load hết rồi cắt).
  const fetcher = useCallback(async (page: number, pageSize: number) => {
    setError(null);
    try {
      const res = await logSystemApi.list({
        page,
        pageSize,
        filters: debouncedSearch || undefined,
        category: category !== 'all' ? category : undefined
      });
      return { items: extractList(res.data).map(mapLogRow), total: extractTotal(res.data) };
    } catch {
      setError('Chưa tải được nhật ký hệ thống (cần đăng nhập tài khoản GoSafe thật).');
      return { items: [] as LogRow[], total: 0 };
    }
  }, [debouncedSearch, category]);

  const resetKey = `${debouncedSearch}|${category}|${refreshKey ?? 0}`;
  const { items: rows, page, setPage, total, totalPages, loading, reload } = useServerPagination<LogRow>(fetcher, 15, resetKey);

  const loadCategories = useCallback(async () => {
    try {
      const res = await logSystemApi.categories();
      const data = (res.data as any)?.data ?? res.data;
      setCategories(Array.isArray(data) ? data.map(String) : []);
    } catch { /* không chặn — vẫn lọc theo dữ liệu đã tải */ }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  // Lọc "đối tượng" tinh chỉnh trong phạm vi trang hiện tại (phụ trợ cho tìm kiếm server).
  const entities = useMemo(
    () => Array.from(new Set(rows.map((r) => r.entityName).filter(Boolean))).sort(),
    [rows]
  );

  const paged = useMemo(
    () => (entity === 'all' ? rows : rows.filter((r) => r.entityName === entity)),
    [rows, entity]
  );

  return (
    <Stack spacing={2.25}>
      {/* Toolbar */}
      <Box sx={{ borderRadius: '14px', border: `1px solid ${cardBorder}`, background: panelBg, px: 2, py: 1.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" gap={1.5}>
          <TextField
            size="small"
            placeholder="Tìm theo người dùng, hành động, IP…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <SearchNormal1 size={16} style={{ marginRight: 6, color: '#94a3b8' }} />, sx: { borderRadius: '12px' } }}
            sx={{ width: 300 }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Hành động</InputLabel>
            <Select value={category} label="Hành động" onChange={(e: SelectChangeEvent) => setCategory(e.target.value)}>
              <MenuItem value="all">Tất cả hành động</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c} value={c}>
                  <Box sx={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', bgcolor: classifyAction(c).color, mr: 1 }} />
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Đối tượng</InputLabel>
            <Select value={entity} label="Đối tượng" onChange={(e: SelectChangeEvent) => setEntity(e.target.value)}>
              <MenuItem value="all">Tất cả đối tượng</MenuItem>
              {entities.map((en) => <MenuItem key={en} value={en}>{en}</MenuItem>)}
            </Select>
          </FormControl>
          <Tooltip title="Tải lại">
            <IconButton onClick={reload} sx={{ border: '1px solid', borderColor: cardBorder, borderRadius: '12px', ml: 'auto' }}>
              <Refresh size={18} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Bảng nhật ký */}
      <Box sx={{ borderRadius: '16px', border: `1px solid ${cardBorder}`, background: panelBg, overflow: 'hidden' }}>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress size={24} /></Stack>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.74rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: 0.4, borderColor: cardBorder, py: 1.25, px: 2 } }}>
                <TableCell>Thời gian</TableCell>
                <TableCell>Người dùng</TableCell>
                <TableCell>Hành động</TableCell>
                <TableCell>Đối tượng</TableCell>
                <TableCell>IP</TableCell>
                <TableCell align="right" sx={{ width: 64 }}>Chi tiết</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((r) => {
                const cl = classifyAction(r.actionType);
                return (
                  <TableRow key={r.id} hover sx={{ '& td': { borderColor: cardBorder, fontSize: '0.85rem', py: 1.1, px: 2 } }}>
                    <TableCell sx={{ color: isDark ? '#94a3b8' : '#64748b', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {r.createdDate ? new Date(r.createdDate).toLocaleString('vi-VN') : '—'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{r.userName}</TableCell>
                    <TableCell>
                      <Tooltip title={cl.label}>
                        <Chip
                          label={r.actionType}
                          size="small"
                          sx={{ height: 23, fontWeight: 700, fontSize: '0.7rem', borderRadius: '7px', color: cl.color, bgcolor: `${cl.color}1f`, border: `1px solid ${cl.color}3a` }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography component="span" variant="caption" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>{r.entityName || '—'}</Typography>
                      {r.entityId && <Typography component="span" variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', ml: 0.75 }}>{r.entityId}</Typography>}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{r.ip || '—'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Xem chi tiết">
                        <IconButton size="small" onClick={() => setDetail(r)} sx={{ p: 0.5, border: '1px solid', borderColor: cardBorder, borderRadius: '9px', color: 'text.secondary' }}>
                          <Eye size={16} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5, color: isDark ? '#64748b' : '#94a3b8', borderColor: cardBorder }}>
                    {error ?? 'Không có nhật ký nào.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Box>

      <PaginationBar page={page} totalPages={totalPages} total={total} shownCount={paged.length} onChange={setPage} label="bản ghi" />

      {/* Dialog chi tiết */}
      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: '16px', bgcolor: isDark ? '#0d1224' : '#fff', border: `1px solid ${cardBorder}` } }}>
        {detail && (
          <>
            <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Activity size={20} color={classifyAction(detail.actionType).color} variant="Bold" />
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{detail.actionType} · {detail.entityName || '—'}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {detail.userName} · {detail.createdDate ? new Date(detail.createdDate).toLocaleString('vi-VN') : '—'} · {detail.ip}
                  </Typography>
                </Box>
              </Stack>
              <IconButton onClick={() => setDetail(null)} sx={{ color: 'text.secondary' }}><CloseCircle size={20} /></IconButton>
            </Box>
            <DialogContent sx={{ px: 3, py: 2.5 }}>
              <Stack spacing={2}>
                {([
                  ['Dữ liệu cũ', detail.oldValues],
                  ['Dữ liệu mới', detail.newValues],
                  ['Request', detail.requestContent],
                  ['Response', detail.responseContent]
                ] as [string, any][]).filter(([, v]) => v != null && v !== '').map(([label, v]) => (
                  <Box key={label}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
                    <Box component="pre" sx={{ mt: 0.5, p: 1.5, borderRadius: '10px', bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc', border: `1px solid ${cardBorder}`, fontSize: '0.75rem', overflowX: 'auto', maxHeight: 240, m: 0 }}>
                      {pretty(v)}
                    </Box>
                  </Box>
                ))}
                {!detail.oldValues && !detail.newValues && !detail.requestContent && !detail.responseContent && (
                  <Typography variant="body2" color="text.secondary">Không có dữ liệu chi tiết.</Typography>
                )}
                <Divider />
                <Typography variant="caption" color="text.secondary">ID: {detail.id}</Typography>
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Stack>
  );
}
