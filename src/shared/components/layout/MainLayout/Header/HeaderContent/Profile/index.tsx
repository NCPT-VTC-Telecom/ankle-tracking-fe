import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

// material-ui
import { Box, Button, CircularProgress, ClickAwayListener, Paper, Popper, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project-imports
// import SettingTab from './SettingTab';
import Transitions from 'shared/components/@extended/Transitions';
import useAuth from 'shared/hooks/useAuth';
import ChangePasswordDialog, { ChangePasswordDialogRef } from './ChangePasswordDialog';

//redux
import { RootState, dispatch } from 'shared/store';
import { handlerIconVariants } from 'shared/store/reducers/snackbar';

//third-party
import { enqueueSnackbar } from 'notistack';

// assets
// import avatar1 from 'assets/images/users/avatar-6.png';
import {
  ArrowDown2,
  Key,
  //  Setting2,
  // Profile,
  Logout
} from 'iconsax-react';

// types
import { FormattedMessage, useIntl } from 'react-intl';
import settings from 'settings';
// types
// interface TabPanelProps {
//   children?: ReactNode;
//   dir?: string;
//   index: number;
//   value: number;
// }

// tab panel wrapper
// function TabPanel(props: TabPanelProps) {
//   const { children, value, index, ...other } = props;

//   return (
//     <Box
//       role="tabpanel"
//       hidden={value !== index}
//       id={`profile-tabpanel-${index}`}
//       aria-labelledby={`profile-tab-${index}`}
//       {...other}
//       sx={{ p: 1 }}
//     >
//       {value === index && children}
//     </Box>
//   );
// }

// function a11yProps(index: number) {
//   return {
//     id: `profile-tab-${index}`,
//     'aria-controls': `profile-tabpanel-${index}`
//   };
// }

// ==============================|| HEADER CONTENT - PROFILE ||============================== //

const ProfilePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const intl = useIntl();

  const { logout } = useAuth();
  const changePasswordDialogRef = useRef<ChangePasswordDialogRef>(null);
  const [loadingLogout, setLoadingLogout] = useState(false);

  const user = useSelector((state: RootState) => state.authSlice.user);

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      await logout();
      navigate(`/login`, {
        state: {
          from: ''
        }
      });
    } catch (err) {
      dispatch(
        handlerIconVariants({
          iconVariant: 'useemojis'
        })
      );
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    } finally {
      setLoadingLogout(false);
    }
  };

  const handleChangePassword = () => {
    changePasswordDialogRef.current?.open();
  };

  const anchorRef = useRef<any>(null);
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  // const [value, setValue] = useState(0);

  // const handleChange = (event: SyntheticEvent, newValue: number) => {
  //   setValue(newValue);
  // };

  return (
    <Box sx={{ flexShrink: 0 }}>
      <Box
        sx={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1.5,
          borderRadius: '50%',
          backdropFilter: 'blur(6px)',
          bgcolor: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(30,30,30,0.8)',
          border: `1px solid ${theme.palette.mode === 'light' ? theme.palette.divider : 'rgba(255,255,255,0.12)'}`,
          boxShadow: theme.palette.mode === 'light' ? '0 1px 3px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.4)',
          '&:hover': {
            bgcolor: theme.palette.mode === 'light' ? 'rgba(255,255,255,1)' : 'rgba(50,50,50,0.9)',
            boxShadow: theme.palette.mode === 'light' ? '0 2px 6px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.6)'
          }
        }}
        className="cursor-pointer flex items-center justify-center md:p-2 h-11 w-11 md:w-auto rounded-full transition-shadow duration-300 backdrop-blur-sm md:px-3"
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img
              alt="profile user"
              src={user?.avatar || settings.logoDefault}
              className="object-contain h-full w-full md:w-8 md:h-8 rounded-full bg-white"
            />
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column'
              }}
            >
              <Typography
                variant="subtitle2"
                noWrap
                sx={{
                  maxWidth: 100,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  color: theme.palette.text.primary
                }}
              >
                {user?.fullname || user?.username}
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{
                  maxWidth: 100,
                  fontSize: 10,
                  color: theme.palette.text.secondary
                }}
              >
                {user?.email}
              </Typography>
            </Box>
          </div>
          <ArrowDown2
            size="16"
            style={{ color: theme.palette.text.secondary }}
            className={`hidden md:block transition-transform duration-300 ${open ? 'rotate-180' : 'rotate-0'}`}
          />
        </div>
      </Box>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position="top-right" in={open} {...TransitionProps}>
            <Paper
              sx={{
                width: 320,
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: theme.customShadows.z1,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Stack spacing={2} sx={{ p: 2.5 }}>
                  {/* Header */}
                  <Stack alignItems="center" spacing={1.2}>
                    <Box
                      sx={{
                        position: 'relative',
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      <img src={user?.avatar || settings?.logoDefault} alt="profile" className="object-contain w-full h-full" />
                    </Box>

                    <Typography variant="h3" fontWeight={600} textAlign={'center'}>
                      Hi, {user?.username || 'Người dùng'}!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {user?.email || 'example@email.com'}
                    </Typography>
                  </Stack>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="text"
                      startIcon={<Key size={18} />}
                      sx={{
                        whiteSpace: 'nowrap',
                        flex: 1,
                        color: '#2563eb', // Xanh dương primary
                        fontWeight: 500,
                        textTransform: 'none',
                        borderRadius: '0.5rem',
                        '&:hover': {
                          bgcolor: '#e0f2fe', // nền xanh nhạt khi hover
                          color: '#1e40af' // xanh đậm hơn
                        },
                        '& .MuiTouchRipple-root .MuiTouchRipple-child': {
                          backgroundColor: '#2563eb' // ripple xanh
                        }
                      }}
                      onClick={handleChangePassword}
                    >
                      <FormattedMessage id="change-password" />
                    </Button>

                    <Button
                      variant="text"
                      startIcon={loadingLogout ? <CircularProgress size={18} /> : <Logout size={18} />}
                      disabled={loadingLogout}
                      sx={{
                        flex: 1,
                        color: '#dc2626',
                        fontWeight: 500,
                        textTransform: 'none',
                        borderRadius: '0.5rem',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          bgcolor: '#fee2e2',
                          color: '#b91c1c'
                        },
                        '& .MuiTouchRipple-root .MuiTouchRipple-child': {
                          backgroundColor: '#dc2626'
                        }
                      }}
                      onClick={handleLogout}
                    >
                      {/* Nội dung chính */}
                      <span>
                        <FormattedMessage id="logout" />
                      </span>
                    </Button>
                  </div>
                </Stack>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
      <ChangePasswordDialog ref={changePasswordDialogRef} />
    </Box>
  );
};

export default ProfilePage;
