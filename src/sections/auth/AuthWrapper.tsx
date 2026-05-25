import { Grid, useMediaQuery, useTheme, Box, Typography, Stack } from '@mui/material';
import { ReactNode } from 'react';
import settings, { ENV } from 'settings';
import AuthCard from './AuthCard';
import { ShieldSecurity } from 'iconsax-react';

interface Props {
  children: ReactNode;
}

const AuthWrapper = ({ children }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: theme.palette.mode === 'dark' ? '#020617' : '#f8fafc' }}>
      <style>{`
        @keyframes radar-sweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-dot {
          0% { transform: scale(0.8); opacity: 0.3; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0.3; }
        }
        .radar-container {
          position: relative;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(39, 114, 237, 0.04) 0%, rgba(7, 10, 19, 0.6) 100%);
          overflow: hidden;
        }
        .radar-sweep {
          position: absolute;
          top: 50%;
          left: 50%;
          transform-origin: top left;
          border-radius: 50%;
        }
        .radar-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          border: 1px dashed rgba(39, 114, 237, 0.15);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }
        .radar-cross-h {
          position: absolute;
          top: 50%;
          left: 5%;
          width: 90%;
          height: 1px;
          background: rgba(39, 114, 237, 0.1);
        }
        .radar-cross-v {
          position: absolute;
          left: 50%;
          top: 5%;
          width: 1px;
          height: 90%;
          background: rgba(39, 114, 237, 0.1);
        }
        .radar-blip {
          position: absolute;
          width: 6px;
          height: 6px;
          background-color: #22c55e;
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }
        .radar-blip-violating {
          position: absolute;
          width: 6px;
          height: 6px;
          background-color: #ef4444;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: pulse-dot 1.2s infinite ease-in-out;
        }
        .grid-bg {
          background-size: 24px 24px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
        }
      `}</style>
      <Grid container>
        {!isMobile && (
          <Grid
            item
            md={6}
            sx={{
              p: 6,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              bgcolor: '#05070f',
              color: '#ffffff',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(39, 114, 237, 0.15) 0%, transparent 70%)',
                filter: 'blur(50px)',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 1
              }
            }}
            className="grid-bg"
          >
            {/* Top Bar Logo */}
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ zIndex: 2 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: 'rgba(39, 114, 237, 0.1)',
                  border: '1px solid rgba(39, 114, 237, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldSecurity size={24} color="#2772ed" variant="Bold" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.5, fontSize: '0.95rem', lineHeight: 1.2 }}>
                  GoSafe EMS
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', fontSize: '0.6rem', fontWeight: 600, letterSpacing: 0.8 }}>
                  Electronic Monitoring System
                </Typography>
              </Box>
            </Stack>

            {/* Center Area: Radar Animation + Spacious Typography */}
            <Stack spacing={4} alignItems="center" justifyContent="center" sx={{ my: 'auto', zIndex: 2, textAlign: 'center' }}>
              
              {/* Centered Large Minimalist Radar */}
              <Box className="radar-container" sx={{ width: 180, height: 180, border: '1.5px solid rgba(39, 114, 237, 0.2)', boxShadow: '0 8px 32px rgba(39, 114, 237, 0.1)' }}>
                <Box className="radar-sweep" sx={{ width: 180, height: 180, marginTop: -90, marginLeft: -90, background: 'conic-gradient(from 0deg, rgba(39, 114, 237, 0.25) 0deg, rgba(39, 114, 237, 0) 120deg)', animation: 'radar-sweep 5s linear infinite' }} />
                <Box className="radar-circle" sx={{ width: '50px', height: '50px' }} />
                <Box className="radar-circle" sx={{ width: '100px', height: '100px' }} />
                <Box className="radar-circle" sx={{ width: '150px', height: '150px' }} />
                <Box className="radar-cross-h" />
                <Box className="radar-cross-v" />
                
                {/* Minimalist Blips */}
                <Box className="radar-blip" sx={{ top: '35%', left: '30%', boxShadow: '0 0 10px #22c55e' }} />
                <Box className="radar-blip" sx={{ top: '65%', left: '70%', boxShadow: '0 0 10px #22c55e' }} />
                <Box className="radar-blip-violating" sx={{ top: '45%', left: '60%', boxShadow: '0 0 12px #ef4444' }} />
              </Box>

              <Stack spacing={1.5} sx={{ maxWidth: '420px' }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    fontSize: '1.65rem',
                    lineHeight: 1.3,
                    background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Giám sát Định vị Ankle Tracker
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  Giải pháp công nghệ quản lý, định vị thời gian thực và tự động phát hiện cảnh báo vi phạm của phạm nhân thi hành án ngoài cộng đồng.
                </Typography>
              </Stack>
            </Stack>

            {/* Bottom Status Info (minimalist footer) */}
            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ zIndex: 2, color: 'rgba(255, 255, 255, 0.4)' }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 6, height: 6, bgcolor: '#22c55e', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
                Hệ thống trực tuyến
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>|</Typography>
              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                Phiên bản 1.0.2
              </Typography>
            </Stack>
          </Grid>
        )}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 3, sm: 6, md: 10 }
          }}
        >
          <AuthCard>
            <div className="text-center">
              <img
                src={settings.logoDefault}
                alt="VTC Telecom"
                style={{
                  marginBottom: ENV === 'staging' ? '24px' : ''
                }}
              />
            </div>
            {children}
          </AuthCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AuthWrapper;
