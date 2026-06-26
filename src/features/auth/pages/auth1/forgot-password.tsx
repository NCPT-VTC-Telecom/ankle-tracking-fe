// material-ui

// project-imports
import AuthWrapper from 'features/auth/sections/AuthWrapper';
import AuthForgotPassword from 'features/auth/sections/auth-forms/AuthForgotPassword';

// ================================|| FORGOT PASSWORD ||================================ //

const ForgotPassword = () => {
  return (
    <AuthWrapper>
      {/* <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">
              <FormattedMessage id="forgot-password" />
            </Typography>

            <Typography
              component={Link}
              to={isLoggedIn ? '/auth/login' : '/login'}
              variant="body1"
              sx={{ textDecoration: 'none' }}
              color="primary"
            >
              <FormattedMessage id="back-to-login" />
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <AuthForgotPassword />
        </Grid>
      </Grid> */}
      <AuthForgotPassword />
    </AuthWrapper>
  );
};

export default ForgotPassword;
