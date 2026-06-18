import { alpha, Box, Divider, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import LoadingButton from 'components/@extended/LoadingButton';
import { Formik } from 'formik';
import useAuth from 'hooks/useAuth';
import useMapCode from 'hooks/useMapCode';
import useScriptRef from 'hooks/useScriptRef';
import { Eye, EyeSlash, Lock1, Profile, InfoCircle, ShieldTick, Call, Sms, Clock } from 'iconsax-react';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';
import { dispatch } from 'store';
import { handlerIconVariants, openSnackbar } from 'store/reducers/snackbar';
import * as Yup from 'yup';

const PRIMARY = '#2563eb'; // Blue-600
const PRIMARY_DARK = '#1d4ed8';
const ACCENT = '#0ea5e9'; // Sky-500

// ─── Light tracking illustration (left panel) ───────────────────────────────
const TrackingIllustration = () => (
  <svg viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 360 }}>
    <ellipse cx="210" cy="392" rx="120" ry="13" fill="rgba(37,99,235,0.10)" />

    {/* Map card */}
    <rect x="60" y="80" width="300" height="240" rx="24" fill="#ffffff" />
    <rect x="60" y="80" width="300" height="240" rx="24" stroke="rgba(37,99,235,0.18)" strokeWidth="1.5" />
    {[120, 160, 200, 240, 280].map((y) => (
      <line key={y} x1="72" y1={y} x2="348" y2={y} stroke="rgba(37,99,235,0.06)" strokeWidth="1" />
    ))}
    {[110, 150, 190, 230, 270, 310].map((x) => (
      <line key={x} x1={x} y1="92" x2={x} y2="308" stroke="rgba(37,99,235,0.06)" strokeWidth="1" />
    ))}

    {/* Route */}
    <path d="M130 280 Q170 240 190 200 Q210 160 250 140" stroke={ACCENT} strokeWidth="3" strokeDasharray="6 4" fill="none" strokeLinecap="round" />

    {/* Pin A */}
    <g transform="translate(122, 265)">
      <circle cx="8" cy="8" r="14" fill={ACCENT} fillOpacity="0.18" />
      <circle cx="8" cy="8" r="9" fill={ACCENT} />
      <circle cx="8" cy="8" r="4" fill="white" />
    </g>

    {/* Pin B */}
    <g transform="translate(232, 118)">
      <circle cx="10" cy="10" r="18" fill="#10b981" fillOpacity="0.18" />
      <path d="M10 2C6.13 2 3 5.13 3 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#10b981" />
    </g>
    <circle cx="242" cy="128" r="22" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.5" fill="none">
      <animate attributeName="r" from="16" to="30" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
    </circle>

    {/* Person */}
    <g transform="translate(156, 170)">
      <rect x="8" y="26" width="22" height="32" rx="6" fill={PRIMARY} />
      <circle cx="19" cy="18" r="11" fill="#f59e0b" />
      <path d="M8 16 Q19 6 30 16" fill="#78350f" />
      <rect x="10" y="55" width="8" height="22" rx="4" fill={PRIMARY_DARK} />
      <rect x="20" y="55" width="8" height="22" rx="4" fill={PRIMARY_DARK} />
      <rect x="7" y="73" width="12" height="6" rx="3" fill={ACCENT} stroke="white" strokeWidth="1" />
      <circle cx="13" cy="76" r="2" fill="#38bdf8" />
      <path d="M8 30 L-4 48" stroke={PRIMARY} strokeWidth="6" strokeLinecap="round" />
      <path d="M30 30 L42 42" stroke={PRIMARY} strokeWidth="6" strokeLinecap="round" />
    </g>

    {/* Signal waves */}
    <path d="M158 235 Q148 220 148 205" stroke={ACCENT} strokeWidth="1.5" fill="none" strokeOpacity="0.7">
      <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" />
    </path>
    <path d="M156 235 Q140 215 140 195" stroke={ACCENT} strokeWidth="1.5" fill="none" strokeOpacity="0.5">
      <animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="0.3s" repeatCount="indefinite" />
    </path>

    {/* Info card */}
    <rect x="88" y="108" width="110" height="52" rx="12" fill="#ffffff" filter="url(#cardShadow)" />
    <rect x="88" y="108" width="110" height="52" rx="12" stroke="rgba(37,99,235,0.14)" strokeWidth="1" />
    <circle cx="106" cy="125" r="8" fill="rgba(37,99,235,0.12)" />
    <rect x="120" y="118" width="64" height="7" rx="3.5" fill="rgba(37,99,235,0.35)" />
    <rect x="120" y="130" width="46" height="6" rx="3" fill="rgba(37,99,235,0.18)" />
    <rect x="96" y="144" width="88" height="6" rx="3" fill="rgba(37,99,235,0.08)" />
    <circle cx="106" cy="125" r="4" fill={ACCENT} />

    {/* Satellite */}
    <g transform="translate(296, 96)">
      <circle cx="20" cy="20" r="18" fill="rgba(14,165,233,0.10)" />
      <path d="M12 20 L28 20 M20 12 L20 28" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="20" r="4" fill={ACCENT} />
      <circle cx="20" cy="20" r="8" stroke="#38bdf8" strokeWidth="1" fill="none" />
    </g>

    {/* Shield */}
    <g transform="translate(298, 262)">
      <circle cx="20" cy="20" r="18" fill="rgba(16,185,129,0.10)" />
      <path d="M20 10 L28 14.5 L28 21 C28 25.8 24.5 30.2 20 31.5 C15.5 30.2 12 25.8 12 21 L12 14.5 Z" stroke="#10b981" strokeWidth="1.5" fill="none" />
      <path d="M16 21 L19 24 L24 18" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    <defs>
      <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#2563eb" floodOpacity="0.12" />
      </filter>
    </defs>
  </svg>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const Login = () => {
  const intl = useIntl();
  const { login } = useAuth();
  const scriptedRef = useScriptRef();
  const { getStatusMessage } = useMapCode();
  const [showPassword, setShowPassword] = useState(false);

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
      {/* Soft pastel blobs */}
      <Box sx={{ position: 'absolute', top: -120, left: -120, width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', filter: 'blur(20px)' }} />
      <Box sx={{ position: 'absolute', bottom: -140, right: -120, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.14) 0%, transparent 70%)', filter: 'blur(24px)' }} />
      <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(37,99,235,0.05) 1px, transparent 0)', backgroundSize: '26px 26px', pointerEvents: 'none' }} />

      {/* Card */}
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
          maxWidth: 980,
          minHeight: { md: 560 }
        }}
      >
        {/* LEFT: illustration */}
        <Box
          sx={{
            flex: { md: '0 0 46%' },
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
            <Typography sx={{ fontWeight: 900, fontSize: '1.55rem', color: '#0f172a', letterSpacing: 0.5 }}>
              GoSafe EMS
            </Typography>
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

        {/* RIGHT: form */}
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
          {/* Mobile brand */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 3 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', color: '#0f172a' }}>GoSafe EMS</Typography>
            <Typography sx={{ fontSize: '0.6rem', color: PRIMARY, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', mt: 0.5 }}>
              Electronic Monitoring System
            </Typography>
          </Box>

          {/* Heading */}
          <Box sx={{ mb: 3.5, textAlign: { xs: 'center', md: 'left' } }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.7, px: 1.4, py: 0.5, borderRadius: 20, mb: 1.5, bgcolor: alpha('#22c55e', 0.1), border: `1px solid ${alpha('#22c55e', 0.25)}` }}>
              <ShieldTick size={14} color="#16a34a" variant="Bold" />
              <Typography sx={{ fontSize: '0.68rem', color: '#15803d', fontWeight: 700 }}>Kết nối bảo mật SSL/TLS</Typography>
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.7rem', sm: '1.95rem' }, color: '#0f172a', lineHeight: 1.2, mb: 0.75 }}>
              Chào mừng trở lại!
            </Typography>
            <Typography sx={{ fontSize: '0.92rem', color: '#64748b', fontWeight: 400 }}>
              Đăng nhập để tiếp tục vào hệ thống quản trị
            </Typography>
          </Box>

          {/* Form */}
          <Formik
            initialValues={{ username: '', password: '', submit: null }}
            validationSchema={Yup.object().shape({
              username: Yup.string()
                .matches(/^\S*$/, intl.formatMessage({ id: 'no-spaces-allowed' }))
                .max(255)
                .required(intl.formatMessage({ id: 'username-required' })),
              password: Yup.string().max(255).required(intl.formatMessage({ id: 'password-required' }))
            })}
            onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
              try {
                const res: any = await login(values.username, values.password);
                if (scriptedRef.current) {
                  if (res.code === 0) {
                    setStatus({ success: true });
                    setSubmitting(false);
                    dispatch(
                      openSnackbar({
                        open: true,
                        message: getStatusMessage('login', res.code),
                        variant: 'alert',
                        alert: { color: 'success' },
                        close: false
                      })
                    );
                  } else {
                    setStatus({ success: true });
                    setSubmitting(false);
                    dispatch(handlerIconVariants({ iconVariant: 'useemojis' }));
                    enqueueSnackbar(getStatusMessage('login', res.code), { variant: 'error' });
                  }
                }
              } catch {
                if (scriptedRef.current) {
                  setStatus({ success: false });
                  setErrors({ submit: intl.formatMessage({ id: 'verify-your-username-and-password' }) });
                  setSubmitting(false);
                  dispatch(handlerIconVariants({ iconVariant: 'useemojis' }));
                  enqueueSnackbar(intl.formatMessage({ id: 'login-failed' }), { variant: 'error' });
                }
              }
            }}
          >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
              <form noValidate onSubmit={handleSubmit}>
                <Stack spacing={2.75}>
                  {/* Username */}
                  <Box>
                    <Typography sx={{ mb: 0.9, fontWeight: 600, fontSize: 13.5, color: '#334155' }}>Tên tài khoản</Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      name="username"
                      placeholder="Nhập tên đăng nhập"
                      value={values.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.username && errors.username)}
                      helperText={touched.username && errors.username}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ mr: 1 }}>
                            <Profile size={20} color={values.username ? PRIMARY : '#94a3b8'} />
                          </InputAdornment>
                        ),
                        sx: inputSx
                      }}
                    />
                  </Box>

                  {/* Password */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.9 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: '#334155' }}>Mật khẩu</Typography>
                      <RouterLink to="/forgot-password" style={{ fontSize: 12.5, color: PRIMARY, textDecoration: 'none', fontWeight: 600 }}>
                        Quên mật khẩu?
                      </RouterLink>
                    </Box>
                    <TextField
                      fullWidth
                      variant="outlined"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu truy cập"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.password && errors.password)}
                      helperText={touched.password && errors.password}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ mr: 1 }}>
                            <Lock1 size={20} color={values.password ? PRIMARY : '#94a3b8'} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" sx={{ color: '#94a3b8', '&:hover': { color: PRIMARY, bgcolor: alpha(PRIMARY, 0.06) } }}>
                              {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: inputSx
                      }}
                    />
                  </Box>

                  {errors.submit && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.6, borderRadius: '12px', bgcolor: alpha('#ef4444', 0.07), border: `1px solid ${alpha('#ef4444', 0.2)}` }}>
                      <InfoCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#b91c1c' }}>{errors.submit}</Typography>
                    </Box>
                  )}

                  {/* Buttons */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.75} sx={{ width: '100%', pt: 0.5 }}>
                    <LoadingButton
                      loading={isSubmitting}
                      type="submit"
                      variant="contained"
                      disableElevation
                      sx={{
                        flex: 1.4,
                        whiteSpace: 'nowrap',
                        borderRadius: '12px',
                        py: 1.6,
                        fontWeight: 700,
                        fontSize: 14.5,
                        letterSpacing: 0.8,
                        background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
                        boxShadow: `0 8px 22px ${alpha(PRIMARY, 0.32)}`,
                        transition: 'all 0.25s ease',
                        '&:hover': { background: `linear-gradient(135deg, ${PRIMARY_DARK} 0%, #0284c7 100%)`, boxShadow: `0 10px 28px ${alpha(PRIMARY, 0.45)}`, transform: 'translateY(-1.5px)' },
                        '&:active': { transform: 'translateY(0)' },
                        '&.Mui-disabled': { background: '#e2e8f0', color: '#94a3b8', boxShadow: 'none' }
                      }}
                    >
                      ĐĂNG NHẬP
                    </LoadingButton>

                    <Box
                      component={RouterLink}
                      to="/register"
                      sx={{
                        flex: 1,
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '12px',
                        py: 1.6,
                        fontWeight: 700,
                        fontSize: 14.5,
                        letterSpacing: 0.8,
                        color: PRIMARY,
                        bgcolor: '#fff',
                        border: `1.5px solid ${alpha(PRIMARY, 0.4)}`,
                        textDecoration: 'none',
                        transition: 'all 0.25s ease',
                        '&:hover': { borderColor: PRIMARY, bgcolor: alpha(PRIMARY, 0.05), transform: 'translateY(-1.5px)' },
                        '&:active': { transform: 'translateY(0)' }
                      }}
                    >
                      ĐĂNG KÝ
                    </Box>
                  </Stack>

                  <Box sx={{ position: 'relative', py: 0.25 }}>
                    <Divider sx={{ '&::before, &::after': { borderColor: 'rgba(15,23,42,0.08)' } }}>
                      <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', px: 1, fontWeight: 600, letterSpacing: 1 }}>HOẶC LIÊN HỆ</Typography>
                    </Divider>
                  </Box>

                  {/* Contact widgets */}
                  <Stack direction="row" spacing={1.5} justifyContent="center">
                    {[
                      { label: 'Hotline', value: '1800 xxx xxx', color: ACCENT, icon: <Call size={15} variant="Bold" color={ACCENT} /> },
                      { label: 'Email', value: 'support@gosafe', color: PRIMARY, icon: <Sms size={15} variant="Bold" color={PRIMARY} /> },
                      { label: 'Hỗ trợ', value: '24/7', color: '#10b981', icon: <Clock size={15} variant="Bold" color="#10b981" /> }
                    ].map((item) => (
                      <Box
                        key={item.label}
                        sx={{
                          flex: 1,
                          textAlign: 'center',
                          py: 1.4,
                          px: 1,
                          borderRadius: '14px',
                          bgcolor: alpha(item.color, 0.05),
                          border: `1px solid ${alpha(item.color, 0.18)}`,
                          transition: 'all 0.25s ease',
                          '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 6px 16px ${alpha(item.color, 0.18)}`, borderColor: item.color, bgcolor: alpha(item.color, 0.09) }
                        }}
                      >
                        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                          {item.icon}
                          <Typography sx={{ fontSize: '0.66rem', color: item.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</Typography>
                        </Stack>
                        <Typography sx={{ fontSize: '0.72rem', color: '#64748b', mt: 0.4, fontWeight: 600 }}>{item.value}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </form>
            )}
          </Formik>
        </Box>
      </Box>
    </Box>
  );
};

// ─── Shared light input styles ──────────────────────────────────────────────
const inputSx = {
  borderRadius: '12px',
  bgcolor: '#f8fafc',
  fontSize: 14.5,
  color: '#0f172a',
  transition: 'all 0.2s ease',
  '& input': { color: '#0f172a', py: 1.6, height: '1.4375em', lineHeight: 1.4375, '&::placeholder': { color: '#94a3b8', opacity: 1 } },
  '& fieldset': { borderColor: 'rgba(15,23,42,0.1)', borderWidth: 1.5 },
  '&:hover fieldset': { borderColor: `${alpha(PRIMARY, 0.4)} !important` },
  '&.Mui-focused': { bgcolor: '#fff', boxShadow: `0 0 0 3px ${alpha(PRIMARY, 0.1)}` },
  '&.Mui-focused fieldset': { borderColor: `${PRIMARY} !important`, borderWidth: '1.5px !important' },
  '&.Mui-error fieldset': { borderColor: '#ef4444 !important' }
};

export default Login;
