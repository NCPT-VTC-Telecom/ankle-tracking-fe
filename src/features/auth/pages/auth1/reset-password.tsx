// material-ui
import { Grid, Stack, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';

// project-imports
import AuthWrapper from 'features/auth/sections/AuthWrapper';
import AuthResetPassword from 'features/auth/sections/auth-forms/AuthResetPassword';

// ================================|| RESET PASSWORD ||================================ //

const ResetPassword = () => (
  <AuthWrapper>
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Stack sx={{ mb: { xs: -0.5, sm: 0.5 } }} spacing={1}>
          <Typography variant="h3">
            <FormattedMessage id="reset-password" />
          </Typography>
          <Typography color="secondary">
            <FormattedMessage id="please-choose-new-password" />
          </Typography>
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <AuthResetPassword />
      </Grid>
    </Grid>
  </AuthWrapper>
);

export default ResetPassword;
