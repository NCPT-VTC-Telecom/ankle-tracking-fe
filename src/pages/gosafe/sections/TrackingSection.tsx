import {
  Box,
  TextField,
  Stack,
  Badge,
  Typography,
  IconButton,
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
  Danger,
  Cpu,
  Profile2User,
  Clock,
  SecuritySafe,
  Buildings2,
  Calendar,
  Refresh,
  DocumentText
} from 'iconsax-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuth from 'hooks/useAuth';
import logoVTC from 'assets/logo/logo-VTC.png';
import FeedbackProvider from '../components/FeedbackProvider';

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
import AuditLogManagement from './components/AuditLogManagement';
import ComplianceManagement from './components/ComplianceManagement';

interface TrackingSectionProps {
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

// Các view chỉ dành cho superadmin (quản trị hệ thống: thiết bị, SIM/NCC, địa bàn, người dùng).
const SUPER_ONLY_VIEWS = ['devices', 'regions', 'users', 'audit'] as const;

type DashboardView =
  | 'overview'
  | 'tracking'
  | 'devices'
  | 'prisoners'
  | 'alerts'
  | 'users'
  | 'regions'
  | 'compliance'
  | 'audit';
const VALID_VIEWS: DashboardView[] = [
  'overview',
  'tracking',
  'devices',
  'prisoners',
  'alerts',
  'users',
  'regions',
  'compliance',
  'audit'
];

export default function TrackingSection({
  isDark,
  primaryColor,
  secondaryColor
}: TrackingSectionProps) {
  const store = useTracking(isDark, primaryColor, secondaryColor);
  const { user, logout } = useAuth();
  // Phân quyền: superadmin thấy toàn bộ; admin (cán bộ địa bàn) chỉ quản lý đối tượng trong phạm vi.
  const isSuperAdmin = Boolean(
    (user as any)?.gosafeIsSuperAdmin ||
      /super/i.test(String((user as any)?.role ?? '')) ||
      (Array.isArray((user as any)?.gosafeRoles) &&
        (user as any).gosafeRoles.some((r: string) => /super/i.test(r)))
  );
  const {
    devices,
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
    acknowledgeCriticalAlert
  } = store;

  // Dashboard view đồng bộ với URL (/gosafe/:view) — đổi tab là đổi route.
  const navigate = useNavigate();
  const { view } = useParams();
  const dashboardView: DashboardView = (VALID_VIEWS as string[]).includes(view ?? '')
    ? (view as DashboardView)
    : 'overview';
  const setDashboardView = useCallback((v: DashboardView) => navigate(`/gosafe/${v}`), [navigate]);
  // Phạm vi địa bàn lấy từ store (lọc map/list "cấp cơ sở đổ xuống").
  const { scopeRegionId, setScopeRegionId, scopeRegions } = store;

  // Refresh đúng tab đang focus: tăng refreshKey → view đang hiển thị nạp lại dữ liệu.
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
    store.fetchLiveDevices?.(); // các view dùng store (tracking/prisoner) nạp lại từ feed
    // tín hiệu spinner ngắn cho phản hồi tức thì (view tự fetch theo refreshKey).
    setTimeout(() => setRefreshing(false), 700);
  }, [store]);

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
  const handleMapMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) =>
    setMapMenuAnchorEl(event.currentTarget);
  const handleMapMenuClose = () => setMapMenuAnchorEl(null);

  // Profile dropdown menu state
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const handleProfileOpen = (event: React.MouseEvent<HTMLElement>) =>
    setProfileAnchorEl(event.currentTarget);
  const handleProfileClose = () => setProfileAnchorEl(null);

  // Bell dropdown popover state
  const [bellAnchorEl, setBellAnchorEl] = useState<null | HTMLElement>(null);
  const handleBellOpen = (event: React.MouseEvent<HTMLElement>) =>
    setBellAnchorEl(event.currentTarget);
  const handleBellClose = () => setBellAnchorEl(null);

  // Profile and configuration dialog states
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  // Derived stats
  const totalViolating = useMemo(
    () => Object.values(deviceViolations).filter(Boolean).length,
    [deviceViolations]
  );
  // Thiết bị pin yếu (< 20%). Loại pin 0 (thiết bị chưa đồng bộ — placeholder) để tránh
  // báo nhầm khi đang tải.
  const lowBatteryCount = useMemo(
    () => devices.filter((d) => d.status.battery > 0 && d.status.battery < 20).length,
    [devices]
  );

  // Breadcrumb + tiêu đề theo view
  const VIEW_META: Record<string, { crumb: string; title: string }> = {
    overview: { crumb: 'Tổng quan', title: 'Tổng quan hệ thống' },
    devices: { crumb: 'Quản lý thiết bị', title: 'Thông tin các thiết bị' },
    prisoners: { crumb: 'Thông tin phạm nhân', title: 'Hồ sơ giám sát phạm nhân' },
    alerts: { crumb: 'Quản lý cảnh báo', title: 'Trung tâm cảnh báo' },
    compliance: { crumb: 'Lịch trình bắt buộc', title: 'Quy tắc tuân thủ & lịch bắt buộc' },
    regions: { crumb: 'Quản lý địa bàn', title: 'Quản lý địa bàn' },
    users: { crumb: 'Người dùng & phân quyền', title: 'Người dùng & phân quyền' },
    audit: { crumb: 'Nhật ký hệ thống', title: 'Nhật ký hành vi (Audit Log)' }
  };
  const viewMeta = VIEW_META[dashboardView] ?? VIEW_META.overview;

  return (
    <FeedbackProvider isDark={isDark}>
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
        {/* Floating Notification FAB & Popovers */}
        <Box sx={{ position: 'absolute', top: 0, right: 0, pointerEvents: 'none', zIndex: 1100 }}>
          <Box sx={{ pointerEvents: 'auto' }}>
            <IconButton
              onClick={handleBellOpen}
              className={
                totalViolating > 0
                  ? 'gs-fab-violation'
                  : lowBatteryCount > 0
                  ? 'gs-fab-lowbat'
                  : undefined
              }
              sx={{
                position: 'fixed',
                top: 20,
                right: 24,
                width: 52,
                height: 52,
                bgcolor: isDark ? '#1e293b' : '#ffffff',
                color:
                  totalViolating > 0
                    ? '#ef4444'
                    : lowBatteryCount > 0
                    ? '#f59e0b'
                    : isDark
                    ? '#f8fafc'
                    : '#475569',
                boxShadow: isDark
                  ? '0 8px 30px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08)'
                  : '0 8px 30px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                '&:hover': {
                  bgcolor: isDark ? '#334155' : '#f8fafc',
                  transform: 'scale(1.05)',
                  boxShadow: isDark
                    ? '0 12px 36px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.12)'
                    : '0 12px 36px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.06)'
                },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Badge
                badgeContent={statusAlertCount + totalViolating}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    height: 18,
                    minWidth: 18,
                    borderRadius: '9px',
                    border: `2px solid ${isDark ? '#1e293b' : '#ffffff'}`
                  }
                }}
              >
                <Notification size={24} />
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
                  mt: 1.5,
                  p: 2,
                  borderRadius: '12px',
                  boxShadow: isDark
                    ? '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08)'
                    : '0 12px 40px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.06)',
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
          </Box>
        </Box>

        {/* Cảnh báo "ra ngoài vùng" KHÔNG còn glow/banner toàn màn hình — chuyển vào
            badge + glow của FAB chuông (xem .gs-fab-violation) vì có thể có nhiều thiết bị
            vi phạm cùng lúc; chi tiết liệt kê trong popover NotificationList. */}

        {/* ═══ WORKSPACE LAYOUT ═══════════════════════════════════════════════ */}
        <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
          {/* ── Liquid Glass Sidebar ──────────────────────────────────────── */}
          {(() => {
            // ── Navy Gradient style variables (always dark navy sidebar for premium contrast) ──
            const txtPrimary = '#ffffff';
            const txtSecondary = 'rgba(255, 255, 255, 0.70)';
            const txtMuted = 'rgba(255, 255, 255, 0.45)';
            const glassBase = 'linear-gradient(180deg, #0b1a30 0%, #050c18 100%)';
            const glassBorder = 'rgba(255, 255, 255, 0.08)';
            const rowBorder = 'rgba(255, 255, 255, 0.08)';
            const activeBg =
              'linear-gradient(90deg, rgba(56, 189, 248, 0.22) 0%, rgba(56, 189, 248, 0.05) 100%)';
            const activeBorder = 'rgba(56, 189, 248, 0.35)';
            const activeShadow = '0 4px 20px rgba(0, 0, 0, 0.25)';
            const activeTxt = '#ffffff';
            const hoverBg = 'rgba(255, 255, 255, 0.05)';
            const hoverBorder = 'rgba(255, 255, 255, 0.08)';

            const MENU_SECTIONS = [
              {
                title: 'Theo dõi',
                items: [
                  {
                    id: 'overview' as const,
                    label: 'Tổng quan',
                    icon: <Category size={19} variant="Bold" />,
                    superOnly: false
                  },
                  {
                    id: 'tracking' as const,
                    label: 'Bản đồ giám sát',
                    icon: <MapIcon size={19} variant="Bold" />,
                    superOnly: false
                  },
                  {
                    id: 'prisoners' as const,
                    label: 'Thông tin phạm nhân',
                    icon: <Profile2User size={19} variant="Bold" />,
                    superOnly: false
                  },
                  {
                    id: 'regions' as const,
                    label: 'Quản lý địa bàn',
                    icon: <Buildings2 size={19} variant="Bold" />,
                    superOnly: true
                  }
                ]
              },
              {
                title: 'Cảnh báo',
                items: [
                  {
                    id: 'alerts' as const,
                    label: 'Quản lý cảnh báo',
                    icon: <Danger size={19} variant="Bold" />,
                    superOnly: false
                  },
                  {
                    id: 'compliance' as const,
                    label: 'Lịch trình bắt buộc',
                    icon: <Calendar size={19} variant="Bold" />,
                    superOnly: false
                  }
                ]
              },
              {
                title: 'Thiết bị',
                items: [
                  {
                    id: 'devices' as const,
                    label: 'Quản lý thiết bị',
                    icon: <Cpu size={19} variant="Bold" />,
                    superOnly: true
                  }
                ]
              },
              {
                title: 'Người dùng',
                items: [
                  {
                    id: 'users' as const,
                    label: 'Người dùng & quyền',
                    icon: <SecuritySafe size={19} variant="Bold" />,
                    superOnly: true
                  }
                ]
              },
              {
                title: 'Hệ thống',
                items: [
                  {
                    id: 'audit' as const,
                    label: 'Nhật ký hệ thống',
                    icon: <DocumentText size={19} variant="Bold" />,
                    superOnly: true
                  }
                ]
              }
            ];

            const visibleSections = MENU_SECTIONS.map((section) => ({
              ...section,
              items: section.items.filter((item) => isSuperAdmin || !item.superOnly)
            })).filter((section) => section.items.length > 0);

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
                  borderRight: `1px solid ${glassBorder}`,
                  boxShadow: '10px 0 40px rgba(0,0,0,0.15)'
                }}
              >
                {/* ── Sidebar Header: Logo & Title ── */}
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{
                    px: 3,
                    py: 2.5,
                    borderBottom: `1px solid ${glassBorder}`,
                    background: 'rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <Box
                    component="img"
                    src={logoVTC}
                    alt="VTC Telecom"
                    sx={{
                      height: 32,
                      width: 'auto',
                      objectFit: 'contain',
                      filter: 'brightness(0) invert(1)'
                    }}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 700, // Inter Bold bình thường
                        fontSize: '1.05rem',
                        color: '#ffffff',
                        lineHeight: 1.2,
                        letterSpacing: '0.02em'
                      }}
                    >
                      Hệ thống
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        lineHeight: 1.1,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        mt: 0.2
                      }}
                    >
                      Giám sát Điện tử EMS
                    </Typography>
                  </Box>
                </Stack>

                {/* ── Nav Sections & Items ── */}
                <Box
                  sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    px: 1.5,
                    py: 2.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    '&::-webkit-scrollbar': { width: 4 },
                    '&::-webkit-scrollbar-thumb': {
                      bgcolor: 'rgba(255,255,255,0.08)',
                      borderRadius: 2
                    }
                  }}
                >
                  {visibleSections.map((section) => (
                    <Stack key={section.title} spacing={0.75}>
                      {/* Section Title */}
                      <Typography
                        sx={{
                          fontFamily: '"Inter", sans-serif',
                          fontSize: '0.68rem',
                          fontWeight: 700, // Inter bold bình thường
                          color: txtMuted,
                          textTransform: 'uppercase',
                          letterSpacing: '0.12em',
                          px: 1.5,
                          mb: 0.5
                        }}
                      >
                        {section.title}
                      </Typography>

                      {/* Section Items */}
                      {section.items.map((item) => {
                        const active = dashboardView === item.id;
                        return (
                          <Box
                            key={item.id}
                            onClick={() => {
                              setDashboardView(item.id);
                            }}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              height: 44,
                              borderRadius: '10px',
                              cursor: 'pointer',
                              px: 2,
                              justifyContent: 'flex-start',
                              position: 'relative',
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              background: active ? activeBg : 'transparent',
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
                            {/* Left Active Glow Indicator Line */}
                            {active && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  left: 0,
                                  top: '25%',
                                  height: '50%',
                                  width: '3px',
                                  borderRadius: '0 4px 4px 0',
                                  bgcolor: '#38bdf8',
                                  boxShadow: '0 0 10px #38bdf8'
                                }}
                              />
                            )}

                            {/* Icon */}
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                flexShrink: 0,
                                color: active ? '#38bdf8' : 'inherit'
                              }}
                            >
                              {item.icon}
                            </Box>

                            {/* Label */}
                            <Typography
                              sx={{
                                fontFamily: '"Inter", sans-serif',
                                ml: 2,
                                fontSize: '0.85rem',
                                fontWeight: active ? 500 : 400, // Inter thường cho các list
                                color: active ? '#ffffff' : txtSecondary,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {item.label}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  ))}
                </Box>

                {/* ── Bottom Sidebar Container ── */}
                <Box
                  sx={{
                    px: 2.5,
                    py: 2,
                    zIndex: 2,
                    borderTop: `1px solid ${rowBorder}`,
                    background: 'rgba(0, 0, 0, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  {/* Scope Selector (Cấp trung ương) */}
                  {isSuperAdmin && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 0.5
                      }}
                    >
                      <Buildings2 size={18} color="#38bdf8" variant="Bold" />
                      <TextField
                        select
                        size="small"
                        value={scopeRegionId ?? ''}
                        onChange={(e) => setScopeRegionId(e.target.value || null)}
                        SelectProps={{ displayEmpty: true }}
                        sx={{
                          flexGrow: 1,
                          '& .MuiInputBase-root': {
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: '#ffffff',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            '& fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.15)'
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.3)'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#38bdf8'
                            }
                          },
                          '& .MuiSelect-select': {
                            py: 0.75
                          },
                          '& .MuiSvgIcon-root': {
                            color: 'rgba(255, 255, 255, 0.7)'
                          }
                        }}
                      >
                        <MenuItem value="">Cấp Trung ương · Toàn quốc</MenuItem>
                        {scopeRegions.map((r) => (
                          <MenuItem key={r.id} value={r.id}>
                            {r.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  )}

                  {/* User Profile */}
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    onClick={handleProfileOpen}
                    sx={{
                      cursor: 'pointer',
                      p: 1,
                      borderRadius: '10px',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: primaryColor,
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        fontFamily: '"Inter", sans-serif',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                      }}
                    >
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
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontFamily: '"Inter", sans-serif',
                          fontWeight: 700,
                          lineHeight: 1.2,
                          fontSize: '0.85rem',
                          color: '#ffffff',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {user?.fullname || user?.name || 'Người dùng'}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: '"Inter", sans-serif',
                          color: 'rgba(255, 255, 255, 0.5)',
                          display: 'block',
                          lineHeight: 1.1,
                          fontSize: '0.72rem',
                          fontWeight: 500,
                          mt: 0.25,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {user?.role ||
                          (user?.username === 'gosafe_admin'
                            ? 'Quản trị viên GoSafe'
                            : 'Quản trị viên')}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Version Footer */}
                  <Typography
                    sx={{
                      fontFamily: '"Inter", sans-serif',
                      fontSize: '0.65rem',
                      color: txtMuted,
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                      px: 1,
                      mt: -0.5
                    }}
                  >
                    v2.0 · VTC Telecom · EMS
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
                    transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
                        boxShadow: '0 0 8px #22c55e'
                      }}
                    />
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: '15px',
                        color: isDark ? '#ffffff' : '#0f172a',
                        letterSpacing: -0.2
                      }}
                    >
                      Giám sát thời gian thực
                    </Typography>
                  </Stack>

                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
                      my: 0.5
                    }}
                  />

                  <Tooltip title="Cấu hình hiển thị" arrow>
                    <IconButton
                      size="medium"
                      onClick={handleMapMenuOpen}
                      sx={{
                        color: isDark ? '#cbd5e1' : '#475569',
                        p: 1,
                        bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                        borderRadius: '8px',
                        '&:hover': {
                          bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'
                        }
                      }}
                    >
                      <HambergerMenu size={20} />
                    </IconButton>
                  </Tooltip>

                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
                      my: 0.5
                    }}
                  />

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
                            fontSize: '18px',
                            fontWeight: 700,
                            '&:hover': {
                              bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'
                            }
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
                            fontSize: '18px',
                            fontWeight: 700,
                            '&:hover': {
                              bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'
                            }
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
                      p: 1.25
                    }
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      px: 2,
                      py: 1,
                      display: 'block',
                      fontWeight: 700,
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      letterSpacing: 0.8
                    }}
                  >
                    BẢN ĐỒ GIÁM SÁT
                  </Typography>
                  <Divider
                    sx={{
                      my: 1,
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
                    }}
                  />
                  <MenuItem
                    disableRipple
                    sx={{ py: 0.75, px: 2, '&:hover': { bgcolor: 'transparent' } }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!isMapSidebarCollapsed}
                          onChange={(e) => setIsMapSidebarCollapsed(!e.target.checked)}
                          size="medium"
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: primaryColor },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: primaryColor
                            }
                          }}
                        />
                      }
                      label={
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.925rem'
                          }}
                        >
                          Hiển thị Bảng điều khiển
                        </Typography>
                      }
                    />
                  </MenuItem>
                  <Divider
                    sx={{
                      my: 1,
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
                    }}
                  />
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
                    borderRadius: '24px',
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
                  <Box sx={{ px: 2, pt: 2, pb: 1.25 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Tên, IMEI, phạm nhân..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '16px',
                          fontSize: '0.925rem',
                          fontFamily: '"Inter", sans-serif',
                          bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                          '& fieldset': {
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#cbd5e1',
                            borderWidth: '1px'
                          },
                          '&:hover fieldset': {
                            borderColor: primaryColor
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: primaryColor,
                            borderWidth: '1.5px'
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <SearchNormal1 size="20" style={{ marginRight: 8, color: '#94a3b8' }} />
                        )
                      }}
                    />
                  </Box>

                  {/* Segmented Control Tabs */}
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderBottom: '1px solid',
                      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f1f5f9',
                        borderRadius: '16px',
                        p: 0.5
                      }}
                    >
                      {[
                        { idx: 0, label: 'Thiết bị', icon: <Personalcard size={18} /> },
                        { idx: 1, label: 'Geofence', icon: <MapIcon size={18} /> },
                        { idx: 2, label: 'Lịch sử', icon: <Clock size={18} /> }
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
                              py: 0.85,
                              borderRadius: '12px',
                              cursor: 'pointer',
                              fontSize: '13.5px',
                              fontWeight: 600,
                              fontFamily: '"Inter", sans-serif',
                              color: isTabActive ? (isDark ? '#ffffff' : '#0f172a') : '#6b7280',
                              bgcolor: isTabActive
                                ? isDark
                                  ? 'rgba(255, 255, 255, 0.08)'
                                  : '#ffffff'
                                : 'transparent',
                              boxShadow:
                                isTabActive && !isDark ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                              transition: 'all 0.2s',
                              '&:hover': {
                                color: isDark ? '#ffffff' : '#0f172a'
                              }
                            }}
                          >
                            {tabItem.icon}
                            <Typography
                              sx={{
                                fontSize: '13.5px',
                                fontWeight: 600,
                                fontFamily: '"Inter", sans-serif',
                                color: 'inherit'
                              }}
                            >
                              {tabItem.label}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>

                  {/* List Content Panel */}
                  <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', px: 2, py: 1.75 }}>
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
                    transition:
                      'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.3s, border-left 0.3s',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(9, 13, 31, 1)' : 'rgba(255, 255, 255, 1)'
                    },
                    p: 0
                  }}
                >
                  {isMapSidebarCollapsed ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isDark ? '#94a3b8' : '#475569'}
                      strokeWidth="2.5"
                    >
                      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isDark ? '#94a3b8' : '#475569'}
                      strokeWidth="2.5"
                    >
                      <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </IconButton>
              </Box>
            ) : (
              /* ═══ OTHER VIEWS: OVERVIEW, DEVICES, PRISONERS, SIMS ═══ */
              <Box sx={{ px: { xs: 2, md: 3.5 }, py: 3, flexGrow: 1 }}>
                {/* Breadcrumbs Header */}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1.5 }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: 0.8,
                        fontSize: '0.68rem'
                      }}
                    >
                      Hệ thống quản lý & Giám sát / {viewMeta.crumb}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 500,
                        mt: 0.5,
                        color: isDark ? '#f8fafc' : '#0f172a'
                      }}
                    >
                      {viewMeta.title}
                    </Typography>
                  </Box>
                  <Tooltip title="Tải lại dữ liệu trang này">
                    <IconButton
                      onClick={handleRefresh}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                        color: 'text.secondary',
                        '& svg': {
                          transition: 'transform 0.6s',
                          transform: refreshing ? 'rotate(360deg)' : 'none'
                        },
                        '&:hover': { color: primaryColor, borderColor: primaryColor }
                      }}
                    >
                      <Refresh size={18} />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {/* ═══ VIEW 1: OVERVIEW DASHBOARD ════════════════════════════════ */}
                {dashboardView === 'overview' && (
                  <DashboardOverview
                    isDark={isDark}
                    store={store}
                    setDashboardView={setDashboardView}
                    scopeRegionId={scopeRegionId}
                    refreshKey={refreshKey}
                  />
                )}

                {/* ═══ VIEW 3: DEVICE MANAGEMENT TABLE (super-only) ════════════ */}
                {dashboardView === 'devices' && isSuperAdmin && (
                  <DeviceManagementTable
                    isDark={isDark}
                    store={store}
                    setDashboardView={setDashboardView}
                    refreshKey={refreshKey}
                  />
                )}

                {/* ═══ VIEW 4: PRISONER HOSIER (SUBJECTS TABLE) ══════════════════════ */}
                {dashboardView === 'prisoners' && (
                  <PrisonerManagementTable
                    isDark={isDark}
                    store={store}
                    setDashboardView={setDashboardView}
                    refreshKey={refreshKey}
                  />
                )}

                {/* ═══ VIEW 6: ALERTS MANAGEMENT ═══════════════════════════════ */}
                {dashboardView === 'alerts' && (
                  <AlertsManagement
                    isDark={isDark}
                    scopeRegionId={scopeRegionId}
                    refreshKey={refreshKey}
                  />
                )}

                {/* ═══ VIEW 7: COMPLIANCE (lịch trình bắt buộc) ════════════════ */}
                {dashboardView === 'compliance' && (
                  <ComplianceManagement
                    isDark={isDark}
                    isSuperAdmin={isSuperAdmin}
                    refreshKey={refreshKey}
                  />
                )}

                {/* ═══ VIEW 8: REGION MANAGEMENT (super-only) ═════════════════ */}
                {dashboardView === 'regions' && isSuperAdmin && (
                  <RegionManagement isDark={isDark} refreshKey={refreshKey} />
                )}

                {/* ═══ VIEW 9: USERS & RBAC (super-only) ══════════════════════ */}
                {dashboardView === 'users' && isSuperAdmin && (
                  <UserManagement isDark={isDark} refreshKey={refreshKey} />
                )}

                {/* ═══ VIEW 10: AUDIT LOG (super-only) ════════════════════════ */}
                {dashboardView === 'audit' && isSuperAdmin && (
                  <AuditLogManagement isDark={isDark} refreshKey={refreshKey} />
                )}
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
          onAcknowledge={acknowledgeCriticalAlert}
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
    </FeedbackProvider>
  );
}
