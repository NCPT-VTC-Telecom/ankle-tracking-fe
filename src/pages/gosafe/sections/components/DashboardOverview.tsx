import { useMemo } from 'react';
import { Avatar, Box, Chip, Grid, Stack, Typography } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { Cpu, Danger, TickCircle, Profile2User, SearchStatus, CloseSquare } from 'iconsax-react';
import { TrackingStore } from '../../tracking/useTracking';

interface DashboardOverviewProps {
  isDark: boolean;
  store: TrackingStore;
  setDashboardView: (view: 'overview' | 'tracking' | 'devices' | 'prisoners' | 'sims') => void;
}

export default function DashboardOverview({ isDark, store, setDashboardView }: DashboardOverviewProps) {
  const { devices, setSelectedDeviceId, deviceViolations } = store;

  const onlineCount   = useMemo(() => devices.filter((d) => d.status.connectionStatus === 'online').length,  [devices]);
  const offlineCount  = useMemo(() => devices.filter((d) => d.status.connectionStatus === 'offline').length, [devices]);
  const totalViolating = useMemo(() => Object.values(deviceViolations).filter(Boolean).length, [deviceViolations]);

  // ── Glass tokens ──────────────────────────────────────────────────
  const txtPrimary   = isDark ? '#f8fafc'                 : '#0f172a';
  const txtSecondary = isDark ? '#94a3b8'                 : '#64748b';
  const cardBg       = isDark ? 'rgba(15,23,42,0.50)'     : 'rgba(255,255,255,0.68)';
  const cardBorder   = isDark ? 'rgba(255,255,255,0.10)'  : 'rgba(255,255,255,0.90)';
  const cardBlur     = 'blur(28px) saturate(1.7) brightness(1.04)';
  const specularTop  = `inset 0 1px 0 rgba(255,255,255,${isDark ? 0.18 : 0.95})`;
  const gridLine     = isDark ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.05)';
  const donutStroke  = isDark ? '#0f172a'                 : '#f8fafc';

  // Helper: reusable glass card sx
  const glassCard = (accentColor?: string, extraHover?: object) => ({
    borderRadius: '16px',
    border: `1px solid ${cardBorder}`,
    p: 2.5,
    background: cardBg,
    backdropFilter: cardBlur,
    WebkitBackdropFilter: cardBlur,
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.22s ease, box-shadow 0.22s ease',
    boxShadow: accentColor
      ? `0 2px 16px ${accentColor}18, ${specularTop}`
      : `0 2px 12px rgba(0,0,0,${isDark ? 0.20 : 0.06}), ${specularTop}`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0, left: 0, right: 0,
      height: '1px',
      background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,${isDark ? 0.35 : 0.95}) 40%, rgba(255,255,255,${isDark ? 0.50 : 1}) 50%, rgba(255,255,255,${isDark ? 0.35 : 0.95}) 60%, transparent 100%)`,
      pointerEvents: 'none',
      zIndex: 1
    },
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: accentColor
        ? `0 8px 32px ${accentColor}28, 0 2px 8px rgba(0,0,0,${isDark ? 0.25 : 0.08}), ${specularTop}`
        : `0 8px 28px rgba(0,0,0,${isDark ? 0.28 : 0.10}), ${specularTop}`,
      ...extraHover
    }
  });

  // ── KPI cards ─────────────────────────────────────────────────────
  const kpiCards = [
    { label: 'Số dự án',       value: 1,              icon: <SearchStatus size={18} variant="Bold" />, color: '#3b82f6' },
    { label: 'Tổng thiết bị',  value: devices.length, icon: <Cpu          size={18} variant="Bold" />, color: '#8b5cf6' },
    { label: 'Lượt kiểm tra',  value: 12,             icon: <TickCircle   size={18} variant="Bold" />, color: '#10b981' },
    { label: 'Tổng cảnh báo',  value: 24,             icon: <Danger       size={18} variant="Bold" />, color: '#ef4444' },
    { label: 'Đã xử lý',       value: 5,              icon: <TickCircle   size={18} variant="Bold" />, color: '#10b981' },
    { label: 'Chưa xử lý',     value: 19,             icon: <CloseSquare  size={18} variant="Bold" />, color: '#f59e0b' }
  ];

  // ── Donut: Device Status ──────────────────────────────────────────
  const deviceDonutOptions = {
    chart: { type: 'donut' as const, fontFamily: "'Inter',sans-serif", background: 'transparent' },
    colors: ['#10b981', '#f59e0b', '#ef4444', '#64748b'],
    labels: ['Bình thường', 'Cảnh báo', 'Ngoại tuyến', 'Sự cố'],
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '70%', labels: { show: true, name: { show: false }, value: { show: true, fontSize: '22px', fontWeight: '800', color: txtPrimary, offsetY: 8, formatter: () => String(devices.length) } } } } },
    stroke: { show: true, width: 2, colors: [donutStroke] },
    tooltip: { enabled: true },
    theme: { mode: isDark ? 'dark' as const : 'light' as const }
  };

  // ── Donut: Connection Rate ────────────────────────────────────────
  const connectionDonutOptions = {
    chart: { type: 'donut' as const, fontFamily: "'Inter',sans-serif", background: 'transparent' },
    colors: ['#10b981', '#ef4444'],
    labels: ['Trực tuyến', 'Ngoại tuyến'],
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '70%', labels: { show: true, name: { show: false }, value: { show: true, fontSize: '20px', fontWeight: '800', color: txtPrimary, offsetY: 8, formatter: () => `${Math.round((onlineCount / (devices.length || 1)) * 100)}%` } } } } },
    stroke: { show: true, width: 2, colors: [donutStroke] },
    tooltip: { enabled: true },
    theme: { mode: isDark ? 'dark' as const : 'light' as const }
  };

  // ── Bar: Alert Classification ─────────────────────────────────────
  const alertBarOptions = {
    chart: { type: 'bar' as const, toolbar: { show: false }, fontFamily: "'Inter',sans-serif", background: 'transparent' },
    plotOptions: { bar: { horizontal: true, borderRadius: 5, dataLabels: { position: 'right' as const }, barHeight: '48%' } },
    colors: ['#ef4444', '#f59e0b', '#3b82f6'],
    dataLabels: { enabled: true, textAnchor: 'start' as const, style: { fontSize: '11px', fontWeight: 700, colors: [txtPrimary] }, formatter: (val: number) => `${val} ca`, offsetX: 8 },
    xaxis: { categories: ['Rất nghiêm trọng', 'Khẩn cấp', 'Bình thường'], labels: { style: { colors: txtSecondary, fontSize: '11px', fontWeight: 600 } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: txtSecondary, fontSize: '11px', fontWeight: 600 } } },
    grid: { borderColor: gridLine, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
    legend: { show: false },
    tooltip: { enabled: true },
    theme: { mode: isDark ? 'dark' as const : 'light' as const }
  };

  // ── Area: Sync Trend ──────────────────────────────────────────────
  const trendOptions = {
    chart: { type: 'area' as const, toolbar: { show: false }, fontFamily: "'Inter',sans-serif", background: 'transparent' },
    stroke: { curve: 'smooth' as const, width: [2, 2.5] },
    colors: ['#10b981', '#6366f1'],
    xaxis: { categories: ['00h', '04h', '08h', '12h', '16h', '20h', '24h'], labels: { style: { colors: txtSecondary, fontSize: '11px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: txtSecondary, fontSize: '11px' } } },
    grid: { borderColor: gridLine, strokeDashArray: 4, xaxis: { lines: { show: false } } },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.22, opacityTo: 0, stops: [0, 90, 100] } },
    markers: { size: 0 },
    legend: { show: true, position: 'top' as const, horizontalAlign: 'right' as const, fontSize: '11px', labels: { colors: txtPrimary } },
    tooltip: { enabled: true, x: { show: true } },
    theme: { mode: isDark ? 'dark' as const : 'light' as const }
  };

  // ── Section header helper ─────────────────────────────────────────
  const SectionHeader = ({ label, color, right }: { label: string; color: string; right?: React.ReactNode }) => (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
      <Box sx={{
        width: 4, height: 20, borderRadius: '2px',
        background: `linear-gradient(180deg, ${color} 0%, ${color}80 100%)`,
        boxShadow: `0 0 8px ${color}60`
      }} />
      <Typography sx={{ fontWeight: 700, color: txtPrimary, fontSize: '13.5px', flexGrow: 1 }}>
        {label}
      </Typography>
      {right}
    </Stack>
  );

  return (
    <Box sx={{ width: '100%' }}>

      {/* ── ROW 1: KPI Cards ────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {kpiCards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={idx}>
            <Box sx={{
              ...glassCard(card.color),
              height: '100%',
              // colored bottom glow line
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0, left: '15%', right: '15%',
                height: '2px',
                background: `linear-gradient(90deg, transparent, ${card.color}60, transparent)`,
                borderRadius: '0 0 16px 16px'
              }
            }}>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: txtSecondary, lineHeight: 1.3 }}>
                  {card.label}
                </Typography>
                {/* Glass icon badge */}
                <Box sx={{
                  width: 32, height: 32, borderRadius: '9px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isDark
                    ? `linear-gradient(135deg, ${card.color}30 0%, ${card.color}10 100%)`
                    : `linear-gradient(135deg, ${card.color}18 0%, ${card.color}08 100%)`,
                  border: `1px solid ${card.color}25`,
                  boxShadow: `0 2px 8px ${card.color}20, inset 0 1px 0 rgba(255,255,255,${isDark ? 0.15 : 0.70})`,
                  backdropFilter: 'blur(8px)',
                  color: card.color
                }}>
                  {card.icon}
                </Box>
              </Stack>
              <Typography sx={{
                fontSize: '34px', fontWeight: 800, color: txtPrimary, lineHeight: 1,
                textShadow: isDark ? `0 0 20px ${card.color}30` : 'none'
              }}>
                {card.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* ── ROW 2: Charts ───────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>

        {/* Card A: Trạng thái thiết bị */}
        <Grid item xs={12} md={4}>
          <Box sx={{ ...glassCard('#10b981'), height: '100%' }}>
            <SectionHeader label="Trạng thái thiết bị" color="#10b981" />
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={5} display="flex" justifyContent="center">
                <Box sx={{ width: 130, height: 130 }}>
                  <ReactApexChart options={deviceDonutOptions} series={[onlineCount, totalViolating, offlineCount, 0]} type="donut" height="100%" width="100%" />
                </Box>
              </Grid>
              <Grid item xs={7}>
                <Stack spacing={1.25} sx={{ pl: 1 }}>
                  {[
                    { label: 'Bình thường', value: onlineCount,    color: '#10b981' },
                    { label: 'Cảnh báo',    value: totalViolating, color: '#f59e0b' },
                    { label: 'Ngoại tuyến', value: offlineCount,   color: '#ef4444' },
                    { label: 'Sự cố',       value: 0,              color: '#64748b' }
                  ].map((s, i) => (
                    <Stack key={i} direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: s.color, boxShadow: `0 0 5px ${s.color}80` }} />
                        <Typography sx={{ fontSize: '11px', color: txtSecondary, fontWeight: 600 }}>{s.label}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography sx={{ fontSize: '13px', fontWeight: 800, color: txtPrimary }}>{s.value}</Typography>
                        <Typography sx={{ fontSize: '10px', color: txtSecondary }}>({Math.round((s.value / (devices.length || 1)) * 100)}%)</Typography>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Card B: Phân loại cảnh báo */}
        <Grid item xs={12} md={4}>
          <Box sx={{ ...glassCard('#ef4444'), height: '100%' }}>
            <SectionHeader
              label="Phân loại cảnh báo"
              color="#ef4444"
              right={<Typography sx={{ fontSize: '11px', fontWeight: 700, color: txtSecondary }}>Tổng: 24 ca</Typography>}
            />
            <Box sx={{ height: 160 }}>
              <ReactApexChart options={alertBarOptions} series={[{ name: 'Số ca', data: [16, 4, 4] }]} type="bar" height="100%" />
            </Box>
            <Stack direction="row" justifyContent="space-around" sx={{ mt: 1.5 }}>
              {[
                { label: 'Rất nghiêm trọng', pct: '66.67%', color: '#ef4444' },
                { label: 'Khẩn cấp',         pct: '16.67%', color: '#f59e0b' },
                { label: 'Bình thường',       pct: '16.67%', color: '#3b82f6' }
              ].map((item, i) => (
                <Stack key={i} alignItems="center" spacing={0.3}>
                  <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: item.color, boxShadow: `0 0 5px ${item.color}80` }} />
                  <Typography sx={{ fontSize: '9.5px', color: txtSecondary, fontWeight: 600, textAlign: 'center' }}>{item.label}</Typography>
                  <Typography sx={{ fontSize: '12px', fontWeight: 800, color: txtPrimary }}>{item.pct}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Grid>

        {/* Card C: Tỷ lệ kết nối */}
        <Grid item xs={12} md={4}>
          <Box sx={{ ...glassCard('#6366f1'), height: '100%' }}>
            <SectionHeader label="Tỷ lệ kết nối trực tuyến" color="#6366f1" />
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={5} display="flex" justifyContent="center">
                <Box sx={{ width: 130, height: 130 }}>
                  <ReactApexChart options={connectionDonutOptions} series={[onlineCount, offlineCount]} type="donut" height="100%" width="100%" />
                </Box>
              </Grid>
              <Grid item xs={7}>
                <Stack spacing={1.5} sx={{ pl: 1 }}>
                  {[
                    { label: 'Trực tuyến',  value: onlineCount,  pct: Math.round((onlineCount  / (devices.length || 1)) * 100), color: '#10b981' },
                    { label: 'Ngoại tuyến', value: offlineCount, pct: Math.round((offlineCount / (devices.length || 1)) * 100), color: '#ef4444' }
                  ].map((s, i) => (
                    <Box key={i} sx={{
                      p: 1.25, borderRadius: '12px',
                      background: isDark ? `${s.color}12` : `${s.color}09`,
                      border: `1px solid ${s.color}28`,
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,${isDark ? 0.08 : 0.70}), 0 2px 6px ${s.color}12`
                    }}>
                      <Stack direction="row" spacing={0.7} alignItems="center" sx={{ mb: 0.25 }}>
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: s.color, boxShadow: `0 0 5px ${s.color}` }} />
                        <Typography sx={{ fontSize: '11px', color: txtSecondary, fontWeight: 600 }}>{s.label}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="baseline" spacing={0.5}>
                        <Typography sx={{ fontSize: '22px', fontWeight: 800, color: s.color, lineHeight: 1, textShadow: isDark ? `0 0 12px ${s.color}50` : 'none' }}>{s.pct}%</Typography>
                        <Typography sx={{ fontSize: '10px', color: txtSecondary }}>{s.value} thiết bị</Typography>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Grid>

      </Grid>

      {/* ── ROW 3: Trend + Subject List ─────────────────────────────── */}
      <Grid container spacing={2}>

        {/* Sync Trend */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ ...glassCard('#6366f1') }}>
            <SectionHeader label="Xu hướng truyền tin (Sync Trend)" color="#6366f1" />
            <Box sx={{ height: 210 }}>
              <ReactApexChart options={trendOptions} series={[{ name: 'Hôm qua', data: [30, 45, 55, 75, 120, 80, 40] }, { name: 'Hôm nay', data: [40, 60, 70, 95, 140, 95, 50] }]} type="area" height="100%" />
            </Box>
          </Box>
        </Grid>

        {/* Subject List */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ ...glassCard('#8b5cf6'), height: '100%' }}>
            <SectionHeader
              label="Danh sách đối tượng"
              color="#8b5cf6"
              right={
                <Chip
                  label={`${devices.filter((d) => d.subject !== null).length} người`}
                  size="small"
                  sx={{
                    height: 20, fontSize: '10px', fontWeight: 700,
                    bgcolor: isDark ? 'rgba(139,92,246,0.18)' : 'rgba(139,92,246,0.10)',
                    color: '#8b5cf6',
                    border: '1px solid rgba(139,92,246,0.25)'
                  }}
                />
              }
            />
            <Stack spacing={1} sx={{ maxHeight: 230, overflowY: 'auto', pr: 0.5 }}>
              {devices.filter((d) => d.subject !== null).length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Profile2User size={32} color={txtSecondary} />
                  <Typography sx={{ fontSize: '12px', color: txtSecondary, mt: 1 }}>Chưa có đối tượng nào</Typography>
                </Box>
              ) : (
                devices.filter((d) => d.subject !== null).map((dev) => (
                  <Box
                    key={dev.id}
                    onClick={() => { setDashboardView('tracking'); setSelectedDeviceId(dev.id); }}
                    sx={{
                      p: 1.3,
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.80)',
                      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.50)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,${isDark ? 0.08 : 0.90})`,
                      '&:hover': {
                        borderColor: dev.color,
                        boxShadow: `0 4px 16px ${dev.color}22, inset 0 1px 0 rgba(255,255,255,${isDark ? 0.12 : 0.95})`,
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    <Stack direction="row" spacing={1.2} justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Avatar sx={{ width: 30, height: 30, bgcolor: dev.color, fontSize: '11px', fontWeight: 700, boxShadow: `0 2px 8px ${dev.color}50` }}>
                          {dev.subject?.fullName.split(' ').slice(-1)[0]?.charAt(0) ?? '?'}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: txtPrimary, lineHeight: 1.2 }}>{dev.subject?.fullName}</Typography>
                          <Typography sx={{ fontSize: '10px', color: txtSecondary, lineHeight: 1.2 }}>{dev.name}</Typography>
                        </Box>
                      </Stack>
                      <Chip
                        label={dev.status.connectionStatus === 'online' ? 'Online' : 'Offline'}
                        size="small"
                        color={dev.status.connectionStatus === 'online' ? 'success' : 'default'}
                        sx={{ height: 18, fontSize: '9px', fontWeight: 800 }}
                      />
                    </Stack>
                  </Box>
                ))
              )}
            </Stack>
          </Box>
        </Grid>

      </Grid>
    </Box>
  );
}
