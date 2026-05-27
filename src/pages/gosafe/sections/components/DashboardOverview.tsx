import { useMemo, useState } from 'react';
import {
  Stack,
  Grid,
  Paper,
  Typography,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress
} from '@mui/material';
import { Cpu, Wifi, Warning2, Danger, Profile2User, Simcard, Gps, Activity } from 'iconsax-react';
import ReactApexChart from 'react-apexcharts';
import { TrackingStore } from '../../tracking/useTracking';
import { getMockBiometrics } from '../../tracking/utils';
import StatCard from './StatCard';
import { unassignedSims } from './mockData';

interface DashboardOverviewProps {
  isDark: boolean;
  store: TrackingStore;
  setDashboardView: (view: 'overview' | 'tracking' | 'devices' | 'prisoners' | 'sims') => void;
}

export default function DashboardOverview({ isDark, store, setDashboardView }: DashboardOverviewProps) {
  const { devices, deviceViolations, logs, setSelectedDeviceId, geofences, geofenceDevicesMap } = store;

  // Chart states
  const [activeMetric, setActiveMetric] = useState<'sync' | 'speed' | 'battery' | 'violation'>('sync');
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7);
  const [donutView, setDonutView] = useState<'connection' | 'geofence'>('connection');

  // Derived stats
  const totalViolating = useMemo(() => Object.values(deviceViolations).filter(Boolean).length, [deviceViolations]);
  const onlineCount = useMemo(() => devices.filter((d) => d.status.connectionStatus === 'online').length, [devices]);
  const offlineCount = useMemo(() => devices.filter((d) => d.status.connectionStatus === 'offline').length, [devices]);
  const totalPrisoners = useMemo(() => devices.filter((d) => d.subject !== null).length, [devices]);
  const totalSims = useMemo(() => devices.filter((d) => d.phoneNumber).length + unassignedSims.length, [devices]);

  // Chart categories (dynamic timeline days labels)
  const chartDays = useMemo(() => {
    const days = [];
    for (let i = timeRange - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(`${d.getDate()}/${d.getMonth() + 1}`);
    }
    return days;
  }, [timeRange]);

  // Generate dynamic chart series data based on selected metric and time range
  const deviceActivitySeries = useMemo(() => {
    return devices.map((d, index) => {
      const seed = index * 37 + d.id.charCodeAt(d.id.length - 1);
      const data = [];
      for (let i = 0; i < timeRange; i++) {
        let val = 0;
        if (activeMetric === 'sync') {
          val = 180 + Math.abs((seed + i * 23) % 150); // 180 - 330 syncs
        } else if (activeMetric === 'speed') {
          val = 2 + Math.abs((seed + i * 7) % 15); // 2 - 17 km/h
        } else if (activeMetric === 'battery') {
          val = 98 - Math.abs((seed + i * 3) % 40); // 58 - 98 %
        } else if (activeMetric === 'violation') {
          val = Math.abs((seed + i * 1) % 5) === 0 ? Math.abs((seed + i) % 3) : 0; // 0 - 2 violations
        }
        data.push(val);
      }
      return {
        name: `${d.name} (${d.subject?.fullName ?? 'Không gán'})`,
        data
      };
    });
  }, [devices, activeMetric, timeRange]);

  const yAxisTitle = useMemo(() => {
    if (activeMetric === 'sync') return 'Tần suất GPS Syncs / ngày';
    if (activeMetric === 'speed') return 'Vận tốc trung bình (km/h)';
    if (activeMetric === 'battery') return 'Mức sạc Pin trung bình (%)';
    return 'Số ca Cảnh báo Vi phạm / ngày';
  }, [activeMetric]);

  const geofencePieData = useMemo(() => {
    const labels: string[] = [];
    const series: number[] = [];
    const colors: string[] = [];

    geofences.forEach((gf) => {
      const count = geofenceDevicesMap[gf.id]?.length ?? 0;
      labels.push(gf.name);
      series.push(count);
      colors.push(gf.color);
    });

    const unassignedCount = devices.filter((d) => !d.assignedGeofenceId).length;
    if (unassignedCount > 0) {
      labels.push('Chưa gán vùng');
      series.push(unassignedCount);
      colors.push('#64748b');
    }

    return { labels, series, colors };
  }, [geofences, geofenceDevicesMap, devices]);

  const statusPieSeriesDynamic = useMemo(() => {
    if (donutView === 'geofence') return geofencePieData.series;

    let online = 0;
    let offline = 0;
    let unstable = 0;
    devices.forEach((d) => {
      if (d.status.connectionStatus === 'online') online++;
      else if (d.status.connectionStatus === 'offline') offline++;
      else unstable++;
    });
    return [online, offline, unstable];
  }, [donutView, geofencePieData, devices]);

  const statusPieOptionsDynamic = useMemo(() => {
    const isGeofence = donutView === 'geofence';
    return {
      chart: { type: 'donut' as const, fontFamily: 'Inter var, Inter, sans-serif' },
      labels: isGeofence ? geofencePieData.labels : ['Trực tuyến', 'Ngoại tuyến', 'Chập chờn'],
      colors: isGeofence ? geofencePieData.colors : ['#22c55e', '#64748b', '#f59e0b'],
      stroke: { show: false },
      legend: {
        position: 'bottom' as const,
        labels: { colors: isDark ? '#f8fafc' : '#0f172a' }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            labels: {
              show: true,
              total: {
                show: true,
                label: isGeofence ? 'Tổng gán' : 'Tổng thiết bị',
                color: isDark ? '#94a3b8' : '#64748b',
                formatter: () => String(devices.length)
              }
            }
          }
        }
      },
      theme: { mode: isDark ? ('dark' as const) : ('light' as const) }
    };
  }, [donutView, geofencePieData, isDark, devices]);

  const activityChartOptions = {
    chart: {
      type: 'area' as const,
      toolbar: { show: false },
      fontFamily: 'Inter var, Inter, sans-serif',
      dropShadow: {
        enabled: true,
        top: 8,
        left: 0,
        blur: 8,
        opacity: isDark ? 0.35 : 0.15
      }
    },
    stroke: { curve: 'smooth' as const, width: 2 },
    fill: {
      type: 'gradient' as const,
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      categories: chartDays,
      labels: { style: { colors: isDark ? '#94a3b8' : '#64748b' } }
    },
    yaxis: {
      labels: { style: { colors: isDark ? '#94a3b8' : '#64748b' } },
      title: { text: yAxisTitle, style: { color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 } }
    },
    grid: { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
    colors: devices.map((d) => d.color),
    legend: {
      position: 'top' as const,
      horizontalAlign: 'right' as const,
      labels: { colors: isDark ? '#f8fafc' : '#0f172a' }
    },
    theme: { mode: isDark ? ('dark' as const) : ('light' as const) }
  };

  return (
    <Stack spacing={3}>
      {/* Stats Grid */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Tổng thiết bị"
            value={devices.length}
            subtext="Ankle monitors"
            icon={<Cpu size={20} />}
            color="rgba(37, 99, 235, 0.08)"
            gradient="#2563eb"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Trực tuyến"
            value={onlineCount}
            subtext={`${Math.round((onlineCount / (devices.length || 1)) * 100)}% online`}
            icon={<Wifi size={20} />}
            color="rgba(34, 197, 94, 0.08)"
            gradient="#22c55e"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Mất tín hiệu"
            value={offlineCount}
            subtext="Cần kiểm tra"
            icon={<Warning2 size={20} />}
            color="rgba(100, 116, 139, 0.08)"
            gradient="#64748b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Đang vi phạm"
            value={totalViolating}
            subtext="Ra ngoài geofence"
            icon={<Danger size={20} />}
            color="rgba(239, 68, 68, 0.08)"
            gradient="#ef4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Tổng phạm nhân"
            value={totalPrisoners}
            subtext="Hồ sơ được gán"
            icon={<Profile2User size={20} />}
            color="rgba(168, 85, 247, 0.08)"
            gradient="#a855f7"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Tổng thẻ SIM"
            value={totalSims}
            subtext={`${unassignedSims.length} sim sẵn sàng`}
            icon={<Simcard size={20} />}
            color="rgba(6, 182, 212, 0.08)"
            gradient="#06b6d4"
          />
        </Grid>
      </Grid>

      {/* Charts row */}
      <Grid container spacing={3}>
        {/* Active Frequency Line Chart */}
        <Grid item xs={12} lg={8}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'divider',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #2563eb, #60a5fa)',
                opacity: 0.8
              }
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1.5} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.95rem' }}>
                  Phân tích & Giám sát Thiết bị
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Biểu đồ phân tích dữ liệu thiết bị đeo điện tử theo thời gian thực
                </Typography>
              </Box>

              {/* Metric & Timeline Controls */}
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={1}>
                {/* Metric Selector Toggle */}
                <ToggleButtonGroup
                  value={activeMetric}
                  exclusive
                  onChange={(_, val) => val && setActiveMetric(val)}
                  size="small"
                  sx={{
                    height: 28,
                    '& .MuiToggleButton-root': {
                      py: 0.25,
                      px: 1.25,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                      color: isDark ? '#94a3b8' : '#64748b',
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: '#ffffff',
                        '&:hover': { bgcolor: 'primary.dark' }
                      }
                    }
                  }}
                >
                  <ToggleButton value="sync">GPS Syncs</ToggleButton>
                  <ToggleButton value="speed">Vận tốc</ToggleButton>
                  <ToggleButton value="battery">Mức Pin</ToggleButton>
                  <ToggleButton value="violation">Cảnh báo</ToggleButton>
                </ToggleButtonGroup>

                {/* Timeline Selector Toggle */}
                <ToggleButtonGroup
                  value={timeRange}
                  exclusive
                  onChange={(_, val) => val && setTimeRange(val)}
                  size="small"
                  sx={{
                    height: 28,
                    '& .MuiToggleButton-root': {
                      py: 0.25,
                      px: 1,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                      color: isDark ? '#94a3b8' : '#64748b',
                      '&.Mui-selected': {
                        bgcolor: 'secondary.main',
                        color: '#ffffff',
                        '&:hover': { bgcolor: 'secondary.dark' }
                      }
                    }
                  }}
                >
                  <ToggleButton value={7}>7 ngày</ToggleButton>
                  <ToggleButton value={14}>14 ngày</ToggleButton>
                  <ToggleButton value={30}>30 ngày</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Stack>
            <Box sx={{ height: 350 }}>
              <ReactApexChart options={activityChartOptions} series={deviceActivitySeries} type="area" height="100%" />
            </Box>
          </Paper>
        </Grid>

        {/* Donut Chart */}
        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #22c55e, #34d399)',
                opacity: 0.8
              }
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.95rem' }}>
                  {donutView === 'connection' ? 'Trạng thái kết nối' : 'Phân bố theo Vùng'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {donutView === 'connection' ? 'Tỉ lệ trực tuyến thời gian thực' : 'Số thiết bị gán trong các vùng'}
                </Typography>
              </Box>

              <ToggleButtonGroup
                value={donutView}
                exclusive
                onChange={(_, val) => val && setDonutView(val)}
                size="small"
                sx={{
                  height: 28,
                  '& .MuiToggleButton-root': {
                    py: 0.25,
                    px: 1,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                    color: isDark ? '#94a3b8' : '#64748b',
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: '#ffffff',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }
                  }
                }}
              >
                <ToggleButton value="connection">Kết nối</ToggleButton>
                <ToggleButton value="geofence">Theo Vùng</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ReactApexChart options={statusPieOptionsDynamic} series={statusPieSeriesDynamic} type="donut" height="100%" width="100%" />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ═══ LIVE BIOMETRICS MONITORING PANEL ════════════════════════════ */}
      <Paper
        sx={{
          p: 2.5,
          borderRadius: 2,
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #a855f7, #e879f9)',
            opacity: 0.8
          }
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.95rem' }}>
          Giám sát Sinh trắc học & Sức khỏe Phạm nhân (Thời gian thực)
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Theo dõi tự động các chỉ số sinh mạng và cảm biến tiếp xúc da của khóa điện tử chân
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    py: 1.5,
                    letterSpacing: '0.05em'
                  }}
                >
                  Đối tượng giám sát
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    py: 1.5,
                    letterSpacing: '0.05em'
                  }}
                >
                  Thiết bị
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    py: 1.5,
                    letterSpacing: '0.05em'
                  }}
                >
                  Nhịp tim
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    py: 1.5,
                    letterSpacing: '0.05em'
                  }}
                >
                  Nhiệt độ cơ thể
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    py: 1.5,
                    letterSpacing: '0.05em'
                  }}
                >
                  Vận động
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    py: 1.5,
                    letterSpacing: '0.05em'
                  }}
                >
                  Cảm biến vòng chân
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
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
              {devices
                .filter((d) => d.subject !== null)
                .map((dev) => {
                  const sub = dev.subject!;
                  const bio = getMockBiometrics(dev.id);
                  return (
                    <TableRow
                      key={dev.id}
                      hover
                      sx={{
                        borderLeft: '4px solid transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderLeftColor: dev.color,
                          bgcolor: isDark ? 'rgba(255,255,255,0.02) !important' : 'rgba(0,0,0,0.01) !important'
                        }
                      }}
                    >
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: dev.color,
                              width: 38,
                              height: 38,
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              boxShadow: `0 0 12px ${dev.color}60`,
                              border: '2px solid',
                              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                            }}
                          >
                            {sub.fullName.split(' ').slice(-1)[0]?.charAt(0) ?? '?'}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 800, fontSize: '0.95rem', color: isDark ? '#f8fafc' : '#0f172a' }}
                            >
                              {sub.fullName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.75rem' }}>
                              CCCD: {sub.idNumber || '—'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.9rem', color: isDark ? '#cbd5e1' : '#334155' }}>
                          {dev.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem' }}>
                          IMEI: {dev.uniqueId}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 1.5,
                            py: 0.75,
                            borderRadius: '8px',
                            bgcolor: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.06)',
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
                            boxShadow: isDark ? '0 0 12px rgba(239, 68, 68, 0.15)' : 'none'
                          }}
                        >
                          <Activity size="18" color="#ef4444" className="gs-pulse-heart-icon" style={{ flexShrink: 0 }} />
                          <Stack spacing={0}>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#ef4444', fontSize: '0.95rem', lineHeight: 1.1 }}>
                              {bio.heartRate} bpm
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontSize: '0.68rem', color: isDark ? '#f87171' : '#dc2626', fontWeight: 600 }}
                            >
                              {Number(bio.heartRate) > 100 ? 'Nhịp nhanh' : Number(bio.heartRate) < 60 ? 'Nhịp chậm' : 'Ổn định'}
                            </Typography>
                          </Stack>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        {(() => {
                          const tempVal = bio.temp;
                          let color = '#22c55e';
                          let label = 'Bình thường';
                          let bg = 'rgba(34, 197, 94, 0.06)';
                          let borderColor = 'rgba(34, 197, 94, 0.2)';

                          if (Number(tempVal) > 37.2) {
                            color = '#f97316';
                            label = 'Sốt nhẹ';
                            bg = 'rgba(249, 115, 22, 0.08)';
                            borderColor = 'rgba(249, 115, 22, 0.2)';
                          } else if (Number(tempVal) < 36.0) {
                            color = '#3b82f6';
                            label = 'Nhiệt độ thấp';
                            bg = 'rgba(59, 130, 246, 0.08)';
                            borderColor = 'rgba(59, 130, 246, 0.2)';
                          }

                          return (
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 1,
                                px: 1.25,
                                py: 0.75,
                                borderRadius: '8px',
                                bgcolor: isDark ? bg.replace('0.06', '0.12').replace('0.08', '0.15') : bg,
                                border: '1px solid',
                                borderColor: isDark ? borderColor.replace('0.2', '0.3') : borderColor
                              }}
                            >
                              <Box sx={{ fontSize: '1.1rem', color }}>🌡️</Box>
                              <Stack>
                                <Typography variant="body2" sx={{ fontWeight: 800, color, fontSize: '0.95rem', lineHeight: 1.1 }}>
                                  {tempVal} °C
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ fontSize: '0.68rem', color: isDark ? '#cbd5e1' : '#64748b', fontWeight: 600 }}
                                >
                                  {label}
                                </Typography>
                              </Stack>
                            </Box>
                          );
                        })()}
                      </TableCell>
                      <TableCell sx={{ minWidth: 160, py: 1.5 }}>
                        <Stack spacing={0.5}>
                          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 800, fontSize: '0.95rem', color: isDark ? '#f8fafc' : '#0f172a' }}
                            >
                              {bio.steps.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                              / 10,000 bước
                            </Typography>
                          </Stack>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: '100%' }}>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(100, (bio.steps / 10000) * 100)}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 3,
                                    background: 'linear-gradient(90deg, #a855f7, #6366f1)'
                                  }
                                }}
                              />
                            </Box>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 32 }}>
                              {((bio.steps / 10000) * 100).toFixed(0)}%
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Box
                          className={bio.isTampered ? 'gs-blink' : ''}
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 1.5,
                            py: 0.75,
                            borderRadius: '20px',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            bgcolor: bio.isTampered ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.12)',
                            color: bio.isTampered ? '#ef4444' : '#22c55e',
                            border: '1px solid',
                            borderColor: bio.isTampered ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)',
                            boxShadow: bio.isTampered
                              ? '0 0 12px rgba(239, 68, 68, 0.4), inset 0 0 4px rgba(239, 68, 68, 0.2)'
                              : '0 0 12px rgba(34, 197, 94, 0.3), inset 0 0 4px rgba(34, 197, 94, 0.15)'
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: bio.isTampered ? '#ef4444' : '#22c55e',
                              boxShadow: bio.isTampered ? '0 0 8px #ef4444' : '0 0 8px #22c55e'
                            }}
                          />
                          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'inherit' }}>
                            {bio.isTampered ? 'THÁO VÒNG' : 'TIẾP XÚC TỐT'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5 }}>
                        <Button
                          size="medium"
                          variant="outlined"
                          startIcon={<Gps size={14} />}
                          onClick={() => {
                            setDashboardView('tracking');
                            setSelectedDeviceId(dev.id);
                          }}
                          sx={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            py: 0.6,
                            px: 2,
                            borderRadius: '8px',
                            borderColor: 'primary.main',
                            borderWidth: '1.5px',
                            '&:hover': {
                              borderWidth: '1.5px',
                              bgcolor: 'primary.main',
                              color: '#ffffff',
                              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                            }
                          }}
                        >
                          Định vị
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Recent Alarm History table */}
      <Paper
        sx={{
          p: 2.5,
          borderRadius: 2,
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #f43f5e, #fb7185)',
            opacity: 0.8
          }
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.95rem' }}>
          Nhật ký cảnh báo sự cố gần đây
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    py: 1.5,
                    letterSpacing: '0.05em'
                  }}
                >
                  Thời gian
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    py: 1.5,
                    letterSpacing: '0.05em'
                  }}
                >
                  Loại
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    py: 1.5,
                    letterSpacing: '0.05em'
                  }}
                >
                  Chi tiết sự cố
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
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
              {logs.map((log) => {
                const isError = log.type === 'warning';
                const isSuccess = log.type === 'success';
                const accentColor = isError ? '#ef4444' : isSuccess ? '#22c55e' : '#3b82f6';
                const rowBgColor = isDark
                  ? isError
                    ? 'rgba(239, 68, 68, 0.03)'
                    : isSuccess
                    ? 'rgba(34, 197, 94, 0.03)'
                    : 'rgba(59, 130, 246, 0.03)'
                  : isError
                  ? 'rgba(239, 68, 68, 0.015)'
                  : isSuccess
                  ? 'rgba(34, 197, 94, 0.015)'
                  : 'rgba(59, 130, 246, 0.015)';

                let severityIcon = '⚙️';
                if (isError) {
                  severityIcon = '🚨';
                } else if (isSuccess) {
                  severityIcon = '✅';
                } else if (log.message.includes('GPS') || log.message.includes('kết nối')) {
                  severityIcon = '📡';
                }

                return (
                  <TableRow
                    key={log.id}
                    hover
                    sx={{
                      borderLeft: `4px solid ${accentColor}`,
                      bgcolor: rowBgColor,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.04) !important' : 'rgba(0, 0, 0, 0.03) !important'
                      }
                    }}
                  >
                    <TableCell sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.secondary', py: 1.5 }}>{log.time}</TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={isError ? 'Cảnh báo' : isSuccess ? 'Thành công' : 'Hệ thống'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          bgcolor: isError ? 'rgba(239, 68, 68, 0.12)' : isSuccess ? 'rgba(34, 197, 94, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                          color: isError ? '#ef4444' : isSuccess ? '#22c55e' : '#3b82f6',
                          border: '1px solid',
                          borderColor: isError
                            ? 'rgba(239, 68, 68, 0.25)'
                            : isSuccess
                            ? 'rgba(34, 197, 94, 0.25)'
                            : 'rgba(59, 130, 246, 0.25)'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ fontSize: '1.2rem', mr: 0.5, flexShrink: 0 }}>{severityIcon}</Box>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: '0.9rem',
                            fontWeight: isError ? 700 : 500,
                            color: isError ? (isDark ? '#fca5a5' : '#b91c1c') : isDark ? '#e2e8f0' : '#1e293b'
                          }}
                        >
                          {log.message}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>
                      {log.message.includes('VTC-G') && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Gps size={12} />}
                          onClick={() => {
                            const found = devices.find((d) => log.message.includes(d.name));
                            if (found) {
                              setDashboardView('tracking');
                              setSelectedDeviceId(found.id);
                            }
                          }}
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            py: 0.5,
                            px: 1.5,
                            borderRadius: '6px',
                            bgcolor: isDark ? 'rgba(37, 99, 235, 0.08)' : 'rgba(37, 99, 235, 0.04)',
                            borderColor: 'rgba(37, 99, 235, 0.3)',
                            color: '#2563eb',
                            borderWidth: '1px',
                            '&:hover': {
                              bgcolor: 'primary.main',
                              borderColor: 'primary.main',
                              color: '#ffffff',
                              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
                            }
                          }}
                        >
                          Định vị
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
