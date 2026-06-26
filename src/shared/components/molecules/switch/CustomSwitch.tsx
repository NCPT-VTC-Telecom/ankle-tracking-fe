import React from 'react';
import { Box, FormControlLabel, Switch, Typography } from '@mui/material';
import { BoxOwnProps } from '@mui/system';
import { useIntl } from 'react-intl';

export interface CustomSwitchProps {
  label?: string;
  value: boolean;
  onChange: (checked: boolean) => void;
  name: string;
  disabled?: boolean;
  sx?: BoxOwnProps;
  checkedLabel?: React.ReactNode;
  uncheckedLabel?: React.ReactNode;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  label,
  value,
  onChange,
  name,
  disabled = false,
  sx,
  checkedLabel,
  uncheckedLabel
}) => {
  const intl = useIntl();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ...sx }}>
      {label && <Typography sx={{ mr: 2, fontWeight: 500, minWidth: 90 }}>{label}:</Typography>}

      <FormControlLabel
        sx={{
          marginRight: 0, // bỏ margin ngoài
          '& .MuiFormControlLabel-label': {
            marginRight: 0 // bỏ khoảng giữa control và label
          }
        }}
        control={<Switch checked={value} onChange={(e) => onChange(e.target.checked)} name={name} disabled={disabled} />}
        label={
          <div className="min-w-[50px]">
            {value
              ? checkedLabel
                ? checkedLabel
                : intl.formatMessage({ id: 'show' })
              : uncheckedLabel
                ? uncheckedLabel
                : intl.formatMessage({ id: 'hidden' })}
          </div>
        }
      />
    </Box>
  );
};

export default React.memo(CustomSwitch);
