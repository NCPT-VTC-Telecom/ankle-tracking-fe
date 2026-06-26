import { Grid, InputLabel, Stack, InputAdornment } from '@mui/material';
import { NumericFormat } from 'react-number-format';
import { TextField } from '@mui/material';
import { AttributesPropsInputField } from 'shared/types';
import { getIn } from 'formik';

const NumberInputField = ({
  name,
  field,
  placeholder,
  formik,
  xs,
  md,
  readOnly,
  spacing,
  disable,
  inputLabel,
  required,
  unit
}: AttributesPropsInputField) => {
  const { errors, touched, setFieldValue, values } = formik;

  const error = getIn(errors, field);
  const touch = getIn(touched, field);

  return (
    <Grid item xs={xs || 12} md={md || 12}>
      <Stack spacing={spacing || 1.25}>
        <InputLabel htmlFor={name}>
          {inputLabel} {required ? <span className="text-red-500 text-[16px]"> *</span> : ''}
        </InputLabel>

        <NumericFormat
          customInput={TextField}
          fullWidth
          id={name}
          name={name}
          placeholder={placeholder}
          value={values[field] ?? ''}
          thousandSeparator=","
          allowNegative={false}
          onValueChange={(val) => {
            setFieldValue(field, val.floatValue ?? '');
          }}
          error={Boolean(touch && error)}
          helperText={touch && error ? error : ''}
          disabled={disable}
          InputProps={{
            readOnly: readOnly ? true : false,
            endAdornment: unit ? <InputAdornment position="end">{unit}</InputAdornment> : null,
            inputMode: 'numeric'
          }}
        />
      </Stack>
    </Grid>
  );
};

export default NumberInputField;
