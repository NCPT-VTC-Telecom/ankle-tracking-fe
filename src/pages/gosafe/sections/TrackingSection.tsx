import {
  Box,
  Grid,
  Tabs,
  Tab,
  TextField,
  Stack,
  Badge,
  Typography,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import {
  Notification,
  Map as MapIcon,
  Personalcard,
  SearchNormal1,
  Danger,
  Category,
  Cpu,
  Profile2User,
  Simcard,
  Logout,
  Edit,
  Trash,
  Add,
  HambergerMenu,
  Wifi,
  Warning2,
  ShieldSecurity,
  Eye,
  Gps
} from 'iconsax-react';
import { useState, useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';

import { useTracking } from '../tracking/useTracking';
import TrackingMap from '../tracking/components/TrackingMap';
import DeviceList from '../tracking/components/DeviceList';
import GeofenceList from '../tracking/components/GeofenceList';
import NotificationList from '../tracking/components/NotificationList';
import TrackingDialogs from '../tracking/components/TrackingDialogs';

interface TrackingSectionProps {
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
  onBackToLanding?: () => void;
}

export default function TrackingSection({
  isDark,
  primaryColor,
  secondaryColor,
  onBackToLanding
}: TrackingSectionProps) {
  const store = useTracking(isDark, primaryColor, secondaryColor);
  const {
    showAlertOverlay,
    devices,
    geofences,
    deviceViolations,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    statusAlertCount,
    logs,
    openEditDevice,
    setAddDeviceOpen,
    setRemoveConfirmId,
    setAssignGeofenceId,
    setSubjectDetailId,
    setSelectedDeviceId
  } = store;

  // Dashboard views: overview (Tổng quan), tracking (Giám sát), devices (Thiết bị), prisoners (Phạm nhân), sims (Sim Card)
  const [dashboardView, setDashboardView] = useState<'overview' | 'tracking' | 'devices' | 'prisoners' | 'sims'>('overview');

  // Search queries for individual tables
  const [deviceSearch, setDeviceSearch] = useState('');
  const [prisonerSearch, setPrisonerSearch] = useState('');
  const [simSearch, setSimSearch] = useState('');

  // Dropdown menus
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const handleProfileOpen = (event: React.MouseEvent<HTMLElement>) => setProfileAnchorEl(event.currentTarget);
  const handleProfileClose = () => setProfileAnchorEl(null);

  // Mock unassigned SIM cards
  const [unassignedSims] = useState([
    { phoneNumber: '+84912345678', carrier: 'Viettel', iccid: '8984041122334455667', status: 'ready', signal: 4 },
    { phoneNumber: '+84987654321', carrier: 'Mobifone', iccid: '8984042233445566778', status: 'ready', signal: 3 },
    { phoneNumber: '+84909998887', carrier: 'Vinaphone', iccid: '8984043344556677889', status: 'inactive', signal: 0 },
  ]);

  // Derived stats
  const totalViolating = useMemo(() => Object.values(deviceViolations).filter(Boolean).length, [deviceViolations]);
  const onlineCount = useMemo(() => devices.filter(d => d.status.connectionStatus === 'online').length, [devices]);
  const offlineCount = useMemo(() => devices.filter(d => d.status.connectionStatus === 'offline').length, [devices]);
  const totalPrisoners = useMemo(() => devices.filter(d => d.subject !== null).length, [devices]);
  const totalSims = useMemo(() => devices.filter(d => d.phoneNumber).length + unassignedSims.length, [devices, unassignedSims]);

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
      // Create stable pseudo-random activity metrics based on uniqueId/IMEI
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

  // Helper for SIM details derivation
  const allSimCards = useMemo(() => {
    const activeSims = devices
      .filter(d => d.phoneNumber)
      .map(d => {
        const num = d.phoneNumber;
        let carrier = 'Viettel';
        if (num.startsWith('+8490') || num.startsWith('090') || num.startsWith('093') || num.startsWith('+8493')) carrier = 'Mobifone';
        else if (num.startsWith('+8491') || num.startsWith('091') || num.startsWith('088') || num.startsWith('+8488')) carrier = 'Vinaphone';
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

    const mockSims = unassignedSims.map(s => ({
      phoneNumber: s.phoneNumber,
      carrier: s.carrier,
      iccid: s.iccid,
      status: s.status,
      deviceName: 'Chưa gán',
      deviceId: null,
      signal: s.signal
    }));

    return [...activeSims, ...mockSims];
  }, [devices, unassignedSims]);

  // Filters for lists
  const filteredDeviceTable = useMemo(() => {
    if (!deviceSearch) return devices;
    const q = deviceSearch.toLowerCase();
    return devices.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.uniqueId.includes(q) ||
      d.phoneNumber.includes(q) ||
      (d.subject?.fullName.toLowerCase().includes(q) ?? false)
    );
  }, [devices, deviceSearch]);

  const filteredPrisonerTable = useMemo(() => {
    const list = devices.filter(d => d.subject !== null);
    if (!prisonerSearch) return list;
    const q = prisonerSearch.toLowerCase();
    return list.filter(d =>
      d.subject!.fullName.toLowerCase().includes(q) ||
      d.subject!.idNumber.includes(q) ||
      d.subject!.crime.toLowerCase().includes(q) ||
      d.uniqueId.includes(q)
    );
  }, [devices, prisonerSearch]);

  const filteredSimTable = useMemo(() => {
    if (!simSearch) return allSimCards;
    const q = simSearch.toLowerCase();
    return allSimCards.filter(s =>
      s.phoneNumber.includes(q) ||
      s.iccid.includes(q) ||
      s.carrier.toLowerCase().includes(q) ||
      s.deviceName.toLowerCase().includes(q)
    );
  }, [allSimCards, simSearch]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isDark ? '#020617' : '#f8fafc',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Alert Overlay border */}
      {showAlertOverlay && <Box className="gs-alert-border" />}

      {/* ═══ TOP HEADER ══════════════════════════════════════════════════════ */}
      <Box
        sx={{
          height: 60,
          bgcolor: isDark ? '#0b0f19' : '#ffffff',
          color: isDark ? '#f8fafc' : '#0f172a',
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          zIndex: 1100
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconButton size="small" sx={{ color: isDark ? '#94a3b8' : '#475569' }}>
            <HambergerMenu size={18} />
          </IconButton>
          <ShieldSecurity size={24} variant="Bold" color={primaryColor} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              letterSpacing: 0.5,
              fontSize: '0.925rem',
              color: isDark ? '#f8fafc' : '#0f172a'
            }}
          >
            Hệ thống Giám sát & Cảnh báo Ankle Tracking
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          {/* Notification Bell */}
          <IconButton
            onClick={() => {
              setDashboardView('tracking');
              setActiveTab(2); // open Notifications
            }}
            sx={{
              color: isDark ? '#94a3b8' : '#475569',
              position: 'relative',
              bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }
            }}
          >
            <Badge
              badgeContent={statusAlertCount + totalViolating}
              color="error"
              sx={{ '& .MuiBadge-badge': { fontWeight: 700, fontSize: '0.65rem', height: 16, minWidth: 16 } }}
            >
              <Notification size={18} />
            </Badge>
          </IconButton>

          <Divider orientation="vertical" flexItem sx={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', my: 1.5 }} />

          {/* User profile */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            onClick={handleProfileOpen}
            sx={{ cursor: 'pointer', p: 0.5, px: 1, borderRadius: 2, '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' } }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: primaryColor, color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>
              DP
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.1, fontSize: '0.825rem', color: isDark ? '#f8fafc' : '#0f172a' }}>
                Duy Phan
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? '#64748b' : '#64748b', display: 'block', lineHeight: 1, fontSize: '0.7rem' }}>
                Quản trị viên
              </Typography>
            </Box>
          </Stack>
          <Menu
            anchorEl={profileAnchorEl}
            open={Boolean(profileAnchorEl)}
            onClose={handleProfileClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 180,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                bgcolor: isDark ? '#0f172a' : '#ffffff'
              }
            }}
          >
            <MenuItem onClick={handleProfileClose} sx={{ py: 1, px: 2, gap: 1.2, fontSize: '0.85rem' }}>
              <Profile2User size={16} />
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>Hồ sơ cá nhân</Typography>
            </MenuItem>
            <MenuItem onClick={handleProfileClose} sx={{ py: 1, px: 2, gap: 1.2, fontSize: '0.85rem' }}>
              <Cpu size={16} />
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>Cấu hình hệ thống</Typography>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleProfileClose();
                if (onBackToLanding) onBackToLanding();
              }}
              sx={{ py: 1, px: 2, color: 'error.main', gap: 1.2, fontSize: '0.85rem' }}
            >
              <Logout size={16} />
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Quay lại Trang chủ</Typography>
            </MenuItem>
          </Menu>
        </Stack>
      </Box>

      {/* ═══ GLOBAL ALARM BANNER (CRITICAL MONITORING) ══════════════════════ */}
      {devices
        .filter((d) => deviceViolations[d.id])
        .map((dev) => (
          <Box
            key={dev.id}
            sx={{
              px: 3,
              py: 1,
              bgcolor: '#fef2f2',
              borderBottom: '1px solid #fee2e2',
              zIndex: 1000,
              boxShadow: '0 2px 5px rgba(239, 68, 68, 0.05)'
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: dev.color }} />
                <Danger size="20" color="#ef4444" variant="Bold" />
                <Typography variant="body2" sx={{ color: '#991b1b', fontWeight: 700 }}>
                  {dev.subject?.fullName ?? dev.name} ({dev.name}) — RA NGOÀI vùng an toàn "
                  {geofences.find((g) => g.id === dev.assignedGeofenceId)?.name}"
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setDashboardView('tracking');
                    setSelectedDeviceId(dev.id);
                  }}
                  startIcon={<Gps size={14} />}
                  sx={{ borderRadius: 2, fontWeight: 700, px: 2, textTransform: 'none' }}
                >
                  Định vị
                </Button>
                <Chip
                  label="CẢNH BÁO VI PHẠM"
                  color="error"
                  size="small"
                  className="gs-blink"
                  sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
                />
              </Stack>
            </Stack>
          </Box>
        ))}

      {/* ═══ WORKSPACE LAYOUT ═══════════════════════════════════════════════ */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Left Sidebar */}
        <Box
          sx={{
            width: 230,
            bgcolor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            borderRight: '1px solid rgba(255,255,255,0.06)'
          }}
        >
          <Stack spacing={0.25} sx={{ p: 1.5, flexGrow: 1 }}>
            {[
              { id: 'overview' as const, label: 'Tổng quan', icon: <Category size={18} /> },
              { id: 'tracking' as const, label: 'Bản đồ giám sát', icon: <MapIcon size={18} /> },
              { id: 'devices' as const, label: 'Quản lý thiết bị', icon: <Cpu size={18} /> },
              { id: 'prisoners' as const, label: 'Thông tin phạm nhân', icon: <Profile2User size={18} /> },
              { id: 'sims' as const, label: 'Quản lý SIM card', icon: <Simcard size={18} /> }
            ].map((item) => {
              const active = dashboardView === item.id;
              return (
                <Button
                  key={item.id}
                  onClick={() => setDashboardView(item.id)}
                  startIcon={item.icon}
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    color: active ? '#ffffff' : 'rgba(255,255,255,0.56)',
                    bgcolor: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                    py: 1,
                    px: 2,
                    borderRadius: 2,
                    fontSize: '0.825rem',
                    fontWeight: active ? 600 : 500,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.04)',
                      color: '#ffffff'
                    }
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>

          {/* Quick Exit */}
          <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Button
              onClick={onBackToLanding}
              startIcon={<Logout size={16} />}
              fullWidth
              variant="outlined"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                borderColor: 'rgba(255,255,255,0.2)',
                borderRadius: 2,
                py: 0.75,
                fontSize: '0.8rem',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#fff',
                  bgcolor: 'rgba(255,255,255,0.04)',
                  color: '#fff'
                }
              }}
            >
              Quay lại Landing Page
            </Button>
          </Box>
        </Box>

        {/* Right Main Content Pane */}
        <Box
          sx={{
            flexGrow: 1,
            height: '100%',
            overflow: dashboardView === 'tracking' ? 'hidden' : 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {dashboardView === 'tracking' ? (
            /* ═══ VIEW 2: MAP DEVICE MONITORING (ORIGINAL INTEGRATED PANEL) ═══ */
            <Grid container sx={{ flexGrow: 1, height: '100%', overflow: 'hidden' }}>
              <Grid
                item
                xs={12}
                md={4.5}
                lg={4}
                xl={3.5}
                className="gs-sidebar"
                sx={{
                  borderRight: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  bgcolor: isDark ? '#090d1f' : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
              >
                {/* Search */}
                <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Tên, IMEI, phạm nhân..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <SearchNormal1 size="18" style={{ marginRight: 8, color: '#94a3b8' }} />
                      ),
                      sx: { borderRadius: 3 }
                    }}
                  />
                </Box>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                  <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    variant="fullWidth"
                    sx={{
                      '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        minHeight: 46
                      },
                      '& .Mui-selected': { color: primaryColor }
                    }}
                  >
                    <Tab icon={<Personalcard size={16} />} label="Thiết bị" iconPosition="start" />
                    <Tab icon={<MapIcon size={16} />} label="Geofence" iconPosition="start" />
                    <Tab
                      icon={
                        <Badge
                          badgeContent={statusAlertCount + totalViolating}
                          color="error"
                          max={9}
                        >
                          <Notification size={16} />
                        </Badge>
                      }
                      label="Thông báo"
                      iconPosition="start"
                    />
                  </Tabs>
                </Box>

                {/* List Content Panel */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2.5 }}>
                  {activeTab === 0 && <DeviceList store={store} />}
                  {activeTab === 1 && <GeofenceList store={store} />}
                  {activeTab === 2 && <NotificationList store={store} />}
                </Box>
              </Grid>

              {/* Leaflet Map Grid */}
              <Grid item xs={12} md={7.5} lg={8} xl={8.5} sx={{ height: '100%' }}>
                <TrackingMap store={store} />
              </Grid>
            </Grid>
          ) : (
            /* ═══ OTHER VIEWS: OVERVIEW, DEVICES, PRISONERS, SIMS ═══ */
            <Box sx={{ p: 3, flexGrow: 1 }}>
              {/* Breadcrumbs Header */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.68rem' }}>
                  Hệ thống quản lý & Giám sát / {
                    dashboardView === 'overview' ? 'Tổng quan' :
                    dashboardView === 'devices' ? 'Quản lý thiết bị' :
                    dashboardView === 'prisoners' ? 'Thông tin phạm nhân' : 'Quản lý thẻ SIM'
                  }
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  {
                    dashboardView === 'overview' ? 'Tổng quan hệ thống' :
                    dashboardView === 'devices' ? 'Thông tin các thiết bị' :
                    dashboardView === 'prisoners' ? 'Hồ sơ giám sát phạm nhân' : 'Quản lý Sim Card'
                  }
                </Typography>
              </Box>

              {/* ═══ VIEW 1: OVERVIEW DASHBOARD ════════════════════════════════ */}
              {dashboardView === 'overview' && (
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
              )}

              {/* ═══ VIEW 3: DEVICE MANAGEMENT TABLE ══════════════════════════ */}
              {dashboardView === 'devices' && (
                <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" mb={2}>
                    <TextField
                      size="small"
                      placeholder="Tìm thiết bị..."
                      value={deviceSearch}
                      onChange={(e) => setDeviceSearch(e.target.value)}
                      InputProps={{
                        startAdornment: <SearchNormal1 size={14} style={{ marginRight: 6, color: '#94a3b8' }} />,
                        sx: { fontSize: '0.825rem', borderRadius: 1.5 }
                      }}
                      sx={{ width: 260 }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Add size={16} />}
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
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Tên thiết bị</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>IMEI</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Model</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Số SIM</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Trạng thái</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Pin</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Sóng</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Người đeo</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Thao tác</TableCell>
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
                                    bgcolor: isViolating ? 'rgba(239, 68, 68, 0.05)' : conn === 'online' ? 'rgba(34, 197, 94, 0.05)' : conn === 'offline' ? 'rgba(100, 116, 139, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                                    color: isViolating ? '#dc2626' : conn === 'online' ? '#16a34a' : conn === 'offline' ? '#475569' : '#d97706',
                                    border: '1px solid',
                                    borderColor: isViolating ? 'rgba(239, 68, 68, 0.15)' : conn === 'online' ? 'rgba(34, 197, 94, 0.15)' : conn === 'offline' ? 'rgba(100, 116, 139, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ fontWeight: 500, fontSize: '0.8rem' }}>{dev.status.battery}%</TableCell>
                              <TableCell>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Wifi size={14} color={dev.status.signalStrength > 1 ? '#16a34a' : '#d97706'} variant="Bold" />
                                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{dev.status.signalStrength}/4</Typography>
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
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Chưa gán</Typography>
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
                                      <MapIcon size={15} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Gán vùng Geofence">
                                    <IconButton
                                      size="small"
                                      color="success"
                                      onClick={() => setAssignGeofenceId(dev.assignedGeofenceId || geofences[0]?.id)}
                                    >
                                      <Gps size={15} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Sửa">
                                    <IconButton
                                      size="small"
                                      onClick={() => openEditDevice(dev)}
                                    >
                                      <Edit size={15} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Xóa">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => setRemoveConfirmId(dev.id)}
                                    >
                                      <Trash size={15} />
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

              {/* ═══ VIEW 4: PRISONER HOSIER (SUBJECTS TABLE) ══════════════════════ */}
              {dashboardView === 'prisoners' && (
                <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" spacing={2} justifyContent="space-between" mb={2}>
                    <TextField
                      size="small"
                      placeholder="Tìm phạm nhân, CCCD..."
                      value={prisonerSearch}
                      onChange={(e) => setPrisonerSearch(e.target.value)}
                      InputProps={{
                        startAdornment: <SearchNormal1 size={14} style={{ marginRight: 6, color: '#94a3b8' }} />,
                        sx: { fontSize: '0.825rem', borderRadius: 1.5 }
                      }}
                      sx={{ width: 260 }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Add size={16} />}
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
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Ảnh</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Họ tên phạm nhân</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Số CCCD</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Tội danh</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Hình phạt</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Hạn tù</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Thiết bị</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Trạng thái</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Thao tác</TableCell>
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
                              <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>{sub.idNumber || '—'}</TableCell>
                              <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{sub.crime}</TableCell>
                              <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{sub.sentence}</TableCell>
                              <TableCell>
                                <Stack>
                                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>{sub.releaseDate}</Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>bắt đầu: {sub.startDate}</Typography>
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
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => setSubjectDetailId(dev.id)}
                                    >
                                      <Eye size={15} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Chỉnh sửa">
                                    <IconButton
                                      size="small"
                                      onClick={() => openEditDevice(dev)}
                                    >
                                      <Edit size={15} />
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
                                      <MapIcon size={15} />
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

              {/* ═══ VIEW 5: SIM CARD MANAGEMENT TABLE ═══════════════════════ */}
              {dashboardView === 'sims' && (
                <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" spacing={2} mb={2}>
                    <TextField
                      size="small"
                      placeholder="Tìm số điện thoại, ICCID..."
                      value={simSearch}
                      onChange={(e) => setSimSearch(e.target.value)}
                      InputProps={{
                        startAdornment: <SearchNormal1 size={14} style={{ marginRight: 6, color: '#94a3b8' }} />,
                        sx: { fontSize: '0.825rem', borderRadius: 1.5 }
                      }}
                      sx={{ width: 260 }}
                    />
                  </Stack>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Số điện thoại</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Nhà mạng</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Số ICCID / Serial</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Thiết bị gán</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Sóng</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Trạng thái</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.2 }}>Thao tác</TableCell>
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
                                    bgcolor: sim.carrier === 'Viettel' ? 'rgba(239, 68, 68, 0.05)' : sim.carrier === 'Vinaphone' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                                    color: sim.carrier === 'Viettel' ? '#dc2626' : sim.carrier === 'Vinaphone' ? '#2563eb' : '#d97706',
                                    border: '1px solid',
                                    borderColor: sim.carrier === 'Viettel' ? 'rgba(239, 68, 68, 0.12)' : sim.carrier === 'Vinaphone' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(245, 158, 11, 0.12)',
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
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Chưa sử dụng</Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Wifi size={14} color={sim.signal > 1 ? '#16a34a' : '#d97706'} variant="Bold" />
                                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{sim.signal}/4</Typography>
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
                                    bgcolor: sim.status === 'active' ? 'rgba(34, 197, 94, 0.05)' : sim.status === 'ready' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(100, 116, 139, 0.05)',
                                    color: sim.status === 'active' ? '#16a34a' : sim.status === 'ready' ? '#2563eb' : '#475569',
                                    border: '1px solid',
                                    borderColor: sim.status === 'active' ? 'rgba(34, 197, 94, 0.15)' : sim.status === 'ready' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(100, 116, 139, 0.15)'
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
                                        <MapIcon size={15} />
                                      </IconButton>
                                    </Tooltip>
                                  ) : (
                                    <Tooltip title="Gán vào thiết bị">
                                      <IconButton
                                        size="small"
                                        color="success"
                                        onClick={() => setAddDeviceOpen(true)}
                                      >
                                        <Add size={15} />
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
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Dialogs: Add/Edit Device, Delete, Geofence assign, geofence info, etc. */}
      <TrackingDialogs store={store} />
    </Box>
  );
}

// ─── HELPER COMPONENT: STAT CARD ───────────────────────────────────────────────
function StatCard({
  title,
  value,
  subtext,
  icon,
  color,
  gradient
}: {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        height: '100%',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Stack spacing={0.25} sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.65rem' }}
            >
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.35rem', lineHeight: 1.2 }}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', fontSize: '0.7rem' }}>
              {subtext}
            </Typography>
          </Stack>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: color,
              color: gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
