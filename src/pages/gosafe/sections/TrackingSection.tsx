import {
  Box,
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
  Popover,
  Switch,
  FormControlLabel
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
  Clock,
  SecuritySafe,
  Buildings2,
  Calendar
} from 'iconsax-react';
import { useState, useMemo, useEffect } from 'react';
import useAuth from 'hooks/useAuth';

import { useTracking } from '../tracking/useTracking';
import TrackingMap from '../tracking/components/TrackingMap';
import DeviceList from '../tracking/components/DeviceList';
import GeofenceList from '../tracking/components/GeofenceList';
import NotificationList from '../tracking/components/NotificationList';
import GpsHistoryPanel from '../tracking/components/GpsHistoryPanel';
import TrackingDialogs from '../tracking/components/TrackingDialogs';
import ProfileDialog from '../tracking/components/ProfileDialog';
import SystemConfigDialog from '../tracking/components/SystemConfigDialog';
import CriticalAlertOverlay from '../tracking/components/CriticalAlertOverlay';

// Subcomponents
import DashboardOverview from './components/DashboardOverview';
import DeviceManagementTable from './components/DeviceManagementTable';
import PrisonerManagementTable from './components/PrisonerManagementTable';
import AlertsManagement from './components/AlertsManagement';
import UserManagement from './components/UserManagement';
import RegionManagement from './components/RegionManagement';
import ComplianceManagement from './components/ComplianceManagement';

interface TrackingSectionProps {
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

// Các view chỉ dành cho superadmin (quản trị hệ thống: thiết bị, SIM/NCC, địa bàn, người dùng).
const SUPER_ONLY_VIEWS = ['devices', 'regions', 'users'] as const;

export default function TrackingSection({ isDark, primaryColor, secondaryColor }: TrackingSectionProps) {
  const store = useTracking(isDark, primaryColor, secondaryColor);
  const { user, logout } = useAuth();
  // Phân quyền: superadmin thấy toàn bộ; admin (cán bộ địa bàn) chỉ quản lý đối tượng trong phạm vi.
  const isSuperAdmin = Boolean(
    (user as any)?.gosafeIsSuperAdmin ||
      /super/i.test(String((user as any)?.role ?? '')) ||
      (Array.isArray((user as any)?.gosafeRoles) && (user as any).gosafeRoles.some((r: string) => /super/i.test(r)))
  );
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
    setSelectedDeviceId,
    setMapCenter,
    criticalAlerts,
    dismissCriticalAlert,
    dismissAllCriticalAlerts,
  } = store;

  // Dashboard views: overview (Tổng quan), tracking (Giám sát), devices (Thiết bị), prisoners (Phạm nhân), sims (Sim Card)
  const [dashboardView, setDashboardView] = useState<
    'overview' | 'tracking' | 'devices' | 'prisoners' | 'alerts' | 'users' | 'regions' | 'compliance'
  >('overview');
  const [scopeRegionId, setScopeRegionId] = useState<string | null>(null);
  const [scopeRegions, setScopeRegions] = useState<{ id: string; name: string }[]>([]);

  // Nạp danh sách địa bàn cho bộ lọc phạm vi (chỉ superadmin mới có quyền + cần selector).
  useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    import('api/gosafe.management.api')
      .then(({ regionsApi, extractList }) =>
        regionsApi.list({ pageSize: 200 }).then((res) => {
          if (!cancelled) setScopeRegions(extractList(res.data).map((r: any) => ({ id: String(r.id), name: r.name ?? r.code ?? r.id })));
        })
      )
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isSuperAdmin]);

  // Admin không được vào các view super-only → ép về Tổng quan.
  useEffect(() => {
    if (!isSuperAdmin && (SUPER_ONLY_VIEWS as readonly string[]).includes(dashboardView)) {
      setDashboardView('overview');
    }
  }, [isSuperAdmin, dashboardView]);

  // Admin bị khoá phạm vi theo địa bàn được gán (nếu có).
  useEffect(() => {
    if (!isSuperAdmin) {
      const rid = (user as any)?.gosafeRegionIds?.[0];
      if (rid) setScopeRegionId(String(rid));
    }
  }, [isSuperAdmin, user]);

  // Map page sidebar collapsible & overflow menu state
  const [isMapSidebarCollapsed, setIsMapSidebarCollapsed] = useState(false);
  const [mapMenuAnchorEl, setMapMenuAnchorEl] = useState<null | HTMLElement>(null);
  const handleMapMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => setMapMenuAnchorEl(event.currentTarget);
  const handleMapMenuClose = () => setMapMenuAnchorEl(null);

  // Profile dropdown menu state
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const handleProfileOpen = (event: React.MouseEvent<HTMLElement>) => setProfileAnchorEl(event.currentTarget);
  const handleProfileClose = () => setProfileAnchorEl(null);

  // Bell dropdown popover state
  const [bellAnchorEl, setBellAnchorEl] = useState<null | HTMLElement>(null);
  const handleBellOpen = (event: React.MouseEvent<HTMLElement>) => setBellAnchorEl(event.currentTarget);
  const handleBellClose = () => setBellAnchorEl(null);

  // Profile and configuration dialog states
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  // Derived stats
  const totalViolating = useMemo(() => Object.values(deviceViolations).filter(Boolean).length, [deviceViolations]);

  // Breadcrumb + tiêu đề theo view
  const VIEW_META: Record<string, { crumb: string; title: string }> = {
    overview: { crumb: 'Tổng quan', title: 'Tổng quan hệ thống' },
    devices: { crumb: 'Quản lý thiết bị', title: 'Thông tin các thiết bị' },
    prisoners: { crumb: 'Thông tin phạm nhân', title: 'Hồ sơ giám sát phạm nhân' },
    alerts: { crumb: 'Quản lý cảnh báo', title: 'Trung tâm cảnh báo' },
    compliance: { crumb: 'Lịch trình bắt buộc', title: 'Quy tắc tuân thủ & lịch bắt buộc' },
    regions: { crumb: 'Địa bàn quản lý', title: 'Quản lý địa bàn' },
    users: { crumb: 'Người dùng & phân quyền', title: 'Người dùng & phân quyền (RBAC)' }
  };
  const viewMeta = VIEW_META[dashboardView] ?? VIEW_META.overview;

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
          <ShieldSecurity size={28} variant="Bold" color={primaryColor} />
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
        </Stack>

        {/* Scope selector — phạm vi giám sát (chỉ superadmin; admin bị khoá theo địa bàn) */}
        <Box sx={{ display: { xs: isSuperAdmin ? 'none' : 'none', md: isSuperAdmin ? 'flex' : 'none' }, alignItems: 'center', gap: 1 }}>
          <Buildings2 size={18} color={primaryColor} variant="Bold" />
          <TextField
            select
            size="small"
            value={scopeRegionId ?? ''}
            onChange={(e) => setScopeRegionId(e.target.value || null)}
            SelectProps={{ displayEmpty: true }}
            sx={{ minWidth: 200, '& .MuiInputBase-root': { borderRadius: 2, fontSize: '0.82rem', fontWeight: 600 } }}
          >
            <MenuItem value="">Cấp Trung ương · Toàn quốc</MenuItem>
            {scopeRegions.map((r) => (
              <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
            ))}
          </TextField>
        </Box>

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
            <MenuItem
              onClick={() => {
                handleProfileClose();
                setProfileDialogOpen(true);
              }}
              sx={{ py: 1, px: 2, gap: 1.2, fontSize: '0.85rem' }}
            >
              <Profile2User size={18} />
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                Hồ sơ cá nhân
              </Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleProfileClose();
                setConfigDialogOpen(true);
              }}
              sx={{ py: 1, px: 2, gap: 1.2, fontSize: '0.85rem' }}
            >
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
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', position: 'relative' }}>

        {/* ── Liquid Glass Sidebar ──────────────────────────────────────── */}
        {(() => {
          // ── Theme-aware color tokens ──────────────────────────────────
          const txtPrimary   = isDark ? '#ffffff'                   : '#0f172a';
          const txtSecondary = isDark ? 'rgba(255,255,255,0.52)'    : 'rgba(15,23,42,0.50)';
          const txtMuted     = isDark ? 'rgba(255,255,255,0.30)'    : 'rgba(15,23,42,0.30)';
          const glassBase    = isDark
            ? 'linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.05) 60%, rgba(100,140,255,0.07) 100%)'
            : 'linear-gradient(160deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.52) 60%, rgba(200,220,255,0.55) 100%)';
          const glassBorder  = isDark ? 'rgba(255,255,255,0.16)'    : 'rgba(255,255,255,0.80)';
          const rowBorder    = isDark ? 'rgba(255,255,255,0.08)'    : 'rgba(0,0,0,0.06)';
          const activeBg     = isDark
            ? 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.65) 100%)';
          const activeBorder = isDark ? 'rgba(255,255,255,0.28)'    : 'rgba(255,255,255,0.95)';
          const activeShadow = isDark
            ? '0 2px 14px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.35)'
            : '0 2px 14px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)';
          const activeTxt    = isDark ? '#ffffff'                   : '#0f172a';
          const hoverBg      = isDark ? 'rgba(255,255,255,0.07)'    : 'rgba(255,255,255,0.55)';
          const hoverBorder  = isDark ? 'rgba(255,255,255,0.10)'    : 'rgba(255,255,255,0.70)';
          const specular1    = isDark
            ? 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.03) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.60) 0%, rgba(255,255,255,0.10) 40%, rgba(255,255,255,0.20) 100%)';
          const specularEdge = 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 30%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.85) 70%, rgba(255,255,255,0) 100%)';

          return (
            <Box
              sx={{
                position: 'relative',
                width: 290,
                flexShrink: 0,
                zIndex: 99,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: glassBase,
                backdropFilter: 'blur(32px) saturate(1.9) brightness(1.06)',
                WebkitBackdropFilter: 'blur(32px) saturate(1.9) brightness(1.06)',
                border: `1px solid ${glassBorder}`,
                borderLeft: 'none', borderTop: 'none', borderBottom: 'none',
                boxShadow: `10px 0 48px rgba(0,0,0,${isDark ? 0.28 : 0.12}), inset 0 1px 0 rgba(255,255,255,${isDark ? 0.18 : 0.70})`,
                '&::before': {
                  content: '""', position: 'absolute', inset: 0,
                  background: specular1,
                  pointerEvents: 'none', zIndex: 0
                },
                '&::after': {
                  content: '""', position: 'absolute',
                  top: 0, left: 0, right: 0, height: '1px',
                  background: specularEdge,
                  pointerEvents: 'none', zIndex: 1
                }
              }}
            >
              {/* ── Logo row ── */}
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{
                height: 64, px: 2, flexShrink: 0, overflow: 'hidden',
                position: 'relative', zIndex: 2,
                borderBottom: `1px solid ${rowBorder}`,
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.35)'
              }}>
                <Box sx={{
                  width: 38, height: 38, borderRadius: '11px', flexShrink: 0,
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.60) 100%)',
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.90)'}`,
                  boxShadow: `0 2px 12px rgba(0,0,0,${isDark ? 0.20 : 0.08}), inset 0 1px 0 rgba(255,255,255,${isDark ? 0.40 : 1})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <ShieldSecurity size={20} color={primaryColor} variant="Bold" />
                </Box>
                <Box sx={{ overflow: 'hidden', minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: txtPrimary, whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                    GoSafe
                  </Typography>
                  <Typography sx={{ fontSize: '0.63rem', color: txtSecondary, fontWeight: 500, whiteSpace: 'nowrap' }}>
                    Ankle Tracking
                  </Typography>
                </Box>
              </Stack>

              {/* ── Section label ── */}
              <Typography sx={{
                fontSize: '0.6rem', fontWeight: 700, color: txtMuted,
                textTransform: 'uppercase', letterSpacing: 1.3,
                px: 2.5, pt: 2.5, pb: 1,
                position: 'relative', zIndex: 2
              }}>
                Điều hướng
              </Typography>

              {/* ── Nav items ── */}
              <Stack spacing={0.75} sx={{ px: 1.25, pt: 0.25, flexGrow: 1, position: 'relative', zIndex: 2 }}>
                {([
                  { id: 'overview'  as const, label: 'Tổng quan',           icon: <Category     size={19} variant="Bold" />, superOnly: false },
                  { id: 'tracking'  as const, label: 'Bản đồ giám sát',     icon: <MapIcon      size={19} variant="Bold" />, superOnly: false },
                  { id: 'prisoners' as const, label: 'Thông tin phạm nhân', icon: <Profile2User size={19} variant="Bold" />, superOnly: false },
                  { id: 'alerts'    as const, label: 'Quản lý cảnh báo',    icon: <Danger       size={19} variant="Bold" />, superOnly: false },
                  { id: 'compliance' as const, label: 'Lịch trình bắt buộc', icon: <Calendar    size={19} variant="Bold" />, superOnly: false },
                  { id: 'devices'   as const, label: 'Quản lý thiết bị',    icon: <Cpu          size={19} variant="Bold" />, superOnly: true },
                  { id: 'regions'   as const, label: 'Địa bàn quản lý',     icon: <Buildings2   size={19} variant="Bold" />, superOnly: true },
                  { id: 'users'     as const, label: 'Người dùng & quyền',  icon: <SecuritySafe size={19} variant="Bold" />, superOnly: true }
                ] as const).filter((item) => isSuperAdmin || !item.superOnly).map((item) => {
                  const active = dashboardView === item.id;
                  return (
                    <Box
                      key={item.id}
                      onClick={() => { setDashboardView(item.id); }}
                      sx={{
                        display: 'flex', alignItems: 'center',
                        height: 46,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        px: 2,
                        justifyContent: 'flex-start',
                        position: 'relative',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: active ? activeBg : 'transparent',
                        backdropFilter: active ? 'blur(10px)' : 'none',
                        WebkitBackdropFilter: active ? 'blur(10px)' : 'none',
                        border: `1px solid ${active ? activeBorder : 'transparent'}`,
                        boxShadow: active ? activeShadow : 'none',
                        color: active ? activeTxt : txtSecondary,
                        '&:hover': {
                          background: active ? activeBg : hoverBg,
                          border: `1px solid ${active ? activeBorder : hoverBorder}`,
                          color: active ? activeTxt : txtPrimary
                        }
                      }}
                    >
                      {/* Icon */}
                      <Box sx={{
                        display: 'flex', alignItems: 'center', flexShrink: 0,
                        color: active ? (isDark ? '#ffffff' : primaryColor) : 'inherit'
                      }}>
                        {item.icon}
                      </Box>
                      {/* Label */}
                      <Typography sx={{
                        ml: 1.75, fontSize: '0.85rem',
                        fontWeight: active ? 700 : 500,
                        color: active ? (isDark ? '#ffffff' : '#0f172a') : txtSecondary,
                        whiteSpace: 'nowrap',
                        letterSpacing: active ? 0.1 : 0
                      }}>
                        {item.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>

              {/* ── Glass footer ── */}
              <Box sx={{
                px: 2.5, py: 1.75,
                position: 'relative', zIndex: 2,
                borderTop: `1px solid ${rowBorder}`,
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.30)'
              }}>
                <Typography sx={{ fontSize: '0.63rem', color: txtMuted, fontWeight: 500 }}>
                  v2.0 · GoSafe System
                </Typography>
              </Box>
            </Box>
          );
        })()}

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
            /* ═══ VIEW 2: MAP DEVICE MONITORING (FLOATING GLASS SIDEBAR) ═══ */
            <Box sx={{ flexGrow: 1, height: '100%', overflow: 'hidden', position: 'relative' }}>
              
              {/* Backdrop Map */}
              <Box sx={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                <TrackingMap store={store} />
              </Box>

              {/* Floating Title, Custom Zoom & Control Menu at Bottom-Left */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: isMapSidebarCollapsed ? 16 : 452,
                  zIndex: 10,
                  bgcolor: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(16px)',
                  px: 2.5,
                  py: 1.25,
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    className="gs-blink"
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#22c55e',
                      boxShadow: '0 0 8px #22c55e',
                    }}
                  />
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '15px',
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      letterSpacing: -0.2,
                    }}
                  >
                    Giám sát thời gian thực
                  </Typography>
                </Stack>

                <Divider orientation="vertical" flexItem sx={{ borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)', my: 0.5 }} />

                <Tooltip title="Cấu hình hiển thị" arrow>
                  <IconButton
                    size="medium"
                    onClick={handleMapMenuOpen}
                    sx={{
                      color: isDark ? '#cbd5e1' : '#475569',
                      p: 1,
                      bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                      borderRadius: '8px',
                      '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }
                    }}
                  >
                    <HambergerMenu size={20} />
                  </IconButton>
                </Tooltip>

                <Divider orientation="vertical" flexItem sx={{ borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)', my: 0.5 }} />

                <Stack direction="row" spacing={0.75}>
                  <Tooltip title="Thu nhỏ (Zoom out)" arrow>
                    <span>
                      <IconButton
                        onClick={() => store.setMapZoom(Math.max(store.mapZoom - 1, 3))}
                        disabled={store.mapZoom <= 3}
                        size="small"
                        sx={{
                          color: isDark ? '#cbd5e1' : '#475569',
                          bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                          borderRadius: '8px',
                          width: 36,
                          height: 36,
                          fontFamily: 'system-ui, sans-serif',
                          fontSize: '18px',
                          fontWeight: 700,
                          '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }
                        }}
                      >
                        −
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Phóng to (Zoom in)" arrow>
                    <span>
                      <IconButton
                        onClick={() => store.setMapZoom(Math.min(store.mapZoom + 1, 18))}
                        disabled={store.mapZoom >= 18}
                        size="small"
                        sx={{
                          color: isDark ? '#cbd5e1' : '#475569',
                          bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                          borderRadius: '8px',
                          width: 36,
                          height: 36,
                          fontFamily: 'system-ui, sans-serif',
                          fontSize: '18px',
                          fontWeight: 700,
                          '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }
                        }}
                      >
                        +
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Box>

              {/* Overflow Dropdown Menu */}
              <Menu
                anchorEl={mapMenuAnchorEl}
                open={Boolean(mapMenuAnchorEl)}
                onClose={handleMapMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 260,
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    bgcolor: isDark ? '#0f172a' : '#ffffff',
                    p: 1.25,
                  }
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    px: 2,
                    py: 1,
                    display: 'block',
                    fontWeight: 800,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: 0.8,
                    fontFamily: 'system-ui, sans-serif',
                  }}
                >
                  BẢN ĐỒ GIÁM SÁT
                </Typography>
                <Divider sx={{ my: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
                <MenuItem disableRipple sx={{ py: 0.75, px: 2, '&:hover': { bgcolor: 'transparent' } }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!isMapSidebarCollapsed}
                        onChange={(e) => setIsMapSidebarCollapsed(!e.target.checked)}
                        size="medium"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: primaryColor },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: primaryColor }
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontWeight: 600, fontSize: '0.925rem', fontFamily: 'system-ui, sans-serif' }}>
                        Hiển thị Bảng điều khiển
                      </Typography>
                    }
                  />
                </MenuItem>
                <Divider sx={{ my: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
                <MenuItem
                  onClick={() => {
                    setIsMapSidebarCollapsed(false);
                    handleMapMenuClose();
                  }}
                  sx={{
                    py: 1.25,
                    px: 2,
                    borderRadius: '8px',
                    fontSize: '0.925rem',
                    fontWeight: 600,
                    fontFamily: 'system-ui, sans-serif',
                    '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }
                  }}
                >
                  Hiện bảng giám sát
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setIsMapSidebarCollapsed(true);
                    handleMapMenuClose();
                  }}
                  sx={{
                    py: 1.25,
                    px: 2,
                    borderRadius: '8px',
                    fontSize: '0.925rem',
                    fontWeight: 600,
                    fontFamily: 'system-ui, sans-serif',
                    color: 'error.main',
                    '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }
                  }}
                >
                  Ẩn bảng giám sát
                </MenuItem>
              </Menu>

              {/* Floating sidebar panel */}
              <Box
                className="gs-glass-panel"
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  bottom: 16,
                  width: 420,
                  zIndex: 5,
                  bgcolor: isDark ? 'rgba(9, 13, 31, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isMapSidebarCollapsed ? 'translateX(-436px)' : 'none'
                }}
              >
                {/* Sidebar contents */}
                {/* Search */}
                <Box sx={{ px: 1.5, pt: 1.5, pb: 1 }}>
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

                {/* Segmented Control Tabs */}
                <Box sx={{ p: 1.25, borderBottom: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f1f5f9',
                      borderRadius: '10px',
                      p: 0.5
                    }}
                  >
                    {[
                      { idx: 0, label: 'Thiết bị', icon: <Personalcard size={16} /> },
                      { idx: 1, label: 'Geofence', icon: <MapIcon size={16} /> },
                      { idx: 2, label: 'Lịch sử', icon: <Clock size={16} /> }
                    ].map((tabItem) => {
                      const isTabActive = activeTab === tabItem.idx;
                      return (
                        <Box
                          key={tabItem.idx}
                          onClick={() => setActiveTab(tabItem.idx)}
                          sx={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.8,
                            py: 0.75,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: isTabActive ? (isDark ? '#ffffff' : '#0f172a') : '#6b7280',
                            bgcolor: isTabActive ? (isDark ? 'rgba(255, 255, 255, 0.08)' : '#ffffff') : 'transparent',
                            boxShadow: isTabActive && !isDark ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                            transition: 'all 0.2s',
                            '&:hover': {
                              color: isDark ? '#ffffff' : '#0f172a'
                            }
                          }}
                        >
                          {tabItem.icon}
                          <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'inherit' }}>
                            {tabItem.label}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                {/* List Content Panel */}
                <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', p: 1.25 }}>
                  {activeTab === 0 && <DeviceList store={store} />}
                  {activeTab === 1 && <GeofenceList store={store} />}
                  {activeTab === 2 && <GpsHistoryPanel store={store} />}
                </Box>
              </Box>

              {/* Collapse Chevron Handle Button (Moved outside to prevent overflow:hidden clipping) */}
              <IconButton
                onClick={() => setIsMapSidebarCollapsed(!isMapSidebarCollapsed)}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: isMapSidebarCollapsed ? 16 : 436,
                  transform: 'translateY(-50%)',
                  width: 24,
                  height: 48,
                  borderRadius: isMapSidebarCollapsed ? '8px' : '0 8px 8px 0',
                  bgcolor: isDark ? 'rgba(9, 13, 31, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                  borderLeft: isMapSidebarCollapsed ? undefined : 'none',
                  boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
                  zIndex: 10,
                  transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.3s, border-left 0.3s',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(9, 13, 31, 1)' : 'rgba(255, 255, 255, 1)'
                  },
                  p: 0
                }}
              >
                {isMapSidebarCollapsed ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#94a3b8' : '#475569'} strokeWidth="2.5">
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#94a3b8' : '#475569'} strokeWidth="2.5">
                    <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </IconButton>
            </Box>
          ) : (
            /* ═══ OTHER VIEWS: OVERVIEW, DEVICES, PRISONERS, SIMS ═══ */
            <Box sx={{ p: 2, flexGrow: 1 }}>
              {/* Breadcrumbs Header */}
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.68rem' }}
                >
                  Hệ thống quản lý & Giám sát / {viewMeta.crumb}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 500, mt: 0.5, color: isDark ? '#f8fafc' : '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
                  {viewMeta.title}
                </Typography>
              </Box>

              {/* ═══ VIEW 1: OVERVIEW DASHBOARD ════════════════════════════════ */}
              {dashboardView === 'overview' && <DashboardOverview isDark={isDark} store={store} setDashboardView={setDashboardView} scopeRegionId={scopeRegionId} />}

              {/* ═══ VIEW 3: DEVICE MANAGEMENT TABLE (super-only) ════════════ */}
              {dashboardView === 'devices' && isSuperAdmin && <DeviceManagementTable isDark={isDark} store={store} setDashboardView={setDashboardView} />}

              {/* ═══ VIEW 4: PRISONER HOSIER (SUBJECTS TABLE) ══════════════════════ */}
              {dashboardView === 'prisoners' && (
                <PrisonerManagementTable isDark={isDark} store={store} setDashboardView={setDashboardView} />
              )}

              {/* ═══ VIEW 6: ALERTS MANAGEMENT ═══════════════════════════════ */}
              {dashboardView === 'alerts' && <AlertsManagement isDark={isDark} scopeRegionId={scopeRegionId} />}

              {/* ═══ VIEW 7: COMPLIANCE (lịch trình bắt buộc) ════════════════ */}
              {dashboardView === 'compliance' && <ComplianceManagement isDark={isDark} />}

              {/* ═══ VIEW 8: REGION MANAGEMENT (super-only) ═════════════════ */}
              {dashboardView === 'regions' && isSuperAdmin && <RegionManagement isDark={isDark} />}

              {/* ═══ VIEW 9: USERS & RBAC (super-only) ══════════════════════ */}
              {dashboardView === 'users' && isSuperAdmin && <UserManagement isDark={isDark} />}
            </Box>
          )}
        </Box>
      </Box>

      {/* Dialogs: Add/Edit Device, Delete, Geofence assign, geofence info, etc. */}
      <TrackingDialogs store={store} />

      <ProfileDialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        user={user}
        primaryColor={primaryColor}
        isDark={isDark}
      />

      <SystemConfigDialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        store={store}
        primaryColor={primaryColor}
        isDark={isDark}
      />

      {/* ── Critical alert overlay — SOS & Fiber Cut ── */}
      <CriticalAlertOverlay
        alerts={criticalAlerts}
        devices={devices}
        onDismiss={dismissCriticalAlert}
        onDismissAll={dismissAllCriticalAlerts}
        onFocusDevice={(imei) => {
          const dev = devices.find((d) => d.uniqueId === imei);
          if (dev) {
            setSelectedDeviceId(dev.id);
            setMapCenter(dev.coords);
            setDashboardView('tracking');
          }
        }}
      />
    </Box>
  );
}
