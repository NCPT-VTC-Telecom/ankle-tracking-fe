import { useState } from 'react';
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import {
  Setting2,
  Notification,
  SearchNormal1,
  Filter,
  InfoCircle,
  Danger,
  ArrowDown2,
  Profile
} from 'iconsax-react';

// ─── SVG Components for Instant Rendering ────────────────────────────────────

// Hexagon logo in header
const HexagonLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer' }}>
    <path d="M16 2.5L28.5 9.7V22.3L16 29.5L3.5 22.3V9.7L16 2.5Z" fill="#111827" stroke="#374151" strokeWidth="1" />
    <circle cx="16" cy="16" r="4.5" fill="#ffffff" />
  </svg>
);

// Sparkline line chart for Card 1
const SparklineLine = () => (
  <svg width="68" height="32" viewBox="0 0 68 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2 28 C12 23, 18 30, 26 18 C34 6, 42 26, 50 12 C58 -2, 62 6, 66 2"
      stroke="#3b82f6"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Sparkline bar chart for Card 2 & 4
const SparklineBars = ({ color, values }: { color: string; values: number[] }) => (
  <svg width="48" height="32" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {values.map((val, idx) => (
      <rect
        key={idx}
        x={idx * 8 + 2}
        y={32 - val}
        width="4.5"
        height={val}
        rx="2.25"
        fill={color}
      />
    ))}
  </svg>
);

// Sparkline circular ring for Card 3
const SparklineRing = ({ value, color }: { value: number; color: string }) => {
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="17" cy="17" r={radius} stroke="rgba(226, 232, 240, 0.8)" strokeWidth="3.5" fill="none" />
      <circle
        cx="17"
        cy="17"
        r={radius}
        stroke={color}
        strokeWidth="3.5"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />
    </svg>
  );
};

// ECG heartbeat wave generator
const HeartbeatWave = ({ color }: { color: string }) => (
  <svg width="55" height="18" viewBox="0 0 55 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8, verticalAlign: 'middle' }}>
    <path
      d="M0 9 H14 L17 4 L20 14 L23 1 L26 17 L29 7 L32 11 L35 9 H55"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Mini bar indicator for SpO2 values
const MiniSpO2Bars = ({ level, color }: { level: number; color: string }) => (
  <Stack direction="row" spacing={0.3} alignItems="flex-end" sx={{ height: 14, display: 'inline-flex', mr: 1, verticalAlign: 'middle' }}>
    {[1, 2, 3, 4, 5].map((idx) => (
      <Box
        key={idx}
        sx={{
          width: 3,
          height: idx * 2.2 + 3,
          bgcolor: idx <= level ? color : 'rgba(0,0,0,0.08)',
          borderRadius: '0.8px'
        }}
      />
    ))}
  </Stack>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [patientFilter, setPatientFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceMonth, setDeviceMonth] = useState('Feb 2026');

  // Chart configuration for Report & Insights (donut)
  const donutOptions = {
    chart: {
      type: 'donut' as const,
      fontFamily: "'Inter', sans-serif"
    },
    colors: ['#10b981', '#f59e0b', '#ef4444'], // Stable, At Risk, Critical
    labels: ['Stable', 'At Risk', 'Critical'],
    legend: {
      show: false
    },
    dataLabels: {
      enabled: false
    },
    plotOptions: {
      pie: {
        donut: {
          size: '80%',
          labels: {
            show: true,
            name: { show: false },
            value: {
              show: true,
              fontSize: '30px',
              fontWeight: '800',
              color: '#111827',
              offsetY: 8,
              formatter: (val: string) => val
            },
            total: {
              show: true,
              label: 'Total Reports',
              fontSize: '11px',
              fontWeight: '600',
              color: '#6b7280',
              formatter: () => '142'
            }
          }
        }
      }
    },
    stroke: {
      show: true,
      width: 3,
      colors: ['#ffffff']
    },
    tooltip: {
      enabled: true
    }
  };

  const donutSeries = [74, 54, 28]; // Matches 52%, 38%, 20% on 142 reports

  // Chart configuration for Device Status (stacked columns)
  const barOptions = {
    chart: {
      type: 'bar' as const,
      stacked: true,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "'Inter', sans-serif"
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '24%',
        borderRadius: 8,
        borderRadiusApplication: 'around' as const,
        borderRadiusWhenStacked: 'all' as const
      }
    },
    colors: ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'], // Online, Offline, Battery Low, Signal Loss
    xaxis: {
      categories: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '11px',
          fontWeight: 600
        }
      }
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 5,
      labels: {
        style: {
          colors: '#9ca3af',
          fontSize: '11px'
        }
      }
    },
    grid: {
      show: true,
      borderColor: '#f3f4f6',
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    tooltip: { enabled: true }
  };

  const barSeries = [
    { name: 'Online', data: [38, 48, 35, 52, 28, 32, 40] },
    { name: 'Offline', data: [22, 26, 18, 24, 14, 20, 24] },
    { name: 'Battery Low', data: [6, 8, 5, 7, 8, 6, 8] },
    { name: 'Signal Loss', data: [5, 4, 4, 5, 3, 5, 4] }
  ];

  return (
    <Box
      sx={{
        bgcolor: '#f4f6f8',
        minHeight: '100vh',
        p: { xs: 2, md: 3 },
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* ── Header Card ── */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          p: 1.5,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          bgcolor: '#ffffff'
        }}
      >
        <HexagonLogo />

        {/* Sub-navigation Tabs */}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {['Overview', 'Patients', 'Alerts', 'Patients Profiles', 'Devices'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Box
                key={tab}
                onClick={() => setActiveTab(tab)}
                sx={{
                  px: 2.2,
                  py: 1,
                  borderRadius: '20px',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  color: isActive ? '#ffffff' : '#6b7280',
                  bgcolor: isActive ? '#111827' : '#f3f4f6',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: isActive ? '#111827' : '#e5e7eb'
                  }
                }}
              >
                {tab}
              </Box>
            );
          })}
        </Stack>

        {/* Header Actions */}
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton size="medium" sx={{ color: '#4b5563', bgcolor: '#f3f4f6', '&:hover': { bgcolor: '#e5e7eb' } }}>
            <Setting2 size={18} />
          </IconButton>
          <IconButton size="medium" sx={{ color: '#4b5563', bgcolor: '#f3f4f6', '&:hover': { bgcolor: '#e5e7eb' } }}>
            <Box sx={{ position: 'relative', display: 'flex' }}>
              <Notification size={18} />
              <Box sx={{ position: 'absolute', top: 0, right: 0, width: 6, height: 6, bgcolor: '#ef4444', borderRadius: '50%' }} />
            </Box>
          </IconButton>
          <Avatar
            alt="John Doe"
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
            sx={{ width: 34, height: 34, border: '1.5px solid #e2e8f0' }}
          />
        </Stack>
      </Card>

      {/* ── Stats Cards Grid ── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Card 1: Total Patients */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', p: 2.5, bgcolor: '#ffffff', height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#6b7280', mb: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.08)', width: 26, height: 26, color: '#3b82f6' }}>
                <Profile size={14} />
              </Avatar>
              <Typography sx={{ fontWeight: 600, fontSize: '13px' }}>Total Patients</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
              <Box>
                <Typography sx={{ fontSize: '28px', fontWeight: 800, color: '#111827', mb: 0.5 }}>346</Typography>
                <Chip
                  label="+13% vs last week"
                  size="small"
                  sx={{ bgcolor: '#ecfdf5', color: '#10b981', fontWeight: 700, fontSize: '10px', height: 18 }}
                />
              </Box>
              <Box sx={{ pb: 0.5 }}>
                <SparklineLine />
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Card 2: Critical Alerts */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', p: 2.5, bgcolor: '#ffffff', height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#6b7280', mb: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.08)', width: 26, height: 26, color: '#ef4444' }}>
                <InfoCircle size={14} />
              </Avatar>
              <Typography sx={{ fontWeight: 600, fontSize: '13px' }}>Critical Alerts</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
              <Box>
                <Typography sx={{ fontSize: '28px', fontWeight: 800, color: '#111827', mb: 0.5 }}>24</Typography>
                <Chip
                  label="+13% vs last week"
                  size="small"
                  sx={{ bgcolor: '#ecfdf5', color: '#10b981', fontWeight: 700, fontSize: '10px', height: 18 }}
                />
              </Box>
              <Box sx={{ pb: 0.5 }}>
                <SparklineBars color="#3b82f6" values={[14, 20, 10, 24, 30, 18]} />
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Card 3: Devices Offline */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', p: 2.5, bgcolor: '#ffffff', height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#6b7280', mb: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.08)', width: 26, height: 26, color: '#ef4444' }}>
                <Danger size={14} />
              </Avatar>
              <Typography sx={{ fontWeight: 600, fontSize: '13px' }}>Devices Offline</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
              <Box>
                <Typography sx={{ fontSize: '28px', fontWeight: 800, color: '#111827', mb: 0.5 }}>15</Typography>
                <Chip
                  label="-24% vs last week"
                  size="small"
                  sx={{ bgcolor: '#fef2f2', color: '#ef4444', fontWeight: 700, fontSize: '10px', height: 18 }}
                />
              </Box>
              <Box sx={{ pb: 0.5, pr: 1.5 }}>
                <SparklineRing value={70} color="#3b82f6" />
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Card 4: New Alert */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', p: 2.5, bgcolor: '#ffffff', height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#6b7280', mb: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.08)', width: 26, height: 26, color: '#f59e0b' }}>
                <InfoCircle size={14} />
              </Avatar>
              <Typography sx={{ fontWeight: 600, fontSize: '13px' }}>New Alert</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
              <Box>
                <Typography sx={{ fontSize: '28px', fontWeight: 800, color: '#111827', mb: 0.5 }}>07</Typography>
                <Chip
                  label="-5% vs last week"
                  size="small"
                  sx={{ bgcolor: '#fef2f2', color: '#ef4444', fontWeight: 700, fontSize: '10px', height: 18 }}
                />
              </Box>
              <Box sx={{ pb: 0.5 }}>
                <SparklineBars color="#3b82f6" values={[8, 12, 10, 16, 26, 32]} />
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* ── Middle Row: Patients Table & Donut ── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Patient Overview */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', p: 2.5, bgcolor: '#ffffff', height: '100%' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 2.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>Patient Overview</Typography>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' }, flexWrap: 'wrap', gap: 1 }}>
                {/* Search field */}
                <TextField
                  placeholder="Search here..."
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ color: '#9ca3af' }}>
                        <SearchNormal1 size={14} />
                      </InputAdornment>
                    ),
                    sx: {
                      bgcolor: '#f9fafb',
                      borderRadius: '18px',
                      fontSize: '12px',
                      width: 160,
                      '& fieldset': { borderColor: '#e2e8f0' },
                      '&:hover fieldset': { borderColor: '#cbd5e1 !important' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6 !important' }
                    }
                  }}
                />

                {/* Filter button */}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Filter size={13} />}
                  sx={{
                    borderRadius: '18px',
                    borderColor: '#e2e8f0',
                    color: '#6b7280',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'none',
                    py: 0.8,
                    px: 1.8,
                    '&:hover': { bgcolor: '#f9fafb', borderColor: '#cbd5e1' }
                  }}
                >
                  Filter
                </Button>
              </Stack>
            </Stack>

            {/* Filter pills */}
            <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: 'wrap' }}>
              {[
                { key: 'All', label: 'All', count: 8 },
                { key: 'Critical', label: 'Critical', count: 4 },
                { key: 'Unstable', label: 'Unstable', count: 0 },
                { key: 'No Data', label: 'No Data', count: 0 }
              ].map((pill) => {
                const isActive = patientFilter === pill.key;
                return (
                  <Box
                    key={pill.key}
                    onClick={() => setPatientFilter(pill.key)}
                    sx={{
                      px: 2,
                      py: 0.6,
                      borderRadius: '15px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      bgcolor: isActive ? '#111827' : '#f9fafb',
                      color: isActive ? '#ffffff' : '#4b5563',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      border: '1.2px solid',
                      borderColor: isActive ? '#111827' : '#e2e8f0',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: isActive ? '#111827' : '#f3f4f6'
                      }
                    }}
                  >
                    <span>{pill.label}</span>
                    {pill.count > 0 && (
                      <Box
                        sx={{
                          bgcolor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0,0,0,0.08)',
                          color: isActive ? '#ffffff' : '#6b7280',
                          borderRadius: '50%',
                          width: 15,
                          height: 15,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px'
                        }}
                      >
                        {pill.count}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Stack>

            {/* Table */}
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow sx={{ '& th': { borderBottom: '1px solid #f1f5f9', color: '#9ca3af', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', py: 1.5 } }}>
                    <TableCell sx={{ pl: 0 }}>No</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Health Status</TableCell>
                    <TableCell>Heart Rate</TableCell>
                    <TableCell>Blood Pressure</TableCell>
                    <TableCell>SpO2</TableCell>
                    <TableCell align="right" sx={{ pr: 0 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ '& tr:last-child td': { borderBottom: 0 } }}>
                  {[
                    {
                      no: '01',
                      name: 'John Doe',
                      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
                      status: 'Critical',
                      statusColor: '#ef4444',
                      statusBg: '#fef2f2',
                      heart: '48 bpm',
                      heartColor: '#ef4444',
                      bp: '130/85 mmHg',
                      spo2: '<90%',
                      spo2Level: 3,
                      spo2Color: '#ef4444'
                    },
                    {
                      no: '02',
                      name: 'Sania Wong',
                      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
                      status: 'Stable',
                      statusColor: '#10b981',
                      statusBg: '#ecfdf5',
                      heart: '72 bpm',
                      heartColor: '#10b981',
                      bp: '118/96 mmHg',
                      spo2: '95-100%',
                      spo2Level: 5,
                      spo2Color: '#10b981'
                    },
                    {
                      no: '03',
                      name: 'Roger Lewis',
                      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
                      status: 'Warning',
                      statusColor: '#f59e0b',
                      statusBg: '#fff7ed',
                      heart: '62 bpm',
                      heartColor: '#f59e0b',
                      bp: '72/79 mmHg',
                      spo2: '90-94%',
                      spo2Level: 4,
                      spo2Color: '#f59e0b'
                    },
                    {
                      no: '04',
                      name: 'John Cena',
                      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=80&q=80',
                      status: 'Stable',
                      statusColor: '#10b981',
                      statusBg: '#ecfdf5',
                      heart: '90 bpm',
                      heartColor: '#10b981',
                      bp: '118/96 mmHg',
                      spo2: '95-100%',
                      spo2Level: 5,
                      spo2Color: '#10b981'
                    }
                  ].map((row) => (
                    <TableRow key={row.no} sx={{ '& td': { borderBottom: '1px solid #f1f5f9', py: 1.5, fontSize: '13px', color: '#374151' } }}>
                      <TableCell sx={{ pl: 0, color: '#9ca3af', fontWeight: 600 }}>{row.no}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar src={row.avatar} sx={{ width: 26, height: 26 }} />
                          <Typography sx={{ fontWeight: 600, fontSize: '13px', color: '#111827' }}>{row.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1.5,
                            py: 0.4,
                            borderRadius: '6px',
                            bgcolor: row.statusBg,
                            color: row.statusColor,
                            fontWeight: 700,
                            fontSize: '11px',
                            textTransform: 'uppercase'
                          }}
                        >
                          {row.status}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center">
                          <HeartbeatWave color={row.heartColor} />
                          <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '12px' }}>{row.heart}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, color: '#4b5563' }}>{row.bp}</TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center">
                          <MiniSpO2Bars level={row.spo2Level} color={row.spo2Color} />
                          <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '12px' }}>{row.spo2}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right" sx={{ pr: 0 }}>
                        <Button
                          variant="contained"
                          disableElevation
                          size="small"
                          sx={{
                            borderRadius: '6px',
                            textTransform: 'none',
                            bgcolor: '#3b82f6',
                            fontSize: '11px',
                            fontWeight: 600,
                            py: 0.5,
                            px: 2,
                            minWidth: 54,
                            '&:hover': { bgcolor: '#2563eb' }
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Report & Insights */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', p: 2.5, bgcolor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 2.5 }}>Report & Insights</Typography>

            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 210, position: 'relative' }}>
              <ReactApexChart options={donutOptions} series={donutSeries} type="donut" height={210} width="100%" />
            </Box>

            <Divider sx={{ my: 2.5, borderColor: '#f1f5f9' }} />

            {/* Custom Legend */}
            <Stack direction="row" spacing={1} justifyContent="space-between">
              {[
                { label: 'Stable', value: '52%', color: '#10b981' },
                { label: 'At Risk', value: '38%', color: '#f59e0b' },
                { label: 'Critical', value: '20%', color: '#ef4444' }
              ].map((item) => (
                <Box key={item.label} sx={{ textAlign: 'center', flex: 1 }}>
                  <Stack direction="row" spacing={0.6} alignItems="center" justifyContent="center" sx={{ mb: 0.5 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: item.color }} />
                    <Typography sx={{ fontSize: '11.5px', color: '#6b7280', fontWeight: 500 }}>{item.label}</Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>{item.value}</Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* ── Bottom Row: Device Status & Alerts ── */}
      <Grid container spacing={3}>
        {/* Device Status */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', p: 2.5, bgcolor: '#ffffff', height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>Device Status</Typography>

              <Select
                value={deviceMonth}
                onChange={(e) => setDeviceMonth(e.target.value)}
                size="small"
                IconComponent={ArrowDown2}
                sx={{
                  borderRadius: '10px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#4b5563',
                  bgcolor: '#f9fafb',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                  '& .MuiSelect-select': { py: 0.8, px: 2, pr: '28px !important' },
                  '& .MuiSelect-icon': { width: 14, right: 8, color: '#4b5563' }
                }}
              >
                <MenuItem value="Jan 2026">Jan 2026</MenuItem>
                <MenuItem value="Feb 2026">Feb 2026</MenuItem>
                <MenuItem value="Mar 2026">Mar 2026</MenuItem>
              </Select>
            </Stack>

            <Grid container spacing={2} alignItems="center">
              {/* Stacked Bar Chart */}
              <Grid item xs={12} md={9}>
                <Box sx={{ minHeight: 260 }}>
                  <ReactApexChart options={barOptions} series={barSeries} type="bar" height={260} />
                </Box>
              </Grid>

              {/* Legends on the right */}
              <Grid item xs={12} md={3}>
                <Stack spacing={1.5} sx={{ pl: { md: 2 } }}>
                  {[
                    { label: 'Online', value: '246', color: '#10b981' },
                    { label: 'Offline', value: '112', color: '#ef4444' },
                    { label: 'Battery Low', value: '48', color: '#3b82f6' },
                    { label: 'Signal Loss', value: '32', color: '#f59e0b' }
                  ].map((item) => (
                    <Box
                      key={item.label}
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        border: '1.2px solid #f1f5f9',
                        bgcolor: alpha(item.color, 0.03),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: item.color }} />
                        <Typography sx={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>{item.label}</Typography>
                      </Stack>
                      <Typography sx={{ fontSize: '13.5px', fontWeight: 800, color: '#111827' }}>{item.value}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Alert & Notification */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', p: 2.5, bgcolor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 2.5 }}>Alert & Notification</Typography>

            {/* List Headers */}
            <Grid container sx={{ borderBottom: '1px solid #f1f5f9', pb: 1, mb: 1, px: 1 }}>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Title</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Time</Typography>
              </Grid>
              <Grid item xs={3} textAlign="right">
                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Action</Typography>
              </Grid>
            </Grid>

            {/* List Items */}
            <Stack spacing={1.5} sx={{ flex: 1, overflowY: 'auto', maxHeight: 310 }}>
              {[
                { title: 'High BP Alert', patient: 'John Doe', time: '12:12 PM', isCritical: true },
                { title: 'Low SpO2 Detected', patient: 'Roger Lewis', time: '12:12 PM', isCritical: true },
                { title: 'Device Disconnected', patient: 'Patient #98435', time: '12:12 PM', isCritical: false },
                { title: 'Low SpO2 Detected', patient: 'John Doe', time: '12:12 PM', isCritical: true },
                { title: 'Low SpO2 Detected', patient: 'John Doe', time: '12:12 PM', isCritical: true }
              ].map((item, index) => (
                <Grid
                  container
                  key={index}
                  alignItems="center"
                  sx={{
                    p: 1,
                    borderRadius: '10px',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: '#f9fafb' }
                  }}
                >
                  <Grid item xs={6}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: item.isCritical ? 'rgba(239, 68, 68, 0.08)' : 'rgba(17, 24, 39, 0.08)',
                          color: item.isCritical ? '#ef4444' : '#111827',
                          width: 28,
                          height: 28
                        }}
                      >
                        {item.isCritical ? <Danger size={14} /> : <InfoCircle size={14} />}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
                          {item.title}
                        </Typography>
                        <Typography sx={{ fontSize: '10.5px', color: '#6b7280', fontWeight: 500 }}>
                          {item.patient}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={3}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#6b7280' }}>
                      {item.time}
                    </Typography>
                  </Grid>

                  <Grid item xs={3} textAlign="right">
                    <Button
                      variant="contained"
                      disableElevation
                      size="small"
                      sx={{
                        borderRadius: '6px',
                        textTransform: 'none',
                        bgcolor: '#3b82f6',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        py: 0.4,
                        px: 1.2,
                        '&:hover': { bgcolor: '#2563eb' }
                      }}
                    >
                      Acknowledge
                    </Button>
                  </Grid>
                </Grid>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
