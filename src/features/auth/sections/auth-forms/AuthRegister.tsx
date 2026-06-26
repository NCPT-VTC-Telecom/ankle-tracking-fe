import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// material-ui
import {
  alpha,
  Box,
  Button,
  FormControl,
  Grid,
  Link,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material';

// third-party
import * as Yup from 'yup';
import { Formik, FormikValues } from 'formik';
import { enqueueSnackbar } from 'notistack';

//utils
import { isNumber, isLowercaseChar, isUppercaseChar, isSpecialChar, minLength } from 'shared/utils/password-validation';
import { strengthColor, strengthIndicator } from 'shared/utils/password-strength';

// project-imports
import useAuth from 'shared/hooks/useAuth';
import useScriptRef from 'shared/hooks/useScriptRef';
import IconButton from 'shared/components/@extended/IconButton';

//redux
import { dispatch } from 'shared/store';
import { openSnackbar, handlerIconVariants } from 'shared/store/reducers/snackbar';

// types
import { StringColorProps } from 'shared/types/password';

// assets
import { Eye, EyeSlash, Lock1, Sms, Call, Profile, InfoCircle } from 'iconsax-react';
import { FormattedMessage, useIntl } from 'react-intl';

//Hook
import useMapCode from 'shared/hooks/useMapCode';
import { useSelector } from 'shared/store';

// ============================|| JWT - REGISTER ||============================ //

const AuthRegister = () => {
  const { register } = useAuth();
  const scriptedRef = useScriptRef();
  const navigate = useNavigate();
  const userSocial = useSelector((state) => state.authSlice.userSocial);
  const intl = useIntl();
  const { getStatusMessage } = useMapCode();

  const [level, setLevel] = useState<StringColorProps>();
  const [showPassword, setShowPassword] = useState(false);

  const PRIMARY = '#2563eb'; // Blue-600
  const SECONDARY = '#0ea5e9'; // Sky-500

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };


  const changePassword = (value: string) => {
    const temp = strengthIndicator(value);
    setLevel(strengthColor(temp));
  };

  const getInitialValues = (user: FormikValues | null) => {
    const newUser = {
      firstname: '',
      lastname: '',
      email: '',
      phonenumber: '',
      username: '',
      password: '',
      submit: null,
      user_group: [1]
    };

    if (user) {
      newUser.firstname = user.given_name || user.first_name;
      newUser.lastname = user.family_name || user.last_name;
      newUser.email = user.email;
      newUser.phonenumber = '';
      newUser.username = '';
      newUser.submit = null;
      newUser.password = '';
      newUser.user_group = [1];

      return newUser;
    }

    return newUser;
  };

  useEffect(() => {
    changePassword('');
  }, []);

  return (
    <Formik
      initialValues={getInitialValues(userSocial)}
      validationSchema={Yup.object().shape({
        firstname: Yup.string()
          .max(255)
          .required(intl.formatMessage({ id: 'first-name-required' })),
        lastname: Yup.string()
          .max(255)
          .required(intl.formatMessage({ id: 'last-name-required' })),
        username: Yup.string()
          .matches(/^\S*$/, intl.formatMessage({ id: 'no-spaces-allowed' }))
          .max(255)
          .required(intl.formatMessage({ id: 'user-name-required' })),
        phonenumber: Yup.string()
          .matches(/^\S*$/, intl.formatMessage({ id: 'no-spaces-allowed' }))
          .matches(/^\d+$/, intl.formatMessage({ id: 'numbers-only-allowed' }))
          .required(intl.formatMessage({ id: 'phone-number-required' }))
          .length(10, intl.formatMessage({ id: 'phone-number-max-10' })),
        email: Yup.string()
          .matches(/^\S*$/, intl.formatMessage({ id: 'no-spaces-allowed' }))
          .email(intl.formatMessage({ id: 'email-invalid' }))
          .max(255)
          .required(intl.formatMessage({ id: 'email-address-required' })),
        password: Yup.string()
          .required(intl.formatMessage({ id: 'password-required' }))
          .test('is-long-enough', intl.formatMessage({ id: 'at-least-8-characters' }), (value) => minLength(value))
          .test('has-number', intl.formatMessage({ id: 'at-least-1-number' }), (value) => isNumber(value))
          .test('has-lowercase', intl.formatMessage({ id: 'at-least-1-lower-letter' }), (value) => isLowercaseChar(value))
          .test('has-uppercase', intl.formatMessage({ id: 'at-least-1-uppercase-letter' }), (value) => isUppercaseChar(value))
          .test('has-special-char', intl.formatMessage({ id: 'at-least-1-special-characters' }), (value) => isSpecialChar(value))
          .matches(
            /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
            intl.formatMessage({ id: 'password-must-contain-at-least-8-characters-uppercase-number-special' })
          )
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
          const res: any = await register(
            values.phonenumber,
            values.username,
            values.email,
            values.password,
            values.firstname,
            values.lastname,
            true
          );
          if (scriptedRef.current) {
            if (res.code === 0) {
              setStatus({ success: true });
              setSubmitting(false);
              dispatch(
                openSnackbar({
                  open: true,
                  message: intl.formatMessage({ id: 'registration-successfully' }),
                  variant: 'alert',
                  alert: {
                    color: 'success'
                  },
                  close: false
                })
              );

              setTimeout(() => {
                navigate('/login', { replace: true });
              }, 1000);
            } else {
              setStatus({ success: true });
              setSubmitting(false);
              dispatch(
                handlerIconVariants({
                  iconVariant: 'useemojis'
                })
              );
              enqueueSnackbar(getStatusMessage('registration', res.code), {
                variant: 'error'
              });
            }
          }
        } catch (err: any) {
          if (scriptedRef.current) {
            setStatus({ success: false });
            setErrors({ submit: err.message });
            setSubmitting(false);
          }

          dispatch(
            handlerIconVariants({
              iconVariant: 'useemojis'
            })
          );
          enqueueSnackbar(intl.formatMessage({ id: 'registration-failed' }), {
            variant: 'error'
          });
        }
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form noValidate onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            {/* First Name & Last Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                name="firstname"
                placeholder={intl.formatMessage({ id: 'first-name' })}
                value={values.firstname}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(touched.firstname && errors.firstname)}
                FormHelperTextProps={{ sx: { color: '#dc2626 !important', fontSize: '0.75rem', mt: 0.5, fontWeight: 500 } }}
                helperText={touched.firstname && errors.firstname}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1.5 }}>
                      <Profile size={20} color={values.firstname ? PRIMARY : '#475569'} />
                    </InputAdornment>
                  ),
                  sx: inputSx(!!values.firstname)
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                name="lastname"
                placeholder={intl.formatMessage({ id: 'last-name' })}
                value={values.lastname}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(touched.lastname && errors.lastname)}
                FormHelperTextProps={{ sx: { color: '#dc2626 !important', fontSize: '0.75rem', mt: 0.5, fontWeight: 500 } }}
                helperText={touched.lastname && errors.lastname}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1.5 }}>
                      <Profile size={20} color={values.lastname ? PRIMARY : '#475569'} />
                    </InputAdornment>
                  ),
                  sx: inputSx(!!values.lastname)
                }}
              />
            </Grid>

            {/* Phone Number */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                name="phonenumber"
                placeholder={intl.formatMessage({ id: 'phone-number' })}
                value={values.phonenumber}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(touched.phonenumber && errors.phonenumber)}
                FormHelperTextProps={{ sx: { color: '#dc2626 !important', fontSize: '0.75rem', mt: 0.5, fontWeight: 500 } }}
                helperText={touched.phonenumber && errors.phonenumber}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1.5 }}>
                      <Call size={20} color={values.phonenumber ? PRIMARY : '#475569'} />
                    </InputAdornment>
                  ),
                  sx: inputSx(!!values.phonenumber)
                }}
              />
            </Grid>

            {/* Email Address */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                name="email"
                placeholder={intl.formatMessage({ id: 'email-address' })}
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(touched.email && errors.email)}
                FormHelperTextProps={{ sx: { color: '#dc2626 !important', fontSize: '0.75rem', mt: 0.5, fontWeight: 500 } }}
                helperText={touched.email && errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1.5 }}>
                      <Sms size={20} color={values.email ? PRIMARY : '#475569'} />
                    </InputAdornment>
                  ),
                  sx: inputSx(!!values.email)
                }}
              />
            </Grid>

            {/* Username */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                name="username"
                placeholder={intl.formatMessage({ id: 'username' })}
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(touched.username && errors.username)}
                FormHelperTextProps={{ sx: { color: '#dc2626 !important', fontSize: '0.75rem', mt: 0.5, fontWeight: 500 } }}
                helperText={touched.username && errors.username}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1.5 }}>
                      <Profile size={20} color={values.username ? PRIMARY : '#475569'} />
                    </InputAdornment>
                  ),
                  sx: inputSx(!!values.username)
                }}
              />
            </Grid>

            {/* Password */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={intl.formatMessage({ id: 'password' })}
                value={values.password}
                onChange={(e) => {
                  handleChange(e);
                  changePassword(e.target.value);
                }}
                onBlur={handleBlur}
                error={Boolean(touched.password && errors.password)}
                FormHelperTextProps={{ sx: { color: '#dc2626 !important', fontSize: '0.75rem', mt: 0.5, fontWeight: 500 } }}
                helperText={touched.password && errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1.5 }}>
                      <Lock1 size={20} color={values.password ? PRIMARY : '#475569'} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        edge="end" size="small"
                        sx={{ color: '#475569', '&:hover': { color: PRIMARY, bgcolor: alpha(PRIMARY, 0.08) } }}
                      >
                        {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: inputSx(!!values.password)
                }}
              />

              <FormControl fullWidth sx={{ mt: 1.5 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Box sx={{ bgcolor: level?.color || 'transparent', width: 85, height: 8, borderRadius: '7px', transition: 'background-color 0.3s ease' }} />
                  </Grid>
                  <Grid item>
                    <Typography sx={{ color: level?.color || '#64748b', fontSize: '0.78rem', fontWeight: 600 }}>
                      <FormattedMessage id={level?.label || 'Poor'} />
                    </Typography>
                  </Grid>
                </Grid>
              </FormControl>
            </Grid>

            {/* Terms and Privacy policy */}
            <Grid item xs={12}>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
                <FormattedMessage id="by-signing-up-you-agree-to-our" /> &nbsp;
                <Link variant="subtitle2" component={RouterLink} to="#" sx={{ color: PRIMARY, textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
                  <FormattedMessage id="terms-of-service" />
                </Link>
                &nbsp; <FormattedMessage id="and" /> &nbsp;
                <Link variant="subtitle2" component={RouterLink} to="#" sx={{ color: PRIMARY, textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
                  <FormattedMessage id="private-policy" />
                </Link>
              </Typography>
            </Grid>

            {/* Form Submit Error Callout */}
            {errors.submit && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.75,
                    borderRadius: '12px',
                    bgcolor: alpha('#ef4444', 0.07),
                    border: `1px solid ${alpha('#ef4444', 0.2)}`,
                    width: '100%'
                  }}
                >
                  <InfoCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#b91c1c' }}>
                    {errors.submit}
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Action Buttons Row */}
            <Grid item xs={12}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%', mt: 1.5 }}>
                <Button
                  disableElevation
                  disabled={isSubmitting}
                  type="submit"
                  variant="contained"
                  sx={{
                    flex: 1,
                    whiteSpace: 'nowrap',
                    borderRadius: '12px',
                    py: 1.6,
                    fontWeight: 700,
                    fontSize: 14,
                    letterSpacing: 0.8,
                    background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`,
                    boxShadow: `0 6px 20px ${alpha(PRIMARY, 0.25)}`,
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: `linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)`,
                      boxShadow: `0 8px 24px ${alpha(PRIMARY, 0.45)}`,
                      transform: 'translateY(-1.5px)'
                    },
                    '&:active': { transform: 'translateY(0)' },
                    '&.Mui-disabled': { background: '#e2e8f0', color: '#94a3b8', boxShadow: 'none' }
                  }}
                >
                  ĐĂNG KÝ
                </Button>

                <Box
                  component={RouterLink}
                  to="/login"
                  sx={{
                    flex: 1,
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    py: 1.6,
                    fontWeight: 700,
                    fontSize: 14,
                    letterSpacing: 0.8,
                    color: PRIMARY,
                    bgcolor: '#fff',
                    border: `1.5px solid ${alpha(PRIMARY, 0.4)}`,
                    textDecoration: 'none',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: PRIMARY,
                      bgcolor: alpha(PRIMARY, 0.06),
                      transform: 'translateY(-1.5px)'
                    },
                    '&:active': { transform: 'translateY(0)' }
                  }}
                >
                  ĐĂNG NHẬP
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </form>
      )}
    </Formik>
  );
};

// ─── Shared Input Styles ──────────────────────────────────────────────────────
const inputSx = (hasValue: boolean) => ({
  borderRadius: '12px',
  bgcolor: '#f8fafc',
  fontSize: 14.5,
  color: '#0f172a',
  transition: 'all 0.25s ease',
  '& input': {
    color: '#0f172a',
    py: 1.6,
    '&::placeholder': {
      color: '#94a3b8',
      opacity: 1
    }
  },
  '& fieldset': {
    borderColor: hasValue ? 'rgba(37,99,235,0.35)' : 'rgba(15,23,42,0.1)',
    borderWidth: '1.5px',
    transition: 'all 0.2s ease'
  },
  '&:hover fieldset': {
    borderColor: 'rgba(37,99,235,0.45) !important'
  },
  '&.Mui-focused': {
    bgcolor: '#ffffff',
    boxShadow: '0 0 0 3px rgba(37,99,235,0.1)'
  },
  '&.Mui-focused fieldset': {
    borderColor: '#2563eb !important',
    borderWidth: '1.5px !important'
  },
  '&.Mui-error fieldset': {
    borderColor: '#ef4444 !important'
  }
});

export default AuthRegister;
