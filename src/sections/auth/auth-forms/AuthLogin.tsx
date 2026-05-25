import { Box, Button, FormHelperText, Link, Stack, TextField, Typography } from '@mui/material';
import LoadingButton from 'components/@extended/LoadingButton';
import { Formik } from 'formik';
import useAuth from 'hooks/useAuth';
import useMapCode from 'hooks/useMapCode';
import useScriptRef from 'hooks/useScriptRef';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';
import { dispatch } from 'store';
import { handlerIconVariants, openSnackbar } from 'store/reducers/snackbar';
import * as Yup from 'yup';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { Eye, EyeSlash, ShieldSecurity, Lock1, Profile } from 'iconsax-react';

const AuthLogin = ({ forgot }: { forgot?: string }) => {
  const intl = useIntl();
  const { isLoggedIn, login } = useAuth();
  const scriptedRef = useScriptRef();
  const { getStatusMessage } = useMapCode();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Stack direction="row" spacing={1.2} justifyContent="center" alignItems="center" sx={{ mb: 1 }}>
          <ShieldSecurity size={28} color="#2563eb" variant="Bold" />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              fontSize: { xs: 20, sm: 24 },
              letterSpacing: 0.5,
              background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            ĐĂNG NHẬP HỆ THỐNG
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
            fontSize: { xs: 13, sm: 14 },
            lineHeight: 1.4
          }}
        >
          Trung tâm Giám sát Điện tử & Định vị Phạm nhân Ankle Tracker EMS
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
                enqueueSnackbar(getStatusMessage('login', res.code), {
                  variant: 'error'
                });
              }
            }
          } catch {
            if (scriptedRef.current) {
              setStatus({ success: false });
              setErrors({
                submit: intl.formatMessage({
                  id: 'verify-your-username-and-password'
                })
              });
              setSubmitting(false);
              dispatch(handlerIconVariants({ iconVariant: 'useemojis' }));
              enqueueSnackbar(intl.formatMessage({ id: 'login-failed' }), { variant: 'error' });
            }
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => (
          <form noValidate onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Stack spacing={3}>
              {/* Username */}
              <div>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 0.75,
                    ml: 0.5,
                    fontWeight: 600,
                    fontSize: 13,
                    color: 'text.primary'
                  }}
                >
                  Tên tài khoản quản trị
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  name="username"
                  placeholder="Nhập tên đăng nhập của bạn"
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
                    sx: { borderRadius: 3 }
                  }}
                />
              </div>
              {/* Password */}
              <div>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 0.75,
                    ml: 0.5,
                    fontWeight: 600,
                    fontSize: 13,
                    color: 'text.primary'
                  }}
                >
                  Mật khẩu bảo mật
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
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 3 }
                  }}
                />
              </div>
              {/* Error text */}
              {errors.submit && (
                <FormHelperText
                  error
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#dc2626'
                  }}
                >
                  {errors.submit}
                </FormHelperText>
              )}
              {/* Forgot password */}
              <Box sx={{ textAlign: 'end' }}>
                <Link
                  variant="body2"
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
                  borderRadius: 3,
                  py: 1.5,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 15,
                  bgcolor: '#2563eb',
                  '&:hover': {
                    bgcolor: '#1d4ed8'
                  }
                }}
              >
                ĐĂNG NHẬP HỆ THỐNG
              </LoadingButton>

              {/* Demo Accounts Panel */}
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 3,
                  bgcolor: 'rgba(37, 99, 235, 0.03)',
                  border: '1.5px dashed rgba(37, 99, 235, 0.15)',
                  textAlign: 'center'
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    fontWeight: 700,
                    color: '#2563eb',
                    mb: 1.5,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                    fontSize: '0.7rem'
                  }}
                >
                  Cổng kết nối tài khoản kiểm thử
                </Typography>
                <Stack direction="row" justifyContent="center">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      setFieldValue('username', 'gosafe_admin');
                      setFieldValue('password', 'admin');
                    }}
                    startIcon={<ShieldSecurity size={14} />}
                    sx={{
                      borderRadius: 2,
                      px: 3.5,
                      py: 0.75,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      bgcolor: '#2563eb',
                      color: '#ffffff',
                      textTransform: 'none',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
                      '&:hover': {
                        bgcolor: '#1d4ed8',
                        boxShadow: '0 6px 16px rgba(37, 99, 235, 0.25)'
                      }
                    }}
                  >
                    Đăng nhập tài khoản Demo (GoSafe Admin)
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default AuthLogin;
