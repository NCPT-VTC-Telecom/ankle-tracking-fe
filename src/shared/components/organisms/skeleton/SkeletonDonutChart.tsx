import { Box, CircularProgress } from '@mui/material';

const DonutChartSkeleton = () => (
  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
    <CircularProgress variant="determinate" color="secondary" value={70} thickness={5} size={200} />
  </Box>
);

export default DonutChartSkeleton;
