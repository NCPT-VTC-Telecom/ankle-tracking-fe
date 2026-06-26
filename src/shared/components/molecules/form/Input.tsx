import { Grid, InputLabel, Stack, TextField, InputAdornment, IconButton } from '@mui/material';
import { AttributesPropsInputField } from 'shared/types';
import { getIn } from 'formik';
import { useState } from 'react';
import { Eye, EyeSlash } from 'iconsax-react';

const InputField = ({
  name,
  field,
  placeholder,
  type,
  formik,
  row,
  xs,
  md,
  readOnly,
  spacing,
  disable,
  inputLabel,
  required,
  unit
}: AttributesPropsInputField) => {
  const { errors, touched, getFieldProps, setFieldValue } = formik;

  const error = getIn(errors, field);
  const touch = getIn(touched, field);
  const [showPassword, setShowPassword] = useState(false);

  const handleWheel = (event: React.WheelEvent<HTMLInputElement>) => {
    event.currentTarget.blur();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (type === 'number' && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault(); // Prevent arrow key adjustments
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'number') {
      const value = parseInt(event.target.value, 10);
      if (value < 0) {
        setFieldValue(field, 0); // Force non-negative numbers
      } else {
        setFieldValue(field, value);
      }
    }
  };

  const inputProps = {
    min: 0, // No negative values
    style: {
      // Hide browser increment and decrement arrows
      WebkitAppearance: 'none', // Chrome and Safari
      MozAppearance: 'textfield', // Firefox
      appearance: 'none' // Standard CSS property to control appearance
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
      // Disable arrow key adjustments in number inputs
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
      }
    }
  };

  return (
    <Grid item xs={xs || 12} md={md || 12}>
      <Stack spacing={spacing || 1.25}>
        <InputLabel htmlFor={name}>
          {inputLabel} {required ? <span className="text-red-500 text-[16px]"> *</span> : ''}
        </InputLabel>
        <TextField
          sx={{
            lineHeight: '24px'
          }}
          fullWidth
          id={name}
          type={type === 'password' && !showPassword ? 'password' : 'text'}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onWheel={handleWheel}
          multiline={row && row >= 2 ? true : false}
          rows={row || 1}
          {...getFieldProps(field)}
          error={Boolean(touch && error)}
          helperText={touch && error ? error : ''}
          InputProps={{
            readOnly: readOnly ? true : false,
            endAdornment: (
              <>
                {type === 'password' && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                      {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                )}
                {unit && <InputAdornment position="end">{unit}</InputAdornment>}
              </>
            ),
            inputMode: 'numeric',
            inputProps: type === 'number' ? inputProps : {}
          }}
          disabled={disable ? true : false}
        />
      </Stack>
    </Grid>
  );
};

export default InputField;
