import { FormControl, Grid, InputLabel, TextField, Typography, Stack } from '@mui/material';
import { Autocomplete } from '@mui/material';
import { OptionList } from 'shared/types';
import { AttributesPropsSelectField } from 'shared/types';

const AutocompleteInputField = ({
  name,
  field,
  placeholder,
  formik,
  arrayOption,
  xs,
  md,
  sm,
  spacing,
  inputLabel,
  noOptionText,
  required
}: AttributesPropsSelectField) => {
  const { errors, touched, setFieldValue, values } = formik;

  const defaultValue = arrayOption.length > 0 && typeof arrayOption[0].value === 'number' ? 0 : '';

  const optionsWithDefault = [{ value: defaultValue, label: placeholder }, ...arrayOption];

  const isDisabledOption = (option: OptionList) => (option.value === 0 || option.value === '') && option.label === placeholder;

  return (
    <Grid item xs={xs || 12} sm={sm} md={md || 12}>
      <Stack spacing={spacing || 1.25}>
        <InputLabel htmlFor={name}>
          {inputLabel} {required ? <span className="text-red-500 text-[16px]"> *</span> : ''}
        </InputLabel>
        <FormControl fullWidth>
          <Autocomplete
            id={name}
            options={optionsWithDefault}
            getOptionLabel={(option) => (option.label as string) || ' '}
            value={optionsWithDefault.find((option) => option.value === values[field]) || null}
            getOptionDisabled={(option) => option.value === 0 && option.label === placeholder} // Disable lựa chọn mặc định
            noOptionsText={noOptionText}
            onChange={(event, newValue) => {
              setFieldValue(field, newValue ? newValue.value : '');
            }}
            renderInput={(params) => (
              <TextField
                sx={{
                  lineHeight: '24px',
                  '& .MuiInputBase-root': {
                    height: '49px' // Increase the height of the input
                  },
                  '& .MuiOutlinedInput-input': {
                    // padding: '8px 10px' // Increase padding for larger touch area
                  }
                }}
                {...params}
                error={Boolean(touched[field] && errors[field])}
                helperText={touched[field] && errors[field] ? errors[field] : ''}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} style={isDisabledOption(option) ? { color: 'gray' } : {}}>
                <Typography variant="body2">{option.label}</Typography>
                {option.subPrimaryLabel && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {option.subPrimaryLabel}
                  </Typography>
                )}
                {option.secondaryLabel && (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {option.secondaryLabel}
                  </Typography>
                )}
              </li>
            )}
          />
        </FormControl>
        {/* {touched[field] && errors[field] && <FormHelperText error>{errors[field]}</FormHelperText>} */}
      </Stack>
    </Grid>
  );
};

export default AutocompleteInputField;
