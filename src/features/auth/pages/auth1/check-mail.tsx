import { Link as RouterLink, useParams } from 'react-router-dom';

// material-ui
import { Box, Button, Link, Stack, Typography } from '@mui/material';

// project-imports
import useAuth from 'shared/hooks/useAuth';
import { FormattedMessage } from 'react-intl';
import AuthWrapper from 'features/auth/sections/AuthWrapper';

// ================================|| CHECK MAIL ||================================ //

const CheckMail = () => {
  const { isLoggedIn } = useAuth();
  const { email } = useParams();

  return (
    <AuthWrapper>
      {/* <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">
              <FormattedMessage id="check-mail" />
            </Typography>
            <Typography color="secondary" sx={{ mb: 0.5, mt: 1.25 }}>
              <FormattedMessage id="we-have-sent-a-password-recover-instructions-to-your-mail" />
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <AnimateButton>
            <Button
              component={Link}
              to={isLoggedIn ? `/auth/forgot-password/${email}` : `/forgot-password/${email}`}
              disableElevation
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              color="primary"
            >
              <FormattedMessage id="reset-password" />
            </Button>
          </AnimateButton>
        </Grid>
      </Grid> */}
      <Stack spacing={3}>
        <Box sx={{ mb: 7, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700
            }}
          >
            <FormattedMessage id="check-email" defaultMessage={'Check email'} />
          </Typography>
          <Typography
            sx={{
              fontWeight: 400,
              mt: 3
            }}
          >
            <FormattedMessage id="password-reset-sent" />
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'end', marginTop: '0px' }}>
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
        <Button
          component={RouterLink}
          to={isLoggedIn ? `/auth/forgot-password/${email}` : `/forgot-password/${email}`}
          disableElevation
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          sx={{
            borderRadius: 3,
            py: 1.5
          }}
        >
          <FormattedMessage id="reset-password" />
        </Button>
      </Stack>
    </AuthWrapper>
  );
};

export default CheckMail;
