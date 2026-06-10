import {
  Box,
  Stack,
  Typography
} from '@mui/material';
import useAuth from 'hooks/useAuth';
import { Link as RouterLink } from 'react-router-dom';
import FirebaseRegister from 'sections/auth/auth-forms/AuthRegister';

// ─── Illustration (left panel) ───────────────────────────────────────────────
const TrackingIllustration = () => (
  <svg viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 380 }}>
    {/* Ground shadow */}
    <ellipse cx="210" cy="390" rx="120" ry="14" fill="rgba(14,165,233,0.15)" />

    {/* Map background card */}
    <rect x="60" y="80" width="300" height="240" rx="24" fill="rgba(15, 23, 42, 0.85)" />
    <rect x="60" y="80" width="300" height="240" rx="24" stroke="rgba(14, 165, 233, 0.3)" strokeWidth="1.5" />

    {/* Map grid lines */}
    {[120, 160, 200, 240, 280].map((y) => (
      <line key={y} x1="72" y1={y} x2="348" y2={y} stroke="rgba(14, 165, 233, 0.08)" strokeWidth="1" />
    ))}
    {[110, 150, 190, 230, 270, 310].map((x) => (
      <line key={x} x1={x} y1="92" x2={x} y2="308" stroke="rgba(14, 165, 233, 0.08)" strokeWidth="1" />
    ))}

    {/* Route path */}
    <path d="M130 280 Q170 240 190 200 Q210 160 250 140" stroke="#0ea5e9" strokeWidth="3" strokeDasharray="6 4" fill="none" strokeLinecap="round" />

    {/* Location pin A */}
    <g transform="translate(122, 265)">
      <circle cx="8" cy="8" r="14" fill="#0ea5e9" fillOpacity="0.25" />
      <circle cx="8" cy="8" r="9" fill="#0ea5e9" />
      <circle cx="8" cy="8" r="4" fill="white" />
    </g>

    {/* Location pin B (destination) */}
    <g transform="translate(232, 118)">
      <circle cx="10" cy="10" r="18" fill="#10b981" fillOpacity="0.25" />
      <path d="M10 2C6.13 2 3 5.13 3 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#10b981" transform="translate(0,0)" />
    </g>

    {/* Pulse rings around pin B */}
    <circle cx="242" cy="128" r="22" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.5" fill="none">
      <animate attributeName="r" from="16" to="30" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="242" cy="128" r="28" stroke="#10b981" strokeWidth="1" strokeOpacity="0.3" fill="none">
      <animate attributeName="r" from="22" to="42" dur="2s" begin="0.4s" repeatCount="indefinite" />
      <animate attributeName="opacity" from="0.4" to="0" dur="2s" begin="0.4s" repeatCount="indefinite" />
    </circle>

    {/* Person / tracked subject */}
    <g transform="translate(156, 170)">
      {/* Body */}
      <rect x="8" y="26" width="22" height="32" rx="6" fill="#3b82f6" />
      {/* Head */}
      <circle cx="19" cy="18" r="11" fill="#f59e0b" />
      {/* Hair */}
      <path d="M8 16 Q19 6 30 16" fill="#78350f" />
      {/* Legs */}
      <rect x="10" y="55" width="8" height="22" rx="4" fill="#1d4ed8" />
      <rect x="20" y="55" width="8" height="22" rx="4" fill="#1d4ed8" />
      {/* Ankle tracker */}
      <rect x="7" y="73" width="12" height="6" rx="3" fill="#0ea5e9" stroke="white" strokeWidth="1" />
      <circle cx="13" cy="76" r="2" fill="#38bdf8" />
      {/* Arms */}
      <path d="M8 30 L-4 48" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
      <path d="M30 30 L42 42" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
    </g>

    {/* Signal waves from tracker */}
    <path d="M158 235 Q148 220 148 205" stroke="#38bdf8" strokeWidth="1.5" fill="none" strokeOpacity="0.7">
      <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" />
    </path>
    <path d="M156 235 Q140 215 140 195" stroke="#38bdf8" strokeWidth="1.5" fill="none" strokeOpacity="0.5">
      <animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="0.3s" repeatCount="indefinite" />
    </path>
    <path d="M154 235 Q132 210 132 185" stroke="#38bdf8" strokeWidth="1.5" fill="none" strokeOpacity="0.3">
      <animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="0.6s" repeatCount="indefinite" />
    </path>

    {/* Info card */}
    <rect x="88" y="108" width="110" height="52" rx="12" fill="rgba(30, 41, 59, 0.95)" filter="url(#shadow)" />
    <rect x="88" y="108" width="110" height="52" rx="12" stroke="rgba(14, 165, 233, 0.2)" strokeWidth="1" />
    <circle cx="106" cy="125" r="8" fill="rgba(14, 165, 233, 0.15)" />
    <rect x="120" y="118" width="64" height="7" rx="3.5" fill="rgba(14, 165, 233, 0.4)" />
    <rect x="120" y="130" width="46" height="6" rx="3" fill="rgba(14, 165, 233, 0.2)" />
    <rect x="96" y="144" width="88" height="6" rx="3" fill="rgba(14, 165, 233, 0.08)" />
    <circle cx="106" cy="125" r="4" fill="#0ea5e9" />

    {/* GPS satellite icon top right */}
    <g transform="translate(296, 96)">
      <circle cx="20" cy="20" r="18" fill="rgba(14, 165, 233, 0.12)" />
      <path d="M12 20 L28 20 M20 12 L20 28" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="20" r="4" fill="#0ea5e9" />
      <circle cx="20" cy="20" r="8" stroke="#38bdf8" strokeWidth="1" fill="none" />
    </g>

    {/* Shield security bottom right */}
    <g transform="translate(298, 262)">
      <circle cx="20" cy="20" r="18" fill="rgba(16, 185, 129, 0.12)" />
      <path d="M20 8 L30 13 L30 21 C30 26.5 25.5 31.5 20 33 C14.5 31.5 10 26.5 10 21 L10 13 Z" fill="#10b981" fillOpacity="0.2" />
      <path d="M20 10 L28 14.5 L28 21 C28 25.8 24.5 30.2 20 31.5 C15.5 30.2 12 25.8 12 21 L12 14.5 Z" stroke="#10b981" strokeWidth="1.5" fill="none" />
      <path d="M16 21 L19 24 L24 18" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Drop shadow filter */}
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0ea5e9" floodOpacity="0.2" />
      </filter>
    </defs>
  </svg>
);

const Register = () => {
  const { isLoggedIn } = useAuth();

  const PRIMARY = '#0ea5e9'; // Cyan-500

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#020617', // Slate-950
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 2, sm: 4 },
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* ── Sleek Grid Overlay ── */}
      <Box sx={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 0)',
        backgroundSize: '24px 24px',
        pointerEvents: 'none', zIndex: 0
      }} />

      {/* ── Background Neon Blobs ── */}
      <Box sx={{
        position: 'absolute', top: -100, left: -100,
        width: 450, height: 450, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
        filter: 'blur(30px)', zIndex: 0
      }} />
      <Box sx={{
        position: 'absolute', bottom: -100, right: -100,
        width: 450, height: 450, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        filter: 'blur(30px)', zIndex: 0
      }} />
      <Box sx={{
        position: 'absolute', top: '35%', right: '15%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)',
        filter: 'blur(20px)', zIndex: 0
      }} />

      {/* ── Card Container ── */}
      <Box
        sx={{
          position: 'relative', zIndex: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          bgcolor: 'rgba(15, 23, 42, 0.45)', // Semi-transparent Slate-900
          backdropFilter: 'blur(20px)',
          borderRadius: '30px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(14, 165, 233, 0.04)',
          width: '100%',
          maxWidth: 960,
          minHeight: { md: 540 }
        }}
      >
        {/* ── LEFT: Tech Illustration Panel ── */}
        <Box
          sx={{
            flex: { md: '0 0 46%' },
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: 4, py: 6,
            background: 'linear-gradient(225deg, #0f172a 0%, #1e1b4b 100%)', // Slate-900 to Deep Indigo
            position: 'relative',
            overflow: 'hidden',
            borderRight: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          {/* Tech lines pattern */}
          <Box sx={{
            position: 'absolute', inset: 0,
            opacity: 0.15,
            backgroundImage: `linear-gradient(rgba(14, 165, 233, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            pointerEvents: 'none'
          }} />

          {/* Glow circle behind logo */}
          <Box sx={{
            position: 'absolute', top: '20%',
            width: 280, height: 280, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 60%)',
            filter: 'blur(10px)', pointerEvents: 'none'
          }} />

          {/* Brand */}
          <Stack spacing={0.5} alignItems="center" sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', color: '#ffffff', letterSpacing: 1, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              GoSafe EMS
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
              Electronic Monitoring System
            </Typography>
          </Stack>

          {/* Illustration */}
          <Box sx={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <TrackingIllustration />
          </Box>

          {/* Caption */}
          <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500, mt: 3, textAlign: 'center', position: 'relative', zIndex: 1 }}>
            Hệ thống giám sát điện tử thời gian thực
          </Typography>
        </Box>

        {/* ── RIGHT: Form Panel ── */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            px: { xs: 3, sm: 5, md: 6 },
            py: { xs: 4, md: 6 }
          }}
        >
          {/* Mobile brand header */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 3 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', color: '#ffffff' }}>GoSafe EMS</Typography>
            <Typography sx={{ fontSize: '0.62rem', color: '#38bdf8', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', mt: 0.5 }}>
              Electronic Monitoring System
            </Typography>
          </Box>

          {/* Heading */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 1.5 }}>
            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.75rem', sm: '2rem' },
                  color: '#ffffff',
                  lineHeight: 1.25,
                  mb: 0.5,
                  background: 'linear-gradient(to right, #ffffff, #94a3b8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Đăng ký tài khoản
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 400 }}>
                Nhập thông tin của bạn để bắt đầu
              </Typography>
            </Box>
            <RouterLink
              to={isLoggedIn ? '/auth/login' : '/login'}
              style={{ fontSize: 14, color: PRIMARY, textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s', paddingBottom: 4 }}
            >
              Đã có tài khoản?
            </RouterLink>
          </Box>

          {/* Form */}
          <FirebaseRegister />
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
