import React from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { Link, Outlet } from 'react-router-dom';

interface TabConfig {
  label: string;
  to: string;
  icon?: React.ReactElement;
}

interface TabbedCardProps {
  value?: number;
  handleChange?: (event: React.SyntheticEvent, newValue: number) => void;
  tabs: TabConfig[];
  sx?: any;
}

const TabbedCard: React.FC<TabbedCardProps> = ({ value, handleChange, tabs, sx }) => (
  <>
    <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%', ...sx }}>
      <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto">
        {tabs.map((tab, index) => (
          <Tab key={index} label={tab.label} icon={tab.icon} iconPosition="start" component={Link} to={tab.to} />
        ))}
      </Tabs>
    </Box>
    <Box sx={{ mt: 2.5 }}>
      <Outlet />
    </Box>
  </>
);

export default TabbedCard;
