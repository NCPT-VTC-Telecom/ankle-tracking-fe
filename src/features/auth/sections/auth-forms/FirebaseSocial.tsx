import { useState, useEffect } from 'react';
import axios from 'axios';
// material-ui
import { useTheme } from '@mui/material/styles';
import { useMediaQuery, Button, Stack } from '@mui/material';

// project-imports
import useAuth from 'shared/hooks/useAuth';

//redux
import { dispatch } from 'shared/store';
import { handlerIconVariants } from 'shared/store/reducers/snackbar';

//Third Party
import { useGoogleLogin } from '@react-oauth/google';
import { enqueueSnackbar } from 'notistack';

// assets
import Google from 'assets/images/icons/google.svg';
import Facebook from 'assets/images/icons/facebook.svg';
import { useIntl } from 'react-intl';

// ==============================|| FIREBASE - SOCIAL BUTTON ||============================== //

const FirebaseSocial = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const [user, setUser] = useState<any>([]);
  const [profile, setProfile] = useState([]);
  const intl = useIntl();
  // @ts-ignore
  const { firebaseFacebookSignIn, loginByGoogle } = useAuth();

  const googleHandler = useGoogleLogin({
    onSuccess: (userInfo) => setUser(userInfo),
    onError: (error) => {
      dispatch(
        handlerIconVariants({
          iconVariant: 'useemojis'
        })
      );
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    }
  });

  useEffect(() => {
    if (user) {
      axios
        .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            Accept: 'application/json'
          }
        })
        .then((res) => {
          setProfile(res.data);
        })
        .catch((err) => {
          dispatch(
            handlerIconVariants({
              iconVariant: 'useemojis'
            })
          );
          enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
            variant: 'error'
          });
        });
    }
    //eslint-disable-next-line
  }, [user]);

  loginByGoogle(profile);

  // const googleHandler = async () => {
  //   try {
  //     await firebaseGoogleSignIn();
  //   } catch (err) {
  //   }
  // };

  const facebookHandler = async () => {
    try {
      await firebaseFacebookSignIn();
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
  };

  return (
    <Stack
      direction="row"
      spacing={matchDownSM ? 1 : 2}
      justifyContent={matchDownSM ? 'space-around' : 'space-between'}
      sx={{ '& .MuiButton-startIcon': { mr: matchDownSM ? 0 : 1, ml: matchDownSM ? 0 : -0.5 } }}
    >
      <Button
        variant="outlined"
        color="secondary"
        fullWidth={!matchDownSM}
        startIcon={<img src={Google} alt="Google" />}
        onClick={() => googleHandler}
      >
        {!matchDownSM && 'Google'}
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        fullWidth={!matchDownSM}
        startIcon={<img src={Facebook} alt="Facebook" />}
        onClick={facebookHandler}
      >
        {!matchDownSM && 'Facebook'}
      </Button>
    </Stack>
  );
};

export default FirebaseSocial;
