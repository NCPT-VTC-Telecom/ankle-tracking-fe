import { Box, Button, Container, Grid, Stack, Typography, alpha, useTheme } from '@mui/material';
import { ArrowRight, CloseCircle, Crown1, TickCircle } from 'iconsax-react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

interface ComparisonRow {
  featureKey: string;
  featureDefault: string;
  traditionalKey: string;
  traditionalDefault: string;
  wifiDigitalKey: string;
  wifiDigitalDefault: string;
  highlight: boolean;
}

interface ComparisonTableSectionProps {
  comparisonData: ComparisonRow[];
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const ComparisonTableSection = ({ comparisonData, isDark, primaryColor, secondaryColor }: ComparisonTableSectionProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Màu sắc
  const borderColor = isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08);
  const rowHoverColor = isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02);
  const highlightColumnBg = isDark ? alpha(primaryColor, 0.1) : alpha(primaryColor, 0.04);
  const dotColor = isDark ? '#333' : '#e5e5e5'; // Màu chấm bi

  return (
    <Box
      id="comparison"
      sx={{
        py: { xs: 10, md: 16 },
        position: 'relative',
        overflow: 'hidden',
        // --- THÊM BACKGROUND HỘT HỘT ---
        backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
        bgcolor: isDark ? 'transparent' : alpha(secondaryColor, 0.02)
      }}
    >
      {/* --- THÊM AMBIENT LIGHT (Ánh sáng nền mờ) --- */}
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
        {/* --- Header --- */}
        <Stack spacing={3} alignItems="center" textAlign="center" sx={{ mb: 8 }}>
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
              <FormattedMessage id="landing.comparison.badge" defaultMessage="COMPARISON" />
            </Typography>
          </Box>

          <Typography
            component="h2"
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 800,
              // Gradient text title
              background: isDark
                ? `linear-gradient(135deg, #fff 30%, ${alpha('#fff', 0.6)} 100%)`
                : `linear-gradient(135deg, ${theme.palette.text.primary} 30%, ${alpha(theme.palette.text.primary, 0.6)} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            <FormattedMessage id="landing.comparison.title" defaultMessage="Tại sao chọn WiFi Digital?" />
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: '1.1rem', maxWidth: 700 }}>
            <FormattedMessage id="landing.comparison.subtitle" defaultMessage="Xem sự khác biệt rõ rệt về hiệu năng và quản trị." />
          </Typography>
        </Stack>

        {/* --- TABLE CONTAINER (SCROLLABLE) --- */}
        <Box
          sx={{
            position: 'relative',
            borderRadius: 4,
            border: `1px solid ${borderColor}`,
            bgcolor: isDark ? alpha('#1e293b', 0.6) : '#fff',
            backdropFilter: 'blur(12px)',
            overflow: 'hidden', // Để bo góc hoạt động
            boxShadow: isDark ? 'none' : `0 20px 40px -10px ${alpha('#000', 0.05)}`,

            // Scrollbar đẹp
            '& ::-webkit-scrollbar': { height: 6 },
            '& ::-webkit-scrollbar-track': { background: 'transparent' },
            '& ::-webkit-scrollbar-thumb': {
              background: alpha(primaryColor, 0.2),
              borderRadius: 3,
              '&:hover': { background: alpha(primaryColor, 0.4) }
            }
          }}
        >
          {/* Background Highlight Cột Phải (Cố định vị trí absolute) */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: '35%',
              bgcolor: highlightColumnBg,
              zIndex: 0,
              borderLeft: `1px solid ${alpha(primaryColor, 0.1)}`,
              display: { xs: 'none', md: 'block' }
            }}
          />

          {/* Vùng cuộn ngang */}
          <Box sx={{ overflowX: 'auto', width: '100%' }}>
            {/* MinWidth ép bảng rộng ra để kích hoạt scroll trên mobile */}
            <Box sx={{ minWidth: 900, position: 'relative', zIndex: 1 }}>
              {/* --- TABLE HEADER --- */}
              <Grid container sx={{ borderBottom: `1px solid ${borderColor}` }}>
                {/* Cột 1 */}
                <Grid item xs={4} sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, fontWeight: 700, textTransform: 'uppercase' }}>
                    <FormattedMessage id="landing.comparison.header.criteria" defaultMessage="Tiêu chí" />
                  </Typography>
                </Grid>
                {/* Cột 2 */}
                <Grid item xs={4} sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                    <FormattedMessage id="landing.comparison.header.traditional" defaultMessage="WiFi Truyền thống" />
                  </Typography>
                </Grid>
                {/* Cột 3 */}
                <Grid item xs={4} sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Crown1 size={20} variant="Bold" color={primaryColor} />
                    <Typography variant="subtitle1" sx={{ color: primaryColor, fontWeight: 800 }}>
                      <FormattedMessage id="landing.comparison.header.digital" defaultMessage="WiFi Digital" />
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>

              {/* --- TABLE BODY --- */}
              {comparisonData.map((row, index) => (
                <Grid
                  container
                  key={index}
                  sx={{
                    borderBottom: index !== comparisonData.length - 1 ? `1px solid ${borderColor}` : 'none',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: rowHoverColor }
                  }}
                >
                  {/* Cột 1: Feature (Căn trái) */}
                  <Grid item xs={4} sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" fontWeight={600} color="text.primary">
                      <FormattedMessage id={row.featureKey} defaultMessage={row.featureDefault} />
                    </Typography>
                  </Grid>

                  {/* Cột 2: Traditional (Căn trái + Icon) */}
                  <Grid item xs={4} sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ opacity: 0.7 }}>
                      <Box sx={{ mt: 0.5 }}>
                        <CloseCircle size={20} variant="Bold" color={theme.palette.text.disabled} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ lineHeight: 1.6 }}>
                        <FormattedMessage id={row.traditionalKey} defaultMessage={row.traditionalDefault} />
                      </Typography>
                    </Stack>
                  </Grid>

                  {/* Cột 3: Digital (Căn trái + Icon) */}
                  <Grid item xs={4} sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box sx={{ mt: 0.5 }}>
                        <TickCircle size={22} variant="Bold" color={primaryColor} />
                      </Box>
                      <Typography variant="body1" color="text.primary" fontWeight={700} sx={{ lineHeight: 1.6 }}>
                        <FormattedMessage id={row.wifiDigitalKey} defaultMessage={row.wifiDigitalDefault} />
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Mobile Scroll Hint */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mt: 2, opacity: 0.6 }}>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ArrowRight size={14} /> <FormattedMessage id="landing.comparison.scroll.hint" defaultMessage="Vuốt sang để xem chi tiết" />
          </Typography>
        </Box>
        {/* --- Bottom CTA --- */}
        <Box sx={{ textAlign: 'center', mt: 10 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            <FormattedMessage id="landing.comparison.cta.question" defaultMessage="Sẵn sàng để chuyển đổi hệ thống mạng của bạn?" />
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            endIcon={<ArrowRight />}
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '50px',
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              boxShadow: `0 10px 30px ${alpha(primaryColor, 0.4)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: `0 15px 40px ${alpha(primaryColor, 0.5)}`
              }
            }}
          >
            <FormattedMessage id="landing.comparison.cta" defaultMessage="Bắt đầu miễn phí ngay" />
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ComparisonTableSection;
