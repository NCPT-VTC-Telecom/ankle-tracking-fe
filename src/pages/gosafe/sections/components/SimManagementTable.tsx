import { useState, useMemo } from 'react';
import {
  Paper,
  Stack,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Grid,
  Avatar,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import { SearchNormal1, Wifi, Map as MapIcon, Add, Wallet, Warning2, InfoCircle } from 'iconsax-react';
import { TrackingStore } from '../../tracking/useTracking';
import { unassignedSims, UnassignedSim } from './mockData';

interface SimManagementTableProps {
  isDark: boolean;
  store: TrackingStore;
  setDashboardView: (view: 'overview' | 'tracking' | 'devices' | 'prisoners' | 'sims') => void;
}

interface SimCardItem {
  phoneNumber: string;
  carrier: string;
  iccid: string;
  status: string;
  deviceName: string;
  deviceId: string | null;
  signal: number;
  balance: number;
  dataUsed: number;
  dataLimit: number;
  expiryDays: number;
  networkDelay: number;
  ipAddress: string;
  cellTowerId: string;
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

// Mock function for device dynamic SIM metrics
const getMockSimDetails = (phoneNumber: string, deviceId: string) => {
  let hash = 0;
  for (let i = 0; i < phoneNumber.length; i++) {
    hash = phoneNumber.charCodeAt(i) + ((hash << 5) - hash);
  }
  const balance = 15000 + Math.abs(hash % 345000); // 15,000 to 360,000 VND
  const dataUsed = 1.0 + Math.abs(hash % 38) / 10; // 1.0 to 4.8 GB
  const dataLimit = 5.0; // 5.0 GB limit
  const expiryDays = 10 + Math.abs(hash % 160); // 10 to 170 days left
  const networkDelay = 18 + Math.abs(hash % 50); // 18 to 68 ms
  const ipAddress = `10.142.${Math.abs(hash % 254) + 1}.${Math.abs((hash >> 4) % 254) + 1}`;
  const cellTowerId = `452-04-182${Math.abs(hash % 90) + 10}`;
  return { balance, dataUsed, dataLimit, expiryDays, networkDelay, ipAddress, cellTowerId };
};

export default function SimManagementTable({ isDark, store, setDashboardView }: SimManagementTableProps) {
  const { devices, setSelectedDeviceId, setAddDeviceOpen } = store;

  // Search and Filters
  const [simSearch, setSimSearch] = useState('');
  const [carrierFilter, setCarrierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dynamic user interaction states
  const [customUnassignedSims, setCustomUnassignedSims] = useState<UnassignedSim[]>(unassignedSims);
  const [customBalances, setCustomBalances] = useState<Record<string, number>>({});

  // Dialog management
  const [topUpSim, setTopUpSim] = useState<{ phoneNumber: string; balance: number } | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<string>('50000');
  const [detailSim, setDetailSim] = useState<SimCardItem | null>(null);

  // Add SIM Form
  const [addSimOpen, setAddSimOpen] = useState(false);
  const [newSimPhone, setNewSimPhone] = useState('');
  const [newSimCarrier, setNewSimCarrier] = useState('Viettel');
  const [newSimIccid, setNewSimIccid] = useState('');
  const [newSimBalance, setNewSimBalance] = useState('100000');
  const [newSimStatus, setNewSimStatus] = useState('ready');

  // Combined SIM data list (assigned + unassigned)
  const allSimCards = useMemo(() => {
    const activeSims = devices
      .filter((d) => d.phoneNumber)
      .map((d) => {
        const num = d.phoneNumber;
        let carrier = 'Viettel';
        if (num.startsWith('+8490') || num.startsWith('090') || num.startsWith('093') || num.startsWith('+8493')) carrier = 'Mobifone';
        else if (num.startsWith('+8491') || num.startsWith('091') || num.startsWith('088') || num.startsWith('+8488'))
          carrier = 'Vinaphone';

        const details = getMockSimDetails(num, d.id);
        const currentBalance = customBalances[num] !== undefined ? customBalances[num] : details.balance;

        return {
          phoneNumber: num,
          carrier,
          iccid: `898404${d.uniqueId.slice(-13)}`,
          status: 'active',
          deviceName: d.name,
          deviceId: d.id,
          signal: d.status.signalStrength,
          balance: currentBalance,
          dataUsed: details.dataUsed,
          dataLimit: details.dataLimit,
          expiryDays: details.expiryDays,
          networkDelay: details.networkDelay,
          ipAddress: details.ipAddress,
          cellTowerId: details.cellTowerId
        };
      });

    const mockSims = customUnassignedSims.map((s) => {
      const currentBalance = customBalances[s.phoneNumber] !== undefined ? customBalances[s.phoneNumber] : s.balance;
      return {
        phoneNumber: s.phoneNumber,
        carrier: s.carrier,
        iccid: s.iccid,
        status: s.status,
        deviceName: 'Chưa gán',
        deviceId: null,
        signal: s.signal,
        balance: currentBalance,
        dataUsed: s.dataUsed,
        dataLimit: s.dataLimit,
        expiryDays: s.expiryDays,
        networkDelay: s.networkDelay ?? 0,
        ipAddress: s.ipAddress ?? '—',
        cellTowerId: s.cellTowerId ?? '—'
      };
    });

    return [...activeSims, ...mockSims];
  }, [devices, customUnassignedSims, customBalances]);

  // Derived filter list
  const filteredSimTable = useMemo(() => {
    return allSimCards.filter((s) => {
      // 1. Search Query filter
      const q = simSearch.toLowerCase();
      const matchSearch =
        !simSearch ||
        s.phoneNumber.includes(q) ||
        s.iccid.includes(q) ||
        s.carrier.toLowerCase().includes(q) ||
        s.deviceName.toLowerCase().includes(q);

      // 2. Carrier filter
      const matchCarrier = carrierFilter === 'all' || s.carrier === carrierFilter;

      // 3. Status filter
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;

      return matchSearch && matchCarrier && matchStatus;
    });
  }, [allSimCards, simSearch, carrierFilter, statusFilter]);

  // Confirm Top-up
  const handleTopUpConfirm = () => {
    if (topUpSim) {
      const amount = Number(topUpAmount) || 0;
      setCustomBalances((prev) => ({
        ...prev,
        [topUpSim.phoneNumber]: (prev[topUpSim.phoneNumber] ?? topUpSim.balance) + amount
      }));
      setTopUpSim(null);
      setTopUpAmount('50000');
    }
  };

  // Add SIM Confirm
  const handleAddSimConfirm = () => {
    if (!newSimPhone || !newSimIccid) return;
    const newSim: UnassignedSim = {
      phoneNumber: newSimPhone,
      carrier: newSimCarrier,
      iccid: newSimIccid,
      status: newSimStatus,
      signal: newSimStatus === 'ready' ? 3 : 0,
      balance: Number(newSimBalance) || 0,
      dataUsed: 0.0,
      dataLimit: 5.0,
      expiryDays: 30,
      networkDelay: newSimStatus === 'ready' ? 32 : 999,
      ipAddress: newSimStatus === 'ready' ? '10.142.5.42' : '0.0.0.0',
      cellTowerId: newSimStatus === 'ready' ? '452-04-18299' : '—'
    };
    setCustomUnassignedSims((prev) => [...prev, newSim]);
    setAddSimOpen(false);
    setNewSimPhone('');
    setNewSimIccid('');
    setNewSimBalance('100000');
  };

  return (
    <Stack spacing={3}>
      {/* ═══ SIM KPI CARDS SUMMARY PANEL ═══════════════════════════════ */}
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
                  Tổng số SIM hệ thống
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  {allSimCards.length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(37, 99, 235, 0.15)', color: '#2563eb', width: 44, height: 44 }}>
                <Wallet size={22} variant="Bold" />
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
                  Sim Đang hoạt động
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  {allSimCards.filter((s) => s.status === 'active').length}
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
                  Số dư tài khoản thấp
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  {allSimCards.filter((s) => s.balance < 25000).length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', width: 44, height: 44 }}>
                <Warning2 size={22} variant="Bold" />
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
                  Tín hiệu kém / Không sóng
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  {allSimCards.filter((s) => s.signal <= 1).length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', width: 44, height: 44 }}>
                <Wifi size={22} variant="Bold" />
              </Avatar>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* ═══ FILTERS & CONTROLS PANEL ══════════════════════════════════ */}
      <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" mb={2.5} flexWrap="wrap" gap={1.5}>
          <Stack direction="row" spacing={2} flexWrap="wrap" gap={1.5} alignItems="center">
            <TextField
              size="small"
              placeholder="Tìm số điện thoại, ICCID..."
              value={simSearch}
              onChange={(e) => setSimSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchNormal1 size={18} style={{ marginRight: 6, color: '#94a3b8' }} />,
                sx: { fontSize: '0.825rem', borderRadius: 1.5 }
              }}
              sx={{ width: 220 }}
            />

            {/* Carrier selection filter chips */}
            <Stack direction="row" spacing={0.75} alignItems="center">
              {['all', 'Viettel', 'Mobifone', 'Vinaphone'].map((c) => (
                <Chip
                  key={c}
                  label={c === 'all' ? 'Tất cả mạng' : c}
                  onClick={() => setCarrierFilter(c)}
                  variant={carrierFilter === c ? 'filled' : 'outlined'}
                  color={carrierFilter === c ? 'primary' : 'default'}
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

            {/* Status selection filter chips */}
            <Stack direction="row" spacing={0.75} alignItems="center">
              {[
                { key: 'all', label: 'Tất cả trạng thái' },
                { key: 'active', label: 'Hoạt động' },
                { key: 'ready', label: 'Sẵn sàng' },
                { key: 'inactive', label: 'Bị khóa' }
              ].map((st) => (
                <Chip
                  key={st.key}
                  label={st.label}
                  onClick={() => setStatusFilter(st.key)}
                  variant={statusFilter === st.key ? 'filled' : 'outlined'}
                  color={statusFilter === st.key ? 'secondary' : 'default'}
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
            onClick={() => setAddSimOpen(true)}
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.8rem',
              borderRadius: 1.5,
              py: 0.8,
              px: 2
            }}
          >
            Thêm SIM mới
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
                  Số điện thoại
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
                  Nhà mạng
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
                  Số ICCID / Serial
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
                  Thiết bị gán
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
                  Tài khoản (Balance)
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
                  Dung lượng Data
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
              {filteredSimTable.map((sim, index) => {
                const isLowBalance = sim.balance < 25000;
                return (
                  <TableRow key={index} hover sx={{ transition: 'all 0.2s ease' }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.925rem', color: isDark ? '#f8fafc' : '#0f172a', py: 1.8 }}>
                      {sim.phoneNumber}
                    </TableCell>
                    <TableCell sx={{ py: 1.8 }}>
                      <Chip
                        avatar={
                          <Avatar
                            sx={{
                              bgcolor: sim.carrier === 'Viettel' ? '#ef4444' : sim.carrier === 'Vinaphone' ? '#3b82f6' : '#f97316',
                              color: '#ffffff !important',
                              fontWeight: 800,
                              fontSize: '0.65rem'
                            }}
                          >
                            {sim.carrier.charAt(0)}
                          </Avatar>
                        }
                        label={sim.carrier}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          borderRadius: 1,
                          bgcolor:
                            sim.carrier === 'Viettel'
                              ? 'rgba(239, 68, 68, 0.08)'
                              : sim.carrier === 'Vinaphone'
                              ? 'rgba(59, 130, 246, 0.08)'
                              : 'rgba(249, 115, 22, 0.08)',
                          color: sim.carrier === 'Viettel' ? '#ef4444' : sim.carrier === 'Vinaphone' ? '#3b82f6' : '#f97316',
                          border: '1px solid',
                          borderColor:
                            sim.carrier === 'Viettel'
                              ? 'rgba(239, 68, 68, 0.2)'
                              : sim.carrier === 'Vinaphone'
                              ? 'rgba(59, 130, 246, 0.2)'
                              : 'rgba(249, 115, 22, 0.2)'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary', py: 1.8 }}>
                      {sim.iccid}
                    </TableCell>
                    <TableCell sx={{ py: 1.8 }}>
                      {sim.deviceId ? (
                        <Chip
                          label={sim.deviceName}
                          size="small"
                          onClick={() => {
                            setDashboardView('tracking');
                            setSelectedDeviceId(sim.deviceId!);
                          }}
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            borderRadius: 1,
                            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                            color: 'text.primary',
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'
                          }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                          Chưa sử dụng
                        </Typography>
                      )}
                    </TableCell>
                    {/* SIM Balance Account */}
                    <TableCell sx={{ py: 1.8 }}>
                      <Stack spacing={0.25}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            color: isLowBalance ? '#ef4444' : 'text.primary',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          {isLowBalance && <Warning2 size={13} color="#ef4444" variant="Bold" />}
                          {sim.balance.toLocaleString()}đ
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', display: 'block' }}>
                          Hạn dùng: {sim.expiryDays} ngày
                        </Typography>
                      </Stack>
                    </TableCell>
                    {/* Cellular Data Usage */}
                    <TableCell sx={{ py: 1.8, minWidth: 130 }}>
                      <Stack spacing={0.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                          <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.85rem' }}>
                            {sim.dataUsed.toFixed(1)} GB
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                            / {sim.dataLimit.toFixed(1)} GB
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, (sim.dataUsed / sim.dataLimit) * 100)}
                          sx={{
                            height: 5,
                            borderRadius: 2.5,
                            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 2.5,
                              bgcolor:
                                sim.dataUsed / sim.dataLimit > 0.9 ? '#ef4444' : sim.dataUsed / sim.dataLimit > 0.75 ? '#f59e0b' : '#2563eb'
                            }
                          }}
                        />
                      </Stack>
                    </TableCell>
                    {/* Signal columns */}
                    <TableCell sx={{ py: 1.8 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <SignalBars strength={sim.signal} />
                        <Typography variant="caption" sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600 }}>
                          {sim.signal}/4 vạch
                        </Typography>
                      </Stack>
                    </TableCell>
                    {/* SIM Status */}
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
                          bgcolor:
                            sim.status === 'active'
                              ? 'rgba(34, 197, 94, 0.12)'
                              : sim.status === 'ready'
                              ? 'rgba(59, 130, 246, 0.12)'
                              : 'rgba(100, 116, 139, 0.12)',
                          color: sim.status === 'active' ? '#22c55e' : sim.status === 'ready' ? '#3b82f6' : '#64748b',
                          border: '1px solid',
                          borderColor:
                            sim.status === 'active'
                              ? 'rgba(34, 197, 94, 0.3)'
                              : sim.status === 'ready'
                              ? 'rgba(59, 130, 246, 0.3)'
                              : 'rgba(100, 116, 139, 0.3)'
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: sim.status === 'active' ? '#22c55e' : sim.status === 'ready' ? '#3b82f6' : '#64748b',
                            boxShadow: sim.status === 'active' ? '0 0 6px #22c55e' : sim.status === 'ready' ? '0 0 6px #3b82f6' : 'none'
                          }}
                        />
                        {sim.status === 'active' ? 'Hoạt động' : sim.status === 'ready' ? 'Sẵn sàng' : 'Khóa'}
                      </Box>
                    </TableCell>
                    {/* Action buttons */}
                    <TableCell align="right" sx={{ py: 1.8 }}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Chi tiết kỹ thuật di động">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => setDetailSim(sim)}
                            sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                          >
                            <InfoCircle size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Nạp tiền vào SIM">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => setTopUpSim({ phoneNumber: sim.phoneNumber, balance: sim.balance })}
                            sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', mx: 0.25 }}
                          >
                            <Wallet size={16} />
                          </IconButton>
                        </Tooltip>
                        {sim.deviceId ? (
                          <Tooltip title="Xem định vị trên bản đồ">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setDashboardView('tracking');
                                setSelectedDeviceId(sim.deviceId!);
                              }}
                              sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                            >
                              <MapIcon size={16} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Gán vào thiết bị giám sát">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => setAddDeviceOpen(true)}
                              sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                            >
                              <Add size={16} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ═══ INTERACTIVE TOP-UP SIM DIALOG ══════════════════════════════ */}
      <Dialog open={Boolean(topUpSim)} onClose={() => setTopUpSim(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Nạp Tiền Vào Tài Khoản SIM</DialogTitle>
        <DialogContent>
          {topUpSim && (
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Bạn đang thực hiện nạp tiền cho SIM số: <strong>{topUpSim.phoneNumber}</strong>. Số dư hiện tại là:{' '}
                <strong>{topUpSim.balance.toLocaleString()}đ</strong>
              </Typography>

              {/* Price selector */}
              <FormControl fullWidth size="small">
                <InputLabel id="topup-amount-label">Mệnh giá nạp tiền</InputLabel>
                <Select
                  labelId="topup-amount-label"
                  value={topUpAmount}
                  label="Mệnh giá nạp tiền"
                  onChange={(e) => setTopUpAmount(e.target.value)}
                >
                  <MenuItem value="20000">20.000đ</MenuItem>
                  <MenuItem value="50000">50.000đ</MenuItem>
                  <MenuItem value="100000">100.000đ</MenuItem>
                  <MenuItem value="200000">200.000đ</MenuItem>
                  <MenuItem value="500000">500.000đ</MenuItem>
                </Select>
              </FormControl>

              {/* Custom input */}
              <TextField
                label="Mệnh giá tùy chỉnh (VNĐ)"
                size="small"
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                fullWidth
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setTopUpSim(null)} variant="outlined" color="secondary" sx={{ textTransform: 'none', fontWeight: 700 }}>
            Hủy
          </Button>
          <Button onClick={handleTopUpConfirm} variant="contained" color="primary" sx={{ textTransform: 'none', fontWeight: 700 }}>
            Xác nhận nạp tiền
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══ INTERACTIVE CELLULAR TECHNICAL SPECS DIALOG ════════════════ */}
      <Dialog open={Boolean(detailSim)} onClose={() => setDetailSim(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Chi Tiết Kỹ Thuật Viễn Thông SIM</DialogTitle>
        <DialogContent>
          {detailSim && (
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Số điện thoại
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800 }}>
                    {detailSim.phoneNumber}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Nhà mạng đăng ký
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {detailSim.carrier}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Số ICCID / Serial thẻ SIM
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                    {detailSim.iccid}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Dữ liệu phản hồi mạng từ thiết bị (Ankle Telemetry)
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Địa chỉ IP mạng
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'text.primary' }}>
                    {detailSim.ipAddress}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Mã trạm phát sóng BTS (Cell ID)
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'text.primary' }}>
                    {detailSim.cellTowerId}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Cường độ tín hiệu sóng
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {detailSim.signal}/4 vạch (
                    {detailSim.signal === 4
                      ? '-65 dBm'
                      : detailSim.signal === 3
                      ? '-80 dBm'
                      : detailSim.signal === 2
                      ? '-95 dBm'
                      : detailSim.signal === 1
                      ? '-108 dBm'
                      : 'Không có sóng'}
                    )
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Độ trễ truyền phát tín hiệu (Latency)
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 800,
                        color: detailSim.networkDelay > 70 ? '#ef4444' : detailSim.networkDelay > 40 ? '#f59e0b' : '#22c55e'
                      }}
                    >
                      {detailSim.networkDelay} ms
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({detailSim.networkDelay > 70 ? 'Chậm' : detailSim.networkDelay > 40 ? 'Trung bình' : 'Tốt/Mượt'})
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDetailSim(null)} variant="contained" color="primary" sx={{ textTransform: 'none', fontWeight: 700 }}>
            Đóng cửa sổ
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══ INTERACTIVE ADD SIM DIALOG ═════════════════════════════════ */}
      <Dialog open={addSimOpen} onClose={() => setAddSimOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Đăng Ký & Thêm Mới Thẻ SIM</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Số điện thoại SIM (+84... hoặc 0...)"
              size="small"
              value={newSimPhone}
              onChange={(e) => setNewSimPhone(e.target.value)}
              fullWidth
              required
            />
            <FormControl fullWidth size="small">
              <InputLabel id="carrier-select-label">Nhà mạng</InputLabel>
              <Select
                labelId="carrier-select-label"
                value={newSimCarrier}
                label="Nhà mạng"
                onChange={(e) => setNewSimCarrier(e.target.value)}
              >
                <MenuItem value="Viettel">Viettel</MenuItem>
                <MenuItem value="Mobifone">Mobifone</MenuItem>
                <MenuItem value="Vinaphone">Vinaphone</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Số serial thẻ SIM (ICCID - 19 chữ số)"
              size="small"
              value={newSimIccid}
              onChange={(e) => setNewSimIccid(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Số dư ban đầu trong tài khoản (VNĐ)"
              size="small"
              type="number"
              value={newSimBalance}
              onChange={(e) => setNewSimBalance(e.target.value)}
              fullWidth
            />
            <FormControl fullWidth size="small">
              <InputLabel id="status-select-label">Trạng thái khởi tạo</InputLabel>
              <Select
                labelId="status-select-label"
                value={newSimStatus}
                label="Trạng thái khởi tạo"
                onChange={(e) => setNewSimStatus(e.target.value)}
              >
                <MenuItem value="ready">Sẵn sàng (Chờ gán máy)</MenuItem>
                <MenuItem value="inactive">Khóa tạm thời</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAddSimOpen(false)} variant="outlined" color="secondary" sx={{ textTransform: 'none', fontWeight: 700 }}>
            Hủy bỏ
          </Button>
          <Button onClick={handleAddSimConfirm} variant="contained" color="primary" sx={{ textTransform: 'none', fontWeight: 700 }}>
            Thêm mới SIM
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
