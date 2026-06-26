import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  alpha,
  useMediaQuery,
  useScrollTrigger,
  useTheme
} from '@mui/material';
import { Global, HambergerMenu, Moon, Sun1 } from 'iconsax-react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import settings from 'settings'; // Đảm bảo import đúng

interface NavigationBarProps {
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
  currentLang: string;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
}

const NavigationBar = ({ isDark, primaryColor, secondaryColor, currentLang, onToggleTheme, onToggleLanguage }: NavigationBarProps) => {
  console.log({ currentLang });
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 20
  });

  const navItems = [
    { labelKey: 'landing.nav.features', defaultLabel: 'Tính năng', href: '#features' },
    { labelKey: 'landing.nav.solutions', defaultLabel: 'Giải pháp', href: '#solutions' },
    { labelKey: 'landing.nav.benefits', defaultLabel: 'Lợi ích', href: '#benefits' },
    { labelKey: 'landing.nav.contact', defaultLabel: 'Liên hệ', href: '#contact' }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // --- HÀM XỬ LÝ SCROLL MƯỢT ---
  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, href: string) => {
    e.preventDefault(); // Chặn hành vi nhảy trang mặc định

    // Xử lý cho href dạng ID (#section-id)
    if (href.startsWith('#')) {
      const sectionId = href.substring(1);
      const element = document.getElementById(sectionId);
      if (element) {
        // Trừ đi chiều cao của header (khoảng 80px) để không bị che mất tiêu đề section
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Đóng mobile menu nếu đang mở
        if (mobileOpen) setMobileOpen(false);
      }
    } else {
      // Nếu là link bình thường thì navigate
      navigate(href);
    }
  };

  // --- STYLES FIX ---
  const headerBg = trigger ? (isDark ? alpha('#020617', 0.8) : alpha('#ffffff', 0.8)) : 'transparent';

  // Giảm độ sáng border dark mode xuống 0.08 để đỡ chói
  const borderColor = isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06);
  const blurEffect = trigger ? 'blur(12px)' : 'none';
  const shadowEffect = trigger ? (isDark ? 'none' : `0 4px 20px ${alpha('#000', 0.05)}`) : 'none';

  // --- MOBILE DRAWER CONTENT ---
  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{
        textAlign: 'center',
        height: '100%',
        bgcolor: isDark ? '#020617' : '#fff',
        p: 2
      }}
    >
      <Box sx={{ py: 2, display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Link component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={settings.logoDefault}
            alt="Logo"
            style={{
              width: isMobile ? 160 : 240,
              objectFit: 'contain',
              filter: isDark ? 'brightness(0) invert(1)' : 'none',
              transition: 'filter 0.3s ease'
            }}
          />
        </Link>
      </Box>
      <Divider sx={{ borderColor: borderColor }} />
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.href}
            component="a"
            href={item.href}
            onClick={(e) => handleScrollToSection(e, item.href)}
            sx={{
              textAlign: 'center',
              py: 2,
              borderRadius: 2,
              '&:hover': { bgcolor: alpha(primaryColor, 0.05), color: primaryColor }
            }}
          >
            <ListItemText
              primary={<FormattedMessage id={item.labelKey} defaultMessage={item.defaultLabel} />}
              primaryTypographyProps={{ fontWeight: 600, fontSize: '1rem' }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => navigate('/login')}
          sx={{
            borderRadius: 2,
            py: 1.5,
            fontWeight: 700,
            borderColor: primaryColor,
            color: primaryColor
          }}
        >
          <FormattedMessage id="landing.nav.login" defaultMessage="Đăng nhập" />
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        component="nav"
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: headerBg,
          backdropFilter: blurEffect,

          // --- FIX BORDER GIẬT ---
          // Luôn có border 1px nhưng màu trong suốt khi chưa scroll
          borderBottom: '1px solid',
          borderColor: trigger ? borderColor : 'transparent',

          boxShadow: shadowEffect,
          transition: 'all 0.3s ease-in-out',
          py: trigger ? 0.5 : 1.5
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* 1. LOGO DESKTOP */}
            <Link component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={settings.logoDefault}
                alt="Logo"
                style={{
                  width: isMobile ? 160 : 240,
                  objectFit: 'contain',
                  filter: isDark ? 'brightness(0) invert(0.8)' : 'none',
                  transition: 'filter 0.3s ease'
                }}
              />
            </Link>

            {/* 2. DESKTOP MENU (CENTER) */}
            {!isMobile && (
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  // Fix border giật cho menu con
                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.03),
                  p: 0.5,
                  borderRadius: '50px',
                  border: '1px solid',
                  borderColor: borderColor // Border này cố định nên không giật
                }}
              >
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleScrollToSection(e, item.href)}
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      px: 2.5,
                      py: 0.8,
                      borderRadius: '50px',
                      transition: 'all 0.2s',
                      '&:hover': {
                        color: theme.palette.text.primary,
                        bgcolor: isDark ? alpha(primaryColor, 0.2) : '#fff',
                        boxShadow: isDark ? 'none' : `0 2px 10px ${alpha('#000', 0.05)}`
                      }
                    }}
                  >
                    <FormattedMessage id={item.labelKey} defaultMessage={item.defaultLabel} />
                  </Button>
                ))}
              </Stack>
            )}

            {/* 3. RIGHT ACTIONS */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              <IconButton
                onClick={onToggleTheme}
                size="small"
                sx={{
                  color: theme.palette.text.primary,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  '&:hover': { color: primaryColor, borderColor: primaryColor, bgcolor: alpha(primaryColor, 0.05) }
                }}
              >
                {isDark ? <Sun1 size={20} variant="Bold" /> : <Moon size={20} variant="Bold" />}
              </IconButton>

              <Button
                onClick={onToggleLanguage}
                size="small"
                startIcon={<Global size={18} />}
                sx={{
                  minWidth: 'auto',
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                  px: 1.5,
                  textTransform: 'uppercase',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: '50px',
                  '&:hover': { color: primaryColor, borderColor: primaryColor, bgcolor: alpha(primaryColor, 0.05) }
                }}
              >
                {currentLang}
              </Button>

              {!isMobile && (
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                  sx={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    color: 'white',
                    px: 3,
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: '50px',
                    boxShadow: `0 4px 14px 0 ${alpha(primaryColor, 0.3)}`,
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: `0 6px 20px 0 ${alpha(primaryColor, 0.4)}`,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <FormattedMessage id="landing.nav.login" defaultMessage="Đăng nhập" />
                </Button>
              )}

              {isMobile && (
                <IconButton onClick={handleDrawerToggle} sx={{ color: theme.palette.text.primary, ml: 1 }}>
                  <HambergerMenu size={26} />
                </IconButton>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 }
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default NavigationBar;
