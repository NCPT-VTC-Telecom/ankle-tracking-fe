import { Box, Container, Grid, Stack, Typography, alpha, useTheme } from '@mui/material';
import { Lock, Shield } from 'iconsax-react';
import { FormattedMessage } from 'react-intl';
import { certificationsList } from '../data';

interface SecurityCertificationsSectionProps {
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const SecurityCertificationsSection = ({ isDark, primaryColor, secondaryColor }: SecurityCertificationsSectionProps) => {
  const theme = useTheme();

  // Style constants
  const dotColor = isDark ? '#333' : '#e5e5e5';
  const cardBg = isDark ? alpha('#1e293b', 0.6) : '#fff';
  const borderColor = isDark ? alpha('#fff', 0.1) : alpha('#000', 0.06);

  return (
    <Box
      id="security"
      sx={{
        py: { xs: 10, md: 16 },
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
        bgcolor: isDark ? 'transparent' : alpha(primaryColor, 0.02)
      }}
    >
      {/* Background Shield Decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.03,
          color: primaryColor,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      >
        <Shield size={600} variant="Bold" />
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={8} alignItems="center">
          {/* --- Header --- */}
          <Stack spacing={2} alignItems="center" textAlign="center" sx={{ maxWidth: 700 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.5,
                borderRadius: '20px',
                border: `1px solid ${alpha(primaryColor, 0.3)}`,
                bgcolor: alpha(primaryColor, 0.05)
              }}
            >
              <Lock size={14} variant="Bold" color={primaryColor} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: primaryColor, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                ENTERPRISE SECURITY
              </Typography>
            </Box>
            <Typography
              component="h2"
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3.5rem' },
                fontWeight: 800,
                color: theme.palette.text.primary
              }}
            >
              <FormattedMessage id="landing.security.title" defaultMessage="Bảo mật tiêu chuẩn quốc tế" />
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: '1.1rem' }}>
              <FormattedMessage
                id="landing.security.subtitle"
                defaultMessage="Chúng tôi đặt sự an toàn dữ liệu của bạn lên hàng đầu với các lớp bảo mật đa tầng."
              />
            </Typography>
          </Stack>

          {/* --- Stats Row (Big Numbers) --- */}
          <Grid container spacing={3} justifyContent="center">
            {[
              { value: '99.9%', label: 'Uptime Guarantee', color: primaryColor },
              { value: '256-bit', label: 'AES Encryption', color: secondaryColor },
              { value: '24/7', label: 'Threat Monitoring', color: primaryColor }
            ].map((stat, i) => (
              <Grid
                item
                xs={12}
                sm={4}
                key={i}
                sx={{
                  px: { xs: 3, md: 0 }
                }}
              >
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    borderRight: { xs: 'none', sm: i !== 2 ? `1px dashed ${borderColor}` : 'none' },
                    borderBottom: { xs: i !== 2 ? `1px dashed ${borderColor}` : 'none', sm: 'none' }
                  }}
                >
                  <Typography variant="h3" fontWeight={800} sx={{ color: stat.color, mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* --- Certification Cards Grid --- */}
          <Grid container spacing={3} justifyContent="center">
            {certificationsList.map((cert, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={3}
                key={index}
                sx={{
                  px: { xs: 3, md: 0 }
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    p: 3,
                    bgcolor: cardBg,
                    borderRadius: 3,
                    border: `1px solid ${borderColor}`,
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'default',
                    '&:hover': {
                      borderColor: primaryColor,
                      transform: 'translateY(-5px)',
                      boxShadow: `0 10px 30px -10px ${alpha(primaryColor, 0.15)}`
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(primaryColor, 0.1),
                      borderRadius: '16px',
                      color: primaryColor,
                      fontSize: '28px',
                      mb: 2
                    }}
                  >
                    {cert.icon}
                  </Box>
                  <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 0.5 }}>
                    {cert.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    <FormattedMessage id={cert.descKey} defaultMessage={cert.descDefault} />
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
};

export default SecurityCertificationsSection;
