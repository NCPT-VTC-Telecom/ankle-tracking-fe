import { Box, Container, Grid, Stack, Typography, alpha, keyframes, useTheme } from '@mui/material';
import AppStoreBadge from 'assets/icons/app_store_badge.svg?react';
import GooglePlayBadge from 'assets/icons/google_play_badge.svg?react';
import appScreenImage from 'assets/images/app-screen.png';
import { ChartSquare, Location, Map, Mobile, Wifi } from 'iconsax-react';
import { FormattedMessage } from 'react-intl';

// --- Animations ---
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`;

const floatReverse = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(10px); }
`;

// const pulseGlow = keyframes`
//   0%, 100% { box-shadow: 0 0 0 0px rgba(var(--primary-rgb), 0.2); }
//   50% { box-shadow: 0 0 0 20px rgba(var(--primary-rgb), 0); }
// `;

interface MobileAppSectionProps {
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const MobileAppSection = ({ isDark, primaryColor, secondaryColor }: MobileAppSectionProps) => {
  const theme = useTheme();

  // Constants style
  const dotColor = isDark ? '#333' : '#e5e5e5';
  const cardBg = isDark ? alpha('#1e293b', 0.6) : '#fff';
  const borderColor = isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08);

  const features = [
    { icon: <Location variant="Bold" />, titleKey: 'landing.mobileapp.features.indoor.title', titleDefault: 'Định vị Indoor', descKey: 'landing.mobileapp.features.indoor.desc', descDefault: 'Chính xác tới từng mét' },
    { icon: <Wifi variant="Bold" />, titleKey: 'landing.mobileapp.features.wifi.title', titleDefault: 'Quản lý WiFi', descKey: 'landing.mobileapp.features.wifi.desc', descDefault: 'Cấu hình từ xa' },
    { icon: <ChartSquare variant="Bold" />, titleKey: 'landing.mobileapp.features.analytics.title', titleDefault: 'Real-time Analytics', descKey: 'landing.mobileapp.features.analytics.desc', descDefault: 'Báo cáo trực quan' },
    { icon: <Map variant="Bold" />, titleKey: 'landing.mobileapp.features.map.title', titleDefault: 'Bản đồ thiết bị', descKey: 'landing.mobileapp.features.map.desc', descDefault: 'Hiển thị vị trí AP & client trực quan' }
  ];

  return (
    <Box
      id="mobileapp"
      sx={{
        py: { xs: 10, md: 16 },
        position: 'relative',
        overflow: 'hidden',
        // Background Pattern chấm bi đồng bộ
        backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
        // Nền gradient nhẹ
        bgcolor: isDark ? 'transparent' : alpha(secondaryColor, 0.03)
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 8, md: 4 }} alignItems="center">
          {/* --- LEFT CONTENT --- */}
          <Grid item xs={12} md={6}>
            <Stack spacing={4}>
              {/* Header Badge */}
              <Box>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 0.5,
                    borderRadius: '20px',
                    border: `1px solid ${alpha(secondaryColor, 0.3)}`,
                    bgcolor: alpha(secondaryColor, 0.05),
                    mb: 3
                  }}
                >
                  <Mobile size={16} variant="Bold" color={secondaryColor} />
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: secondaryColor, letterSpacing: 1, textTransform: 'uppercase' }}
                  >
                    <FormattedMessage id="landing.mobileapp.badge" defaultMessage="Mobile Experience" />
                  </Typography>
                </Box>

                <Typography
                  component="h2"
                  variant="h2"
                  sx={{
                    fontSize: { xs: '2.2rem', md: '3.5rem' },
                    fontWeight: 800,
                    lineHeight: 1.2,
                    mb: 2,
                    background: isDark
                      ? `linear-gradient(135deg, #fff 30%, ${alpha('#fff', 0.6)} 100%)`
                      : `linear-gradient(135deg, ${theme.palette.text.primary} 30%, ${alpha(theme.palette.text.primary, 0.6)} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  <FormattedMessage id="landing.mobileapp.title" defaultMessage="Quản trị trong tầm tay" />
                </Typography>

                <Typography sx={{ color: theme.palette.text.secondary, fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '90%' }}>
                  <FormattedMessage
                    id="landing.mobileapp.description"
                    defaultMessage="VTC Digital Map mang đến bản đồ số thông minh kết hợp các tiện ích trong sân bay, giúp bạn định vị, giám sát và trải nghiệm mọi thứ một cách trực quan và nhanh chóng."
                  />
                </Typography>
              </Box>

              {/* Feature Grid (Small Cards) */}
              <Grid container spacing={2}>
                {features.map((f, i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 3,
                          bgcolor: isDark ? alpha(secondaryColor, 0.15) : alpha(secondaryColor, 0.08),
                          color: secondaryColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px'
                        }}
                      >
                        {f.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                          <FormattedMessage id={f.titleKey} defaultMessage={f.titleDefault} />
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <FormattedMessage id={f.descKey} defaultMessage={f.descDefault} />
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                ))}
              </Grid>

              {/* Download Section (Horizontal Action Bar) */}
              <Box
                sx={{
                  mt: 4,
                  p: 2.5,
                  pr: 3,
                  borderRadius: 3,
                  bgcolor: isDark ? alpha(primaryColor, 0.05) : alpha(primaryColor, 0.03),
                  border: `1px solid ${borderColor}`,
                  borderLeft: `4px solid ${primaryColor}`, // Điểm nhấn màu
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  gap: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: isDark ? alpha(primaryColor, 0.08) : alpha(primaryColor, 0.06),
                    boxShadow: `0 10px 30px -10px ${alpha(primaryColor, 0.15)}`
                  }
                }}
              >
                {/* Left: Text Call to Action */}
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: theme.palette.text.primary, lineHeight: 1.2 }}>
                    <FormattedMessage id="landing.mobileapp.download" defaultMessage="Tải xuống ngay" />
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mt: 0.5 }}>
                    <FormattedMessage id="landing.mobileapp.available" defaultMessage="Có sẵn trên iOS & Android" />
                  </Typography>
                </Box>

                {/* Right: Store Buttons */}
                <Stack direction="row" spacing={2}>
                  <Box
                    component="a"
                    href="https://apps.apple.com/vn/app/vtc-digital-map/id6748637796"
                    target="_blank"
                    sx={{
                      height: 48,
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.05)' },
                      '&:active': { transform: 'scale(0.95)' }
                    }}
                  >
                    <AppStoreBadge style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </Box>

                  <Box
                    component="a"
                    href="https://play.google.com/store/apps/details?id=com.vtcdigitalmap"
                    target="_blank"
                    sx={{
                      height: 48,
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.05)' },
                      '&:active': { transform: 'scale(0.95)' }
                    }}
                  >
                    <GooglePlayBadge style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Grid>

          {/* --- RIGHT VISUAL (Phone Mockup) --- */}
          <Grid item xs={12} md={6} sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            {/* Ambient Glow behind phone */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 300,
                height: 300,
                background: `radial-gradient(circle, ${alpha(secondaryColor, 0.4)} 0%, transparent 70%)`,
                filter: 'blur(80px)',
                zIndex: 0
              }}
            />

            {/* Phone Frame */}
            <Box
              sx={{
                width: 300,
                height: 615,
                borderRadius: '40px',
                border: `8px solid ${isDark ? '#2c2c2c' : '#111'}`, // Viền máy
                bgcolor: '#000',
                position: 'relative',
                zIndex: 2,
                overflow: 'hidden',
                boxShadow: `0 25px 50px -12px ${alpha(secondaryColor, 0.4)}`,
                animation: `${float} 6s ease-in-out infinite`
              }}
            >
              {/* Notch / Dynamic Island */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 100,
                  height: 24,
                  bgcolor: '#000',
                  borderBottomLeftRadius: 16,
                  borderBottomRightRadius: 16,
                  zIndex: 10
                }}
              />

              {/* Screen Image */}
              <Box
                component="img"
                src={appScreenImage}
                alt="App Screen"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  // Fallback nếu ảnh lỗi
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.style.backgroundColor = isDark ? '#1a1a1a' : '#f0f0f0';
                    target.parentElement.innerHTML += `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color: #999;">App Screen</div>`;
                  }
                }}
              />
            </Box>

            {/* Floating Stat Card 1 (Top Right) */}
            <Box
              sx={{
                position: 'absolute',
                top: '15%',
                right: 0,
                p: 2,
                borderRadius: 3,
                bgcolor: cardBg,
                backdropFilter: 'blur(12px)',
                border: `1px solid ${borderColor}`,
                boxShadow: `0 15px 30px ${alpha('#000', 0.1)}`,
                zIndex: 3,
                animation: `${floatReverse} 7s ease-in-out infinite`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <Box sx={{ p: 1, borderRadius: '50%', bgcolor: '#FFD700', color: '#000' }}>
                <Typography variant="caption" fontWeight={800}>
                  4.9
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" display="block" lineHeight={1} color="text.secondary">
                  <FormattedMessage id="landing.mobileapp.stat.rating" defaultMessage="Rating" />
                </Typography>
                <Typography variant="subtitle2" fontWeight={700}>
                  <FormattedMessage id="landing.mobileapp.stat.excellent" defaultMessage="Excellent" />
                </Typography>
              </Box>
            </Box>

            {/* Floating Stat Card 2 (Bottom Left) */}
            <Box
              sx={{
                position: 'absolute',
                bottom: '20%',
                left: { xs: 60, md: 30 },
                p: 2,
                borderRadius: 3,
                bgcolor: cardBg,
                backdropFilter: 'blur(12px)',
                border: `1px solid ${borderColor}`,
                boxShadow: `0 15px 30px ${alpha('#000', 0.1)}`,
                zIndex: 3,
                animation: `${float} 5s ease-in-out infinite delay-1s`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <Box sx={{ p: 1, borderRadius: '12px', bgcolor: alpha(primaryColor, 0.1), color: primaryColor }}>
                <ChartSquare size={20} variant="Bold" />
              </Box>
              <Box>
                <Typography variant="caption" display="block" lineHeight={1} color="text.secondary">
                  <FormattedMessage id="landing.mobileapp.stat.activeusers" defaultMessage="Active Users" />
                </Typography>
                <Typography variant="subtitle2" fontWeight={700}>
                  50K+
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default MobileAppSection;
