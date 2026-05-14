import { alpha, Box, Chip, Container, Grid, Stack, Typography } from '@mui/material';
import { FormattedMessage, useIntl, IntlShape } from 'react-intl';
import { BatteryFull, Bluetooth, Crown, Gps, Location, MagicStar, ShieldSecurity, Simcard, Star, TickCircle } from 'iconsax-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import ankleBraceletGpsTracker1 from '../../../assets/images/gosafe-g737-offender-tracker-1.png';
import ankleBraceletGpsTracker3 from '../../../assets/images/gosafe-g737-offender-tracker-3.png';
import ankleBraceletGpsTracker4 from '../../../assets/images/gosafe-g737-offender-tracker-4.png';
import ankleBraceletGpsTracker5 from '../../../assets/images/gosafe-g737-offender-tracker-5.png';
import g737HomeBeacon from '../../../assets/images/g737-home-beacon.png';
import gpsTrackerPowerBank from '../../../assets/images/gps-tracker-power-bank.png';
import safeImg from '../../../../public/images/safe.png';
import manageImg from '../../../../public/images/manage.png';
import prisonImg from '../../../../public/images/prison.png';
import batteryImg from '../../../../public/images/battery.png';
import biggerBatteryImg from '../../../../public/images/bigger-battery-of-gps-tracker-power-bank.png';
import afbeeldingImg from '../../../../public/images/afbeelding.png';
import waterSplashImg from '../../../../public/images/water-splash.png';
import closeUpOfPrinted from '../../../../public/images/close-up-of-a-printed-circuit-board-sheila-terryscience-photo-library.png';
import trackingMap from '../../../../public/images/tracking-map.png';
import iotImg from '../../../../public/images/iot.png';
import signalImg from '../../../../public/images/signal.png';
interface ProductsSectionProps {
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

// Product Data Types
interface ProductDetail {
  title: string;
  subtitle: string;
  content: string;
  icon?: React.ReactNode;
  image?: string;
  stats?: { label: string; value: string }[];
}

interface Product {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  images: string[];
  description: string;
  highlight: string;
  features: string[];
  specs?: string[];
  details?: ProductDetail[];
  badge?: string;
  applications?: string[];
}

const getProducts = (intl: IntlShape): Product[] => [
  {
    id: 'sentinel',
    name: intl.formatMessage({ id: 'gosafe-product-g737-name', defaultMessage: 'Electronic Tracker' }),
    subtitle: intl.formatMessage({ id: 'gosafe-product-g737-subtitle', defaultMessage: 'Ankle Bracelet Tracker' }),
    icon: <Location size={28} variant="Bold" />,
    images: [ankleBraceletGpsTracker1, ankleBraceletGpsTracker3, ankleBraceletGpsTracker4, ankleBraceletGpsTracker5],
    description: intl.formatMessage({
      id: 'gosafe-product-g737-desc',
      defaultMessage:
        'Non-violent prisoner tracking solution, helping them reintegrate into the community while authorities maintain 24/7 control.'
    }),
    highlight: intl.formatMessage({ id: 'gosafe-product-g737-highlight', defaultMessage: '24/7 Monitoring' }),
    badge: intl.formatMessage({ id: 'gosafe-product-g737-badge', defaultMessage: 'FLAGSHIP' }),
    features: [
      intl.formatMessage({ id: 'gosafe-product-g737-feature-1', defaultMessage: '4G LTE + SMS dual communication' }),
      intl.formatMessage({ id: 'gosafe-product-g737-feature-2', defaultMessage: 'Geo-Fence Management' }),
      intl.formatMessage({ id: 'gosafe-product-g737-feature-3', defaultMessage: '72-channel AGPS' }),
      intl.formatMessage({ id: 'gosafe-product-g737-feature-4', defaultMessage: '24–48 hour Battery' }),
      intl.formatMessage({ id: 'gosafe-product-g737-feature-5', defaultMessage: 'IP67 Waterproof' }),
      intl.formatMessage({ id: 'gosafe-product-g737-feature-6', defaultMessage: 'Motion Alert' })
    ],
    specs: [
      intl.formatMessage({ id: 'gosafe-product-g737-spec-1', defaultMessage: 'Kết nối: LTE Cat-1' }),
      intl.formatMessage({ id: 'gosafe-product-g737-spec-2', defaultMessage: 'Định vị: GPS, GLONASS' }),
      intl.formatMessage({ id: 'gosafe-product-g737-spec-3', defaultMessage: 'Pin: LIPO 3.7V 2200mAh' }),
      intl.formatMessage({ id: 'gosafe-product-g737-spec-4', defaultMessage: 'Kích thước: 83.5 × 79.5 × 29 mm' }),
      intl.formatMessage({ id: 'gosafe-product-g737-spec-5', defaultMessage: 'Trọng lượng: <125g' })
    ],
    applications: [
      intl.formatMessage({ id: 'gosafe-product-g737-app-1', defaultMessage: 'Home Detention Management' }),
      intl.formatMessage({ id: 'gosafe-product-g737-app-2', defaultMessage: 'Probation Monitoring' }),
      intl.formatMessage({ id: 'gosafe-product-g737-app-3', defaultMessage: 'Exclusion Zone Control' }),
      intl.formatMessage({ id: 'gosafe-product-g737-app-4', defaultMessage: 'Real-time Movement Monitoring' }),
      intl.formatMessage({ id: 'gosafe-product-g737-app-5', defaultMessage: 'Prison Management System Integration' })
    ],
    details: [
      {
        title: intl.formatMessage({ id: 'gosafe-product-g737-detail-1-title', defaultMessage: 'Theo dõi 24/7' }),
        subtitle: intl.formatMessage({ id: 'gosafe-product-g737-detail-1-subtitle', defaultMessage: 'Giám sát liên tục' }),
        content: intl.formatMessage({
          id: 'gosafe-product-g737-detail-1-content',
          defaultMessage: 'Gửi cảnh báo khi phạm khu vực cấm hoặc vi phạm quy định.'
        }),
        icon: <Gps size={32} variant="Bold" />,
        image: trackingMap
      },
      {
        title: intl.formatMessage({ id: 'gosafe-product-g737-detail-2-title', defaultMessage: 'Không thể cắt dây' }),
        subtitle: intl.formatMessage({ id: 'gosafe-product-g737-detail-2-subtitle', defaultMessage: 'An toàn tuyệt đối' }),
        content: intl.formatMessage({
          id: 'gosafe-product-g737-detail-2-content',
          defaultMessage: 'Mọi tác động đều được phát hiện và gửi cảnh báo ngay lập tức.'
        }),
        icon: <ShieldSecurity size={32} variant="Bold" />,
        image: safeImg
      },
      {
        title: intl.formatMessage({ id: 'gosafe-product-g737-detail-3-title', defaultMessage: 'Giảm tải nhà tù' }),
        subtitle: intl.formatMessage({ id: 'gosafe-product-g737-detail-3-subtitle', defaultMessage: 'Tái hòa nhập' }),
        content: intl.formatMessage({
          id: 'gosafe-product-g737-detail-3-content',
          defaultMessage: 'Cho phép phạm nhân hòa nhập cộng đồng nhưng vẫn đảm bảo an ninh.'
        }),
        icon: <MagicStar size={32} variant="Bold" />,
        image: prisonImg
      },
      {
        title: intl.formatMessage({ id: 'gosafe-product-g737-detail-4-title', defaultMessage: 'Quản lý hiệu quả' }),
        subtitle: intl.formatMessage({ id: 'gosafe-product-g737-detail-4-subtitle', defaultMessage: 'Dữ liệu thời gian thực' }),
        content: intl.formatMessage({
          id: 'gosafe-product-g737-detail-4-content',
          defaultMessage: 'Giúp cơ quan quản lý ra quyết định nhanh, nhờ dữ liệu giám sát thời gian thực.'
        }),
        icon: <Simcard size={32} variant="Bold" />,
        image: manageImg
      }
    ]
  },
  {
    id: 'beacon',
    name: intl.formatMessage({ id: 'gosafe-product-beacon-name', defaultMessage: 'Electronic Home Beacon' }),
    subtitle: intl.formatMessage({ id: 'gosafe-product-beacon-subtitle', defaultMessage: 'Indoor Positioning Device' }),
    icon: <Bluetooth size={28} variant="Bold" />,
    images: [g737HomeBeacon],
    description: intl.formatMessage({
      id: 'gosafe-product-beacon-desc',
      defaultMessage:
        'Device supporting indoor positioning, helping the monitoring device track more accurately when the offender is in areas without GPS.'
    }),
    highlight: intl.formatMessage({ id: 'gosafe-product-beacon-highlight', defaultMessage: 'Indoor Tracking' }),
    badge: intl.formatMessage({ id: 'gosafe-product-beacon-badge', defaultMessage: 'ACCESSORY' }),
    features: [
      intl.formatMessage({ id: 'gosafe-product-beacon-feature-1', defaultMessage: 'Bluetooth 5.0' }),
      intl.formatMessage({ id: 'gosafe-product-beacon-feature-2', defaultMessage: '100m Range' }),
      intl.formatMessage({ id: 'gosafe-product-beacon-feature-3', defaultMessage: '3D Accelerometer Sensor' }),
      intl.formatMessage({ id: 'gosafe-product-beacon-feature-4', defaultMessage: 'IP67 Waterproof' }),
      intl.formatMessage({ id: 'gosafe-product-beacon-feature-5', defaultMessage: '3M Tape Mounting' })
    ],
    specs: [
      intl.formatMessage({ id: 'gosafe-product-beacon-spec-1', defaultMessage: 'Kích thước: 54.5 × 54.5 × 24 mm' }),
      intl.formatMessage({ id: 'gosafe-product-beacon-spec-2', defaultMessage: 'Pin: 2400mAh, 4 năm' }),
      intl.formatMessage({ id: 'gosafe-product-beacon-spec-3', defaultMessage: 'Nhiệt độ: -20°C đến +60°C' })
    ],
    applications: [
      intl.formatMessage({ id: 'gosafe-product-beacon-app-1', defaultMessage: 'Indoor Positioning' }),
      intl.formatMessage({ id: 'gosafe-product-beacon-app-2', defaultMessage: 'Home Prisoner Management' }),
      intl.formatMessage({ id: 'gosafe-product-beacon-app-3', defaultMessage: 'GPS Error Reduction' }),
      intl.formatMessage({ id: 'gosafe-product-beacon-app-4', defaultMessage: 'Device Displacement Alert' })
    ],
    details: [
      {
        title: intl.formatMessage({ id: 'gosafe-product-beacon-detail-1-title', defaultMessage: 'Hoạt động liền mạch' }),
        subtitle: intl.formatMessage({ id: 'gosafe-product-beacon-detail-1-subtitle', defaultMessage: 'Mở rộng giám sát' }),
        content: intl.formatMessage({
          id: 'gosafe-product-beacon-detail-1-content',
          defaultMessage: 'Hoạt động liền mạch với thiết bị giám sát, mở rộng vùng giám sát indoor.'
        }),
        icon: <Bluetooth size={32} variant="Bold" />,
        image: iotImg
      },
      {
        title: intl.formatMessage({ id: 'gosafe-product-beacon-detail-2-title', defaultMessage: 'Tầm phát 100m' }),
        subtitle: intl.formatMessage({ id: 'gosafe-product-beacon-detail-2-subtitle', defaultMessage: 'Không cần GPS' }),
        content: intl.formatMessage({
          id: 'gosafe-product-beacon-detail-2-content',
          defaultMessage: 'Tầm phát 100m giúp định vị không cần GPS.'
        }),
        icon: <Location size={32} variant="Bold" />,
        image: signalImg
      },
      {
        title: intl.formatMessage({ id: 'gosafe-product-beacon-detail-3-title', defaultMessage: 'Cảnh báo dịch chuyển' }),
        subtitle: intl.formatMessage({ id: 'gosafe-product-beacon-detail-3-subtitle', defaultMessage: 'An toàn tối đa' }),
        content: intl.formatMessage({
          id: 'gosafe-product-beacon-detail-3-content',
          defaultMessage: 'Gửi ngay tới thiết bị giám sát khi beacon bị tháo/gỡ.'
        }),
        icon: <ShieldSecurity size={32} variant="Bold" />,
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80'
      },
      {
        title: intl.formatMessage({ id: 'gosafe-product-beacon-detail-4-title', defaultMessage: 'Pin bền bỉ' }),
        subtitle: intl.formatMessage({ id: 'gosafe-product-beacon-detail-4-subtitle', defaultMessage: '4 năm sử dụng' }),
        content: intl.formatMessage({
          id: 'gosafe-product-beacon-detail-4-content',
          defaultMessage: 'Pin lên đến 4 năm, không cần bảo trì nhiều.'
        }),
        icon: <BatteryFull size={32} variant="Bold" />,
        image: batteryImg
      }
    ]
  },
  {
    id: 'powerbank',
    name: intl.formatMessage({ id: 'gosafe-product-powerbank-name', defaultMessage: 'Electronic Power Bank' }),
    subtitle: intl.formatMessage({ id: 'gosafe-product-powerbank-subtitle', defaultMessage: 'Dedicated Power Bank' }),
    icon: <BatteryFull size={28} variant="Bold" />,
    images: [gpsTrackerPowerBank],
    description: intl.formatMessage({
      id: 'gosafe-product-powerbank-desc',
      defaultMessage: 'High-performance power bank, extending the operating time of the monitoring device in harsh environments.'
    }),
    highlight: intl.formatMessage({ id: 'gosafe-product-powerbank-highlight', defaultMessage: 'High Performance' }),
    badge: intl.formatMessage({ id: 'gosafe-product-powerbank-badge', defaultMessage: 'ACCESSORY' }),
    features: [
      intl.formatMessage({ id: 'gosafe-product-powerbank-feature-1', defaultMessage: 'Input Current Limit Support' }),
      intl.formatMessage({ id: 'gosafe-product-powerbank-feature-2', defaultMessage: 'Reverse Leakage Blocking Support' }),
      intl.formatMessage({ id: 'gosafe-product-powerbank-feature-3', defaultMessage: 'Integrated MP2690 CPU' }),
      intl.formatMessage({ id: 'gosafe-product-powerbank-feature-4', defaultMessage: '4 LED Indicators' })
    ],
    specs: [
      intl.formatMessage({ id: 'gosafe-product-powerbank-spec-1', defaultMessage: 'Kích thước: 76×52×48 mm' }),
      intl.formatMessage({ id: 'gosafe-product-powerbank-spec-2', defaultMessage: 'Trọng lượng: 319.5g' }),
      intl.formatMessage({ id: 'gosafe-product-powerbank-spec-3', defaultMessage: 'Điện áp: 6–36V' }),
      intl.formatMessage({ id: 'gosafe-product-powerbank-spec-4', defaultMessage: 'Tiêu thụ: Active 160mA' })
    ],
    applications: [
      intl.formatMessage({ id: 'gosafe-product-powerbank-app-1', defaultMessage: 'Extended Usage Time' }),
      intl.formatMessage({ id: 'gosafe-product-powerbank-app-2', defaultMessage: 'Outdoor Deployment' }),
      intl.formatMessage({ id: 'gosafe-product-powerbank-app-3', defaultMessage: 'Long-term Monitoring' })
    ],
    details: [
      {
        title: intl.formatMessage({ id: 'gosafe-product-powerbank-detail-1-title', defaultMessage: 'Dung lượng lớn' }),
        subtitle: intl.formatMessage({ id: 'gosafe-product-powerbank-detail-1-subtitle', defaultMessage: 'Tùy chọn linh hoạt' }),
        content: intl.formatMessage({
          id: 'gosafe-product-powerbank-detail-1-content',
          defaultMessage: 'Dung lượng lớn, dùng 1 hoặc 2 pin lithium tùy chọn.'
        }),
        icon: <BatteryFull size={32} variant="Bold" />,
        image: biggerBatteryImg
      },
      {
        title: intl.formatMessage({ id: 'gosafe-product-powerbank-detail-2-title', defaultMessage: 'Bền bỉ' }),
        subtitle: intl.formatMessage({ id: 'gosafe-product-powerbank-detail-2-subtitle', defaultMessage: 'Chịu nhiệt tốt' }),
        content: intl.formatMessage({
          id: 'gosafe-product-powerbank-detail-2-content',
          defaultMessage: 'Chịu nhiệt độ từ -40°C đến +70°C.'
        }),
        icon: <ShieldSecurity size={32} variant="Bold" />,
        image: afbeeldingImg
      },
      {
        title: intl.formatMessage({ id: 'gosafe-product-powerbank-detail-3-title', defaultMessage: 'Chống nước IP67' }),
        subtitle: intl.formatMessage({ id: 'gosafe-product-powerbank-detail-3-subtitle', defaultMessage: 'Hoạt động ngoài trời' }),
        content: intl.formatMessage({
          id: 'gosafe-product-powerbank-detail-3-content',
          defaultMessage: 'Chống nước & bụi IP67, hoạt động ngoài trời ổn định.'
        }),
        icon: <TickCircle size={32} variant="Bold" />,
        image: waterSplashImg
      },
      {
        title: intl.formatMessage({ id: 'gosafe-product-powerbank-detail-4-title', defaultMessage: 'An toàn tuyệt đối' }),
        subtitle: intl.formatMessage({ id: 'gosafe-product-powerbank-detail-4-subtitle', defaultMessage: 'Bảo vệ toàn diện' }),
        content: intl.formatMessage({
          id: 'gosafe-product-powerbank-detail-4-content',
          defaultMessage: 'Bảo vệ ngắn mạch, quá dòng, quá áp, cực kỳ an toàn.'
        }),
        icon: <ShieldSecurity size={32} variant="Bold" />,
        image: closeUpOfPrinted
      }
    ]
  }
];

const ProductRow = ({
  product,
  isEven,
  isDark,
  primaryColor,
  secondaryColor
}: {
  product: Product;
  isEven: boolean;
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}) => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.1 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-rotate images
  useEffect(() => {
    if (product.images && product.images.length > 1) {
      const timer = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [product.images]);

  return (
    <Box
      ref={containerRef}
      sx={{
        py: { xs: 12, md: 20 },
        position: 'relative',
        overflow: 'hidden',
        borderBottom: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
        bgcolor: isDark ? 'transparent' : alpha(secondaryColor, 0.02)
      }}
    >
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, px: { xs: 3 } }}>
        {/* Main Product Intro */}
        <Box
          sx={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
            transition: 'all 1s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
        >
          <Grid
            gap={{ xs: 4, md: 0 }}
            container
            spacing={{ xs: 0, md: 12 }}
            alignItems="center"
            direction={isEven ? 'row' : 'row-reverse'}
            sx={{ mb: product.details ? 16 : 0 }}
          >
            {/* Content Side */}
            <Grid item xs={12} md={6}>
              <Stack spacing={4}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  {product.badge && (
                    <Chip
                      label={product.badge}
                      icon={<Crown size={14} variant="Bold" />}
                      sx={{
                        background: `linear-gradient(135deg, ${primaryColor}, ${alpha(primaryColor, 0.6)})`,
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        height: '28px',
                        border: 'none',
                        boxShadow: `0 4px 12px ${alpha(primaryColor, 0.3)}`,
                        '& .MuiChip-icon': { color: 'white', ml: 0.5 }
                      }}
                    />
                  )}

                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 2,
                      py: 0.5,
                      borderRadius: '100px',
                      background: isDark ? alpha(primaryColor, 0.1) : alpha(primaryColor, 0.05),
                      border: `1px solid ${alpha(primaryColor, 0.2)}`,
                      color: primaryColor
                    }}
                  >
                    {product.icon}
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem' }}
                    >
                      {product.highlight}
                    </Typography>
                  </Box>
                </Stack>

                <Box>
                  <Typography
                    variant="h2"
                    sx={{
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      fontWeight: 800,
                      mb: 2,
                      lineHeight: 1.1,
                      letterSpacing: '-0.02em',
                      color: isDark ? '#fff' : '#0f172a'
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 500,
                      mb: 3,
                      color: isDark ? alpha('#fff', 0.8) : alpha('#0f172a', 0.8),
                      fontSize: { xs: '1.25rem', md: '1.5rem' }
                    }}
                  >
                    {product.subtitle}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 400,
                      color: isDark ? alpha('#fff', 0.6) : alpha('#0f172a', 0.6),
                      lineHeight: 1.8,
                      fontSize: '1.1rem',
                      maxWidth: '90%'
                    }}
                  >
                    {product.description}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(2, 1fr)',
                      sm: 'repeat(3, 1fr)'
                    },
                    gap: { xs: 2 }
                  }}
                >
                  {product.specs?.map((spec, idx) => (
                    <Box
                      key={idx}
                      component={motion.div}
                      whileHover={{ y: -5 }}
                      sx={{
                        p: 2,
                        borderRadius: '16px',
                        bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                        border: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: alpha(primaryColor, 0.3),
                          bgcolor: alpha(primaryColor, 0.05)
                        }
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: isDark ? alpha('#fff', 0.4) : alpha('#000', 0.4),
                          fontWeight: 600,
                          display: 'block',
                          mb: 0.5,
                          fontSize: '0.7rem',
                          textTransform: 'uppercase'
                        }}
                      >
                        {spec.split(':')[0]}
                      </Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ color: isDark ? '#fff' : '#0f172a' }}>
                        {spec.split(':')[1]}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box>
                  <Grid container spacing={2}>
                    {product.features.map((feature, idx) => (
                      <Grid item xs={12} sm={6} key={idx}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              p: 0.5,
                              borderRadius: '50%',
                              bgcolor: alpha(primaryColor, 0.1),
                              color: primaryColor,
                              display: 'flex'
                            }}
                          >
                            <TickCircle size={16} variant="Bold" />
                          </Box>
                          <Typography variant="body2" fontWeight={600} sx={{ color: isDark ? alpha('#fff', 0.8) : alpha('#0f172a', 0.8) }}>
                            {feature}
                          </Typography>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Applications Section */}
                {product.applications && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: isDark ? '#fff' : '#0f172a' }}>
                      <FormattedMessage id="gosafe-products-app-title" defaultMessage="Applications" />
                    </Typography>
                    <Grid container spacing={2}>
                      {product.applications.map((app, idx) => (
                        <Grid item xs={12} sm={6} key={idx}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: primaryColor }} />
                            <Typography variant="body2" sx={{ color: isDark ? alpha('#fff', 0.7) : alpha('#0f172a', 0.7) }}>
                              {app}
                            </Typography>
                          </Stack>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Stack>
            </Grid>
            {/* Visual Side (Slideshow) */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: '400px', md: '600px' },
                  width: '100%',
                  perspective: '1500px'
                }}
              >
                {/* Background Rings */}
                <Box
                  component={motion.div}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '70%',
                    height: '70%',
                    borderRadius: '50%',
                    border: `1px solid ${alpha(primaryColor, 0.2)}`,
                    boxShadow: `0 0 80px ${alpha(primaryColor, 0.1)}`,
                    zIndex: 0,
                    x: '-50%',
                    y: '-50%'
                  }}
                />

                {/* Main Image Container */}
                <Box
                  component={motion.div}
                  whileHover={{ scale: 1.02 }}
                  initial={{ rotateY: isEven ? -12 : 12 }}
                  transition={{ type: 'spring', stiffness: 100 }}
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 1,
                    borderRadius: '32px',
                    overflow: 'hidden',
                    bgcolor: isDark ? alpha('#000', 0.2) : alpha('#fff', 0.2),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                    boxShadow: isDark ? `0 25px 50px -12px ${alpha('#000', 0.5)}` : `0 25px 50px -12px ${alpha(primaryColor, 0.15)}`
                  }}
                >
                  <AnimatePresence mode="popLayout">
                    <motion.img
                      key={currentImageIndex}
                      src={product.images[currentImageIndex]}
                      alt={product.name}
                      loading="lazy"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7 }}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </AnimatePresence>

                  {/* Overlay Gradient */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: `linear-gradient(to bottom, transparent 70%, ${alpha('#000', 0.4)} 100%)`,
                      pointerEvents: 'none'
                    }}
                  />

                  {/* Image Navigation Dots */}
                  {product.images.length > 1 && (
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                      sx={{
                        position: 'absolute',
                        bottom: 24,
                        left: 0,
                        right: 0,
                        zIndex: 2
                      }}
                    >
                      {product.images.map((_, idx) => (
                        <Box
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          component={motion.div}
                          animate={{
                            width: currentImageIndex === idx ? 24 : 8,
                            backgroundColor: currentImageIndex === idx ? primaryColor : alpha('#fff', 0.5)
                          }}
                          sx={{
                            height: 8,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            '&:hover': {
                              backgroundColor: primaryColor
                            }
                          }}
                        />
                      ))}
                    </Stack>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Detailed Feature Sections (Refined Zigzag) */}
        {product.details && (
          <Box sx={{ mt: { xs: 12 } }}>
            <Typography
              variant="h3"
              align="center"
              sx={{
                mb: { xs: 4, md: 12 },
                fontWeight: 800,
                color: isDark ? '#fff' : '#0f172a',
                letterSpacing: '-0.02em'
              }}
            >
              <FormattedMessage id="gosafe-products-detail-title" defaultMessage="Technical" />{' '}
              <Box component="span" sx={{ color: primaryColor }}>
                <FormattedMessage id="gosafe-products-detail-title-highlight" defaultMessage="Details" />
              </Box>
            </Typography>

            <Stack spacing={{ xs: 5, md: 20 }} sx={{ position: 'relative' }}>
              {/* Connecting Line */}
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  bottom: 0,
                  width: '2px',
                  bgcolor: alpha(primaryColor, 0.1),
                  display: { xs: 'none', md: 'block' },
                  transform: 'translateX(-50%)'
                }}
              />

              {product.details.map((detail, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: { xs: 3, md: 10 },
                    alignItems: 'center',
                    position: 'relative'
                  }}
                >
                  {/* Center Dot */}
                  <Box
                    component={motion.div}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      bgcolor: primaryColor,
                      border: `4px solid ${isDark ? '#0b1121' : '#f8fafc'}`,
                      transform: 'translate(-50%, -50%)',
                      display: { xs: 'none', md: 'block' },
                      zIndex: 1
                    }}
                  />

                  {/* Image Side */}
                  <Box
                    sx={{
                      order: { xs: 0, md: idx % 2 === 0 ? 0 : 1 },
                      px: { xs: 0, md: 0 }
                    }}
                  >
                    <Box
                      component={motion.div}
                      initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      sx={{
                        position: 'relative',
                        height: { xs: '300px', md: '450px' },
                        borderRadius: '32px',
                        overflow: 'hidden',
                        boxShadow: `0 20px 40px -10px ${alpha(primaryColor, 0.15)}`,
                        border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`
                      }}
                    >
                      <Box
                        component="img"
                        src={detail.image || product.images[0]}
                        alt={detail.title}
                        loading="lazy"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease',
                          '&:hover': { transform: 'scale(1.05)' }
                        }}
                      />
                      {/* Overlay Gradient */}
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background: `linear-gradient(to top, ${alpha('#000', 0.6)}, transparent)`
                        }}
                      />
                      {/* Image Caption */}
                      <Box sx={{ position: 'absolute', bottom: 30, left: 30 }}>
                        <Typography variant="subtitle2" sx={{ color: 'white', opacity: 0.8, textTransform: 'uppercase', letterSpacing: 2 }}>
                          {detail.subtitle}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Content Side */}
                  <Box
                    sx={{
                      order: { xs: 1, md: idx % 2 === 0 ? 1 : 0 }
                    }}
                  >
                    <Box
                      component={motion.div}
                      initial={{ opacity: 0, x: idx % 2 === 0 ? 50 : -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      sx={{
                        p: { xs: 0, md: 6 },
                        borderRadius: '32px',
                        bgcolor: { md: isDark ? alpha('#1e293b', 0.3) : alpha('#fff', 0.5) },
                        backdropFilter: { md: 'blur(20px)' },
                        border: { md: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}` }
                      }}
                    >
                      <Stack spacing={3}>
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '20px',
                            bgcolor: alpha(primaryColor, 0.1),
                            color: primaryColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {detail.icon}
                        </Box>
                        <Box>
                          <Typography
                            variant="h4"
                            fontWeight={800}
                            gutterBottom
                            sx={{ color: isDark ? '#fff' : '#0f172a', lineHeight: 1.2 }}
                          >
                            {detail.title}
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            sx={{
                              color: primaryColor,
                              mb: 3,
                              textTransform: 'uppercase',
                              letterSpacing: 1,
                              fontSize: '0.9rem'
                            }}
                          >
                            {detail.subtitle}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              fontSize: '1.1rem',
                              lineHeight: 1.8,
                              color: isDark ? alpha('#fff', 0.7) : alpha('#000', 0.7)
                            }}
                          >
                            {detail.content}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
};

const ProductsSection = ({ isDark, primaryColor, secondaryColor }: ProductsSectionProps) => {
  const intl = useIntl();
  const products = getProducts(intl);

  return (
    <Box
      id="products"
      sx={{
        position: 'relative',
        bgcolor: isDark ? 'transparent' : alpha(secondaryColor, 0.02),
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: isDark
            ? `radial-gradient(${alpha('#0061ff', 0.1)} 1px, transparent 1px)`
            : `radial-gradient(${alpha('#0061ff', 0.05)} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          opacity: 0.5
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, pt: 15, pb: 5 }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Chip
            label={<FormattedMessage id="gosafe-products-chip" defaultMessage="Main Products" />}
            icon={<Star size={16} variant="Bold" />}
            sx={{
              bgcolor: alpha(primaryColor, 0.1),
              color: primaryColor,
              fontWeight: 700,
              fontSize: '0.875rem',
              height: '32px',
              mb: 3,
              border: `1px solid ${alpha(primaryColor, 0.2)}`,
              '& .MuiChip-icon': { color: '#0061ff' }
            }}
          />
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3rem', md: '4.5rem' },
              fontWeight: 900,
              mb: 3,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: isDark ? '#fff' : '#0f172a'
            }}
          >
            <FormattedMessage id="gosafe-products-title" defaultMessage="Gosafe" />{' '}
            <Box component="span" sx={{ color: primaryColor }}>
              <FormattedMessage id="gosafe-products-title-highlight" defaultMessage="Ecosystem" />
            </Box>
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 400,
              color: isDark ? alpha('#fff', 0.6) : alpha('#0f172a', 0.6),
              maxWidth: '700px',
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            <FormattedMessage
              id="gosafe-products-subtitle"
              defaultMessage="Comprehensive monitoring solution with advanced hardware devices designed for maximum efficiency."
            />
          </Typography>
        </Box>
      </Container>

      {products.map((product, index) => (
        <ProductRow
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          key={product.id}
          product={product}
          isEven={index % 2 === 0}
          isDark={isDark}
        />
      ))}
    </Box>
  );
};

export default ProductsSection;
