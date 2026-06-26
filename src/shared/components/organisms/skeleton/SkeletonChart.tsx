import { Skeleton, Box } from '@mui/material';

const ChartSkeleton = () => (
  <Box display="flex" alignItems="flex-end" height={200} p={1} bgcolor="#fff">
    {Array.from(new Array(7)).map((_, index) => (
      <Skeleton
        key={index}
        variant="rectangular"
        width="20%"
        sx={{ mx: 0.5, bgcolor: 'grey.200' }}
        animation="wave"
        height={Math.random() * 100 + 50} // Random height for each bar
      />
    ))}
  </Box>
);

export default ChartSkeleton;
