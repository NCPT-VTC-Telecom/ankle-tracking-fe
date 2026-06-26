import { useState, forwardRef, useImperativeHandle } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import { Formik } from 'formik';
import axios from 'axios';

// material-ui
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  Button,
  Grid,
  InputLabel,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';

// project-imports
import { PopupTransition } from 'shared/components/@extended/Transitions';
import LoadingButton from 'shared/components/@extended/LoadingButton';
import { RootState } from 'shared/store';
import { API_PATH_USER } from 'shared/utils/constant';
import useAuth from 'shared/hooks/useAuth';
import { getAccessToken } from 'shared/utils/auth';

// third-party
import { enqueueSnackbar } from 'notistack';

// assets
import { Eye, EyeSlash } from 'iconsax-react';

// types
export type ChangePasswordDialogRef = {
  open: () => void;
};

interface ChangePasswordDialogProps {
  onSubmitOk?: () => void;
}

interface PasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordDialog = forwardRef<ChangePasswordDialogRef, ChangePasswordDialogProps>(({ onSubmitOk }, ref) => {
  const intl = useIntl();
  const user = useSelector((state: RootState) => state.authSlice.user);
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => {
      setOpen(true);
    }
  }));

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
    }
  };

  const initialValues: PasswordFormValues = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  const validationSchema = Yup.object().shape({
    oldPassword: Yup.string().required(intl.formatMessage({ id: 'old-password-required' })),
    newPassword: Yup.string()
      .required(intl.formatMessage({ id: 'new-password-required' }))
      .min(8, intl.formatMessage({ id: 'at-least-8-characters' }))
      .notOneOf([Yup.ref('oldPassword')], intl.formatMessage({ id: 'new-password-must-be-different' })),
    confirmPassword: Yup.string()
      .required(intl.formatMessage({ id: 'confirm-password-required' }))
      .oneOf([Yup.ref('newPassword')], intl.formatMessage({ id: 'passwords-must-match' }))
  });

  const handleSubmit = async (values: PasswordFormValues, { setFieldError }: any) => {
    try {
      setLoading(true);

      const changePasswordResponse = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND_API_TEST_WIFI + API_PATH_USER.changePassword}?id=${user?.id}`,
        {
          username: user?.username,
          email: user?.email,
          oldPassword: values.oldPassword,
          newPassword: values.newPassword
        },
        {
          headers: {
            Authorization: `${getAccessToken()}`
          }
        }
      );

      if (changePasswordResponse.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'change-password-success-please-login-again' }), {
          variant: 'success',
          autoHideDuration: 5000
        });

        setOpen(false);
        onSubmitOk?.();

        // Logout user after successful password change with enough time to read the message
        setTimeout(() => {
          logout(true);
        }, 3000);
      } else {
        enqueueSnackbar(changePasswordResponse.data.message || intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
      }
    } catch (error: any) {
      // Handle network errors or other exceptions
      if (error.response?.data?.message) {
        enqueueSnackbar(error.response.data.message, {
          variant: 'error'
        });
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={PopupTransition}
      keepMounted
      maxWidth="xs"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
    >
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit: formikHandleSubmit }) => (
          <form onSubmit={formikHandleSubmit}>
            <DialogTitle sx={{ px: 3, py: 2.5 }}>
              <span className="text-lg font-semibold">{intl.formatMessage({ id: 'change-password' })}</span>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ px: 3, py: 3 }}>
              <Grid container spacing={2.5}>
                {/* Old Password */}
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="oldPassword">
                      {intl.formatMessage({ id: 'old-password' })}
                      <span className="text-red-500 text-[16px]"> *</span>
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="oldPassword"
                      name="oldPassword"
                      type={showOldPassword ? 'text' : 'password'}
                      placeholder={intl.formatMessage({ id: 'enter-old-password' })}
                      value={values.oldPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.oldPassword && errors.oldPassword)}
                      helperText={touched.oldPassword && errors.oldPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowOldPassword((prev) => !prev)} edge="end">
                              {showOldPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      disabled={loading}
                    />
                  </Stack>
                </Grid>

                {/* New Password */}
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="newPassword">
                      {intl.formatMessage({ id: 'new-password' })}
                      <span className="text-red-500 text-[16px]"> *</span>
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder={intl.formatMessage({ id: 'enter-new-password' })}
                      value={values.newPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.newPassword && errors.newPassword)}
                      helperText={touched.newPassword && errors.newPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowNewPassword((prev) => !prev)} edge="end">
                              {showNewPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      disabled={loading}
                    />
                  </Stack>
                </Grid>

                {/* Confirm Password */}
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="confirmPassword">
                      {intl.formatMessage({ id: 'confirm-password' })}
                      <span className="text-red-500 text-[16px]"> *</span>
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={intl.formatMessage({ id: 'enter-confirm-password' })}
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                      helperText={touched.confirmPassword && errors.confirmPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirmPassword((prev) => !prev)} edge="end">
                              {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      disabled={loading}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={handleClose} color="secondary" variant="text" disabled={loading}>
                {intl.formatMessage({ id: 'cancel' })}
              </Button>
              <LoadingButton loading={loading} disabled={loading} type="submit" color="success" variant="contained">
                {intl.formatMessage({ id: 'confirm' })}
              </LoadingButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Dialog>
  );
});

ChangePasswordDialog.displayName = 'ChangePasswordDialog';

export default ChangePasswordDialog;
