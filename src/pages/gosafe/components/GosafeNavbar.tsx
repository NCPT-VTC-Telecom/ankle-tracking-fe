import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Toolbar,
  alpha,
  useScrollTrigger,
  useTheme,
  Link,
  useMediaQuery,
  Drawer,
  Typography
} from '@mui/material';
import { HambergerMenu, Moon, Sun1, Translate, Login, ArrowRight2 } from 'iconsax-react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import settings from 'settings';

interface GosafeNavbarProps {
  primaryColor: string;
  secondaryColor: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
  currentLang: string;
  activeView: 'landing' | 'tracking';
  onViewChange: (view: 'landing' | 'tracking') => void;
}

const GosafeNavbar = ({
  primaryColor,
  secondaryColor,
  isDark,
  onToggleTheme,
  onToggleLanguage,
  currentLang,
  activeView,
  onViewChange
}: GosafeNavbarProps) => {
  const theme = useTheme();
  const intl = useIntl();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 20 });
  const contentIsDark = isDark;

  const navLinks = [
    { label: intl.formatMessage({ id: 'gosafe-nav-solutions', defaultMessage: 'Giải pháp' }), href: '#solutions', view: 'landing' as const },
    { label: intl.formatMessage({ id: 'gosafe-nav-product', defaultMessage: 'Sản phẩm' }), href: '#products', view: 'landing' as const },
    { label: intl.formatMessage({ id: 'gosafe-nav-specs', defaultMessage: 'Thông số' }), href: '#specifications', view: 'landing' as const },
    { label: intl.formatMessage({ id: 'gosafe-nav-tracking', defaultMessage: 'Tracking' }), href: '#tracking', view: 'tracking' as const },
    { label: intl.formatMessage({ id: 'gosafe-nav-contact', defaultMessage: 'Liên hệ' }), href: '#contact', view: 'landing' as const }
  ];

  const handleScrollTo = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      const headerOffset = 80;
      const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const handleLinkClick = (link: (typeof navLinks)[0]) => {
    if (link.view === 'tracking') {
      onViewChange('tracking');
    } else {
      if ((activeView as string) === 'tracking') {
        onViewChange('landing');
        setTimeout(() => handleScrollTo(link.href), 150);
      } else {
        handleScrollTo(link.href);
      }
    }
  };

  const iconBtnSx = {
    color: contentIsDark ? '#94a3b8' : '#64748b',
    transition: 'all 0.3s',
    '&:hover': { color: primaryColor, bgcolor: alpha(primaryColor, 0.1) }
  };

  return (
    <AppBar
      position={activeView === 'tracking' ? 'static' : 'fixed'}
      elevation={0}
      className="gs-navbar"
      sx={{
        bgcolor:
          activeView === 'tracking'
            ? isDark ? '#090d1f' : '#ffffff'
            : trigger
              ? isDark ? alpha('#020617', 0.8) : alpha('#ffffff', 0.8)
              : 'transparent',
        backdropFilter: activeView === 'tracking' ? 'none' : trigger ? 'blur(20px)' : 'none',
        borderBottom: '1px solid',
        borderColor:
          activeView === 'tracking'
            ? isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
            : trigger
              ? isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)
              : 'transparent',
        py: activeView === 'tracking' ? 1 : trigger ? 1 : 2
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>

          {/* Logo */}
          <Stack direction="row" alignItems="center">
            <Link component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={settings.logoDefault}
                alt="Logo"
                className="gs-logo"
                style={{
                  width: isMobile ? 120 : 160,
                  filter: contentIsDark ? 'brightness(0) invert(1)' : 'none'
                }}
              />
            </Link>
            {activeView === 'tracking' && (
              <Typography
                variant="subtitle1"
                sx={{
                  display: { xs: 'none', lg: 'block' },
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  color: primaryColor,
                  textTransform: 'uppercase',
                  ml: 2,
                  pl: 2,
                  borderLeft: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                }}
              >
                Hệ thống giám sát hành trình GoSafe
              </Typography>
            )}
          </Stack>

          {/* Desktop nav pill */}
          {activeView !== 'tracking' && (
            <Stack
              direction="row"
              spacing={0.5}
              className="gs-nav-pill"
              sx={{
                display: { xs: 'none', md: 'flex' },
                bgcolor: contentIsDark ? alpha('#fff', 0.08) : alpha('#000', 0.04),
                p: 0.75,
                border: `1px solid ${contentIsDark ? alpha('#fff', 0.08) : alpha('#000', 0.05)}`,
                boxShadow: trigger ? `0 8px 32px ${alpha('#000', 0.05)}` : 'none'
              }}
            >
              {navLinks.map((link) => {
                const isSelected =
                  link.view === 'tracking'
                    ? (activeView as string) === 'tracking'
                    : (activeView as string) === 'landing' && window.location.hash === link.href;
                return (
                  <Button
                    key={link.label}
                    onClick={() => handleLinkClick(link)}
                    className="gs-nav-btn"
                    sx={{
                      color: isSelected ? primaryColor : contentIsDark ? alpha('#fff', 0.8) : alpha('#0f172a', 0.8),
                      bgcolor: isSelected
                        ? contentIsDark ? alpha('#fff', 0.1) : alpha(primaryColor, 0.1)
                        : 'transparent',
                      px: 2.5,
                      py: 1,
                      '&:hover': {
                        color: contentIsDark ? '#fff' : '#000',
                        bgcolor: contentIsDark ? alpha('#fff', 0.15) : alpha('#fff', 0.8)
                      }
                    }}
                  >
                    {link.label}
                  </Button>
                );
              })}
            </Stack>
          )}

          {/* Actions */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Stack direction="row" spacing={1} sx={{ p: 0.5, borderRadius: 100 }}>
              {activeView !== 'tracking' && (
                <IconButton onClick={onToggleLanguage} size="small" sx={iconBtnSx}>
                  <Translate size={20} />
                </IconButton>
              )}
              <IconButton onClick={onToggleTheme} size="small" sx={iconBtnSx}>
                {isDark ? <Sun1 size={20} /> : <Moon size={20} />}
              </IconButton>
            </Stack>

            {activeView === 'tracking' ? (
              <Button
                variant="outlined"
                onClick={() => onViewChange('landing')}
                className="gs-btn-pill"
                sx={{
                  px: 3, py: 1,
                  borderColor: primaryColor,
                  color: primaryColor,
                  '&:hover': {
                    bgcolor: alpha(primaryColor, 0.1),
                    borderColor: secondaryColor
                  }
                }}
              >
                Quay lại
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  endIcon={<ArrowRight2 size={16} />}
                  onClick={() => navigate('/login')}
                  className="gs-btn-pill"
                  sx={{
                    display: { xs: 'none', md: 'flex' },
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                    color: '#fff',
                    px: 3, py: 1.2,
                    boxShadow: `0 8px 20px -6px ${alpha(primaryColor, 0.5)}`,
                    '&:hover': {
                      boxShadow: `0 12px 25px -8px ${alpha(primaryColor, 0.6)}`
                    }
                  }}
                >
                  <FormattedMessage id="gosafe-nav-login" defaultMessage="Đăng nhập" />
                </Button>

                <IconButton
                  sx={{
                    display: { md: 'none' },
                    color: contentIsDark ? '#fff' : '#0f172a',
                    bgcolor: contentIsDark ? alpha('#fff', 0.1) : alpha('#000', 0.05),
                    '&:hover': { bgcolor: contentIsDark ? alpha('#fff', 0.2) : alpha('#000', 0.1) }
                  }}
                  onClick={() => setMobileOpen(true)}
                >
                  <HambergerMenu />
                </IconButton>
              </>
            )}
          </Stack>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: 320,
            bgcolor: isDark ? '#020617' : '#ffffff',
            backgroundImage: 'none',
            borderLeft: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`
          }
        }}
      >
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Drawer header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Link component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={settings.logoDefault}
                alt="Logo"
                className="gs-drawer-logo"
                style={{ filter: isDark ? 'brightness(0) invert(1)' : 'none' }}
              />
            </Link>
            <IconButton onClick={() => setMobileOpen(false)} sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
              <HambergerMenu size={24} style={{ transform: 'rotate(90deg)' }} />
            </IconButton>
          </Stack>

          {/* Drawer links */}
          <Stack spacing={2} sx={{ mb: 'auto' }}>
            {navLinks.map((link) => {
              const isSelected = link.view === 'tracking' ? (activeView as string) === 'tracking' : false;
              return (
                <Button
                  key={link.label}
                  onClick={() => { handleLinkClick(link); setMobileOpen(false); }}
                  className="gs-mobile-nav-btn"
                  sx={{
                    color: isSelected ? primaryColor : isDark ? '#f8fafc' : '#0f172a',
                    bgcolor: isSelected
                      ? isDark ? alpha(primaryColor, 0.15) : alpha(primaryColor, 0.05)
                      : 'transparent',
                    '&:hover': {
                      bgcolor: isDark ? alpha(primaryColor, 0.1) : alpha(primaryColor, 0.05),
                      color: primaryColor
                    }
                  }}
                >
                  {link.label}
                </Button>
              );
            })}
          </Stack>

          {/* Drawer footer */}
          <Stack spacing={3}>
            <Stack direction="row" spacing={2}>
              {[
                { onClick: onToggleLanguage, icon: <Translate size={20} />, label: currentLang === 'vi' ? 'Tiếng Việt' : 'English' },
                { onClick: onToggleTheme, icon: isDark ? <Sun1 size={20} /> : <Moon size={20} />, label: isDark ? 'Light Mode' : 'Dark Mode' }
              ].map(({ onClick, icon, label }) => (
                <Button
                  key={label}
                  fullWidth
                  onClick={onClick}
                  startIcon={icon}
                  sx={{
                    borderRadius: 3, py: 1.5,
                    color: isDark ? '#94a3b8' : '#64748b',
                    bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                    border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
                    '&:hover': { color: primaryColor, borderColor: primaryColor, bgcolor: alpha(primaryColor, 0.05) }
                  }}
                >
                  {label}
                </Button>
              ))}
            </Stack>

            <Button
              variant="contained"
              fullWidth
              startIcon={<Login size={20} />}
              onClick={() => navigate('/login')}
              sx={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                color: '#fff',
                borderRadius: 100,
                py: 2,
                fontSize: '1rem',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: `0 8px 20px ${alpha(primaryColor, 0.4)}`,
                '&:hover': {
                  boxShadow: `0 12px 24px ${alpha(primaryColor, 0.5)}`,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <FormattedMessage id="gosafe-nav-login" defaultMessage="Đăng nhập" />
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default GosafeNavbar;
