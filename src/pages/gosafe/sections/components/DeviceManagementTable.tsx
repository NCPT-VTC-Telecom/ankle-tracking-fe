import { useState, useMemo, useEffect } from 'react';
import {
  Stack, TextField, Button, Box, Typography, Chip, Tooltip, IconButton, Grid, Avatar,
  LinearProgress, Dialog, DialogContent, DialogActions, Menu, MenuItem,
  ListItemIcon, ListItemText, Divider
} from '@mui/material';
import {
  SearchNormal1, Add, Wifi, Gps, Edit, Trash, InfoCircle, Cpu,
  More, Location, Flash, ShieldSecurity, CloseCircle
} from 'iconsax-react';
import { TrackingStore } from '../../tracking/useTracking';
import { devicesApi, extractList, mapApiMgmtDeviceToDevice } from 'api/gosafe.management.api';
import { DEVICE_PALETTE } from '../../tracking/constants';
import GlassKpiCard from './GlassKpiCard';
import PaginationBar, { usePagination } from '../../components/PaginationBar';

interface DeviceManagementTableProps {
  isDark: boolean;
  store: TrackingStore;
  setDashboardView: (view: 'overview' | 'tracking' | 'devices' | 'prisoners' | 'alerts' | 'users' | 'regions' | 'compliance') => void;
  refreshKey?: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const SignalBars = ({ strength }: { strength: number }) => (
  <Stack direction="row" spacing={0.4} alignItems="flex-end" sx={{ height: 16, width: 22 }}>
    {[1, 2, 3, 4].map((bar) => {
      const active = bar <= strength;
      const color = active
        ? strength <= 1 ? '#ef4444' : strength === 2 ? '#f59e0b' : '#22c55e'
        : '#64748b40';
      return (
        <Box key={bar} sx={{ width: 3.5, height: bar * 4, bgcolor: color, borderRadius: '1px', transition: 'background-color 0.25s' }} />
      );
    })}
  </Stack>
);

const getCarrierInfo = (num: string) => {
  if (!num) return null;
  if (num.startsWith('+8490') || num.startsWith('090') || num.startsWith('093') || num.startsWith('+8493')) return 'Mobifone';
  if (num.startsWith('+8491') || num.startsWith('091') || num.startsWith('088') || num.startsWith('+8488')) return 'Vinaphone';
  return 'Viettel';
};

const getDeviceNetwork = (uid: string) => {
  let h = 0;
  for (let i = 0; i < uid.length; i++) h = uid.charCodeAt(i) + ((h << 5) - h);
  return {
    ipAddress: `10.142.${Math.abs(h % 254) + 1}.${Math.abs((h >> 4) % 254) + 1}`,
    cellTowerId: `452-04-182${Math.abs(h % 90) + 10}`,
    networkDelay: 18 + Math.abs(h % 50),
  };
};

const CARRIER_COLOR: Record<string, string> = {
  Viettel: '#ef4444',
  Vinaphone: '#3b82f6',
  Mobifone: '#f97316',
};

// ── KPI card glass style ───────────────────────────────────────────────────────

// ── Main component ─────────────────────────────────────────────────────────────

export default function DeviceManagementTable({ isDark, store, setDashboardView, refreshKey }: DeviceManagementTableProps) {
  const {
    devices: liveDevices, geofences, deviceViolations,
    openEditDevice, setAddDeviceOpen, setRemoveConfirmId,
    setAssignGeofenceId, setSubjectDetailId, setSelectedDeviceId,
  } = store;

  // ── Nguồn chính: device_management/list (inventory + gpsStatus), ghép telemetry
  //    sống từ feed GPS theo IMEI. Fallback về feed GPS nếu API chưa tải/được. ──
  const [mgmtRaw, setMgmtRaw] = useState<any[]>([]);
  useEffect(() => {
    let cancelled = false;
    devicesApi
      .list({ pageSize: 200 })
      .then((r) => { if (!cancelled) setMgmtRaw(extractList(r.data)); })
      .catch(() => { /* giữ fallback feed GPS */ });
    return () => { cancelled = true; };
    // liveDevices.length đổi = thêm/xoá thiết bị (qua store) → nạp lại inventory.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, liveDevices.length]);

  const devices = useMemo(() => {
    if (mgmtRaw.length === 0) return liveDevices; // chưa tải / API lỗi → dùng feed GPS
    const imeiOf = (raw: any) => String(raw?.imei ?? raw?.deviceImei ?? raw?.device_imei ?? '').trim();
    const liveByImei = new Map(liveDevices.filter((d) => d.uniqueId).map((d) => [d.uniqueId, d]));
    return mgmtRaw.map((raw, i) =>
      mapApiMgmtDeviceToDevice(raw, liveByImei.get(imeiOf(raw)), DEVICE_PALETTE[i % DEVICE_PALETTE.length])
    );
  }, [mgmtRaw, liveDevices]);

  const [deviceSearch, setDeviceSearch]       = useState('');
  const [connectionFilter, setConnectionFilter] = useState<string>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('all');
  const [detailDevice, setDetailDevice]         = useState<any | null>(null);
  const [fetchedDetail, setFetchedDetail]       = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail]       = useState(false);
  const [activeTab, setActiveTab]               = useState<'gps' | 'config' | 'offender'>('gps');
  const [copied, setCopied]                     = useState(false);
  const [menuAnchor, setMenuAnchor]             = useState<{ el: HTMLElement; devId: string } | null>(null);

  useEffect(() => {
    if (!detailDevice) {
      setFetchedDetail(null);
      setCopied(false);
      setActiveTab('gps');
      return;
    }
    setLoadingDetail(true);
    const rawId = detailDevice.id.replace(/^mgmt-/, '');
    devicesApi.detail(rawId)
      .then((res) => {
        const raw = res.data?.data ?? res.data;
        if (raw) {
          const live = liveDevices.find((d) => d.uniqueId === raw.imei || d.id === detailDevice.id);
          const mapped = mapApiMgmtDeviceToDevice(raw, live, detailDevice.color || '#1e6fd9');
          setFetchedDetail(mapped);
        } else {
          setFetchedDetail(detailDevice);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch device details:', err);
        setFetchedDetail(detailDevice);
      })
      .finally(() => {
        setLoadingDetail(false);
      });
  }, [detailDevice, liveDevices]);

  const stats = useMemo(() => ({
    total:      devices.length,
    online:     devices.filter((d) => d.status.connectionStatus === 'online').length,
    violating:  devices.filter((d) => deviceViolations[d.id]).length,
    lowBattery: devices.filter((d) => d.status.battery < 20).length,
  }), [devices, deviceViolations]);

  const filteredDeviceTable = useMemo(() => devices.filter((d) => {
    const q = deviceSearch.toLowerCase();
    const matchSearch = !deviceSearch
      || (d.name ?? '').toLowerCase().includes(q)
      || (d.uniqueId ?? '').includes(q)
      || (d.phoneNumber ?? '').includes(q)
      || (d.subject?.fullName?.toLowerCase().includes(q) ?? false);
    const conn = d.status.connectionStatus;
    let matchConn = true;
    if (connectionFilter === 'online')   matchConn = conn === 'online';
    else if (connectionFilter === 'offline') matchConn = conn === 'offline';
    else if (connectionFilter === 'warning') matchConn = !!deviceViolations[d.id];
    let matchAssign = true;
    if (assignmentFilter === 'assigned')   matchAssign = d.subject !== null;
    else if (assignmentFilter === 'unassigned') matchAssign = d.subject === null;
    return matchSearch && matchConn && matchAssign;
  }), [devices, deviceSearch, connectionFilter, assignmentFilter, deviceViolations]);

  const { page, setPage, total, totalPages, paged } = usePagination(filteredDeviceTable, 12);

  const menuDevice = menuAnchor ? devices.find((d) => d.id === menuAnchor.devId) : null;

  const closeMenu = () => setMenuAnchor(null);

  // ── glass/flat tokens ──
  const glassBdr   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const glassBlur  = 'blur(20px) saturate(1.6)';
  const panelBg    = isDark ? 'rgba(9,13,31,0.5)'  : 'rgba(255,255,255,0.7)';

  return (
    <Stack spacing={3}>

      {/* ── KPI Cards ── */}
      <Grid container spacing={2.5}>
        {[
          { label: 'Tổng thiết bị',         value: stats.total,      accent: '#2563eb', icon: <Cpu size={22} variant="Bold" /> },
          { label: 'Thiết bị Trực tuyến',    value: stats.online,     accent: '#22c55e', icon: <Wifi size={22} variant="Bold" />, live: true },
          { label: 'Vi phạm Geofence',        value: stats.violating,  accent: '#ef4444', icon: <Gps size={22} variant="Bold" />, blink: stats.violating > 0 },
          { label: 'Pin yếu (< 20%)',         value: stats.lowBattery, accent: '#f59e0b', icon: <Flash size={22} variant="Bold" /> },
        ].map((kpi) => (
          <Grid item xs={12} sm={6} md={3} key={kpi.label}>
            <GlassKpiCard
              isDark={isDark}
              label={kpi.label}
              value={kpi.value}
              color={kpi.accent}
              icon={kpi.icon}
              live={kpi.live}
              blink={kpi.blink}
              sub={
                kpi.label === 'Tổng thiết bị' ? `${stats.online} đang hoạt động` :
                kpi.label === 'Thiết bị Trực tuyến' ? `${stats.total - stats.online} ngoại tuyến` :
                kpi.label === 'Vi phạm Geofence' ? (stats.violating > 0 ? 'Cần xử lý ngay' : 'Không có vi phạm') :
                (stats.lowBattery > 0 ? 'Cần sạc thiết bị' : 'Pin ổn định')
              }
            />
          </Grid>
        ))}
      </Grid>

      {/* ── Filter & Table Panel ── */}
      <Box
        sx={{
          borderRadius: '16px',
          border: `1px solid ${glassBdr}`,
          background: panelBg,
          backdropFilter: glassBlur,
          WebkitBackdropFilter: glassBlur,
          boxShadow: `0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1)`,
          overflow: 'hidden',
        }}
      >
        {/* Filter bar */}
        <Box sx={{ px: 2.5, pt: 2.5, pb: 2, borderBottom: `1px solid ${glassBdr}` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1} alignItems="center">
              {/* Search */}
              <TextField
                size="small"
                placeholder="Tìm thiết bị, IMEI, SĐT..."
                value={deviceSearch}
                onChange={(e) => setDeviceSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchNormal1 size={16} style={{ marginRight: 6, color: '#94a3b8' }} />,
                  sx: { fontSize: '0.9rem', borderRadius: '12px', bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' },
                }}
                sx={{ width: 280 }}
              />

              {/* Connection filter */}
              <Stack direction="row" spacing={0.5}>
                {[
                  { key: 'all',     label: 'Tất cả',      color: undefined },
                  { key: 'online',  label: 'Trực tuyến',  color: '#22c55e' },
                  { key: 'offline', label: 'Ngoại tuyến', color: '#64748b' },
                  { key: 'warning', label: 'Đang vi phạm', color: '#ef4444' },
                ].map((st) => {
                  const active = connectionFilter === st.key;
                  return (
                    <Chip
                      key={st.key}
                      label={st.label}
                      onClick={() => setConnectionFilter(st.key)}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        height: 32,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '1.5px solid',
                        borderColor: active ? (st.color || store.primaryColor) : glassBdr,
                        bgcolor: active ? `${st.color || store.primaryColor}18` : 'transparent',
                        color: active ? (st.color || store.primaryColor) : 'text.secondary',
                        '&:hover': { borderColor: st.color || store.primaryColor },
                      }}
                    />
                  );
                })}
              </Stack>

              {/* Assignment filter */}
              <Stack direction="row" spacing={0.5}>
                {[
                  { key: 'all',        label: 'Tất cả đối tượng' },
                  { key: 'assigned',   label: 'Đã gán người đeo' },
                  { key: 'unassigned', label: 'Chưa gán' },
                ].map((as) => {
                  const active = assignmentFilter === as.key;
                  return (
                    <Chip
                      key={as.key}
                      label={as.label}
                      onClick={() => setAssignmentFilter(as.key)}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        height: 32,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '1.5px solid',
                        borderColor: active ? store.secondaryColor : glassBdr,
                        bgcolor: active ? `${store.secondaryColor}18` : 'transparent',
                        color: active ? store.secondaryColor : 'text.secondary',
                        '&:hover': { borderColor: store.secondaryColor },
                      }}
                    />
                  );
                })}
              </Stack>
            </Stack>

            <Button
              variant="contained"
              startIcon={<Add size={18} />}
              onClick={() => setAddDeviceOpen(true)}
              sx={{
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.9rem',
                borderRadius: '12px',
                py: 1.2,
                px: 2.5,
                background: `linear-gradient(135deg, ${store.primaryColor}, ${store.primaryColor}cc)`,
                boxShadow: `0 4px 16px ${store.primaryColor}40`,
                '&:hover': { boxShadow: `0 6px 24px ${store.primaryColor}50` },
              }}
            >
              Thêm thiết bị mới
            </Button>
          </Stack>
        </Box>

        {/* ── Table ── */}
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '18%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '7%' }} />
            </colgroup>

            <thead>
              <tr>
                {['Tên thiết bị & Model', 'Số IMEI', 'SIM liên kết', 'Đối tượng đeo', 'Dung lượng pin', 'Cột sóng', 'Trạng thái', ''].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '16px 20px',
                      textAlign: 'left',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: isDark ? '#64748b' : '#94a3b8',
                      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((dev, rowIdx) => {
                const isViolating  = deviceViolations[dev.id];
                const conn         = dev.status.connectionStatus;
                const carrier      = getCarrierInfo(dev.phoneNumber);
                const isLowBattery = dev.status.battery < 20;
                const isOnline     = conn === 'online';
                const statusColor  = isViolating ? '#ef4444' : isOnline ? '#22c55e' : conn === 'offline' ? '#64748b' : '#f59e0b';
                const statusLabel  = isViolating ? 'Vi phạm' : isOnline ? 'Online' : conn === 'offline' ? 'Offline' : 'Chập chờn';
                const rowBg        = rowIdx % 2 === 0
                  ? (isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.008)')
                  : 'transparent';

                return (
                  <tr
                    key={dev.id}
                    style={{ background: rowBg, transition: 'background 0.15s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = isDark ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.025)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = rowBg; }}
                  >
                    {/* Device Name */}
                    <td style={{ padding: '20px 20px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`, borderLeft: `3px solid ${isViolating ? '#ef4444' : 'transparent'}` }}>
                      <Stack direction="row" spacing={1.75} alignItems="center">
                        <Box sx={{ position: 'relative', flexShrink: 0 }}>
                          <Avatar sx={{ bgcolor: `${dev.color}22`, color: dev.color, width: 40, height: 40, fontSize: '0.9rem', fontWeight: 700, border: `1.5px solid ${dev.color}44` }}>
                            {(dev.name ?? '—').slice(0, 2).toUpperCase()}
                          </Avatar>
                          <Box sx={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', bgcolor: statusColor, border: `1.5px solid ${isDark ? '#0d1224' : '#fff'}`, boxShadow: `0 0 6px ${statusColor}` }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.95rem', color: isDark ? '#f1f5f9' : '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {dev.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            {dev.deviceType} ({dev.status.firmwareVersion || 'V1.0.0'})
                          </Typography>
                        </Box>
                      </Stack>
                    </td>

                    {/* IMEI */}
                    <td style={{ padding: '20px 20px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
                      <Typography variant="caption" sx={{ fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b', display: 'block', letterSpacing: 0.5 }}>
                        {dev.uniqueId}
                      </Typography>
                    </td>

                    {/* SIM */}
                    <td style={{ padding: '20px 20px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
                      {dev.phoneNumber ? (
                        <Stack spacing={0.75}>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{dev.phoneNumber}</Typography>
                          {carrier && (
                            <Chip
                              label={carrier}
                              size="small"
                              sx={{
                                height: 20, fontSize: '0.72rem', fontWeight: 700, borderRadius: '6px', alignSelf: 'flex-start',
                                bgcolor: `${CARRIER_COLOR[carrier]}12`,
                                color: CARRIER_COLOR[carrier],
                                border: `1px solid ${CARRIER_COLOR[carrier]}25`,
                              }}
                            />
                          )}
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem', fontStyle: 'italic' }}>Chưa lắp SIM</Typography>
                      )}
                    </td>

                    {/* Subject */}
                    <td style={{ padding: '20px 20px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
                      {dev.subject ? (
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          <Avatar sx={{ bgcolor: dev.color, width: 32, height: 32, fontSize: '0.8rem', fontWeight: 700, boxShadow: `0 0 8px ${dev.color}50`, flexShrink: 0 }}>
                            {dev.subject?.fullName?.split(' ').slice(-1)[0]?.charAt(0) ?? '?'}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              onClick={() => setSubjectDetailId(dev.id)}
                              sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'primary.main', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', '&:hover': { textDecoration: 'underline' } }}
                            >
                              {dev.subject.fullName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              CCCD: {dev.subject.idNumber || '—'}
                            </Typography>
                          </Box>
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem', fontStyle: 'italic' }}>Chưa gán hồ sơ</Typography>
                      )}
                    </td>

                    {/* Battery */}
                    <td style={{ padding: '20px 20px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
                      <Stack spacing={0.75}>
                        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.9rem', color: isLowBattery ? '#ef4444' : 'text.primary' }}>
                            {isLowBattery && '⚠ '}{dev.status.battery}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            {dev.status.batteryVoltage ? `${dev.status.batteryVoltage.toFixed(2)}V` : '—'}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={dev.status.battery}
                          sx={{
                            height: 6, borderRadius: 3,
                            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              bgcolor: isLowBattery ? '#ef4444' : dev.status.battery > 50 ? '#22c55e' : '#f59e0b',
                            },
                          }}
                        />
                      </Stack>
                    </td>

                    {/* Signal */}
                    <td style={{ padding: '20px 20px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <SignalBars strength={dev.status.signalStrength} />
                        <Typography variant="caption" sx={{ fontSize: '0.78rem', color: 'text.secondary', fontWeight: 600 }}>
                          {dev.status.signalStrength}/4
                        </Typography>
                      </Stack>
                    </td>

                    {/* Status badge */}
                    <td style={{ padding: '20px 20px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
                      <Box
                        sx={{
                          display: 'inline-flex', alignItems: 'center', gap: 0.75,
                          px: 1.75, py: 0.75, borderRadius: '20px',
                          fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase',
                          bgcolor: `${statusColor}14`,
                          color: statusColor,
                          border: `1px solid ${statusColor}35`,
                          boxShadow: (isOnline || isViolating) ? `0 0 10px ${statusColor}20` : 'none',
                        }}
                      >
                        <Box
                          className={isViolating ? 'gs-blink' : ''}
                          sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: statusColor, boxShadow: (isOnline || isViolating) ? `0 0 6px ${statusColor}` : 'none' }}
                        />
                        {statusLabel}
                      </Box>
                    </td>

                    {/* Actions — kebab menu */}
                    <td style={{ padding: '20px 20px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`, textAlign: 'right' }}>
                      <Tooltip title="Tùy chọn">
                        <IconButton
                          size="small"
                          onClick={(e) => setMenuAnchor({ el: e.currentTarget, devId: dev.id })}
                          sx={{
                            borderRadius: '12px',
                            width: 36, height: 36,
                            bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                            color: 'text.secondary',
                            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', color: store.primaryColor },
                          }}
                        >
                          <More size={18} />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                );
              })}
              {filteredDeviceTable.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px 16px' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Không tìm thấy thiết bị nào phù hợp
                    </Typography>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      </Box>

      <PaginationBar page={page} totalPages={totalPages} total={total} shownCount={paged.length} onChange={setPage} label="thiết bị" />

      {/* ── Actions popup menu ── */}
      <Menu
        anchorEl={menuAnchor?.el}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            width: 230,
            borderRadius: '12px',
            border: `1px solid ${glassBdr}`,
            bgcolor: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
            overflow: 'hidden',
            mt: 0.5,
          },
        }}
      >
        {/* Device header */}
        {menuDevice && (
          <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${glassBdr}`, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)' }}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Avatar sx={{ bgcolor: `${menuDevice.color}22`, color: menuDevice.color, width: 28, height: 28, fontSize: '0.7rem', fontWeight: 700, border: `1.5px solid ${menuDevice.color}44` }}>
                {(menuDevice.name ?? '—').slice(0, 2).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.8rem', display: 'block', color: isDark ? '#f1f5f9' : '#0f172a' }}>
                  {menuDevice.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  {(menuDevice.uniqueId ?? '').slice(0, 12)}…
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        <MenuItem
          onClick={() => { if (menuDevice) setDetailDevice(menuDevice); closeMenu(); }}
          sx={{ py: 1.25, px: 2, fontSize: '0.82rem', gap: 0, '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' } }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}><InfoCircle size={16} color={store.primaryColor} /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 600 }}>Chi tiết kỹ thuật</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => { if (menuDevice) { setDashboardView('tracking'); setSelectedDeviceId(menuDevice.id); } closeMenu(); }}
          sx={{ py: 1.25, px: 2, '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' } }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}><Location size={16} color="#8b5cf6" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 600 }}>Xem trên bản đồ</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => { if (menuDevice) setAssignGeofenceId(menuDevice.assignedGeofenceId || geofences[0]?.id); closeMenu(); }}
          sx={{ py: 1.25, px: 2, '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' } }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}><ShieldSecurity size={16} color="#22c55e" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 600 }}>Gán vùng Geofence</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => { if (menuDevice) openEditDevice(menuDevice); closeMenu(); }}
          sx={{ py: 1.25, px: 2, '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' } }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}><Edit size={16} color="#f59e0b" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 600 }}>Chỉnh sửa cấu hình</ListItemText>
        </MenuItem>

        <Divider sx={{ my: 0.5, borderColor: glassBdr }} />

        <MenuItem
          onClick={() => { if (menuDevice) setRemoveConfirmId(menuDevice.id); closeMenu(); }}
          sx={{ py: 1.25, px: 2, color: '#ef4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.06)' } }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}><Trash size={16} color="#ef4444" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 600, color: '#ef4444' }}>Xoá thiết bị</ListItemText>
        </MenuItem>
      </Menu>

      {/* ── Device detail dialog ── */}
      <Dialog
        open={Boolean(detailDevice)}
        onClose={() => setDetailDevice(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            bgcolor: isDark ? 'rgba(9,13,31,0.96)' : 'rgba(255,255,255,0.98)',
            border: `1px solid ${glassBdr}`,
            backdropFilter: 'blur(24px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
            overflow: 'hidden',
          },
        }}
      >
        {detailDevice && (() => {
          const dev = fetchedDetail || detailDevice;
          const isViolating  = deviceViolations[dev.id];
          const conn         = dev.status.connectionStatus;
          const isOnline     = conn === 'online';
          const statusColor  = isViolating ? '#ef4444' : isOnline ? '#22c55e' : conn === 'offline' ? '#64748b' : '#f59e0b';
          const statusLabel  = isViolating ? 'Vi phạm' : isOnline ? 'Online' : conn === 'offline' ? 'Offline' : 'Chập chờn';

          const network = getDeviceNetwork(dev.uniqueId);
          const carrier = getCarrierInfo(dev.phoneNumber);
          const isGpsFix = dev.status.gpsFix;

          return (
            <>
              {/* Loading progress bar */}
              {loadingDetail && <LinearProgress sx={{ height: 3, width: '100%', position: 'absolute', top: 0, left: 0 }} />}

              {/* Glass header */}
              <Box
                sx={{
                  px: 3, py: 2.5,
                  background: isDark
                    ? `linear-gradient(135deg, ${dev.color}22, ${dev.color}08)`
                    : `linear-gradient(135deg, ${dev.color}12, ${dev.color}04)`,
                  borderBottom: `1px solid ${glassBdr}`,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: `${dev.color}22`, color: dev.color, width: 48, height: 48, fontSize: '1.1rem', fontWeight: 700, border: `2px solid ${dev.color}44`, boxShadow: `0 4px 16px ${dev.color}30` }}>
                      {(dev.name ?? '—').slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a', lineHeight: 1.2 }}>
                          {dev.name}
                        </Typography>
                        <Chip
                          label={statusLabel}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            bgcolor: `${statusColor}18`,
                            color: statusColor,
                            border: `1.5px solid ${statusColor}35`
                          }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        {dev.deviceType} · FW {dev.status.firmwareVersion || 'V1.18d0609'}
                      </Typography>
                    </Box>
                  </Stack>
                  <IconButton size="small" onClick={() => setDetailDevice(null)} sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444' } }}>
                    <CloseCircle size={20} />
                  </IconButton>
                </Stack>
              </Box>

              <DialogContent sx={{ px: 3, py: 2.5 }}>
                {/* Custom Tab Selector */}
                <Stack direction="row" spacing={1} sx={{ p: 0.75, borderRadius: '12px', bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', mb: 3 }}>
                  {[
                    { id: 'gps', label: 'Trạng thái & Định vị', icon: <Gps size={16} /> },
                    { id: 'config', label: 'Thiết bị & SIM', icon: <Cpu size={16} /> },
                    { id: 'offender', label: 'Đối tượng đeo', icon: <ShieldSecurity size={16} /> }
                  ].map((t) => {
                    const active = activeTab === t.id;
                    return (
                      <Button
                        key={t.id}
                        onClick={() => setActiveTab(t.id as any)}
                        variant="text"
                        startIcon={t.icon}
                        sx={{
                          flex: 1,
                          borderRadius: '10px',
                          fontWeight: 700,
                          textTransform: 'none',
                          fontSize: '0.82rem',
                          py: 1,
                          bgcolor: active ? (isDark ? 'rgba(255,255,255,0.08)' : '#ffffff') : 'transparent',
                          color: active ? store.primaryColor : 'text.secondary',
                          boxShadow: active && !isDark ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                          '&:hover': {
                            bgcolor: active ? (isDark ? 'rgba(255,255,255,0.1)' : '#ffffff') : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)')
                          }
                        }}
                      >
                        {t.label}
                      </Button>
                    );
                  })}
                </Stack>

                {/* Tab content renders here */}
                {activeTab === 'gps' && (
                  <Stack spacing={2}>
                    {/* Battery Card */}
                    <Box sx={{ p: 2, borderRadius: '12px', border: `1px solid ${glassBdr}`, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.25}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Flash size={18} color="#f59e0b" variant="Bold" />
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>Dung lượng Pin</Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: dev.status.battery < 20 ? '#ef4444' : '#22c55e' }}>
                          {dev.status.battery}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={dev.status.battery}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            bgcolor: dev.status.battery < 20 ? '#ef4444' : dev.status.battery > 50 ? '#22c55e' : '#f59e0b',
                          }
                        }}
                      />
                      {dev.status.batteryVoltage && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontSize: '0.72rem' }}>
                          Điện áp pin: {dev.status.batteryVoltage.toFixed(3)} V {dev.status.externalVoltage ? `(Nguồn ngoài: ${dev.status.externalVoltage.toFixed(3)} V)` : ''}
                        </Typography>
                      )}
                    </Box>

                    {/* GPS Fix Card */}
                    {isGpsFix ? (
                      <Box sx={{ p: 2, borderRadius: '12px', border: `1px solid ${glassBdr}`, bgcolor: isDark ? 'rgba(34,197,94,0.04)' : 'rgba(34,197,94,0.02)' }}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#22c55e' }}>GPS Đã Định Vị</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem' }}>
                          Tín hiệu GPS ổn định và đã khóa vị trí thành công.
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ p: 2, borderRadius: '12px', border: `1px solid ${glassBdr}`, bgcolor: isDark ? 'rgba(239,68,68,0.04)' : 'rgba(239,68,68,0.02)' }}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#ef4444' }}>Mất tín hiệu GPS</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem' }}>
                          Thiết bị hiện tại chưa bắt được sóng vị trí vệ tinh.
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                )}

                {activeTab === 'config' && (
                  <Stack spacing={2}>
                    {/* IMEI Identification */}
                    <Box sx={{ p: 2, borderRadius: '12px', border: `1px solid ${glassBdr}`, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.3, mb: 0.5 }}>
                            Số IMEI (Định danh thiết bị)
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: 1, fontFamily: 'monospace' }}>
                            {dev.uniqueId}
                          </Typography>
                        </Box>
                        <Tooltip title={copied ? "Đã sao chép!" : "Sao chép IMEI"}>
                          <IconButton
                            onClick={() => {
                              navigator.clipboard.writeText(dev.uniqueId);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            sx={{
                              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                              borderRadius: '10px',
                              color: copied ? '#22c55e' : 'text.secondary',
                              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }
                            }}
                          >
                            {copied ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>

                    {/* Model & Firmware */}
                    <Grid container spacing={1.5}>
                      <Grid item xs={6}>
                        <Box sx={{ p: 1.75, borderRadius: '12px', border: `1px solid ${glassBdr}`, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.3, mb: 0.5 }}>Model Thiết Bị</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>{dev.deviceType || 'VTC-G001'}</Typography>
                        </Box>
                      </Grid>
                      {dev.status.firmwareVersion && (
                        <Grid item xs={6}>
                          <Box sx={{ p: 1.75, borderRadius: '12px', border: `1px solid ${glassBdr}`, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.3, mb: 0.5 }}>Firmware Version</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>{dev.status.firmwareVersion}</Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>

                    {/* SIM and Network card */}
                    {dev.phoneNumber && (
                      <Box sx={{ p: 2, borderRadius: '12px', border: `1px solid ${glassBdr}`, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.3, mb: 0.4 }}>Số điện thoại SIM</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 800 }}>{dev.phoneNumber}</Typography>
                          </Box>
                          {carrier && (
                            <Chip
                              label={carrier}
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                borderRadius: '8px',
                                bgcolor: `${CARRIER_COLOR[carrier]}18`,
                                color: CARRIER_COLOR[carrier],
                                border: `1.5px solid ${CARRIER_COLOR[carrier]}35`
                              }}
                            />
                          )}
                        </Stack>
                        <Divider sx={{ my: 1.5, borderColor: glassBdr }} />
                        <Grid container spacing={1.5}>
                          {network.ipAddress && (
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.68rem', mb: 0.25 }}>Địa chỉ IP</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.82rem' }}>{network.ipAddress}</Typography>
                            </Grid>
                          )}
                          {network.cellTowerId && (
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.68rem', mb: 0.25 }}>BTS Cell ID</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.82rem' }}>{network.cellTowerId}</Typography>
                            </Grid>
                          )}
                          {network.networkDelay != null && (
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.68rem', mb: 0.25 }}>Độ trễ mạng (Ping)</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: '#22c55e', fontSize: '0.82rem' }}>{network.networkDelay} ms</Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    )}

                    {/* Geofence Card */}
                    {dev.assignedGeofenceId && (
                      <Box sx={{ p: 2, borderRadius: '12px', border: `1px solid ${glassBdr}`, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.3, mb: 0.4 }}>Vùng Geofence gán sẵn</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#f59e0b' }}>
                              {geofences.find((g) => g.id === dev.assignedGeofenceId)?.name || 'Khu vực được phép'}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            onClick={() => { setAssignGeofenceId(dev.assignedGeofenceId); setDetailDevice(null); }}
                            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
                          >
                            Thay đổi vùng
                          </Button>
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                )}

                {activeTab === 'offender' && (
                  <Box>
                    {dev.subject ? (
                      <Box sx={{ p: 2, borderRadius: '12px', border: `1px solid ${glassBdr}`, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                        <Stack direction="row" spacing={2.5} alignItems="center" mb={2}>
                          <Avatar
                            sx={{
                              bgcolor: dev.color,
                              width: 56,
                              height: 56,
                              fontSize: '1.25rem',
                              fontWeight: 700,
                              boxShadow: `0 4px 16px ${dev.color}40`,
                              border: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#fff'}`
                            }}
                          >
                            {dev.subject.fullName?.split(' ').slice(-1)[0]?.charAt(0) ?? '?'}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: isDark ? '#ffffff' : '#0f172a' }}>
                              {dev.subject.fullName}
                            </Typography>
                            {dev.subject.idNumber && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>
                                Số CCCD: {dev.subject.idNumber}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                        <Divider sx={{ my: 2, borderColor: glassBdr }} />
                        <Grid container spacing={2}>
                          {dev.subject.crime && (
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3, mb: 0.5 }}>Tội danh</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>{dev.subject.crime}</Typography>
                            </Grid>
                          )}
                          {dev.subject.sentence && (
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3, mb: 0.5 }}>Bản án</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>{dev.subject.sentence}</Typography>
                            </Grid>
                          )}
                          {(dev.subject.startDate || dev.subject.releaseDate) && (
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3, mb: 0.5 }}>Thời gian thi hành</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                Từ {dev.subject.startDate || '—'} đến {dev.subject.releaseDate || '—'}
                              </Typography>
                            </Grid>
                          )}
                          {dev.subject.notes && (
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3, mb: 0.5 }}>Ghi chú / Đặc điểm</Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', fontSize: '0.82rem' }}>{dev.subject.notes}</Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    ) : (
                      <Box sx={{ p: 4, borderRadius: '12px', border: `1px solid ${glassBdr}`, bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.005)', textAlign: 'center' }}>
                        <ShieldSecurity size={36} color={isDark ? '#64748b' : '#94a3b8'} style={{ marginBottom: 12, opacity: 0.7 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.75 }}>Thiết bị này chưa gán hồ sơ</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                          Vui lòng gán thiết bị này cho một phạm nhân để bắt đầu giám sát định vị hành trình và cảnh báo vi phạm Geofence.
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => { openEditDevice(dev); setDetailDevice(null); }}
                          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                        >
                          Gán hồ sơ ngay
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}
              </DialogContent>

              <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${glassBdr}`, gap: 1 }}>
                <Button
                  onClick={() => { setDashboardView('tracking'); setSelectedDeviceId(dev.id); setDetailDevice(null); }}
                  variant="outlined"
                  startIcon={<Location size={15} />}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '12px', fontSize: '0.875rem' }}
                >
                  Xem trên bản đồ
                </Button>
                <Button
                  onClick={() => setDetailDevice(null)}
                  variant="contained"
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '12px', fontSize: '0.875rem', background: `linear-gradient(135deg, ${store.primaryColor}, ${store.primaryColor}cc)` }}
                >
                  Đóng
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Stack>
  );
}
