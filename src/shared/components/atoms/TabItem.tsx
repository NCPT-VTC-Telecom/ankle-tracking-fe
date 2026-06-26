import React from 'react';
import { Tab } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface TabItemProps {
  label: string;
  to: string;
  icon?: React.ReactElement;
  iconPosition?: 'top' | 'start' | 'bottom' | 'end';
}

const TabItem: React.FC<TabItemProps> = ({ label, to, icon, iconPosition = 'start' }) => (
  <Tab label={label} component={RouterLink} to={to} icon={icon} iconPosition={iconPosition} />
);

export default TabItem;
