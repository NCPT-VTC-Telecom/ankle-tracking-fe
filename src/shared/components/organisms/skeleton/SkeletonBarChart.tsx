import { Skeleton, Box } from '@mui/material';

const BarChartSkeleton = () => (
  <Box width="100%" p={2} bgcolor="#fff">
    {Array.from(new Array(8)).map((_, index) => (
      <Skeleton
        key={index}
        variant="rectangular"
        width={`${Math.random() * 100 + 30}%`} // Random width for each bar
        height={20}
        sx={{ mb: 1, bgcolor: 'grey.200' }}
        animation="wave"
      />
    ))}
  </Box>
);

export default BarChartSkeleton;
