import { useState, useMemo } from 'react';
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

interface DeviceManagementTableProps {
  isDark: boolean;
  store: TrackingStore;
  setDashboardView: (view: 'overview' | 'tracking' | 'devices' | 'prisoners' | 'sims') => void;
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

const glassKpiCard = (accent: string, isDark: boolean) => ({
  p: 2.5,
  borderRadius: '16px',
  border: `1px solid ${isDark ? `${accent}22` : `${accent}18`}`,
  background: isDark
    ? `linear-gradient(135deg, ${accent}18 0%, ${accent}06 100%), rgba(9,13,31,0.55)`
    : `linear-gradient(135deg, ${accent}0d 0%, ${accent}04 100%), rgba(255,255,255,0.75)`,
  backdropFilter: 'blur(20px) saturate(1.8)',
  WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
  boxShadow: `0 4px 24px ${accent}20, 0 1px 0 inset rgba(255,255,255,0.12)`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  cursor: 'default',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0, left: '10%', right: '10%', height: '1px',
    background: `linear-gradient(90deg, transparent, ${accent}80, transparent)`,
  },
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 12px 40px ${accent}30, 0 4px 16px rgba(0,0,0,0.1)`,
  },
});

// ── Main component ─────────────────────────────────────────────────────────────

export default function DeviceManagementTable({ isDark, store, setDashboardView }: DeviceManagementTableProps) {
  const {
    devices, geofences, deviceViolations,
    openEditDevice, setAddDeviceOpen, setRemoveConfirmId,
    setAssignGeofenceId, setSubjectDetailId, setSelectedDeviceId,
  } = store;

  const [deviceSearch, setDeviceSearch]       = useState('');
  const [connectionFilter, setConnectionFilter] = useState<string>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('all');
  const [detailDevice, setDetailDevice]         = useState<any | null>(null);
  const [menuAnchor, setMenuAnchor]             = useState<{ el: HTMLElement; devId: string } | null>(null);

  const stats = useMemo(() => ({
    total:      devices.length,
    online:     devices.filter((d) => d.status.connectionStatus === 'online').length,
    violating:  devices.filter((d) => deviceViolations[d.id]).length,
    lowBattery: devices.filter((d) => d.status.battery < 20).length,
  }), [devices, deviceViolations]);

  const filteredDeviceTable = useMemo(() => devices.filter((d) => {
    const q = deviceSearch.toLowerCase();
    const matchSearch = !deviceSearch
      || d.name.toLowerCase().includes(q)
      || d.uniqueId.includes(q)
      || d.phoneNumber.includes(q)
      || (d.subject?.fullName.toLowerCase().includes(q) ?? false);
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
            <Box sx={glassKpiCard(kpi.accent, isDark)}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    {kpi.label}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.75 }}>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: kpi.accent, lineHeight: 1 }}>
                      {kpi.value}
                    </Typography>
                    {kpi.live && (
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e', boxShadow: '0 0 10px #22c55e', animation: 'pulse 2s infinite' }} />
                    )}
                    {kpi.blink && kpi.value > 0 && (
                      <Box className="gs-blink" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, fontSize: '0.7rem' }}>
                    {kpi.label === 'Tổng thiết bị' ? `${stats.online} đang hoạt động` :
                     kpi.label === 'Thiết bị Trực tuyến' ? `${stats.total - stats.online} ngoại tuyến` :
                     kpi.label === 'Vi phạm Geofence' ? (stats.violating > 0 ? 'Cần xử lý ngay' : 'Không có vi phạm') :
                     (stats.lowBattery > 0 ? 'Cần sạc thiết bị' : 'Pin ổn định')}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: `${kpi.accent}1a`,
                    color: kpi.accent,
                    width: 48, height: 48,
                    border: `1.5px solid ${kpi.accent}30`,
                    boxShadow: `0 4px 16px ${kpi.accent}25`,
                  }}
                >
                  {kpi.icon}
                </Avatar>
              </Stack>
            </Box>
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
                  sx: { fontSize: '0.825rem', borderRadius: '10px', bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' },
                }}
                sx={{ width: 210 }}
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
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        borderRadius: '8px',
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
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        borderRadius: '8px',
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
              startIcon={<Add size={16} />}
              onClick={() => setAddDeviceOpen(true)}
              sx={{
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.8rem',
                borderRadius: '10px',
                py: 0.9,
                px: 2.25,
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
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '0.7rem',
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
              {filteredDeviceTable.map((dev, rowIdx) => {
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
                    <td style={{ padding: '14px 16px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`, borderLeft: `3px solid ${isViolating ? '#ef4444' : 'transparent'}` }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ position: 'relative', flexShrink: 0 }}>
                          <Avatar sx={{ bgcolor: `${dev.color}22`, color: dev.color, width: 34, height: 34, fontSize: '0.8rem', fontWeight: 800, border: `1.5px solid ${dev.color}44` }}>
                            {dev.name.slice(0, 2).toUpperCase()}
                          </Avatar>
                          <Box sx={{ position: 'absolute', bottom: -1, right: -1, width: 9, height: 9, borderRadius: '50%', bgcolor: statusColor, border: `1.5px solid ${isDark ? '#0d1224' : '#fff'}`, boxShadow: `0 0 6px ${statusColor}` }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.88rem', color: isDark ? '#f1f5f9' : '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {dev.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', fontWeight: 600 }}>
                            {dev.deviceType} ({dev.status.firmwareVersion || 'V1.0.0'})
                          </Typography>
                        </Box>
                      </Stack>
                    </td>

                    {/* IMEI */}
                    <td style={{ padding: '14px 16px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', display: 'block', letterSpacing: 0.5 }}>
                        {dev.uniqueId}
                      </Typography>
                    </td>

                    {/* SIM */}
                    <td style={{ padding: '14px 16px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
                      {dev.phoneNumber ? (
                        <Stack spacing={0.5}>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>{dev.phoneNumber}</Typography>
                          {carrier && (
                            <Chip
                              label={carrier}
                              size="small"
                              sx={{
                                height: 17, fontSize: '0.65rem', fontWeight: 700, borderRadius: '5px', alignSelf: 'flex-start',
                                bgcolor: `${CARRIER_COLOR[carrier]}12`,
                                color: CARRIER_COLOR[carrier],
                                border: `1px solid ${CARRIER_COLOR[carrier]}25`,
                              }}
                            />
                          )}
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.73rem', fontStyle: 'italic' }}>Chưa lắp SIM</Typography>
                      )}
                    </td>

                    {/* Subject */}
                    <td style={{ padding: '14px 16px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
                      {dev.subject ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ bgcolor: dev.color, width: 26, height: 26, fontSize: '0.72rem', fontWeight: 800, boxShadow: `0 0 8px ${dev.color}50`, flexShrink: 0 }}>
                            {dev.subject.fullName.split(' ').slice(-1)[0]?.charAt(0) ?? '?'}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              onClick={() => setSubjectDetailId(dev.id)}
                              sx={{ fontWeight: 700, fontSize: '0.82rem', color: 'primary.main', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', '&:hover': { textDecoration: 'underline' } }}
                            >
                              {dev.subject.fullName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.67rem' }}>
                              CCCD: {dev.subject.idNumber || '—'}
                            </Typography>
                          </Box>
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.73rem', fontStyle: 'italic' }}>Chưa gán hồ sơ</Typography>
                      )}
                    </td>

                    {/* Battery */}
                    <td style={{ padding: '14px 16px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
                      <Stack spacing={0.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                          <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.82rem', color: isLowBattery ? '#ef4444' : 'text.primary' }}>
                            {isLowBattery && '⚠ '}{dev.status.battery}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                            {dev.status.batteryVoltage ? `${dev.status.batteryVoltage.toFixed(2)}V` : '—'}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={dev.status.battery}
                          sx={{
                            height: 4, borderRadius: 2,
                            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 2,
                              bgcolor: isLowBattery ? '#ef4444' : dev.status.battery > 50 ? '#22c55e' : '#f59e0b',
                            },
                          }}
                        />
                      </Stack>
                    </td>

                    {/* Signal */}
                    <td style={{ padding: '14px 16px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <SignalBars strength={dev.status.signalStrength} />
                        <Typography variant="caption" sx={{ fontSize: '0.68rem', color: 'text.secondary', fontWeight: 600 }}>
                          {dev.status.signalStrength}/4
                        </Typography>
                      </Stack>
                    </td>

                    {/* Status badge */}
                    <td style={{ padding: '14px 16px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
                      <Box
                        sx={{
                          display: 'inline-flex', alignItems: 'center', gap: 0.75,
                          px: 1.25, py: 0.5, borderRadius: '20px',
                          fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase',
                          bgcolor: `${statusColor}14`,
                          color: statusColor,
                          border: `1px solid ${statusColor}35`,
                          boxShadow: (isOnline || isViolating) ? `0 0 10px ${statusColor}20` : 'none',
                        }}
                      >
                        <Box
                          className={isViolating ? 'gs-blink' : ''}
                          sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusColor, boxShadow: (isOnline || isViolating) ? `0 0 6px ${statusColor}` : 'none' }}
                        />
                        {statusLabel}
                      </Box>
                    </td>

                    {/* Actions — kebab menu */}
                    <td style={{ padding: '14px 16px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`, textAlign: 'right' }}>
                      <Tooltip title="Tùy chọn">
                        <IconButton
                          size="small"
                          onClick={(e) => setMenuAnchor({ el: e.currentTarget, devId: dev.id })}
                          sx={{
                            borderRadius: '8px',
                            width: 30, height: 30,
                            bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                            color: 'text.secondary',
                            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', color: store.primaryColor },
                          }}
                        >
                          <More size={16} />
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
              <Avatar sx={{ bgcolor: `${menuDevice.color}22`, color: menuDevice.color, width: 28, height: 28, fontSize: '0.7rem', fontWeight: 800, border: `1.5px solid ${menuDevice.color}44` }}>
                {menuDevice.name.slice(0, 2).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.8rem', display: 'block', color: isDark ? '#f1f5f9' : '#0f172a' }}>
                  {menuDevice.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  {menuDevice.uniqueId.slice(0, 12)}…
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
          const network = getDeviceNetwork(detailDevice.uniqueId);
          const carrier = getCarrierInfo(detailDevice.phoneNumber);
          const isGpsFix = detailDevice.status.gpsFix;

          const Section = ({ title, color, children }: { title: string; color: string; children: React.ReactNode }) => (
            <Box>
              <Stack direction="row" spacing={0.75} alignItems="center" mb={1.75}>
                <Box sx={{ width: 3, height: 16, borderRadius: 1, bgcolor: color }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, fontSize: '0.68rem', color }} >
                  {title}
                </Typography>
              </Stack>
              {children}
            </Box>
          );

          const Stat = ({ label, value, mono = false, color }: { label: string; value: string; mono?: boolean; color?: string }) => (
            <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)', border: `1px solid ${glassBdr}` }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, mb: 0.4 }}>
                {label}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.85rem', fontFamily: mono ? 'monospace' : undefined, color: color || (isDark ? '#f1f5f9' : '#0f172a') }}>
                {value}
              </Typography>
            </Box>
          );

          return (
            <>
              {/* Glass header */}
              <Box
                sx={{
                  px: 3, py: 2.5,
                  background: isDark
                    ? `linear-gradient(135deg, ${detailDevice.color}22, ${detailDevice.color}08)`
                    : `linear-gradient(135deg, ${detailDevice.color}12, ${detailDevice.color}04)`,
                  borderBottom: `1px solid ${glassBdr}`,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: `${detailDevice.color}22`, color: detailDevice.color, width: 44, height: 44, fontSize: '1rem', fontWeight: 900, border: `2px solid ${detailDevice.color}44`, boxShadow: `0 4px 16px ${detailDevice.color}30` }}>
                      {detailDevice.name.slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: isDark ? '#f1f5f9' : '#0f172a', lineHeight: 1.2 }}>
                        {detailDevice.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                        {detailDevice.deviceType} · FW {detailDevice.status.firmwareVersion || 'V1.18d0609'}
                      </Typography>
                    </Box>
                  </Stack>
                  <IconButton size="small" onClick={() => setDetailDevice(null)} sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444' } }}>
                    <CloseCircle size={20} />
                  </IconButton>
                </Stack>
              </Box>

              <DialogContent sx={{ px: 3, py: 2.5 }}>
                <Stack spacing={3}>
                  {/* Hardware ID */}
                  <Section title="Định danh phần cứng" color={store.primaryColor}>
                    <Grid container spacing={1.5}>
                      <Grid item xs={6}><Stat label="Số IMEI" value={detailDevice.uniqueId} mono /></Grid>
                      <Grid item xs={6}><Stat label="Model thiết bị" value={detailDevice.deviceType} /></Grid>
                      <Grid item xs={6}><Stat label="Phiên bản Firmware" value={detailDevice.status.firmwareVersion || 'V1.18d0609'} mono /></Grid>
                      <Grid item xs={6}><Stat label="Vùng Geofence" value={geofences.find((g) => g.id === detailDevice.assignedGeofenceId)?.name || 'Chưa gán vùng'} /></Grid>
                    </Grid>
                  </Section>

                  {/* GPS */}
                  <Section title="Định vị vệ tinh (GPS)" color="#22c55e">
                    <Grid container spacing={1.5}>
                      <Grid item xs={6}>
                        <Stat
                          label="Trạng thái Fix GPS"
                          value={isGpsFix ? '✓ Đã định vị' : '✗ Mất tín hiệu'}
                          color={isGpsFix ? '#22c55e' : '#ef4444'}
                        />
                      </Grid>
                      <Grid item xs={6}><Stat label="Số vệ tinh kết nối" value={`${detailDevice.status.satelliteCount || 0} vệ tinh`} /></Grid>
                      <Grid item xs={6}><Stat label="Độ sai số vị trí" value={`±${detailDevice.status.gpsAccuracy || 0} mét`} /></Grid>
                      <Grid item xs={6}><Stat label="Vận tốc di chuyển" value={`${detailDevice.status.speed || 0} km/h`} /></Grid>
                      <Grid item xs={6}><Stat label="Độ cao (Altitude)" value={`${detailDevice.status.altitude || 0} mét`} /></Grid>
                    </Grid>
                  </Section>

                  {/* GSM & Power */}
                  <Section title="Mạng di động & Nguồn điện (GSM)" color="#f59e0b">
                    <Grid container spacing={1.5}>
                      <Grid item xs={6}><Stat label="Nhà mạng / SIM" value={carrier ? `${carrier} · ${detailDevice.phoneNumber}` : 'Chưa lắp SIM'} /></Grid>
                      <Grid item xs={6}><Stat label="Địa chỉ IP" value={network.ipAddress} mono /></Grid>
                      <Grid item xs={6}><Stat label="Mã trạm BTS (Cell ID)" value={network.cellTowerId} mono /></Grid>
                      <Grid item xs={6}><Stat label="Độ trễ mạng (Ping)" value={`${network.networkDelay} ms`} color="#22c55e" /></Grid>
                      <Grid item xs={6}><Stat label="Điện áp Pin" value={detailDevice.status.batteryVoltage ? `${detailDevice.status.batteryVoltage.toFixed(3)} V` : '—'} /></Grid>
                      <Grid item xs={6}><Stat label="Nguồn điện ngoài" value={detailDevice.status.externalVoltage ? `${detailDevice.status.externalVoltage.toFixed(3)} V` : '—'} /></Grid>
                    </Grid>
                  </Section>
                </Stack>
              </DialogContent>

              <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${glassBdr}`, gap: 1 }}>
                <Button
                  onClick={() => { setDashboardView('tracking'); setSelectedDeviceId(detailDevice.id); setDetailDevice(null); }}
                  variant="outlined"
                  startIcon={<Location size={15} />}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', fontSize: '0.8rem' }}
                >
                  Xem trên bản đồ
                </Button>
                <Button
                  onClick={() => setDetailDevice(null)}
                  variant="contained"
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', fontSize: '0.8rem', background: `linear-gradient(135deg, ${store.primaryColor}, ${store.primaryColor}cc)` }}
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
