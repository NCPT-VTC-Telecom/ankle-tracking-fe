import { Avatar, AvatarGroup, Box, Container, Grid, Stack, Typography, alpha, keyframes, useTheme } from '@mui/material';
import { Headphone, TickCircle, Wifi } from 'iconsax-react'; // Dùng Headphone cho support
import { FormattedMessage } from 'react-intl';

// --- Animation ---
const floatUp = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

const floatDown = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(10px); }
`;

interface Benefit {
  key: string;
  default: string;
}

interface BenefitsSectionProps {
  benefits: Benefit[];
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const BenefitsSection = ({ benefits, isDark, primaryColor, secondaryColor }: BenefitsSectionProps) => {
  const theme = useTheme();

  // Style constants
  const dotColor = isDark ? '#333' : '#e5e5e5';
  const cardBg = isDark ? alpha('#0f172a', 0.7) : alpha('#fff', 0.7);
  const borderColor = isDark ? alpha('#fff', 0.15) : alpha('#fff', 0.6);

  return (
    <Box
      id="benefits"
      sx={{
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
        bgcolor: isDark ? 'transparent' : alpha(secondaryColor, 0.02)
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
          {/* --- LEFT: Compact Benefits List --- */}
          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: primaryColor, letterSpacing: 1.2, textTransform: 'uppercase', mb: 1, display: 'block' }}
                >
                  <FormattedMessage id="landing.benefits.badge" defaultMessage="WHY CHOOSE US" />
                </Typography>
                <Typography
                  component="h2"
                  variant="h2"
                  sx={{
                    fontSize: { xs: '2rem', md: '3rem' },
                    fontWeight: 800,
                    color: theme.palette.text.primary,
                    mb: 2,
                    lineHeight: 1.1
                  }}
                >
                  <FormattedMessage id="landing.benefits.title" defaultMessage="Giá trị cốt lõi" />
                </Typography>
                <Typography sx={{ color: theme.palette.text.secondary, fontSize: '1.05rem', lineHeight: 1.6 }}>
                  <FormattedMessage
                    id="landing.benefits.subtitle"
                    defaultMessage="Chúng tôi không chỉ cung cấp WiFi. Chúng tôi cung cấp nền tảng để bạn thấu hiểu khách hàng và tối ưu hóa vận hành."
                  />
                </Typography>
              </Box>

              <Stack spacing={1}>
                {benefits.map((benefit, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: isDark ? alpha(primaryColor, 0.1) : alpha(primaryColor, 0.05), transform: 'translateX(5px)' }
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: alpha(primaryColor, 0.15),
                        color: primaryColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <TickCircle size={18} variant="Bold" />
                    </Box>
                    <Typography variant="body1" fontWeight={500} color="text.primary">
                      <FormattedMessage id={benefit.key} defaultMessage={benefit.default} />
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* --- RIGHT: Abstract Glass Layers (Đã cập nhật nội dung) --- */}
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                position: 'relative',
                height: { xs: 400, md: 500 },
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* 1. Glow Background */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '60%',
                  height: '60%',
                  background: `conic-gradient(from 0deg at 50% 50%, ${alpha(primaryColor, 0.4)} 0deg, ${alpha(
                    secondaryColor,
                    0.4
                  )} 180deg, ${alpha(primaryColor, 0.4)} 360deg)`,
                  filter: 'blur(70px)',
                  opacity: 0.6,
                  zIndex: 0,
                  animation: 'spin 10s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                    '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' }
                  }
                }}
              />

              {/* 2. Main Card: 50,000+ Access Points */}
              <Box
                sx={{
                  position: 'relative',
                  width: '80%',
                  height: '60%',
                  bgcolor: cardBg,
                  backdropFilter: 'blur(20px)',
                  borderRadius: 5,
                  border: `1px solid ${borderColor}`,
                  boxShadow: `0 25px 50px -12px ${alpha('#000', 0.2)}`,
                  zIndex: 1,
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  animation: `${floatUp} 6s ease-in-out infinite`
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing={1}>
                      <FormattedMessage id="landing.benefits.stat.managedaps" defaultMessage="MANAGED APs" />
                    </Typography>
                    <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
                      5,000+
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1, bgcolor: alpha(primaryColor, 0.1), color: primaryColor, borderRadius: 3 }}>
                    <Wifi variant="Bold" size={24} />
                  </Box>
                </Stack>

                {/* Chart mô phỏng sự tăng trưởng thiết bị */}
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: '50%', mt: 2 }}>
                  {[30, 45, 35, 60, 50, 80, 70, 90, 85, 100].map((h, i) => (
                    <Box
                      key={i}
                      sx={{
                        flex: 1,
                        height: `${h}%`,
                        borderRadius: 1,
                        background: `linear-gradient(to top, ${alpha(primaryColor, 0.8)}, ${alpha(secondaryColor, 0.8)})`,
                        opacity: 0.8,
                        transition: 'height 0.5s'
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* 3. Floating Element (Top Right): 24/7 Support */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '15%',
                  right: '5%',
                  p: 2,
                  borderRadius: 3,
                  bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(15px)',
                  border: `1px solid ${borderColor}`,
                  boxShadow: `0 15px 35px ${alpha('#000', 0.1)}`,
                  zIndex: 2,
                  animation: `${floatDown} 7s ease-in-out infinite`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5
                }}
              >
                <Box sx={{ p: 1, borderRadius: '50%', bgcolor: '#22c55e', color: '#fff', boxShadow: `0 0 15px ${alpha('#22c55e', 0.5)}` }}>
                  <Headphone size={20} variant="Bold" />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    <FormattedMessage id="landing.benefits.stat.support" defaultMessage="24/7 Support" />
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    <FormattedMessage id="landing.benefits.stat.support.team" defaultMessage="Technical Team" />
                  </Typography>
                </Box>
              </Box>

              {/* 4. Floating Element (Bottom Left): 500+ Clients */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '10%',
                  left: '0%',
                  p: 2,
                  borderRadius: 3,
                  bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(15px)',
                  border: `1px solid ${borderColor}`,
                  boxShadow: `0 15px 35px ${alpha('#000', 0.1)}`,
                  zIndex: 3,
                  animation: `${floatUp} 8s ease-in-out infinite delay-1s`, // Delay để lệch nhịp
                  maxWidth: 220
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={700} mb={1} display="block" letterSpacing={0.5}>
                  <FormattedMessage id="landing.benefits.stat.enterprises" defaultMessage="50+ DOANH NGHIỆP" />
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <AvatarGroup
                    max={3}
                    sx={{
                      '& .MuiAvatar-root': {
                        width: 28,
                        height: 28,
                        fontSize: '0.75rem',
                        border: `2px solid ${isDark ? '#1e293b' : '#fff'}`
                      }
                    }}
                  >
                    <Avatar src="https://i.pravatar.cc/100?img=11" />
                    <Avatar src="https://i.pravatar.cc/100?img=12" />
                    <Avatar src="https://i.pravatar.cc/100?img=13" />
                    <Avatar src="https://i.pravatar.cc/100?img=14" />
                  </AvatarGroup>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" lineHeight={1}>
                      <FormattedMessage id="landing.benefits.stat.trusted" defaultMessage="Tin dùng" />
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default BenefitsSection;
