import { useMemo } from 'react';
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
  Button
} from '@mui/material';
import {
  Cpu,
  Wifi,
  Warning2,
  Danger,
  Profile2User,
  Simcard,
  Gps
} from 'iconsax-react';
import ReactApexChart from 'react-apexcharts';
import { TrackingStore } from '../../tracking/useTracking';
import StatCard from './StatCard';
import { unassignedSims } from './mockData';

interface DashboardOverviewProps {
  isDark: boolean;
  store: TrackingStore;
  setDashboardView: (view: 'overview' | 'tracking' | 'devices' | 'prisoners' | 'sims') => void;
}

export default function DashboardOverview({
  isDark,
  store,
  setDashboardView
}: DashboardOverviewProps) {
  const {
    devices,
    deviceViolations,
    logs,
    setSelectedDeviceId
  } = store;

  // Derived stats
  const totalViolating = useMemo(() => Object.values(deviceViolations).filter(Boolean).length, [deviceViolations]);
  const onlineCount = useMemo(() => devices.filter(d => d.status.connectionStatus === 'online').length, [devices]);
  const offlineCount = useMemo(() => devices.filter(d => d.status.connectionStatus === 'offline').length, [devices]);
  const totalPrisoners = useMemo(() => devices.filter(d => d.subject !== null).length, [devices]);
  const totalSims = useMemo(() => devices.filter(d => d.phoneNumber).length + unassignedSims.length, [devices]);

  // Chart categories (last 7 days labels)
  const chartDays = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(`${d.getDate()}/${d.getMonth() + 1}`);
    }
    return days;
  }, []);

  // Generate dynamic chart series data for activity frequency (syncs/day)
  const deviceActivitySeries = useMemo(() => {
    return devices.map((d, index) => {
      const baseVal = 220 + (index * 70) % 180;
      const data = [
        baseVal + 15,
        baseVal - 25,
        baseVal + 40,
        baseVal + 10,
        baseVal - 35,
        baseVal + 55,
        baseVal - 5,
      ];
      return {
        name: `${d.name} (${d.subject?.fullName ?? 'Không gán'})`,
        data
      };
    });
  }, [devices]);

  const activityChartOptions = {
    chart: {
      type: 'area' as const,
      toolbar: { show: false },
      fontFamily: 'Inter var, Inter, sans-serif',
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
      title: { text: 'Tần suất GPS Syncs / ngày', style: { color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 } }
    },
    grid: { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
    colors: devices.map(d => d.color),
    legend: {
      position: 'top' as const,
      horizontalAlign: 'right' as const,
      labels: { colors: isDark ? '#f8fafc' : '#0f172a' }
    },
    theme: { mode: isDark ? ('dark' as const) : ('light' as const) }
  };

  const statusPieSeries = useMemo(() => {
    let online = 0;
    let offline = 0;
    let unstable = 0;
    devices.forEach(d => {
      if (d.status.connectionStatus === 'online') online++;
      else if (d.status.connectionStatus === 'offline') offline++;
      else unstable++;
    });
    return [online, offline, unstable];
  }, [devices]);

  const statusPieOptions = {
    chart: { type: 'donut' as const, fontFamily: 'Inter var, Inter, sans-serif' },
    labels: ['Trực tuyến', 'Ngoại tuyến', 'Chập chờn'],
    colors: ['#22c55e', '#64748b', '#f59e0b'],
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
              label: 'Tổng thiết bị',
              color: isDark ? '#94a3b8' : '#64748b',
              formatter: () => String(devices.length)
            }
          }
        }
      }
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
          <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.95rem' }}>
              Tần suất sử dụng & Tín hiệu GPS
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Tổng hợp tần suất nhận tọa độ GPS đồng bộ lên hệ thống trong 7 ngày gần nhất
            </Typography>
            <Box sx={{ height: 350 }}>
              <ReactApexChart
                options={activityChartOptions}
                series={deviceActivitySeries}
                type="area"
                height="100%"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Donut Chart */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.95rem' }}>
              Tình trạng thiết bị
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
              Trạng thái kết nối của các thiết bị giám sát
            </Typography>
            <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ReactApexChart
                options={statusPieOptions}
                series={statusPieSeries}
                type="donut"
                height="100%"
                width="100%"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Alarm History table */}
      <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.95rem' }}>
          Nhật ký cảnh báo sự cố gần đây
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Thời gian</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Loại</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Chi tiết sự cố</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => {
                const isError = log.type === 'warning';
                const isSuccess = log.type === 'success';
                return (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{log.time}</TableCell>
                    <TableCell>
                      <Chip
                        label={isError ? 'Cảnh báo' : isSuccess ? 'Thành công' : 'Hệ thống'}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          borderRadius: 1,
                          bgcolor: isError ? 'rgba(239, 68, 68, 0.05)' : isSuccess ? 'rgba(34, 197, 94, 0.05)' : 'rgba(59, 130, 246, 0.05)',
                          color: isError ? '#dc2626' : isSuccess ? '#16a34a' : '#2563eb',
                          border: '1px solid',
                          borderColor: isError ? 'rgba(239, 68, 68, 0.15)' : isSuccess ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', fontWeight: isError ? 500 : 400, color: 'text.primary' }}>{log.message}</TableCell>
                    <TableCell align="right">
                      {log.message.includes('VTC-G') && (
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<Gps size={12} />}
                          onClick={() => {
                            const found = devices.find(d => log.message.includes(d.name));
                            if (found) {
                              setDashboardView('tracking');
                              setSelectedDeviceId(found.id);
                            }
                          }}
                          sx={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'none', py: 0.25 }}
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
