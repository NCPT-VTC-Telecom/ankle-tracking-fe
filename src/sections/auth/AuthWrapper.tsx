import { Grid, useMediaQuery, useTheme, Box, Typography, Stack, Chip } from '@mui/material';
import { ReactNode } from 'react';
import settings, { ENV } from 'settings';
import AuthCard from './AuthCard';
import { ShieldSecurity, Location, Eye, Notification, Shield, Lock1 } from 'iconsax-react';

interface Props {
  children: ReactNode;
}

const FEATURES = [
  {
    icon: <Location size={20} color="#60a5fa" variant="Bold" />,
    label: 'Định vị GPS',
    desc: 'Thời gian thực',
    accent: '#3b82f6'
  },
  {
    icon: <Eye size={20} color="#34d399" variant="Bold" />,
    label: 'Giám sát',
    desc: '24/7 liên tục',
    accent: '#10b981'
  },
  {
    icon: <Notification size={20} color="#f59e0b" variant="Bold" />,
    label: 'Cảnh báo',
    desc: 'Tự động tức thời',
    accent: '#f59e0b'
  }
];

const STATS = [
  { value: '99.9%', label: 'Uptime' },
  { value: '<1s', label: 'Độ trễ' },
  { value: '256-bit', label: 'Mã hóa' }
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
        @keyframes float-up {
          0% { transform: translateY(0px); opacity: 0.7; }
          50% { transform: translateY(-10px); opacity: 1; }
          100% { transform: translateY(0px); opacity: 0.7; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes status-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
          50% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }
        .radar-container {
          position: relative;
          border-radius: 50%;
          background: radial-gradient(circle at 50% 50%, rgba(29, 78, 216, 0.12) 0%, rgba(3, 7, 18, 0.9) 100%);
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
          border: 1px dashed rgba(29, 78, 216, 0.2);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }
        .radar-axis {
          position: absolute;
          background: rgba(29, 78, 216, 0.1);
        }
        .radar-blip {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.25), 0 0 16px rgba(34, 197, 94, 0.7);
          animation: blink-green 2.5s infinite ease-in-out;
        }
        .radar-blip-alert {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25), 0 0 16px rgba(239, 68, 68, 0.7);
          animation: pulse-dot 1.2s infinite ease-in-out;
        }
        .grid-bg {
          background-size: 32px 32px;
          background-image:
            linear-gradient(to right, rgba(255, 255, 255, 0.018) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
        }
        .shimmer-text {
          background: linear-gradient(90deg, #ffffff 25%, #93c5fd 50%, #ffffff 75%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
        .float-badge {
          animation: float-up 4s ease-in-out infinite;
        }
        .float-badge-2 {
          animation: float-up 4s ease-in-out infinite 1s;
        }
        .status-dot {
          animation: status-pulse 2s infinite;
        }
      `}</style>

      <Grid container sx={{ flex: 1 }}>
        {/* ── LEFT PANEL ── */}
        {!isMobile && (
          <Grid
            item
            md={6}
            sx={{
              p: 5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              bgcolor: '#030c1a',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              borderRight: '1px solid rgba(29, 78, 216, 0.12)',
              // Layered glows
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '35%',
                left: '50%',
                width: 560,
                height: 560,
                background: 'radial-gradient(circle, rgba(29, 78, 216, 0.18) 0%, transparent 65%)',
                filter: 'blur(80px)',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 0
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 200,
                background: 'linear-gradient(to top, rgba(29, 78, 216, 0.08), transparent)',
                pointerEvents: 'none',
                zIndex: 0
              }
            }}
            className="grid-bg"
          >
            {/* Decorative corner accent */}
            <Box sx={{
              position: 'absolute', top: 0, right: 0,
              width: 180, height: 180,
              background: 'radial-gradient(circle at top right, rgba(99,102,241,0.12) 0%, transparent 70%)',
              zIndex: 0
            }} />

            {/* ─ Brand header ─ */}
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ zIndex: 2, position: 'relative' }}>
              <Box sx={{
                p: 1.1,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(29, 78, 216, 0.3), rgba(99, 102, 241, 0.2))',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(29,78,216,0.25)'
              }}>
                <ShieldSecurity size={24} color="#818cf8" variant="Bold" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.2, color: '#f8fafc', letterSpacing: 0.5 }}>
                  GoSafe EMS
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.58rem', fontWeight: 600, letterSpacing: 1.6, textTransform: 'uppercase' }}>
                  Electronic Monitoring System
                </Typography>
              </Box>

              {/* Live indicator */}
              <Box sx={{ ml: 'auto !important', display: 'flex', alignItems: 'center', gap: 0.75,
                px: 1.5, py: 0.5, borderRadius: 20,
                bgcolor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <Box className="status-dot" sx={{ width: 7, height: 7, bgcolor: '#22c55e', borderRadius: '50%' }} />
                <Typography sx={{ fontSize: '0.62rem', color: '#86efac', fontWeight: 600, letterSpacing: 0.5 }}>LIVE</Typography>
              </Box>
            </Stack>

            {/* ─ Center block ─ */}
            <Stack spacing={4.5} alignItems="center" sx={{ my: 'auto', zIndex: 2, position: 'relative', textAlign: 'center' }}>

              {/* Radar with floating badges */}
              <Box sx={{ position: 'relative' }}>
                {/* Outer decorative rings */}
                <Box sx={{
                  position: 'absolute', top: '50%', left: '50%',
                  width: 310, height: 310, borderRadius: '50%',
                  border: '1px solid rgba(29, 78, 216, 0.08)',
                  transform: 'translate(-50%, -50%)', pointerEvents: 'none'
                }} />
                <Box sx={{
                  position: 'absolute', top: '50%', left: '50%',
                  width: 345, height: 345, borderRadius: '50%',
                  border: '1px solid rgba(29, 78, 216, 0.04)',
                  transform: 'translate(-50%, -50%)', pointerEvents: 'none'
                }} />

                {/* Radar */}
                <Box className="radar-container" sx={{
                  width: 268, height: 268,
                  border: '1.5px solid rgba(29, 78, 216, 0.32)',
                  boxShadow: '0 0 60px rgba(29, 78, 216, 0.2), inset 0 0 60px rgba(29, 78, 216, 0.06)'
                }}>
                  <Box className="radar-sweep" sx={{
                    width: 268, height: 268,
                    marginTop: -134, marginLeft: -134,
                    background: 'conic-gradient(from 0deg, rgba(29,78,216,0.38) 0deg, rgba(29,78,216,0.1) 60deg, transparent 130deg)',
                    animation: 'radar-sweep 3.5s linear infinite'
                  }} />
                  <Box className="radar-circle" sx={{ width: 72, height: 72 }} />
                  <Box className="radar-circle" sx={{ width: 144, height: 144 }} />
                  <Box className="radar-circle" sx={{ width: 210, height: 210 }} />
                  <Box className="radar-axis" sx={{ top: '50%', left: '5%', width: '90%', height: 1, transform: 'translateY(-50%)' }} />
                  <Box className="radar-axis" sx={{ left: '50%', top: '5%', width: 1, height: '90%', transform: 'translateX(-50%)' }} />
                  {/* Blips */}
                  <Box className="radar-blip" sx={{ top: '27%', left: '23%', animationDelay: '0s' }} />
                  <Box className="radar-blip" sx={{ top: '72%', left: '67%', animationDelay: '0.8s' }} />
                  <Box className="radar-blip" sx={{ top: '56%', left: '34%', animationDelay: '1.4s' }} />
                  <Box className="radar-blip-alert" sx={{ top: '38%', left: '65%' }} />
                </Box>

                {/* Floating status badges */}
                <Box className="float-badge" sx={{
                  position: 'absolute', top: '8%', right: '-18%',
                  bgcolor: 'rgba(30,41,59,0.92)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(34,197,94,0.25)',
                  borderRadius: '10px', px: 1.5, py: 0.8,
                  display: 'flex', alignItems: 'center', gap: 0.75,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}>
                  <Box sx={{ width: 6, height: 6, bgcolor: '#22c55e', borderRadius: '50%', boxShadow: '0 0 6px #22c55e' }} />
                  <Typography sx={{ fontSize: '0.65rem', color: '#e2e8f0', fontWeight: 600, whiteSpace: 'nowrap' }}>3 online</Typography>
                </Box>

                <Box className="float-badge-2" sx={{
                  position: 'absolute', bottom: '12%', left: '-20%',
                  bgcolor: 'rgba(30,41,59,0.92)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: '10px', px: 1.5, py: 0.8,
                  display: 'flex', alignItems: 'center', gap: 0.75,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}>
                  <Box sx={{ width: 6, height: 6, bgcolor: '#ef4444', borderRadius: '50%', boxShadow: '0 0 6px #ef4444', animation: 'pulse-dot 1.2s infinite' }} />
                  <Typography sx={{ fontSize: '0.65rem', color: '#fca5a5', fontWeight: 600, whiteSpace: 'nowrap' }}>1 cảnh báo</Typography>
                </Box>
              </Box>

              {/* Title */}
              <Stack spacing={1.5} sx={{ maxWidth: 400 }}>
                <Typography className="shimmer-text" sx={{ fontWeight: 800, fontSize: '1.7rem', lineHeight: 1.28, letterSpacing: 0.1 }}>
                  Hệ thống Giám sát<br />Điện tử EMS
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.84rem', lineHeight: 1.7 }}>
                  Quản lý, định vị thời gian thực và tự động phát hiện cảnh báo vi phạm của phạm nhân thi hành án ngoài cộng đồng.
                </Typography>
              </Stack>

              {/* Feature cards */}
              <Stack direction="row" spacing={1.25} sx={{ width: '100%', maxWidth: 400 }}>
                {FEATURES.map((f, i) => (
                  <Box key={i} sx={{
                    flex: 1, p: 1.75, borderRadius: '12px',
                    bgcolor: 'rgba(15,23,42,0.7)',
                    border: `1px solid ${f.accent}28`,
                    textAlign: 'center', backdropFilter: 'blur(8px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      border: `1px solid ${f.accent}50`,
                      bgcolor: `${f.accent}10`,
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center',
                      width: 36, height: 36, borderRadius: '10px', mx: 'auto',
                      bgcolor: `${f.accent}15`, border: `1px solid ${f.accent}25`,
                      alignItems: 'center' }}>
                      {f.icon}
                    </Box>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#e2e8f0', lineHeight: 1.3 }}>{f.label}</Typography>
                    <Typography sx={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.32)', mt: 0.4 }}>{f.desc}</Typography>
                  </Box>
                ))}
              </Stack>

              {/* Stats row */}
              <Stack direction="row" spacing={3} sx={{ width: '100%', maxWidth: 400, justifyContent: 'center' }}>
                {STATS.map((s, i) => (
                  <Box key={i} sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#93c5fd', lineHeight: 1 }}>{s.value}</Typography>
                    <Typography sx={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.28)', mt: 0.3, fontWeight: 500 }}>{s.label}</Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>

            {/* ─ Footer status ─ */}
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ zIndex: 2, position: 'relative' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Box className="status-dot" sx={{ width: 6, height: 6, bgcolor: '#22c55e', borderRadius: '50%', flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.3)' }}>Hệ thống trực tuyến</Typography>
                </Stack>
                <Typography sx={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.15)' }}>•</Typography>
                <Typography sx={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.3)' }}>v1.0.2</Typography>
              </Stack>

              {/* Security badges */}
              <Stack direction="row" spacing={0.75}>
                <Chip
                  icon={<Lock1 size={10} color="#94a3b8" />}
                  label="SSL/TLS"
                  size="small"
                  sx={{ height: 20, fontSize: '0.58rem', bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)',
                    border: '1px solid rgba(255,255,255,0.08)', '& .MuiChip-icon': { ml: 0.5 } }}
                />
                <Chip
                  icon={<Shield size={10} color="#94a3b8" />}
                  label="AES-256"
                  size="small"
                  sx={{ height: 20, fontSize: '0.58rem', bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)',
                    border: '1px solid rgba(255,255,255,0.08)', '& .MuiChip-icon': { ml: 0.5 } }}
                />
              </Stack>
            </Stack>
          </Grid>
        )}

        {/* ── RIGHT PANEL (form) ── */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 3, sm: 5, md: 8 },
            bgcolor: theme.palette.mode === 'dark' ? '#020617' : '#f1f5f9',
            position: 'relative',
            // Subtle background pattern
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundImage: `radial-gradient(circle at 80% 20%, ${theme.palette.mode === 'dark' ? 'rgba(29,78,216,0.05)' : 'rgba(29,78,216,0.04)'} 0%, transparent 50%)`,
              pointerEvents: 'none'
            }
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
