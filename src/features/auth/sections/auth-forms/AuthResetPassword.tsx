import { useEffect, useState, SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import useMapCode from 'shared/hooks/useMapCode';
import { useParams } from 'react-router-dom';
// material-ui
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography
} from '@mui/material';

// third-party
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { enqueueSnackbar } from 'notistack';

// project-imports
import useAuth from 'shared/hooks/useAuth';
import useScriptRef from 'shared/hooks/useScriptRef';
import IconButton from 'shared/components/@extended/IconButton';
import AnimateButton from 'shared/components/@extended/AnimateButton';

//redux
import { dispatch } from 'shared/store';
import { openSnackbar, handlerIconVariants } from 'shared/store/reducers/snackbar';
import { strengthColor, strengthIndicator } from 'shared/utils/password-strength';
import { isNumber, isLowercaseChar, isUppercaseChar, isSpecialChar, minLength } from 'shared/utils/password-validation';

// types
import { StringColorProps } from 'shared/types/password';

// assets
import { Eye, EyeSlash } from 'iconsax-react';
import { FormattedMessage, useIntl } from 'react-intl';

// ============================|| FIREBASE - RESET PASSWORD ||============================ //

const AuthResetPassword = () => {
  const scriptedRef = useScriptRef();
  const { email } = useParams();
  const navigate = useNavigate();
  const { getStatusMessage } = useMapCode();
  const intl = useIntl();

  const { isLoggedIn, resetPassword, verifyEmail } = useAuth();

  const [level, setLevel] = useState<StringColorProps>();
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  const changePassword = (value: string) => {
    const temp = strengthIndicator(value);
    setLevel(strengthColor(temp));
  };

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      submit: null
    },
    validationSchema: Yup.object({
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
        ),
      confirmPassword: Yup.string()
        .required(intl.formatMessage({ id: 'confirm-password-required' }))
        .test('passwords-match', intl.formatMessage({ id: 'both-password-must-be-match' }), function (value) {
          return this.parent.password === value;
        })
    }),
    onSubmit: async (values, { setErrors, setStatus, setSubmitting }) => {
      try {
        const res: any = await resetPassword(values.username, values.email, values.password);
        if (res && res.code === 0) {
          setStatus({ success: true });
          setSubmitting(false);
          dispatch(
            openSnackbar({
              open: true,
              message: intl.formatMessage({ id: 'successfully-reset-password' }),
              variant: 'alert',
              alert: {
                color: 'success'
              },
              close: false
            })
          );

          setTimeout(() => {
            navigate(isLoggedIn ? '/auth/login' : '/login', { replace: true });
          }, 1500);
        } else {
          setStatus({ success: false });
          setSubmitting(false);
          setErrors({ submit: getStatusMessage('general', res.code) });
        }
      } catch (err: any) {
        if (scriptedRef.current) {
          setStatus({ success: false });
          setErrors({ submit: err.message });
          setSubmitting(false);
        }
      }
    }
  });

  const { handleSubmit, handleChange, handleBlur, isSubmitting, values, touched, errors, setValues } = formik;

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (email) {
        try {
          const res: any = await verifyEmail(email);

          if (res.code === 0) {
            setValues({
              username: res.data.user.username,
              email: res.data.user.email,
              password: '',
              confirmPassword: '',
              submit: null
            });
          } else {
            navigate('/login');
          }
        } catch (err) {
          dispatch(
            handlerIconVariants({
              iconVariant: 'useemojis'
            })
          );
          enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
            variant: 'error'
          });
        }
      }
    };

    fetchUserInfo();
    changePassword('');
    //eslint-disable-next-line
  }, [email, verifyEmail, setValues]);

  return (
    <>
      <form noValidate onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="username-reset">
                <FormattedMessage id="username" />
              </InputLabel>
              <OutlinedInput
                fullWidth
                error={Boolean(touched.username && errors.username)}
                id="username-reset"
                value={values.username}
                name="password"
                onBlur={handleBlur}
                inputProps={{ readOnly: true }}
                onChange={(e) => {
                  handleChange(e);
                }}
                placeholder={intl.formatMessage({ id: 'enter-username' })}
              />
              {touched.username && errors.username && (
                <FormHelperText error id="helper-text-username-reset">
                  {errors.username}
                </FormHelperText>
              )}
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="email-reset">
                <FormattedMessage id="email-address" />
              </InputLabel>
              <OutlinedInput
                fullWidth
                error={Boolean(touched.email && errors.email)}
                id="email-reset"
                value={values.email}
                name="password"
                onBlur={handleBlur}
                inputProps={{ readOnly: true }}
                onChange={(e) => {
                  handleChange(e);
                }}
                placeholder={intl.formatMessage({ id: 'enter-email' })}
              />
              {touched.email && errors.email && (
                <FormHelperText error id="helper-text-email-reset">
                  {errors.email}
                </FormHelperText>
              )}
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="password-reset">
                <FormattedMessage id="password" />
              </InputLabel>
              <OutlinedInput
                fullWidth
                error={Boolean(touched.password && errors.password)}
                id="password-reset"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                name="password"
                onBlur={handleBlur}
                onChange={(e) => {
                  handleChange(e);
                  changePassword(e.target.value);
                }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      color="secondary"
                    >
                      {showPassword ? <Eye /> : <EyeSlash />}
                    </IconButton>
                  </InputAdornment>
                }
                placeholder={intl.formatMessage({ id: 'enter-password' })}
              />
              {touched.password && errors.password && (
                <FormHelperText error id="helper-text-password-reset">
                  {errors.password}
                </FormHelperText>
              )}
            </Stack>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Box sx={{ bgcolor: level?.color, width: 85, height: 8, borderRadius: '7px' }} />
                </Grid>
                <Grid item>
                  <Typography variant="subtitle1" fontSize="0.75rem">
                    <FormattedMessage id={level?.label || 'Poor'} />
                  </Typography>
                </Grid>
              </Grid>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="confirm-password-reset">
                <FormattedMessage id="confirm-password" />
              </InputLabel>
              <OutlinedInput
                fullWidth
                error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                id="confirm-password-reset"
                type="password"
                value={values.confirmPassword}
                name="confirmPassword"
                onBlur={handleBlur}
                onChange={handleChange}
                placeholder={intl.formatMessage({ id: 'enter-confirm-password' })}
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <FormHelperText error id="helper-text-confirm-password-reset">
                  {errors.confirmPassword}
                </FormHelperText>
              )}
            </Stack>
          </Grid>

          {errors.submit && (
            <Grid item xs={12}>
              <FormHelperText error>{errors.submit}</FormHelperText>
            </Grid>
          )}
          <Grid item xs={12}>
            <AnimateButton>
              <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
                <FormattedMessage id="reset-password" />
              </Button>
            </AnimateButton>
          </Grid>
        </Grid>
      </form>
    </>
  );
};

export default AuthResetPassword;
