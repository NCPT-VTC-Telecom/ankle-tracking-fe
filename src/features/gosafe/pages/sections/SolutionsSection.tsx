import { Box, Container, Stack, Typography, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Bluetooth, Chart, Gps, Map1, Message, Mobile, Monitor,
  Notification, Profile, ScanBarcode, SecurityUser, ShieldSecurity, ShieldTick, Task
} from 'iconsax-react';
import { FormattedMessage } from 'react-intl';
import flexibleGeofence from '/public/images/Flexible-Geofence---Offender-Tracking-System.png';
import liveMonitoring   from '/public/images/Live-Monitoring---Offender-Tracking-System.png';
import multiPlatform    from '/public/images/Multi-Platform-Offender-Tracking-System.png';
import oneStopSolution  from '/public/images/One-stop-solution-for-offenders-tracking.png';
import variousAlarms    from '/public/images/Various-Alarms-setting---Offender-Tracking-System.png';

interface SolutionsSectionProps {
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const solutionGroups = [
  {
    id: 0, titleId: 'gosafe-solution-group-1-title', descId: 'gosafe-solution-group-1-desc',
    image: liveMonitoring, icon: <Map1 variant="Bold" />,
    items: [
      { titleId: 'gosafe-solutions-admin-1-title', descId: 'gosafe-solutions-admin-1-desc', icon: <Monitor size={24} /> },
      { titleId: 'gosafe-solutions-admin-5-title', descId: 'gosafe-solutions-admin-5-desc', icon: <Gps size={24} /> },
      { titleId: 'gosafe-solutions-alert-raw-title', descId: 'gosafe-solutions-alert-raw-desc', icon: <Chart size={24} /> }
    ]
  },
  {
    id: 1, titleId: 'gosafe-solution-group-2-title', descId: 'gosafe-solution-group-2-desc',
    image: flexibleGeofence, icon: <ShieldTick variant="Bold" />,
    items: [
      { titleId: 'gosafe-solutions-admin-3-title', descId: 'gosafe-solutions-admin-3-desc', icon: <Map1 size={24} /> },
      { titleId: 'gosafe-solutions-alert-sos-title', descId: 'gosafe-solutions-alert-sos-desc', icon: <ShieldSecurity size={24} /> },
      { titleId: 'gosafe-solutions-admin-2-title', descId: 'gosafe-solutions-admin-2-desc', icon: <Notification size={24} /> }
    ]
  },
  {
    id: 2, titleId: 'gosafe-solution-group-alerts-title', descId: 'gosafe-solution-group-alerts-desc',
    image: variousAlarms, icon: <Notification variant="Bold" />,
    items: [
      { titleId: 'gosafe-solutions-alert-sms-title', descId: 'gosafe-solutions-alert-sms-desc', icon: <Message size={24} /> },
      { titleId: 'gosafe-solutions-alert-beacon-title', descId: 'gosafe-solutions-alert-beacon-desc', icon: <Bluetooth size={24} /> },
      { titleId: 'gosafe-solutions-alert-fiber-title', descId: 'gosafe-solutions-alert-fiber-desc', icon: <ShieldSecurity size={24} /> }
    ]
  },
  {
    id: 3, titleId: 'gosafe-solution-group-4-title', descId: 'gosafe-solution-group-4-desc',
    image: oneStopSolution, icon: <Chart variant="Bold" />,
    items: [
      { titleId: 'gosafe-solutions-admin-6-title', descId: 'gosafe-solutions-admin-6-desc', icon: <Chart size={24} /> },
      { titleId: 'gosafe-solutions-admin-4-title', descId: 'gosafe-solutions-admin-4-desc', icon: <Profile size={24} /> },
      { titleId: 'gosafe-solutions-admin-7-title', descId: 'gosafe-solutions-admin-7-desc', icon: <SecurityUser size={24} /> },
      { titleId: 'gosafe-solutions-mgmt-jobs-title', descId: 'gosafe-solutions-mgmt-jobs-desc', icon: <Task size={24} /> }
    ]
  },
  {
    id: 4, titleId: 'gosafe-solution-group-5-title', descId: 'gosafe-solution-group-5-desc',
    image: multiPlatform, icon: <Mobile variant="Bold" />,
    items: [
      { titleId: 'gosafe-solutions-app-4-title', descId: 'gosafe-solutions-app-4-desc', icon: <Message size={24} /> },
      { titleId: 'gosafe-solutions-app-1-title', descId: 'gosafe-solutions-app-1-desc', icon: <ScanBarcode size={24} /> },
      { titleId: 'gosafe-solutions-app-5-title', descId: 'gosafe-solutions-app-5-desc', icon: <Task size={24} /> }
    ]
  }
];

/* ── Sub-components ─────────────────────────────────────────────────────── */

const FeatureItem = ({ item, isDark, primaryColor }: { item: any; isDark: boolean; primaryColor: string }) => (
  /* gs-feature-item: padding, border-radius, height 100%, backdrop-filter, transition */
  <Box
    component={motion.div}
    whileHover={{ y: -5, scale: 1.02 }}
    className="gs-feature-item"
    sx={{
      bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#fff', 0.6),
      border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05)}`,
      boxShadow: isDark ? 'none' : '0 4px 20px -5px rgba(0,0,0,0.05)',
      '&:hover': {
        borderColor: alpha(primaryColor, 0.4),
        boxShadow: `0 10px 40px -10px ${alpha(primaryColor, 0.2)}`
      }
    }}
  >
    <Stack direction="row" spacing={2.5} alignItems="flex-start">
      {/* gs-feature-icon: padding, border-radius, display flex, flex-shrink 0 */}
      <Box
        className="gs-feature-icon"
        sx={{
          color: primaryColor,
          bgcolor: isDark ? alpha(primaryColor, 0.15) : alpha(primaryColor, 0.1)
        }}
      >
        {item.icon}
      </Box>
      <Box textAlign="left">
        <Typography variant="h6" fontWeight={700} color={isDark ? '#f1f5f9' : '#1e293b'} gutterBottom>
          <FormattedMessage id={item.titleId} />
        </Typography>
        <Typography variant="body2" color={isDark ? '#94a3b8' : '#64748b'} lineHeight={1.6}>
          <FormattedMessage id={item.descId} />
        </Typography>
      </Box>
    </Stack>
  </Box>
);

const FeaturedImage = ({ src, isDark, primaryColor }: { src: string; isDark: boolean; primaryColor: string }) => (
  /* gs-featured-image: max-width, margin auto, display flex, justify-content center */
  <Box
    component={motion.div}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-5%' }}
    transition={{ duration: 0.7 }}
    className="gs-featured-image"
    sx={{ my: 8 }}
  >
    {/* gs-featured-image__frame: relative, border-radius, overflow hidden */}
    <Box
      className="gs-featured-image__frame"
      sx={{
        boxShadow: `0 50px 100px -20px ${isDark ? '#000' : alpha('#000', 0.25)}`,
        border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`
      }}
    >
      {/* gs-featured-image__shimmer: absolute fill, gradient, z-index 2 */}
      <Box className="gs-featured-image__shimmer" />
      {/* gs-featured-image__glow: absolute fill, z-index 0 */}
      <Box
        className="gs-featured-image__glow"
        sx={{ background: `radial-gradient(circle at center, ${alpha(primaryColor, 0.2)}, transparent 80%)` }}
      />
      {/* gs-featured-image__img: width 100%, block, z-index 1 */}
      <img src={src} alt="Feature Screenshot" loading="lazy" className="gs-featured-image__img" />
    </Box>
  </Box>
);

const SolutionGroup = ({ group, isDark, primaryColor, secondaryColor }: any) => (
  /* gs-solution-group: position relative */
  <Box className="gs-solution-group" sx={{ mb: { xs: 15, md: 25 } }}>
    <Container maxWidth="xl">
      <Stack alignItems="center" spacing={4} textAlign="center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: isDark ? '#fff' : '#0f172a',
              fontSize: { xs: '2.5rem', md: '4rem' },
              lineHeight: 1.1,
              mb: 2,
              textShadow: isDark ? '0 0 40px rgba(255,255,255,0.1)' : 'none'
            }}
          >
            <FormattedMessage id={group.titleId} />
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: isDark ? '#94a3b8' : '#64748b',
              maxWidth: '800px',
              mx: 'auto',
              fontWeight: 400,
              fontSize: { xs: '1.1rem', md: '1.25rem' }
            }}
          >
            <FormattedMessage id={group.descId} />
          </Typography>
        </motion.div>

        <FeaturedImage src={group.image} isDark={isDark} primaryColor={primaryColor} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4, px: { xs: 2, md: 0 }, maxWidth: 'lg', mx: 'auto' }}>
          {group.items.map((item: any, idx: number) => (
            <Box key={idx} sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, minWidth: { md: '300px' }, maxWidth: { md: '400px' } }}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                style={{ height: '100%' }}
              >
                <FeatureItem item={item} isDark={isDark} primaryColor={primaryColor} />
              </motion.div>
            </Box>
          ))}
        </Box>
      </Stack>
    </Container>
  </Box>
);

/* ── Title Hero ─────────────────────────────────────────────────────────── */

const TitleHero = ({ isDark, primaryColor }: { isDark: boolean; primaryColor: string }) => (
  /* gs-title-hero: relative, flex-col, align center, overflow hidden */
  <Box
    className="gs-title-hero"
    sx={{ pt: { xs: 15, md: 20 }, bgcolor: isDark ? '#020617' : '#ffffff' }}
  >
    {/* Concentric rings + glow — gs-title-hero__bg */}
    <Box className="gs-title-hero__bg">
      {[1, 2, 3, 4].map((i) => (
        /* gs-title-hero__ring: absolute centered, border-radius 50% */
        <Box
          key={i}
          className="gs-title-hero__ring"
          sx={{
            width: `${60 + i * 25}vh`,
            height: `${60 + i * 25}vh`,
            border: `1px solid ${isDark ? alpha('#fff', 0.03) : alpha('#000', 0.03)}`
          }}
        />
      ))}
      {/* gs-title-hero__glow: absolute top-20%, left 50%, blur 60px */}
      <Box
        className="gs-title-hero__glow"
        sx={{
          background: `conic-gradient(from 180deg at 50% 0%, ${alpha(primaryColor, 0.15)} 0deg, transparent 60deg, transparent 300deg, ${alpha(primaryColor, 0.15)} 360deg)`
        }}
      />
    </Box>

    {/* gs-title-hero__content: relative z-index 1 */}
    <Container maxWidth="lg" className="gs-title-hero__content" sx={{ textAlign: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ maxWidth: '1000px', margin: 'auto' }}
      >
        <Typography
          variant="h1"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '3rem', md: '5rem', lg: '6rem' },
            lineHeight: 1.1,
            mb: 3,
            letterSpacing: '-0.02em',
            color: isDark ? '#fff' : '#0f172a',
            textShadow: isDark ? `0 0 60px ${alpha(primaryColor, 0.4)}` : 'none'
          }}
        >
          <FormattedMessage id="gosafe-solutions-title" defaultMessage="Offender Tracking System" />
        </Typography>

        <Typography
          variant="h4"
          sx={{
            color: isDark ? '#94a3b8' : '#64748b',
            maxWidth: '700px',
            mx: 'auto',
            fontWeight: 400,
            lineHeight: 1.6,
            fontSize: { xs: '1.1rem', md: '1.35rem' },
            mb: 5
          }}
        >
          <FormattedMessage id="gosafe-solutions-subtitle" defaultMessage="Smart monitoring system and mobile application" />
        </Typography>
      </motion.div>
    </Container>

    {/* Dashboard preview */}
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3 }}
      sx={{ width: '100%', maxWidth: '1200px', px: 2, display: 'flex', justifyContent: 'center' }}
    >
      {/* gs-dashboard-frame: aspect-ratio 16/9, border-radius, overflow hidden */}
      <Box
        className="gs-dashboard-frame"
        sx={{
          border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
          background: isDark ? '#0f172a' : '#fff'
        }}
      >
        {/* gs-dashboard-frame__img: width/height 100%, object-fit cover */}
        <img src={liveMonitoring} loading="lazy" className="gs-dashboard-frame__img" alt="Dashboard" />
        {/* gs-dashboard-frame__overlay: absolute fill, gradient */}
        <Box className="gs-dashboard-frame__overlay gs-absolute-fill" />
      </Box>
    </Box>
  </Box>
);

const SolutionsSection = ({ isDark, primaryColor, secondaryColor }: SolutionsSectionProps) => (
  /* gs-solutions: position relative, overflow hidden */
  <Box
    id="solutions"
    className="gs-solutions"
    sx={{ bgcolor: isDark ? '#020617' : '#ffffff', pt: 0, pb: 10 }}
  >
    <TitleHero isDark={isDark} primaryColor={primaryColor} />
    <Box sx={{ position: 'relative', zIndex: 1, mt: { xs: 20, md: 35 } }}>
      {solutionGroups.map((group, index) => (
        <SolutionGroup key={group.id} group={group} index={index} isDark={isDark} primaryColor={primaryColor} secondaryColor={secondaryColor} />
      ))}
    </Box>
  </Box>
);

export default SolutionsSection;
