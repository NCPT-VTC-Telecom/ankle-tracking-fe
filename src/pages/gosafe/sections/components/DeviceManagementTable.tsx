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
  IconButton
} from '@mui/material';
import { SearchNormal1, Add, Wifi, Map as MapIcon, Gps, Edit, Trash } from 'iconsax-react';
import { TrackingStore } from '../../tracking/useTracking';

interface DeviceManagementTableProps {
  isDark: boolean;
  store: TrackingStore;
  setDashboardView: (view: 'overview' | 'tracking' | 'devices' | 'prisoners' | 'sims') => void;
}

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

  const [deviceSearch, setDeviceSearch] = useState('');

  const filteredDeviceTable = useMemo(() => {
    if (!deviceSearch) return devices;
    const q = deviceSearch.toLowerCase();
    return devices.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.uniqueId.includes(q) ||
        d.phoneNumber.includes(q) ||
        (d.subject?.fullName.toLowerCase().includes(q) ?? false)
    );
  }, [devices, deviceSearch]);

  return (
    <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          size="small"
          placeholder="Tìm thiết bị..."
          value={deviceSearch}
          onChange={(e) => setDeviceSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchNormal1 size={18} style={{ marginRight: 6, color: '#94a3b8' }} />,
            sx: { fontSize: '0.825rem', borderRadius: 1.5 }
          }}
          sx={{ width: 260 }}
        />
        <Button
          variant="contained"
          size="small"
          startIcon={<Add size={18} />}
          onClick={() => setAddDeviceOpen(true)}
          sx={{ borderRadius: 1.5, fontWeight: 600, fontSize: '0.8rem', textTransform: 'none', py: 0.75, px: 2 }}
        >
          Thêm thiết bị mới
        </Button>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>
                Tên thiết bị
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>
                IMEI
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>
                Model
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>
                Số SIM
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>
                Trạng thái
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>
                Pin
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>
                Sóng
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>
                Người đeo
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
            {filteredDeviceTable.map((dev) => {
              const isViolating = deviceViolations[dev.id];
              const conn = dev.status.connectionStatus;
              return (
                <TableRow key={dev.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: dev.color }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.825rem' }}>
                        {dev.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>{dev.uniqueId}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{dev.deviceType}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{dev.phoneNumber || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={isViolating ? 'VI PHẠM' : conn === 'online' ? 'Online' : conn === 'offline' ? 'Offline' : 'Yếu'}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        borderRadius: 1,
                        bgcolor: isViolating
                          ? 'rgba(239, 68, 68, 0.05)'
                          : conn === 'online'
                          ? 'rgba(34, 197, 94, 0.05)'
                          : conn === 'offline'
                          ? 'rgba(100, 116, 139, 0.05)'
                          : 'rgba(245, 158, 11, 0.05)',
                        color: isViolating ? '#dc2626' : conn === 'online' ? '#16a34a' : conn === 'offline' ? '#475569' : '#d97706',
                        border: '1px solid',
                        borderColor: isViolating
                          ? 'rgba(239, 68, 68, 0.15)'
                          : conn === 'online'
                          ? 'rgba(34, 197, 94, 0.15)'
                          : conn === 'offline'
                          ? 'rgba(100, 116, 139, 0.15)'
                          : 'rgba(245, 158, 11, 0.15)'
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.8rem' }}>{dev.status.battery}%</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Wifi size={16} color={dev.status.signalStrength > 1 ? '#16a34a' : '#d97706'} variant="Bold" />
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                        {dev.status.signalStrength}/4
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {dev.subject ? (
                      <Chip
                        label={dev.subject.fullName}
                        onClick={() => setSubjectDetailId(dev.id)}
                        size="small"
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
                        Chưa gán
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                      <Tooltip title="Xem bản đồ">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            setDashboardView('tracking');
                            setSelectedDeviceId(dev.id);
                          }}
                        >
                          <MapIcon size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Gán vùng Geofence">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => setAssignGeofenceId(dev.assignedGeofenceId || geofences[0]?.id)}
                        >
                          <Gps size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sửa">
                        <IconButton size="small" onClick={() => openEditDevice(dev)}>
                          <Edit size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton size="small" color="error" onClick={() => setRemoveConfirmId(dev.id)}>
                          <Trash size={18} />
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
  );
}
