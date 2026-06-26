// material-ui
import { Box, Skeleton, Stack, Typography, alpha, useTheme } from '@mui/material';
import MainCard from 'shared/components/MainCard';

// project-imports

// assets
import { ArrowDown, ArrowUp } from 'iconsax-react';

// ==============================|| STATISTICS - ECOMMERCE CARD (WHITE) ||============================== //

interface Props {
  title: string;
  count: string | number;
  percentage?: number | string;
  isLoss?: boolean;
  availableLabel?: string;
  availableCount?: number | string;
  extraLabel?: string;
  extraCount?: number | string;
  loading?: boolean;
}

const AnalyticECommerceSkeleton = ({ percentage, availableLabel, extraLabel }: Props) => {
  const theme = useTheme();

  return (
    <MainCard
      sx={{
        height: '100%'
      }}
    >
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Skeleton variant="text" width="40%" height={22} />
          {percentage !== undefined && percentage !== null && <Skeleton variant="rounded" width={60} height={24} />}
        </Stack>

        {/* Main Count */}
        <Skeleton variant="text" width="60%" height={48} />

        {/* Bottom Stats */}
        {(availableLabel || extraLabel) && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: extraLabel ? '1fr 1fr' : '1fr',
              gap: 2,
              pt: 2,
              borderTop: `1px solid ${alpha(theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.divider, 0.4)}`
            }}
          >
            {availableLabel && (
              <Stack spacing={0.5}>
                <Skeleton variant="text" width="50%" height={18} />
                <Skeleton variant="text" width="60%" height={24} />
              </Stack>
            )}

            {extraLabel && (
              <Stack spacing={0.5}>
                <Skeleton variant="text" width="50%" height={18} />
                <Skeleton variant="text" width="60%" height={24} />
              </Stack>
            )}
          </Box>
        )}
      </Stack>
    </MainCard>
  );
};

const AnalyticECommerce = ({
  title,
  count,
  percentage,
  isLoss,
  extraCount,
  availableCount,
  extraLabel,
  availableLabel,
  loading
}: Props) => {
  const theme = useTheme();

  if (loading) {
    return (
      <AnalyticECommerceSkeleton percentage={percentage} availableLabel={availableLabel} extraLabel={extraLabel} title={''} count={''} />
    );
  }

  return (
    <MainCard
      content={false}
      sx={{
        height: '100%',
        transition: 'transform 0.25s ease',
        '&:hover': {
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Stack spacing={3} sx={{ p: 3 }}>
        {/* Header */}
        <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.8
            }}
          >
            {title}
          </Typography>

          {percentage !== undefined && percentage !== null && percentage !== 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.75,
                py: 0.5,
                borderRadius: 2,
                bgcolor: alpha(isLoss ? theme.palette.error.main : theme.palette.success.main, 0.1)
              }}
            >
              {isLoss ? <ArrowDown size={14} color={theme.palette.error.main} /> : <ArrowUp size={14} color={theme.palette.success.main} />}
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{
                  color: isLoss ? theme.palette.error.main : theme.palette.success.main
                }}
              >
                {percentage}%
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Main Count */}
        <Typography
          variant="h2"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 700,
            fontSize: '2.5rem',
            lineHeight: 1.2
          }}
        >
          {count}
        </Typography>

        {/* Bottom Stats */}
        {(availableLabel || extraLabel) && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: extraLabel ? '1fr 1fr' : '1fr',
              gap: 2,
              pt: 2,
              borderTop: `1px solid ${alpha(theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.divider, 0.4)}`
            }}
          >
            {availableLabel && (
              <Stack spacing={0.5}>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}
                >
                  {availableLabel}
                </Typography>
                <Typography variant="h5" fontWeight={600} color="text.primary">
                  {availableCount}
                </Typography>
              </Stack>
            )}

            {extraLabel && (
              <Stack spacing={0.5}>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}
                >
                  {extraLabel}
                </Typography>
                <Typography variant="h5" fontWeight={600} color="text.primary">
                  {extraCount}
                </Typography>
              </Stack>
            )}
          </Box>
        )}
      </Stack>
    </MainCard>
  );
};

export default AnalyticECommerce;
