import { Box, Container, Grid, Stack, Typography, alpha, keyframes, useTheme } from '@mui/material';
import { ChartSquare, Gps, Routing, Shield } from 'iconsax-react';
import { FormattedMessage } from 'react-intl';

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

interface PerformanceMetricsSectionProps {
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const PerformanceMetricsSection = ({ isDark, primaryColor, secondaryColor }: PerformanceMetricsSectionProps) => {
  const theme = useTheme();

  // Style constants
  const dotColor = isDark ? '#333' : '#e5e5e5';
  const cardBg = isDark ? alpha('#1e293b', 0.4) : '#fff';
  const borderColor = isDark ? alpha('#fff', 0.1) : alpha('#000', 0.06);

  // Data metrics
  // Mô tả NĂNG LỰC hệ thống (không phải số liệu benchmark bịa). Tránh các con số
  // không kiểm chứng được (99.9%, <100ms, 50K...) gây "ảo" cho giới thiệu B2G.
  const metrics = [
    {
      labelKey: 'landing.performance.uptime.label',
      labelDefault: 'Giám sát liên tục',
      value: '24/7',
      descKey: 'landing.performance.uptime.desc',
      descDefault: 'Theo dõi không gián đoạn',
      icon: <ChartSquare size={28} variant="Bulk" />,
      color: '#22c55e' // Green
    },
    {
      labelKey: 'landing.performance.alert.label',
      labelDefault: 'Cảnh báo vi phạm',
      value: 'Tức thì',
      descKey: 'landing.performance.alert.desc',
      descDefault: 'Phát hiện & báo động ngay',
      icon: <Shield size={28} variant="Bulk" />,
      color: primaryColor
    },
    {
      labelKey: 'landing.performance.load.label',
      labelDefault: 'Đa công nghệ định vị',
      value: 'GPS·LBS·WiFi',
      descKey: 'landing.performance.load.desc',
      descDefault: 'Chính xác trong & ngoài trời',
      icon: <Gps size={28} variant="Bulk" />,
      color: secondaryColor
    },
    {
      labelKey: 'landing.performance.users.label',
      labelDefault: 'Mở rộng thiết bị',
      value: 'Không giới hạn',
      descKey: 'landing.performance.users.desc',
      descDefault: 'Quy mô lớn, linh hoạt',
      icon: <Routing size={28} variant="Bulk" />,
      color: '#eab308' // Yellow
    }
  ];

  return (
    <Box
      id="performance"
      sx={{
        py: { xs: 10, md: 16 },
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
        bgcolor: isDark ? 'transparent' : alpha(secondaryColor, 0.02)
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={8} alignItems="center">
          {/* --- Header --- */}
          <Stack spacing={3} alignItems="center" textAlign="center" sx={{ maxWidth: 700 }}>
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
              <Typography variant="caption" sx={{ fontWeight: 700, color: primaryColor, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                <FormattedMessage id="landing.performance.badge" defaultMessage="HIỆU NĂNG HỆ THỐNG" />
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
              <FormattedMessage id="landing.performance.title" defaultMessage="Nhanh, Mạnh & Ổn định" />
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: '1.1rem' }}>
              <FormattedMessage
                id="landing.performance.subtitle"
                defaultMessage="Hạ tầng được tối ưu hóa để xử lý hàng triệu kết nối mỗi ngày với độ trễ thấp nhất."
              />
            </Typography>
          </Stack>

          {/* --- Metrics Grid --- */}
          <Grid container spacing={3}>
            {metrics.map((item, index) => (
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
                    p: 4,
                    height: '100%',
                    borderRadius: 4,
                    bgcolor: cardBg,
                    backdropFilter: 'blur(12px)',
                    border: `1px solid ${borderColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    animation: `${float} ${4 + index}s ease-in-out infinite`, // Staggered float

                    // Hover Effect
                    '&:hover': {
                      borderColor: item.color,
                      transform: 'translateY(-5px)',
                      boxShadow: `0 15px 30px -10px ${alpha(item.color, 0.2)}`
                    },

                    // Top Gradient Line
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, transparent, ${item.color}, transparent)`,
                      opacity: 0.7
                    }
                  }}
                >
                  {/* Icon Circle */}
                  <Box
                    sx={{
                      mb: 3,
                      p: 1.5,
                      borderRadius: '50%',
                      bgcolor: alpha(item.color, 0.1),
                      color: item.color
                    }}
                  >
                    {item.icon}
                  </Box>

                  {/* Metric Value */}
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 1, fontSize: { xs: '2.5rem', md: '3rem' } }}
                  >
                    {item.value}
                  </Typography>

                  {/* Label & Desc */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: item.color, mb: 0.5 }}>
                    <FormattedMessage id={item.labelKey} defaultMessage={item.labelDefault} />
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
                    <FormattedMessage id={item.descKey} defaultMessage={item.descDefault} />
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

export default PerformanceMetricsSection;
