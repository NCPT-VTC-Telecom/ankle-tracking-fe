import { Checkbox, Grid, Stack, InputLabel, FormHelperText, Select, MenuItem, SelectChangeEvent, ListItemText } from '@mui/material';
import React from 'react';
// types
import { AttributesPropsCheckbox, OptionList } from 'shared/types';

interface SelectCheckBoxProps extends AttributesPropsCheckbox {
  arrayOption: OptionList[];
}

const SelectCheckBoxField: React.FC<SelectCheckBoxProps> = ({ name, field, formik, arrayOption, xs, md, inputLabel, required }) => {
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
          value={values[field] || []}
          onChange={handleSelectChange}
          renderValue={(selected) => {
            const selectedLabels = (selected as (string | number)[]).map((selectedValue) => {
              const option = arrayOption.find((opt) => opt.value === selectedValue);
              return option ? option.label : selectedValue;
            });
            return selectedLabels.join(', ');
          }}
          fullWidth
        >
          {arrayOption.map((option) => (
            <MenuItem key={option.value.toString()} value={option.value}>
              <Checkbox checked={(values[field] || []).includes(option.value)} />
              <ListItemText primary={option.label} />
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
