import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { StatusListProps } from 'shared/types';

const StatusList: React.FC<StatusListProps> = ({ items }) => (
  <Grid container>
    {items.map(({ label, value }, index) => (
      <Grid key={index} item xs={12} textAlign={'left'}>
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {value}
          </Typography>
        </Box>
      </Grid>
    ))}
  </Grid>
);

export default StatusList;
