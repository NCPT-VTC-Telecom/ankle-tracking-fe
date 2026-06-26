import { Box, Container, Grid, Stack, Typography, alpha, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Feature {
  icon: React.ReactNode;
  titleKey: string;
  descKey: string;
  defaultTitle: string;
  defaultDesc: string;
}

interface FeaturesSectionProps {
  features: Feature[];
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const FeaturesSection = ({ features, isDark, primaryColor, secondaryColor }: FeaturesSectionProps) => {
  const theme = useTheme();

  // Màu nền card và border tùy theo theme
  const cardBg = isDark ? alpha('#1e293b', 0.4) : '#fff';
  const borderColor = isDark ? alpha('#fff', 0.1) : alpha('#000', 0.06);
  const dotColor = isDark ? '#333' : '#e5e5e5';

  return (
    <Box
      id="features"
      sx={{
        py: { xs: 10, md: 16 },
        position: 'relative',
        overflow: 'hidden',
        // Tạo background pattern chấm bi hiện đại
        backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
        backgroundSize: '32px 32px'
      }}
    >
      {/* Hiệu ứng ánh sáng nền (Ambient Light) */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '80%',
          background: `radial-gradient(circle, ${alpha(primaryColor, 0.08)} 0%, transparent 70%)`,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <Stack spacing={3} sx={{ mb: 10, textAlign: 'center', alignItems: 'center' }}>
          <Box
            sx={{
              display: 'inline-block',
              px: 2,
              py: 0.5,
              borderRadius: '20px',
              border: `1px solid ${alpha(primaryColor, 0.3)}`,
              bgcolor: alpha(primaryColor, 0.05)
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: primaryColor, letterSpacing: 1, textTransform: 'uppercase' }}>
              <FormattedMessage id="landing.features.badge" defaultMessage="Core Features" />
            </Typography>
          </Box>

          <Typography
            component="h2"
            variant="h2"
            sx={{
              fontSize: { xs: '2.2rem', md: '3.5rem' },
              fontWeight: 800,
              lineHeight: 1.2,
              // Gradient text
              background: isDark
                ? `linear-gradient(135deg, #fff 30%, ${alpha('#fff', 0.6)} 100%)`
                : `linear-gradient(135deg, ${theme.palette.text.primary} 30%, ${alpha(theme.palette.text.primary, 0.6)} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            <FormattedMessage id="landing.features.title" defaultMessage="Tính năng nổi bật" />
          </Typography>

          <Typography
            sx={{
              color: theme.palette.text.secondary,
              fontSize: { xs: '1rem', md: '1.15rem' },
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            <FormattedMessage
              id="landing.features.subtitle"
              defaultMessage="Hệ thống quản lý WiFi toàn diện với đầy đủ tính năng cho doanh nghiệp"
            />
          </Typography>
        </Stack>

        {/* Features Grid */}
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box
                sx={{
                  height: '100%',
                  p: 4,
                  borderRadius: 4,
                  bgcolor: cardBg,
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${borderColor}`,
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  position: 'relative',
                  overflow: 'hidden',

                  // Hover effect
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: alpha(primaryColor, 0.5),
                    boxShadow: `0 20px 40px -10px ${alpha(primaryColor, 0.15)}`,
                    '& .icon-box': {
                      bgcolor: primaryColor,
                      color: '#fff',
                      transform: 'scale(1.1)',
                      boxShadow: `0 10px 20px ${alpha(primaryColor, 0.3)}`
                    }
                  }
                }}
              >
                {/* Icon Box - Soft UI Style */}
                <Box
                  className="icon-box"
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '18px',
                    // Nền nhạt, icon đậm (Soft UI)
                    bgcolor: isDark ? alpha(primaryColor, 0.15) : alpha(primaryColor, 0.08),
                    color: primaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    fontSize: '28px', // Kích thước icon
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {feature.icon}
                </Box>

                <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 700, mb: 1.5, color: theme.palette.text.primary }}>
                  <FormattedMessage id={feature.titleKey} defaultMessage={feature.defaultTitle} />
                </Typography>

                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.7, fontSize: '0.95rem' }}>
                  <FormattedMessage id={feature.descKey} defaultMessage={feature.defaultDesc} />
                </Typography>

                {/* Decor góc phải dưới (Optional) */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    background: `radial-gradient(circle, ${alpha(secondaryColor, 0.1)} 0%, transparent 70%)`,
                    borderRadius: '50%',
                    pointerEvents: 'none'
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturesSection;
