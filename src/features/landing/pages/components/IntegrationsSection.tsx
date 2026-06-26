import { Box, Container, Grid, Stack, Typography, alpha, useTheme } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion'; // Import thêm Framer Motion
import { CloudConnection, Data, Flash, FolderConnection, Setting2 } from 'iconsax-react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface Partner {
  name: string;
  logo: string;
  description: string;
}

interface IntegrationCategory {
  categoryKey: string;
  categoryDefault: string;
  descKey: string;
  descDefault: string;
  partners: Partner[];
}

interface IntegrationsSectionProps {
  integrations: IntegrationCategory[];
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const IntegrationsSection = ({ integrations, isDark, primaryColor, secondaryColor }: IntegrationsSectionProps) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const activeCategory = integrations[activeTab];

  // Style constants
  const windowBg = isDark ? '#0f172a' : '#fff';
  const borderColor = isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08);
  const activeBlockBg = isDark ? alpha(primaryColor, 0.1) : alpha(primaryColor, 0.04);
  const dotColor = isDark ? '#333' : '#e5e5e5';

  // Helper icons
  const getIcon = (index: number) => {
    const icons = [
      <CloudConnection variant="Bold" />,
      <Data variant="Bold" />,
      <FolderConnection variant="Bold" />,
      <Setting2 variant="Bold" />
    ];
    return icons[index % icons.length];
  };

  return (
    <Box
      id="integrations"
      sx={{
        py: { xs: 10, md: 14 },
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
        bgcolor: isDark ? 'transparent' : '#F8F9FC'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={8} alignItems="center">
          {/* --- LEFT SIDE: NAVIGATION BLOCKS --- */}
          <Grid item xs={12} md={5}>
            <Stack spacing={4}>
              <Box>
                <Typography variant="overline" fontWeight={800} color={primaryColor} letterSpacing={1.5}>
                  <FormattedMessage id="landing.integrations.badge" defaultMessage="INTEGRATIONS" />
                </Typography>
                <Typography variant="h3" fontWeight={800} sx={{ color: theme.palette.text.primary, mt: 1, mb: 2 }}>
                  <FormattedMessage id="landing.integrations.title" defaultMessage="Siêu kết nối." />
                </Typography>
                <Typography sx={{ color: theme.palette.text.secondary, fontSize: '1.1rem', lineHeight: 1.6 }}>
                  <FormattedMessage
                    id="landing.integrations.subtitle"
                    defaultMessage="Tự động hóa quy trình của bạn bằng cách kết nối WiFi Digital với các công cụ hàng đầu."
                  />
                </Typography>
              </Box>

              <Stack spacing={2}>
                {integrations.map((cat, index) => {
                  const isActive = activeTab === index;
                  return (
                    <Box
                      key={index}
                      onClick={() => setActiveTab(index)}
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        cursor: 'pointer',
                        border: `1px solid ${isActive ? primaryColor : 'transparent'}`,
                        bgcolor: isActive ? activeBlockBg : 'transparent',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          bgcolor: isActive ? activeBlockBg : alpha(theme.palette.text.primary, 0.03)
                        }
                      }}
                    >
                      {/* Active Indicator Line */}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator" // Framer Motion magic: đường kẻ trượt mượt mà giữa các mục
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: '15%',
                            bottom: '15%',
                            width: 4,
                            backgroundColor: primaryColor,
                            borderRadius: '0 4px 4px 0'
                          }}
                        />
                      )}

                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 3,
                            bgcolor: isActive ? primaryColor : alpha(theme.palette.text.secondary, 0.1),
                            color: isActive ? '#fff' : theme.palette.text.secondary,
                            transition: 'all 0.3s'
                          }}
                        >
                          {getIcon(index)}
                        </Box>
                        <Box>
                          <Typography variant="h6" fontWeight={700} color={isActive ? 'text.primary' : 'text.secondary'}>
                            <FormattedMessage id={cat.categoryKey} defaultMessage={cat.categoryDefault} />
                          </Typography>

                          {/* Expandable Description using AnimatePresence for smoothness */}
                          <AnimatePresence>
                            {isActive && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                style={{ overflow: 'hidden' }}
                              >
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                  <FormattedMessage id={cat.descKey} defaultMessage={cat.descDefault} />
                                </Typography>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Box>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Stack>
          </Grid>

          {/* --- RIGHT SIDE: MOCKUP WINDOW --- */}
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                position: 'relative',
                height: 'auto',
                perspective: '1500px'
              }}
            >
              {/* The Window */}
              <Box
                sx={{
                  height: '100%',
                  bgcolor: windowBg,
                  borderRadius: 4,
                  border: `1px solid ${borderColor}`,
                  boxShadow: isDark ? `0 30px 60px ${alpha('#000', 0.5)}` : `0 30px 60px -10px ${alpha('#000', 0.15)}`,
                  overflow: 'hidden',
                  transform: 'rotateY(-12deg) rotateX(5deg)',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.5s ease',
                  '&:hover': {
                    transform: 'rotateY(0deg) rotateX(0deg)'
                  }
                }}
              >
                {/* Window Header */}
                <Box
                  sx={{
                    bgcolor: alpha(theme.palette.background.default, 0.6),
                    p: 2,
                    borderBottom: `1px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ff5f56' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#27c93f' }} />
                  <Box sx={{ flex: 1, ml: 2, bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05), height: 24, borderRadius: 1 }} />
                </Box>

                {/* Window Content with AnimatePresence */}
                <Box
                  sx={{
                    bgcolor: alpha(theme.palette.background.default, 0.6),
                    p: 3,
                    height: 'calc(100% - 60px)',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                  }}
                >
                  {/* KEY CHANGE: Dùng AnimatePresence mode="wait" 
                      Để content cũ biến mất hoàn toàn rồi content mới mới hiện ra 
                  */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab} // Key thay đổi sẽ trigger animation
                      initial={{ opacity: 0, x: 20 }} // Bắt đầu: Mờ và dịch sang phải
                      animate={{ opacity: 1, x: 0 }} // Kết thúc: Rõ và về vị trí chuẩn
                      exit={{ opacity: 0, x: -20 }} // Thoát: Mờ và dịch sang trái
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <Stack spacing={2}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          color="text.secondary"
                          sx={{ textTransform: 'uppercase', fontSize: '0.875rem', mb: 1 }}
                        >
                          <FormattedMessage 
                            id="landing.integrations.available.apps" 
                            defaultMessage="Available {category} Apps" 
                            values={{ category: activeCategory.categoryDefault }}
                          />
                        </Typography>

                        {activeCategory.partners.map((partner, i) => (
                          <Box
                            key={i}
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              border: `1px solid ${borderColor}`,
                              bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: primaryColor,
                                bgcolor: isDark ? alpha(primaryColor, 0.05) : alpha('#fff', 1),
                                boxShadow: `0 4px 20px ${alpha(primaryColor, 0.1)}`
                              }
                            }}
                          >
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Box
                                sx={{
                                  width: 56,
                                  height: 56,
                                  borderRadius: 999,
                                  bgcolor: '#fff',
                                  border: `1px solid ${alpha('#000', 0.08)}`,
                                  p: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <img
                                  src={partner.logo}
                                  alt={partner.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                  onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                                />
                              </Box>
                              <Box>
                                <Typography variant="subtitle1" fontWeight={700}>
                                  {partner.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                                >
                                  {partner.description}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </motion.div>
                  </AnimatePresence>
                </Box>
              </Box>

              {/* Floating Elements (Decor) */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 40,
                  right: -20,
                  p: 2,
                  bgcolor: primaryColor,
                  borderRadius: 3,
                  color: '#fff',
                  boxShadow: `0 20px 40px ${alpha(primaryColor, 0.4)}`,
                  transform: 'rotateZ(10deg) translateZ(50px)',
                  zIndex: 2
                }}
              >
                <Flash variant="Bold" size={28} />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default IntegrationsSection;
