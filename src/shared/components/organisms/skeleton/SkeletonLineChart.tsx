import { Box, Skeleton } from '@mui/material';

const LineChartSkeleton = () => (
  <Box sx={{ width: '100%', height: 200, overflow: 'hidden', position: 'relative' }}>
    <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" sx={{ transform: 'scale(1, 0.1)' }} />
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center'
      }}
    >
      {Array.from(new Array(8)).map((_, index) => (
        <Skeleton key={index} variant="circular" width={20} height={20} />
      ))}
    </Box>
  </Box>
);

export default LineChartSkeleton;
