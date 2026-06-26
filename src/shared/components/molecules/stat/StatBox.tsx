import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

import { StatBoxProps } from 'shared/types';

const StatBox: React.FC<StatBoxProps> = ({ icon: Icon, mainText, subText, children }) => (
  <Box textAlign="center">
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center'
      }}
    >
      <Icon size={60} />
      <Box>
        <Typography variant="h6">{mainText}</Typography>
        <Typography variant="subtitle1">{subText}</Typography>
      </Box>
    </Box>
    <Divider className="my-2" />
    {children}
  </Box>
);

export default StatBox;
