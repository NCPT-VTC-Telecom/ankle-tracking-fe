import { alpha, Box, Divider, FormHelperText, Link, Stack, TextField, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LoadingButton from 'components/@extended/LoadingButton';
import { Formik } from 'formik';
import useAuth from 'hooks/useAuth';
import useMapCode from 'hooks/useMapCode';
import useScriptRef from 'hooks/useScriptRef';
import { Eye, EyeSlash, InfoCircle, Lock1, Profile, ShieldSecurity, ShieldTick } from 'iconsax-react';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';
import { dispatch } from 'store';
import { handlerIconVariants, openSnackbar } from 'store/reducers/snackbar';
import * as Yup from 'yup';

const PRIMARY = '#2563eb';
const PRIMARY_DARK = '#1d4ed8';
const PRIMARY_DARKER = '#1e40af';

const AuthLogin = ({ forgot }: { forgot?: string }) => {
  const intl = useIntl();
  const { isLoggedIn, login } = useAuth();
  const scriptedRef = useScriptRef();
  const { getStatusMessage } = useMapCode();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box sx={{ width: '100%' }}>
      {/* ── Header ── */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        {/* Shield icon with gradient background */}
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 64, height: 64, borderRadius: '18px', mb: 2.5,
          background: `linear-gradient(135deg, ${alpha(PRIMARY, 0.14)}, ${alpha(PRIMARY, 0.06)})`,
          border: `1.5px solid ${alpha(PRIMARY, 0.22)}`,
          boxShadow: `0 8px 24px ${alpha(PRIMARY, 0.18)}`,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: -4,
            borderRadius: '22px',
            border: `1px solid ${alpha(PRIMARY, 0.08)}`
          }
        }}>
          <ShieldSecurity size={30} color={PRIMARY} variant="Bold" />
        </Box>

        <Typography sx={{
          fontWeight: 800,
          fontSize: { xs: 20, sm: 23 },
          letterSpacing: 0.6,
          color: '#0f172a',
          mb: 0.75,
          lineHeight: 1.2
        }}>
          ĐĂNG NHẬP HỆ THỐNG
        </Typography>

        <Typography sx={{
          color: '#64748b',
          fontSize: { xs: 13, sm: 13.5 },
          lineHeight: 1.6,
          fontWeight: 400
        }}>
          Hệ thống quản trị giám sát điện tử EMS
        </Typography>

        {/* Trusted badge */}
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.6, mt: 1.5,
          px: 1.5, py: 0.5, borderRadius: 20,
          bgcolor: alpha('#22c55e', 0.08), border: `1px solid ${alpha('#22c55e', 0.2)}`
        }}>
          <ShieldTick size={13} color="#16a34a" variant="Bold" />
          <Typography sx={{ fontSize: '0.68rem', color: '#15803d', fontWeight: 600 }}>
            Kết nối bảo mật SSL/TLS
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3.5, borderColor: alpha('#000', 0.07) }} />

      {/* ── Form ── */}
      <Formik
        initialValues={{ username: '', password: '', submit: null }}
        validationSchema={Yup.object().shape({
          username: Yup.string()
            .matches(/^\S*$/, intl.formatMessage({ id: 'no-spaces-allowed' }))
            .max(255)
            .required(intl.formatMessage({ id: 'username-required' })),
          password: Yup.string()
            .max(255)
            .required(intl.formatMessage({ id: 'password-required' }))
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
          <form noValidate onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Stack spacing={3}>
              {/* Username */}
              <Box>
                <Typography sx={{ mb: 1, fontWeight: 600, fontSize: 13.5, color: '#334155', letterSpacing: 0.1 }}>
                  Tên tài khoản
                </Typography>
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
                    sx: {
                      borderRadius: '12px',
                      bgcolor: '#f8fafc',
                      fontSize: 14.5,
                      py: 0.3,
                      transition: 'all 0.2s ease',
                      '& fieldset': { borderColor: 'rgba(0,0,0,0.1)', borderWidth: 1.5 },
                      '&:hover fieldset': { borderColor: `${alpha(PRIMARY, 0.4)} !important` },
                      '&.Mui-focused': {
                        bgcolor: '#fff',
                        boxShadow: `0 0 0 3px ${alpha(PRIMARY, 0.1)}`
                      },
                      '&.Mui-focused fieldset': { borderColor: `${PRIMARY} !important`, borderWidth: '1.5px !important' }
                    }
                  }}
                />
              </Box>

              {/* Password */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: '#334155', letterSpacing: 0.1 }}>
                    Mật khẩu
                  </Typography>
                  <Link
                    component={RouterLink}
                    to={isLoggedIn && forgot ? forgot : '/forgot-password'}
                    sx={{
                      fontSize: 12.5, color: PRIMARY, textDecoration: 'none', fontWeight: 600,
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Quên mật khẩu?
                  </Link>
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
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{
                            color: '#94a3b8',
                            '&:hover': { color: PRIMARY, bgcolor: alpha(PRIMARY, 0.06) }
                          }}
                        >
                          {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: '12px',
                      bgcolor: '#f8fafc',
                      fontSize: 14.5,
                      py: 0.3,
                      transition: 'all 0.2s ease',
                      '& fieldset': { borderColor: 'rgba(0,0,0,0.1)', borderWidth: 1.5 },
                      '&:hover fieldset': { borderColor: `${alpha(PRIMARY, 0.4)} !important` },
                      '&.Mui-focused': {
                        bgcolor: '#fff',
                        boxShadow: `0 0 0 3px ${alpha(PRIMARY, 0.1)}`
                      },
                      '&.Mui-focused fieldset': { borderColor: `${PRIMARY} !important`, borderWidth: '1.5px !important' }
                    }
                  }}
                />
              </Box>

              {/* Submit error */}
              {errors.submit && (
                <FormHelperText error sx={{ fontSize: 13, fontWeight: 500, mt: -1 }}>
                  {errors.submit}
                </FormHelperText>
              )}

              {/* Login button */}
              <LoadingButton
                loading={isSubmitting}
                fullWidth
                disableElevation
                disabled={isSubmitting}
                type="submit"
                size="large"
                variant="contained"
                sx={{
                  borderRadius: '12px',
                  py: 1.7,
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: 1.2,
                  background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
                  boxShadow: `0 4px 20px ${alpha(PRIMARY, 0.36)}`,
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${PRIMARY_DARK} 0%, ${PRIMARY_DARKER} 100%)`,
                    boxShadow: `0 8px 28px ${alpha(PRIMARY, 0.5)}`,
                    transform: 'translateY(-2px)'
                  },
                  '&:active': { transform: 'translateY(0)' },
                  '&.Mui-disabled': {
                    background: '#e2e8f0',
                    boxShadow: 'none'
                  }
                }}
              >
                ĐĂNG NHẬP HỆ THỐNG
              </LoadingButton>

              {/* Security notice */}
              <Stack
                direction="row"
                spacing={1.25}
                alignItems="flex-start"
                sx={{
                  p: 1.75,
                  borderRadius: '12px',
                  bgcolor: alpha(PRIMARY, 0.04),
                  border: `1px solid ${alpha(PRIMARY, 0.1)}`
                }}
              >
                <InfoCircle size={16} color="#3b82f6" style={{ marginTop: 1, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.65 }}>
                  Hệ thống chỉ dành cho nhân viên được ủy quyền. Mọi truy cập trái phép đều bị ghi nhận và xử lý theo quy định pháp luật.
                </Typography>
              </Stack>
            </Stack>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default AuthLogin;
