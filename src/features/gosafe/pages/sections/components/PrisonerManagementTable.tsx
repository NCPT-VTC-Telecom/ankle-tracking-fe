import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Stack, TextField, Button, Avatar, Typography, Chip, Tooltip, IconButton, Grid,
  Box, Divider, ToggleButtonGroup, ToggleButton, Drawer, FormControl, InputLabel,
  Select, MenuItem, SelectChangeEvent, CircularProgress,
  OutlinedInput, Checkbox, ListItemText
} from '@mui/material';
import {
  SearchNormal1, Add, Eye, Edit, Trash, Map as MapIcon, Category, DocumentText,
  Gps, Clock, CloseCircle, Location, ShieldSecurity, Profile2User, Building4, Activity
} from 'iconsax-react';
import { TrackingStore } from '../../tracking/useTracking';
import { offendersApi, devicesApi, zonesApi, extractList, extractTotal } from 'shared/api/gosafe.management.api';
import { useFeedback } from '../../components/FeedbackProvider';
import PaginationBar, { useServerPagination } from '../../components/PaginationBar';
import {
  timeAgo, translateCrime, translateSentence, translateOffenderStatus, formatDateVN,
  validateSentence, SUBJECT_TYPE_OPTIONS, SENTENCE_TYPE_OPTIONS
} from '../../tracking/utils';
import type { Device } from '../../tracking/types';

interface PrisonerManagementTableProps {
  isDark: boolean;
  store: TrackingStore;
  setDashboardView: (view: 'overview' | 'tracking' | 'devices' | 'prisoners' | 'alerts' | 'users' | 'regions' | 'compliance') => void;
  refreshKey?: number;
}

// ── Form (khớp CreateOffenderDto) ───────────────────────────────────────────────
interface PrisonerForm {
  id: string | null;       // null = thêm mới; có giá trị = sửa
  fullName: string;
  idNumber: string;        // citizenId
  subjectType: string;     // enum
  sentenceType: string;    // enum
  startDate: string;       // yyyy-mm-dd
  releaseDate: string;     // yyyy-mm-dd
  address: string;
  imei: string;            // để gán thiết bị
  geofenceIds: string[];   // vùng giám sát gán cho phạm nhân
}

const EMPTY_FORM: PrisonerForm = {
  id: null, fullName: '', idNumber: '', subjectType: '', sentenceType: '',
  startDate: '', releaseDate: '', address: '', imei: '', geofenceIds: []
};

// ── Display row (offender + join device theo IMEI) ──────────────────────────────
interface PrisonerRow {
  id: string;
  profileCode: string;
  fullName: string;
  idNumber: string;
  subjectType: string;
  sentenceType: string;
  startDate: string;
  releaseDate: string;
  status: string;
  meritPoints: number | null;
  address: string;
  officerName: string;
  imei: string;
  device: Device | null;
  violation: boolean;
}

const toIso = (d: string) => (d ? new Date(d).toISOString() : undefined);
const toDateInput = (iso?: string | null) => (iso ? String(iso).slice(0, 10) : '');

const SectionHeader = ({ icon, title, accent, isDark }: { icon: React.ReactNode; title: string; accent: string; isDark: boolean }) => (
  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
    <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icon}
    </Box>
    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: isDark ? '#f1f5f9' : '#0f172a' }}>{title}</Typography>
  </Stack>
);

// ── Main component ─────────────────────────────────────────────────────────────

export default function PrisonerManagementTable({ isDark, store, setDashboardView, refreshKey }: PrisonerManagementTableProps) {
  const { devices, deviceViolations, setSelectedDeviceId, geofences } = store;
  const primaryColor = store.primaryColor;
  const { confirm, notify } = useFeedback();

  const [mgmtDevices, setMgmtDevices] = useState<any[]>([]); // device_management (imei→id, offenderId)
  const [prisonerSearch, setPrisonerSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<PrisonerForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<PrisonerRow | null>(null);
  const [detailOffenses, setDetailOffenses] = useState<any[] | null>(null);

  const glassBdr = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const glassBlur = 'blur(20px) saturate(1.8)';
  const setF = (patch: Partial<PrisonerForm>) => setForm((prev) => ({ ...prev, ...patch }));

  // Debounce ô tìm kiếm để tìm kiếm server không bắn request mỗi lần gõ.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(prisonerSearch.trim()), 350);
    return () => clearTimeout(t);
  }, [prisonerSearch]);

  // Server-side: chỉ tải đúng 1 trang phạm nhân theo tìm kiếm (không load hết 200 rồi cắt).
  const fetcher = useCallback(async (page: number, pageSize: number) => {
    try {
      const res = await offendersApi.list({ page, pageSize, filters: debouncedSearch || undefined });
      return { items: extractList(res.data), total: extractTotal(res.data) };
    } catch {
      notify('Không tải được danh sách phạm nhân từ máy chủ.', 'error');
      return { items: [] as any[], total: 0 };
    }
  }, [debouncedSearch, notify]);

  const pageSize = viewMode === 'cards' ? 9 : 12;
  const resetKey = `${debouncedSearch}|${viewMode}|${refreshKey ?? 0}`;
  const { items: offenders, page, setPage, total, totalPages, loading, reload } =
    useServerPagination<any>(fetcher, pageSize, resetKey);

  const loadMgmt = useCallback(async () => {
    try {
      const res = await devicesApi.list({ pageSize: 200 });
      setMgmtDevices(extractList(res.data));
    } catch { /* không chặn — chỉ ảnh hưởng gán thiết bị */ }
  }, []);

  useEffect(() => { loadMgmt(); }, [loadMgmt, refreshKey]);

  // offender → PrisonerRow, join live device theo IMEI (trên trang hiện tại).
  const paged = useMemo<PrisonerRow[]>(() => {
    const byImei = new Map(devices.filter((d) => d.uniqueId).map((d) => [d.uniqueId, d]));
    return offenders.map((o) => {
      const imei = String(o.device?.imei ?? o.device?.deviceImei ?? '').trim();
      const device = imei ? byImei.get(imei) ?? null : null;
      return {
        id: String(o.id),
        profileCode: o.profileCode ?? '',
        fullName: o.fullname ?? o.fullName ?? '—',
        idNumber: o.citizenId ?? '',
        subjectType: o.subjectType ?? '',
        sentenceType: o.sentenceType ?? '',
        startDate: o.sentenceStartDate ?? '',
        releaseDate: o.sentenceEndDate ?? '',
        status: o.status ?? '',
        meritPoints: o.meritPoints ?? null,
        address: o.address ?? '',
        officerName: o.officer?.fullname ?? o.officer?.fullName ?? '',
        imei,
        device,
        violation: device ? !!deviceViolations[device.id] : false
      };
    });
  }, [offenders, devices, deviceViolations]);

  // Thiết bị device_management chưa gán phạm nhân (offenderId null) — để gán mới.
  const freeMgmtDevices = useMemo(
    () => mgmtDevices.filter((d) => !d.offenderId && d.imei),
    [mgmtDevices]
  );

  const openAdd = () => { setForm(EMPTY_FORM); setDrawerOpen(true); };

  const openEdit = (row: PrisonerRow) => {
    setForm({
      id: row.id,
      fullName: row.fullName,
      idNumber: row.idNumber,
      subjectType: row.subjectType,
      sentenceType: row.sentenceType,
      startDate: toDateInput(row.startDate),
      releaseDate: toDateInput(row.releaseDate),
      address: row.address,
      imei: row.imei,
      geofenceIds: []
    });
    setDrawerOpen(true);
  };

  const openDetail = async (row: PrisonerRow) => {
    setDetail(row);
    setDetailOffenses(null);
    try {
      const res = await offendersApi.offenses(row.id);
      setDetailOffenses(extractList(res.data));
    } catch { setDetailOffenses([]); }
  };

  const handleSubmit = async () => {
    if (!form.fullName.trim()) { notify('Vui lòng nhập họ tên phạm nhân.', 'error'); return; }
    // Validate theo BLHS 2015 (Thông tư 65/2019).
    const err = validateSentence(form.sentenceType, form.startDate, form.releaseDate);
    if (err) { notify(err, 'error'); return; }

    setSaving(true);
    try {
      const body: any = {
        fullname: form.fullName.trim(),
        ...(form.idNumber ? { citizenId: form.idNumber } : {}),
        ...(SUBJECT_TYPE_OPTIONS.includes(form.subjectType) ? { subjectType: form.subjectType } : {}),
        ...(SENTENCE_TYPE_OPTIONS.includes(form.sentenceType) ? { sentenceType: form.sentenceType } : {}),
        ...(form.startDate ? { sentenceStartDate: toIso(form.startDate) } : {}),
        ...(form.releaseDate ? { sentenceEndDate: toIso(form.releaseDate) } : {}),
        ...(form.address ? { address: form.address } : {})
      };

      let offenderId = form.id;
      if (form.id) {
        await offendersApi.update(form.id, body);
      } else {
        const res = await offendersApi.create(body);
        offenderId = String((res.data as any)?.data?.id ?? (res.data as any)?.id ?? '');
      }

      // Gán thiết bị theo IMEI (resolve deviceId từ device_management).
      if (offenderId && form.imei) {
        const dev = mgmtDevices.find((d) => String(d.imei).trim() === form.imei.trim());
        if (dev?.id) {
          await offendersApi.assignDevice({ offenderId, deviceId: String(dev.id) }).catch(() => {});
        }
      }
      // Gán vùng giám sát (geofence) đã chọn.
      if (offenderId && form.geofenceIds.length) {
        await Promise.all(
          form.geofenceIds.map((zoneId) =>
            zonesApi.assign({ zoneId, offenderId: offenderId as string }).catch(() => {})
          )
        );
      }

      notify(form.id ? 'Đã cập nhật phạm nhân.' : 'Đã thêm phạm nhân.', 'success');
      setDrawerOpen(false);
      setForm(EMPTY_FORM);
      reload();
      loadMgmt();
      store.fetchLiveDevices?.();
    } catch {
      notify('Lưu phạm nhân thất bại trên máy chủ.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: PrisonerRow) => {
    const ok = await confirm({
      title: 'Xóa phạm nhân',
      message: <>Xóa hồ sơ <b>{row.fullName}</b>? Hành động không thể hoàn tác.</>,
      confirmText: 'Xóa', tone: 'danger'
    });
    if (!ok) return;
    try {
      await offendersApi.delete(row.id);
      reload();
      notify('Đã xóa phạm nhân.', 'success');
    } catch {
      notify('Xóa phạm nhân thất bại.', 'error');
    }
  };

  const locate = (row: PrisonerRow) => {
    if (!row.device) return;
    setDashboardView('tracking');
    setSelectedDeviceId(row.device.id);
  };

  const statusColorOf = (row: PrisonerRow) =>
    row.violation || row.status === 'VIOLATING' ? '#ef4444'
      : row.status === 'COMPLETED' ? '#3b82f6'
      : row.status === 'SUSPENDED' ? '#f59e0b'
      : '#22c55e';
  const statusLabelOf = (row: PrisonerRow) =>
    row.violation ? 'Vi phạm vùng' : translateOffenderStatus(row.status);

  return (
    <Stack spacing={3}>
      {/* ── Toolbar ── */}
      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            size="small"
            placeholder="Tìm phạm nhân, CCCD, mã hồ sơ..."
            value={prisonerSearch}
            onChange={(e) => setPrisonerSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchNormal1 size={16} style={{ marginRight: 6, color: '#94a3b8' }} />,
              sx: { fontSize: '0.9rem', borderRadius: '12px' }
            }}
            sx={{ width: 300 }}
          />
          <ToggleButtonGroup
            value={viewMode} exclusive onChange={(_, val) => val && setViewMode(val)} size="small"
            sx={{ height: 40, borderRadius: '12px', overflow: 'hidden', '& .MuiToggleButton-root': { border: '1px solid', borderColor: glassBdr, color: isDark ? '#94a3b8' : '#64748b', px: 1.5, '&.Mui-selected': { bgcolor: primaryColor, color: '#fff', borderColor: primaryColor } } }}
          >
            <ToggleButton value="cards"><Tooltip title="Dạng thẻ hồ sơ"><Category size={16} /></Tooltip></ToggleButton>
            <ToggleButton value="table"><Tooltip title="Dạng danh sách"><DocumentText size={16} /></Tooltip></ToggleButton>
          </ToggleButtonGroup>
          {loading && <CircularProgress size={18} />}
        </Stack>

        <Button
          variant="contained" startIcon={<Add size={20} />} onClick={openAdd}
          sx={{ fontWeight: 700, textTransform: 'none', fontSize: '0.9rem', borderRadius: '12px', py: 1.2, px: 2.5, background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`, boxShadow: `0 4px 16px ${primaryColor}40`, '&:hover': { boxShadow: `0 6px 24px ${primaryColor}50` } }}
        >
          Thêm phạm nhân
        </Button>
      </Stack>

      {/* ── Card view ── */}
      {viewMode === 'cards' && (
        <Grid container spacing={2.5}>
          {paged.map((row) => {
            const color = row.device?.color ?? primaryColor;
            const alertColor = statusColorOf(row);
            return (
              <Grid item xs={12} sm={6} lg={4} key={row.id}>
                <Box sx={{ borderRadius: '12px', border: `1px solid ${color}22`, background: isDark ? 'rgba(9,13,31,0.72)' : 'rgba(255,255,255,0.88)', backdropFilter: glassBlur, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s', '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 12px 36px ${color}28`, borderColor: color } }}>
                  <Box sx={{ px: 2.25, pt: 2.25, pb: 2, background: `linear-gradient(135deg, ${color}18 0%, transparent 70%)`, borderBottom: `1px solid ${color}18` }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                      <Chip label={row.profileCode || 'PN'} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, borderRadius: '6px', bgcolor: `${color}15`, color, border: `1px solid ${color}30` }} />
                      <Chip label={statusLabelOf(row)} size="small" className={row.violation ? 'gs-blink' : ''} sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, borderRadius: '6px', bgcolor: `${alertColor}12`, color: alertColor, border: `1px solid ${alertColor}30` }} />
                    </Stack>
                    <Stack direction="row" spacing={1.75} alignItems="center">
                      <Avatar sx={{ width: 44, height: 44, bgcolor: color, fontWeight: 700, fontSize: '1.05rem', flexShrink: 0 }}>
                        {row.fullName.split(' ').slice(-1)[0]?.charAt(0) ?? '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a', lineHeight: 1.3 }}>{row.fullName}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>CCCD: {row.idNumber || '—'}</Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Box sx={{ px: 2.25, py: 2 }}>
                    <Stack spacing={0.6} mb={1.75}>
                      {[
                        { label: 'Loại đối tượng', value: translateCrime(row.subjectType) },
                        { label: 'Hình phạt', value: translateSentence(row.sentenceType) },
                        { label: 'Thời hạn', value: row.startDate && row.releaseDate ? `${formatDateVN(row.startDate)} → ${formatDateVN(row.releaseDate)}` : formatDateVN(row.releaseDate) },
                        { label: 'Cán bộ phụ trách', value: row.officerName || '—' }
                      ].map(({ label, value }) => (
                        <Stack key={label} direction="row" justifyContent="space-between" spacing={1.5}>
                          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, fontSize: '0.7rem' }}>{label}:</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: isDark ? '#e2e8f0' : '#1e293b', textAlign: 'right', fontSize: '0.7rem' }}>{value || '—'}</Typography>
                        </Stack>
                      ))}
                    </Stack>

                    <Divider sx={{ borderColor: glassBdr, my: 1.5 }} />

                    {row.device ? (
                      <Grid container spacing={1.25} mb={1.75}>
                        {[
                          { icon: <Gps size="14" color={row.device.status.gpsFix ? '#22c55e' : '#f59e0b'} />, label: 'Định vị GPS', value: row.device.status.gpsFix ? `Đã định vị · ${row.device.status.satelliteCount} vệ tinh` : 'Chưa định vị', color: row.device.status.gpsFix ? '#22c55e' : '#f59e0b' },
                          { icon: <Activity size="14" color={row.device.status.battery < 20 ? '#ef4444' : '#10b981'} />, label: 'Pin thiết bị', value: `${row.device.status.battery}%`, color: row.device.status.battery < 20 ? '#ef4444' : '#10b981' },
                          { icon: <Clock size="14" color="#3b82f6" />, label: 'Đồng bộ', value: timeAgo(row.device.status.lastServerSync) }
                        ].map((s) => (
                          <Grid item xs={6} key={s.label}>
                            <Stack direction="row" spacing={0.75} alignItems="flex-start">
                              <Box sx={{ mt: 0.1, flexShrink: 0 }}>{s.icon}</Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.62rem', lineHeight: 1 }}>{s.label}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.77rem', color: (s as any).color || (isDark ? '#f8fafc' : '#0f172a') }}>{s.value}</Typography>
                              </Box>
                            </Stack>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mb: 1.5 }}>Chưa gắn thiết bị giám sát.</Typography>
                    )}

                    <Divider sx={{ borderColor: glassBdr, mb: 1.5 }} />

                    <Stack direction="row" spacing={0.75} justifyContent="flex-end">
                      <Tooltip title="Chỉnh sửa hồ sơ"><IconButton size="small" onClick={() => openEdit(row)} sx={{ border: `1px solid ${glassBdr}`, borderRadius: '8px', width: 30, height: 30 }}><Edit size={15} /></IconButton></Tooltip>
                      <Tooltip title="Xóa"><IconButton size="small" onClick={() => handleDelete(row)} sx={{ border: `1px solid ${glassBdr}`, borderRadius: '8px', width: 30, height: 30, color: '#ef4444' }}><Trash size={15} /></IconButton></Tooltip>
                      <Button size="small" variant="outlined" onClick={() => openDetail(row)} sx={{ fontSize: '0.73rem', fontWeight: 700, borderRadius: '8px', textTransform: 'none', py: 0.5, px: 1.25, borderColor: glassBdr }}>Hồ sơ</Button>
                      <Button size="small" variant="contained" disabled={!row.device} startIcon={<Location size={13} />} onClick={() => locate(row)} sx={{ fontSize: '0.73rem', fontWeight: 700, borderRadius: '8px', textTransform: 'none', py: 0.5, px: 1.25, background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}>Định vị</Button>
                    </Stack>
                  </Box>
                </Box>
              </Grid>
            );
          })}
          {!loading && paged.length === 0 && (
            <Grid item xs={12}><Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}><Typography variant="body2" sx={{ fontStyle: 'italic' }}>Không có phạm nhân nào.</Typography></Box></Grid>
          )}
        </Grid>
      )}

      {/* ── Table view ── */}
      {viewMode === 'table' && (
        <Box sx={{ borderRadius: '16px', border: `1px solid ${glassBdr}`, background: isDark ? 'rgba(9,13,31,0.5)' : 'rgba(255,255,255,0.7)', backdropFilter: glassBlur, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['', 'Họ tên phạm nhân', 'CCCD', 'Loại đối tượng', 'Hình phạt', 'Mãn hạn', 'Thiết bị', 'Cán bộ', 'Trạng thái', ''].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#64748b' : '#94a3b8', borderBottom: `1px solid ${glassBdr}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((row, idx) => {
                const color = row.device?.color ?? primaryColor;
                const alertColor = statusColorOf(row);
                const rowBg = idx % 2 === 0 ? (isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.008)') : 'transparent';
                return (
                  <tr key={row.id} style={{ background: rowBg }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = isDark ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.025)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = rowBg; }}>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${glassBdr}` }}>
                      <Avatar sx={{ bgcolor: color, width: 34, height: 34, fontSize: '0.82rem', fontWeight: 700 }}>{row.fullName.split(' ').slice(-1)[0]?.charAt(0) ?? '?'}</Avatar>
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${glassBdr}` }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.95rem', color: isDark ? '#f1f5f9' : '#0f172a', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } as any }} onClick={() => openDetail(row)}>{row.fullName}</Typography>
                      {row.profileCode && <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>{row.profileCode}</Typography>}
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${glassBdr}` }}><Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{row.idNumber || '—'}</Typography></td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${glassBdr}` }}><Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{translateCrime(row.subjectType)}</Typography></td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${glassBdr}` }}><Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{translateSentence(row.sentenceType)}</Typography></td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${glassBdr}` }}><Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>{formatDateVN(row.releaseDate)}</Typography></td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${glassBdr}` }}>
                      {row.device
                        ? <Chip label={row.device.name} size="small" sx={{ height: 24, fontSize: '0.75rem', borderRadius: '8px', bgcolor: `${color}12`, color, border: `1px solid ${color}25` }} />
                        : <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.78rem', fontStyle: 'italic' }}>Chưa gắn</Typography>}
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${glassBdr}` }}><Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.78rem' }}>{row.officerName || '—'}</Typography></td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${glassBdr}` }}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.75, py: 0.75, borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, bgcolor: `${alertColor}12`, color: alertColor, border: `1px solid ${alertColor}30` }}>
                        <Box className={row.violation ? 'gs-blink' : ''} sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: alertColor }} />
                        {statusLabelOf(row)}
                      </Box>
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${glassBdr}`, textAlign: 'right' }}>
                      <Stack direction="row" spacing={0.75} justifyContent="flex-end">
                        <Tooltip title="Hồ sơ chi tiết"><IconButton size="small" color="primary" onClick={() => openDetail(row)} sx={{ borderRadius: '12px' }}><Eye size={18} /></IconButton></Tooltip>
                        <Tooltip title="Chỉnh sửa"><IconButton size="small" onClick={() => openEdit(row)} sx={{ borderRadius: '12px' }}><Edit size={18} /></IconButton></Tooltip>
                        <Tooltip title="Định vị trên bản đồ"><span><IconButton size="small" color="success" disabled={!row.device} onClick={() => locate(row)} sx={{ borderRadius: '12px' }}><MapIcon size={18} /></IconButton></span></Tooltip>
                        <Tooltip title="Xóa"><IconButton size="small" sx={{ borderRadius: '12px', color: '#ef4444' }} onClick={() => handleDelete(row)}><Trash size={18} /></IconButton></Tooltip>
                      </Stack>
                    </td>
                  </tr>
                );
              })}
              {!loading && paged.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '48px 16px' }}><Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>Không có phạm nhân nào.</Typography></td></tr>
              )}
            </tbody>
          </table>
        </Box>
      )}

      <PaginationBar page={page} totalPages={totalPages} total={total} shownCount={paged.length} onChange={setPage} label="phạm nhân" />

      {/* ══ Add/Edit drawer ══ */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 520 }, bgcolor: isDark ? '#0d1224' : '#f8fafc', borderLeft: `1px solid ${glassBdr}`, boxShadow: '-8px 0 40px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' } }}>
        <Box sx={{ px: 3, py: 2.5, background: `linear-gradient(135deg, ${primaryColor}18, ${primaryColor}06)`, borderBottom: `1px solid ${glassBdr}`, flexShrink: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a', fontSize: '1rem' }}>{form.id ? 'Sửa hồ sơ phạm nhân' : 'Thêm phạm nhân mới'}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>Thông tin offender · Gán thiết bị · Gán vùng giám sát</Typography>
            </Box>
            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444' } }}><CloseCircle size={22} /></IconButton>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3 }}>
          <Stack spacing={3.5}>
            <Box>
              <SectionHeader icon={<Profile2User size={16} color={primaryColor} />} title="Thông tin phạm nhân" accent={primaryColor} isDark={isDark} />
              <Stack spacing={2}>
                <TextField label="Họ và tên *" size="small" fullWidth value={form.fullName} onChange={(e) => setF({ fullName: e.target.value })} placeholder="Vd: Nguyễn Văn A" />
                <TextField label="Số CCCD / CMND" size="small" fullWidth value={form.idNumber} onChange={(e) => setF({ idNumber: e.target.value })} placeholder="12 chữ số" inputProps={{ maxLength: 12, style: { letterSpacing: 2 } }} />
                <FormControl size="small" fullWidth>
                  <InputLabel>Loại đối tượng</InputLabel>
                  <Select value={form.subjectType} label="Loại đối tượng" onChange={(e: SelectChangeEvent) => setF({ subjectType: e.target.value })}>
                    <MenuItem value=""><em>— Chưa chọn —</em></MenuItem>
                    {SUBJECT_TYPE_OPTIONS.map((k) => <MenuItem key={k} value={k}>{translateCrime(k)}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
                  <InputLabel>Hình phạt / Loại án</InputLabel>
                  <Select value={form.sentenceType} label="Hình phạt / Loại án" onChange={(e: SelectChangeEvent) => setF({ sentenceType: e.target.value })}>
                    <MenuItem value=""><em>— Chưa chọn —</em></MenuItem>
                    {SENTENCE_TYPE_OPTIONS.map((k) => <MenuItem key={k} value={k}>{translateSentence(k)}</MenuItem>)}
                  </Select>
                </FormControl>
                <Stack direction="row" spacing={1.5}>
                  <TextField label="Ngày bắt đầu" size="small" fullWidth type="date" value={form.startDate} onChange={(e) => setF({ startDate: e.target.value })} InputLabelProps={{ shrink: true }} />
                  <TextField label="Ngày mãn hạn" size="small" fullWidth type="date" value={form.releaseDate} onChange={(e) => setF({ releaseDate: e.target.value })} InputLabelProps={{ shrink: true }} />
                </Stack>
                <TextField label="Địa chỉ cư trú" size="small" fullWidth value={form.address} onChange={(e) => setF({ address: e.target.value })} placeholder="Số nhà, đường, phường/xã, quận/huyện" />
              </Stack>
            </Box>

            <Divider sx={{ borderColor: glassBdr }} />

            <Box>
              <SectionHeader icon={<Gps size={16} color="#22c55e" />} title="Gán thiết bị giám sát" accent="#22c55e" isDark={isDark} />
              <Stack spacing={2}>
                <TextField label="Số IMEI thiết bị" size="small" fullWidth value={form.imei} onChange={(e) => setF({ imei: e.target.value })} placeholder="IMEI in trên thân thiết bị" inputProps={{ maxLength: 20, style: { letterSpacing: 1 } }} />
                {freeMgmtDevices.length > 0 && (
                  <FormControl size="small" fullWidth>
                    <InputLabel>Chọn thiết bị sẵn có (chưa gán)</InputLabel>
                    <Select value={form.imei} label="Chọn thiết bị sẵn có (chưa gán)" onChange={(e: SelectChangeEvent) => setF({ imei: e.target.value })}>
                      <MenuItem value=""><em>— Nhập IMEI thủ công —</em></MenuItem>
                      {freeMgmtDevices.map((d) => (
                        <MenuItem key={d.id} value={String(d.imei)}>
                          <Typography variant="caption" sx={{ fontWeight: 700, mr: 1 }}>{d.name ?? d.deviceCode ?? d.imei}</Typography>
                          <Typography variant="caption" color="text.secondary">{d.imei}</Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Stack>
            </Box>

            <Divider sx={{ borderColor: glassBdr }} />

            <Box>
              <SectionHeader icon={<Building4 size={16} color="#f59e0b" />} title="Gán vùng giám sát (geofence)" accent="#f59e0b" isDark={isDark} />
              <FormControl size="small" fullWidth>
                <InputLabel>Vùng giám sát</InputLabel>
                <Select
                  multiple
                  value={form.geofenceIds}
                  input={<OutlinedInput label="Vùng giám sát" />}
                  onChange={(e) => setF({ geofenceIds: typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as string[]) })}
                  renderValue={(sel) => geofences.filter((g) => (sel as string[]).includes(g.id)).map((g) => g.name).join(', ')}
                >
                  {geofences.map((g) => (
                    <MenuItem key={g.id} value={g.id}>
                      <Checkbox checked={form.geofenceIds.includes(g.id)} />
                      <ListItemText primary={g.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', mt: 0.75, display: 'block' }}>
                Vùng giám sát dùng cảnh báo ra/vào vùng (gọi zone_management/assign).
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${glassBdr}`, bgcolor: isDark ? 'rgba(9,13,31,0.8)' : 'rgba(248,250,252,0.95)', flexShrink: 0 }}>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button onClick={() => { setDrawerOpen(false); setForm(EMPTY_FORM); }} variant="outlined" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', borderColor: glassBdr, color: 'text.secondary', px: 2.5 }}>Hủy bỏ</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={!form.fullName.trim() || saving} startIcon={<ShieldSecurity size={16} />}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', px: 2.5, background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`, boxShadow: `0 4px 16px ${primaryColor}40`, '&:disabled': { opacity: 0.5 } }}>
              {saving ? 'Đang lưu…' : form.id ? 'Cập nhật' : 'Lưu hồ sơ phạm nhân'}
            </Button>
          </Stack>
        </Box>
      </Drawer>

      {/* ══ Detail drawer ══ */}
      <Drawer anchor="right" open={!!detail} onClose={() => setDetail(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 460 }, bgcolor: isDark ? '#0d1224' : '#f8fafc', borderLeft: `1px solid ${glassBdr}`, display: 'flex', flexDirection: 'column' } }}>
        {detail && (
          <>
            <Box sx={{ px: 3, py: 2.5, background: `linear-gradient(135deg, ${primaryColor}18, ${primaryColor}06)`, borderBottom: `1px solid ${glassBdr}`, flexShrink: 0 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ width: 48, height: 48, bgcolor: detail.device?.color ?? primaryColor, fontWeight: 700 }}>{detail.fullName.split(' ').slice(-1)[0]?.charAt(0) ?? '?'}</Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>{detail.fullName}</Typography>
                    <Typography variant="caption" color="text.secondary">{detail.profileCode} · CCCD {detail.idNumber || '—'}</Typography>
                  </Box>
                </Stack>
                <IconButton onClick={() => setDetail(null)} sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444' } }}><CloseCircle size={22} /></IconButton>
              </Stack>
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3 }}>
              <Stack spacing={1.25}>
                {[
                  ['Loại đối tượng', translateCrime(detail.subjectType)],
                  ['Hình phạt', translateSentence(detail.sentenceType)],
                  ['Ngày bắt đầu', formatDateVN(detail.startDate)],
                  ['Ngày mãn hạn', formatDateVN(detail.releaseDate)],
                  ['Trạng thái', translateOffenderStatus(detail.status)],
                  ['Điểm thi đua', detail.meritPoints != null ? String(detail.meritPoints) : '—'],
                  ['Địa chỉ', detail.address || '—'],
                  ['Cán bộ phụ trách', detail.officerName || '—'],
                  ['Thiết bị', detail.device ? `${detail.device.name} (${detail.imei})` : 'Chưa gắn']
                ].map(([label, value]) => (
                  <Stack key={label} direction="row" justifyContent="space-between" spacing={2}>
                    <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>{label}:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>{value}</Typography>
                  </Stack>
                ))}
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Bản án</Typography>
                {detailOffenses === null ? <CircularProgress size={18} />
                  : detailOffenses.length === 0 ? <Typography variant="caption" color="text.secondary">Chưa có bản án.</Typography>
                  : detailOffenses.map((of, i) => (
                    <Box key={i} sx={{ p: 1.25, borderRadius: '10px', border: `1px solid ${glassBdr}` }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{of.crime ?? of.offense ?? '—'}{of.isCurrent ? ' · (hiện hành)' : ''}</Typography>
                      <Typography variant="caption" color="text.secondary">{[of.sentenceType, of.sentenceTerm, of.courtName].filter(Boolean).join(' · ') || '—'}</Typography>
                    </Box>
                  ))}
              </Stack>
            </Box>
          </>
        )}
      </Drawer>
    </Stack>
  );
}
