// material-ui
import { Box, Typography } from '@mui/material';

const NameApp = () => (
  <Box>
    <Typography sx={{ color: 'text.primary' }} className="text-xl md:text-3xl select-none font-bold line-clamp-1">
      Ankle Tracker
    </Typography>
  </Box>
);

export default NameApp;
