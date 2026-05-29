import { useState, useMemo } from 'react';
import {
  Paper,
  Stack,
  TextField,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Grid,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { SearchNormal1, Add, Wifi, Map as MapIcon, Gps, Edit, Trash, InfoCircle, Cpu } from 'iconsax-react';
import { TrackingStore } from '../../tracking/useTracking';

interface DeviceManagementTableProps {
  isDark: boolean;
  store: TrackingStore;
  setDashboardView: (view: 'overview' | 'tracking' | 'devices' | 'prisoners' | 'sims') => void;
}

// Visual cell signal bars component mimicking smartphone status
const SignalBars = ({ strength }: { strength: number }) => {
  return (
    <Stack direction="row" spacing={0.4} alignItems="flex-end" sx={{ height: 16, width: 22 }}>
      {[1, 2, 3, 4].map((bar) => {
        const active = bar <= strength;
        let color = '#64748b'; // default inactive
        if (active) {
          if (strength <= 1) color = '#ef4444'; // weak
          else if (strength === 2) color = '#f59e0b'; // medium
          else color = '#22c55e'; // strong
        }
        return (
          <Box
            key={bar}
            sx={{
              width: 3.5,
              height: bar * 4,
              bgcolor: color,
              borderRadius: '1px',
              transition: 'background-color 0.25s ease'
            }}
          />
        );
      })}
    </Stack>
  );
};

export default function DeviceManagementTable({ isDark, store, setDashboardView }: DeviceManagementTableProps) {
  const {
    devices,
    geofences,
    deviceViolations,
    openEditDevice,
    setAddDeviceOpen,
    setRemoveConfirmId,
    setAssignGeofenceId,
    setSubjectDetailId,
    setSelectedDeviceId
  } = store;

  // Search and Filter states
  const [deviceSearch, setDeviceSearch] = useState('');
  const [connectionFilter, setConnectionFilter] = useState<string>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('all');

  // Detail Modal target device
  const [detailDevice, setDetailDevice] = useState<any | null>(null);

  // Helper to derive carrier info from phone number
  const getCarrierInfo = (num: string) => {
    if (!num) return null;
    let carrier = 'Viettel';
    if (num.startsWith('+8490') || num.startsWith('090') || num.startsWith('093') || num.startsWith('+8493')) carrier = 'Mobifone';
    else if (num.startsWith('+8491') || num.startsWith('091') || num.startsWith('088') || num.startsWith('+8488')) carrier = 'Vinaphone';
    return carrier;
  };

  // Helper to derive mock IP and Cell Tower details consistently
  const getDeviceNetwork = (uniqueId: string) => {
    let hash = 0;
    for (let i = 0; i < uniqueId.length; i++) {
      hash = uniqueId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const ipAddress = `10.142.${Math.abs(hash % 254) + 1}.${Math.abs((hash >> 4) % 254) + 1}`;
    const cellTowerId = `452-04-182${Math.abs(hash % 90) + 10}`;
    const networkDelay = 18 + Math.abs(hash % 50); // 18 to 68 ms
    return { ipAddress, cellTowerId, networkDelay };
  };

  // KPI Metrics derivation
  const stats = useMemo(() => {
    const total = devices.length;
    const online = devices.filter((d) => d.status.connectionStatus === 'online').length;
    const violating = devices.filter((d) => deviceViolations[d.id]).length;
    const lowBattery = devices.filter((d) => d.status.battery < 20).length;
    return { total, online, violating, lowBattery };
  }, [devices, deviceViolations]);

  // Combined Filters Logic
  const filteredDeviceTable = useMemo(() => {
    return devices.filter((d) => {
      // 1. Search Query filter
      const q = deviceSearch.toLowerCase();
      const matchSearch =
        !deviceSearch ||
        d.name.toLowerCase().includes(q) ||
        d.uniqueId.includes(q) ||
        d.phoneNumber.includes(q) ||
        (d.subject?.fullName.toLowerCase().includes(q) ?? false);

      // 2. Connection Status filter
      const conn = d.status.connectionStatus;
      const isViolating = deviceViolations[d.id];
      let matchConnection = true;
      if (connectionFilter === 'online') matchConnection = conn === 'online';
      else if (connectionFilter === 'offline') matchConnection = conn === 'offline';
      else if (connectionFilter === 'warning') matchConnection = !!isViolating;

      // 3. Assignment status filter
      let matchAssignment = true;
      if (assignmentFilter === 'assigned') matchAssignment = d.subject !== null;
      else if (assignmentFilter === 'unassigned') matchAssignment = d.subject === null;

      return matchSearch && matchConnection && matchAssignment;
    });
  }, [devices, deviceSearch, connectionFilter, assignmentFilter, deviceViolations]);

  return (
    <Stack spacing={3}>
      {/* ═══ DEVICES KPI PANEL ════════════════════════════════════════ */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              background: isDark
                ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(37, 99, 235, 0.04) 100%)'
                : 'linear-gradient(135deg, rgba(37, 99, 235, 0.04) 0%, rgba(37, 99, 235, 0.01) 100%)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'none',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                bgcolor: '#2563eb'
              }
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  Tổng lượng thiết bị
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  {stats.total}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(37, 99, 235, 0.15)', color: '#2563eb', width: 44, height: 44 }}>
                <Cpu size={22} variant="Bold" />
              </Avatar>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              background: isDark
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.04) 100%)'
                : 'linear-gradient(135deg, rgba(34, 197, 94, 0.04) 0%, rgba(34, 197, 94, 0.01) 100%)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'none',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                bgcolor: '#22c55e'
              }
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  Thiết bị Trực tuyến
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  {stats.online}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', width: 44, height: 44 }}>
                <Wifi size={22} variant="Bold" />
              </Avatar>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              background: isDark
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.04) 100%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.04) 0%, rgba(239, 68, 68, 0.01) 100%)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'none',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                bgcolor: '#ef4444'
              }
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  Thiết bị Vi phạm Geofence
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  {stats.violating}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', width: 44, height: 44 }}>
                <Gps size={22} variant="Bold" />
              </Avatar>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              background: isDark
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.04) 100%)'
                : 'linear-gradient(135deg, rgba(245, 158, 11, 0.04) 0%, rgba(245, 158, 11, 0.01) 100%)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'none',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                bgcolor: '#f59e0b'
              }
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  Cảnh báo Pin yếu (&lt; 20%)
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  {stats.lowBattery}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', width: 44, height: 44 }}>
                <InfoCircle size={22} variant="Bold" />
              </Avatar>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* ═══ FILTERS & SEARCH CONTROLS PANEL ══════════════════════════ */}
      <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" mb={2.5} flexWrap="wrap" gap={1.5}>
          <Stack direction="row" spacing={2} flexWrap="wrap" gap={1.5} alignItems="center">
            <TextField
              size="small"
              placeholder="Tìm thiết bị, IMEI, SĐT..."
              value={deviceSearch}
              onChange={(e) => setDeviceSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchNormal1 size={18} style={{ marginRight: 6, color: '#94a3b8' }} />,
                sx: { fontSize: '0.825rem', borderRadius: 1.5 }
              }}
              sx={{ width: 220 }}
            />

            {/* Connection filter chips */}
            <Stack direction="row" spacing={0.75} alignItems="center">
              {[
                { key: 'all', label: 'Tất cả trạng thái' },
                { key: 'online', label: 'Trực tuyến' },
                { key: 'offline', label: 'Ngoại tuyến' },
                { key: 'warning', label: 'Đang vi phạm' }
              ].map((st) => (
                <Chip
                  key={st.key}
                  label={st.label}
                  onClick={() => setConnectionFilter(st.key)}
                  variant={connectionFilter === st.key ? 'filled' : 'outlined'}
                  color={connectionFilter === st.key ? 'primary' : 'default'}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.725rem',
                    borderRadius: 1,
                    cursor: 'pointer'
                  }}
                />
              ))}
            </Stack>

            {/* Assignment filter chips */}
            <Stack direction="row" spacing={0.75} alignItems="center">
              {[
                { key: 'all', label: 'Tất cả đối tượng' },
                { key: 'assigned', label: 'Đã gán người đeo' },
                { key: 'unassigned', label: 'Chưa gán' }
              ].map((as) => (
                <Chip
                  key={as.key}
                  label={as.label}
                  onClick={() => setAssignmentFilter(as.key)}
                  variant={assignmentFilter === as.key ? 'filled' : 'outlined'}
                  color={assignmentFilter === as.key ? 'secondary' : 'default'}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.725rem',
                    borderRadius: 1,
                    cursor: 'pointer'
                  }}
                />
              ))}
            </Stack>
          </Stack>

          <Button
            variant="contained"
            color="primary"
            startIcon={<Add size={16} />}
            onClick={() => setAddDeviceOpen(true)}
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.8rem',
              borderRadius: 1.5,
              py: 0.8,
              px: 2
            }}
          >
            Thêm thiết bị mới
          </Button>
        </Stack>

        {/* ═══ TABLE COMPONENT ════════════════════════════════════════ */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.725rem',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    py: 1.5,
                    letterSpacing: '0.05em'
                  }}
                >
                  Tên thiết bị & Model
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.725rem',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    py: 1.5,
                    letterSpacing: '0.05em'
                  }}
                >
                  Số IMEI
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.725rem',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    py: 1.5,
                    letterSpacing: '0.05em'
                  }}
                >
                  SIM liên kết
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.725rem',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    py: 1.5,
                    letterSpacing: '0.05em'
                  }}
                >
                  Đối tượng đeo (Prisoner)
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.725rem',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    py: 1.5,
                    letterSpacing: '0.05em'
                  }}
                >
                  Dung lượng Pin
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.725rem',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    py: 1.5,
                    letterSpacing: '0.05em'
                  }}
                >
                  Cột sóng
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.725rem',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    py: 1.5,
                    letterSpacing: '0.05em'
                  }}
                >
                  Trạng thái
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.725rem',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    py: 1.5,
                    letterSpacing: '0.05em'
                  }}
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDeviceTable.map((dev) => {
                const isViolating = deviceViolations[dev.id];
                const conn = dev.status.connectionStatus;
                const carrier = getCarrierInfo(dev.phoneNumber);
                const isLowBattery = dev.status.battery < 20;

                return (
                  <TableRow key={dev.id} hover sx={{ transition: 'all 0.2s ease' }}>
                    {/* Device Name and Model */}
                    <TableCell sx={{ py: 1.8 }}>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: dev.color,
                            boxShadow: `0 0 8px ${dev.color}`
                          }}
                        />
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 800, fontSize: '0.925rem', color: isDark ? '#f8fafc' : '#0f172a' }}>
                            {dev.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', fontSize: '0.7rem', fontWeight: 600 }}
                          >
                            {dev.deviceType} ({dev.status.firmwareVersion || 'V1.0.0'})
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* Monospace IMEI */}
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary', py: 1.8 }}>
                      {dev.uniqueId}
                    </TableCell>

                    {/* Linked SIM Card info */}
                    <TableCell sx={{ py: 1.8 }}>
                      {dev.phoneNumber ? (
                        <Stack spacing={0.5}>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                            {dev.phoneNumber}
                          </Typography>
                          {carrier && (
                            <Chip
                              avatar={
                                <Avatar
                                  sx={{
                                    bgcolor: carrier === 'Viettel' ? '#ef4444' : carrier === 'Vinaphone' ? '#3b82f6' : '#f97316',
                                    color: '#ffffff !important',
                                    fontWeight: 800,
                                    fontSize: '0.6rem',
                                    width: 14,
                                    height: 14
                                  }}
                                >
                                  {carrier.charAt(0)}
                                </Avatar>
                              }
                              label={carrier}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.68rem',
                                height: 16,
                                borderRadius: 0.5,
                                alignSelf: 'flex-start',
                                bgcolor:
                                  carrier === 'Viettel'
                                    ? 'rgba(239, 68, 68, 0.08)'
                                    : carrier === 'Vinaphone'
                                    ? 'rgba(59, 130, 246, 0.08)'
                                    : 'rgba(249, 115, 22, 0.08)',
                                color: carrier === 'Viettel' ? '#ef4444' : carrier === 'Vinaphone' ? '#3b82f6' : '#f97316',
                                border: '1px solid',
                                borderColor:
                                  carrier === 'Viettel'
                                    ? 'rgba(239, 68, 68, 0.15)'
                                    : carrier === 'Vinaphone'
                                    ? 'rgba(59, 130, 246, 0.15)'
                                    : 'rgba(249, 115, 22, 0.15)'
                              }}
                            />
                          )}
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                          Chưa lắp SIM
                        </Typography>
                      )}
                    </TableCell>

                    {/* Prisoner Wearer Details */}
                    <TableCell sx={{ py: 1.8 }}>
                      {dev.subject ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: dev.color,
                              width: 28,
                              height: 28,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              boxShadow: `0 0 8px ${dev.color}40`,
                              border: '1px solid',
                              borderColor: 'rgba(255,255,255,0.1)'
                            }}
                          >
                            {dev.subject.fullName.split(' ').slice(-1)[0]?.charAt(0) ?? '?'}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              onClick={() => setSubjectDetailId(dev.id)}
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                color: 'primary.main',
                                cursor: 'pointer',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                            >
                              {dev.subject.fullName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                              CCCD: {dev.subject.idNumber || '—'}
                            </Typography>
                          </Box>
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                          Chưa gán hồ sơ
                        </Typography>
                      )}
                    </TableCell>

                    {/* Battery progress and power */}
                    <TableCell sx={{ py: 1.8, minWidth: 120 }}>
                      <Stack spacing={0.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              color: isLowBattery ? '#ef4444' : 'text.primary',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.25
                            }}
                          >
                            {isLowBattery && '⚠️ '}
                            {dev.status.battery}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                            {dev.status.batteryVoltage ? `${dev.status.batteryVoltage.toFixed(2)} V` : 'Nguồn ngoài'}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={dev.status.battery}
                          sx={{
                            height: 5,
                            borderRadius: 2.5,
                            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 2.5,
                              bgcolor: isLowBattery ? '#ef4444' : dev.status.battery > 50 ? '#22c55e' : '#f59e0b'
                            }
                          }}
                        />
                      </Stack>
                    </TableCell>

                    {/* Cell signal column bars */}
                    <TableCell sx={{ py: 1.8 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <SignalBars strength={dev.status.signalStrength} />
                        <Typography variant="caption" sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600 }}>
                          {dev.status.signalStrength}/4 vạch
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Connection & geofence violating status */}
                    <TableCell sx={{ py: 1.8 }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.8,
                          px: 1.2,
                          py: 0.5,
                          borderRadius: '20px',
                          fontWeight: 700,
                          fontSize: '0.725rem',
                          textTransform: 'uppercase',
                          bgcolor: isViolating
                            ? 'rgba(239, 68, 68, 0.12)'
                            : conn === 'online'
                            ? 'rgba(34, 197, 94, 0.12)'
                            : conn === 'offline'
                            ? 'rgba(100, 116, 139, 0.12)'
                            : 'rgba(245, 158, 11, 0.12)',
                          color: isViolating ? '#ef4444' : conn === 'online' ? '#22c55e' : conn === 'offline' ? '#64748b' : '#f59e0b',
                          border: '1px solid',
                          borderColor: isViolating
                            ? 'rgba(239, 68, 68, 0.3)'
                            : conn === 'online'
                            ? 'rgba(34, 197, 94, 0.3)'
                            : conn === 'offline'
                            ? 'rgba(100, 116, 139, 0.3)'
                            : 'rgba(245, 158, 11, 0.3)',
                          boxShadow: isViolating
                            ? '0 0 10px rgba(239, 68, 68, 0.15)'
                            : conn === 'online'
                            ? '0 0 10px rgba(34, 197, 94, 0.15)'
                            : 'none'
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: isViolating ? '#ef4444' : conn === 'online' ? '#22c55e' : conn === 'offline' ? '#64748b' : '#f59e0b',
                            boxShadow: isViolating ? '0 0 6px #ef4444' : conn === 'online' ? '0 0 6px #22c55e' : 'none'
                          }}
                        />
                        {isViolating ? 'Vi phạm' : conn === 'online' ? 'Online' : conn === 'offline' ? 'Offline' : 'Chập chờn'}
                      </Box>
                    </TableCell>

                    {/* Actions Panel */}
                    <TableCell align="right" sx={{ py: 1.8 }}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Chi tiết viễn thông & vệ tinh">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => setDetailDevice(dev)}
                            sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                          >
                            <InfoCircle size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xem định vị trên bản đồ">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setDashboardView('tracking');
                              setSelectedDeviceId(dev.id);
                            }}
                            sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                          >
                            <MapIcon size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Gán vùng ranh giới Geofence">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => setAssignGeofenceId(dev.assignedGeofenceId || geofences[0]?.id)}
                            sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', mx: 0.25 }}
                          >
                            <Gps size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa cấu hình">
                          <IconButton
                            size="small"
                            onClick={() => openEditDevice(dev)}
                            sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                          >
                            <Edit size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa thiết bị">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setRemoveConfirmId(dev.id)}
                            sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                          >
                            <Trash size={16} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ═══ INTERACTIVE DEVICE TELEMETRY SPECS DIALOG ════════════════ */}
      <Dialog open={Boolean(detailDevice)} onClose={() => setDetailDevice(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Báo cáo Chỉ số Kỹ thuật & Viễn thông Ankle Monitor</DialogTitle>
        <DialogContent>
          {detailDevice && (
            <Stack spacing={3} sx={{ mt: 2 }}>
              {/* Device and Model */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Tên thiết bị
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800 }}>
                    {detailDevice.name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Model phần cứng
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {detailDevice.deviceType}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Số IMEI thiết bị
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                    {detailDevice.uniqueId}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Phiên bản Firmware
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                    {detailDevice.status.firmwareVersion || 'V1.18d0609'}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />

              {/* GPS Telemetry */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                Thông số định vị vệ tinh (GPS Telemetry)
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Trạng thái Fix GPS
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: detailDevice.status.gpsFix ? '#22c55e' : '#ef4444',
                        boxShadow: detailDevice.status.gpsFix ? '0 0 6px #22c55e' : '0 0 6px #ef4444'
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {detailDevice.status.gpsFix ? 'Có tín hiệu định vị' : 'Mất tín hiệu định vị'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Số lượng vệ tinh kết nối
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {detailDevice.status.satelliteCount || 0} vệ tinh
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Độ sai số vị trí (GPS Accuracy)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {detailDevice.status.gpsAccuracy || 0} mét
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Hạn ranh giới (Geofence)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {geofences.find((g) => g.id === detailDevice.assignedGeofenceId)?.name || 'Chưa gán vùng'}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />

              {/* Cellular & Power telemetry */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                Mạng di động & Nguồn điện (GSM & Power Telemetry)
              </Typography>

              {(() => {
                const network = getDeviceNetwork(detailDevice.uniqueId);
                const carrier = getCarrierInfo(detailDevice.phoneNumber);
                return (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Nhà mạng & Số điện thoại SIM
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {carrier ? `${carrier} (${detailDevice.phoneNumber})` : 'Chưa lắp SIM'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Địa chỉ IP gán
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {network.ipAddress}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Mã trạm sóng BTS (Cell ID)
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {network.cellTowerId}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Độ trễ truyền tải mạng (Ping)
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#22c55e' }}>
                        {network.networkDelay} ms
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Điện áp Pin (Battery Voltage)
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {detailDevice.status.batteryVoltage ? `${detailDevice.status.batteryVoltage.toFixed(3)} V` : '—'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Điện áp nguồn ngoài (External Voltage)
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {detailDevice.status.externalVoltage ? `${detailDevice.status.externalVoltage.toFixed(3)} V` : '—'}
                      </Typography>
                    </Grid>
                  </Grid>
                );
              })()}

              <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />

              {/* Speed & Altitude */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Chỉ số Vận động cơ thể (Kinematic Telemetry)
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Vận tốc di chuyển
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {detailDevice.status.speed || 0} km/h
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Độ cao hiện tại (Altitude)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {detailDevice.status.altitude || 0} mét
                  </Typography>
                </Grid>
              </Grid>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDetailDevice(null)} variant="contained" color="primary" sx={{ textTransform: 'none', fontWeight: 700 }}>
            Đóng báo cáo
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
