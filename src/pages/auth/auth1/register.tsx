import { Box, Stack, Typography } from '@mui/material';
import useAuth from 'hooks/useAuth';
import { Link as RouterLink } from 'react-router-dom';
import { ShieldTick } from 'iconsax-react';
import FirebaseRegister from 'sections/auth/auth-forms/AuthRegister';

const PRIMARY = '#2563eb';
const ACCENT = '#0ea5e9';

// ─── Light tracking illustration (left panel) ───────────────────────────────
const TrackingIllustration = () => (
  <svg viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 360 }}>
    <ellipse cx="210" cy="392" rx="120" ry="13" fill="rgba(37,99,235,0.10)" />
    <rect x="60" y="80" width="300" height="240" rx="24" fill="#ffffff" />
    <rect x="60" y="80" width="300" height="240" rx="24" stroke="rgba(37,99,235,0.18)" strokeWidth="1.5" />
    {[120, 160, 200, 240, 280].map((y) => (
      <line key={y} x1="72" y1={y} x2="348" y2={y} stroke="rgba(37,99,235,0.06)" strokeWidth="1" />
    ))}
    {[110, 150, 190, 230, 270, 310].map((x) => (
      <line key={x} x1={x} y1="92" x2={x} y2="308" stroke="rgba(37,99,235,0.06)" strokeWidth="1" />
    ))}
    <path d="M130 280 Q170 240 190 200 Q210 160 250 140" stroke={ACCENT} strokeWidth="3" strokeDasharray="6 4" fill="none" strokeLinecap="round" />
    <g transform="translate(122, 265)">
      <circle cx="8" cy="8" r="14" fill={ACCENT} fillOpacity="0.18" />
      <circle cx="8" cy="8" r="9" fill={ACCENT} />
      <circle cx="8" cy="8" r="4" fill="white" />
    </g>
    <g transform="translate(232, 118)">
      <circle cx="10" cy="10" r="18" fill="#10b981" fillOpacity="0.18" />
      <path d="M10 2C6.13 2 3 5.13 3 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#10b981" />
    </g>
    <circle cx="242" cy="128" r="22" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.5" fill="none">
      <animate attributeName="r" from="16" to="30" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
    </circle>
    <g transform="translate(156, 170)">
      <rect x="8" y="26" width="22" height="32" rx="6" fill={PRIMARY} />
      <circle cx="19" cy="18" r="11" fill="#f59e0b" />
      <path d="M8 16 Q19 6 30 16" fill="#78350f" />
      <rect x="10" y="55" width="8" height="22" rx="4" fill="#1d4ed8" />
      <rect x="20" y="55" width="8" height="22" rx="4" fill="#1d4ed8" />
      <rect x="7" y="73" width="12" height="6" rx="3" fill={ACCENT} stroke="white" strokeWidth="1" />
      <circle cx="13" cy="76" r="2" fill="#38bdf8" />
      <path d="M8 30 L-4 48" stroke={PRIMARY} strokeWidth="6" strokeLinecap="round" />
      <path d="M30 30 L42 42" stroke={PRIMARY} strokeWidth="6" strokeLinecap="round" />
    </g>
    <rect x="88" y="108" width="110" height="52" rx="12" fill="#ffffff" filter="url(#regShadow)" />
    <rect x="88" y="108" width="110" height="52" rx="12" stroke="rgba(37,99,235,0.14)" strokeWidth="1" />
    <circle cx="106" cy="125" r="8" fill="rgba(37,99,235,0.12)" />
    <rect x="120" y="118" width="64" height="7" rx="3.5" fill="rgba(37,99,235,0.35)" />
    <rect x="120" y="130" width="46" height="6" rx="3" fill="rgba(37,99,235,0.18)" />
    <circle cx="106" cy="125" r="4" fill={ACCENT} />
    <defs>
      <filter id="regShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#2563eb" floodOpacity="0.12" />
      </filter>
    </defs>
  </svg>
);

const Register = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eef4ff 45%, #e0f2fe 100%)',
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 2, sm: 4 },
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <Box sx={{ position: 'absolute', top: -120, left: -120, width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', filter: 'blur(20px)' }} />
      <Box sx={{ position: 'absolute', bottom: -140, right: -120, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.14) 0%, transparent 70%)', filter: 'blur(24px)' }} />
      <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(37,99,235,0.05) 1px, transparent 0)', backgroundSize: '26px 26px', pointerEvents: 'none' }} />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          bgcolor: '#ffffff',
          borderRadius: '28px',
          border: '1px solid rgba(15,23,42,0.06)',
          overflow: 'hidden',
          boxShadow: '0 30px 70px rgba(15,23,42,0.12), 0 4px 14px rgba(37,99,235,0.06)',
          width: '100%',
          maxWidth: 1000,
          minHeight: { md: 580 }
        }}
      >
        {/* LEFT */}
        <Box
          sx={{
            flex: { md: '0 0 44%' },
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: 4,
            py: 6,
            background: 'linear-gradient(225deg, #eff6ff 0%, #e0f2fe 100%)',
            position: 'relative',
            overflow: 'hidden',
            borderRight: '1px solid rgba(15,23,42,0.05)'
          }}
        >
          <Box sx={{ position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: `linear-gradient(rgba(37,99,235,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.06) 1px, transparent 1px)`, backgroundSize: '40px 40px', pointerEvents: 'none' }} />
          <Stack spacing={0.5} alignItems="center" sx={{ mb: 3.5, position: 'relative', zIndex: 1 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.55rem', color: '#0f172a', letterSpacing: 0.5 }}>GoSafe EMS</Typography>
            <Typography sx={{ fontSize: '0.66rem', color: PRIMARY, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
              Electronic Monitoring System
            </Typography>
          </Stack>
          <Box sx={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <TrackingIllustration />
          </Box>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, mt: 3, textAlign: 'center', position: 'relative', zIndex: 1 }}>
            Hệ thống giám sát điện tử thời gian thực
          </Typography>
        </Box>

        {/* RIGHT */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', px: { xs: 3, sm: 5, md: 6 }, py: { xs: 4, md: 6 } }}>
          <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 3 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', color: '#0f172a' }}>GoSafe EMS</Typography>
          </Box>

          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 1.5 }}>
            <Box>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.7, px: 1.4, py: 0.5, borderRadius: 20, mb: 1.25, bgcolor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                <ShieldTick size={14} color="#16a34a" variant="Bold" />
                <Typography sx={{ fontSize: '0.68rem', color: '#15803d', fontWeight: 700 }}>Bảo mật SSL/TLS</Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.7rem', sm: '1.95rem' }, color: '#0f172a', lineHeight: 1.25, mb: 0.5 }}>
                Đăng ký tài khoản
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 400 }}>Nhập thông tin của bạn để bắt đầu</Typography>
            </Box>
            <RouterLink to={isLoggedIn ? '/auth/login' : '/login'} style={{ fontSize: 14, color: PRIMARY, textDecoration: 'none', fontWeight: 600, paddingBottom: 4 }}>
              Đã có tài khoản?
            </RouterLink>
          </Box>

          <FirebaseRegister />
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
