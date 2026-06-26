import React, { SyntheticEvent } from 'react';
import { Tabs, Box } from '@mui/material';

interface TabNavigationProps {
  value: number;
  onChange: (event: SyntheticEvent, newValue: number) => void;
  children: React.ReactNode;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ value, onChange, children }) => (
  <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
    <Tabs value={value} onChange={onChange} variant="scrollable" scrollButtons="auto" aria-label="profile tabs">
      {children}
    </Tabs>
  </Box>
);

export default TabNavigation;
