import { Checkbox, FormControlLabel, Grid, Stack, InputLabel, FormHelperText } from '@mui/material';
//types
import { AttributesPropsCheckbox } from 'shared/types';

const CheckBoxField: React.FC<AttributesPropsCheckbox> = ({
  name,
  field,
  formik,
  arrayOption,
  xs,
  xsCheckBox,
  mdCheckBox,
  md,
  inputLabel,
  required
}) => {
  const { errors, touched, setFieldValue, values } = formik;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean, value: string) => {
    const currentValues = values[field] || [];
    if (checked) {
      const updatedValues = [...currentValues, value];
      setFieldValue(field, updatedValues);
    } else {
      const updatedValues = currentValues.filter((item: string) => item !== value);
      setFieldValue(field, updatedValues);
    }
  };

  return (
    <Grid item xs={xs || 12} md={md || 12}>
      <Stack spacing={1.25}>
        <InputLabel htmlFor={name}>
          {inputLabel}
          {required ? <span className="text-red-500 text-[16px]"> *</span> : ''}
        </InputLabel>
        <Grid container spacing={1.25}>
          {arrayOption.map((option, index) => (
            <Grid key={index} item xs={xsCheckBox || 6} md={mdCheckBox || 4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values[field]?.includes(option.value)}
                    onChange={(event) => handleChange(event, event.target.checked, option.value)}
                    value={option.value}
                  />
                }
                label={option.label}
              />
            </Grid>
          ))}
        </Grid>
        {touched[field] && errors[field] && (
          <FormHelperText error id="standard-weight-helper-text-email-login" sx={{ pl: 1.75 }}>
            {errors[field]}
          </FormHelperText>
        )}
      </Stack>
    </Grid>
  );
};

export default CheckBoxField;
