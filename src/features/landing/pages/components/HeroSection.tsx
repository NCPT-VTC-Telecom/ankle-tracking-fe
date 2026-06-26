import { Box, Button, Container, Stack, Typography, alpha, keyframes } from '@mui/material';
import dashboardImage from 'assets/images/dashboard.png';
import dashboardImageDark from 'assets/images/dashboard-dark.png';
import { ArrowRight, Chart, Clock, ShieldSecurity, TickCircle, Wifi } from 'iconsax-react';
import { FormattedMessage } from 'react-intl';

// Props
interface HeroSectionProps {
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const floatImage = keyframes`
  0%, 100% { transform: rotateX(20deg) translateY(0); }
  50% { transform: rotateX(20deg) translateY(-15px); }
`;

const glowPulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.2); }
`;

const HeroSection = ({ isDark, primaryColor, secondaryColor }: HeroSectionProps) => {
  const textColor = isDark ? '#fff' : '#000';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';

  const features = [
    {
      icon: <TickCircle size="20" variant="Bold" />,
      text: <FormattedMessage id="landing.hero.stats.enterprises" defaultMessage="50+ Doanh nghiệp" />
    },
    { icon: <Wifi size="20" variant="Bold" />, text: <FormattedMessage id="landing.hero.stats.aps" defaultMessage="5,000+ APs" /> },
    {
      icon: <Clock size="20" variant="Bold" />,
      text: <FormattedMessage id="landing.hero.stats.deployment" defaultMessage="Triển khai 48h" />
    },
    { icon: <ShieldSecurity size="20" variant="Bold" />, text: <FormattedMessage id="landing.hero.stats.iso" defaultMessage="ISO 27001" /> },
    {
      icon: <Chart size="20" variant="Bold" />,
      text: <FormattedMessage id="landing.hero.stats.reports" defaultMessage="Báo cáo Realtime" />
    }
  ];

  return (
    <Box
      sx={{
        pt: { xs: 14, md: 18 },
        pb: { xs: 6, md: 10 },
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(to right, ${gridColor} 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)'
      }}
    >
      {/* ---------------- AMBIENT GLOW BACKGROUND ---------------- */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70vw',
          height: '60vh',
          background: `radial-gradient(circle, ${alpha(primaryColor, 0.35)} 0%, transparent 70%)`,
          filter: 'blur(100px)',
          zIndex: 0,
          animation: `${glowPulse} 8s ease-in-out infinite`
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
        {/* ---------------- CENTERED CONTENT ---------------- */}
        <Stack alignItems="center" textAlign="center" spacing={4}>
          {/* Main Title */}
          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2.5rem', sm: '3.8rem', md: '5rem' },
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              background: `linear-gradient(135deg, ${textColor} 30%, ${alpha(textColor, 0.6)} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              maxWidth: '900px'
            }}
          >
            <FormattedMessage id="landing.hero.title" defaultMessage="WiFi Digital Platform" />
          </Typography>

          {/* Description */}
          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              fontWeight: 400,
              maxWidth: '750px',
              lineHeight: 1.6
            }}
          >
            <FormattedMessage
              id="landing.hero.description"
              defaultMessage="Hệ thống WiFi Digital cho doanh nghiệp: quản lý 5,000+ thiết bị, theo dõi người dùng real-time, tăng 300% hiệu quả marketing, tối ưu chi phí vận hành."
            />
          </Typography>

          {/* Buttons - Chỉ còn nút Liên hệ (Được nâng cấp lên style Primary) */}
          <Box sx={{ pt: 2 }}>
            <Button
              variant="contained"
              size="large"
              href="#contact"
              endIcon={<ArrowRight size={20} />}
              sx={{
                px: 6,
                py: 2,
                borderRadius: '50px',
                fontSize: '1.15rem',
                fontWeight: 700,
                textTransform: 'none',
                // Dùng gradient của nút primary cũ để nút Liên hệ nổi bật hơn
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                boxShadow: `0 10px 30px ${alpha(primaryColor, 0.4)}`,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: `0 15px 40px ${alpha(primaryColor, 0.5)}`
                }
              }}
            >
              <FormattedMessage id="landing.hero.cta.contact" defaultMessage="Liên hệ tư vấn" />
            </Button>
          </Box>

          {/* Features Strip */}
          <Box
            sx={{
              p: 1,
              borderRadius: '20px',
              bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.6),
              border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
              backdropFilter: 'blur(12px)',
              boxShadow: `0 8px 32px rgba(0,0,0,0.05)`,
              display: 'inline-block',
              margin: '32px 0px !important',
              width: { xs: '90%', md: 'auto' }
            }}
          >
            <Stack
              direction="row"
              flexWrap="wrap"
              justifyContent="center"
              gap={{ xs: 2, md: 4 }} // Gap thay cho spacing để hỗ trợ wrap tốt hơn
              alignItems="center"
              sx={{ px: { xs: 2, md: 3 }, py: 1 }}
            >
              {features.map((item, i) => (
                <Stack key={i} direction="row" spacing={1} alignItems="center">
                  <Box sx={{ color: secondaryColor }}>{item.icon}</Box>
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    {item.text}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Stack>

        {/* ---------------- 3D DASHBOARD IMAGE VISUAL ---------------- */}
        <Box
          sx={{
            position: 'relative',
            maxWidth: '1100px',
            margin: '0 auto',
            perspective: '1200px',
            zIndex: 1
          }}
        >
          {/* Glow phía sau ảnh */}
          <Box
            sx={{
              position: 'absolute',
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80%',
              height: '100%',
              background: `radial-gradient(ellipse at center, ${alpha(primaryColor, 0.5)} 0%, transparent 70%)`,
              filter: 'blur(80px)',
              zIndex: -1
            }}
          />

          {/* Container ảnh nghiêng */}
          <Box
            sx={{
              transformStyle: 'preserve-3d',
              animation: `${floatImage} 6s ease-in-out infinite`
            }}
          >
            {/* Ảnh chính */}
            <Box
              component="img"
              src={isDark ? dashboardImageDark : dashboardImage}
              alt="Dashboard Preview"
              sx={{
                width: '100%',
                borderRadius: '24px',
                border: `4px solid ${alpha(isDark ? '#fff' : '#000', 0.1)}`,
                boxShadow: `0 50px 100px -20px rgba(0,0,0,0.4)`,
                maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)'
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
