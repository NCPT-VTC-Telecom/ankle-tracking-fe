import { alpha, Box, Divider, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import LoadingButton from 'shared/components/@extended/LoadingButton';
import { Formik } from 'formik';
import useAuth from 'shared/hooks/useAuth';
import useMapCode from 'shared/hooks/useMapCode';
import useScriptRef from 'shared/hooks/useScriptRef';
import { Eye, EyeSlash, Lock1, Profile, InfoCircle, ShieldTick, Call, Sms, Clock } from 'iconsax-react';
import { enqueueSnackbar } from 'notistack';
import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';
import { dispatch } from 'shared/store';
import { handlerIconVariants, openSnackbar } from 'shared/store/reducers/snackbar';
import * as Yup from 'yup';
import logoVTC from 'assets/logo/logo-VTC.png';

// Project Screenshots for Showcase
import liveMonitoring from '/public/images/Live-Monitoring---Offender-Tracking-System.png';
import flexibleGeofence from '/public/images/Flexible-Geofence---Offender-Tracking-System.png';
import variousAlarms from '/public/images/Various-Alarms-setting---Offender-Tracking-System.png';
import multiPlatform from '/public/images/Multi-Platform-Offender-Tracking-System.png';

const PRIMARY = '#2563eb'; // Blue-600
const PRIMARY_DARK = '#1d4ed8';
const ACCENT = '#0ea5e9'; // Sky-500

// ─── Dynamic Product Showcase (left panel) ───────────────────────────────
const ProductShowcase = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    {
      image: liveMonitoring,
      title: 'Giám Sát Thời Gian Thực',
      description: 'Định vị GPS liên tục, cập nhật lộ trình di chuyển của đối tượng với độ chính xác cao.'
    },
    {
      image: flexibleGeofence,
      title: 'Thiết Lập Vùng Địa Giới',
      description: 'Tự động phát hiện và gửi cảnh báo tức thì khi đối tượng vi phạm khu vực thiết lập.'
    },
    {
      image: variousAlarms,
      title: 'Cảnh Báo Thông Minh',
      description: 'Cảnh báo ngay lập tức các hành vi tháo thiết bị, pin yếu hoặc đi vào vùng cấm.'
    },
    {
      image: multiPlatform,
      title: 'Quản Lý Đa Nền Tảng',
      description: 'Theo dõi và quản trị mọi lúc mọi nơi thông qua giao diện Web và ứng dụng di động trực quan.'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
      {/* Brand & Logo Badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: { xs: 4, lg: 6 } }}>
        <Box 
          sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.95)', 
            p: { xs: 1.2, lg: 1.6 }, 
            borderRadius: '16px', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Box component="img" src={logoVTC} alt="VTC Telecom" sx={{ height: { xs: 36, lg: 44 }, width: 'auto', objectFit: 'contain' }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.25rem', lg: '1.45rem', xl: '1.6rem' }, color: '#ffffff', lineHeight: 1.2, letterSpacing: 0.5 }}>
            Giám Sát Điện Tử EMS
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.62rem', lg: '0.7rem' }, color: '#38bdf8', fontWeight: 800, letterSpacing: 1.8, textTransform: 'uppercase', mt: 0.25 }}>
            Electronic Monitoring System
          </Typography>
        </Box>
      </Box>

      {/* Showcase mockup frame */}
      <Box 
        sx={{ 
          position: 'relative', 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          my: { xs: 2, lg: 4 },
          minHeight: { xs: 260, lg: 340 }
        }}
      >
        {/* Glow ambient background lights */}
        <Box sx={{ position: 'absolute', width: { xs: 220, lg: 320 }, height: { xs: 220, lg: 320 }, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.22) 0%, transparent 70%)', filter: 'blur(35px)', top: '15%', left: '10%', zIndex: 0 }} />
        <Box sx={{ position: 'absolute', width: { xs: 180, lg: 280 }, height: { xs: 180, lg: 280 }, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', filter: 'blur(30px)', bottom: '15%', right: '10%', zIndex: 0 }} />

        {/* Device Monitor Frame - Enlarged */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: { xs: 360, lg: 480, xl: 520 },
            aspectRatio: '16/10',
            bgcolor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1.5px solid rgba(255, 255, 255, 0.16)',
            boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.5), 0 0 50px rgba(14, 165, 233, 0.15)',
            p: 1.5,
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Inner frame */}
          <Box sx={{ position: 'relative', width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', bgcolor: '#0b0f19' }}>
            {slides.map((slide, idx) => (
              <Box
                key={idx}
                component="img"
                src={slide.image}
                alt={slide.title}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: activeSlide === idx ? 1 : 0,
                  transform: activeSlide === idx ? 'scale(1)' : 'scale(1.08)',
                  transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out'
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Slide Text Content - Enlarged */}
      <Box sx={{ position: 'relative', zIndex: 1, mt: { xs: 2, lg: 4 }, minHeight: { xs: 90, lg: 110 } }}>
        {slides.map((slide, idx) => (
          <Box
            key={idx}
            sx={{
              position: idx === 0 ? 'relative' : 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              opacity: activeSlide === idx ? 1 : 0,
              transform: activeSlide === idx ? 'translateY(0)' : 'translateY(15px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
              visibility: activeSlide === idx ? 'visible' : 'hidden',
              pointerEvents: activeSlide === idx ? 'auto' : 'none'
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#ffffff', mb: 1, fontSize: { xs: '1.2rem', lg: '1.45rem', xl: '1.6rem' }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#0ea5e9', display: 'inline-block', boxShadow: '0 0 10px #0ea5e9' }} />
              {slide.title}
            </Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: { xs: '0.85rem', lg: '0.95rem', xl: '1.02rem' }, lineHeight: 1.55, fontWeight: 400 }}>
              {slide.description}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Slide Indicator dots */}
      <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: { xs: 3, lg: 5 }, position: 'relative', zIndex: 1 }}>
        {slides.map((_, idx) => (
          <Box
            key={idx}
            onClick={() => setActiveSlide(idx)}
            sx={{
              width: activeSlide === idx ? 32 : 10,
              height: 10,
              borderRadius: 5,
              bgcolor: activeSlide === idx ? '#0ea5e9' : 'rgba(255, 255, 255, 0.25)',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: activeSlide === idx ? '0 0 8px rgba(14, 165, 233, 0.5)' : 'none'
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

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
        width: '100vw',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        overflow: 'hidden',
        bgcolor: '#ffffff',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* LEFT: Premium product showcase */}
      <Box
        sx={{
          flex: { md: '0 0 50%', lg: '0 0 50%' },
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          px: { md: 6, lg: 8, xl: 10 },
          py: 8,
          background: 'linear-gradient(135deg, #070a13 0%, #0f172a 50%, #1e1b4b 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle grid points and line overlays */}
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.25, backgroundImage: `radial-gradient(rgba(255,255,255,0.15) 1.5px, transparent 0)`, backgroundSize: '24px 24px', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`, backgroundSize: '48px 48px', pointerEvents: 'none' }} />
        
        <ProductShowcase />

        {/* Curved S-Curve separation shape */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: -1,
            bottom: 0,
            width: 80,
            display: { xs: 'none', md: 'block' },
            zIndex: 2,
            pointerEvents: 'none'
          }}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ width: '100%', height: '100%' }}
          >
            <path
              d="M0,0 C45,25 30,75 0,100 L100,100 L100,0 Z"
              fill="#ffffff"
            />
          </svg>
        </Box>
      </Box>

      {/* RIGHT: form */}
      <Box
        sx={{
          flex: { md: '0 0 50%', xs: '1' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: { xs: 3, sm: 8, md: 10, lg: 12, xl: 16 },
          py: { xs: 4, md: 6 },
          bgcolor: '#ffffff',
          position: 'relative',
          overflowY: 'auto',
          minHeight: '100vh'
        }}
      >
        {/* Soft decorative blobs on the right panel background */}
        <Box sx={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)', filter: 'blur(20px)', zIndex: 0, pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -140, left: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)', filter: 'blur(24px)', zIndex: 0, pointerEvents: 'none' }} />

        {/* Content wrapper to constrain form width */}
        <Box sx={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
          {/* Mobile brand */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 3 }}>
            <Box component="img" src={logoVTC} alt="VTC Telecom" sx={{ height: 38, width: 'auto', objectFit: 'contain', mb: 1 }} />
            <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a' }}>Hệ thống Giám sát Điện tử EMS</Typography>
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
                      { label: 'Hotline', value: '(84.28) 38331106', color: ACCENT, icon: <Call size={15} variant="Bold" color={ACCENT} /> },
                      { label: 'Email', value: 'gosafe@vtctelecom.com.vn', color: PRIMARY, icon: <Sms size={15} variant="Bold" color={PRIMARY} /> },
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
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  '& input': { 
    color: '#0f172a', 
    py: 1.6, 
    height: '1.4375em', 
    lineHeight: 1.4375, 
    '&::placeholder': { color: '#94a3b8', opacity: 0.8 } 
  },
  '& fieldset': { 
    borderColor: 'rgba(15,23,42,0.08)', 
    borderWidth: '1.5px',
    transition: 'border-color 0.25s ease'
  },
  '&:hover': {
    bgcolor: '#f1f5f9'
  },
  '&:hover fieldset': { 
    borderColor: `${alpha(PRIMARY, 0.35)} !important` 
  },
  '&.Mui-focused': { 
    bgcolor: '#fff', 
    boxShadow: `0 8px 24px -4px ${alpha(PRIMARY, 0.12)}, 0 0 0 4px ${alpha(PRIMARY, 0.08)}`,
    transform: 'translateY(-1px)'
  },
  '&.Mui-focused fieldset': { 
    borderColor: `${PRIMARY} !important`, 
    borderWidth: '2px !important' 
  },
  '&.Mui-error fieldset': { 
    borderColor: '#ef4444 !important' 
  }
};

export default Login;
