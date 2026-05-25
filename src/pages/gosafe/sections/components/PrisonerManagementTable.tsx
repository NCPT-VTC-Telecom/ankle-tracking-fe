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
  Avatar,
  Typography,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import { SearchNormal1, Add, Eye, Edit, Map as MapIcon } from 'iconsax-react';
import { TrackingStore } from '../../tracking/useTracking';

interface PrisonerManagementTableProps {
  isDark: boolean;
  store: TrackingStore;
  setDashboardView: (view: 'overview' | 'tracking' | 'devices' | 'prisoners' | 'sims') => void;
}

export default function PrisonerManagementTable({ isDark, store, setDashboardView }: PrisonerManagementTableProps) {
  const { devices, deviceViolations, openEditDevice, setAddDeviceOpen, setSubjectDetailId, setSelectedDeviceId } = store;

  const [prisonerSearch, setPrisonerSearch] = useState('');

  const filteredPrisonerTable = useMemo(() => {
    const list = devices.filter((d) => d.subject !== null);
    if (!prisonerSearch) return list;
    const q = prisonerSearch.toLowerCase();
    return list.filter(
      (d) =>
        d.subject!.fullName.toLowerCase().includes(q) ||
        d.subject!.idNumber.includes(q) ||
        d.subject!.crime.toLowerCase().includes(q) ||
        d.uniqueId.includes(q)
    );
  }, [devices, prisonerSearch]);

  return (
    <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" spacing={2} justifyContent="space-between" mb={2}>
        <TextField
          size="small"
          placeholder="Tìm phạm nhân, CCCD..."
          value={prisonerSearch}
          onChange={(e) => setPrisonerSearch(e.target.value)}
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
          Thêm phạm nhân
        </Button>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>
                Ảnh
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>
                Họ tên phạm nhân
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>
                Số CCCD
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>
                Tội danh
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>
                Hình phạt
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>
                Hạn tù
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>
                Thiết bị
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
            {filteredPrisonerTable.map((dev) => {
              const sub = dev.subject!;
              const isViolating = deviceViolations[dev.id];
              return (
                <TableRow key={dev.id} hover>
                  <TableCell>
                    <Avatar sx={{ bgcolor: dev.color, width: 30, height: 30, fontWeight: 600, fontSize: '0.8rem' }}>
                      {sub.fullName.split(' ').slice(-1)[0]?.charAt(0) ?? '?'}
                    </Avatar>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.825rem' }}>{sub.fullName}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
                    {sub.idNumber || '—'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{sub.crime}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{sub.sentence}</TableCell>
                  <TableCell>
                    <Stack>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        {sub.releaseDate}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        bắt đầu: {sub.startDate}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${dev.name}`}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        borderRadius: 1,
                        bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                        color: 'text.primary',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={isViolating ? 'VI PHẠM' : 'An toàn'}
                      size="small"
                      className={isViolating ? 'gs-blink' : ''}
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        borderRadius: 1,
                        bgcolor: isViolating ? 'rgba(239, 68, 68, 0.05)' : 'rgba(34, 197, 94, 0.05)',
                        color: isViolating ? '#dc2626' : '#16a34a',
                        border: '1px solid',
                        borderColor: isViolating ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                      <Tooltip title="Xem chi tiết hồ sơ">
                        <IconButton size="small" color="primary" onClick={() => setSubjectDetailId(dev.id)}>
                          <Eye size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton size="small" onClick={() => openEditDevice(dev)}>
                          <Edit size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Định vị">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => {
                            setDashboardView('tracking');
                            setSelectedDeviceId(dev.id);
                          }}
                        >
                          <MapIcon size={18} />
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
