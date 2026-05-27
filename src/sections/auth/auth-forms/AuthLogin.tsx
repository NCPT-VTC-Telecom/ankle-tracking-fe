import { Box, Divider, FormHelperText, Link, Stack, TextField, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LoadingButton from 'components/@extended/LoadingButton';
import { Formik } from 'formik';
import useAuth from 'hooks/useAuth';
import useMapCode from 'hooks/useMapCode';
import useScriptRef from 'hooks/useScriptRef';
import { Eye, EyeSlash, InfoCircle, Lock1, Profile, ShieldSecurity } from 'iconsax-react';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';
import { dispatch } from 'store';
import { handlerIconVariants, openSnackbar } from 'store/reducers/snackbar';
import * as Yup from 'yup';

const AuthLogin = ({ forgot }: { forgot?: string }) => {
  const intl = useIntl();
  const { isLoggedIn, login } = useAuth();
  const scriptedRef = useScriptRef();
  const { getStatusMessage } = useMapCode();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box sx={{ width: '100%' }}>
      {/* ── Header ── */}
      <Box sx={{ mb: 3.5, textAlign: 'center' }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 52,
            height: 52,
            borderRadius: '14px',
            bgcolor: 'rgba(37, 99, 235, 0.08)',
            border: '1.5px solid rgba(37, 99, 235, 0.18)',
            mb: 2
          }}
        >
          <ShieldSecurity size={26} color="#2563eb" variant="Bold" />
        </Box>

        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: 18, sm: 21 },
            letterSpacing: 0.8,
            color: '#0f172a',
            mb: 0.75
          }}
        >
          ĐĂNG NHẬP HỆ THỐNG
        </Typography>

        <Typography
          sx={{
            color: '#64748b',
            fontSize: { xs: 12.5, sm: 13 },
            lineHeight: 1.55,
            fontWeight: 400
          }}
        >
          Hệ thống quản trị giám sát điện tử EMS


        </Typography>
      </Box>

      <Divider sx={{ mb: 3, borderColor: 'rgba(0,0,0,0.07)' }} />

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
            <Stack spacing={2.5}>
              {/* Username */}
              <Box>
                <Typography sx={{ mb: 0.75, fontWeight: 600, fontSize: 13, color: '#334155' }}>
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
                        <Profile size={18} color="#94a3b8" />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: '#f8fafc',
                      fontSize: 14,
                      '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' },
                      '&:hover fieldset': { borderColor: '#2563eb !important' },
                      '&.Mui-focused fieldset': { borderColor: '#2563eb !important' }
                    }
                  }}
                />
              </Box>

              {/* Password */}
              <Box>
                <Typography sx={{ mb: 0.75, fontWeight: 600, fontSize: 13, color: '#334155' }}>
                  Mật khẩu
                </Typography>
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
                        <Lock1 size={18} color="#94a3b8" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                          {showPassword ? <EyeSlash size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: '#f8fafc',
                      fontSize: 14,
                      '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' },
                      '&:hover fieldset': { borderColor: '#2563eb !important' },
                      '&.Mui-focused fieldset': { borderColor: '#2563eb !important' }
                    }
                  }}
                />
              </Box>

              {/* Submit error */}
              {errors.submit && (
                <FormHelperText error sx={{ fontSize: 13, fontWeight: 500 }}>
                  {errors.submit}
                </FormHelperText>
              )}

              {/* Forgot password */}
              <Box sx={{ textAlign: 'right', mt: -1 }}>
                <Link
                  component={RouterLink}
                  to={isLoggedIn && forgot ? forgot : '/forgot-password'}
                  sx={{
                    fontSize: 13,
                    color: '#2563eb',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Quên mật khẩu truy cập?
                </Link>
              </Box>

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
                  borderRadius: 2.5,
                  py: 1.55,
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: 1.1,
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  boxShadow: '0 4px 16px rgba(37, 99, 235, 0.32)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                    boxShadow: '0 6px 22px rgba(37, 99, 235, 0.48)',
                    transform: 'translateY(-1px)'
                  },
                  '&:active': { transform: 'translateY(0)' }
                }}
              >
                ĐĂNG NHẬP HỆ THỐNG
              </LoadingButton>

              {/* Security notice */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="flex-start"
                sx={{
                  mt: 0.5,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(37, 99, 235, 0.04)',
                  border: '1px solid rgba(37, 99, 235, 0.1)'
                }}
              >
                <InfoCircle size={15} color="#3b82f6" style={{ marginTop: 1, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.71rem', color: '#64748b', lineHeight: 1.55 }}>
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
