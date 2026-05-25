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
  IconButton,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Tooltip,
  Popover
} from '@mui/material';
import {
  Notification,
  Map as MapIcon,
  Personalcard,
  SearchNormal1,
  Category,
  Logout,
  HambergerMenu,
  ShieldSecurity,
  Gps,
  Danger,
  Cpu,
  Profile2User,
  Simcard,
  Clock
} from 'iconsax-react';
import { useState, useMemo } from 'react';
import useAuth from 'hooks/useAuth';

import { useTracking } from '../tracking/useTracking';
import TrackingMap from '../tracking/components/TrackingMap';
import DeviceList from '../tracking/components/DeviceList';
import GeofenceList from '../tracking/components/GeofenceList';
import NotificationList from '../tracking/components/NotificationList';
import GpsHistoryPanel from '../tracking/components/GpsHistoryPanel';
import TrackingDialogs from '../tracking/components/TrackingDialogs';

// Subcomponents
import DashboardOverview from './components/DashboardOverview';
import DeviceManagementTable from './components/DeviceManagementTable';
import PrisonerManagementTable from './components/PrisonerManagementTable';
import SimManagementTable from './components/SimManagementTable';

interface TrackingSectionProps {
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

export default function TrackingSection({ isDark, primaryColor, secondaryColor }: TrackingSectionProps) {
  const store = useTracking(isDark, primaryColor, secondaryColor);
  const { user, logout } = useAuth();
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
    setSelectedDeviceId
  } = store;

  // Dashboard views: overview (Tổng quan), tracking (Giám sát), devices (Thiết bị), prisoners (Phạm nhân), sims (Sim Card)
  const [dashboardView, setDashboardView] = useState<'overview' | 'tracking' | 'devices' | 'prisoners' | 'sims'>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Profile dropdown menu state
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const handleProfileOpen = (event: React.MouseEvent<HTMLElement>) => setProfileAnchorEl(event.currentTarget);
  const handleProfileClose = () => setProfileAnchorEl(null);

  // Bell dropdown popover state
  const [bellAnchorEl, setBellAnchorEl] = useState<null | HTMLElement>(null);
  const handleBellOpen = (event: React.MouseEvent<HTMLElement>) => setBellAnchorEl(event.currentTarget);
  const handleBellClose = () => setBellAnchorEl(null);

  // Derived stats
  const totalViolating = useMemo(() => Object.values(deviceViolations).filter(Boolean).length, [deviceViolations]);

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
      {showAlertOverlay && <Box className="gs-alert-border" />}
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
          <IconButton
            size="small"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            sx={{
              color: isDark ? '#94a3b8' : '#475569',
              bgcolor: isSidebarCollapsed ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)') : 'transparent',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
              },
              transition: 'all 0.2s'
            }}
          >
            <HambergerMenu size={22} />
          </IconButton>
          <ShieldSecurity size={28} variant="Bold" color={primaryColor} />
          {!isSidebarCollapsed && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                letterSpacing: 0.5,
                fontSize: '0.925rem',
                color: isDark ? '#f8fafc' : '#0f172a',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Hệ thống Giám sát & Cảnh báo Ankle Tracking
            </Typography>
          )}
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          {/* Notification Bell */}
          <IconButton
            onClick={handleBellOpen}
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
              <Notification size={22} />
            </Badge>
          </IconButton>

          <Popover
            open={Boolean(bellAnchorEl)}
            anchorEl={bellAnchorEl}
            onClose={handleBellClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            PaperProps={{
              sx: {
                width: 360,
                maxHeight: 500,
                mt: 1,
                p: 2,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                bgcolor: isDark ? '#0f172a' : '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }
            }}
          >
            <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
              <NotificationList store={store} />
            </Box>
          </Popover>

          <Divider orientation="vertical" flexItem sx={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', my: 1.5 }} />

          {/* User profile */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            onClick={handleProfileOpen}
            sx={{
              cursor: 'pointer',
              p: 0.5,
              px: 1,
              borderRadius: 2,
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: primaryColor, color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>
              {user?.fullname
                ? user.fullname
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : user?.name
                ? user.name.slice(0, 2).toUpperCase()
                : 'US'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, lineHeight: 1.1, fontSize: '0.825rem', color: isDark ? '#f8fafc' : '#0f172a' }}
              >
                {user?.fullname || user?.name || 'Người dùng'}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: isDark ? '#64748b' : '#64748b', display: 'block', lineHeight: 1, fontSize: '0.7rem' }}
              >
                {user?.role || (user?.username === 'gosafe_admin' ? 'Quản trị viên GoSafe' : 'Quản trị viên')}
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
              <Profile2User size={18} />
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                Hồ sơ cá nhân
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleProfileClose} sx={{ py: 1, px: 2, gap: 1.2, fontSize: '0.85rem' }}>
              <Cpu size={18} />
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                Cấu hình hệ thống
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleProfileClose();
                logout();
              }}
              sx={{ py: 1, px: 2, color: 'error.main', gap: 1.2, fontSize: '0.85rem' }}
            >
              <Logout size={18} />
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Đăng xuất
              </Typography>
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
                <Danger size="24" color="#ef4444" variant="Bold" />
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
                  startIcon={<Gps size={16} />}
                  sx={{ borderRadius: 1.5, fontWeight: 700, px: 2, textTransform: 'none' }}
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
            width: isSidebarCollapsed ? 72 : 230,
            bgcolor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            borderRight: '1px solid rgba(255,255,255,0.06)',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflowX: 'hidden'
          }}
        >
          <Stack spacing={0.25} sx={{ p: isSidebarCollapsed ? 1 : 1.5, flexGrow: 1 }}>
            {[
              { id: 'overview' as const, label: 'Tổng quan', icon: <Category size={22} /> },
              { id: 'tracking' as const, label: 'Bản đồ giám sát', icon: <MapIcon size={22} /> },
              { id: 'devices' as const, label: 'Quản lý thiết bị', icon: <Cpu size={22} /> },
              { id: 'prisoners' as const, label: 'Thông tin phạm nhân', icon: <Profile2User size={22} /> },
              { id: 'sims' as const, label: 'Quản lý SIM card', icon: <Simcard size={22} /> }
            ].map((item) => {
              const active = dashboardView === item.id;
              const btnContent = (
                <Button
                  key={item.id}
                  onClick={() => setDashboardView(item.id)}
                  fullWidth
                  sx={{
                    justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                    minWidth: 0,
                    color: active ? '#ffffff' : 'rgba(255,255,255,0.56)',
                    bgcolor: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                    py: 1.2,
                    px: isSidebarCollapsed ? 0 : 2,
                    borderRadius: 2,
                    fontSize: '0.825rem',
                    fontWeight: active ? 600 : 500,
                    textTransform: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.04)',
                      color: '#ffffff'
                    }
                  }}
                >
                  {isSidebarCollapsed ? (
                    item.icon
                  ) : (
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{item.icon}</Box>
                      <Typography sx={{ fontSize: '0.825rem', fontWeight: active ? 600 : 500, whiteSpace: 'nowrap' }}>
                        {item.label}
                      </Typography>
                    </Stack>
                  )}
                </Button>
              );

              return isSidebarCollapsed ? (
                <Tooltip key={item.id} title={item.label} placement="right" arrow>
                  {btnContent}
                </Tooltip>
              ) : (
                btnContent
              );
            })}
          </Stack>
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
                      startAdornment: <SearchNormal1 size="18" style={{ marginRight: 8, color: '#94a3b8' }} />,
                      sx: { borderRadius: 2 }
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
                    <Tab icon={<Clock size={16} />} label="Lịch sử" iconPosition="start" />
                  </Tabs>
                </Box>

                {/* List Content Panel */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2.5 }}>
                  {activeTab === 0 && <DeviceList store={store} />}
                  {activeTab === 1 && <GeofenceList store={store} />}
                  {activeTab === 2 && <GpsHistoryPanel store={store} />}
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
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.68rem' }}
                >
                  Hệ thống quản lý & Giám sát /{' '}
                  {dashboardView === 'overview'
                    ? 'Tổng quan'
                    : dashboardView === 'devices'
                    ? 'Quản lý thiết bị'
                    : dashboardView === 'prisoners'
                    ? 'Thông tin phạm nhân'
                    : 'Quản lý thẻ SIM'}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  {dashboardView === 'overview'
                    ? 'Tổng quan hệ thống'
                    : dashboardView === 'devices'
                    ? 'Thông tin các thiết bị'
                    : dashboardView === 'prisoners'
                    ? 'Hồ sơ giám sát phạm nhân'
                    : 'Quản lý Sim Card'}
                </Typography>
              </Box>

              {/* ═══ VIEW 1: OVERVIEW DASHBOARD ════════════════════════════════ */}
              {dashboardView === 'overview' && <DashboardOverview isDark={isDark} store={store} setDashboardView={setDashboardView} />}

              {/* ═══ VIEW 3: DEVICE MANAGEMENT TABLE ══════════════════════════ */}
              {dashboardView === 'devices' && <DeviceManagementTable isDark={isDark} store={store} setDashboardView={setDashboardView} />}

              {/* ═══ VIEW 4: PRISONER HOSIER (SUBJECTS TABLE) ══════════════════════ */}
              {dashboardView === 'prisoners' && (
                <PrisonerManagementTable isDark={isDark} store={store} setDashboardView={setDashboardView} />
              )}

              {/* ═══ VIEW 5: SIM CARD MANAGEMENT TABLE ═══════════════════════ */}
              {dashboardView === 'sims' && <SimManagementTable isDark={isDark} store={store} setDashboardView={setDashboardView} />}
            </Box>
          )}
        </Box>
      </Box>

      {/* Dialogs: Add/Edit Device, Delete, Geofence assign, geofence info, etc. */}
      <TrackingDialogs store={store} />
    </Box>
  );
}
