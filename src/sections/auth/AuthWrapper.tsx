import { Grid, useMediaQuery, useTheme, Box, Typography, Stack } from '@mui/material';
import { ReactNode } from 'react';
import settings, { ENV } from 'settings';
import AuthCard from './AuthCard';
import { ShieldSecurity, Location, Eye, Notification } from 'iconsax-react';

interface Props {
  children: ReactNode;
}

const FEATURES = [
  {
    icon: <Location size={18} color="#60a5fa" variant="Bold" />,
    label: 'Định vị GPS',
    desc: 'Thời gian thực'
  },
  {
    icon: <Eye size={18} color="#60a5fa" variant="Bold" />,
    label: 'Giám sát',
    desc: '24/7 liên tục'
  },
  {
    icon: <Notification size={18} color="#60a5fa" variant="Bold" />,
    label: 'Cảnh báo',
    desc: 'Tự động tức thời'
  }
];

const AuthWrapper = ({ children }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: theme.palette.mode === 'dark' ? '#020617' : '#f1f5f9' }}>
      <style>{`
        @keyframes radar-sweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-dot {
          0% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.4; }
          50% { transform: translate(-50%, -50%) scale(1.6); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.4; }
        }
        @keyframes blink-green {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .radar-container {
          position: relative;
          border-radius: 50%;
          background: radial-gradient(circle at 50% 50%, rgba(29, 78, 216, 0.1) 0%, rgba(3, 7, 18, 0.85) 100%);
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
          border: 1px dashed rgba(29, 78, 216, 0.22);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }
        .radar-axis {
          position: absolute;
          background: rgba(29, 78, 216, 0.12);
        }
        .radar-blip {
          position: absolute;
          width: 7px;
          height: 7px;
          background: #22c55e;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.3), 0 0 12px rgba(34, 197, 94, 0.6);
          animation: blink-green 3s infinite ease-in-out;
        }
        .radar-blip-alert {
          position: absolute;
          width: 7px;
          height: 7px;
          background: #ef4444;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3), 0 0 12px rgba(239, 68, 68, 0.6);
          animation: pulse-dot 1.3s infinite ease-in-out;
        }
        .grid-bg {
          background-size: 28px 28px;
          background-image:
            linear-gradient(to right, rgba(255, 255, 255, 0.016) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.016) 1px, transparent 1px);
        }
      `}</style>

      <Grid container sx={{ flex: 1 }}>
        {/* ── Left panel ── */}
        {!isMobile && (
          <Grid
            item
            md={6}
            sx={{
              p: 5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              bgcolor: '#040a14',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              borderRight: '1px solid rgba(29, 78, 216, 0.1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '42%',
                left: '50%',
                width: 480,
                height: 480,
                background: 'radial-gradient(circle, rgba(29, 78, 216, 0.14) 0%, transparent 70%)',
                filter: 'blur(64px)',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 1
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 180,
                background: 'linear-gradient(to top, rgba(29, 78, 216, 0.07), transparent)',
                pointerEvents: 'none',
                zIndex: 1
              }
            }}
            className="grid-bg"
          >
            {/* Brand header */}
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ zIndex: 2 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: 'rgba(29, 78, 216, 0.14)',
                  border: '1px solid rgba(29, 78, 216, 0.28)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldSecurity size={22} color="#60a5fa" variant="Bold" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.2, color: '#f1f5f9', letterSpacing: 0.4 }}>
                  GoSafe EMS
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.57rem', fontWeight: 600, letterSpacing: 1.4, textTransform: 'uppercase' }}>
                  Electronic Monitoring System
                </Typography>
              </Box>
            </Stack>

            {/* Center: Radar + Text + Features */}
            <Stack spacing={4} alignItems="center" sx={{ my: 'auto', zIndex: 2, textAlign: 'center' }}>
              {/* Radar */}
              <Box sx={{ position: 'relative' }}>
                {/* Outer decorative ring */}
                <Box sx={{
                  position: 'absolute', top: '50%', left: '50%',
                  width: 282, height: 282, borderRadius: '50%',
                  border: '1px solid rgba(29, 78, 216, 0.1)',
                  transform: 'translate(-50%, -50%)', pointerEvents: 'none'
                }} />
                <Box className="radar-container" sx={{
                  width: 252, height: 252,
                  border: '1.5px solid rgba(29, 78, 216, 0.28)',
                  boxShadow: '0 0 48px rgba(29, 78, 216, 0.18), inset 0 0 48px rgba(29, 78, 216, 0.05)'
                }}>
                  {/* Sweep */}
                  <Box className="radar-sweep" sx={{
                    width: 252, height: 252,
                    marginTop: -126, marginLeft: -126,
                    background: 'conic-gradient(from 0deg, rgba(29,78,216,0.32) 0deg, rgba(29,78,216,0.08) 70deg, transparent 150deg)',
                    animation: 'radar-sweep 3.8s linear infinite'
                  }} />
                  {/* Circles */}
                  <Box className="radar-circle" sx={{ width: 64, height: 64 }} />
                  <Box className="radar-circle" sx={{ width: 128, height: 128 }} />
                  <Box className="radar-circle" sx={{ width: 192, height: 192 }} />
                  {/* Axes */}
                  <Box className="radar-axis" sx={{ top: '50%', left: '5%', width: '90%', height: 1, transform: 'translateY(-50%)' }} />
                  <Box className="radar-axis" sx={{ left: '50%', top: '5%', width: 1, height: '90%', transform: 'translateX(-50%)' }} />
                  {/* Blips */}
                  <Box className="radar-blip" sx={{ top: '28%', left: '24%' }} />
                  <Box className="radar-blip" sx={{ top: '70%', left: '68%' }} />
                  <Box className="radar-blip" sx={{ top: '58%', left: '36%' }} />
                  <Box className="radar-blip-alert" sx={{ top: '40%', left: '64%' }} />
                </Box>
              </Box>

              {/* Title & Description */}
              <Stack spacing={1.5} sx={{ maxWidth: 380 }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: '1.55rem',
                    lineHeight: 1.3,
                    letterSpacing: 0.2,
                    background: 'linear-gradient(135deg, #ffffff 25%, #93c5fd 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Hệ thống Giám sát<br />Điện tử EMS
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.83rem', lineHeight: 1.68 }}>
                  Quản lý, định vị thời gian thực và tự động phát hiện cảnh báo vi phạm của phạm nhân thi hành án ngoài cộng đồng.
                </Typography>
              </Stack>

              {/* Feature badges */}
              <Stack direction="row" spacing={1.5} sx={{ width: '100%', maxWidth: 380 }}>
                {FEATURES.map((f, i) => (
                  <Box
                    key={i}
                    sx={{
                      flex: 1,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'rgba(29, 78, 216, 0.07)',
                      border: '1px solid rgba(29, 78, 216, 0.18)',
                      textAlign: 'center',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    <Box sx={{ mb: 0.75, display: 'flex', justifyContent: 'center' }}>{f.icon}</Box>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#e2e8f0', lineHeight: 1.3 }}>{f.label}</Typography>
                    <Typography sx={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.38)', mt: 0.3 }}>{f.desc}</Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>

            {/* Footer status */}
            <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center" sx={{ zIndex: 2 }}>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Box sx={{ width: 6, height: 6, bgcolor: '#22c55e', borderRadius: '50%', flexShrink: 0, boxShadow: '0 0 6px rgba(34,197,94,0.8)' }} />
                <Typography sx={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.35)' }}>Hệ thống trực tuyến</Typography>
              </Stack>
              <Typography sx={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.18)' }}>•</Typography>
              <Typography sx={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.35)' }}>Phiên bản 1.0.2</Typography>
            </Stack>
          </Grid>
        )}

        {/* ── Right panel (form) ── */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 3, sm: 6, md: 8 },
            bgcolor: theme.palette.mode === 'dark' ? '#020617' : '#f1f5f9'
          }}
        >
          <AuthCard>
            <Box sx={{ textAlign: 'center', mb: 1 }}>
              <img
                src={settings.logoDefault}
                alt="VNPT VTC Telecom"
                style={{ marginBottom: ENV === 'staging' ? '24px' : '' }}
              />
            </Box>
            {children}
          </AuthCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AuthWrapper;
