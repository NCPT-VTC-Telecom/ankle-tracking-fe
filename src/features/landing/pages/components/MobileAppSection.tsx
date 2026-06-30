import { Box, Button, Container, Grid, Stack, Typography, alpha, keyframes, useTheme } from '@mui/material';
import { ArrowRight, ChartSquare, Location, Map, Mobile, Notification } from 'iconsax-react';
import { FormattedMessage } from 'react-intl';

// Ảnh GoSafe thật (màn hình giám sát) hiển thị trong khung điện thoại.
const appScreenImage = '/images/Live-Monitoring---Offender-Tracking-System.png';

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
    { icon: <Location variant="Bold" />, titleKey: 'landing.mobileapp.features.indoor.title', titleDefault: 'Định vị thời gian thực', descKey: 'landing.mobileapp.features.indoor.desc', descDefault: 'Chính xác tới từng mét' },
    { icon: <Notification variant="Bold" />, titleKey: 'landing.mobileapp.features.wifi.title', titleDefault: 'Cảnh báo tức thì', descKey: 'landing.mobileapp.features.wifi.desc', descDefault: 'Nhận thông báo vi phạm' },
    { icon: <ChartSquare variant="Bold" />, titleKey: 'landing.mobileapp.features.analytics.title', titleDefault: 'Báo cáo nhanh', descKey: 'landing.mobileapp.features.analytics.desc', descDefault: 'Thống kê trực quan' },
    { icon: <Map variant="Bold" />, titleKey: 'landing.mobileapp.features.map.title', titleDefault: 'Bản đồ đối tượng', descKey: 'landing.mobileapp.features.map.desc', descDefault: 'Hiển thị vị trí đối tượng trực quan' }
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
                    defaultMessage="Ứng dụng GoSafe dành cho cán bộ giám sát: theo dõi vị trí đối tượng, nhận cảnh báo vi phạm tức thì và tra cứu hồ sơ ngay trên điện thoại, mọi lúc mọi nơi."
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
                {/* Left: Text Call to Action — ứng dụng cấp theo đơn vị (B2G), không phát hành công khai */}
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: theme.palette.text.primary, lineHeight: 1.2 }}>
                    <FormattedMessage id="landing.mobileapp.download" defaultMessage="Ứng dụng cán bộ GoSafe" />
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mt: 0.5 }}>
                    <FormattedMessage id="landing.mobileapp.available" defaultMessage="Cấp tài khoản theo đơn vị triển khai" />
                  </Typography>
                </Box>

                {/* Right: Liên hệ để được cấp ứng dụng */}
                <Button
                  href="#contact"
                  variant="contained"
                  endIcon={<ArrowRight size={18} />}
                  sx={{
                    flexShrink: 0,
                    px: 3,
                    py: 1.25,
                    borderRadius: '12px',
                    fontWeight: 700,
                    textTransform: 'none',
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                    boxShadow: `0 8px 20px ${alpha(primaryColor, 0.3)}`
                  }}
                >
                  <FormattedMessage id="landing.contact.title" defaultMessage="Liên hệ tư vấn" />
                </Button>
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
                alt="Ứng dụng GoSafe - màn hình giám sát đối tượng"
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

            {/* Floating Stat Card (Bottom Left) — chỉ báo trạng thái trực tuyến, không số liệu bịa */}
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
                animation: `${floatReverse} 7s ease-in-out infinite`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <Box sx={{ p: 1, borderRadius: '12px', bgcolor: alpha(primaryColor, 0.1), color: primaryColor }}>
                <Location size={20} variant="Bold" />
              </Box>
              <Box>
                <Typography variant="caption" display="block" lineHeight={1} color="text.secondary">
                  <FormattedMessage id="landing.mobileapp.features.indoor.title" defaultMessage="Định vị thời gian thực" />
                </Typography>
                <Typography variant="subtitle2" fontWeight={700}>
                  <FormattedMessage id="landing.mobileapp.stat.online" defaultMessage="Trực tuyến" />
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
