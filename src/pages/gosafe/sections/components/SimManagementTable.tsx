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
  IconButton
} from '@mui/material';
import { SearchNormal1, Wifi, Map as MapIcon, Add } from 'iconsax-react';
import { TrackingStore } from '../../tracking/useTracking';
import { unassignedSims } from './mockData';

interface SimManagementTableProps {
  isDark: boolean;
  store: TrackingStore;
  setDashboardView: (view: 'overview' | 'tracking' | 'devices' | 'prisoners' | 'sims') => void;
}

export default function SimManagementTable({ isDark, store, setDashboardView }: SimManagementTableProps) {
  const { devices, setSelectedDeviceId, setAddDeviceOpen } = store;

  const [simSearch, setSimSearch] = useState('');

  // Helper for SIM details derivation
  const allSimCards = useMemo(() => {
    const activeSims = devices
      .filter((d) => d.phoneNumber)
      .map((d) => {
        const num = d.phoneNumber;
        let carrier = 'Viettel';
        if (num.startsWith('+8490') || num.startsWith('090') || num.startsWith('093') || num.startsWith('+8493')) carrier = 'Mobifone';
        else if (num.startsWith('+8491') || num.startsWith('091') || num.startsWith('088') || num.startsWith('+8488'))
          carrier = 'Vinaphone';
        return {
          phoneNumber: num,
          carrier,
          iccid: `898404${d.uniqueId.slice(-13)}`,
          status: 'active',
          deviceName: d.name,
          deviceId: d.id,
          signal: d.status.signalStrength
        };
      });

    const mockSims = unassignedSims.map((s) => ({
      phoneNumber: s.phoneNumber,
      carrier: s.carrier,
      iccid: s.iccid,
      status: s.status,
      deviceName: 'Chưa gán',
      deviceId: null,
      signal: s.signal
    }));

    return [...activeSims, ...mockSims];
  }, [devices]);

  const filteredSimTable = useMemo(() => {
    if (!simSearch) return allSimCards;
    const q = simSearch.toLowerCase();
    return allSimCards.filter(
      (s) =>
        s.phoneNumber.includes(q) || s.iccid.includes(q) || s.carrier.toLowerCase().includes(q) || s.deviceName.toLowerCase().includes(q)
    );
  }, [allSimCards, simSearch]);

  return (
    <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          size="small"
          placeholder="Tìm số điện thoại, ICCID..."
          value={simSearch}
          onChange={(e) => setSimSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchNormal1 size={18} style={{ marginRight: 6, color: '#94a3b8' }} />,
            sx: { fontSize: '0.825rem', borderRadius: 1.5 }
          }}
          sx={{ width: 260 }}
        />
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>
                Số điện thoại
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>
                Nhà mạng
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>
                Số ICCID / Serial
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>
                Thiết bị gán
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>
                Sóng
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>
                Trạng thái
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}
              >
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSimTable.map((sim, index) => {
              return (
                <TableRow key={index} hover>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.825rem' }}>{sim.phoneNumber}</TableCell>
                  <TableCell>
                    <Chip
                      label={sim.carrier}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        borderRadius: 1,
                        bgcolor:
                          sim.carrier === 'Viettel'
                            ? 'rgba(239, 68, 68, 0.05)'
                            : sim.carrier === 'Vinaphone'
                            ? 'rgba(59, 130, 246, 0.05)'
                            : 'rgba(245, 158, 11, 0.05)',
                        color: sim.carrier === 'Viettel' ? '#dc2626' : sim.carrier === 'Vinaphone' ? '#2563eb' : '#d97706',
                        border: '1px solid',
                        borderColor:
                          sim.carrier === 'Viettel'
                            ? 'rgba(239, 68, 68, 0.12)'
                            : sim.carrier === 'Vinaphone'
                            ? 'rgba(59, 130, 246, 0.12)'
                            : 'rgba(245, 158, 11, 0.12)'
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>{sim.iccid}</TableCell>
                  <TableCell>
                    {sim.deviceId ? (
                      <Chip
                        label={sim.deviceName}
                        size="small"
                        onClick={() => {
                          setDashboardView('tracking');
                          setSelectedDeviceId(sim.deviceId!);
                        }}
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          borderRadius: 1,
                          bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                          color: 'text.primary',
                          border: '1px solid',
                          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
                        }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Chưa sử dụng
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Wifi size={16} color={sim.signal > 1 ? '#16a34a' : '#d97706'} variant="Bold" />
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                        {sim.signal}/4
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={sim.status === 'active' ? 'Đang hoạt động' : sim.status === 'ready' ? 'Sẵn sàng' : 'Khóa'}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        borderRadius: 1,
                        bgcolor:
                          sim.status === 'active'
                            ? 'rgba(34, 197, 94, 0.05)'
                            : sim.status === 'ready'
                            ? 'rgba(59, 130, 246, 0.05)'
                            : 'rgba(100, 116, 139, 0.05)',
                        color: sim.status === 'active' ? '#16a34a' : sim.status === 'ready' ? '#2563eb' : '#475569',
                        border: '1px solid',
                        borderColor:
                          sim.status === 'active'
                            ? 'rgba(34, 197, 94, 0.15)'
                            : sim.status === 'ready'
                            ? 'rgba(59, 130, 246, 0.15)'
                            : 'rgba(100, 116, 139, 0.15)'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                      {sim.deviceId ? (
                        <Tooltip title="Xem thiết bị">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setDashboardView('tracking');
                              setSelectedDeviceId(sim.deviceId!);
                            }}
                          >
                            <MapIcon size={18} />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Gán vào thiết bị">
                          <IconButton size="small" color="success" onClick={() => setAddDeviceOpen(true)}>
                            <Add size={18} />
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
  );
}
