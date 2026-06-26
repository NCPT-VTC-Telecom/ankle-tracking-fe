import { Box, Container, Fade, Grid, Stack, Typography, alpha, useTheme } from '@mui/material';
import { ChartCircle } from 'iconsax-react'; // Import icon ví dụ
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

// --- Interface ---
interface UseCase {
  titleKey: string;
  titleDefault: string;
  descKey: string;
  descDefault: string;
  metricsKey: string;
  metricsDefault: string;
  icon?: React.ReactNode; // Optional icon
  imageUrl?: string; // Optional image url override
}

interface SolutionsSectionProps {
  useCases: UseCase[];
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const SolutionsSection = ({ useCases, isDark, primaryColor, secondaryColor }: SolutionsSectionProps) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  // Styling constants
  const borderColor = isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08);
  const activeBg = isDark ? alpha(primaryColor, 0.15) : alpha(primaryColor, 0.05);
  const dotColor = isDark ? '#333' : '#e5e5e5';

  return (
    <Box
      id="solutions"
      sx={{
        py: { xs: 10, md: 16 },
        position: 'relative',
        bgcolor: isDark ? 'transparent' : alpha(secondaryColor, 0.02),
        // Dot pattern background
        backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
        backgroundSize: '32px 32px'
      }}
    >
      <Container maxWidth="lg">
        {/* --- Section Header --- */}
        <Stack spacing={3} sx={{ mb: 8, textAlign: { xs: 'center', md: 'left' }, maxWidth: 800 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
            <Box sx={{ width: 40, height: 2, bgcolor: primaryColor }} />
            <Typography variant="caption" fontWeight={700} color={primaryColor} letterSpacing={1} textTransform="uppercase">
              <FormattedMessage id="landing.solutions.badge" defaultMessage="Industry Solutions" />
            </Typography>
          </Box>
          <Typography
            component="h2"
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 800,
              color: theme.palette.text.primary,
              lineHeight: 1.2
            }}
          >
            <FormattedMessage id="landing.solutions.title" defaultMessage="Giải pháp chuyên biệt cho từng mô hình" />
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: '1.15rem', lineHeight: 1.6 }}>
            <FormattedMessage
              id="landing.solutions.subtitle"
              defaultMessage="Chúng tôi hiểu rằng mỗi ngành nghề có những thách thức riêng. Hệ thống được thiết kế để giải quyết chính xác các bài toán của bạn."
            />
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
          {/* --- LEFT: Interactive List --- */}
          <Grid item xs={12} md={5}>
            <Stack spacing={1}>
              {useCases.map((useCase, index) => {
                const isActive = activeStep === index;
                return (
                  <Box
                    key={index}
                    onClick={() => setActiveStep(index)}
                    onMouseEnter={() => setActiveStep(index)} // Desktop hover trigger
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: `1px solid ${isActive ? primaryColor : 'transparent'}`,
                      bgcolor: isActive ? activeBg : 'transparent',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        bgcolor: isActive ? activeBg : alpha(primaryColor, 0.02)
                      }
                    }}
                  >
                    {/* Decoration Bar for active item */}
                    {isActive && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 4,
                          bgcolor: primaryColor,
                          borderRadius: '4px 0 0 4px'
                        }}
                      />
                    )}

                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      {/* Icon */}
                      <Box
                        sx={{
                          color: isActive ? primaryColor : theme.palette.text.disabled,
                          transition: 'color 0.3s',
                          mt: 0.5,
                          fontSize: '24px'
                        }}
                      >
                        {useCase.icon}
                      </Box>

                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: isActive ? theme.palette.text.primary : theme.palette.text.secondary,
                            mb: 0.5,
                            transition: 'color 0.3s'
                          }}
                        >
                          <FormattedMessage id={useCase.titleKey} defaultMessage={useCase.titleDefault} />
                        </Typography>

                        {/* Mô tả chỉ hiện rõ khi Active */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            lineHeight: 1.6,
                            display: { xs: 'block', md: isActive ? 'block' : 'none' }, // Mobile hiện hết, Desktop chỉ hiện khi active cho gọn
                            opacity: isActive ? 1 : 0.7
                          }}
                        >
                          <FormattedMessage id={useCase.descKey} defaultMessage={useCase.descDefault} />
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Grid>

          {/* --- RIGHT: Visual Preview Area (Image from Unsplash) --- */}
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                position: 'relative',
                height: { xs: 300, md: 500 },
                width: '100%',
                perspective: '1000px'
              }}
            >
              {/* Dùng map để render tất cả ảnh nhưng chỉ Fade in ảnh đang active */}
              {useCases.map((useCase, index) => (
                <Fade in={activeStep === index} timeout={500} key={index} unmountOnExit>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      p: 2
                    }}
                  >
                    {/* Main Image Container */}
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        borderRadius: 5,
                        overflow: 'hidden',
                        boxShadow: isDark ? `0 20px 50px ${alpha('#000', 0.5)}` : `0 30px 60px ${alpha(primaryColor, 0.15)}`,
                        border: `1px solid ${borderColor}`,
                        bgcolor: isDark ? '#1e1e1e' : '#fff'
                      }}
                    >
                      <img
                        src={useCase.imageUrl}
                        alt={useCase.titleDefault}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        // Fallback nếu ảnh lỗi
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.style.backgroundColor = '#ccc';
                        }}
                      />

                      {/* Gradient Overlay: Để text bên dưới dễ đọc hơn */}
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background: `linear-gradient(to top, ${alpha('#000', 0.8)} 0%, transparent 50%)`
                        }}
                      />

                      {/* Floating Impact Card (Metrics) - Thẻ hiển thị hiệu quả */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 30,
                          left: 30,
                          right: 30,
                          p: 2.5,
                          borderRadius: 3,
                          bgcolor: 'rgba(255, 255, 255, 0.15)', // Glass effect
                          backdropFilter: 'blur(15px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2
                        }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            bgcolor: '#fff',
                            color: primaryColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <ChartCircle variant="Bold" size={24} />
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ color: alpha('#fff', 0.8), fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}
                          >
                            <FormattedMessage id="landing.solutions.impact" defaultMessage="Hiệu quả thực tế" />
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
                            <FormattedMessage id={useCase.metricsKey} defaultMessage={useCase.metricsDefault} />
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Fade>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SolutionsSection;
