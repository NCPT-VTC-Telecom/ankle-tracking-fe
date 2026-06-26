import { useNavigate } from 'react-router-dom';

// material-ui
import { Box, FormHelperText, Grid, Link, Stack, TextField, Typography } from '@mui/material';

// third-party
import { Formik } from 'formik';
import * as Yup from 'yup';

// project-imports
import LoadingButton from 'shared/components/@extended/LoadingButton';
import useAuth from 'shared/hooks/useAuth';
import useMapCode from 'shared/hooks/useMapCode';
import useScriptRef from 'shared/hooks/useScriptRef';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';
import { dispatch } from 'shared/store';
import { openSnackbar } from 'shared/store/reducers/snackbar';

// ============================|| FIREBASE - FORGOT PASSWORD ||============================ //

const AuthForgotPassword = () => {
  const scriptedRef = useScriptRef();
  const navigate = useNavigate();
  const { getStatusMessage } = useMapCode();
  const intl = useIntl();

  const { isLoggedIn, verifyEmail } = useAuth();

  return (
    <>
      <Box sx={{ mb: 7, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: 0.5
          }}
        >
          <FormattedMessage id="forgot-password" />
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 400,
            fontSize: 13
          }}
        >
          <FormattedMessage id="system-title" />
        </Typography>
      </Box>
      <Formik
        initialValues={{
          email: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string()
            .email(intl.formatMessage({ id: 'email-invalid' }))
            .max(255)
            .required(intl.formatMessage({ id: 'email-required' }))
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            const res: any = await verifyEmail(values.email);

            if (res && res.code === 0) {
              setStatus({ success: true });
              setSubmitting(false);
              dispatch(
                openSnackbar({
                  open: true,
                  message: intl.formatMessage({ id: 'check-mail-for-reset-password' }),
                  variant: 'alert',
                  alert: {
                    color: 'success'
                  },
                  close: false
                })
              );
              setTimeout(() => {
                navigate(isLoggedIn ? `/auth/check-mail/${res.data.user.email}` : `/check-mail/${res.data.user.email}`, { replace: true });
              }, 1500);
            } else {
              setStatus({ success: false });
              setErrors({ submit: getStatusMessage('general', res.code) });
              setSubmitting(false);
            }
            // await resetPassword(values.email).then(
            //   () => {
            //     // WARNING: do not set any formik state here as formik might be already destroyed here. You may get following error by doing so.
            //     // Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application.
            //     // To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
            //     // github issue: https://github.com/formium/formik/issues/2430
            //   },
            //   (err: any) => {
            //     setStatus({ success: false });
            //     setErrors({ submit: err.message });
            //     setSubmitting(false);
            //   }
            // );
          } catch (err: any) {
            if (scriptedRef.current) {
              setStatus({ success: false });
              setErrors({ submit: err.message });
              setSubmitting(false);
            }
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <div>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 0.75,
                    ml: 0.5,
                    fontWeight: 500,
                    fontSize: 14
                  }}
                >
                  {intl.formatMessage({ id: 'email-address', defaultMessage: 'Email Address' })}
                </Typography>
                <TextField
                  fullWidth
                  id="email-forgot"
                  type="email"
                  value={values.email}
                  name="email"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder={intl.formatMessage({ id: 'enter-email' })}
                  inputProps={{}}
                  error={Boolean(touched.email && errors.email)}
                  helperText={touched.email && errors.email}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 3 }
                  }}
                />
              </div>
              {errors.submit && (
                <FormHelperText
                  sx={{
                    ml: 0.5,
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#ff6b6b'
                  }}
                  error
                >
                  {errors.submit}
                </FormHelperText>
              )}
              <Box sx={{ textAlign: 'end' }}>
                <Link
                  component={RouterLink}
                  to={isLoggedIn ? '/auth/login' : '/login'}
                  variant="body2"
                  sx={{
                    fontSize: 14,
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                >
                  <FormattedMessage id="back-to-login" defaultMessage={'Back to login'} />
                </Link>
              </Box>
              {/* <Grid item xs={12} sx={{ mb: -2 }}>
                <Typography variant="caption">{intl.formatMessage({ id: 'do-not-forgot-to-check-spam-box' })}</Typography>
              </Grid> */}
              <Grid item xs={12}>
                <LoadingButton
                  loading={isSubmitting}
                  disableElevation
                  disabled={isSubmitting}
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  {intl.formatMessage({ id: 'send-email', defaultMessage: 'Send email' })}
                </LoadingButton>
              </Grid>
            </Stack>
          </form>
        )}
      </Formik>
    </>
  );
};

export default AuthForgotPassword;
