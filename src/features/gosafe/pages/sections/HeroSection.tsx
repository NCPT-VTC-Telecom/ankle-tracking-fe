import { Box, Button, Container, Grid, Stack, Typography, alpha } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { ArrowRight, Gps, ShieldTick, Global, ShieldSecurity } from 'iconsax-react';
import { motion } from 'framer-motion';
import heroBg from 'assets/images/gosafe-g737-offender-tracker.jpg';

interface HeroSectionProps {
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const HeroSection = ({ isDark, primaryColor, secondaryColor }: HeroSectionProps) => {
  const { formatMessage } = useIntl();

  const stats = [
    { label: formatMessage({ id: 'gosafe-hero-stat-connect', defaultMessage: 'Connectivity' }), value: '4G LTE', icon: <Global size={24} variant="Bold" /> },
    { label: formatMessage({ id: 'gosafe-hero-stat-waterproof', defaultMessage: 'Waterproof' }), value: 'IP67', icon: <ShieldTick size={24} variant="Bold" /> },
    { label: formatMessage({ id: 'gosafe-hero-stat-alert', defaultMessage: 'Alerts' }), value: 'Real-time', icon: <Gps size={24} variant="Bold" /> },
    { label: formatMessage({ id: 'gosafe-hero-stat-strap', defaultMessage: 'Strap' }), value: formatMessage({ id: 'gosafe-hero-stat-strap-value', defaultMessage: 'Anti-cut' }), icon: <ShieldSecurity size={24} variant="Bold" /> }
  ];

  return (
    /* gs-hero sets position:relative, min-height:100vh, display:flex, align-items:center,
       overflow:hidden, background-color:#020617 */
    <Box className="gs-hero" sx={{ pt: { xs: 12, md: 0 } }}>

      {/* Background image — gs-hero__bg: absolute fill, cover, z-index 0 */}
      <Box
        className="gs-hero__bg"
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      {/* Gradient overlay — gs-hero__overlay: absolute fill, z-index 1 */}
      <Box
        className="gs-hero__overlay"
        sx={{ background: `linear-gradient(to right, ${alpha('#020617', 0.9)} 0%, ${alpha('#020617', 0.6)} 40%, transparent 100%)` }}
      />

      {/* Content — gs-hero__content: relative z-index 2 */}
      <Container maxWidth="lg" className="gs-hero__content">
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={8}>
            <Stack
              spacing={4}
              component={motion.div}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Box>
                <Typography
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5.5rem' },
                    fontWeight: 900,
                    lineHeight: 0.9,
                    letterSpacing: '-0.03em',
                    mb: 2,
                    color: '#fff',
                    textShadow: '0 0 40px rgba(0,0,0,0.5)'
                  }}
                >
                  <FormattedMessage id="gosafe-hero-title-1" defaultMessage="G737" />
                  <br />
                  <Box component="span" sx={{ color: primaryColor }}>
                    <FormattedMessage id="gosafe-hero-title-2" defaultMessage="ANKLE" />
                  </Box>{' '}
                  <FormattedMessage id="gosafe-hero-title-3" defaultMessage="BRACELET" />
                </Typography>

                <Typography
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  variant="h4"
                  sx={{
                    fontWeight: 600,
                    color: '#94a3b8',
                    mb: 3,
                    fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.75rem' }
                  }}
                >
                  <FormattedMessage id="gosafe-hero-subtitle-1" defaultMessage="Advanced Prisoner" />{' '}
                  <Box component="span" sx={{ color: primaryColor }}>
                    <FormattedMessage id="gosafe-hero-subtitle-highlight-1" defaultMessage="Monitoring" />
                  </Box>{' '}
                  <FormattedMessage id="gosafe-hero-subtitle-2" defaultMessage="&" />{' '}
                  <Box component="span" sx={{ color: primaryColor }}>
                    <FormattedMessage id="gosafe-hero-subtitle-highlight-2" defaultMessage="Management" />
                  </Box>
                </Typography>

                <Typography
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  variant="body1"
                  sx={{ fontSize: { xs: '1rem', md: '1.125rem' }, maxWidth: '500px', lineHeight: 1.8, color: alpha('#fff', 0.8) }}
                >
                  <FormattedMessage
                    id="gosafe-hero-desc"
                    defaultMessage="Non-violent prisoner tracking solution, helping them reintegrate into the community while authorities maintain 24/7 control."
                  />
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  variant="contained"
                  size="large"
                  onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                  endIcon={<ArrowRight />}
                  sx={{
                    bgcolor: primaryColor,
                    color: '#fff',
                    px: 4, py: 1.8,
                    borderRadius: '50px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    boxShadow: `0 10px 30px -10px ${primaryColor}`,
                    '&:hover': { bgcolor: alpha(primaryColor, 0.9), boxShadow: `0 20px 40px -10px ${primaryColor}` }
                  }}
                >
                  <FormattedMessage id="gosafe-hero-btn-discover" defaultMessage="Discover Products" />
                </Button>

                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  variant="outlined"
                  size="large"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  sx={{
                    borderColor: alpha('#fff', 0.3),
                    color: '#fff',
                    px: 4, py: 1.8,
                    borderRadius: '50px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    '&:hover': { borderColor: '#fff', bgcolor: alpha('#fff', 0.1) }
                  }}
                >
                  <FormattedMessage id="gosafe-hero-btn-contact" defaultMessage="Contact Us" />
                </Button>
              </Stack>

              {/* Stats bar */}
              <Stack direction="row" flexWrap="wrap" gap={3} sx={{ pt: 4 }}>
                {stats.map((stat, index) => (
                  <Box
                    key={index}
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="gs-hero__stat"
                  >
                    <Stack direction="row" spacing={1} alignItems="center" mb={0.5} color={primaryColor}>
                      {stat.icon}
                      <Typography variant="h6" fontWeight={800} color="#fff">{stat.value}</Typography>
                    </Stack>
                    <Typography variant="caption" color={alpha('#fff', 0.6)} fontWeight={600}>
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;
