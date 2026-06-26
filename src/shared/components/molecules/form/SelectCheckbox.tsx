import {
  Checkbox,
  Grid,
  Stack,
  InputLabel,
  FormHelperText,
  Select,
  MenuItem,
  SelectChangeEvent,
  ListItemText,
  CircularProgress
} from '@mui/material';
import React from 'react';
// types
import { AttributesPropsCheckbox, OptionList } from 'shared/types';

interface SelectCheckBoxProps extends AttributesPropsCheckbox {
  arrayOption: OptionList[];
  loading?: boolean;
}

const SelectCheckBoxField: React.FC<SelectCheckBoxProps> = ({
  name,
  field,
  formik,
  arrayOption,
  xs,
  md,
  inputLabel,
  required,
  loading = false
}) => {
  const { errors, touched, setFieldValue, values } = formik;

  const handleSelectChange = (event: SelectChangeEvent<(string | number)[]>) => {
    const selectedValues = event.target.value as (string | number)[];
    setFieldValue(field, selectedValues);
  };

  return (
    <Grid item xs={xs || 12} md={md || 12}>
      <Stack spacing={1.25}>
        <InputLabel htmlFor={name}>
          {inputLabel}
          {required ? <span className="text-red-500 text-[16px]"> *</span> : ''}
        </InputLabel>
        <Select
          multiple
          value={(values[field] || []).filter((val: string | number) => arrayOption.some((opt) => opt.value === val))}
          onChange={handleSelectChange}
          renderValue={(selected) => {
            const selectedOptions = (selected as (string | number)[]).map((selectedValue) => {
              const option = arrayOption.find((opt) => opt.value === selectedValue);
              return option ? option.label : selectedValue;
            });

            // Nếu label là ReactNode thì render trực tiếp
            return (
              <Stack direction="row" gap={1} flexWrap="nowrap" sx={{ overflow: 'hidden' }}>
                {selectedOptions.map((label, idx) => (
                  <span key={idx} className="flex items-center">
                    {label} {idx < selectedOptions.length - 1 && ', '}
                  </span>
                ))}
              </Stack>
            );
          }}
          fullWidth
          displayEmpty
          disabled={loading}
          endAdornment={loading ? <CircularProgress size={20} sx={{ mr: 2 }} /> : undefined}
        >
          {arrayOption.map((option) => (
            <MenuItem key={option.value.toString()} value={option.value}>
              <Checkbox checked={(values[field] || []).includes(option.value)} />
              <ListItemText primary={option.label} secondary={option.secondaryLabel} />
            </MenuItem>
          ))}
        </Select>
        {touched[field] && errors[field] && (
          <FormHelperText error id="select-checkbox-error-text" sx={{ pl: 1.75 }}>
            {errors[field]}
          </FormHelperText>
        )}
      </Stack>
    </Grid>
  );
};

export default SelectCheckBoxField;
