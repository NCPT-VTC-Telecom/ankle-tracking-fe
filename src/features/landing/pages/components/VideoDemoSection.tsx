import { Box, Container, Grid, Stack, Typography, alpha, keyframes, useTheme } from '@mui/material';
import { ChartSquare, MirroringScreen, PlayCircle, Shield } from 'iconsax-react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import dashboardImage from 'assets/images/dashboard.png'; // Ảnh bìa video

// --- Animations ---
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0px rgba(255, 255, 255, 0.3); }
  100% { box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }
`;

interface VideoDemoSectionProps {
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const VideoDemoSection = ({ isDark, primaryColor, secondaryColor }: VideoDemoSectionProps) => {
  const theme = useTheme();
  const [isPlaying, setIsPlaying] = useState(false); // State để kiểm soát việc phát video

  // ID video YouTube (Thay ID video của bạn vào đây)
  // Ví dụ: https://www.youtube.com/watch?v=mkK7PhO1WY8 -> ID là "mkK7PhO1WY8"
  const videoId = 'JL_AUSdqwg4';

  // Style constants
  const dotColor = isDark ? '#333' : '#e5e5e5';

  return (
    <Box
      sx={{
        py: { xs: 10, md: 16 },
        position: 'relative',
        bgcolor: isDark ? 'transparent' : alpha(primaryColor, 0.02),
        backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
        backgroundSize: '32px 32px'
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={6} alignItems="center">
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
              <Typography variant="caption" sx={{ fontWeight: 700, color: primaryColor, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                WATCH DEMO
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
              <FormattedMessage id="landing.demo.title" defaultMessage="Trải nghiệm sức mạnh thực tế" />
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: '1.1rem' }}>
              <FormattedMessage
                id="landing.demo.subtitle"
                defaultMessage="Chỉ mất 2 phút để thấy cách WiFi Digital thay đổi hoàn toàn việc quản trị mạng của bạn."
              />
            </Typography>
          </Stack>

          {/* --- MACBOOK FRAME CONTAINER --- */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 1000,
              mx: 'auto',
              mt: 4
            }}
          >
            {/* Camera Dot */}
            <Box
              sx={{
                position: 'absolute',
                top: '1.5%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: '#333',
                zIndex: 10
              }}
            />

            {/* Video Area */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16/9',
                bgcolor: '#000',
                borderRadius: 2,
                overflow: 'hidden',
                cursor: isPlaying ? 'default' : 'pointer',
                '&:hover .play-btn': { transform: !isPlaying ? 'translate(-50%, -50%) scale(1.1)' : 'translate(-50%, -50%)' },
                '&:hover .overlay': { opacity: !isPlaying ? 0.4 : 0 }
              }}
              onClick={() => setIsPlaying(true)}
            >
              {!isPlaying ? (
                // 1. TRẠNG THÁI CHỜ: Hiển thị Ảnh bìa + Nút Play
                <>
                  <img
                    src={dashboardImage}
                    alt="Demo Video Thumbnail"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                  />

                  {/* Dark Overlay */}
                  <Box
                    className="overlay"
                    sx={{ position: 'absolute', inset: 0, bgcolor: '#000', opacity: 0.2, transition: 'opacity 0.3s' }}
                  />

                  {/* Play Button */}
                  <Box
                    className="play-btn"
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      zIndex: 2
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.3)',
                        animation: `${pulse} 2s infinite`
                      }}
                    >
                      <PlayCircle size={40} variant="Bold" color="#fff" />
                    </Box>
                  </Box>
                </>
              ) : (
                // 2. TRẠNG THÁI PLAY: Hiển thị Iframe YouTube
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ borderRadius: 8 }}
                ></iframe>
              )}
            </Box>
          </Box>

          {/* Laptop Base (Keyboard area) */}
          <Box
            sx={{
              height: { xs: 12, md: 20 },
              bgcolor: '#e2e2e2', // Aluminum color
              background: `linear-gradient(to bottom, #e2e2e2 0%, #d1d1d1 100%)`,
              borderRadius: '0 0 24px 24px',
              position: 'relative',
              zIndex: 1,
              // Notch for opening
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '15%',
                height: 6,
                bgcolor: '#a0a0a0',
                borderRadius: '0 0 6px 6px'
              }
            }}
          />
          {/* Shadow under laptop */}
          <Box
            sx={{
              height: 10,
              width: '90%',
              mx: 'auto',
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, transparent 70%)',
              filter: 'blur(10px)'
            }}
          />

          {/* --- Feature Highlights (Clean Row) --- */}
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 4 }}>
            {[
              {
                icon: <ChartSquare size={28} variant="Bold" color={secondaryColor} />,
                titleKey: 'landing.demo.features.dashboard.title',
                titleDefault: 'Dashboard Real-time',
                descKey: 'landing.demo.features.dashboard.desc',
                descDefault: 'Giám sát toàn bộ hệ thống'
              },
              {
                icon: <MirroringScreen size={28} variant="Bold" color={secondaryColor} />,
                titleKey: 'landing.demo.features.marketing.title',
                titleDefault: 'WiFi Marketing',
                descKey: 'landing.demo.features.marketing.desc',
                descDefault: 'Tăng engagement 300%'
              },
              {
                icon: <Shield size={28} variant="Bold" color={secondaryColor} />,
                titleKey: 'landing.demo.features.security.title',
                titleDefault: 'Bảo mật ISO 27001',
                descKey: 'landing.demo.features.security.desc',
                descDefault: 'An toàn tuyệt đối'
              }
            ].map((item, index) => (
              <Grid
                item
                xs={12}
                sm={4}
                md={3}
                key={index}
                sx={{
                  px: { xs: 3, md: 0 }
                }}
              >
                <Stack
                  alignItems="center"
                  spacing={1.5}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    transition: 'all 0.3s',
                    '&:hover': { bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02) }
                  }}
                >
                  <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: alpha(secondaryColor, 0.1) }}>{item.icon}</Box>
                  <Box textAlign="center">
                    <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                      <FormattedMessage id={item.titleKey} defaultMessage={item.titleDefault} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <FormattedMessage id={item.descKey} defaultMessage={item.descDefault} />
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
};

export default VideoDemoSection;
