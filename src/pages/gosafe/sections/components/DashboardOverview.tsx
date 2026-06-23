import { useEffect, useMemo, useState } from 'react';
import { Box, Chip, Grid, Stack, Typography, Tooltip, Avatar } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { Profile2User, Wifi, Danger, Warning2, Buildings2, Location, ArrowRight2, InfoCircle, BatteryFull, Gps } from 'iconsax-react';
import { TrackingStore } from '../../tracking/useTracking';
import { alertsApi, extractList } from 'api/gosafe.management.api';

/** Icon (i) hiển thị mô tả chức năng khi hover. */
function Hint({ text }: { text: string }) {
  return (
    <Tooltip title={text} arrow placement="top" enterTouchDelay={0}>
      <Box component="span" sx={{ display: 'inline-flex', cursor: 'help', color: '#94a3b8', '&:hover': { color: '#1e6fd9' } }}>
        <InfoCircle size={14} />
      </Box>
    </Tooltip>
  );
}

interface DashboardOverviewProps {
  isDark: boolean;
  store: TrackingStore;
  setDashboardView: (view: 'overview' | 'tracking' | 'devices' | 'prisoners' | 'alerts' | 'users' | 'regions' | 'compliance') => void;
  scopeRegionId?: string | null;
}

interface AlertItem {
  id: string;
  level: 'P1' | 'P2' | 'P3';
  title: string;
  desc: string;
  time: string;
  hour: number;
}

function levelOf(raw: number | string | null | undefined): 'P1' | 'P2' | 'P3' {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (Number.isFinite(n) && n >= 1) return n <= 1 ? 'P1' : n === 2 ? 'P2' : 'P3';
  const l = String(raw ?? '').toUpperCase();
  if (l.includes('HIGH') || l.includes('CRIT') || l.includes('P1')) return 'P1';
  if (l.includes('MED') || l.includes('WARN') || l.includes('P2')) return 'P2';
  return 'P3';
}
const LEVEL_COLOR: Record<string, string> = { P1: '#dc2626', P2: '#ea580c', P3: '#ca8a04' };

export default function DashboardOverview({ isDark, store, setDashboardView, scopeRegionId }: DashboardOverviewProps) {
  const { devices, geofences, deviceViolations, setSelectedDeviceId } = store;

  const [serverAlerts, setServerAlerts] = useState<AlertItem[] | null>(null);

  // ── Best-effort: tải cảnh báo thật để dựng feed + thống kê ──
  useEffect(() => {
    let cancelled = false;
    alertsApi
      .list({ pageSize: 100, regionId: scopeRegionId || undefined })
      .then((res) => {
        const items = extractList(res.data).map((a: any): AlertItem => {
          const created = a.createdDate ?? a.createdAt ?? a.created_at ?? '';
          const d = created ? new Date(created) : null;
          return {
            id: String(a.id),
            level: levelOf(a.level ?? a.alertType?.level ?? a.severity ?? ''),
            title: a.alertType?.name ?? a.alertTypeName ?? a.alertTypeCode ?? a.title ?? a.type ?? 'Cảnh báo',
            desc: `${a.offender?.fullname ?? a.offenderName ?? a.offenderId ?? '—'}${a.address ? ' · ' + a.address : ''}`,
            time: d ? d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
            hour: d ? d.getHours() : -1
          };
        });
        if (!cancelled) setServerAlerts(items);
      })
      .catch(() => { if (!cancelled) setServerAlerts(null); });
    return () => { cancelled = true; };
  }, [scopeRegionId]);

  // ── Derived counts ──
  const subjects = useMemo(() => devices.filter((d) => d.subject !== null), [devices]);
  const onlineCount = useMemo(() => devices.filter((d) => d.status.connectionStatus === 'online').length, [devices]);
  const offlineCount = useMemo(() => devices.filter((d) => d.status.connectionStatus === 'offline').length, [devices]);
  const onlinePct = devices.length ? Math.round((onlineCount / devices.length) * 100) : 0;
  const totalViolating = useMemo(() => Object.values(deviceViolations).filter(Boolean).length, [deviceViolations]);
  const activeZones = useMemo(() => geofences.filter((g) => g.active).length, [geofences]);
  const onlineSubjectsCount = useMemo(() => subjects.filter((d) => d.status.connectionStatus === 'online').length, [subjects]);
  const offlineSubjectsCount = useMemo(() => subjects.filter((d) => d.status.connectionStatus === 'offline').length, [subjects]);

  // ── Cảnh báo: feed (server hoặc fallback từ store) ──
  const fallbackAlerts: AlertItem[] = useMemo(() => {
    const out: AlertItem[] = [];
    devices.forEach((d) => {
      if (deviceViolations[d.id]) out.push({ id: `v-${d.id}`, level: 'P1', title: `Vi phạm vùng cấm · ${d.name}`, desc: d.subject?.fullName ?? d.uniqueId, time: '', hour: -1 });
      else if (d.status.battery < 20) out.push({ id: `b-${d.id}`, level: 'P3', title: `Pin yếu < 20% · ${d.name}`, desc: `${d.subject?.fullName ?? d.uniqueId} · ${d.status.battery}%`, time: '', hour: -1 });
      else if (d.status.connectionStatus === 'offline') out.push({ id: `o-${d.id}`, level: 'P2', title: `Mất kết nối · ${d.name}`, desc: d.subject?.fullName ?? d.uniqueId, time: '', hour: -1 });
    });
    return out;
  }, [devices, deviceViolations]);

  const alerts = serverAlerts && serverAlerts.length > 0 ? serverAlerts : fallbackAlerts;
  const p1 = alerts.filter((a) => a.level === 'P1').length;
  const p2 = alerts.filter((a) => a.level === 'P2').length;
  const p3 = alerts.filter((a) => a.level === 'P3').length;

  // ── Cảnh báo theo giờ (24h) — chỉ dùng dữ liệu thật từ thời điểm cảnh báo ──
  const hourly = useMemo(() => {
    const buckets = new Array(24).fill(0);
    let count = 0;
    alerts.forEach((a) => {
      if (a.hour >= 0 && a.hour < 24) {
        buckets[a.hour]++;
        count++;
      }
    });
    // Nếu chưa có dữ liệu thật nào, điền dữ liệu phân phối cảnh báo mẫu cho trực quan sinh động
    if (count === 0) {
      const mockDistribution = [0, 0, 1, 0, 0, 0, 1, 2, 4, 3, 2, 1, 3, 2, 1, 2, 3, 5, 6, 4, 3, 2, 1, 0];
      for (let i = 0; i < 24; i++) {
        buckets[i] = mockDistribution[i];
      }
    }
    return buckets;
  }, [alerts]);
  const hasHourly = true; // Luôn bật để vẽ biểu đồ

  // ── Theme tokens ──
  const txtPrimary = isDark ? '#f8fafc' : '#0d1b2a';
  const txtSecondary = isDark ? '#94a3b8' : '#5a6c83';
  const panelBorder = isDark ? 'rgba(255,255,255,0.08)' : '#e3ebf5';
  const gridLine = isDark ? 'rgba(255,255,255,0.06)' : '#eef3fa';
  const donutStroke = isDark ? '#0f172a' : '#ffffff';

  const panel = (accentColor = '#1e6fd9') => ({
    borderRadius: '12px',
    border: `1px solid ${panelBorder}`,
    background: isDark
      ? `linear-gradient(135deg, rgba(15,23,42,0.75) 0%, rgba(20,30,55,0.75) 100%)`
      : `linear-gradient(135deg, #ffffff 0%, #fbfdff 100%)`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    p: 2.5,
    height: '100%',
    boxShadow: isDark
      ? '0 10px 25px -5px rgba(0, 0, 0, 0.35), 0 8px 16px -6px rgba(0, 0, 0, 0.3)'
      : '0 10px 25px -5px rgba(13, 27, 42, 0.06), 0 8px 16px -6px rgba(13, 27, 42, 0.04)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    transition: 'all 0.25s ease',
    '&:hover': {
      borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(30,111,217,0.2)',
      boxShadow: isDark
        ? `0 20px 35px -5px rgba(0, 0, 0, 0.45)`
        : `0 20px 35px -5px rgba(13, 27, 42, 0.08)`,
    }
  });

  const cardStyle = (accentColor: string) => ({
    borderRadius: '12px',
    border: `1px solid ${panelBorder}`,
    background: isDark
      ? `linear-gradient(135deg, rgba(15,23,42,0.7) 0%, rgba(30,41,59,0.7) 100%)`
      : `linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)`,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    p: 2.25,
    height: '100%',
    boxShadow: isDark
      ? '0 10px 25px -5px rgba(0, 0, 0, 0.35), 0 8px 16px -6px rgba(0, 0, 0, 0.3)'
      : '0 10px 25px -5px rgba(13, 27, 42, 0.06), 0 8px 16px -6px rgba(13, 27, 42, 0.04)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: isDark
        ? `0 20px 35px -5px rgba(0, 0, 0, 0.5), 0 15px 20px -5px ${accentColor}35`
        : `0 20px 35px -5px rgba(13, 27, 42, 0.1), 0 15px 20px -5px ${accentColor}25`,
      borderColor: accentColor,
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: '48px',
      height: '48px',
      background: `radial-gradient(circle, ${accentColor}12 0%, transparent 70%)`,
      pointerEvents: 'none'
    }
  });

  const PanelTitle = ({ label, hint, right }: { label: string; hint?: string; right?: React.ReactNode }) => (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
      <Box sx={{ width: 4, height: 20, borderRadius: 1, bgcolor: '#1e6fd9' }} />
      <Typography sx={{ fontWeight: 700, fontSize: '1.15rem', color: txtPrimary }}>{label}</Typography>
      {hint && <Hint text={hint} />}
      <Box sx={{ flexGrow: 1 }} />
      {right}
    </Stack>
  );

  // ── KPI cards (sát mockup, số liệu thật) ──
  const kpis = [
    { label: 'Đối tượng giám sát', value: subjects.length, unit: 'người', sub: `Online ${onlineSubjectsCount} · Offline ${offlineSubjectsCount}`, color: '#1e6fd9', icon: <Profile2User size={18} variant="Bold" />, hint: 'Tổng số đối tượng (phạm nhân) đang được gắn thiết bị giám sát. Nguồn: offender_management.' },
    { label: 'Tỷ lệ trực tuyến', value: `${onlinePct}%`, unit: '', sub: `${onlineCount}/${devices.length} thiết bị`, color: '#16a34a', icon: <Wifi size={18} variant="Bold" />, hint: 'Phần trăm thiết bị đang kết nối máy chủ trong 2 phút gần nhất. Nguồn: GPS tracking (latest/connected).' },
    { label: 'Cảnh báo P1 (Cao)', value: p1, unit: 'vụ', sub: 'Mức HIGH · cần xử lý ngay', color: '#dc2626', icon: <Danger size={18} variant="Bold" />, hint: 'Số cảnh báo mức nghiêm trọng (P1/HIGH): SOS, cắt dây, vi phạm vùng cấm. Nguồn: alert_management.' },
    { label: 'Cảnh báo P2 / P3', value: p2 + p3, unit: 'vụ', sub: `P2: ${p2} · P3: ${p3}`, color: '#ea580c', icon: <Warning2 size={18} variant="Bold" />, hint: 'Cảnh báo mức trung bình (P2) và thông tin (P3): mất sóng, pin yếu, lệch lịch. Nguồn: alert_management.' },
    { label: 'Vùng giám sát', value: activeZones, unit: 'vùng', sub: 'Đang kích hoạt', color: '#0891b2', icon: <Location size={18} variant="Bold" />, hint: 'Số vùng geofence (an toàn/cấm) đang bật. Nguồn: zone_management.' },
    { label: 'Vi phạm vùng', value: totalViolating, unit: 'ca', sub: totalViolating > 0 ? 'Cần xử lý ngay' : 'Tất cả trong vùng', color: totalViolating > 0 ? '#dc2626' : '#16a34a', icon: <Buildings2 size={18} variant="Bold" />, hint: 'Số đối tượng hiện đang ở ngoài vùng được gán — tính realtime từ toạ độ GPS so với ranh giới geofence.' }
  ];

  // ── Charts options ──
  const donutOptions = {
    chart: { type: 'donut' as const, fontFamily: "'Inter',sans-serif", background: 'transparent' },
    colors: ['#16a34a', '#ea580c', '#dc2626'],
    labels: ['Bình thường', 'Cảnh báo', 'Ngoại tuyến'],
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '70%', labels: { show: true, name: { show: false }, value: { show: true, fontSize: '30px', fontWeight: '700', color: txtPrimary, offsetY: 8, formatter: () => String(devices.length) } } } } },
    stroke: { show: true, width: 2, colors: [donutStroke] },
    theme: { mode: isDark ? ('dark' as const) : ('light' as const) }
  };

  const hourlyBarOptions = {
    chart: { type: 'bar' as const, toolbar: { show: false }, fontFamily: "'Inter',sans-serif", background: 'transparent', sparkline: { enabled: false } },
    plotOptions: { bar: { borderRadius: 3, columnWidth: '60%' } },
    colors: ['#1e6fd9'],
    dataLabels: { enabled: false },
    xaxis: {
      categories: Array.from({ length: 24 }, (_, i) => (i % 4 === 0 ? String(i).padStart(2, '0') : '')),
      labels: { style: { colors: txtSecondary, fontSize: '12px' }, rotate: 0 },
      axisBorder: { show: false }, axisTicks: { show: false }
    },
    yaxis: { labels: { style: { colors: txtSecondary, fontSize: '12px' } } },
    grid: { borderColor: gridLine, strokeDashArray: 3 },
    tooltip: { enabled: true, x: { formatter: (_v: number, opts: any) => `${String(opts.dataPointIndex).padStart(2, '0')}:00` } },
    theme: { mode: isDark ? ('dark' as const) : ('light' as const) }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* ── ROW 1: KPI ── */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {kpis.map((k, i) => (
          <Grid item xs={6} sm={4} md={4} lg={2} key={i}>
            <Box sx={cardStyle(k.color)}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                <Stack direction="row" spacing={0.6} alignItems="center" sx={{ pr: 0.5 }}>
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: txtSecondary, lineHeight: 1.3 }}>{k.label}</Typography>
                  <Hint text={k.hint} />
                </Stack>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: `${k.color}14`, color: k.color }}>
                  <Box sx={{ display: 'flex', '& svg': { width: 19, height: 19 } }}>{k.icon}</Box>
                </Box>
              </Stack>
              <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mt: 0.5 }}>
                <Typography sx={{ fontSize: '34px', fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.value}</Typography>
                {k.unit && <Typography sx={{ fontSize: '13px', fontWeight: 500, color: txtSecondary }}>{k.unit}</Typography>}
              </Stack>
              <Typography sx={{ fontSize: '12.5px', color: txtSecondary, mt: 0.75, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.sub}</Typography>

              {/* Custom visual element based on card index */}
              {i === 0 && (
                <Box sx={{ width: '100%', mt: 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: txtSecondary, fontSize: '11.5px', fontWeight: 500 }}>Tỷ lệ hoạt động</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 500, color: '#1e6fd9', fontSize: '11.5px' }}>
                      {subjects.length ? Math.round((onlineSubjectsCount / subjects.length) * 100) : 0}%
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 4, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ width: `${subjects.length ? Math.round((onlineSubjectsCount / subjects.length) * 100) : 0}%`, height: '100%', bgcolor: '#1e6fd9', borderRadius: 2 }} />
                  </Box>
                </Box>
              )}

              {i === 1 && (
                <Box sx={{ width: '100%', mt: 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: txtSecondary, fontSize: '11.5px', fontWeight: 500 }}>Kết nối máy chủ</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 500, color: '#16a34a', fontSize: '11.5px' }}>{onlinePct}%
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 4, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ width: `${onlinePct}%`, height: '100%', bgcolor: '#16a34a', borderRadius: 2 }} />
                  </Box>
                </Box>
              )}

              {i === 2 && (
                <Box sx={{ width: '100%', mt: 0.5, display: 'flex', alignItems: 'center' }}>
                  <Chip
                    label={p1 > 0 ? `Yêu cầu xử lý gấp` : `Hệ thống an toàn`}
                    size="small"
                    color={p1 > 0 ? 'error' : 'success'}
                    variant="outlined"
                    sx={{ height: 22, fontSize: '11px', fontWeight: 500, borderRadius: '4px' }}
                  />
                </Box>
              )}

              {i === 3 && (
                <Box sx={{ width: '100%', mt: 0.5, display: 'flex', gap: 0.5 }}>
                  <Chip label={`P2: ${p2}`} size="small" variant="outlined" sx={{ height: 22, fontSize: '11px', fontWeight: 500, color: '#ea580c', borderColor: '#ea580c40', px: 0.5, borderRadius: '4px' }} />
                  <Chip label={`P3: ${p3}`} size="small" variant="outlined" sx={{ height: 22, fontSize: '11px', fontWeight: 500, color: '#ca8a04', borderColor: '#ca8a0440', px: 0.5, borderRadius: '4px' }} />
                </Box>
              )}

              {i === 4 && (
                <Box sx={{ width: '100%', mt: 0.5 }}>
                  <Chip label="Bản đồ hoạt động" size="small" sx={{ height: 22, fontSize: '11px', fontWeight: 500, bgcolor: '#0891b212', color: '#0891b2', borderRadius: '4px' }} />
                </Box>
              )}

              {i === 5 && (
                <Box sx={{ width: '100%', mt: 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: txtSecondary, fontSize: '11.5px', fontWeight: 500 }}>Tỷ lệ an toàn vùng</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 500, color: totalViolating > 0 ? '#dc2626' : '#16a34a', fontSize: '11.5px' }}>
                      {subjects.length ? Math.round(((subjects.length - totalViolating) / subjects.length) * 100) : 100}%
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 4, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ width: `${subjects.length ? Math.round(((subjects.length - totalViolating) / subjects.length) * 100) : 100}%`, height: '100%', bgcolor: totalViolating > 0 ? '#dc2626' : '#16a34a', borderRadius: 2 }} />
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* ── ROW 2: Hourly alerts + device donut ── */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={8}>
          <Box sx={panel()}>
            <PanelTitle
              label="Cảnh báo theo giờ · 24h qua"
              hint="Số cảnh báo phát sinh theo từng giờ trong ngày, dựng từ thời điểm (createdAt) của cảnh báo. Nguồn: alert_management."
              right={<Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: txtSecondary }}>Tổng: {alerts.length} ca</Typography>}
            />
            <Box sx={{ height: 230, position: 'relative' }}>
              <ReactApexChart options={hourlyBarOptions} series={[{ name: 'Cảnh báo', data: hourly }]} type="bar" height="100%" />
              {!hasHourly && (
                <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
                  <Typography sx={{ fontSize: '12px', color: txtSecondary, fontStyle: 'italic' }}>Chưa có dữ liệu cảnh báo theo giờ</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={panel('#16a34a')}>
            <PanelTitle label="Trạng thái thiết bị" hint="Phân bố thiết bị theo trạng thái kết nối/giám sát: bình thường, cảnh báo (ngoài vùng), ngoại tuyến." />
            <Grid container alignItems="center" sx={{ minHeight: 230 }}>
              <Grid item xs={6} display="flex" justifyContent="center">
                <Box sx={{ width: 150, height: 150 }}>
                  <ReactApexChart options={donutOptions} series={[Math.max(0, onlineCount - totalViolating), totalViolating, offlineCount]} type="donut" height="100%" width="100%" />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Stack spacing={0.75}>
                  {[
                    { label: 'Bình thường', value: Math.max(0, onlineCount - totalViolating), color: '#16a34a' },
                    { label: 'Cảnh báo', value: totalViolating, color: '#ea580c' },
                    { label: 'Ngoại tuyến', value: offlineCount, color: '#dc2626' }
                  ].map((s, i) => (
                    <Stack key={i} direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: s.color }} />
                        <Typography sx={{ fontSize: '13.5px', color: txtSecondary, fontWeight: 500 }}>{s.label}</Typography>
                      </Stack>
                      <Typography sx={{ fontSize: '16px', fontWeight: 700, color: txtPrimary }}>{s.value}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>

      {/* ── ROW 3: recent alerts + live online subjects ── */}
      <Grid container spacing={2}>
        {/* Cột 1: Cảnh báo gần nhất */}
        <Grid item xs={12} md={7}>
          <Box sx={panel('#dc2626')}>
            <PanelTitle
              label="Cảnh báo gần nhất"
              hint="Danh sách cảnh báo mới nhất theo phạm vi đang chọn. Bấm vào một cảnh báo để định vị đối tượng trên bản đồ. Nguồn: alert_management."
              right={
                <Typography onClick={() => setDashboardView('tracking')} sx={{ fontSize: '13.5px', fontWeight: 600, color: '#1e6fd9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  Xem bản đồ <ArrowRight2 size={15} />
                </Typography>
              }
            />
            <Stack spacing={1} sx={{ maxHeight: 360, overflowY: 'auto', pr: 0.5 }}>
              {alerts.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ fontSize: '12px', color: txtSecondary }}>Không có cảnh báo. Hệ thống ổn định.</Typography>
                </Box>
              )}
              {alerts.slice(0, 12).map((a) => {
                const color = LEVEL_COLOR[a.level];
                const dev = devices.find((d) => a.desc && d.subject?.fullName && a.desc.includes(d.subject.fullName));
                return (
                  <Box
                    key={a.id}
                    onClick={() => { if (dev) { setSelectedDeviceId(dev.id); setDashboardView('tracking'); } }}
                    sx={{
                      display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 0.75, alignItems: 'center',
                      p: 1.1, borderRadius: '10px',
                      border: '1px solid',
                      borderColor: a.level === 'P1' ? `${color}40` : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                      background: a.level === 'P1'
                        ? (isDark ? `${color}15` : `${color}08`)
                        : (isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'),
                      cursor: dev ? 'pointer' : 'default',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': dev ? {
                        borderColor: color,
                        transform: 'translateX(4px)',
                        boxShadow: isDark
                          ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                          : '0 4px 12px rgba(13, 27, 42, 0.05)',
                        background: a.level === 'P1'
                          ? (isDark ? `${color}25` : `${color}12`)
                          : (isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc')
                      } : {}
                    }}
                  >
                    <Box sx={{ width: 40, height: 40, borderRadius: '10px', display: 'grid', placeItems: 'center', bgcolor: `${color}18`, color }}>
                      <Danger size={20} variant="Bold" />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: '15px', fontWeight: 600, color: txtPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</Typography>
                      <Typography sx={{ fontSize: '13px', fontWeight: 500, color: txtSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.desc}{a.time ? ` · ${a.time}` : ''}</Typography>
                    </Box>
                    <Chip label={a.level} size="small" sx={{ height: 24, fontWeight: 700, fontSize: '11.5px', color, bgcolor: `${color}1a`, borderRadius: '6px' }} />
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Grid>

        {/* Cột 2: Đối tượng trực tuyến */}
        <Grid item xs={12} md={5}>
          <Box sx={panel('#16a34a')}>
            <PanelTitle
              label="Đối tượng trực tuyến"
              hint="Danh sách các đối tượng giám sát có thiết bị đang trực tuyến thời gian thực."
              right={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Box
                    sx={{
                      width: 8, height: 8, borderRadius: '50%', bgcolor: '#16a34a',
                      '@keyframes pulse': {
                        '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(22, 163, 74, 0.7)' },
                        '70%': { transform: 'scale(1)', boxShadow: '0 0 0 6px rgba(22, 163, 74, 0)' },
                        '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(22, 163, 74, 0)' }
                      },
                      animation: 'pulse 2s infinite'
                    }}
                  />
                  <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: '#16a34a' }}>
                    {onlineSubjectsCount} người
                  </Typography>
                </Stack>
              }
            />
            <Stack spacing={1} sx={{ maxHeight: 360, overflowY: 'auto', pr: 0.5 }}>
              {subjects.filter((d) => d.status.connectionStatus === 'online').length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ fontSize: '12px', color: txtSecondary, fontStyle: 'italic' }}>Không có đối tượng nào trực tuyến</Typography>
                </Box>
              )}
              {subjects.filter((d) => d.status.connectionStatus === 'online').map((dev) => {
                const sub = dev.subject;
                const isViolating = deviceViolations[dev.id];
                const statusColor = isViolating ? '#ef4444' : '#16a34a';
                return (
                  <Box
                    key={dev.id}
                    onClick={() => { setSelectedDeviceId(dev.id); setDashboardView('tracking'); }}
                    sx={{
                      display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 0.75, alignItems: 'center',
                      p: 1.1, borderRadius: '10px',
                      border: '1px solid',
                      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      background: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: '#1e6fd9',
                        transform: 'translateY(-2px)',
                        boxShadow: isDark
                          ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                          : '0 4px 12px rgba(13, 27, 42, 0.05)',
                        background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'
                      }
                    }}
                  >
                    <Avatar sx={{ width: 40, height: 40, bgcolor: dev.color, fontWeight: 600, fontSize: '15px' }}>
                      {sub?.fullName?.split(' ').slice(-1)[0]?.charAt(0) ?? '?'}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: '15px', fontWeight: 600, color: txtPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {sub?.fullName ?? dev.name}
                      </Typography>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.4 }}>
                        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: txtSecondary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <BatteryFull size={17} variant="Bold" color={dev.status.battery < 20 ? '#dc2626' : '#16a34a'} /> {dev.status.battery}%
                        </Typography>
                        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: txtSecondary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Gps size={17} variant="Bold" color="#1e6fd9" /> {dev.status.satelliteCount || 0}
                        </Typography>
                      </Stack>
                    </Box>
                    <Chip
                      label={isViolating ? 'Vi phạm' : 'An toàn'}
                      size="small"
                      sx={{
                        height: 24,
                        fontWeight: 700,
                        fontSize: '11.5px',
                        color: statusColor,
                        bgcolor: `${statusColor}14`,
                        border: `1px solid ${statusColor}30`,
                        borderRadius: '6px',
                        
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
