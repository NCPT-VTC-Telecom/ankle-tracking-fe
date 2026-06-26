import { Box } from '@mui/material';
import { MainCardProps } from 'shared/components/MainCard';

const AuthCard = ({ children, ...other }: MainCardProps) => (
  <Box
    sx={{
      width: '100%',
      maxWidth: { md: 550 },
      borderRadius: 3,
      p: { xs: 3, md: 4 }
    }}
  >
    {children}
  </Box>
);

export default AuthCard;
