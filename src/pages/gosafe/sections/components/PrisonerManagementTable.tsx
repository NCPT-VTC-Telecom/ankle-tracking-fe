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
  IconButton,
  Grid,
  Card,
  CardContent,
  Box,
  Divider,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { SearchNormal1, Add, Eye, Edit, Map as MapIcon, Category, DocumentText, Activity, Gps, Heart } from 'iconsax-react';
import { TrackingStore } from '../../tracking/useTracking';
import { getMockBiometrics } from '../../tracking/utils';

interface PrisonerManagementTableProps {
  isDark: boolean;
  store: TrackingStore;
  setDashboardView: (view: 'overview' | 'tracking' | 'devices' | 'prisoners' | 'sims') => void;
}

export default function PrisonerManagementTable({ isDark, store, setDashboardView }: PrisonerManagementTableProps) {
  const { devices, deviceViolations, openEditDevice, setAddDeviceOpen, setSubjectDetailId, setSelectedDeviceId } = store;

  const [prisonerSearch, setPrisonerSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

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

  const primaryColor = store.primaryColor;

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={2} alignItems="center">
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
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, val) => val && setViewMode(val)}
            size="small"
            sx={{
              height: 34,
              '& .MuiToggleButton-root': {
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                color: isDark ? '#94a3b8' : '#64748b',
                '&.Mui-selected': {
                  bgcolor: primaryColor,
                  color: '#ffffff',
                  borderColor: primaryColor
                }
              }
            }}
          >
            <ToggleButton value="cards">
              <Tooltip title="Dạng thẻ (Hồ sơ sinh trắc)">
                <Category size={16} />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="table">
              <Tooltip title="Dạng danh sách">
                <DocumentText size={16} />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
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

      {viewMode === 'cards' ? (
        <Grid container spacing={2.5}>
          {filteredPrisonerTable.map((dev) => {
            const sub = dev.subject!;
            const isViolating = deviceViolations[dev.id];
            const bio = getMockBiometrics(dev.id);

            return (
              <Grid item xs={12} sm={6} md={6} lg={4} key={dev.id}>
                <Card
                  sx={{
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                    bgcolor: isDark ? '#0f172a' : '#ffffff',
                    backgroundImage: 'none',
                    boxShadow: 'none',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.4)' : '0 12px 30px rgba(0,0,0,0.06)',
                      borderColor: dev.color
                    }
                  }}
                >
                  {/* Color Banner */}
                  <Box sx={{ height: 4, bgcolor: dev.color }} />

                  <CardContent sx={{ p: 2.5 }}>
                    {/* Top Status */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                      <Chip
                        label={`${dev.name}`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          height: 20,
                          borderRadius: 1,
                          bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                          color: 'text.primary',
                          border: '1px solid',
                          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
                        }}
                      />
                      <Chip
                        label={bio.isTampered ? 'PHÁT HIỆN THÁO XÍCH' : isViolating ? 'VI PHẠM VÙNG' : 'Khóa đeo ổn định'}
                        size="small"
                        className={bio.isTampered || isViolating ? 'gs-blink' : ''}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          height: 20,
                          borderRadius: 1,
                          bgcolor: bio.isTampered
                            ? 'rgba(239, 68, 68, 0.08)'
                            : isViolating
                            ? 'rgba(245, 158, 11, 0.08)'
                            : 'rgba(34, 197, 94, 0.08)',
                          color: bio.isTampered ? '#ef4444' : isViolating ? '#f59e0b' : '#22c55e',
                          border: '1px solid',
                          borderColor: bio.isTampered
                            ? 'rgba(239, 68, 68, 0.2)'
                            : isViolating
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(34, 197, 94, 0.2)'
                        }}
                      />
                    </Stack>

                    {/* Avatar & Personal info */}
                    <Stack direction="row" spacing={2} alignItems="center" mb={2.5}>
                      <Avatar
                        sx={{
                          width: 46,
                          height: 46,
                          bgcolor: dev.color,
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          color: '#ffffff',
                          boxShadow: `0 0 10px ${dev.color}30`
                        }}
                      >
                        {sub.fullName.split(' ').slice(-1)[0]?.charAt(0) ?? '?'}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body1" noWrap sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                          {sub.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem' }}>
                          CCCD: {sub.idNumber || '—'}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Surveillance info */}
                    <Stack spacing={1} mb={2.5}>
                      {[
                        ['Tội danh', sub.crime],
                        ['Hình phạt', sub.sentence],
                        ['Hạn tù', `${sub.startDate} ~ ${sub.releaseDate}`]
                      ].map(([label, value]) => (
                        <Stack key={label} direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, fontSize: '0.72rem' }}>
                            {label}:
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600, color: isDark ? '#e2e8f0' : '#1e293b', textAlign: 'right', fontSize: '0.72rem' }}
                          >
                            {value}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>

                    <Divider sx={{ my: 1.5, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

                    {/* Hardware Telemetry Stats */}
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: primaryColor,
                        textTransform: 'uppercase',
                        letterSpacing: 0.6,
                        fontSize: '0.65rem',
                        display: 'block',
                        mb: 1.2
                      }}
                    >
                      Cảm biến & Định vị thiết bị
                    </Typography>

                    <Grid container spacing={1.5} mb={2}>
                      <Grid item xs={6}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Activity
                            size="16"
                            color={bio.isTampered ? '#ef4444' : '#22c55e'}
                            className={bio.isTampered ? 'gs-blink' : ''}
                            style={{ flexShrink: 0 }}
                          />
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block', fontSize: '0.65rem', lineHeight: 1 }}
                            >
                              Khóa vòng chân
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                color: bio.isTampered ? '#ef4444' : '#22c55e',
                                fontSize: '0.8rem'
                              }}
                            >
                              {bio.isTampered ? 'Cảnh báo tháo' : 'Khóa ổn định'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Gps size="16" color="#3b82f6" style={{ flexShrink: 0 }} />
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block', fontSize: '0.65rem', lineHeight: 1 }}
                            >
                              Vận tốc
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.8rem' }}>
                              {dev.status.speed || 0} km/h
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Heart size="16" color="#a855f7" style={{ flexShrink: 0 }} />
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block', fontSize: '0.65rem', lineHeight: 1 }}
                            >
                              Độ cao / Vệ tinh
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.8rem' }}>
                              {dev.status.altitude || 0}m · {dev.status.satelliteCount} vệ tinh
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Gps size="16" color={dev.status.battery < 20 ? '#ef4444' : '#10b981'} style={{ flexShrink: 0 }} />
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block', fontSize: '0.65rem', lineHeight: 1 }}
                            >
                              Pin/Tín hiệu
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.8rem' }}>
                              {dev.status.battery}% · {dev.status.signalStrength}/4 vạch
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 1.5, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

                    {/* Actions */}
                    <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          onClick={() => openEditDevice(dev)}
                          sx={{
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                            borderRadius: 1.5
                          }}
                        >
                          <Edit size={16} />
                        </IconButton>
                      </Tooltip>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setSubjectDetailId(dev.id)}
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          borderRadius: 1.5,
                          textTransform: 'none',
                          py: 0.6,
                          px: 1.5
                        }}
                      >
                        Hồ sơ chi tiết
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<MapIcon size={14} />}
                        onClick={() => {
                          setDashboardView('tracking');
                          setSelectedDeviceId(dev.id);
                        }}
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          borderRadius: 1.5,
                          textTransform: 'none',
                          py: 0.6,
                          px: 1.5
                        }}
                      >
                        Định vị
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
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
                  const bio = getMockBiometrics(dev.id);

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
                          label={bio.isTampered ? 'CẢNH BÁO THÁO' : isViolating ? 'VI PHẠM' : 'An toàn'}
                          size="small"
                          className={bio.isTampered || isViolating ? 'gs-blink' : ''}
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            borderRadius: 1,
                            bgcolor: bio.isTampered
                              ? 'rgba(239, 68, 68, 0.05)'
                              : isViolating
                              ? 'rgba(245, 158, 11, 0.05)'
                              : 'rgba(34, 197, 94, 0.05)',
                            color: bio.isTampered ? '#dc2626' : isViolating ? '#f59e0b' : '#16a34a',
                            border: '1px solid',
                            borderColor: bio.isTampered
                              ? 'rgba(239, 68, 68, 0.15)'
                              : isViolating
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(34, 197, 94, 0.15)'
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
      )}
    </Stack>
  );
}
