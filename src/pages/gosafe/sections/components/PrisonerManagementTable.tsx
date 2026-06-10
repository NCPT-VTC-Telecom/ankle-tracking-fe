import { useState, useMemo } from 'react';
import {
  Stack, TextField, Button, Avatar, Typography, Chip, Tooltip, IconButton, Grid,
  Box, Divider, ToggleButtonGroup, ToggleButton, Drawer, FormControl, InputLabel,
  Select, MenuItem, SelectChangeEvent, Slider
} from '@mui/material';
import {
  SearchNormal1, Add, Eye, Edit, Map as MapIcon, Category, DocumentText,
  Activity, Gps, Heart, CloseCircle, Location, ShieldSecurity, Lock1,
  Profile2User, Building4
} from 'iconsax-react';
import { TrackingStore } from '../../tracking/useTracking';
import { getMockBiometrics } from '../../tracking/utils';

interface PrisonerManagementTableProps {
  isDark: boolean;
  store: TrackingStore;
  setDashboardView: (view: 'overview' | 'tracking' | 'devices' | 'prisoners' | 'sims') => void;
}

// ── Location data ──────────────────────────────────────────────────────────────

const PROVINCES = ['Thành phố Hồ Chí Minh', 'Thành phố Hà Nội', 'Thành phố Đà Nẵng', 'Thành phố Cần Thơ'];

const DISTRICTS: Record<string, string[]> = {
  'Thành phố Hồ Chí Minh': ['Quận 1', 'Quận 3', 'Quận Phú Nhuận', 'Quận Bình Thạnh', 'Quận Tân Bình', 'Quận Gò Vấp', 'Thành phố Thủ Đức'],
  'Thành phố Hà Nội': ['Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Cầu Giấy', 'Quận Thanh Xuân', 'Quận Đống Đa'],
  'Thành phố Đà Nẵng': ['Quận Hải Châu', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn', 'Quận Cẩm Lệ'],
  'Thành phố Cần Thơ': ['Quận Ninh Kiều', 'Quận Cái Răng', 'Quận Bình Thủy', 'Quận Ô Môn'],
};

const WARDS: Record<string, string[]> = {
  'Quận 1':          ['P. Bến Nghé', 'P. Bến Thành', 'P. Cầu Kho', 'P. Cô Giang', 'P. Đa Kao', 'P. Nguyễn Cư Trinh', 'P. Nguyễn Thái Bình', 'P. Phạm Ngũ Lão'],
  'Quận 3':          ['P. 1', 'P. 2', 'P. 3', 'P. 4', 'P. 5', 'P. 6', 'P. 7', 'P. 8', 'P. 9', 'P. 10'],
  'Quận Phú Nhuận':  ['P. 1', 'P. 2', 'P. 3', 'P. 4', 'P. 5', 'P. 7', 'P. 8', 'P. 9', 'P. 10', 'P. 11', 'P. 13', 'P. 14', 'P. 15'],
  'Quận Bình Thạnh': ['P. 1', 'P. 2', 'P. 6', 'P. 7', 'P. 11', 'P. 12', 'P. 13', 'P. 14', 'P. 17', 'P. 19', 'P. 21', 'P. 22', 'P. 25', 'P. 26', 'P. 27', 'P. 28'],
  'Quận Tân Bình':   ['P. 1', 'P. 2', 'P. 3', 'P. 4', 'P. 5', 'P. 6', 'P. 7', 'P. 8', 'P. 9', 'P. 10', 'P. 11', 'P. 12', 'P. 13', 'P. 14', 'P. 15'],
  'Quận Gò Vấp':     ['P. 1', 'P. 3', 'P. 5', 'P. 6', 'P. 7', 'P. 9', 'P. 10', 'P. 12', 'P. 13', 'P. 14', 'P. 15', 'P. 16', 'P. 17'],
  'Thành phố Thủ Đức':['P. An Phú', 'P. Bình Chiểu', 'P. Hiệp Bình Chánh', 'P. Hiệp Bình Phước', 'P. Linh Chiểu', 'P. Linh Đông', 'P. Linh Tây', 'P. Linh Trung', 'P. Linh Xuân', 'P. Long Bình', 'P. Phú Hữu', 'P. Phước Bình', 'P. Tăng Nhơn Phú A', 'P. Thảo Điền', 'P. Trường Thọ'],
  'Quận Ba Đình':    ['P. Cống Vị', 'P. Đội Cấn', 'P. Giảng Võ', 'P. Kim Mã', 'P. Liễu Giai', 'P. Ngọc Hà', 'P. Ngọc Khánh', 'P. Phúc Xá', 'P. Quán Thánh', 'P. Thành Công', 'P. Trúc Bạch'],
  'Quận Hoàn Kiếm':  ['P. Cửa Đông', 'P. Cửa Nam', 'P. Đồng Xuân', 'P. Hàng Bạc', 'P. Hàng Bài', 'P. Hàng Bồ', 'P. Hàng Buồm', 'P. Hàng Gai', 'P. Hàng Trống', 'P. Lý Thái Tổ', 'P. Phan Chu Trinh', 'P. Tràng Tiền', 'P. Trần Hưng Đạo'],
  'Quận Cầu Giấy':   ['P. Dịch Vọng', 'P. Dịch Vọng Hậu', 'P. Mai Dịch', 'P. Nghĩa Đô', 'P. Nghĩa Tân', 'P. Quan Hoa', 'P. Trung Hòa', 'P. Yên Hòa'],
  'Quận Thanh Xuân': ['P. Hạ Đình', 'P. Khương Đình', 'P. Khương Mai', 'P. Nhân Chính', 'P. Phương Liệt', 'P. Thanh Xuân Bắc', 'P. Thanh Xuân Nam', 'P. Thanh Xuân Trung'],
  'Quận Đống Đa':    ['P. Cát Linh', 'P. Hàng Bột', 'P. Khâm Thiên', 'P. Khương Thượng', 'P. Kim Liên', 'P. Láng Hạ', 'P. Láng Thượng', 'P. Nam Đồng', 'P. Ô Chợ Dừa', 'P. Phương Liên', 'P. Phương Mai', 'P. Quốc Tử Giám'],
  'Quận Hải Châu':   ['P. Bình Hiên', 'P. Bình Thuận', 'P. Hải Châu 1', 'P. Hải Châu 2', 'P. Hòa Cường Bắc', 'P. Hòa Cường Nam', 'P. Nam Dương', 'P. Phước Ninh', 'P. Thạch Thang', 'P. Thanh Bình', 'P. Thuận Phước'],
  'Quận Sơn Trà':    ['P. An Hải Bắc', 'P. An Hải Đông', 'P. An Hải Tây', 'P. Mân Thái', 'P. Nại Hiên Đông', 'P. Phước Mỹ', 'P. Thọ Quang'],
  'Quận Ngũ Hành Sơn':['P. Hòa Hải', 'P. Hòa Quý', 'P. Khuê Mỹ', 'P. Mỹ An'],
  'Quận Cẩm Lệ':     ['P. Hòa An', 'P. Hòa Phát', 'P. Hòa Thọ Đông', 'P. Hòa Thọ Tây', 'P. Hòa Xuân', 'P. Khuê Trung'],
  'Quận Ninh Kiều':  ['P. An Bình', 'P. An Cư', 'P. An Hòa', 'P. An Khánh', 'P. An Lạc', 'P. An Nghiệp', 'P. An Phú', 'P. Cái Khế', 'P. Hưng Lợi', 'P. Tân An', 'P. Thới Bình', 'P. Xuân Khánh'],
  'Quận Cái Răng':   ['P. Ba Láng', 'P. Hưng Phú', 'P. Hưng Thạnh', 'P. Lê Bình', 'P. Phú Thứ', 'P. Tân Phú', 'P. Thường Thạnh'],
  'Quận Bình Thủy':  ['P. An Thới', 'P. Bình Thủy', 'P. Long Hòa', 'P. Long Tuyền', 'P. Thới An Đông', 'P. Trà An', 'P. Trà Nóc'],
  'Quận Ô Môn':      ['P. Châu Văn Liêm', 'P. Long Hưng', 'P. Phước Thới', 'P. Thới An', 'P. Thới Hòa', 'P. Thới Long', 'P. Trường Lạc'],
};

// ── Zone encoding helpers ──────────────────────────────────────────────────────

interface ZoneData {
  province: string;
  district: string;
  wards: string[];
  level: 'strict' | 'monitoring';
  radius: number;
}

const encodeZones = (notes: string, zones: ZoneData): string => {
  const tag = `[zones:${JSON.stringify(zones)}]`;
  const base = notes.replace(/\[zones:.*?\]/s, '').trim();
  return base ? `${base}\n${tag}` : tag;
};

const parseZones = (notes?: string): ZoneData | null => {
  const match = notes?.match(/\[zones:(.*?)\]/s);
  if (!match) return null;
  try { return JSON.parse(match[1]) as ZoneData; } catch { return null; }
};

// ── Helpers ────────────────────────────────────────────────────────────────────

interface PrisonerForm {
  subjectFullName: string;
  subjectIdNumber: string;
  subjectCrime: string;
  subjectSentence: string;
  subjectStartDate: string;
  subjectReleaseDate: string;
  subjectNotes: string;
  imei: string;
  province: string;
  district: string;
  allowedWards: string[];
  monitoringLevel: 'strict' | 'monitoring';
  allowedRadius: number;
}

const EMPTY_FORM: PrisonerForm = {
  subjectFullName: '', subjectIdNumber: '', subjectCrime: '', subjectSentence: '',
  subjectStartDate: '', subjectReleaseDate: '', subjectNotes: '',
  imei: '', province: '', district: '',
  allowedWards: [], monitoringLevel: 'strict', allowedRadius: 5,
};

const SectionHeader = ({
  icon,
  title,
  accent,
  isDark,
}: {
  icon: React.ReactNode;
  title: string;
  accent: string;
  isDark: boolean;
}) => (
  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
    <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icon}
    </Box>
    <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.85rem', color: isDark ? '#f1f5f9' : '#0f172a' }}>
      {title}
    </Typography>
  </Stack>
);

// ── Main component ─────────────────────────────────────────────────────────────

export default function PrisonerManagementTable({ isDark, store, setDashboardView }: PrisonerManagementTableProps) {
  const { devices, deviceViolations, openEditDevice, setSubjectDetailId, setSelectedDeviceId } = store;

  const [prisonerSearch, setPrisonerSearch] = useState('');
  const [viewMode, setViewMode]             = useState<'cards' | 'table'>('cards');
  const [drawerOpen, setDrawerOpen]         = useState(false);
  const [form, setForm]                     = useState<PrisonerForm>(EMPTY_FORM);

  const glassBdr  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const glassBlur = 'blur(20px) saturate(1.8)';

  const setF = (patch: Partial<PrisonerForm>) => setForm((prev) => ({ ...prev, ...patch }));

  const filteredPrisonerTable = useMemo(() => {
    const list = devices.filter((d) => d.subject !== null);
    if (!prisonerSearch) return list;
    const q = prisonerSearch.toLowerCase();
    return list.filter(
      (d) =>
        d.subject!.fullName.toLowerCase().includes(q) ||
        d.subject!.idNumber.includes(q) ||
        d.subject!.crime.toLowerCase().includes(q) ||
        d.uniqueId.includes(q),
    );
  }, [devices, prisonerSearch]);

  // Devices without an assigned subject (available for assignment)
  const freeDevices = useMemo(() => devices.filter((d) => d.subject === null), [devices]);

  const handleSubmit = () => {
    if (!form.subjectFullName || !form.imei) return;
    const notesWithZones = (form.province && form.district && form.allowedWards.length > 0)
      ? encodeZones(form.subjectNotes, {
          province: form.province,
          district: form.district,
          wards: form.allowedWards,
          level: form.monitoringLevel,
          radius: form.allowedRadius,
        })
      : form.subjectNotes;

    store.setAddDeviceForm({
      name: `PN-${form.imei.slice(-6).toUpperCase()}`,
      type: 'Person',
      deviceType: 'VTC-G001',
      uniqueId: form.imei,
      phoneNumber: '',
      color: store.primaryColor,
      subjectFullName: form.subjectFullName,
      subjectIdNumber: form.subjectIdNumber,
      subjectCrime: form.subjectCrime,
      subjectSentence: form.subjectSentence,
      subjectStartDate: form.subjectStartDate,
      subjectReleaseDate: form.subjectReleaseDate,
      subjectNotes: notesWithZones,
    });

    setTimeout(() => {
      store.handleAddDevice();
      setDrawerOpen(false);
      setForm(EMPTY_FORM);
    }, 50);
  };

  const primaryColor = store.primaryColor;

  return (
    <Stack spacing={3}>
      {/* ── Toolbar ── */}
      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            size="small"
            placeholder="Tìm phạm nhân, CCCD..."
            value={prisonerSearch}
            onChange={(e) => setPrisonerSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchNormal1 size={16} style={{ marginRight: 6, color: '#94a3b8' }} />,
              sx: { fontSize: '0.825rem', borderRadius: '10px' },
            }}
            sx={{ width: 240 }}
          />
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, val) => val && setViewMode(val)}
            size="small"
            sx={{
              height: 36,
              '& .MuiToggleButton-root': {
                border: '1px solid', borderColor: glassBdr, color: isDark ? '#94a3b8' : '#64748b', px: 1.5,
                '&.Mui-selected': { bgcolor: primaryColor, color: '#fff', borderColor: primaryColor },
              },
            }}
          >
            <ToggleButton value="cards"><Tooltip title="Dạng thẻ hồ sơ"><Category size={16} /></Tooltip></ToggleButton>
            <ToggleButton value="table"><Tooltip title="Dạng danh sách"><DocumentText size={16} /></Tooltip></ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Button
          variant="contained"
          startIcon={<Add size={18} />}
          onClick={() => setDrawerOpen(true)}
          sx={{
            fontWeight: 700, textTransform: 'none', fontSize: '0.82rem', borderRadius: '10px', py: 0.9, px: 2.25,
            background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
            boxShadow: `0 4px 16px ${primaryColor}40`,
            '&:hover': { boxShadow: `0 6px 24px ${primaryColor}50` },
          }}
        >
          Thêm phạm nhân
        </Button>
      </Stack>

      {/* ── Card view ── */}
      {viewMode === 'cards' && (
        <Grid container spacing={2.5}>
          {filteredPrisonerTable.map((dev) => {
            const sub = dev.subject!;
            const isViolating = deviceViolations[dev.id];
            const bio = getMockBiometrics(dev.id);
            const zones = parseZones(sub.notes);
            const alertColor = bio.isTampered ? '#ef4444' : isViolating ? '#f59e0b' : '#22c55e';
            const alertLabel = bio.isTampered ? '⚠ THÁO XÍCH' : isViolating ? '⚠ VI PHẠM' : '✓ An toàn';

            return (
              <Grid item xs={12} sm={6} lg={4} key={dev.id}>
                <Box
                  sx={{
                    borderRadius: '16px',
                    border: `1px solid ${isDark ? `${dev.color}22` : `${dev.color}18`}`,
                    background: isDark ? 'rgba(9,13,31,0.72)' : 'rgba(255,255,255,0.88)',
                    backdropFilter: glassBlur,
                    WebkitBackdropFilter: glassBlur,
                    boxShadow: `0 4px 20px rgba(0,0,0,0.1)`,
                    overflow: 'hidden',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: `0 12px 36px ${dev.color}28, 0 4px 16px rgba(0,0,0,0.12)`,
                      borderColor: dev.color,
                    },
                  }}
                >
                  {/* Gradient top banner */}
                  <Box
                    sx={{
                      px: 2.25, pt: 2.25, pb: 2,
                      background: isDark
                        ? `linear-gradient(135deg, ${dev.color}22 0%, transparent 70%)`
                        : `linear-gradient(135deg, ${dev.color}12 0%, transparent 70%)`,
                      borderBottom: `1px solid ${dev.color}18`,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                      <Chip
                        label={dev.name}
                        size="small"
                        sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, borderRadius: '6px', bgcolor: `${dev.color}15`, color: dev.color, border: `1px solid ${dev.color}30` }}
                      />
                      <Chip
                        label={alertLabel}
                        size="small"
                        className={bio.isTampered || isViolating ? 'gs-blink' : ''}
                        sx={{
                          height: 20, fontSize: '0.68rem', fontWeight: 700, borderRadius: '6px',
                          bgcolor: `${alertColor}12`, color: alertColor, border: `1px solid ${alertColor}30`,
                        }}
                      />
                    </Stack>

                    <Stack direction="row" spacing={1.75} alignItems="center">
                      <Avatar sx={{ width: 44, height: 44, bgcolor: dev.color, fontWeight: 800, fontSize: '1.05rem', boxShadow: `0 0 16px ${dev.color}40`, border: `2px solid ${dev.color}50`, flexShrink: 0 }}>
                        {sub.fullName.split(' ').slice(-1)[0]?.charAt(0) ?? '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a', lineHeight: 1.3 }}>
                          {sub.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          CCCD: {sub.idNumber || '—'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Card body */}
                  <Box sx={{ px: 2.25, py: 2 }}>
                    {/* Crime & sentence */}
                    <Stack spacing={0.6} mb={1.75}>
                      {[
                        { label: 'Tội danh', value: sub.crime },
                        { label: 'Hình phạt', value: sub.sentence },
                        { label: 'Hạn tù', value: sub.startDate && sub.releaseDate ? `${sub.startDate} → ${sub.releaseDate}` : sub.releaseDate || '—' },
                      ].map(({ label, value }) => (
                        <Stack key={label} direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
                          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, fontSize: '0.7rem', pt: 0.1 }}>{label}:</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: isDark ? '#e2e8f0' : '#1e293b', textAlign: 'right', fontSize: '0.7rem' }}>{value || '—'}</Typography>
                        </Stack>
                      ))}
                    </Stack>

                    {/* Allowed zones */}
                    {zones && zones.wards.length > 0 && (
                      <Box mb={1.75}>
                        <Stack direction="row" spacing={0.5} alignItems="center" mb={0.75}>
                          <Location size="12" color="#f59e0b" />
                          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: 0.5, color: '#f59e0b' }}>
                            {zones.district} · {zones.level === 'strict' ? 'Chặt chẽ' : 'Theo dõi'}
                          </Typography>
                        </Stack>
                        <Stack direction="row" flexWrap="wrap" gap={0.4}>
                          {zones.wards.slice(0, 5).map((w) => (
                            <Chip key={w} label={w} size="small" sx={{ height: 17, fontSize: '0.62rem', fontWeight: 600, borderRadius: '5px', bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }} />
                          ))}
                          {zones.wards.length > 5 && (
                            <Chip label={`+${zones.wards.length - 5}`} size="small" sx={{ height: 17, fontSize: '0.62rem', borderRadius: '5px', bgcolor: glassBdr }} />
                          )}
                        </Stack>
                      </Box>
                    )}

                    <Divider sx={{ borderColor: glassBdr, my: 1.5 }} />

                    {/* Sensor grid */}
                    <Typography variant="caption" sx={{ fontWeight: 700, color: primaryColor, textTransform: 'uppercase', letterSpacing: 0.6, fontSize: '0.62rem', display: 'block', mb: 1.2 }}>
                      Cảm biến &amp; Định vị thiết bị
                    </Typography>
                    <Grid container spacing={1.25} mb={1.75}>
                      {[
                        { icon: <Lock1 size="14" color={bio.isTampered ? '#ef4444' : '#22c55e'} />, label: 'Khóa vòng chân', value: bio.isTampered ? 'Cảnh báo tháo' : 'Ổn định', color: bio.isTampered ? '#ef4444' : '#22c55e', blink: bio.isTampered },
                        { icon: <Gps size="14" color="#3b82f6" />, label: 'Vận tốc', value: `${dev.status.speed || 0} km/h` },
                        { icon: <Heart size="14" color="#a855f7" />, label: 'Độ cao / Vệ tinh', value: `${dev.status.altitude || 0}m · ${dev.status.satelliteCount}` },
                        { icon: <Activity size="14" color={dev.status.battery < 20 ? '#ef4444' : '#10b981'} />, label: 'Pin / Tín hiệu', value: `${dev.status.battery}% · ${dev.status.signalStrength}/4` },
                      ].map((s) => (
                        <Grid item xs={6} key={s.label}>
                          <Stack direction="row" spacing={0.75} alignItems="flex-start">
                            <Box sx={{ mt: 0.1, flexShrink: 0 }}>{s.icon}</Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.62rem', lineHeight: 1 }}>{s.label}</Typography>
                              <Typography variant="body2" className={s.blink ? 'gs-blink' : ''} sx={{ fontWeight: 700, fontSize: '0.77rem', color: s.color || (isDark ? '#f8fafc' : '#0f172a') }}>{s.value}</Typography>
                            </Box>
                          </Stack>
                        </Grid>
                      ))}
                    </Grid>

                    <Divider sx={{ borderColor: glassBdr, mb: 1.5 }} />

                    {/* Actions */}
                    <Stack direction="row" spacing={0.75} justifyContent="flex-end">
                      <Tooltip title="Chỉnh sửa hồ sơ">
                        <IconButton size="small" onClick={() => openEditDevice(dev)} sx={{ border: `1px solid ${glassBdr}`, borderRadius: '8px', width: 30, height: 30 }}>
                          <Edit size={15} />
                        </IconButton>
                      </Tooltip>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setSubjectDetailId(dev.id)}
                        sx={{ fontSize: '0.73rem', fontWeight: 700, borderRadius: '8px', textTransform: 'none', py: 0.5, px: 1.25, borderColor: glassBdr }}
                      >
                        Hồ sơ chi tiết
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Location size={13} />}
                        onClick={() => { setDashboardView('tracking'); setSelectedDeviceId(dev.id); }}
                        sx={{
                          fontSize: '0.73rem', fontWeight: 700, borderRadius: '8px', textTransform: 'none', py: 0.5, px: 1.25,
                          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
                          boxShadow: `0 3px 10px ${primaryColor}35`,
                        }}
                      >
                        Định vị
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              </Grid>
            );
          })}

          {filteredPrisonerTable.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>Không tìm thấy phạm nhân nào phù hợp</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* ── Table view ── */}
      {viewMode === 'table' && (
        <Box sx={{ borderRadius: '16px', border: `1px solid ${glassBdr}`, background: isDark ? 'rgba(9,13,31,0.5)' : 'rgba(255,255,255,0.7)', backdropFilter: glassBlur, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['', 'Họ tên phạm nhân', 'CCCD', 'Tội danh', 'Hình phạt', 'Mãn hạn', 'Thiết bị', 'Khu vực', 'Trạng thái', ''].map((h) => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#64748b' : '#94a3b8', borderBottom: `1px solid ${glassBdr}`, whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPrisonerTable.map((dev, idx) => {
                const sub = dev.subject!;
                const isViolating = deviceViolations[dev.id];
                const bio = getMockBiometrics(dev.id);
                const zones = parseZones(sub.notes);
                const alertColor = bio.isTampered ? '#ef4444' : isViolating ? '#f59e0b' : '#22c55e';
                const rowBg = idx % 2 === 0 ? (isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.008)') : 'transparent';

                return (
                  <tr key={dev.id} style={{ background: rowBg }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = isDark ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.025)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = rowBg; }}>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${glassBdr}` }}>
                      <Avatar sx={{ bgcolor: dev.color, width: 28, height: 28, fontSize: '0.75rem', fontWeight: 800 }}>{sub.fullName.split(' ').slice(-1)[0]?.charAt(0) ?? '?'}</Avatar>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${glassBdr}` }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.83rem', color: isDark ? '#f1f5f9' : '#0f172a', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } as any }} onClick={() => setSubjectDetailId(dev.id)}>{sub.fullName}</Typography>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${glassBdr}` }}><Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.7rem' }}>{sub.idNumber || '—'}</Typography></td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${glassBdr}` }}><Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>{sub.crime}</Typography></td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${glassBdr}` }}><Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>{sub.sentence}</Typography></td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${glassBdr}` }}><Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>{sub.releaseDate || '—'}</Typography></td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${glassBdr}` }}>
                      <Chip label={dev.name} size="small" sx={{ height: 18, fontSize: '0.68rem', borderRadius: '5px', bgcolor: `${dev.color}12`, color: dev.color, border: `1px solid ${dev.color}25` }} />
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${glassBdr}` }}>
                      {zones ? (
                        <Typography variant="caption" sx={{ fontSize: '0.68rem', color: '#f59e0b' }}>{zones.district}</Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', fontStyle: 'italic' }}>Chưa gán</Typography>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${glassBdr}` }}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, px: 1.1, py: 0.4, borderRadius: '20px', fontSize: '0.68rem', fontWeight: 700, bgcolor: `${alertColor}12`, color: alertColor, border: `1px solid ${alertColor}30` }}>
                        <Box className={bio.isTampered || isViolating ? 'gs-blink' : ''} sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: alertColor }} />
                        {bio.isTampered ? 'Cảnh báo' : isViolating ? 'Vi phạm' : 'An toàn'}
                      </Box>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${glassBdr}`, textAlign: 'right' }}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Hồ sơ chi tiết"><IconButton size="small" color="primary" onClick={() => setSubjectDetailId(dev.id)}><Eye size={15} /></IconButton></Tooltip>
                        <Tooltip title="Chỉnh sửa"><IconButton size="small" onClick={() => openEditDevice(dev)}><Edit size={15} /></IconButton></Tooltip>
                        <Tooltip title="Định vị trên bản đồ"><IconButton size="small" color="success" onClick={() => { setDashboardView('tracking'); setSelectedDeviceId(dev.id); }}><MapIcon size={15} /></IconButton></Tooltip>
                      </Stack>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── Add prisoner drawer ── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 520 },
            bgcolor: isDark ? '#0d1224' : '#f8fafc',
            borderLeft: `1px solid ${glassBdr}`,
            boxShadow: '-8px 0 40px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Drawer header */}
        <Box
          sx={{
            px: 3, py: 2.5,
            background: isDark
              ? `linear-gradient(135deg, ${primaryColor}22, ${primaryColor}08)`
              : `linear-gradient(135deg, ${primaryColor}12, ${primaryColor}04)`,
            borderBottom: `1px solid ${glassBdr}`,
            flexShrink: 0,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: isDark ? '#f1f5f9' : '#0f172a', fontSize: '1rem' }}>
                Thêm phạm nhân mới
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                Điền đầy đủ thông tin · Gán thiết bị · Phân quyền khu vực
              </Typography>
            </Box>
            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444' } }}>
              <CloseCircle size={22} />
            </IconButton>
          </Stack>
        </Box>

        {/* Scrollable form body */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3 }}>
          <Stack spacing={3.5}>

            {/* ── SECTION 1: Prisoner info ── */}
            <Box>
              <SectionHeader icon={<Profile2User size={16} color={primaryColor} />} title="Thông tin phạm nhân" accent={primaryColor} isDark={isDark} />
              <Stack spacing={2}>
                <TextField
                  label="Họ và tên *"
                  size="small"
                  fullWidth
                  value={form.subjectFullName}
                  onChange={(e) => setF({ subjectFullName: e.target.value })}
                  placeholder="Vd: Nguyễn Văn A"
                />
                <TextField
                  label="Số CCCD / CMND *"
                  size="small"
                  fullWidth
                  value={form.subjectIdNumber}
                  onChange={(e) => setF({ subjectIdNumber: e.target.value })}
                  placeholder="12 chữ số"
                  inputProps={{ maxLength: 12, style: { fontFamily: 'monospace', letterSpacing: 2 } }}
                />
                <TextField
                  label="Tội danh"
                  size="small"
                  fullWidth
                  value={form.subjectCrime}
                  onChange={(e) => setF({ subjectCrime: e.target.value })}
                  placeholder="Vd: Trộm cắp tài sản (Đ173 BLHS)"
                />
                <TextField
                  label="Hình phạt / Bản án"
                  size="small"
                  fullWidth
                  value={form.subjectSentence}
                  onChange={(e) => setF({ subjectSentence: e.target.value })}
                  placeholder="Vd: 36 tháng tù giam"
                />
                <Stack direction="row" spacing={1.5}>
                  <TextField
                    label="Ngày bắt đầu thi hành"
                    size="small"
                    fullWidth
                    type="date"
                    value={form.subjectStartDate}
                    onChange={(e) => setF({ subjectStartDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Ngày mãn hạn"
                    size="small"
                    fullWidth
                    type="date"
                    value={form.subjectReleaseDate}
                    onChange={(e) => setF({ subjectReleaseDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>
                <TextField
                  label="Ghi chú"
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                  value={form.subjectNotes}
                  onChange={(e) => setF({ subjectNotes: e.target.value })}
                  placeholder="Đặc điểm nhận dạng, lưu ý điều tra..."
                />
              </Stack>
            </Box>

            <Divider sx={{ borderColor: glassBdr }} />

            {/* ── SECTION 2: Device assignment ── */}
            <Box>
              <SectionHeader icon={<Gps size={16} color="#22c55e" />} title="Gán thiết bị giám sát" accent="#22c55e" isDark={isDark} />
              <Stack spacing={2}>
                <TextField
                  label="Số IMEI thiết bị *"
                  size="small"
                  fullWidth
                  value={form.imei}
                  onChange={(e) => setF({ imei: e.target.value })}
                  placeholder="15 chữ số (in sau thiết bị)"
                  inputProps={{ maxLength: 20, style: { fontFamily: 'monospace', letterSpacing: 1 } }}
                  helperText="Nhập IMEI in trên thân thiết bị hoặc chọn từ danh sách bên dưới"
                />

                {freeDevices.length > 0 && (
                  <FormControl size="small" fullWidth>
                    <InputLabel>Chọn từ thiết bị sẵn có (tùy chọn)</InputLabel>
                    <Select
                      value={form.imei}
                      onChange={(e: SelectChangeEvent) => setF({ imei: e.target.value })}
                      label="Chọn từ thiết bị sẵn có (tùy chọn)"
                    >
                      <MenuItem value=""><em>— Nhập IMEI thủ công —</em></MenuItem>
                      {freeDevices.map((d) => (
                        <MenuItem key={d.id} value={d.uniqueId}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: d.color, flexShrink: 0 }} />
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>{d.name}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{d.uniqueId}</Typography>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: isDark ? 'rgba(34,197,94,0.06)' : 'rgba(34,197,94,0.04)', border: `1px solid rgba(34,197,94,0.15)` }}>
                  <Typography variant="caption" sx={{ color: '#22c55e', fontWeight: 600, fontSize: '0.7rem' }}>
                    ℹ️ Hệ thống sẽ tự động ghép nối thiết bị theo IMEI. Không cần số điện thoại SIM.
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider sx={{ borderColor: glassBdr }} />

            {/* ── SECTION 3: Zone permissions ── */}
            <Box>
              <SectionHeader icon={<Building4 size={16} color="#f59e0b" />} title="Phân quyền khu vực giám sát" accent="#f59e0b" isDark={isDark} />
              <Stack spacing={2}>

                {/* Province */}
                <FormControl size="small" fullWidth>
                  <InputLabel>Tỉnh / Thành phố</InputLabel>
                  <Select
                    value={form.province}
                    onChange={(e: SelectChangeEvent) => setF({ province: e.target.value, district: '', allowedWards: [] })}
                    label="Tỉnh / Thành phố"
                  >
                    {PROVINCES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                  </Select>
                </FormControl>

                {/* District */}
                {form.province && (
                  <FormControl size="small" fullWidth>
                    <InputLabel>Quận / Huyện giám sát</InputLabel>
                    <Select
                      value={form.district}
                      onChange={(e: SelectChangeEvent) => setF({ district: e.target.value, allowedWards: [] })}
                      label="Quận / Huyện giám sát"
                    >
                      {(DISTRICTS[form.province] ?? []).map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}

                {/* Ward chips */}
                {form.district && (WARDS[form.district] ?? []).length > 0 && (
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                        Phường / Xã được phép di chuyển
                      </Typography>
                      <Stack direction="row" spacing={0.75}>
                        <Button size="small" sx={{ fontSize: '0.65rem', py: 0.2, px: 0.75, textTransform: 'none', minWidth: 0 }} onClick={() => setF({ allowedWards: WARDS[form.district] ?? [] })}>
                          Chọn tất cả
                        </Button>
                        <Button size="small" sx={{ fontSize: '0.65rem', py: 0.2, px: 0.75, textTransform: 'none', minWidth: 0 }} color="inherit" onClick={() => setF({ allowedWards: [] })}>
                          Bỏ chọn
                        </Button>
                      </Stack>
                    </Stack>
                    <Stack direction="row" flexWrap="wrap" gap={0.6}>
                      {(WARDS[form.district] ?? []).map((ward) => {
                        const selected = form.allowedWards.includes(ward);
                        return (
                          <Chip
                            key={ward}
                            label={ward}
                            size="small"
                            onClick={() => setF({ allowedWards: selected ? form.allowedWards.filter((w) => w !== ward) : [...form.allowedWards, ward] })}
                            sx={{
                              height: 22, fontSize: '0.7rem', fontWeight: 600, borderRadius: '7px', cursor: 'pointer',
                              border: '1.5px solid',
                              borderColor: selected ? '#f59e0b' : glassBdr,
                              bgcolor: selected ? 'rgba(245,158,11,0.14)' : 'transparent',
                              color: selected ? '#f59e0b' : 'text.secondary',
                              transition: 'all 0.15s',
                              '&:hover': { borderColor: '#f59e0b', color: '#f59e0b' },
                            }}
                          />
                        );
                      })}
                    </Stack>
                    {form.allowedWards.length > 0 && (
                      <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.68rem', display: 'block', mt: 0.75 }}>
                        Đã chọn {form.allowedWards.length} phường/xã
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Monitoring level */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', display: 'block', mb: 1 }}>
                    Mức độ giám sát khu vực
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {([
                      { val: 'strict',     label: '🔒 Chặt chẽ',  desc: 'Báo động ngay khi ra khỏi vùng' },
                      { val: 'monitoring', label: '👁 Theo dõi', desc: 'Ghi nhận, không báo động tự động' },
                    ] as const).map((opt) => {
                      const active = form.monitoringLevel === opt.val;
                      return (
                        <Box
                          key={opt.val}
                          onClick={() => setF({ monitoringLevel: opt.val })}
                          sx={{
                            flex: 1, p: 1.5, borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                            border: '1.5px solid',
                            borderColor: active ? '#f59e0b' : glassBdr,
                            bgcolor: active ? 'rgba(245,158,11,0.1)' : 'transparent',
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem', color: active ? '#f59e0b' : 'text.primary', display: 'block' }}>
                            {opt.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                            {opt.desc}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>

                {/* Radius slider */}
                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                      Bán kính cho phép di chuyển
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#f59e0b' }}>
                      {form.allowedRadius} km
                    </Typography>
                  </Stack>
                  <Slider
                    value={form.allowedRadius}
                    onChange={(_, val) => setF({ allowedRadius: val as number })}
                    min={1} max={20} step={1}
                    sx={{
                      color: '#f59e0b',
                      '& .MuiSlider-thumb': { width: 16, height: 16 },
                      '& .MuiSlider-track': { height: 4 },
                      '& .MuiSlider-rail': { height: 4 },
                    }}
                  />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>1 km (hẹp)</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>20 km (rộng)</Typography>
                  </Stack>
                </Box>

                {/* Zone preview */}
                {form.district && form.allowedWards.length > 0 && (
                  <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: isDark ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.18)' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#f59e0b', display: 'block', mb: 0.4 }}>
                      Tóm tắt phân quyền
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                      {form.province} · {form.district} · {form.allowedWards.length} phường/xã · {form.monitoringLevel === 'strict' ? 'Chặt chẽ' : 'Theo dõi'} · Bán kính {form.allowedRadius} km
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Drawer footer */}
        <Box
          sx={{
            px: 3, py: 2,
            borderTop: `1px solid ${glassBdr}`,
            bgcolor: isDark ? 'rgba(9,13,31,0.8)' : 'rgba(248,250,252,0.95)',
            flexShrink: 0,
          }}
        >
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button
              onClick={() => { setDrawerOpen(false); setForm(EMPTY_FORM); }}
              variant="outlined"
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', borderColor: glassBdr, color: 'text.secondary', px: 2.5 }}
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={!form.subjectFullName || !form.imei}
              startIcon={<ShieldSecurity size={16} />}
              sx={{
                textTransform: 'none', fontWeight: 700, borderRadius: '10px', px: 2.5,
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
                boxShadow: `0 4px 16px ${primaryColor}40`,
                '&:hover': { boxShadow: `0 6px 24px ${primaryColor}50` },
                '&:disabled': { opacity: 0.5 },
              }}
            >
              Lưu hồ sơ phạm nhân
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Stack>
  );
}
