import { Box, Container, Stack, Typography, alpha, Grid } from '@mui/material';
import { FormattedMessage, useIntl, IntlShape } from 'react-intl';
import { useState } from 'react';
import { DocumentCode, BatteryFull, Bluetooth, Gps, Cpu, Maximize, ShieldTick, Setting2 } from 'iconsax-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpecsSectionProps {
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const SpecsSection = ({ isDark, primaryColor, secondaryColor }: SpecsSectionProps) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const intl = useIntl();

  // Unified Theme Colors

  // Custom styles
  const cardBg = isDark ? alpha('#1e293b', 0.4) : alpha('#fff', 0.8);
  const borderColor = isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06);

  const getTabsData = (intl: IntlShape) => {
    const g737Specs = [
      {
        category: intl.formatMessage({ id: 'gosafe-specs-cat-general', defaultMessage: 'Tổng quan (General)' }),
        icon: <Setting2 size={24} variant="Bold" />,
        specs: [
          { label: intl.formatMessage({ id: 'gosafe-specs-label-comm', defaultMessage: 'Giao tiếp' }), value: 'LTE, TCP/UDP/SMS' },
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-channels', defaultMessage: 'Kênh định vị' }),
            value: '72 channels'
          },
          { label: intl.formatMessage({ id: 'gosafe-specs-label-power', defaultMessage: 'Nguồn' }), value: 'Internal Battery' }
        ]
      },
      {
        category: intl.formatMessage({ id: 'gosafe-specs-cat-gps', defaultMessage: 'GPS & Định vị' }),
        icon: <Gps size={24} variant="Bold" />,
        specs: [
          { label: intl.formatMessage({ id: 'gosafe-specs-label-chipset', defaultMessage: 'Chipset' }), value: 'uBlox 8 All in one' },
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-system', defaultMessage: 'Hệ thống' }),
            value: 'GPS, GLONASS, QZSS, SBAS'
          },
          { label: intl.formatMessage({ id: 'gosafe-specs-label-accuracy', defaultMessage: 'Độ chính xác' }), value: '2.5m CEP' },
          { label: intl.formatMessage({ id: 'gosafe-specs-label-sensitivity', defaultMessage: 'Độ nhạy' }), value: '-162dBm' },
          { label: intl.formatMessage({ id: 'gosafe-specs-label-update', defaultMessage: 'Cập nhật' }), value: '10Hz' },
          { label: intl.formatMessage({ id: 'gosafe-specs-label-antenna', defaultMessage: 'Anten' }), value: 'Patch internal' },
          { label: intl.formatMessage({ id: 'gosafe-specs-label-agps', defaultMessage: 'A-GPS' }), value: 'Supported' }
        ]
      },
      {
        category: intl.formatMessage({ id: 'gosafe-specs-cat-physical', defaultMessage: 'Vật lý (Physical)' }),
        icon: <Maximize size={24} variant="Bold" />,
        specs: [
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-dimensions', defaultMessage: 'Kích thước' }),
            value: '83.5 x 79.5 x 29 mm'
          },
          { label: intl.formatMessage({ id: 'gosafe-specs-label-weight', defaultMessage: 'Trọng lượng' }), value: '<125g (kèm dây 24cm)' }
        ]
      },
      {
        category: intl.formatMessage({ id: 'gosafe-specs-cat-buttons', defaultMessage: 'Nút bấm & LED' }),
        icon: <Cpu size={24} variant="Bold" />,
        specs: [
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-sos', defaultMessage: 'Nút SOS' }),
            value: intl.formatMessage({ id: 'gosafe-specs-value-sos', defaultMessage: 'Gửi SMS khẩn cấp' })
          },
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-led', defaultMessage: 'Đèn LED' }),
            value: 'GPS, Cellular, Power'
          }
        ]
      },
      {
        category: intl.formatMessage({ id: 'gosafe-specs-cat-band', defaultMessage: 'Dây đeo (Shank Band)' }),
        icon: <ShieldTick size={24} variant="Bold" />,
        specs: [
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-bandtype', defaultMessage: 'Loại dây' }),
            value: intl.formatMessage({ id: 'gosafe-specs-value-fiber', defaultMessage: 'Sợi quang (Fiber Optic)' })
          },
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-dimensions', defaultMessage: 'Kích thước' }),
            value: intl.formatMessage({ id: 'gosafe-specs-value-diverse', defaultMessage: 'Đa dạng tùy chọn' })
          }
        ]
      }
    ];

    const powerbankSpecs = [
      {
        category: intl.formatMessage({ id: 'gosafe-specs-label-dimensions', defaultMessage: 'Kích thước' }),
        icon: <Maximize size={24} variant="Bold" />,
        specs: [
          { label: 'Size (4500mAh)', value: '76×52×48 mm' },
          { label: 'Size (2000mAh)', value: '76×52×62 mm' },
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-weight', defaultMessage: 'Trọng lượng' }),
            value: '319.5g (kèm hộp & pin)'
          }
        ]
      },
      {
        category: intl.formatMessage({ id: 'gosafe-specs-cat-env', defaultMessage: 'Môi trường hoạt động' }),
        icon: <Setting2 size={24} variant="Bold" />,
        specs: [
          { label: intl.formatMessage({ id: 'gosafe-specs-label-temp', defaultMessage: 'Nhiệt độ' }), value: '-40°C ~ +60°C' },
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-boston', defaultMessage: 'Pin Boston' }),
            value: intl.formatMessage({ id: 'gosafe-specs-value-high-low', defaultMessage: 'Chịu nhiệt cao & thấp' })
          },
          { label: intl.formatMessage({ id: 'gosafe-specs-label-charge', defaultMessage: 'Sạc' }), value: '-20°C ~ +60°C' },
          { label: intl.formatMessage({ id: 'gosafe-specs-label-discharge', defaultMessage: 'Xả' }), value: '-40°C ~ +70°C' },
          { label: intl.formatMessage({ id: 'gosafe-specs-label-humidity', defaultMessage: 'Độ ẩm' }), value: '100% RH @ 50°C' },
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-waterproof', defaultMessage: 'Chống nước/bụi' }),
            value: 'IP67 (1m nước)'
          },
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-vibration', defaultMessage: 'Chống rung' }),
            value: 'MIL 202G, 810F, SAE J1455'
          }
        ]
      },
      {
        category: intl.formatMessage({ id: 'gosafe-specs-cat-std', defaultMessage: 'Tiêu chuẩn & CPU' }),
        icon: <Cpu size={24} variant="Bold" />,
        specs: [
          { label: intl.formatMessage({ id: 'gosafe-specs-label-emc', defaultMessage: 'EMC/EMI' }), value: 'SAE J1113; FCC-Part 15B' },
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-rohs', defaultMessage: 'RoHS' }),
            value: intl.formatMessage({ id: 'gosafe-specs-value-compliant', defaultMessage: 'Tương thích (tùy chọn)' })
          },
          { label: intl.formatMessage({ id: 'gosafe-specs-label-cpu', defaultMessage: 'CPU' }), value: 'MP2690' }
        ]
      },
      {
        category: intl.formatMessage({ id: 'gosafe-specs-cat-power', defaultMessage: 'Nguồn điện' }),
        icon: <BatteryFull size={24} variant="Bold" />,
        specs: [
          { label: intl.formatMessage({ id: 'gosafe-specs-label-input-voltage', defaultMessage: 'Điện áp vào' }), value: '6-36V' },
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-replace-battery', defaultMessage: 'Pin thay thế' }),
            value: intl.formatMessage({ id: 'gosafe-specs-value-boston', defaultMessage: 'Boston Battery (chịu nhiệt)' })
          }
        ]
      },
      {
        category: intl.formatMessage({ id: 'gosafe-specs-cat-consumption', defaultMessage: 'Tiêu thụ điện (Li-Battery)' }),
        icon: <BatteryFull size={24} variant="Bold" />,
        specs: [
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-active-tracking', defaultMessage: 'Active Tracking' }),
            value: '160mA'
          },
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-power-save', defaultMessage: 'Power Save Mode' }),
            value: '10mA'
          },
          { label: intl.formatMessage({ id: 'gosafe-specs-label-deep-sleep', defaultMessage: 'Deep Sleep' }), value: '15μA' }
        ]
      },
      {
        category: intl.formatMessage({ id: 'gosafe-specs-cat-io', defaultMessage: 'Input/Output' }),
        icon: <Cpu size={24} variant="Bold" />,
        specs: [
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-led', defaultMessage: 'LED' }),
            value: '4 LEDs (Power States)'
          },
          { label: intl.formatMessage({ id: 'gosafe-specs-label-digital-io', defaultMessage: 'Digital I/O' }), value: '1' }
        ]
      }
    ];

    const beaconSpecs = [
      {
        category: intl.formatMessage({ id: 'gosafe-specs-cat-id', defaultMessage: 'ID & Cấu trúc' }),
        icon: <Maximize size={24} variant="Bold" />,
        specs: [
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-dimensions', defaultMessage: 'Kích thước' }),
            value: '54.5 × 54.5 × 24 mm'
          },
          { label: intl.formatMessage({ id: 'gosafe-specs-label-material', defaultMessage: 'Chất liệu' }), value: 'ABS' },
          { label: intl.formatMessage({ id: 'gosafe-specs-label-waterproof', defaultMessage: 'Chống nước' }), value: 'IP67' },
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-color', defaultMessage: 'Màu sắc' }),
            value: intl.formatMessage({ id: 'gosafe-specs-value-white', defaultMessage: 'Trắng' })
          },
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-install', defaultMessage: 'Lắp đặt' }),
            value: intl.formatMessage({ id: 'gosafe-specs-value-install', defaultMessage: '3M tape hoặc bắt vít' })
          },
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-button', defaultMessage: 'Nút bấm' }),
            value: intl.formatMessage({ id: 'gosafe-specs-value-none', defaultMessage: 'Không' })
          }
        ]
      },
      {
        category: intl.formatMessage({ id: 'gosafe-specs-cat-electronic', defaultMessage: 'Điện tử' }),
        icon: <Bluetooth size={24} variant="Bold" />,
        specs: [
          { label: intl.formatMessage({ id: 'gosafe-specs-label-bluetooth', defaultMessage: 'Bluetooth' }), value: '5.0' },
          { label: intl.formatMessage({ id: 'gosafe-specs-label-chipset', defaultMessage: 'Chipset' }), value: 'Nordic Series' },
          { label: intl.formatMessage({ id: 'gosafe-specs-label-range', defaultMessage: 'Tầm phát (TX)' }), value: '100 meters' },
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-sensor', defaultMessage: 'Cảm biến' }),
            value: '3D Accelerometer'
          },
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-led', defaultMessage: 'LED' }),
            value: intl.formatMessage({ id: 'gosafe-specs-value-red', defaultMessage: 'Đỏ' })
          }
        ]
      },
      {
        category: intl.formatMessage({ id: 'gosafe-specs-cat-battery', defaultMessage: 'Pin' }),
        icon: <BatteryFull size={24} variant="Bold" />,
        specs: [
          { label: intl.formatMessage({ id: 'gosafe-specs-label-capacity', defaultMessage: 'Dung lượng' }), value: '2400mAh' },
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-replace', defaultMessage: 'Thay thế' }),
            value: intl.formatMessage({ id: 'gosafe-specs-value-yes', defaultMessage: 'Có' })
          },
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-lifespan', defaultMessage: 'Tuổi thọ' }),
            value: intl.formatMessage({ id: 'gosafe-specs-value-years', defaultMessage: 'Lên đến 4 năm' })
          }
        ]
      },
      {
        category: intl.formatMessage({ id: 'gosafe-specs-cat-environment', defaultMessage: 'Môi trường' }),
        icon: <Setting2 size={24} variant="Bold" />,
        specs: [
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-op-temp', defaultMessage: 'Nhiệt độ hoạt động' }),
            value: '-20°C ~ +60°C'
          }
        ]
      },
      {
        category: intl.formatMessage({ id: 'gosafe-specs-cat-features', defaultMessage: 'Tính năng nổi bật' }),
        icon: <ShieldTick size={24} variant="Bold" />,
        specs: [
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-integration', defaultMessage: 'Tích hợp' }),
            value: intl.formatMessage({ id: 'gosafe-specs-value-seamless', defaultMessage: 'Hoạt động liền mạch với thiết bị giám sát' })
          },
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-indoor', defaultMessage: 'Định vị trong nhà' }),
            value: intl.formatMessage({ id: 'gosafe-specs-value-indoor', defaultMessage: 'Indoor location' })
          },
          {
            label: intl.formatMessage({ id: 'gosafe-specs-label-move-alert', defaultMessage: 'Cảnh báo di chuyển' }),
            value: intl.formatMessage({ id: 'gosafe-specs-value-send-g737', defaultMessage: 'Gửi đến thiết bị giám sát' })
          }
        ]
      }
    ];

    return [
      {
        label: intl.formatMessage({ id: 'gosafe-specs-tab-tracker', defaultMessage: 'Electronic Tracker' }),
        icon: <DocumentCode size={20} />,
        data: g737Specs
      },
      {
        label: intl.formatMessage({ id: 'gosafe-specs-tab-powerbank', defaultMessage: 'Power Bank' }),
        icon: <BatteryFull size={20} />,
        data: powerbankSpecs
      },
      {
        label: intl.formatMessage({ id: 'gosafe-specs-tab-beacon', defaultMessage: 'Indoor Beacon' }),
        icon: <Bluetooth size={20} />,
        data: beaconSpecs
      }
    ];
  };

  const tabsData = getTabsData(intl);

  return (
    <Box
      id="specifications"
      sx={{
        py: { xs: 10, md: 16 },
        position: 'relative',
        bgcolor: isDark ? 'transparent' : alpha(secondaryColor, 0.02)
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Stack spacing={2} alignItems="center" textAlign="center" mb={10}>
          {/* gs-badge-pill: inline-flex, align-center, border-radius 100px */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="gs-badge-pill"
            sx={{
              px: 2.5,
              py: 1,
              border: `1px solid ${alpha(primaryColor, 0.2)}`,
              bgcolor: alpha(primaryColor, 0.05)
            }}
          >
            <Setting2 size={16} variant="Bold" color={primaryColor} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: primaryColor, letterSpacing: 1.5 }}>
              <FormattedMessage id="gosafe-specs-header-chip" defaultMessage="SPECIFICATIONS" />
            </Typography>
          </Box>

          <Typography
            component={motion.h2}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 800,
              color: isDark ? '#fff' : '#0f172a'
            }}
          >
            <FormattedMessage id="gosafe-specs-header-title" defaultMessage="Technical Details" />
          </Typography>
        </Stack>

        {/* Custom Tabs */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 8,
            p: 0.75,
            bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
            borderRadius: '100px',
            width: 'fit-content',
            maxWidth: '100%',
            mx: 'auto',
            backdropFilter: 'blur(10px)'
          }}
        >
          {tabsData.map((tab, index) => {
            const isActive = selectedTab === index;
            return (
              <Box
                key={index}
                onClick={() => setSelectedTab(index)}
                sx={{
                  px: { xs: 3, md: 5 },
                  py: 1.5,
                  borderRadius: '50px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: isActive ? primaryColor : 'transparent',
                  color: isActive ? '#fff' : 'text.secondary',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? `0 8px 20px -4px ${alpha(primaryColor, 0.5)}` : 'none',
                  '&:hover': {
                    color: isActive ? '#fff' : primaryColor
                  }
                }}
              >
                {tab.icon}
                <Typography fontWeight={600} variant="body2">
                  {tab.label}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Specs Grid */}
        <Box sx={{ minHeight: 400 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Grid container spacing={3} justifyContent={'center'}>
                {tabsData[selectedTab].data.map((category, catIndex) => (
                  <Grid item xs={12} sm={6} md={4} key={catIndex}>
                    <Box
                      component={motion.div}
                      whileHover={{ y: -5 }}
                      sx={{
                        height: '100%',
                        p: 4,
                        borderRadius: 4,
                        bgcolor: cardBg,
                        border: `1px solid ${borderColor}`,
                        backdropFilter: 'blur(20px)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          boxShadow: `0 20px 40px -10px ${alpha(primaryColor, 0.1)}`,
                          borderColor: alpha(primaryColor, 0.3),
                          '& .icon-bg': {
                            transform: 'scale(1.2) rotate(10deg)',
                            opacity: 0.1
                          }
                        }
                      }}
                    >
                      {/* Background Icon Decoration */}
                      <Box
                        className="icon-bg"
                        sx={{
                          position: 'absolute',
                          right: -20,
                          top: -20,
                          color: primaryColor,
                          opacity: 0.03,
                          transition: 'all 0.5s ease',
                          zIndex: 0
                        }}
                      >
                        {category.icon}
                      </Box>

                      {/* Header */}
                      <Stack direction="row" spacing={2} alignItems="center" mb={3} position="relative" zIndex={1}>
                        <Box
                          sx={{
                            p: 1.2,
                            borderRadius: '12px',
                            bgcolor: alpha(primaryColor, 0.1),
                            color: primaryColor,
                            display: 'flex'
                          }}
                        >
                          {category.icon}
                        </Box>
                        <Typography variant="h6" fontWeight={700} color={isDark ? '#fff' : '#0f172a'}>
                          {category.category}
                        </Typography>
                      </Stack>

                      {/* Specs List */}
                      <Stack spacing={2} position="relative" zIndex={1}>
                        {/* gs-spec-row: flex, space-between, border-top between rows */}
                        {category.specs.map((spec, specIndex) => (
                          <Box
                            key={specIndex}
                            className="gs-spec-row"
                            sx={{
                              alignItems: 'baseline',
                              borderBottom: specIndex !== category.specs.length - 1 ? `1px dashed ${alpha(borderColor, 2)}` : 'none',
                              pb: specIndex !== category.specs.length - 1 ? 1.5 : 0
                            }}
                          >
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: '40%' }}>
                              {spec.label}
                            </Typography>
                            <Typography variant="body2" fontWeight={600} align="right" color={isDark ? '#e2e8f0' : '#334155'}>
                              {spec.value}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </AnimatePresence>
        </Box>
      </Container>
    </Box>
  );
};

export default SpecsSection;
