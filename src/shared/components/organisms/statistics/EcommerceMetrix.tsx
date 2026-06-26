import { Box, Grid, Stack, Typography, Chip, Skeleton } from '@mui/material';
import { ArrowUp, ArrowRight } from 'iconsax-react';
import MainCard from 'shared/components/MainCard';
import { GenericCardProps } from 'shared/types/root';

interface EcommerceMetrixProps extends GenericCardProps {
  loading?: boolean;
}

const EcommerceMetrix = ({
  primary,
  secondary,
  content,
  iconPrimary,
  color,
  revenueBefore,
  revenueAfter,
  percentage,
  isLoss,
  isShowRevenue,
  unit,
  loading = false
}: EcommerceMetrixProps) => {
  const IconPrimary = iconPrimary!;
  const primaryIcon = iconPrimary ? <IconPrimary size={52} variant="Bulk" /> : null;

  return (
    <MainCard
      content={false}
      sx={{
        bgcolor: color,
        position: 'relative',
        minHeight: 120,
        '&:before, &:after': {
          content: '""',
          width: 1,
          height: 1,
          position: 'absolute',
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.0001) 22.07%, rgba(255, 255, 255, 0.15) 83.21%)',
          transform: 'matrix(0.9, 0.44, -0.44, 0.9, 0, 0)'
        },
        '&:after': {
          top: '50%',
          right: '-20px'
        },
        '&:before': {
          right: '-70px',
          bottom: '80%'
        }
      }}
    >
      <Box
        sx={{
          px: 4.5,
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '100%'
        }}
      >
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item md={4}>
            <Box sx={{ color: 'common.white', opacity: 0.5, minHeight: 52 }}>
              {loading ? <Skeleton variant="circular" width={52} height={52} /> : primaryIcon}
            </Box>
          </Grid>
          <Grid item md={8}>
            <Stack spacing={1} alignItems="flex-end">
              <Typography variant="h5" color="common.white" sx={{ fontWeight: 500, minHeight: 28 }}>
                {loading ? <Skeleton width={100} /> : primary}
              </Typography>
              <Typography variant="h4" color="common.white" sx={{ minHeight: 40 }}>
                {loading ? <Skeleton width={80} /> : isShowRevenue ? secondary.toLocaleString('vi-VN') + unit : secondary + unit}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
        <Stack spacing={1} direction="row" justifyContent="flex-end" sx={{ pt: 1.25, minHeight: 28 }}>
          {loading ? (
            <Skeleton width={120} />
          ) : revenueBefore || content || revenueAfter ? (
            <Typography variant="h5" color="common.white" sx={{ fontWeight: 400 }}>
              {`${revenueBefore ?? ''} ${content ?? ''} ${revenueAfter ?? ''}`}
            </Typography>
          ) : null}
          {!loading && percentage && (
            <Grid item>
              <Chip
                variant="combined"
                icon={
                  <>
                    {!isLoss && <ArrowUp style={{ transform: 'rotate(45deg)' }} />}
                    {isLoss && <ArrowRight style={{ transform: 'rotate(45deg)' }} />}
                  </>
                }
                label={`${percentage}%`}
                sx={{
                  ml: 1.25,
                  pl: 1,
                  borderRadius: 1,
                  fontWeight: 500,
                  backgroundColor: isLoss ? 'rgba(255, 204, 204, 0.7)' : 'rgba(159, 226, 191)',
                  color: isLoss ? '#FF0000' : 'green'
                }}
              />
            </Grid>
          )}
        </Stack>
      </Box>
    </MainCard>
  );
};

export default EcommerceMetrix;
